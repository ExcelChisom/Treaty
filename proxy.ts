/**
 * proxy.ts  (Next.js 16 — project root)
 *
 * Treaty Route Guard — Clerk Authentication Proxy
 *
 * Uses @clerk/nextjs clerkMiddleware() as the default export,
 * which is compatible with Next.js 16's proxy.ts convention.
 *
 * Protected routes: /dashboard, /finance, /food, /fitness, /schedule
 * Public routes: /, /auth/*, /api/*, _next/static, _next/image, assets
 *
 * Unauthenticated access to protected routes is automatically
 * redirected to NEXT_PUBLIC_CLERK_SIGN_IN_URL (/auth/login).
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ── Protected route patterns ───────────────────────────────────────────────

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/finance(.*)",
  "/food(.*)",
  "/fitness(.*)",
  "/schedule(.*)",
]);

// ── Proxy function ─────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    // auth.protect() redirects unauthenticated users to the sign-in page
    // configured via NEXT_PUBLIC_CLERK_SIGN_IN_URL env var.
    await auth.protect();
  }
});

// ── Matcher ────────────────────────────────────────────────────────────────
// Excludes static assets and image optimization routes.
// All application routes (including /api/*) pass through Clerk.

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};
