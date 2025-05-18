// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value;
  
  // Current URL pathname
  const { pathname } = request.nextUrl;
  
  // Define route protection rules
  const protectedPaths = [
    '/dashboard', 
    '/courses/enrolled',
    '/settings'
  ];
  
  // Paths only for non-authenticated users
  const publicOnlyPaths = ['/login', '/register', '/forgot-password'];

  // Admin-only paths
  const adminPaths = [
    '/dashboard/admin',
    '/dashboard/users',
    '/dashboard/categories'
  ];

  // Instructor-only paths
  const instructorPaths = [
    '/dashboard/courses/create',
    '/dashboard/courses/manage',
    '/dashboard/students',
    '/dashboard/analytics'
  ];

  // Check if current path requires authentication
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if current path is for non-authenticated users only
  const isPublicOnlyPath = publicOnlyPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check for admin-specific paths
  const isAdminPath = adminPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check for instructor-specific paths
  const isInstructorPath = instructorPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If trying to access protected route without token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If logged in and trying to access login/register, redirect to dashboard
  if (isPublicOnlyPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For role-based access, would ideally check user role from token claims
  // This is a simplified version - in production you'd decode the JWT to check user role
  
  // If no issues, proceed with the request
  return NextResponse.next();
}

// Define which paths should be handled by this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/courses/:path*',
    '/settings/:path*'
  ],
};