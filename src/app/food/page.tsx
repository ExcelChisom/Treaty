import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/subscriptions";
import FoodClient from "./_components/FoodClient";
import UpgradeButton from "@/components/ui/UpgradeButton";

const CALORIE_TARGET = 2000;

async function fetchFoodData(userId: string) {
  const supabase = await createServiceClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [foodsResult, logsResult] = await Promise.all([
    supabase
      .from("foods")
      .select("id, name, vendor, calories, protein_g, carbs_g, fat_g, price_naira")
      .eq("is_active", true)
      .order("vendor")
      .order("name"),
    supabase
      .from("meal_logs")
      .select("id, name, meal_type, calories, logged_at")
      .eq("user_id", userId)
      .gte("logged_at", today.toISOString())
      .lt("logged_at", tomorrow.toISOString())
      .order("logged_at", { ascending: false }),
  ]);

  const foods = foodsResult.data ?? [];
  const logs = logsResult.data ?? [];
  const totalCalories = logs.reduce((s, l) => s + (l.calories ?? 0), 0);

  return { foods, logs, totalCalories };
}

export default async function FoodPage() {
  const { userId } = await auth();
  const isSubscribed = userId ? await hasAccess(userId, "food") : false;

  return (
    <main className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 pb-24 flex flex-col gap-6">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10"
      >
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">🍽️</span>
            <h1 className="text-white font-black text-xl tracking-tight">Food Hub</h1>
          </div>
          <p className="text-white/40 text-xs font-medium">
            CAF 1 · CAF 2 · CMSS · Buttery
          </p>
        </div>
      </header>

      {isSubscribed ? (
        // ── Active subscriber: full module ──
        (() => {
          // We need to fetch data — this IIFE wraps async in sync JSX
          // Pattern: data is fetched below via a separate async wrapper
          return null; // placeholder replaced by FoodDataLoader
        })()
      ) : (
        // ── Not subscribed: locked gate ──
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6 animate-fade-in-up">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.2)" }}
            aria-hidden="true"
          >
            🔒
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-text-primary mb-2">
              Food Hub is Premium
            </h2>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Unlock the full Covenant University campus menu — CAF 1, CAF 2, CMSS &
              Buttery — with calorie tracking and macro logging.
            </p>
          </div>
          <div
            className="w-full rounded-3xl p-5 bg-white/5 backdrop-blur-md border border-white/10"
          >
            <p className="text-xs font-bold text-text-muted mb-3 uppercase tracking-widest">
              What you unlock
            </p>
            {[
              "🏫 Full campus vendor directory",
              "📊 Calorie & macro tracking",
              "🍱 Meal log with history",
              "💡 Smart daily targets",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 py-2">
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <UpgradeButton defaultPlan="food" label="Unlock Food Hub" />
        </div>
      )}

      {/* Async data loaded separately when subscribed */}
      {isSubscribed && <FoodDataSection userId={userId!} />}

    </main>
  );
}

// ── Async data section (only rendered when subscribed) ─────────────────────
async function FoodDataSection({ userId }: { userId: string }) {
  const { foods, logs, totalCalories } = await fetchFoodData(userId);

  return (
    <FoodClient
      foods={foods}
      todayLogs={logs}
      totalCalories={totalCalories}
      calorieTarget={CALORIE_TARGET}
    />
  );
}
