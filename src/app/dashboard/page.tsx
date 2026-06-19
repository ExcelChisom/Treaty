/**
 * /dashboard  —  Async Server Component
 *
 * Phase B: Live Data Integration
 * - auth()        → Clerk userId for DB queries
 * - currentUser() → firstName for Shreddy greeting
 * - Supabase subscriptions query → dynamic isLocked on ModuleCards
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { getActiveModules } from "@/lib/subscriptions";
import ShreddyGreeting from "@/components/shreddy/ShreddyGreeting";
import ModuleCard from "@/components/ui/ModuleCard";

// ── Subscription check: now delegated to shared lib/subscriptions helper ─────

// ── Mock stat helpers (replaced with live queries in Block 5) ──────────────

function buildStats(totalBudgetLeft: number) {
  return [
    {
      id: "streak",
      label: "Day Streak",
      value: "1",
      unit: "🔥",
      color: "var(--treaty-orange)",
    },
    {
      id: "budget",
      label: "Budget Left",
      value: `₦${totalBudgetLeft.toLocaleString("en-NG")}`,
      unit: "💰",
      color: "var(--treaty-green)",
    },
    {
      id: "calories",
      label: "Calories",
      value: "— / —",
      unit: "🍽️",
      color: "var(--treaty-purple)",
    },
  ];
}

// ── Module definitions ─────────────────────────────────────────────────────

const MODULE_DEFS = [
  {
    key: "finance",
    title: "Finance",
    description: "Track your campus spending",
    icon: "💸",
    href: "/finance",
    accentColor: "var(--treaty-purple)",
    glowColor: "rgba(109, 40, 217, 0.12)",
  },
  {
    key: "food",
    title: "Food Hub",
    description: "CAF 1, CAF 2, CMSS & Buttery",
    icon: "🍽️",
    href: "/food",
    accentColor: "var(--treaty-green)",
    glowColor: "rgba(34, 197, 94, 0.12)",
  },
  {
    key: "fitness",
    title: "Fitness",
    description: "Macros, calories & body goals",
    icon: "💪",
    href: "/fitness",
    accentColor: "var(--treaty-orange)",
    glowColor: "rgba(249, 115, 22, 0.12)",
  },
  {
    key: "schedule",
    title: "Schedule",
    description: "Timetable & task planner",
    icon: "📅",
    href: "/schedule",
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.12)",
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  // Parallel auth + user fetch for performance
  const [{ userId }, user] = await Promise.all([
    auth(),
    currentUser(),
  ]);

  // Derive display name from Clerk user object
  const nickname =
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")?.[0] ||
    "Champ";

  // Check which modules this user has unlocked
  const activeModules = userId
    ? await getActiveModules(userId)
    : new Set<string>(["finance"]);

  const stats = buildStats(5000); // Budget pulled from user settings in Block 5

  return (
    <main className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-6 pb-24 flex flex-col gap-6">



      {/* ── Body ── */}
      <div className="flex flex-col gap-6">

        {/* ── Shreddy Greeting ── */}
        <section aria-label="Shreddy AI Greeting" className="animate-fade-in-up">
          {/* nickname is a live server value from Clerk */}
          <ShreddyGreeting nickname={nickname} />
        </section>

        {/* ── Quick Stats Bar ── */}
        <section aria-label="Quick stats" className="animate-fade-in-up delay-100">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.id}
                id={`stat-${stat.id}`}
                className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2 bg-[#1E293B] border border-[#334155]"
              >
                <span className="text-lg leading-none" aria-hidden="true">{stat.unit}</span>
                <span
                  className="text-white font-semibold text-lg leading-none"
                >
                  {stat.value}
                </span>
                <span className="text-gray-400 text-sm text-center leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Module Grid ── */}
        <section aria-label="Treaty modules" className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-primary">Your Modules</h2>
            <span className="text-xs text-text-muted font-medium">
              {4 - activeModules.size} locked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULE_DEFS.map((mod) => (
              <ModuleCard
                key={mod.key}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                href={mod.href}
                isLocked={!activeModules.has(mod.key)}
                accentColor={mod.accentColor}
                glowColor={mod.glowColor}
              />
            ))}
          </div>
        </section>

        {/* ── Upgrade Banner — hidden if all modules are active ── */}
        {activeModules.size < 4 && (
          <section className="animate-fade-in-up delay-300">
            <div
              className="rounded-3xl p-4 flex items-center gap-4"
              style={{
                background: "linear-gradient(135deg, var(--treaty-purple) 0%, #4f46e5 100%)",
                boxShadow: "var(--shadow-glow-purple)",
              }}
            >
              <div className="text-3xl flex-shrink-0" aria-hidden="true">⚡</div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Unlock All Modules</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Food, Fitness &amp; Schedule — one subscription.
                </p>
              </div>
              <button
                id="dashboard-upgrade-cta"
                type="button"
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                Upgrade
              </button>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
