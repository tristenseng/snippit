import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const createDaySchema = z.object({
  notes: z.string().max(500).optional(),
})

async function getManagerLocation(userId: string): Promise<string | null> {
  const manager = await prisma.user.findUnique({
    where: { id: userId },
    select: { locationId: true },
  })
  return manager?.locationId ?? null
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageBatches) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const batch = await prisma.batch.findUnique({ where: { id: params.id } })
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  if (activeRole !== "ADMIN") {
    const locationId = await getManagerLocation(session.user.id)
    if (batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  const days = await prisma.day.findMany({
    where: { batchId: params.id },
    orderBy: { batchDay: "asc" },
    include: {
      _count: { select: { employeeDays: true } },
    },
  })

  return NextResponse.json(days)
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageBatches) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const batch = await prisma.batch.findUnique({ where: { id: params.id } })
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  if (activeRole !== "ADMIN") {
    const locationId = await getManagerLocation(session.user.id)
    if (batch.locationId !== locationId) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }
  }

  if (batch.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Batch must be active to add days" },
      { status: 400 }
    )
  }

  // Auto-increment batchDay within this batch
  const lastDay = await prisma.day.findFirst({
    where: { batchId: params.id },
    orderBy: { batchDay: "desc" },
    select: { batchDay: true },
  })
  const nextDay = (lastDay?.batchDay ?? 0) + 1

  const body = await request.json().catch(() => ({}))
  const parsed = createDaySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const day = await prisma.day.create({
    data: {
      batchId: params.id,
      batchDay: nextDay,
      notes: parsed.data.notes,
    },
  })

  return NextResponse.json(day, { status: 201 })
}
