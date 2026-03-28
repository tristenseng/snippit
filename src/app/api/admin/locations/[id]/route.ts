import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const patchLocationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
})

function adminOnly(activeRole: string) {
  return ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageUsers
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
  if (!adminOnly(activeRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = patchLocationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const location = await prisma.location.findUnique({ where: { id } })
  if (!location) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.location.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    },
  })

  return NextResponse.json(updated)
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
  if (!adminOnly(activeRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const location = await prisma.location.findUnique({ where: { id } })
  if (!location) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const [userCount, batchCount] = await Promise.all([
    prisma.userLocation.count({ where: { locationId: id } }),
    prisma.batch.count({ where: { locationId: id } }),
  ])

  if (userCount > 0 || batchCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete a location that has assigned users or batches" },
      { status: 409 }
    )
  }

  await prisma.location.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
