/**
 * src/lib/supabase/client.ts
 *
 * Browser-side Supabase client using @supabase/ssr.
 * Safe to import in Client Components ('use client').
 * Creates a singleton-style browser client that handles
 * cookie-based session management automatically.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase client configured for browser usage.
 * Call this inside Client Components or client-side hooks.
 *
 * @example
 * const supabase = createClient();
 * const { data, error } = await supabase.from('users').select('*');
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
