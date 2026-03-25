import type { Role } from "@prisma/client"
import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      activeRole: Role
      forcePasswordReset: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    forcePasswordReset: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    activeRole?: Role
    forcePasswordReset?: boolean
  }
}
