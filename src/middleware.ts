import { withAuth } from "next-auth/middleware"
import { type NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Force password reset redirect — must happen before any other routing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const forceReset = (token as any)?.forcePasswordReset
    if (forceReset && pathname !== '/set-password' && !pathname.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/set-password', req.url))
    }

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
    "/batches/:path*",
    "/set-password",
    "/api/admin/:path*",
    "/api/batches/:path*",
    "/api/strains/:path*",
    "/api/employees/:path*",
  ],
}
