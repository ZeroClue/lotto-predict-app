import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Assuming token is stored in a cookie
  const isAuthenticated = !!token;

  const protectedRoutes = ['/dashboard', '/predictions', '/games', '/collection']; // Protected routes requiring authentication
  const authRoutes = ['/login', '/register']; // Routes for authentication

  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect unauthenticated users from protected routes to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect authenticated users from auth routes to dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/dashboard/:path*', '/predictions/:path*', '/games/:path*', '/collection/:path*', '/login', '/register'],
};
