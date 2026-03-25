import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditUserForm } from './EditUserForm'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Defense in depth: verify admin role
  if (session.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { id } = await params

  const [user, locations] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        userLocations: {
          include: { location: true },
        },
      },
    }),
    prisma.location.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  if (!user) {
    notFound()
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Admin Panel
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit User</h1>

      <EditUserForm
        userId={user.id}
        name={user.name}
        email={user.email}
        role={user.role}
        deactivatedAt={user.deactivatedAt}
        userLocations={user.userLocations}
        locations={locations}
      />
    </div>
  )
}
