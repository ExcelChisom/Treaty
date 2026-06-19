"use client";

/**
 * src/components/ui/UpgradeButton.tsx
 *
 * Paystack inline checkout trigger.
 *
 * IMPORTANT — SSR SAFETY:
 *   @paystack/inline-js evaluates window at module load time and will crash
 *   during SSR. We import it dynamically inside the click handler so it only
 *   executes in the browser. No next/dynamic wrapper needed — the component
 *   itself is already a Client Component; we just defer the import.
 *
 * AMOUNT CALCULATION:
 *   Paystack natively processes NGN in Kobo.
 *   amount_kobo = price_naira × 100  (enforced in PLAN_PRICES below)
 *
 * METADATA:
 *   clerk_user_id and plan_type are passed in metadata so the webhook
 *   can identify which user and plan to activate after charge.success.
 */

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

// ── Plan catalogue ─────────────────────────────────────────────────────────

export type PlanKey = "food" | "fitness" | "schedule" | "bundle";

interface Plan {
  key: PlanKey;
  name: string;
  description: string;
  price_naira: number;
  emoji: string;
  color: string;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    key: "bundle",
    name: "All Modules Bundle",
    description: "Food Hub + Fitness + Schedule — everything unlocked",
    price_naira: 5000,
    emoji: "⚡",
    color: "var(--treaty-purple)",
    badge: "BEST VALUE",
  },
  {
    key: "food",
    name: "Food Hub",
    description: "Campus vendor directory, meal logging & macros",
    price_naira: 2000,
    emoji: "🍽️",
    color: "var(--treaty-green)",
  },
  {
    key: "fitness",
    name: "Fitness",
    description: "Weight tracking, workout logs & body goals",
    price_naira: 2000,
    emoji: "💪",
    color: "var(--treaty-orange)",
  },
  {
    key: "schedule",
    name: "Schedule",
    description: "Timetable planner, task manager & deadlines",
    price_naira: 1500,
    emoji: "📅",
    color: "#38bdf8",
  },
];

// ── Props ──────────────────────────────────────────────────────────────────

interface UpgradeButtonProps {
  /** Pre-select a specific plan. Defaults to showing all options. */
  defaultPlan?: PlanKey;
  /** Override button label */
  label?: string;
  /** Called after successful payment (before webhook confirmation) */
  onSuccess?: (reference: string, planKey: PlanKey) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function UpgradeButton({
  defaultPlan,
  label,
  onSuccess,
}: UpgradeButtonProps) {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(
    defaultPlan ?? "bundle"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const plan = PLANS.find((p) => p.key === selectedPlan)!;

  // ── Paystack checkout ────────────────────────────────────────────────────
  async function handleCheckout() {
    if (!user) return;

    const email =
      user.primaryEmailAddress?.emailAddress ?? `${user.id}@treaty.app`;

    setIsLoading(true);

    try {
      // Dynamic import keeps @paystack/inline-js out of the SSR bundle
      const PaystackPop = (await import("@paystack/inline-js")).default;

      const popup = new PaystackPop();

      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        // CRITICAL: Paystack processes NGN in Kobo — multiply by 100
        amount: plan.price_naira * 100,
        currency: "NGN",
        ref: `treaty_${selectedPlan}_${user.id}_${Date.now()}`,
        label: `Treaty ${plan.name}`,
        metadata: {
          clerk_user_id: user.id,
          plan_name: selectedPlan,      // ← aligned to DB column plan_name
          custom_fields: [
            {
              display_name: "Clerk User ID",
              variable_name: "clerk_user_id",
              value: user.id,
            },
            {
              display_name: "Plan",
              variable_name: "plan_name", // ← webhook reads custom_fields[variable_name === 'plan_name']
              value: selectedPlan,
            },
          ],
        },
        onSuccess(response: { reference: string }) {
          setPaid(true);
          setIsOpen(false);
          setIsLoading(false);
          onSuccess?.(response.reference, selectedPlan);
        },
        onCancel() {
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error("[UpgradeButton] Paystack error:", err);
      setIsLoading(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        id="upgrade-button-trigger"
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, var(--treaty-purple), #4f46e5)",
          boxShadow: "var(--shadow-glow-purple)",
        }}
      >
        <span aria-hidden="true">⚡</span>
        <span>{label ?? "Upgrade to Unlock"}</span>
      </button>

      {/* ── Bottom sheet modal ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl animate-slide-up"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              maxWidth: "448px",
              margin: "0 auto",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "var(--border)" }}
              />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2
                    id="upgrade-modal-title"
                    className="text-lg font-black text-text-primary"
                  >
                    Choose a Plan
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    All plans renew monthly. Cancel anytime.
                  </p>
                </div>
                <button
                  id="upgrade-modal-close"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted transition-all active:scale-90"
                  style={{ background: "var(--surface-alt)" }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Plan options */}
              <div className="flex flex-col gap-3 mb-5">
                {PLANS.map((p) => (
                  <button
                    key={p.key}
                    id={`upgrade-plan-${p.key}`}
                    type="button"
                    onClick={() => setSelectedPlan(p.key)}
                    className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200 active:scale-98"
                    style={{
                      background:
                        selectedPlan === p.key
                          ? "rgba(124,58,237,0.1)"
                          : "var(--surface-alt)",
                      border: `2px solid ${
                        selectedPlan === p.key
                          ? "var(--treaty-purple)"
                          : "var(--border)"
                      }`,
                    }}
                    aria-pressed={selectedPlan === p.key}
                  >
                    <span className="text-2xl mt-0.5 flex-shrink-0" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-text-primary">
                          {p.name}
                        </span>
                        {p.badge && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                            style={{
                              background: "rgba(124,58,237,0.15)",
                              color: "var(--treaty-purple)",
                            }}
                          >
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-black" style={{ color: p.color }}>
                        ₦{p.price_naira.toLocaleString("en-NG")}
                      </p>
                      <p className="text-[10px] text-text-muted">/month</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Checkout button */}
              {paid ? (
                <div
                  className="w-full py-4 rounded-2xl text-center font-bold text-sm"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "var(--treaty-green)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  ✅ Payment received! Your plan activates shortly.
                </div>
              ) : (
                <button
                  id="upgrade-checkout-submit"
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--treaty-purple), #4f46e5)",
                    boxShadow: "var(--shadow-glow-purple)",
                  }}
                >
                  {isLoading
                    ? "Opening Paystack..."
                    : `Pay ₦${plan.price_naira.toLocaleString("en-NG")} — ${plan.name}`}
                </button>
              )}

              <p className="text-center text-[10px] text-text-muted mt-3">
                🔒 Secured by Paystack · NGN only
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
