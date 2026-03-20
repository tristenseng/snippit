import { auth } from "@/lib/auth"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { Role } from "@prisma/client"

export default async function DashboardPage() {
  const session = await auth()
  const userRole = (session?.user as any)?.activeRole || (session?.user as any)?.role

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-600 capitalize">
          Viewing as: {userRole?.toLowerCase()}
        </p>
      </div>

      {/* Role-specific dashboard content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Employee Dashboard Cards */}
        <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Performance</h3>
              <p className="text-3xl font-bold text-blue-600">--</p>
              <p className="text-sm text-gray-500 mt-2">Today&apos;s production</p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Commission</h3>
              <p className="text-3xl font-bold text-green-600">$--</p>
              <p className="text-sm text-gray-500 mt-2">Projected earnings</p>
            </div>
          </div>
        </RoleGuard>

        {/* Manager Dashboard Cards */}
        <RoleGuard allowedRoles={[Role.MANAGER]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Batches</h3>
              <p className="text-3xl font-bold text-purple-600">--</p>
              <p className="text-sm text-gray-500 mt-2">Currently processing</p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
              <p className="text-3xl font-bold text-orange-600">--%</p>
              <p className="text-sm text-gray-500 mt-2">Average efficiency</p>
            </div>
          </div>
        </RoleGuard>

        {/* Admin Dashboard Cards */}
        <RoleGuard allowedRoles={[Role.ADMIN]}>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Users</h3>
              <p className="text-3xl font-bold text-red-600">--</p>
              <p className="text-sm text-gray-500 mt-2">Total registered</p>
            </div>
          </div>
        </RoleGuard>

      </div>
    </div>
  )
}
