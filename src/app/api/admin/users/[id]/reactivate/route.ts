import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { withUser } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { ROLE_PERMISSIONS } from "@/lib/rbac"
import type { Role } from "@prisma/client"

export async function POST(
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

    const user = await withUser(session.user.id, (tx) =>
      tx.user.update({ where: { id: params.id }, data: { deactivatedAt: null } })
    )

    const { password: _pw, ...sanitized } = user
    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("POST /api/admin/users/[id]/reactivate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
