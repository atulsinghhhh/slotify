import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

export async function proxy(request: NextRequest) {
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
      request.nextUrl.pathname.startsWith("/book") || 
      request.nextUrl.pathname.startsWith("/_next") || 
      request.nextUrl.pathname.includes("favicon.ico");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for auth token (supports various naming conventions)
  let token;
  try {
    token = await getToken({ 
      req: request, 
      secret: secret || ""
    });
  } catch {
    // If token verification fails, continue to check cookie-based auth
    token = null;
  }

  // Fallback: Check for auth token in cookies if getToken fails
  if (!token) {
    const cookieToken = request.cookies.get("authjs.session-token") || 
                        request.cookies.get("__Secure-authjs.session-token") || 
                        request.cookies.get("next-auth.session-token");
    
    if (!cookieToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Token exists in cookie, allow access for basic auth check
    return NextResponse.next();
  }

  // Role-based routing: prevent providers from accessing customer pages
  const customerOnlyPaths = ["/profile", "/appointments", "/notifications"];
  const providerOnlyPaths = ["/provider"];
  const staffOnlyPaths = ["/staff"];
  
  const isCustomerPath = customerOnlyPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  const isProviderPath = providerOnlyPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  const isStaffPath = staffOnlyPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If provider tries to access customer pages, redirect to provider dashboard
  if (token.role === "provider" && isCustomerPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/provider/dashboard";
    return NextResponse.redirect(url);
  }

  // If customer tries to access provider pages, redirect to home
  if (token.role === "customer" && isProviderPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If customer tries to access staff pages, redirect to home
  if (token.role === "customer" && isStaffPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If provider or customer tries to access staff pages, redirect appropriately
  if (token.role !== "staff" && isStaffPath) {
    const url = request.nextUrl.clone();
    url.pathname = token.role === "provider" ? "/provider/dashboard" : "/";
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
