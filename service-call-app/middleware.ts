import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, ROOT_ROUTE, DASHBOARD_ROUTE, ANALYTICS_ROUTE } from './app/constants';

const protectedRoutes = [DASHBOARD_ROUTE, ANALYTICS_ROUTE];

export default function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || '';
  const currentPath = request.nextUrl.pathname;

  // Redirect to login if session is not set and the user is accessing a protected route
  if (!session && protectedRoutes.includes(currentPath)) {
    const loginURL = new URL(ROOT_ROUTE, request.nextUrl.origin);
    return NextResponse.redirect(loginURL.toString());
  }

  // If the user is signed in, do not force a redirect to the dashboard from the root route
  // Allow signed-in users to access the root route or other non-protected routes without redirection
  if (session && protectedRoutes.includes(currentPath)) {
    // No need to redirect if they are already on the dashboard
    return NextResponse.next();
  }

  // Allow the request to proceed without redirects
  return NextResponse.next();
}
