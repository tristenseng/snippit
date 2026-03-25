import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { ROLE_PERMISSIONS } from "@/lib/rbac"
import type { Role } from "@prisma/client"

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).optional(),
  locationId: z.string().nullable().optional(),
  locationIds: z.array(z.string()).optional(),
})
// NOTE: email is intentionally excluded — email is NOT editable after account creation

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeRole = ((session.user as any).activeRole ?? session.user.role) as Role
    if (!ROLE_PERMISSIONS[activeRole]?.canManageUsers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        userLocations: {
          include: {
            location: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password: _pw, ...sanitized } = user
    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeRole = ((session.user as any).activeRole ?? session.user.role) as Role
    if (!ROLE_PERMISSIONS[activeRole]?.canManageUsers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, role, locationId, locationIds } = parsed.data

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(locationId !== undefined && { locationId }),
        },
      })

      if (locationIds !== undefined) {
        await tx.userLocation.deleteMany({ where: { userId: params.id } })
        if (locationIds.length > 0) {
          await tx.userLocation.createMany({
            data: locationIds.map((locId) => ({ userId: params.id, locationId: locId })),
          })
        }
      }

      return updated
    })

    const { password: _pw, ...sanitized } = user
    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
