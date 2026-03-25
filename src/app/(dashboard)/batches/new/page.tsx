import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ROLE_PERMISSIONS } from '@/lib/rbac'
import { Role } from '@prisma/client'
import { CreateBatchForm } from '@/components/batches/CreateBatchForm'

export default async function NewBatchPage() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const activeRole = ((session.user as any).activeRole ?? session.user?.role) as Role
  const permissions = ROLE_PERMISSIONS[activeRole]

  if (!permissions?.canManageBatches) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Create Batch</h2>
        <p className="text-sm text-gray-600">You do not have permission to manage batches.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/batches"
          className="text-sm text-blue-600 hover:underline"
        >
          Batch Management
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-600">Create Batch</span>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900">Create Batch</h2>

      <CreateBatchForm />
    </div>
  )
}
