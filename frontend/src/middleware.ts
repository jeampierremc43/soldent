import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for authentication and route protection
 * Runs before every request to check authentication status
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookie
  const authToken = request.cookies.get('auth-storage')?.value

  // Parse auth state from cookie
  let isAuthenticated = false
  if (authToken) {
    try {
      const authState = JSON.parse(authToken)
      isAuthenticated = authState?.state?.isAuthenticated || false
    } catch {
      isAuthenticated = false
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes that require authentication
  const protectedRoutes = [
    '/home',
    '/patients',
    '/appointments',
    '/medical',
    '/accounting',
    '/followups',
  ]
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users trying to access auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
