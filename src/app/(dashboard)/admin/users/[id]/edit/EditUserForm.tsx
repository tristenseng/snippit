'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface Location {
  id: string
  name: string
}

interface UserLocation {
  location: Location
}

interface EditUserFormProps {
  userId: string
  name: string | null
  email: string
  role: Role
  deactivatedAt: Date | null
  userLocations: UserLocation[]
  locations: Location[]
}

export function EditUserForm({
  userId,
  name,
  email,
  role: initialRole,
  deactivatedAt,
  userLocations,
  locations,
}: EditUserFormProps) {
  const router = useRouter()

  const initialLocationIds = userLocations.map((ul) => ul.location.id)
  const initialLocationId = initialLocationIds[0] ?? ''

  const [fullName, setFullName] = useState(name ?? '')
  const [role, setRole] = useState<Role>(initialRole)
  const [locationId, setLocationId] = useState(initialLocationId)
  const [locationIds, setLocationIds] = useState<string[]>(initialLocationIds)
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleLocationCheckbox(locId: string, checked: boolean) {
    if (checked) {
      setLocationIds((prev) => [...prev, locId])
    } else {
      setLocationIds((prev) => prev.filter((id) => id !== locId))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameError(null)
    setSubmitError(null)

    if (!fullName.trim()) {
      setNameError('Full Name is required.')
      return
    }

    setLoading(true)

    const body: {
      name: string
      role: Role
      locationId?: string
      locationIds?: string[]
    } = {
      name: fullName.trim(),
      role,
    }

    if (role === 'EMPLOYEE') {
      body.locationIds = locationIds
    } else {
      if (locationId) body.locationId = locationId
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setSuccessMessage('Changes saved.')
        setTimeout(() => {
          router.push('/admin/users')
          router.refresh()
        }, 1000)
      } else {
        setSubmitError('Unable to save. Please check your connection and try again.')
      }
    } catch {
      setSubmitError('Unable to save. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-5">

        {/* Deactivated warning */}
        {deactivatedAt && (
          <InlineAlert
            type="error"
            message="This account is deactivated. Return to the user list and use the Reactivate button to restore access."
          />
        )}

        {successMessage && (
          <InlineAlert type="success" message={successMessage} />
        )}

        {submitError && (
          <InlineAlert
            type="error"
            message={submitError}
            onDismiss={() => setSubmitError(null)}
          />
        )}

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full border border-gray-200 rounded-md px-3 text-base sm:text-sm min-h-[44px] bg-gray-100 text-gray-500 cursor-not-allowed"
            aria-describedby="email-note"
          />
          <p id="email-note" className="text-xs text-gray-400 mt-1">Email cannot be changed after account creation.</p>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="name"
          />
          {nameError && (
            <p className="text-red-600 text-xs mt-1" role="alert">{nameError}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            autoFocus
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Location Assignment */}
        {role === 'EMPLOYEE' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Assignment
            </label>
            {locations.length === 0 ? (
              <p className="text-sm text-gray-500">No locations available.</p>
            ) : (
              <div className="space-y-2">
                {locations.map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                    <input
                      type="checkbox"
                      value={loc.id}
                      checked={locationIds.includes(loc.id)}
                      onChange={(e) => handleLocationCheckbox(loc.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{loc.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="locationId"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">No location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 mt-4">
        <ActionButton
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/users')}
          disabled={loading}
        >
          Cancel
        </ActionButton>
        <ActionButton
          type="submit"
          variant="primary"
          loading={loading}
        >
          Save Changes
        </ActionButton>
      </div>
    </form>
  )
}
