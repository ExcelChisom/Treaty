"use server";

/**
 * src/app/finance/actions.ts
 *
 * Finance Server Actions
 * Executed server-side, called from FinanceClient.tsx.
 * Uses the Supabase service role client (bypasses RLS).
 * After mutation, revalidates /finance to refresh server data.
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

export type Category = "Food" | "Transport" | "Personal" | "Misc" | "Subs";

export interface AddExpensePayload {
  amount: number;
  category: Category;
  note: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ── Add Expense ─────────────────────────────────────────────────────────────

/**
 * Inserts a new expense row into public.expenses.
 * Called from the FinanceClient form on submit.
 */
export async function addExpense(
  payload: AddExpensePayload
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated." };
  }

  if (!payload.amount || payload.amount <= 0) {
    return { success: false, error: "Amount must be greater than zero." };
  }

  if (payload.amount > 500_000) {
    return { success: false, error: "Amount exceeds the maximum (₦500,000)." };
  }

  try {
    const supabase = await createServiceClient();

    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      amount: Math.round(payload.amount), // Ensure integer
      category: payload.category,
      note: payload.note?.trim() || null,
    });

    if (error) {
      console.error("[addExpense] Supabase error:", error.message);
      return { success: false, error: "Failed to save expense. Try again." };
    }

    // Invalidate the /finance page so the server component re-fetches
    revalidatePath("/finance");
    return { success: true };
  } catch (err) {
    console.error("[addExpense] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
