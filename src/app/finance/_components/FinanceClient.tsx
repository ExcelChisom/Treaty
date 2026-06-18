"use client";

import { useState, useTransition, useMemo } from "react";
import { addExpense, type Category } from "../actions";

// ── Types ──────────────────────────────────────────────────────────────────

interface Expense {
  id: string;
  amount: number;
  category: Category;
  note: string | null;
  logged_at: string;
}

interface FinanceClientProps {
  /** Today's expenses from the server — starts with DB data, client appends optimistically. */
  initialExpenses: Expense[];
  /** Sum of today's expenses pre-computed on server. */
  initialTotal: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES: {
  name: Category;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  { name: "Food",      emoji: "🍔", color: "#16a34a", bg: "rgba(34,197,94,0.12)"   },
  { name: "Transport", emoji: "🚌", color: "#2563eb", bg: "rgba(37,99,235,0.1)"    },
  { name: "Personal",  emoji: "👤", color: "#7c3aed", bg: "rgba(124,58,237,0.1)"   },
  { name: "Misc",      emoji: "🎲", color: "#d97706", bg: "rgba(217,119,6,0.1)"    },
  { name: "Subs",      emoji: "📱", color: "#db2777", bg: "rgba(219,39,119,0.1)"   },
];

const DAILY_BUDGET = 5000;

const NUMPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCat(name: Category) {
  return CATEGORIES.find((c) => c.name === name)!;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BudgetRing({ spent, budget }: { spent: number; budget: number }) {
  const pct = Math.min((spent / budget) * 100, 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f97316" : "var(--treaty-green)";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white leading-none">{Math.round(pct)}%</span>
        <span className="text-[9px] text-white/50 font-semibold mt-0.5">used</span>
      </div>
    </div>
  );
}

function TransactionRow({ expense }: { expense: Expense }) {
  const cat = getCat(expense.category);
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-95"
      style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: cat.bg }}
        aria-hidden="true"
      >
        {cat.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary truncate">
          {expense.note || expense.category}
        </p>
        <p className="text-xs text-text-muted">{formatTime(expense.logged_at)}</p>
      </div>
      <span className="text-sm font-black flex-shrink-0" style={{ color: "#ef4444" }}>
        -{formatNaira(expense.amount)}
      </span>
    </div>
  );
}

// ── Main Client Component ──────────────────────────────────────────────────

export default function FinanceClient({
  initialExpenses,
  initialTotal,
}: FinanceClientProps) {
  const [isPending, startTransition] = useTransition();

  // Optimistic local state (server revalidation provides the source of truth)
  const [optimisticExpenses, setOptimisticExpenses] = useState<Expense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Food");
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [addError, setAddError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  // Merge: optimistic rows appear above server rows; deduped by id
  const allExpenses = useMemo(
    () => [...optimisticExpenses, ...initialExpenses],
    [optimisticExpenses, initialExpenses]
  );

  const optimisticTotal = useMemo(
    () => optimisticExpenses.reduce((s, e) => s + e.amount, 0),
    [optimisticExpenses]
  );
  const totalSpent = initialTotal + optimisticTotal;
  const budgetLeft = Math.max(DAILY_BUDGET - totalSpent, 0);

  // ── Numpad handler ──────────────────────────────────────────────────────
  function handleAmountKey(key: string) {
    if (key === "⌫") { setAmountInput((p) => p.slice(0, -1)); return; }
    if (key === "." && amountInput.includes(".")) return;
    if (amountInput.length >= 9) return;
    setAmountInput((p) => p + key);
  }

  // ── Submit handler ──────────────────────────────────────────────────────
  function handleAddExpense() {
    const amount = parseFloat(amountInput);
    if (!amountInput || isNaN(amount) || amount <= 0) {
      setAddError("Enter a valid amount.");
      return;
    }
    if (amount > 500_000) {
      setAddError("Amount exceeds the maximum (₦500,000).");
      return;
    }

    setAddError("");

    // Optimistic update — show immediately before server responds
    const optimisticRow: Expense = {
      id: `opt-${Date.now()}`,
      amount: Math.round(amount),
      category: selectedCategory,
      note: noteInput.trim() || null,
      logged_at: new Date().toISOString(),
    };
    setOptimisticExpenses((prev) => [optimisticRow, ...prev]);

    // Reset form
    setAmountInput("");
    setNoteInput("");
    setShowAddForm(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);

    startTransition(async () => {
      const result = await addExpense({
        amount: Math.round(amount),
        category: selectedCategory,
        note: noteInput.trim(),
      });

      if (!result.success) {
        // Roll back the optimistic row
        setOptimisticExpenses((prev) =>
          prev.filter((e) => e.id !== optimisticRow.id)
        );
        setAddError(result.error ?? "Failed to save expense.");
        setShowAddForm(true);
      }
      // On success, revalidatePath triggers server re-render with
      // fresh initialExpenses, so we clear the optimistic entry.
      else {
        setOptimisticExpenses((prev) =>
          prev.filter((e) => e.id !== optimisticRow.id)
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">

      {/* ── Summary Card ── */}
      <section
        className="rounded-3xl p-5 animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
          boxShadow: "var(--shadow-glow-purple)",
        }}
        aria-label="Today's spending summary"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
                Total Spent Today
              </p>
              <p
                id="finance-total-spent"
                className="text-3xl font-black text-white leading-none"
                aria-live="polite"
                aria-label={`Total spent today: ${formatNaira(totalSpent)}`}
              >
                {formatNaira(totalSpent)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
                <p className="text-white/60 text-xs font-medium">
                  Budget left:{" "}
                  <span className="text-green-400 font-bold">{formatNaira(budgetLeft)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/30" aria-hidden="true" />
                <p className="text-white/60 text-xs font-medium">
                  Daily limit:{" "}
                  <span className="text-white/80 font-bold">{formatNaira(DAILY_BUDGET)}</span>
                </p>
              </div>
            </div>
          </div>
          <BudgetRing spent={totalSpent} budget={DAILY_BUDGET} />
        </div>
      </section>

      {/* ── Success toast ── */}
      {justAdded && (
        <div
          className="rounded-2xl px-4 py-3 text-sm font-bold text-center animate-scale-in"
          style={{
            background: "var(--treaty-green-glow)",
            color: "var(--treaty-green-dark)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
          role="status"
          aria-live="polite"
        >
          ✅ Expense saved!
        </div>
      )}

      {/* ── Add Expense button (collapsed) ── */}
      {!showAddForm && (
        <button
          id="finance-open-add-form"
          type="button"
          onClick={() => setShowAddForm(true)}
          disabled={isPending}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 animate-fade-in disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: "var(--shadow-glow-purple)",
          }}
        >
          {isPending ? "Saving..." : "+ Log Expense"}
        </button>
      )}

      {/* ── Add Expense form (expanded) ── */}
      {showAddForm && (
        <section
          className="rounded-3xl overflow-hidden animate-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-md)",
          }}
          aria-label="Add expense form"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <p className="font-bold text-text-primary text-base">Log Expense</p>
            <button
              id="finance-close-form"
              type="button"
              onClick={() => { setShowAddForm(false); setAddError(""); setAmountInput(""); }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted transition-all active:scale-90"
              style={{ background: "var(--surface-alt)" }}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          {/* Amount display */}
          <div className="flex items-center justify-center py-2">
            <p
              className="text-4xl font-black text-text-primary tracking-tight"
              aria-live="polite"
              aria-label={`Amount: ₦${amountInput || "0"}`}
            >
              <span className="text-text-muted">₦</span>
              {amountInput || "0"}
            </p>
          </div>

          {/* Error */}
          {addError && (
            <p className="text-center text-xs font-semibold mx-4 mb-1" style={{ color: "var(--treaty-orange)" }}>
              ⚠️ {addError}
            </p>
          )}

          {/* Numpad */}
          <div className="flex flex-col gap-2 px-4 py-2">
            {NUMPAD_KEYS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-2">
                {row.map((key) => (
                  <button
                    key={key}
                    id={`finance-numpad-${key === "⌫" ? "backspace" : key === "." ? "decimal" : key}`}
                    type="button"
                    onClick={() => { handleAmountKey(key); if (addError) setAddError(""); }}
                    className="h-12 rounded-2xl text-base font-bold transition-all duration-100 active:scale-90"
                    style={{
                      background: "var(--surface-alt)",
                      color: key === "⌫" ? "var(--text-muted)" : "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                    aria-label={key === "⌫" ? "Delete" : key}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Category chips */}
          <div className="px-4 pt-2">
            <p className="text-xs font-semibold text-text-muted mb-2">Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  id={`finance-category-${cat.name.toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95"
                  style={{
                    background: selectedCategory === cat.name ? cat.bg : "var(--surface-alt)",
                    border: `1.5px solid ${selectedCategory === cat.name ? cat.color : "var(--border)"}`,
                    color: selectedCategory === cat.name ? cat.color : "var(--text-muted)",
                  }}
                  aria-pressed={selectedCategory === cat.name}
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="px-4 pt-3">
            <input
              id="finance-note-input"
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add a note (optional)..."
              maxLength={60}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--surface-alt)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Submit */}
          <div className="px-4 py-4">
            <button
              id="finance-add-submit"
              type="button"
              onClick={handleAddExpense}
              disabled={!amountInput || isPending}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: amountInput ? "var(--shadow-glow-purple)" : "none",
              }}
            >
              {isPending
                ? "Saving..."
                : `Add ${amountInput ? formatNaira(parseFloat(amountInput) || 0) : ""} Expense`}
            </button>
          </div>
        </section>
      )}

      {/* ── Transaction List ── */}
      <section aria-label="Today's transactions">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text-primary">Today's Expenses</h2>
          {allExpenses.length > 0 && (
            <span className="text-xs text-text-muted font-medium">
              {allExpenses.length} {allExpenses.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {allExpenses.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-3xl gap-3"
            style={{ background: "var(--surface)", border: "1.5px dashed var(--border)" }}
          >
            <span className="text-5xl" aria-hidden="true">💰</span>
            <div className="text-center">
              <p className="text-sm font-bold text-text-primary">No expenses yet</p>
              <p className="text-xs text-text-muted mt-1">Log your first transaction above</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allExpenses.map((expense) => (
              <TransactionRow key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
