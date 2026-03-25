import { Role } from '@prisma/client'

interface UserRoleBadgeProps {
  role: Role
}

const badgeClasses: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full',
  MANAGER: 'bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full',
  EMPLOYEE: 'bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full',
}

const roleLabels: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span className={badgeClasses[role]}>
      {roleLabels[role]}
    </span>
  )
}
