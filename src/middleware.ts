import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { dashboardPathForRole } from "@/lib/role-routes";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hubify-super-secret-key-12345"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("hubify_session")?.value;
  const path = request.nextUrl.pathname;
  const isLoginPage = path.startsWith("/login");
  const isRegisterPage = path.startsWith("/register");
  const isAuthPage = isLoginPage || isRegisterPage;
  const isPublicPage = path === "/";

  if (!token && !isPublicPage && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Login sayfası her zaman erişilebilir olsun (hesap değişimi / yeniden giriş).
  // Sadece register sayfasında aktif oturumu panele yönlendiriyoruz.
  if (token && isRegisterPage) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const role = (verified.payload as { role?: string }).role;
      const targetUrl = dashboardPathForRole(role);
      return NextResponse.redirect(new URL(targetUrl, request.url));
    } catch {
      const res = NextResponse.next();
      res.cookies.delete("hubify_session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
