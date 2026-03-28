import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

const createLocationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
})

function adminOnly(activeRole: string) {
  return ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageUsers
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!adminOnly(activeRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { users: true, batches: true, userLocations: true } },
    },
  })

  return NextResponse.json(locations)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!adminOnly(activeRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = createLocationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const location = await prisma.location.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
    },
  })

  return NextResponse.json(location, { status: 201 })
}
