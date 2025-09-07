import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === '/' || 
                       path === '/auth/login' || 
                       path === '/auth/register' ||
                       path.startsWith('/api/auth/login') ||
                       path.startsWith('/api/auth/register') ||
                       path.startsWith('/api/auth/me')

  const session = request.cookies.get('session')?.value || ''

  // Redirect to login if trying to access protected routes without session
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect to projects if already logged in and trying to access auth pages
  if (session && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  // Redirect to projects if logged in and accessing homepage
  if (session && path === '/') {
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/projects/:path*',
    '/dashboard/:path*',
    '/api/projects/:path*',
    '/api/categories/:path*',
    '/auth/login',
    '/auth/register'
  ]
}