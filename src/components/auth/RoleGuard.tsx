'use client'

import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { hasRoleAccess } from "@/lib/rbac"

interface RoleGuardProps {
  allowedRoles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return <>{fallback}</>
  }

  const userRole = (session?.user as any)?.activeRole || (session?.user as any)?.role
  if (!userRole) {
    return <>{fallback}</>
  }

  const hasAccess = allowedRoles.some(role => hasRoleAccess(userRole as Role, role))

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
