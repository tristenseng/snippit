import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const createDaySchema = z.object({
  batchStrainId: z.string(),
  batchDay: z.number().int().min(1).optional(),
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
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params
  const batch = await prisma.batch.findUnique({ where: { id } })
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
    where: { batchId: id },
    orderBy: [
      { batchStrain: { strain: { name: "asc" } } },
      { batchDay: "asc" },
    ],
    include: {
      _count: { select: { employeeDays: true } },
      batchStrain: { include: { strain: { select: { id: true, name: true } } } },
    },
  })

  return NextResponse.json(days)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params
  const batch = await prisma.batch.findUnique({ where: { id } })
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

  const body = await request.json().catch(() => ({}))
  const parsed = createDaySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { batchStrainId, batchDay: requestedBatchDay, notes } = parsed.data

  // Validate batchStrainId belongs to this batch
  const batchStrain = await prisma.batchStrain.findFirst({
    where: { id: batchStrainId, batchId: id },
  })
  if (!batchStrain) {
    return NextResponse.json(
      { error: "Strain does not belong to this batch" },
      { status: 400 }
    )
  }

  // Auto-increment batchDay per (batch, strain) — used as fallback when batchDay not provided
  const lastDay = await prisma.day.findFirst({
    where: { batchId: id, batchStrainId },
    orderBy: { batchDay: "desc" },
    select: { batchDay: true },
  })
  const nextDay = (lastDay?.batchDay ?? 0) + 1

  const requestedDay = requestedBatchDay ?? nextDay

  // Conflict check: reject duplicate (batchId, batchStrainId, batchDay)
  const conflict = await prisma.day.findFirst({
    where: { batchId: id, batchStrainId, batchDay: requestedDay },
  })
  if (conflict) {
    return NextResponse.json(
      { error: `Day ${requestedDay} already exists for this strain in this batch.` },
      { status: 409 }
    )
  }

  const day = await prisma.day.create({
    data: {
      batchId: id,
      batchStrainId,
      batchDay: requestedDay,
      notes,
    },
  })

  return NextResponse.json(day, { status: 201 })
}
