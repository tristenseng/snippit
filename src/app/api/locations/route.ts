import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma, withUser } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRole = (session.user as any).activeRole ?? session.user.role
  if (!ROLE_PERMISSIONS[activeRole as keyof typeof ROLE_PERMISSIONS]?.canManageBatches) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (activeRole === "ADMIN") {
    const locations = await prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(locations)
  }

  // MANAGER: return their own assigned location
  const user = await withUser(session.user.id, (tx) =>
    tx.user.findUnique({
      where: { id: session.user.id },
      select: {
        locationId: true,
        location: { select: { id: true, name: true } },
        userLocations: {
          select: { location: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    })
  )

  const location =
    user?.location ?? user?.userLocations?.[0]?.location ?? null

  if (!location) {
    return NextResponse.json([], { status: 200 })
  }

  return NextResponse.json([location])
}
