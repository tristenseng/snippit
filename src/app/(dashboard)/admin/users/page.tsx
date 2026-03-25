import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsersPageClient } from './UsersPageClient'

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Defense in depth: double-check admin role even though middleware blocks non-admins
  if (session.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [users, locations] = await Promise.all([
    prisma.user.findMany({
      include: {
        userLocations: {
          include: { location: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.location.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <UsersPageClient
      initialUsers={users}
      locations={locations}
      pageTitle="Admin Panel"
    />
  )
}
