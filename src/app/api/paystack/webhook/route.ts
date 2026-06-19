/**
 * src/app/api/paystack/webhook/route.ts
 *
 * Paystack Webhook Handler — charge.success
 *
 * SECURITY MODEL:
 *   1. Read raw body as text (required for HMAC — JSON.parse would mutate whitespace).
 *   2. Compute HMAC-SHA512 of raw body using PAYSTACK_SECRET_KEY.
 *   3. Compare against x-paystack-signature header using timingSafeEqual
 *      to prevent timing attacks.
 *   4. Reject with 401 on mismatch — never process unverified events.
 *
 * SUBSCRIPTION UPSERT:
 *   On charge.success, extract clerk_user_id and plan_name from metadata.
 *   Initialize the Supabase server client using SUPABASE_SERVICE_ROLE_KEY to bypass RLS.
 *
 *   Upsert a record into the subscriptions table for this userId with status='active'.
 *   Uses ON CONFLICT (user_id, plan_name) DO UPDATE so re-payments extend the expiry.
 *
 * BUNDLE EXPANSION:
 *   If plan_name === 'bundle', upserts three rows (food, fitness, schedule)
 *   so individual module checks remain simple single-row queries.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// ── Constants ──────────────────────────────────────────────────────────────

const SUBSCRIPTION_DAYS = 30;

// ── HMAC Verification ──────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("[webhook] PAYSTACK_SECRET_KEY is not set");
    return false;
  }
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    // timingSafeEqual prevents timing-based attacks
    return timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    // Buffers of different length → invalid signature
    return false;
  }
}

// ── Subscription upsert helper ─────────────────────────────────────────────

async function upsertSubscription(
  userId: string,
  planName: string,
  amountPaid: number
): Promise<void> {
  const supabase = await createServiceClient();
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + SUBSCRIPTION_DAYS);

  const record = {
    user_id: userId,
    plan_name: planName,           // ← DB column is plan_name
    status: "active",
    expires_at: expires.toISOString(),
    amount_paid: amountPaid,       // in Kobo as received from Paystack
    current_period_start: now.toISOString(),
    current_period_end: expires.toISOString(),
    updated_at: now.toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(record, { onConflict: "user_id,plan_name" }); // ← conflict key uses plan_name

  if (error) {
    console.error(
      `[webhook] Supabase upsert failed (user=${userId}, plan=${planName}):`,
      error.message
    );
    throw new Error(error.message);
  }

  console.log(
    `[webhook] ✅ Subscription activated: user=${userId} plan=${planName} expires=${expires.toISOString()}`
  );
}

// ── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read raw body (must be text for HMAC — do not parse first)
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // 2. HMAC verification — reject unverified events immediately
  if (!verifySignature(rawBody, signature)) {
    console.warn("[webhook] ❌ Invalid Paystack signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. Parse event
  let event: {
    event: string;
    data: {
      amount: number;
      reference: string;
      metadata?: {
        clerk_user_id?: string;
        plan_name?: string;          // ← metadata key also aligned to plan_name
        custom_fields?: Array<{
          variable_name: string;
          value: string;
        }>;
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 4. Handle charge.success only — acknowledge all other events with 200
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true, action: "ignored" });
  }

  const { amount, reference, metadata } = event.data;

  // 5. Extract clerk_user_id — check both direct metadata and custom_fields
  const clerkUserId =
    metadata?.clerk_user_id ??
    metadata?.custom_fields?.find(
      (f) => f.variable_name === "clerk_user_id"
    )?.value;

  const planName =
    metadata?.plan_name ??
    metadata?.custom_fields?.find(
      (f) => f.variable_name === "plan_name"
    )?.value ??
    "bundle";

  if (!clerkUserId) {
    console.error(
      `[webhook] charge.success received but clerk_user_id missing. ref=${reference}`
    );
    return NextResponse.json(
      { error: "Missing clerk_user_id in metadata" },
      { status: 400 }
    );
  }

  // 6. Upsert subscription(s)
  try {
    if (planName === "bundle") {
      // Expand bundle into 3 individual rows for simple per-module queries
      await Promise.all([
        upsertSubscription(clerkUserId, "food", amount),
        upsertSubscription(clerkUserId, "fitness", amount),
        upsertSubscription(clerkUserId, "schedule", amount),
      ]);
    } else {
      await upsertSubscription(clerkUserId, planName, amount);
    }
  } catch (err) {
    // Return 500 so Paystack retries the webhook
    console.error("[webhook] Upsert failed:", err);
    return NextResponse.json(
      { error: "Subscription activation failed — will retry" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    received: true,
    ref: reference,
    plan: planName,
    user: clerkUserId,
  });
}
