import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get("locationId")

  if (!locationId) {
    return NextResponse.json({ error: "locationId query parameter is required" }, { status: 400 })
  }

  const employees = await prisma.user.findMany({
    where: {
      deactivatedAt: null,
      role: "EMPLOYEE",
      userLocations: { some: { locationId } },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(employees)
}
