'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/components/ui/ActionButton'
import { UserTable, UserWithLocations } from '@/components/admin/UserTable'
import { CreateAccountModal } from '@/components/admin/CreateAccountModal'
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog'

interface Location {
  id: string
  name: string
}

interface UsersPageClientProps {
  initialUsers: UserWithLocations[]
  locations: Location[]
  pageTitle?: string
}

export function UsersPageClient({ initialUsers, locations, pageTitle = 'Admin Panel' }: UsersPageClientProps) {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<UserWithLocations | null>(null)

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  const handleCreated = useCallback(() => {
    router.refresh()
  }, [router])

  const handleDeactivated = useCallback(() => {
    setDeactivateTarget(null)
    router.refresh()
  }, [router])

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
        <ActionButton
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Employee
        </ActionButton>
      </div>

      {/* User table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <UserTable
          users={initialUsers}
          onDeactivate={(user) => setDeactivateTarget(user)}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Create account modal */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
        locations={locations}
      />

      {/* Deactivate confirmation dialog */}
      {deactivateTarget && (
        <DeactivateConfirmDialog
          isOpen={!!deactivateTarget}
          userName={deactivateTarget.name || deactivateTarget.email}
          userId={deactivateTarget.id}
          onClose={() => setDeactivateTarget(null)}
          onDeactivated={handleDeactivated}
        />
      )}
    </>
  )
}
