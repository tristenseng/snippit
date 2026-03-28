'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { UserRoleBadge } from './UserRoleBadge'

interface Location {
  id: string
  name: string
}

interface UserLocation {
  location: Location
}

export interface UserWithLocations {
  id: string
  name: string | null
  email: string
  role: Role
  deactivatedAt: Date | null
  userLocations: UserLocation[]
}

interface UserTableProps {
  users: UserWithLocations[]
  onDeactivate: (user: UserWithLocations) => void
  onRefresh: () => void
}

function ReactivateButton({ userId, onRefresh }: { userId: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleReactivate() {
    setLoading(true)
    try {
      await fetch(`/api/admin/users/${userId}/reactivate`, { method: 'POST' })
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReactivate}
      disabled={loading}
      className="text-sm text-green-600 hover:text-green-800 font-medium min-h-[44px] inline-flex items-center disabled:opacity-50"
      type="button"
    >
      {loading ? 'Reactivating…' : 'Reactivate'}
    </button>
  )
}

function StatusBadge({ deactivatedAt }: { deactivatedAt: Date | null }) {
  if (deactivatedAt) {
    return (
      <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
        Deactivated
      </span>
    )
  }
  return (
    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
      Active
    </span>
  )
}

function formatLocations(userLocations: UserLocation[]): string {
  if (userLocations.length === 0) return '—'
  return userLocations.map((ul) => ul.location.name).join(', ')
}

export function UserTable({ users, onDeactivate, onRefresh }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
        <p className="text-sm text-gray-500">Add an employee account to get started.</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location(s)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={user.deactivatedAt ? 'bg-gray-50' : undefined}>
                <td className="px-4 py-3">
                  <span className={user.deactivatedAt ? 'text-gray-400' : 'text-gray-900 font-medium'}>
                    {user.name || '(no name)'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatLocations(user.userLocations)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge deactivatedAt={user.deactivatedAt} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium min-h-[44px] inline-flex items-center"
                    >
                      Edit
                    </Link>
                    {user.deactivatedAt ? (
                      <ReactivateButton userId={user.id} onRefresh={onRefresh} />
                    ) : (
                      <button
                        onClick={() => onDeactivate(user)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium min-h-[44px] inline-flex items-center"
                        type="button"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked card layout */}
      <div className="sm:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${user.deactivatedAt ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className={`font-medium ${user.deactivatedAt ? 'text-gray-400' : 'text-gray-900'}`}>
                  {user.name || '(no name)'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              </div>
              <StatusBadge deactivatedAt={user.deactivatedAt} />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <UserRoleBadge role={user.role} />
              <span className="text-xs text-gray-500">{formatLocations(user.userLocations)}</span>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <Link
                href={`/admin/users/${user.id}/edit`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium min-h-[44px] inline-flex items-center"
              >
                Edit
              </Link>
              {user.deactivatedAt ? (
                <ReactivateButton userId={user.id} onRefresh={onRefresh} />
              ) : (
                <button
                  onClick={() => onDeactivate(user)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium min-h-[44px] inline-flex items-center"
                  type="button"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
