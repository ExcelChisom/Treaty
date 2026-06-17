/**
 * proxy.ts  (Next.js 16 — root of project)
 *
 * Treaty Route Guard — Supabase Session Proxy
 *
 * In Next.js 16, the routing interceptor file is named proxy.ts
 * (renamed from middleware.ts in earlier versions).
 * The exported function must be named `proxy`.
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session cookie on every request.
 *  2. Redirect unauthenticated users away from protected routes.
 *  3. Redirect authenticated users away from auth pages (login/register).
 *  4. Allow all public routes and API handlers through without checks.
 */

import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ── Route Classification ────────────────────────────────────────────────────

/**
 * Routes that require an active Supabase auth session.
 * Unauthenticated requests are redirected to /auth/login.
 */
const PROTECTED_ROUTES: string[] = [
  "/dashboard",
  "/finance",
  "/food",
  "/fitness",
  "/schedule",
];

/**
 * Routes that are explicitly public.
 * Authenticated users visiting /auth/* are redirected to /dashboard.
 */
const AUTH_ROUTES: string[] = ["/auth/login", "/auth/register"];

/**
 * The splash / onboarding route.
 * Authenticated users are bounced to /dashboard.
 */
const ROOT_ROUTE = "/";

// ── Helper ──────────────────────────────────────────────────────────────────

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

// ── Proxy Function ──────────────────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh the session and get the current user.
  //    This MUST happen on every request to keep cookies fresh.
  const { response, user } = await updateSession(request);

  const isAuthenticated = user !== null;

  // 2. Guard: Protected route accessed without a session → /auth/login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    // Preserve the original destination so we can redirect after login.
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Guard: Authenticated user visits /auth/* or root → /dashboard
  //    Prevents logged-in users from seeing the login/register screens.
  if (isAuthenticated && (isAuthRoute(pathname) || pathname === ROOT_ROUTE)) {
    return NextResponse.redirect(
      new URL("/dashboard", request.nextUrl.origin)
    );
  }

  // 4. All other routes (public API, _next/static, etc.) — pass through
  //    with the refreshed session cookies attached.
  return response;
}

// ── Matcher Configuration ───────────────────────────────────────────────────
// Excludes static assets, image optimization paths, and favicon.
// All other paths (including /api/*) go through the proxy.

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static (static files)
     *  - _next/image  (image optimization)
     *  - favicon.ico, sitemap.xml, robots.txt
     *  - Public asset files (svg, png, jpg, jpeg, gif, webp, ico, mp4)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};
