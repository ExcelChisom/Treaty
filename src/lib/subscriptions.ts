/**
 * src/lib/subscriptions.ts
 *
 * Shared subscription check helper used by all premium module pages.
 * Queries public.subscriptions using the Clerk userId (TEXT).
 * Gracefully returns [] on any error (UUID mismatch, table missing, etc.)
 */

import { createServiceClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

export type PlanType = "food" | "fitness" | "schedule" | "bundle";

// ── Active plan check ──────────────────────────────────────────────────────

/**
 * Returns the set of active module keys for a given Clerk userId.
 * "bundle" expands to all three premium modules.
 * Always includes "finance" (forever free).
 */
export async function getActiveModules(userId: string): Promise<Set<string>> {
  const active = new Set<string>(["finance"]);

  try {
    const supabase = await createServiceClient();
    const now = new Date().toISOString();

    const { data } = await supabase
      .from("subscriptions")
      .select("plan_name, expires_at")  // ← DB column is plan_name
      .eq("user_id", userId)
      .eq("status", "active");

    (data ?? []).forEach((sub) => {
      if ((sub.expires_at ?? "") > now) {
        const plan = (sub.plan_name ?? "").toLowerCase(); // ← DB column is plan_name
        if (plan === "bundle") {
          active.add("food");
          active.add("fitness");
          active.add("schedule");
        } else if (["food", "fitness", "schedule"].includes(plan)) {
          active.add(plan);
        }
      }
    });
  } catch {
    // Silently return free-only set — table may not exist yet (pre-migration)
  }

  return active;
}

/**
 * Single-module convenience check.
 * Returns true if the user has an active subscription for planType or bundle.
 */
export async function hasAccess(
  userId: string,
  planType: Exclude<PlanType, "bundle">
): Promise<boolean> {
  const active = await getActiveModules(userId);
  return active.has(planType);
}
