import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

export async function POST(
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

  const manager = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { locationId: true },
  })

  const batch = await prisma.batch.findUnique({ where: { id: params.id } })
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  // Location scope check (admin can access any)
  if (activeRole !== "ADMIN" && batch.locationId !== manager?.locationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Batch must be INACTIVE to activate
  if (batch.status !== "INACTIVE") {
    return NextResponse.json(
      { error: "Batch is already active or completed" },
      { status: 409 }
    )
  }

  // Ensure no other ACTIVE batch at this location
  const activeBatch = await prisma.batch.findFirst({
    where: { locationId: batch.locationId, status: "ACTIVE" },
  })
  if (activeBatch) {
    return NextResponse.json(
      { error: "An active batch already exists at this location" },
      { status: 409 }
    )
  }

  const updated = await prisma.batch.update({
    where: { id: params.id },
    data: { status: "ACTIVE", startDate: new Date() },
  })

  return NextResponse.json(updated)
}
