import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ROLE_PERMISSIONS } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { WeightEntryForm } from '@/components/days/WeightEntryForm'
import { Role } from '@prisma/client'

interface PageProps {
  params: Promise<{ id: string; dayId: string }>
}

export default async function DayDetailPage({ params }: PageProps) {
  const { id: batchId, dayId } = await params
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const activeRole = ((session.user as any).activeRole ?? session.user?.role) as Role
  const permissions = ROLE_PERMISSIONS[activeRole]

  if (!permissions?.canManageBatches) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Day Detail</h2>
        <p className="text-sm text-gray-600">You do not have permission to manage batches.</p>
      </div>
    )
  }

  // Fetch current user with locationId
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { locationId: true },
  })

  // Fetch day with entries (batchStrain → strain name)
  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      batch: {
        include: {
          batchStrains: {
            include: { strain: true },
          },
        },
      },
      employeeDays: {
        include: {
          employee: { select: { id: true, name: true } },
          batchStrain: { include: { strain: true } },
        },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!day || day.batchId !== batchId) {
    notFound()
  }

  // Non-admin managers can only see their own location's batches
  if (activeRole !== Role.ADMIN && day.batch.locationId !== dbUser?.locationId) {
    notFound()
  }

  const batch = day.batch
  const locationId = batch.locationId

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <Link href="/batches" className="text-blue-600 hover:underline">
          Batch Management
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/batches/${batchId}`} className="text-blue-600 hover:underline">
          Batch #{batch.number}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Day {day.batchDay}</span>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-gray-900">Day {day.batchDay}</h2>
        {day.isSubmitted ? (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
            Submitted
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
            Not submitted
          </span>
        )}
      </div>

      {/* Weight entry form + entries list */}
      <WeightEntryForm
        batchId={batchId}
        dayId={dayId}
        batchDay={day.batchDay}
        batchStrains={batch.batchStrains}
        locationId={locationId}
        entries={day.employeeDays.map(ed => ({
          id: ed.id,
          amount: ed.amount,
          hours: ed.hours,
          batchStrainId: ed.batchStrainId,
          employee: { id: ed.employee.id, name: ed.employee.name },
        }))}
        isSubmitted={day.isSubmitted}
      />
    </div>
  )
}
