/**
 * src/app/api/auth/register/route.ts
 *
 * Treaty Registration Route Handler
 *
 * POST /api/auth/register
 * Body: { nickname, pin, gender?, age?, height_cm?, weight_kg?, goal? }
 *
 * Flow:
 *  1. Validate nickname and 4-digit PIN format.
 *  2. Hash PIN with bcryptjs (cost factor 12).
 *  3. Create Supabase auth user with a synthetic email + PIN password.
 *  4. Upsert full profile into public.users (service role bypasses RLS).
 *  5. Return the user ID on success.
 *
 * The database trigger `on_auth_user_created` also fires on step 3,
 * inserting a shell row into public.users. Our upsert in step 4
 * completes the profile fields the trigger left blank.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

interface RegisterBody {
  nickname: string;
  pin: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goal?:
    | "lose_weight"
    | "maintain"
    | "gain_muscle"
    | "improve_fitness"
    | "eat_healthy";
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Converts a nickname to a valid, deterministic synthetic email. */
function nicknameToEmail(nickname: string): string {
  const sanitized = nickname
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_");
  return `${sanitized}@treaty.app`;
}

/** Validates the registration payload. Returns an error string or null. */
function validate(body: Partial<RegisterBody>): string | null {
  if (!body.nickname || typeof body.nickname !== "string") {
    return "Nickname is required.";
  }
  if (body.nickname.trim().length < 2 || body.nickname.trim().length > 30) {
    return "Nickname must be between 2 and 30 characters.";
  }
  if (!body.pin || typeof body.pin !== "string") {
    return "PIN is required.";
  }
  if (!/^\d{4}$/.test(body.pin)) {
    return "PIN must be exactly 4 digits.";
  }
  if (body.age !== undefined && (body.age < 13 || body.age > 120)) {
    return "Age must be between 13 and 120.";
  }
  return null;
}

// ── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Partial<RegisterBody>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // 1. Validate input
  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { nickname, pin, gender, age, height_cm, weight_kg, goal } =
    body as RegisterBody;

  // 2. Hash the PIN (cost factor 12 — strong but not sluggish on mobile)
  const pin_hash = await bcrypt.hash(pin, 12);

  // 3. Build synthetic email for Supabase Auth
  const email = nicknameToEmail(nickname);

  // 4. Create the Supabase auth user via service role (bypasses RLS)
  const supabase = await createServiceClient();

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: pin, // Supabase hashes this internally — separate from our pin_hash
      user_metadata: {
        nickname: nickname.trim(),
        pin_hash, // stored in metadata so the DB trigger can create the users row
      },
      email_confirm: true, // auto-confirm — Treaty uses PIN, not email verification
    });

  if (authError) {
    // Surface meaningful errors (e.g. "User already registered")
    const isDuplicate =
      authError.message.toLowerCase().includes("already") ||
      authError.code === "email_exists";
    return NextResponse.json(
      {
        error: isDuplicate
          ? "This nickname is already taken. Please choose another."
          : authError.message,
      },
      { status: isDuplicate ? 409 : 400 }
    );
  }

  const userId = authData.user.id;

  // 5. Upsert the full profile into public.users
  //    The DB trigger already inserted a shell row; this completes it.
  const { error: profileError } = await supabase.from("users").upsert(
    {
      id: userId,
      nickname: nickname.trim(),
      pin_hash,
      ...(gender && { gender }),
      ...(age !== undefined && { age }),
      ...(height_cm !== undefined && { height_cm }),
      ...(weight_kg !== undefined && { weight_kg }),
      ...(goal && { goal }),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    // Clean up the auth user if the profile insert fails
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "Profile creation failed. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, userId },
    { status: 201 }
  );
}
