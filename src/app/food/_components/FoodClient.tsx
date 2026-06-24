"use client";

import { useState, useTransition, useMemo } from "react";
import { logMeal, type MealType } from "../actions";
import { type Food } from "@/types/database";

// ── Types ──────────────────────────────────────────────────────────────────

interface MealLog {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  logged_at: string;
}

interface FoodClientProps {
  foods: Food[];
  todayLogs: MealLog[];
  totalCalories: number;
  calorieTarget: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const VENDORS = ["All", "CAF 1", "CAF 2", "CMSS", "Buttery"] as const;

const MEAL_TYPES: { key: MealType; label: string; emoji: string }[] = [
  { key: "breakfast", label: "Breakfast", emoji: "🌅" },
  { key: "lunch",    label: "Lunch",     emoji: "☀️" },
  { key: "dinner",   label: "Dinner",    emoji: "🌙" },
  { key: "snack",    label: "Snack",     emoji: "🍪" },
];

const VENDOR_COLORS: Record<string, string> = {
  "CAF 1":   "var(--treaty-green)",
  "CAF 2":   "var(--treaty-purple)",
  "CMSS":    "var(--treaty-orange)",
  "Buttery": "#38bdf8",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main Client Component ──────────────────────────────────────────────────

export default function FoodClient({
  foods,
  todayLogs,
  totalCalories,
  calorieTarget,
}: FoodClientProps) {
  const [isPending, startTransition] = useTransition();
  const [activeVendor, setActiveVendor] = useState<string>("All");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [showLog, setShowLog] = useState(false);
  const [optimisticLogs, setOptimisticLogs] = useState<MealLog[]>([]);
  const [optimisticCals, setOptimisticCals] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const filteredFoods = useMemo(
    () =>
      activeVendor === "All"
        ? foods
        : foods.filter((f) => f.vendor === activeVendor),
    [foods, activeVendor]
  );

  const allLogs = [...optimisticLogs, ...todayLogs];
  const displayCalories = totalCalories + optimisticCals;
  const calPct = Math.min((displayCalories / calorieTarget) * 100, 100);

  function handleSelectFood(food: Food) {
    setSelectedFood(food);
    setShowLog(true);
    setError("");
  }

  function handleLog() {
    if (!selectedFood) return;

    const optimistic: MealLog = {
      id: `opt-${Date.now()}`,
      name: selectedFood.name,
      meal_type: selectedMealType,
      calories: selectedFood.calories,
      logged_at: new Date().toISOString(),
    };
    setOptimisticLogs((p) => [optimistic, ...p]);
    setOptimisticCals((p) => p + selectedFood.calories);
    setShowLog(false);
    setSelectedFood(null);

    startTransition(async () => {
      const result = await logMeal({
        food_id: selectedFood.id,
        name: selectedFood.name,
        meal_type: selectedMealType,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fats: selectedFood.fats,
      });

      if (!result.success) {
        setOptimisticLogs((p) => p.filter((l) => l.id !== optimistic.id));
        setOptimisticCals((p) => p - selectedFood.calories);
        setError(result.error ?? "Failed to log meal.");
      } else {
        setSuccessMsg(`${selectedFood.name} logged! ✅`);
        setOptimisticCals(0); // revalidatePath will refresh server data
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">

      {/* ── Calorie ring card ── */}
      <section
        className="rounded-3xl p-5 animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #166534 100%)",
          boxShadow: "var(--shadow-glow-green)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
              Calories Today
            </p>
            <p
              className="text-3xl font-black text-white"
              aria-live="polite"
              aria-label={`${displayCalories} of ${calorieTarget} calories`}
            >
              {displayCalories.toLocaleString()}
              <span className="text-base font-semibold text-white/40">
                /{calorieTarget.toLocaleString()} kcal
              </span>
            </p>
            <div
              className="mt-3 h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.15)", width: "160px" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${calPct}%`,
                  background:
                    calPct >= 100 ? "#ef4444" : "var(--treaty-green)",
                }}
                role="progressbar"
                aria-valuenow={displayCalories}
                aria-valuemin={0}
                aria-valuemax={calorieTarget}
              />
            </div>
          </div>
          <div className="text-5xl" aria-hidden="true">🍽️</div>
        </div>
      </section>

      {/* ── Success / Error toasts ── */}
      {successMsg && (
        <div
          className="rounded-2xl px-4 py-3 text-sm font-bold text-center animate-scale-in"
          style={{
            background: "rgba(34,197,94,0.1)",
            color: "var(--treaty-green-dark)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
          role="status"
        >
          {successMsg}
        </div>
      )}
      {error && (
        <p className="text-center text-sm font-semibold" style={{ color: "var(--treaty-orange)" }}>
          ⚠️ {error}
        </p>
      )}

      {/* ── Vendor filter chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by vendor">
        {VENDORS.map((v) => (
          <button
            key={v}
            id={`food-vendor-${v.toLowerCase().replace(" ", "-")}`}
            type="button"
            onClick={() => setActiveVendor(v)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
            style={{
              background:
                activeVendor === v
                  ? "var(--treaty-green)"
                  : "var(--surface-alt)",
              color: activeVendor === v ? "white" : "var(--text-muted)",
              border: `1.5px solid ${
                activeVendor === v ? "var(--treaty-green)" : "var(--border)"
              }`,
            }}
            aria-pressed={activeVendor === v}
          >
            {v}
          </button>
        ))}
      </div>

      {/* ── Food cards grid ── */}
      <section aria-label="Campus menu items">
        <div className="grid grid-cols-2 gap-3">
          {filteredFoods.map((food) => (
            <button
              key={food.id}
              id={`food-item-${food.id}`}
              type="button"
              onClick={() => handleSelectFood(food)}
              disabled={isPending}
              className="flex flex-col gap-2 p-4 rounded-2xl text-left transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="text-[10px] font-bold px-2 py-0.5 rounded-md self-start"
                style={{
                  background: `${VENDOR_COLORS[food.vendor] ?? "#666"}22`,
                  color: VENDOR_COLORS[food.vendor] ?? "#666",
                }}
              >
                {food.vendor}
              </div>
              <p className="text-xs font-bold text-text-primary leading-tight">
                {food.name}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-text-muted font-medium">
                  {food.calories} kcal
                </span>
                <span
                  className="text-xs font-black"
                  style={{ color: "var(--treaty-green)" }}
                >
                  ₦{food.price?.toLocaleString("en-NG")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Log Meal sheet ── */}
      {showLog && selectedFood && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-[#0F172A]/95"
            onClick={() => setShowLog(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-meal-title"
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{
              background: "var(--surface)",
              maxWidth: "448px",
              margin: "0 auto",
            }}
          >
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
            </div>
            <div className="px-5 pb-8 pt-2">
              <h3 id="log-meal-title" className="font-black text-base text-text-primary mb-1">
                Log Meal
              </h3>
              <p className="text-text-muted text-xs mb-4">
                {selectedFood.name} · {selectedFood.calories} kcal
              </p>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Protein", value: selectedFood.protein, unit: "g", color: "#38bdf8" },
                  { label: "Carbs",   value: selectedFood.carbs,   unit: "g", color: "var(--treaty-orange)" },
                  { label: "Fat",     value: selectedFood.fats,     unit: "g", color: "var(--treaty-purple)" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex flex-col items-center py-2 rounded-xl"
                    style={{ background: "var(--surface-alt)" }}
                  >
                    <span className="text-sm font-black" style={{ color: m.color }}>
                      {m.value}{m.unit}
                    </span>
                    <span className="text-[10px] text-text-muted">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Meal type */}
              <p className="text-xs font-semibold text-text-muted mb-2">Meal Type</p>
              <div className="flex gap-2 mb-5">
                {MEAL_TYPES.map((mt) => (
                  <button
                    key={mt.key}
                    id={`food-meal-type-${mt.key}`}
                    type="button"
                    onClick={() => setSelectedMealType(mt.key)}
                    className="flex-1 flex flex-col items-center py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                    style={{
                      background:
                        selectedMealType === mt.key
                          ? "rgba(34,197,94,0.12)"
                          : "var(--surface-alt)",
                      border: `1.5px solid ${
                        selectedMealType === mt.key
                          ? "var(--treaty-green)"
                          : "var(--border)"
                      }`,
                      color:
                        selectedMealType === mt.key
                          ? "var(--treaty-green)"
                          : "var(--text-muted)",
                    }}
                    aria-pressed={selectedMealType === mt.key}
                  >
                    <span aria-hidden="true">{mt.emoji}</span>
                    <span>{mt.label}</span>
                  </button>
                ))}
              </div>

              <button
                id="food-log-submit"
                type="button"
                onClick={handleLog}
                disabled={isPending}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
                  boxShadow: "var(--shadow-glow-green)",
                }}
              >
                {isPending ? "Logging..." : `Log ${selectedFood.name}`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Today's meal log ── */}
      <section aria-label="Today's meal log">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text-primary">Today's Meals</h2>
          <span className="text-xs text-text-muted">{allLogs.length} logged</span>
        </div>
        {allLogs.length === 0 ? (
          <div
            className="flex flex-col items-center py-8 rounded-3xl gap-2"
            style={{ background: "var(--surface)", border: "1.5px dashed var(--border)" }}
          >
            <span className="text-4xl" aria-hidden="true">🍽️</span>
            <p className="text-sm font-bold text-text-primary">No meals logged yet</p>
            <p className="text-xs text-text-muted">Tap any food card above to log</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "rgba(34,197,94,0.1)" }}
                  aria-hidden="true"
                >
                  {MEAL_TYPES.find((m) => m.key === log.meal_type)?.emoji ?? "🍽️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{log.name}</p>
                  <p className="text-[10px] text-text-muted capitalize">
                    {log.meal_type} · {formatTime(log.logged_at)}
                  </p>
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--treaty-green)" }}>
                  {log.calories} kcal
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
