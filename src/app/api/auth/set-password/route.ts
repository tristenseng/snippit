import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = setPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { password } = parsed.data
    const hashedPassword = await hash(password, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        forcePasswordReset: false,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("POST /api/auth/set-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
