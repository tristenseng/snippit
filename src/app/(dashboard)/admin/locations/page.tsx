import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LocationTable } from '@/components/admin/LocationTable'
import { AddLocationForm } from '@/components/admin/AddLocationForm'

export default async function AdminLocationsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { users: true, batches: true, userLocations: true } },
    },
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the locations users and batches are assigned to.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Add Location</h2>
          <AddLocationForm />
        </div>
        <LocationTable locations={locations} />
      </div>
    </>
  )
}
