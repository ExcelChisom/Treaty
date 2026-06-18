/**
 * /finance  —  Async Server Component
 *
 * Phase B: Live Data Integration
 * - Authenticates via Clerk auth()
 * - Fetches today's expenses from public.expenses using the service client
 * - Passes initialExpenses + initialTotal to FinanceClient (Client Component)
 * - FinanceClient handles all interactive UI and calls addExpense() Server Action
 */

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import FinanceClient from "./_components/FinanceClient";
import BottomNav from "@/components/ui/BottomNav";

// ── Server Data Fetch ──────────────────────────────────────────────────────

async function fetchTodaysExpenses(userId: string) {
  const supabase = await createServiceClient();

  // Get today's date range in ISO format (UTC midnight boundaries)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, category, note, logged_at")
    .eq("user_id", userId)
    .gte("logged_at", today.toISOString())
    .lt("logged_at", tomorrow.toISOString())
    .order("logged_at", { ascending: false });

  if (error) {
    // Expenses table may not exist yet (migration not run).
    // Silently return empty state rather than crashing the page.
    console.error("[finance] Supabase fetch error:", error.message);
    return { expenses: [], total: 0 };
  }

  const expenses = data ?? [];
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  return { expenses, total };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function FinancePage() {
  const { userId } = await auth();

  // Fetch live data — gracefully returns empty arrays if table doesn't exist
  const { expenses, total } = userId
    ? await fetchTodaysExpenses(userId)
    : { expenses: [], total: 0 };

  return (
    <main className="flex flex-col min-h-svh bg-slate-50 pb-24">

      {/* ── Header ── */}
      <header
        className="px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)" }}
      >
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">💸</span>
            <h1 className="text-white font-black text-xl tracking-tight">Finance</h1>
          </div>
          <p className="text-white/40 text-xs font-medium">
            Track every kobo, no excuses.
          </p>
        </div>
      </header>

      {/* ── Live Finance UI (Client Component) ── */}
      <FinanceClient
        initialExpenses={expenses}
        initialTotal={total}
      />

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </main>
  );
}
