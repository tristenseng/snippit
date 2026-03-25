import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { ROLE_PERMISSIONS } from "@/lib/rbac"
import type { Role } from "@prisma/client"

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]),
  locationId: z.string().optional(),
  locationIds: z.array(z.string()).optional(),
})

export async function GET() {
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

    const users = await prisma.user.findMany({
      include: {
        userLocations: {
          include: {
            location: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const sanitized = users.map(({ password: _pw, ...user }) => user)
    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("GET /api/admin/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password, role, locationId, locationIds } = parsed.data

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
          forcePasswordReset: true,
          locationId: role !== "EMPLOYEE" ? (locationId ?? null) : null,
        },
      })

      if (role === "EMPLOYEE" && locationIds?.length) {
        await tx.userLocation.createMany({
          data: locationIds.map((locId) => ({ userId: created.id, locationId: locId })),
        })
      }

      return created
    })

    const { password: _pw, ...sanitized } = user
    return NextResponse.json(sanitized, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
