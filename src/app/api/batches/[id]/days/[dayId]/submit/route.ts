import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

export async function POST(
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

  if (activeRole !== "ADMIN") {
    const batch = await prisma.batch.findUnique({ where: { id } })
    const manager = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { locationId: true },
    })
    if (!batch || batch.locationId !== manager?.locationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  // Idempotent — submitted days remain fully editable per CONTEXT.md
  const updated = await prisma.day.update({
    where: { id: dayId },
    data: { isSubmitted: true },
  })

  return NextResponse.json(updated)
}
