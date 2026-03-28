import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const patchStrainSchema = z.object({
  name: z.string().min(1).max(50),
})

function adminOnly(activeRole: string) {
  return ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageStrains
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
  const parsed = patchStrainSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const strain = await prisma.strain.findUnique({ where: { id } })
  if (!strain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.strain.update({
    where: { id },
    data: { name: parsed.data.name },
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

  const strain = await prisma.strain.findUnique({ where: { id } })
  if (!strain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const usedInBatch = await prisma.batchStrain.findFirst({ where: { strainId: id } })
  if (usedInBatch) {
    return NextResponse.json(
      { error: "Cannot delete a strain that has been used in a batch" },
      { status: 409 }
    )
  }

  await prisma.strain.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
