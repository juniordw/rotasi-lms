// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification - should match your backend
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-here');

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value;
  
  // Current URL and path
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  
  // Define route protection rules
  const protectedPaths = [
    '/dashboard', 
    '/courses/enrolled',
    '/settings',
    '/profile'
  ];
  
  // Paths only for non-authenticated users
  const publicOnlyPaths = [
    '/login', 
    '/register', 
    '/forgot-password'
  ];

  // Admin-only paths
  const adminPaths = [
    '/dashboard/admin',
    '/dashboard/users',
    '/dashboard/categories',
    '/dashboard/reports'
  ];

  // Instructor-only paths
  const instructorPaths = [
    '/dashboard/courses/create',
    '/dashboard/courses/manage',
    '/dashboard/students',
    '/dashboard/analytics'
  ];

  // Student-only paths
  const studentPaths = [
    '/dashboard/courses/enrolled',
    '/dashboard/certificates',
    '/dashboard/progress'
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

  // Check for student-specific paths
  const isStudentPath = studentPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Function to validate token and get user role
  const getUserRole = async (token: string): Promise<string | null> => {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload.role as string;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  };

  // If token is present, verify and check role-based access
  if (token) {
    // If logged in and trying to access login/register, redirect to dashboard
    if (isPublicOnlyPath) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // For role-protected routes, verify token and check role
    if (isAdminPath || isInstructorPath || isStudentPath) {
      const role = await getUserRole(token);

      // Handle invalid/expired token
      if (!role) {
        // Clear invalid token cookie and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('accessToken');
        return response;
      }

      // Check role-based access
      if (
        (isAdminPath && role !== 'admin') ||
        (isInstructorPath && role !== 'instructor' && role !== 'admin') ||
        (isStudentPath && role !== 'student')
      ) {
        // Redirect to dashboard on unauthorized access
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }

    // Token exists and passed all checks, proceed
    return NextResponse.next();
  } else {
    // No token present

    // If trying to access protected route without token, redirect to login
    if (isProtectedPath || isAdminPath || isInstructorPath || isStudentPath) {
      // Save the original URL to redirect back after login
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
    }
  }
  
  // If no issues, proceed with the request
  return NextResponse.next();
}

// Define which paths should be handled by this middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};