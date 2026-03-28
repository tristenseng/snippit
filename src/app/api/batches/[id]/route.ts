import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const updateBatchSchema = z.object({
  status: z.enum(["COMPLETED"]).optional(),
  endDate: z.string().datetime().optional(),
})

async function getLocationId(userId: string): Promise<string | null> {
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
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      batchStrains: { include: { strain: true } },
      days: { orderBy: { batchDay: "asc" } },
    },
  })

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  // Location scope check (admin can access any)
  if (activeRole !== "ADMIN") {
    const locationId = await getLocationId(session.user.id)
    if (batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  return NextResponse.json(batch)
}

export async function DELETE(
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
  const batch = await prisma.batch.findUnique({
    where: { id },
    select: { id: true, locationId: true },
  })
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  if (activeRole !== "ADMIN") {
    const locationId = await getLocationId(session.user.id)
    if (batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  const entryCount = await prisma.employeeDay.count({
    where: { day: { batchId: id } },
  })
  if (entryCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete a batch that has weight entries" },
      { status: 409 }
    )
  }

  await prisma.batch.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}

export async function PATCH(
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

  const body = await request.json().catch(() => null)
  const parsed = updateBatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id } = await params
  const batch = await prisma.batch.findUnique({ where: { id } })
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  if (activeRole !== "ADMIN") {
    const locationId = await getLocationId(session.user.id)
    if (batch.locationId !== locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  const updateData: Record<string, unknown> = {}
  if (parsed.data.status === "COMPLETED") {
    updateData.status = "COMPLETED"
    updateData.completedAt = new Date()
  }
  if (parsed.data.endDate) {
    updateData.endDate = new Date(parsed.data.endDate)
  }

  const updated = await prisma.batch.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(updated)
}
