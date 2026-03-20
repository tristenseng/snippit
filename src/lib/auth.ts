import { getServerSession, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { Role } from "@prisma/client"

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "database",
    maxAge: 8 * 60 * 60,    // 8 hours for cannabis compliance
    updateAge: 60 * 60,      // Update session every hour
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const result = loginSchema.safeParse(credentials)
          if (!result.success) {
            return null
          }

          const { email, password } = result.data

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          })

          if (!user || !user.password) {
            return null
          }

          const isValid = await compare(password, user.password)
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            role: user.role as Role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = (user as any).role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

/**
 * Server-side auth helper — use in Server Components and API routes.
 * Replaces the v5 `auth()` export for next-auth v4 compatibility.
 */
export const auth = () => getServerSession(authOptions)

/**
 * Re-export signIn and signOut from next-auth/react for client components.
 * These are the standard client-side helpers used in login/logout UI.
 */
export { signIn, signOut } from "next-auth/react"
