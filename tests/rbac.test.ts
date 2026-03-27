import { Role } from '@prisma/client'
import {
  ROLE_HIERARCHY,
  hasRoleAccess,
  getAvailableRoles,
  ROLE_PERMISSIONS,
} from '@/lib/rbac'

describe('RBAC Utility Library (01-03-01, 01-03-03)', () => {
  describe('AUTH-04 — ROLE_HIERARCHY values', () => {
    it('ADMIN hierarchy includes ADMIN, MANAGER, and EMPLOYEE', () => {
      expect(ROLE_HIERARCHY[Role.ADMIN]).toContain(Role.ADMIN)
      expect(ROLE_HIERARCHY[Role.ADMIN]).toContain(Role.MANAGER)
      expect(ROLE_HIERARCHY[Role.ADMIN]).toContain(Role.EMPLOYEE)
    })

    it('MANAGER hierarchy includes MANAGER and EMPLOYEE but not ADMIN', () => {
      expect(ROLE_HIERARCHY[Role.MANAGER]).toContain(Role.MANAGER)
      expect(ROLE_HIERARCHY[Role.MANAGER]).toContain(Role.EMPLOYEE)
      expect(ROLE_HIERARCHY[Role.MANAGER]).not.toContain(Role.ADMIN)
    })

    it('EMPLOYEE hierarchy includes only EMPLOYEE', () => {
      expect(ROLE_HIERARCHY[Role.EMPLOYEE]).toContain(Role.EMPLOYEE)
      expect(ROLE_HIERARCHY[Role.EMPLOYEE]).not.toContain(Role.MANAGER)
      expect(ROLE_HIERARCHY[Role.EMPLOYEE]).not.toContain(Role.ADMIN)
    })
  })

  describe('AUTH-04 — hasRoleAccess behavior', () => {
    it('ADMIN can access ADMIN routes', () => {
      expect(hasRoleAccess(Role.ADMIN, Role.ADMIN)).toBe(true)
    })

    it('ADMIN can access MANAGER routes', () => {
      expect(hasRoleAccess(Role.ADMIN, Role.MANAGER)).toBe(true)
    })

    it('ADMIN can access EMPLOYEE routes', () => {
      expect(hasRoleAccess(Role.ADMIN, Role.EMPLOYEE)).toBe(true)
    })

    it('MANAGER can access MANAGER routes', () => {
      expect(hasRoleAccess(Role.MANAGER, Role.MANAGER)).toBe(true)
    })

    it('MANAGER can access EMPLOYEE routes', () => {
      expect(hasRoleAccess(Role.MANAGER, Role.EMPLOYEE)).toBe(true)
    })

    it('MANAGER cannot access ADMIN routes', () => {
      expect(hasRoleAccess(Role.MANAGER, Role.ADMIN)).toBe(false)
    })

    it('EMPLOYEE can access EMPLOYEE routes', () => {
      expect(hasRoleAccess(Role.EMPLOYEE, Role.EMPLOYEE)).toBe(true)
    })

    it('EMPLOYEE cannot access MANAGER routes', () => {
      expect(hasRoleAccess(Role.EMPLOYEE, Role.MANAGER)).toBe(false)
    })

    it('EMPLOYEE cannot access ADMIN routes', () => {
      expect(hasRoleAccess(Role.EMPLOYEE, Role.ADMIN)).toBe(false)
    })
  })

  describe('AUTH-04 — getAvailableRoles returns correct arrays', () => {
    it('ADMIN gets all three roles', () => {
      const roles = getAvailableRoles(Role.ADMIN)
      expect(roles).toHaveLength(3)
      expect(roles).toContain(Role.ADMIN)
      expect(roles).toContain(Role.MANAGER)
      expect(roles).toContain(Role.EMPLOYEE)
    })

    it('MANAGER gets MANAGER and EMPLOYEE', () => {
      const roles = getAvailableRoles(Role.MANAGER)
      expect(roles).toHaveLength(2)
      expect(roles).toContain(Role.MANAGER)
      expect(roles).toContain(Role.EMPLOYEE)
    })

    it('EMPLOYEE gets only EMPLOYEE', () => {
      const roles = getAvailableRoles(Role.EMPLOYEE)
      expect(roles).toHaveLength(1)
      expect(roles).toContain(Role.EMPLOYEE)
    })
  })

  describe('AUTH-04 — ROLE_PERMISSIONS per role', () => {
    it('ADMIN has full permissions including canManageUsers and canSwitchRoles', () => {
      expect(ROLE_PERMISSIONS.ADMIN.canManageUsers).toBe(true)
      expect(ROLE_PERMISSIONS.ADMIN.canManageStrains).toBe(true)
      expect(ROLE_PERMISSIONS.ADMIN.canManageBatches).toBe(true)
      expect(ROLE_PERMISSIONS.ADMIN.canViewAllPerformance).toBe(true)
      expect(ROLE_PERMISSIONS.ADMIN.canSwitchRoles).toBe(true)
    })

    it('MANAGER can manage batches and view performance but cannot manage users or switch roles', () => {
      expect(ROLE_PERMISSIONS.MANAGER.canManageUsers).toBe(false)
      expect(ROLE_PERMISSIONS.MANAGER.canManageStrains).toBe(false)
      expect(ROLE_PERMISSIONS.MANAGER.canManageBatches).toBe(true)
      expect(ROLE_PERMISSIONS.MANAGER.canViewAllPerformance).toBe(true)
      expect(ROLE_PERMISSIONS.MANAGER.canSwitchRoles).toBe(false)
    })

    it('EMPLOYEE has no management or elevated permissions', () => {
      expect(ROLE_PERMISSIONS.EMPLOYEE.canManageUsers).toBe(false)
      expect(ROLE_PERMISSIONS.EMPLOYEE.canManageStrains).toBe(false)
      expect(ROLE_PERMISSIONS.EMPLOYEE.canManageBatches).toBe(false)
      expect(ROLE_PERMISSIONS.EMPLOYEE.canViewAllPerformance).toBe(false)
      expect(ROLE_PERMISSIONS.EMPLOYEE.canSwitchRoles).toBe(false)
    })
  })
})
