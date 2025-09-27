import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Add security headers to all responses
  const response = NextResponse.next()

  // Basic security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // API route specific security
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Ensure API routes are not cached
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Check for required headers on API routes
    const contentType = request.headers.get('content-type')
    if (request.method === 'POST' && !contentType?.includes('application/json')) {
      return new NextResponse(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return response
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Run on all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
