import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import FinanceClient from "./_components/FinanceClient";

async function fetchTodaysExpenses(userId: string) {
  const supabase = await createServiceClient();

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
    console.error("[finance] Supabase fetch error:", error.message);
    return { expenses: [], total: 0 };
  }

  const expenses = data ?? [];
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  return { expenses, total };
}

export default async function FinancePage() {
  const { userId } = await auth();

  const { expenses, total } = userId
    ? await fetchTodaysExpenses(userId)
    : { expenses: [], total: 0 };

  return (
    <div className="animate-fade-up pt-6">
      <FinanceClient
        initialExpenses={expenses}
        initialTotal={total}
      />
    </div>
  );
}
