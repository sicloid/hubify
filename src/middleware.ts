import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hubify-super-secret-key-12345"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("hubify_session")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
  const isPublicPage = request.nextUrl.pathname === "/";
  
  // Protect all core routes (anything not public, not auth, not api/static)
  // But wait, the easiest way is to protect all routes except public ones.
  // We'll rely on requireAuth in the layout, but middleware can provide a fast redirect.

  if (token && isAuthPage) {
    let targetUrl = "/";
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const role = (verified.payload as any).role;
      const roleRoutes: Record<string, string> = {
        ADMIN: "/admin",
        EXPORTER: "/ihracatci",
        MANUFACTURER: "/uretici",
        SELLER: "/satici",
        LOGISTICS: "/lojistik",
        WAREHOUSE: "/depo",
        TRADE_EXPERT: "/dis-ticaret-uzmani",
        ICC_EXPERT: "/icc-uzmani",
        FINANCIAL_ADV: "/mali-musavir",
        ACCOUNTING: "/muhasebe",
        INSURER: "/sigorta",
      };
      targetUrl = roleRoutes[role] || "/";
    } catch (e) {
      // Invalid token
    }
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
