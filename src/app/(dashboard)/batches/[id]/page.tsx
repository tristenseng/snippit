import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ROLE_PERMISSIONS } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { BatchStatusBadge } from '@/components/batches/BatchStatusBadge'
import { DayList } from '@/components/batches/DayList'
import { ActivateBatchButton } from '@/components/batches/ActivateBatchButton'
import { DeleteBatchButton } from '@/components/batches/DeleteBatchButton'
import { Role } from '@prisma/client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BatchDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const activeRole = ((session.user as any).activeRole ?? session.user?.role) as Role
  const permissions = ROLE_PERMISSIONS[activeRole]

  if (!permissions?.canManageBatches) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Batch Detail</h2>
        <p className="text-sm text-gray-600">You do not have permission to manage batches.</p>
      </div>
    )
  }

  // Fetch current user with locationId
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { locationId: true },
  })

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      batchStrains: {
        include: { strain: true },
      },
      days: {
        include: {
          _count: { select: { employeeDays: true } },
          batchStrain: { include: { strain: { select: { name: true } } } },
        },
        orderBy: [
          { batchStrain: { strain: { name: 'asc' } } },
          { batchDay: 'asc' },
        ],
      },
    },
  })

  if (!batch) {
    notFound()
  }

  // Non-admin managers can only see their own location's batches
  if (activeRole !== Role.ADMIN && batch.locationId !== dbUser?.locationId) {
    notFound()
  }

  const strainNames = batch.batchStrains.map(bs => bs.strain.name)
  const hasEntries = batch.days.some(d => d._count.employeeDays > 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/batches" className="text-blue-600 hover:underline">
          Batch Management
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Batch #{batch.number}</span>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">Batch #{batch.number}</h2>
            <BatchStatusBadge status={batch.status} />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Strains:</span>{' '}
            {strainNames.length > 0 ? strainNames.join(', ') : 'None'}
          </div>
          {batch.status === 'COMPLETED' && batch.completedAt && (
            <div className="text-sm text-gray-500">
              Completed: {new Date(batch.completedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0 items-center">
          {batch.status === 'INACTIVE' && (
            <ActivateBatchButton batchId={batch.id} />
          )}
          {!hasEntries && (
            <DeleteBatchButton batchId={batch.id} />
          )}
        </div>
      </div>

      {/* Day list section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Days</h3>
        <DayList
          days={batch.days}
          batchId={batch.id}
          batchStatus={batch.status}
          batchStrains={batch.batchStrains}
        />
      </div>
    </div>
  )
}
