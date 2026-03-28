import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const updateEntrySchema = z.object({
  amount: z.number().positive().max(9999.9).optional(),
  hours: z.number().positive().max(999.9).nullable().optional(),
})

async function getManagerLocation(userId: string): Promise<string | null> {
  const manager = await prisma.user.findUnique({
    where: { id: userId },
    select: { locationId: true },
  })
  return manager?.locationId ?? null
}

async function verifyEntryOwnership(
  entryId: string,
  dayId: string,
  batchId: string,
  userId: string,
  activeRole: string
): Promise<boolean> {
  const entry = await prisma.employeeDay.findUnique({
    where: { id: entryId },
    select: { dayId: true },
  })
  if (!entry || entry.dayId !== dayId) {
    return false
  }

  const day = await prisma.day.findUnique({
    where: { id: dayId },
    select: { batchId: true },
  })
  if (!day || day.batchId !== batchId) {
    return false
  }

  if (activeRole !== "ADMIN") {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } })
    const locationId = await getManagerLocation(userId)
    if (!batch || batch.locationId !== locationId) {
      return false
    }
  }

  return true
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; dayId: string; entryId: string }> }
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
  const parsed = updateEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id, dayId, entryId } = await params
  const owned = await verifyEntryOwnership(
    entryId,
    dayId,
    id,
    session.user.id,
    activeRole
  )
  if (!owned) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  }

  const updated = await prisma.employeeDay.update({
    where: { id: entryId },
    data: {
      ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
      ...(parsed.data.hours !== undefined && { hours: parsed.data.hours }),
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; dayId: string; entryId: string }> }
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

  const { id, dayId, entryId } = await params
  const owned = await verifyEntryOwnership(
    entryId,
    dayId,
    id,
    session.user.id,
    activeRole
  )
  if (!owned) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  }

  await prisma.employeeDay.delete({ where: { id: entryId } })

  return NextResponse.json({ success: true })
}
