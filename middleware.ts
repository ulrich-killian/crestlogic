import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  // Intercept any request targeting /admin/dashboard and children paths
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    if (!token || token !== "authenticated_operator") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config matcher targeting /admin/dashboard and any sub-routes
export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
