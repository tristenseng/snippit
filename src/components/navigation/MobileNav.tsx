'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { RoleSwitcher } from '@/components/auth/RoleSwitcher'
import LogoutButton from '@/components/auth/LogoutButton'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { Role } from '@prisma/client'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const desktopLinkClass = (href: string) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      pathname === href
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
    }`

  const mobileLinkClass = (href: string) =>
    `flex items-center px-3 py-2 text-base font-medium rounded-md min-h-[44px] transition-colors ${
      pathname === href
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-stone-900 hover:bg-stone-50'
    }`

  return (
    <>
      {/* Desktop nav links */}
      <div className="hidden lg:flex items-center gap-1">
        <Link href="/dashboard" className={desktopLinkClass('/dashboard')}>
          Dashboard
        </Link>
        <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
          <Link href="/performance" className={desktopLinkClass('/performance')}>
            My Performance
          </Link>
        </RoleGuard>
        <RoleGuard allowedRoles={[Role.MANAGER]} exact>
          <Link href="/batches" className={desktopLinkClass('/batches')}>
            Batch Management
          </Link>
        </RoleGuard>
        <RoleGuard allowedRoles={[Role.ADMIN]}>
          <Link href="/batches" className={desktopLinkClass('/batches')}>
            Batches
          </Link>
          <span className="w-px h-4 bg-stone-200 mx-1" aria-hidden="true" />
          <Link href="/admin/users" className={desktopLinkClass('/admin/users')}>
            Users
          </Link>
          <Link href="/admin/strains" className={desktopLinkClass('/admin/strains')}>
            Strains
          </Link>
          <Link href="/admin/locations" className={desktopLinkClass('/admin/locations')}>
            Locations
          </Link>
        </RoleGuard>
        <span className="w-px h-4 bg-stone-200 mx-1" aria-hidden="true" />
        <RoleSwitcher dropDirection="down" />
        <LogoutButton variant="text" />
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100
                     min-h-[44px] min-w-[44px] touch-manipulation transition-colors"
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
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <span className="text-lg font-bold tracking-tight text-stone-900">Snippit</span>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100
                           min-h-[44px] min-w-[44px] transition-colors"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className={mobileLinkClass('/dashboard')}
              >
                Dashboard
              </Link>

              <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
                <Link
                  href="/performance"
                  onClick={closeMenu}
                  className={mobileLinkClass('/performance')}
                >
                  My Performance
                </Link>
              </RoleGuard>

              <RoleGuard allowedRoles={[Role.MANAGER]} exact>
                <Link
                  href="/batches"
                  onClick={closeMenu}
                  className={mobileLinkClass('/batches')}
                >
                  Batch Management
                </Link>
              </RoleGuard>

              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <Link
                  href="/batches"
                  onClick={closeMenu}
                  className={mobileLinkClass('/batches')}
                >
                  Batches
                </Link>
                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-stone-400 tracking-wider">
                  Admin
                </p>
                <Link
                  href="/admin/users"
                  onClick={closeMenu}
                  className={mobileLinkClass('/admin/users')}
                >
                  Users
                </Link>
                <Link
                  href="/admin/strains"
                  onClick={closeMenu}
                  className={mobileLinkClass('/admin/strains')}
                >
                  Strains
                </Link>
                <Link
                  href="/admin/locations"
                  onClick={closeMenu}
                  className={mobileLinkClass('/admin/locations')}
                >
                  Locations
                </Link>
              </RoleGuard>
            </nav>

            <div className="relative border-t border-stone-200 px-4 py-4 overflow-visible">
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
