/**
 * src/app/api/auth/login/route.ts
 *
 * Treaty Login Route Handler
 *
 * POST /api/auth/login
 * Body: { nickname, pin }
 *
 * Flow:
 *  1. Validate nickname and PIN format.
 *  2. Fetch the user's pin_hash from public.users by nickname (service client).
 *  3. Compare plain PIN against stored bcrypt hash.
 *  4. If valid, sign in with Supabase using synthetic email + PIN.
 *  5. Write the Supabase session tokens as HttpOnly cookies on the response.
 *  6. Return success with the user's nickname.
 *
 * Security notes:
 *  - Both "user not found" and "wrong PIN" return the same 401 message
 *    to prevent user enumeration attacks.
 *  - We use getUser() (not getSession()) to validate the session server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";

// ── Helpers ────────────────────────────────────────────────────────────────

function nicknameToEmail(nickname: string): string {
  const sanitized = nickname
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_");
  return `${sanitized}@treaty.app`;
}

const INVALID_CREDENTIALS_MSG = "Invalid nickname or PIN. Please try again.";

// ── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: { nickname?: string; pin?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { nickname, pin } = body;

  // 1. Basic format validation
  if (!nickname || typeof nickname !== "string" || nickname.trim().length < 2) {
    return NextResponse.json(
      { error: "Nickname is required." },
      { status: 400 }
    );
  }
  if (!pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be exactly 4 digits." },
      { status: 400 }
    );
  }

  // 2. Look up the user by nickname using the service client (bypasses RLS)
  const serviceClient = await createServiceClient();

  const { data: userRow, error: fetchError } = await serviceClient
    .from("users")
    .select("id, nickname, pin_hash")
    .eq("nickname", nickname.trim())
    .single();

  if (fetchError || !userRow) {
    // User not found — return same message as wrong PIN to prevent enumeration
    return NextResponse.json(
      { error: INVALID_CREDENTIALS_MSG },
      { status: 401 }
    );
  }

  // 3. Verify the PIN against the stored bcrypt hash
  const isValidPin = await bcrypt.compare(pin, userRow.pin_hash);
  if (!isValidPin) {
    return NextResponse.json(
      { error: INVALID_CREDENTIALS_MSG },
      { status: 401 }
    );
  }

  // 4. Sign in with Supabase to issue a session.
  //    We create a client whose setAll callback writes cookies onto our response.
  const email = nicknameToEmail(nickname);

  // Build a mutable response — session cookies will be written onto it.
  let sessionResponse = NextResponse.json(
    { success: true, nickname: userRow.nickname },
    { status: 200 }
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write each session cookie directly onto the response
          cookiesToSet.forEach(({ name, value, options }) => {
            sessionResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          });
        },
      },
    }
  );

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });

  if (signInError) {
    return NextResponse.json(
      { error: INVALID_CREDENTIALS_MSG },
      { status: 401 }
    );
  }

  // 5. sessionResponse now carries Set-Cookie headers from the Supabase client
  return sessionResponse;
}
