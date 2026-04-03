import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const createEntrySchema = z.object({
  employeeId: z.string(),
  amount: z.number().positive().max(9999.9),
  hours: z.number().positive().max(999.9).optional(),
})

async function getManagerLocation(userId: string): Promise<string | null> {
  const manager = await prisma.user.findUnique({
    where: { id: userId },
    select: { locationId: true },
  })
  return manager?.locationId ?? null
}

async function verifyDayBelongsToBatch(
  dayId: string,
  batchId: string,
  userId: string,
  activeRole: string
): Promise<{ ok: boolean; locationId?: string }> {
  const day = await prisma.day.findUnique({
    where: { id: dayId },
    select: { batchId: true },
  })
  if (!day || day.batchId !== batchId) {
    return { ok: false }
  }

  if (activeRole !== "ADMIN") {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } })
    const locationId = await getManagerLocation(userId)
    if (!batch || batch.locationId !== locationId) {
      return { ok: false }
    }
  }

  return { ok: true }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; dayId: string }> }
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

  const { id, dayId } = await params
  const dayCheck = await verifyDayBelongsToBatch(dayId, id, session.user.id, activeRole)
  if (!dayCheck.ok) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 })
  }

  const entries = await prisma.employeeDay.findMany({
    where: { dayId },
    include: {
      employee: { select: { id: true, name: true } },
    },
    orderBy: { employee: { name: "asc" } },
  })

  return NextResponse.json(entries)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; dayId: string }> }
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

  const body = await request.json().catch(() => null)
  const parsed = createEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { employeeId, amount, hours } = parsed.data

  const { id, dayId } = await params
  const dayCheck = await verifyDayBelongsToBatch(dayId, id, session.user.id, activeRole)
  if (!dayCheck.ok) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 })
  }

  const entry = await prisma.employeeDay.create({
    data: {
      employeeId,
      dayId,
      amount,
      hours,
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
