import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma, withUser } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const createBatchSchema = z.object({
  strainIds: z.array(z.string()).min(1, "At least one strain required"),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageBatches) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const manager = await withUser(session.user.id, (tx) =>
    tx.user.findUnique({ where: { id: session.user.id }, select: { locationId: true } })
  )

  const where = activeRole === "ADMIN" ? {} : { locationId: manager?.locationId ?? undefined }

  const batches = await prisma.batch.findMany({
    where,
    include: {
      batchStrains: { include: { strain: true } },
      days: { select: { id: true, batchDay: true, isSubmitted: true } },
    },
    orderBy: { number: "desc" },
  })

  return NextResponse.json(batches)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageBatches) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = createBatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { strainIds } = parsed.data

  const manager = await withUser(session.user.id, (tx) =>
    tx.user.findUnique({
      where: { id: session.user.id },
      select: {
        locationId: true,
        userLocations: { select: { locationId: true }, take: 1 },
      },
    })
  )

  const locationId = manager?.locationId ?? manager?.userLocations?.[0]?.locationId ?? null

  if (!locationId) {
    return NextResponse.json({ error: "Manager has no assigned location" }, { status: 422 })
  }

  // Enforce one ACTIVE batch per location
  const activeBatch = await prisma.batch.findFirst({
    where: { locationId, status: "ACTIVE" },
  })
  if (activeBatch) {
    return NextResponse.json(
      { error: "An active batch already exists at this location" },
      { status: 409 }
    )
  }

  // Auto-increment batch number per location
  const lastBatch = await prisma.batch.findFirst({
    where: { locationId },
    orderBy: { number: "desc" },
    select: { number: true },
  })
  const nextNumber = (lastBatch?.number ?? 0) + 1

  const batch = await prisma.batch.create({
    data: {
      locationId,
      number: nextNumber,
      status: "INACTIVE",
      batchStrains: {
        create: strainIds.map((strainId) => ({ strainId })),
      },
    },
    include: {
      batchStrains: { include: { strain: true } },
    },
  })

  return NextResponse.json(batch, { status: 201 })
}
