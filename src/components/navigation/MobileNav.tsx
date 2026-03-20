'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { RoleSwitcher } from '@/components/auth/RoleSwitcher'
import LogoutButton from '@/components/auth/LogoutButton'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { Role } from '@prisma/client'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     min-h-[44px] min-w-[44px] touch-manipulation"
          aria-label="Open menu"
          aria-expanded={isOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeMenu} aria-hidden="true" />
          <div className="relative flex flex-col max-w-xs w-full h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100
                           min-h-[44px] min-w-[44px]"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Main navigation">
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50
                           rounded-md min-h-[44px]"
              >
                Dashboard
              </Link>

              <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
                <Link
                  href="/performance"
                  onClick={closeMenu}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50
                             rounded-md min-h-[44px]"
                >
                  My Performance
                </Link>
              </RoleGuard>

              <RoleGuard allowedRoles={[Role.MANAGER]}>
                <Link
                  href="/batches"
                  onClick={closeMenu}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50
                             rounded-md min-h-[44px]"
                >
                  Batch Management
                </Link>
              </RoleGuard>

              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50
                             rounded-md min-h-[44px]"
                >
                  Admin Panel
                </Link>
              </RoleGuard>
            </nav>

            <div className="border-t px-4 py-4">
              <RoleSwitcher />
              <div className="mt-4">
                <LogoutButton variant="text" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
