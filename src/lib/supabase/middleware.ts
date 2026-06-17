/**
 * src/lib/supabase/middleware.ts
 *
 * Session management helper for the route proxy.
 * Called inside proxy.ts (root) to refresh the Supabase
 * auth session on every request using @supabase/ssr.
 *
 * Supabase sessions are short-lived JWTs stored in cookies.
 * This function ensures the session cookie is refreshed
 * before any route handler reads it, preventing stale-session
 * false logouts.
 */

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Refreshes the Supabase session cookie on every request.
 * Returns the updated response and the authenticated user (or null).
 *
 * @param request - Incoming NextRequest from the proxy
 * @returns Object containing:
 *   - response: NextResponse with refreshed Set-Cookie headers
 *   - user: The authenticated Supabase user, or null if unauthenticated
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: { id: string; email?: string } | null;
}> {
  // Start with a pass-through response — cookies will be written onto it.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to both the request (for downstream use) and
          // the response (so the browser receives the refreshed session).
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: getUser() is called here (not getSession()) as recommended
  // by Supabase to avoid trusting stale client-side JWT data.
  // getUser() validates the JWT against the Supabase Auth server.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Session fetch error — treat as unauthenticated.
    return { response, user: null };
  }

  return { response, user };
}
