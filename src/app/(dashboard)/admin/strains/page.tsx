import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StrainTable } from '@/components/admin/StrainTable'
import { AddStrainForm } from '@/components/admin/AddStrainForm'

export default async function AdminStrainsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const strains = await prisma.strain.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { batchStrains: true } },
    },
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Strains</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the strain catalog used across all batches.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Add Strain</h2>
          <AddStrainForm />
        </div>
        <StrainTable strains={strains} />
      </div>
    </>
  )
}
