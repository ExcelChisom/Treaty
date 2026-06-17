/**
 * src/lib/supabase/server.ts
 *
 * Server-side Supabase client factory using @supabase/ssr.
 * Use this in:
 *   - Server Components (async components)
 *   - Route Handlers (app/api/**/route.ts)
 *   - Server Actions
 *
 * NEVER import this in Client Components ('use client' files).
 * It reads cookies from the Next.js server cookie store,
 * which is only available in server contexts.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for server-side usage.
 * Reads and writes session cookies via Next.js cookie store.
 * Must be called inside an async server context.
 *
 * @example — Server Component
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 *
 * @example — Route Handler
 * export async function GET() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('users').select('*');
 *   return Response.json(data);
 * }
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // Middleware handles session refresh for Server Components.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with the Service Role key.
 * Bypasses Row Level Security — use ONLY in trusted server
 * contexts such as the Paystack webhook handler.
 *
 * CRITICAL: Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export async function createServiceClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Component contexts.
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
