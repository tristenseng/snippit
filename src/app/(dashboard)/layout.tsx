import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MobileNav } from "@/components/navigation/MobileNav"
import { SessionProvider } from "next-auth/react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        {/* Top navigation bar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Performance Tracker
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* User info - hidden on small screens */}
                <div className="hidden sm:block text-sm text-gray-700">
                  Welcome, {session.user?.name || session.user?.email}
                </div>

                {/* Mobile hamburger menu */}
                <MobileNav />
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
