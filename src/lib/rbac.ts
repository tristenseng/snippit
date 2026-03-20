import { Role } from "@prisma/client"

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  ADMIN: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  MANAGER: [Role.MANAGER, Role.EMPLOYEE],
  EMPLOYEE: [Role.EMPLOYEE],
}

export function hasRoleAccess(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole].includes(requiredRole)
}

export function getAvailableRoles(userRole: Role): Role[] {
  return ROLE_HIERARCHY[userRole]
}

export const ROLE_PERMISSIONS = {
  ADMIN: {
    canManageUsers: true,
    canManageBatches: true,
    canViewAllPerformance: true,
    canSwitchRoles: true,
  },
  MANAGER: {
    canManageUsers: false,
    canManageBatches: true,
    canViewAllPerformance: true,
    canSwitchRoles: false,
  },
  EMPLOYEE: {
    canManageUsers: false,
    canManageBatches: false,
    canViewAllPerformance: false,
    canSwitchRoles: false,
  },
} as const
