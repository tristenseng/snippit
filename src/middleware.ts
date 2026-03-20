import { withAuth } from "next-auth/middleware"
import { type NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin-only routes: redirect non-admins to dashboard
    if (pathname.startsWith('/admin')) {
      const userRole = token?.role as Role
      const activeRole = (token as any)?.activeRole as Role || userRole

      if (activeRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Always allow auth routes and public pages
        if (
          pathname.startsWith('/api/auth') ||
          pathname === '/login' ||
          pathname === '/'
        ) {
          return true
        }

        // All other matched routes require a valid token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
  ],
}
