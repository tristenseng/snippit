import Link from 'next/link'
import { auth } from "@/lib/auth"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { Role } from "@prisma/client"
import { fetchEmployeePerformanceData, getLatestSubmittedDay } from '@/lib/performance'

export default async function DashboardPage() {
  const session = await auth()
  const activeRole = (session?.user as any)?.activeRole || (session?.user as any)?.role
  const userRole = activeRole
  const isEmployee = activeRole === Role.EMPLOYEE
  let productionData: { totalGrams: number; dateLabel: string; dayNumber: number } | null = null
  if (isEmployee && session?.user?.id) {
    const entries = await fetchEmployeePerformanceData(session.user.id)
    productionData = getLatestSubmittedDay(entries)
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">Dashboard</h2>
        <p className="text-sm text-stone-500 mt-1 capitalize">
          Viewing as: {userRole?.toLowerCase()}
        </p>
      </div>

      {/* Role-specific dashboard content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Employee Dashboard Cards */}
        <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
          <Link href="/performance">
            <div className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm active:scale-[0.98] active:shadow-none transition-all duration-200">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Today&apos;s production</p>
              {productionData ? (
                <>
                  <p className="text-3xl font-bold text-stone-900 mt-2 tabular-nums">
                    {productionData.totalGrams.toLocaleString('en-US')}g
                  </p>
                  <p className="text-sm font-medium text-stone-600 mt-1">
                    {productionData.dateLabel} &middot; Day {productionData.dayNumber}
                  </p>
                </>
              ) : (
                <p className="text-sm text-stone-500 mt-3">No data yet</p>
              )}
            </div>
          </Link>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Projected earnings</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2 tabular-nums">$—</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Commission</p>
          </div>
        </RoleGuard>

        {/* Manager Dashboard Cards */}
        <RoleGuard allowedRoles={[Role.MANAGER]}>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Currently processing</p>
            <p className="text-3xl font-bold text-stone-900 mt-2 tabular-nums">—</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Active batches</p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Average efficiency</p>
            <p className="text-3xl font-bold text-stone-900 mt-2 tabular-nums">—%</p>
            <p className="text-sm font-medium text-stone-600 mt-1">Team performance</p>
          </div>
        </RoleGuard>

        {/* Admin Dashboard Cards */}
        <RoleGuard allowedRoles={[Role.ADMIN]}>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total registered</p>
            <p className="text-3xl font-bold text-stone-900 mt-2 tabular-nums">—</p>
            <p className="text-sm font-medium text-stone-600 mt-1">System users</p>
          </div>
        </RoleGuard>

      </div>
    </div>
  )
}
