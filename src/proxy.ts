import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Define public paths that don't need auth
  const publicPaths = [
    "/",
    "/login",
    "/signup",
  ];
  
  // Check if current path matches any public path
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path) || 
      request.nextUrl.pathname.startsWith("/business") || 
      request.nextUrl.pathname.startsWith("/testpublic") ||
      request.nextUrl.pathname.startsWith("/api") || // Allow all API for now to avoid blocking fetch logic
      request.nextUrl.pathname.startsWith("/_next") || 
      request.nextUrl.pathname.includes("favicon.ico");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for auth token (supports various naming conventions)
  const token = request.cookies.get("authjs.session-token") || 
                request.cookies.get("__Secure-authjs.session-token") || 
                request.cookies.get("next-auth.session-token");

  // If no token and trying to access protected route, redirect to login
  if (!token) {
     const url = request.nextUrl.clone();
     url.pathname = "/login";
     return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
