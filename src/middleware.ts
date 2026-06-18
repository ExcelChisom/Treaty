/**
 * src/middleware.ts  (Next.js standard placement — src/ directory projects)
 *
 * Treaty Route Guard — Clerk Authentication Middleware
 *
 * IMPORTANT: This file MUST be named middleware.ts and placed at src/
 * for two reasons:
 *   1. Next.js App Router only scans for middleware.ts (or src/middleware.ts).
 *   2. Clerk's runtime detection of clerkMiddleware() requires the standard
 *      middleware.ts filename — it does not recognise proxy.ts aliases,
 *      causing auth() to throw "Clerk can't detect usage of clerkMiddleware()".
 *
 * Protected routes: /dashboard, /finance, /food, /fitness, /schedule
 * Public routes (pass through freely): /, /auth/*, /api/*, static assets
 *
 * AUTH CATCH-ALL SAFETY:
 *   Clerk requires [[...rest]] catch-all segments for multi-step flows.
 *   /auth/login/[[...rest]]    — factor-one, sso-callback, verify-email, etc.
 *   /auth/register/[[...rest]] — verify-email-address, continue, etc.
 *   NONE of these appear in isProtectedRoute — no redirect loop is possible.
 *
 * Unauthenticated access to protected routes is automatically redirected
 * to NEXT_PUBLIC_CLERK_SIGN_IN_URL (/auth/login).
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

// ── Middleware ─────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    // auth.protect() redirects unauthenticated users to the sign-in page
    // configured via NEXT_PUBLIC_CLERK_SIGN_IN_URL env var (/auth/login).
    await auth.protect();
  }
});

// ── Matcher ────────────────────────────────────────────────────────────────
// Runs on every request EXCEPT:
//   - _next/static  — Next.js static assets
//   - _next/image   — Next.js image optimisation
//   - favicon.ico   — browser favicon
//   - image/media file extensions

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};
