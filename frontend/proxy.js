import { NextResponse } from "next/server";

function getHomeForRole(role) {
  return role === "SUPER_ADMIN" ? "/superadmin/dashboard" : "/admin/dashboard";
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("myreport_token")?.value;
  const role = request.cookies.get("myreport_role")?.value;

  const isSuperAdminArea = pathname.startsWith("/superadmin");
  const isAdminArea = pathname.startsWith("/admin");
  const isSuperAdminAuth = pathname === "/superadmin/login";
  const isAdminAuth = pathname === "/admin/login" || pathname === "/admin/signup";

  if ((isSuperAdminAuth || isAdminAuth || pathname === "/") && token && role) {
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  if (isSuperAdminArea && !isSuperAdminAuth) {
    if (!token || role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/superadmin/login", request.url));
    }
  }

  if (isAdminArea && !isAdminAuth) {
    if (!token || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/superadmin/:path*", "/admin/:path*"],
};
