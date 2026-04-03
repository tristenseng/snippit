import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const updateDaySchema = z.object({
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
  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      employeeDays: {
        include: {
          employee: { select: { id: true, name: true } },
          batchStrain: { include: { strain: true } },
        },
      },
    },
  })

  if (!day || day.batchId !== id) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 })
  }

  if (activeRole !== "ADMIN") {
    const batch = await prisma.batch.findUnique({ where: { id } })
    const locationId = await getManagerLocation(session.user.id)
    if (!batch || batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  return NextResponse.json(day)
}

export async function PATCH(
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

  const { id, dayId } = await params
  const day = await prisma.day.findUnique({ where: { id: dayId } })
  if (!day || day.batchId !== id) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 })
  }

  if (activeRole !== "ADMIN") {
    const batch = await prisma.batch.findUnique({ where: { id } })
    const locationId = await getManagerLocation(session.user.id)
    if (!batch || batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  const body = await request.json().catch(() => ({}))
  const parsed = updateDaySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await prisma.day.update({
    where: { id: dayId },
    data: { notes: parsed.data.notes },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
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
  const day = await prisma.day.findUnique({ where: { id: dayId } })
  if (!day || day.batchId !== id) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 })
  }

  if (day.isSubmitted) {
    return NextResponse.json({ error: "Cannot delete a submitted day" }, { status: 409 })
  }

  if (activeRole !== "ADMIN") {
    const batch = await prisma.batch.findUnique({ where: { id } })
    const locationId = await getManagerLocation(session.user.id)
    if (!batch || batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  await prisma.day.delete({ where: { id: dayId } })
  return new NextResponse(null, { status: 204 })
}
