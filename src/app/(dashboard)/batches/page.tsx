import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ROLE_PERMISSIONS } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { BatchCard } from '@/components/batches/BatchCard'
import { Role } from '@prisma/client'

export default async function BatchesPage() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const activeRole = ((session.user as any).activeRole ?? session.user?.role) as Role
  const permissions = ROLE_PERMISSIONS[activeRole]

  if (!permissions?.canManageBatches) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Batch Management</h2>
        <p className="text-sm text-gray-600">You do not have permission to manage batches.</p>
      </div>
    )
  }

  // Fetch current user with locationId
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { locationId: true },
  })

  // Admins see all batches; managers see only their location
  const whereClause =
    activeRole === Role.ADMIN
      ? {}
      : { locationId: dbUser?.locationId ?? '' }

  const batches = await prisma.batch.findMany({
    where: whereClause,
    include: {
      batchStrains: {
        include: { strain: true },
      },
      days: {
        select: { id: true, batchDay: true, isSubmitted: true },
      },
    },
    orderBy: { number: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Batch Management</h2>
        <Link
          href="/batches/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 min-h-[44px] inline-flex items-center text-sm transition-colors"
        >
          Create Batch
        </Link>
      </div>

      {/* Batch list */}
      {batches.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-gray-900">No batches yet</h3>
          <p className="text-sm text-gray-600 mt-1">
            Create your first batch to start recording daily production.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map(batch => (
            <BatchCard
              key={batch.id}
              id={batch.id}
              number={batch.number}
              status={batch.status}
              strains={batch.batchStrains.map(bs => bs.strain.name)}
              dayCount={batch.days.length}
            />
          ))}
        </div>
      )}
    </div>
  )
}
