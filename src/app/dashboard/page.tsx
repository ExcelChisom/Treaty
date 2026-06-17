import ShreddyGreeting from "@/components/shreddy/ShreddyGreeting";
import ModuleCard from "@/components/ui/ModuleCard";
import BottomNav from "@/components/ui/BottomNav";

// ── Mock data — replaced with real Supabase data in Block 4 ───────────────

const MOCK_STATS = [
  {
    id: "streak",
    label: "Day Streak",
    value: "1",
    unit: "🔥",
    color: "var(--treaty-orange)",
    bg: "var(--treaty-orange-glow)",
  },
  {
    id: "budget",
    label: "Budget Left",
    value: "₦5,000",
    unit: "💰",
    color: "var(--treaty-green)",
    bg: "var(--treaty-green-glow)",
  },
  {
    id: "calories",
    label: "Calories",
    value: "1,200",
    unit: "🍽️",
    color: "var(--treaty-purple)",
    bg: "var(--treaty-purple-glow)",
  },
];

const MODULE_CARDS = [
  {
    title: "Finance",
    description: "Track your campus spending",
    icon: "💸",
    href: "/finance",
    isLocked: false,
    accentColor: "var(--treaty-purple)",
    glowColor: "rgba(109, 40, 217, 0.12)",
  },
  {
    title: "Food Hub",
    description: "CAF 1, CAF 2, CMSS & Buttery",
    icon: "🍽️",
    href: "/food",
    isLocked: true,
    accentColor: "var(--treaty-green)",
    glowColor: "rgba(34, 197, 94, 0.12)",
  },
  {
    title: "Fitness",
    description: "Macros, calories & body goals",
    icon: "💪",
    href: "/fitness",
    isLocked: true,
    accentColor: "var(--treaty-orange)",
    glowColor: "rgba(249, 115, 22, 0.12)",
  },
  {
    title: "Schedule",
    description: "Timetable & task planner",
    icon: "📅",
    href: "/schedule",
    isLocked: true,
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.12)",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <main className="flex flex-col min-h-svh bg-slate-50 pb-24">

      {/* ── App Header ── */}
      <header
        className="px-5 pt-12 pb-6 flex items-center justify-between"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}
      >
        <div className="animate-fade-in-up">
          {/* Treaty wordmark */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <path d="M8 12H36M22 12V36" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <path d="M14 26L19 31L30 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white font-black text-lg tracking-tight">Treaty</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
              style={{ background: "rgba(34,197,94,0.2)", color: "var(--treaty-green)" }}
            >
              BETA
            </span>
          </div>

          {/* Greeting text */}
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
            Dashboard
          </p>
        </div>

        {/* Notification bell stub */}
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
              stroke="white" strokeWidth="1.7" strokeLinejoin="round" fill="none"
            />
            <path d="M9.5 21C9.5 22.38 10.62 23.5 12 23.5C13.38 23.5 14.5 22.38 14.5 21"
              stroke="white" strokeWidth="1.5"
            />
          </svg>
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-col gap-5 px-4 pt-5">

        {/* ── Shreddy Greeting ── */}
        <section aria-label="Shreddy AI Greeting" className="animate-fade-in-up">
          <ShreddyGreeting nickname="Champ" />
        </section>

        {/* ── Quick Stats Bar ── */}
        <section aria-label="Quick stats" className="animate-fade-in-up delay-100">
          <div className="grid grid-cols-3 gap-3">
            {MOCK_STATS.map((stat) => (
              <div
                key={stat.id}
                id={`stat-${stat.id}`}
                className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2"
                style={{
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {stat.unit}
                </span>
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
              3 locked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {MODULE_CARDS.map((card) => (
              <ModuleCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        {/* ── Upgrade Banner ── */}
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

      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </main>
  );
}
