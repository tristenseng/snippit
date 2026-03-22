'use client'

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Role } from "@prisma/client"
import { getAvailableRoles } from "@/lib/rbac"

export function RoleSwitcher() {
  const { data: session, update } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  if (!session?.user || (session.user as any)?.role !== 'ADMIN') {
    return null
  }

  const userRole = (session.user as any)?.role as Role
  const activeRole = ((session.user as any)?.activeRole as Role) || userRole
  const availableRoles = getAvailableRoles(userRole)

  const handleRoleSwitch = async (newRole: Role) => {
    await update({ activeRole: newRole })
    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700
                   hover:text-gray-900 min-h-[44px] touch-manipulation"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="capitalize">{activeRole.toLowerCase()} view</span>
        <svg className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg z-[60]" role="listbox">
          <div className="py-1">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                role="option"
                aria-selected={activeRole === role}
                className={`
                  block px-4 py-2 text-sm w-full text-left min-h-[44px]
                  ${activeRole === role
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="capitalize">{role.toLowerCase()} View</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
