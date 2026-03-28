import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MobileNav } from "@/components/navigation/MobileNav"
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper"

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
    <SessionProviderWrapper session={session}>
      <div className="min-h-screen bg-stone-50">
        {/* Top navigation bar */}
        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-tight text-stone-900">Snippit</span>
              </div>

              <MobileNav />
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  )
}
