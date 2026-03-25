'use client'

import { useEffect, useRef, useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface Location {
  id: string
  name: string
}

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  locations: Location[]
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  role?: string
}

export function CreateAccountModal({
  isOpen,
  onClose,
  onCreated,
  locations,
}: CreateAccountModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE')
  const [locationId, setLocationId] = useState('')
  const [locationIds, setLocationIds] = useState<string[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const firstInputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element to return focus on close
      triggerRef.current = document.activeElement as HTMLElement
      // Focus first input on open
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 50)
    } else {
      // Return focus to trigger on close
      triggerRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setRole('EMPLOYEE')
      setLocationId('')
      setLocationIds([])
      setErrors({})
      setSubmitError(null)
      setSuccessMessage(null)
    }
  }, [isOpen])

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!firstName.trim()) newErrors.firstName = 'First Name is required.'
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required.'
    if (!email.trim()) newErrors.email = 'Email is required.'
    if (!password.trim()) newErrors.password = 'Temporary Password is required.'
    else if (password.length < 8) newErrors.password = 'Temporary Password must be at least 8 characters.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleLocationCheckbox(locId: string, checked: boolean) {
    if (checked) {
      setLocationIds((prev) => [...prev, locId])
    } else {
      setLocationIds((prev) => prev.filter((id) => id !== locId))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setSubmitError(null)

    const body: {
      name: string
      email: string
      password: string
      role: string
      locationId?: string
      locationIds?: string[]
    } = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password,
      role,
    }

    if (role === 'EMPLOYEE') {
      body.locationIds = locationIds
    } else {
      if (locationId) body.locationId = locationId
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setSuccessMessage('Account created. Employee will be prompted to set their password on first login.')
        setTimeout(() => {
          onCreated()
          onClose()
        }, 2000)
      } else if (res.status === 409) {
        setSubmitError('An account with this email already exists.')
      } else {
        setSubmitError('Unable to save. Please check your connection and try again.')
      }
    } catch {
      setSubmitError('Unable to save. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-account-title"
      >
        <h2 id="create-account-title" className="text-xl font-semibold text-gray-900 mb-4">
          Add Employee
        </h2>

        {successMessage && (
          <div className="mb-4">
            <InlineAlert type="success" message={successMessage} />
          </div>
        )}

        {submitError && (
          <div className="mb-4" role="alert">
            <InlineAlert type="error" message={submitError} onDismiss={() => setSubmitError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                ref={firstInputRef}
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1" role="alert">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1" role="alert">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1" role="alert">{errors.email}</p>
              )}
            </div>

            {/* Temporary Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Employee will set their own password on first login.
              </p>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1" role="alert">{errors.password}</p>
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
                onChange={(e) => setRole(e.target.value as 'EMPLOYEE' | 'MANAGER' | 'ADMIN')}
                className="w-full border border-gray-300 rounded-md px-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <ActionButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              variant="primary"
              loading={loading}
            >
              Add Employee
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  )
}
