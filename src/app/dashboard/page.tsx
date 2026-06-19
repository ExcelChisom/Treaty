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
    <main className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 pb-24 flex flex-col gap-6">

      {/* ── App Header ── */}
      <header
        className="flex items-center justify-between p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10"
      >
        <div className="animate-fade-in-up">
          {/* Treaty wordmark */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <path d="M8 12H36M22 12V36" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <path
                  d="M14 26L19 31L30 20"
                  stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-white font-black text-lg tracking-tight">Treaty</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
              style={{
                background: "rgba(34,197,94,0.2)",
                color: "var(--treaty-green)",
              }}
            >
              BETA
            </span>
          </div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
            Dashboard
          </p>
        </div>

        {/* Notification bell */}
        <button
          id="dashboard-notifications"
          type="button"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2C8.13 2 5 5.13 5 9V15L3 17V18H21V17L19 15V9C19 5.13 15.87 2 12 2Z"
              stroke="white" strokeWidth="1.7" strokeLinejoin="round"
            />
            <path
              d="M9.5 21C9.5 22.38 10.62 23.5 12 23.5C13.38 23.5 14.5 22.38 14.5 21"
              stroke="white" strokeWidth="1.5"
            />
          </svg>
        </button>
      </header>

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
                className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2 bg-white/5 backdrop-blur-md border border-white/10"
              >
                <span className="text-lg leading-none" aria-hidden="true">{stat.unit}</span>
                <span
                  className="text-base font-black leading-none"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] text-text-muted font-semibold text-center leading-tight">
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

          <div className="grid grid-cols-2 gap-4">
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
