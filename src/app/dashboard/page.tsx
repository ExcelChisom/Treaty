export default function DashboardPage() {
  return (
    <main className="flex flex-col min-h-svh bg-slate-50">
      {/* Header */}
      <header
        className="px-6 pt-12 pb-6"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}
      >
        <div className="animate-fade-in-up">
          <p className="text-white/50 text-sm font-medium">Good morning 👋</p>
          <h1 className="text-2xl font-bold text-white mt-1">
            Hey, <span style={{ color: "var(--treaty-green)" }}>Champ</span>!
          </h1>
          <p className="text-white/40 text-xs mt-1 font-medium">
            Shreddy is ready to roll 🤖
          </p>
        </div>
      </header>

      {/* Module cards placeholder — wired in Block 2 (Task: Step 9) */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-4 animate-fade-in delay-200">
        {[
          { label: "Finance", emoji: "💸", color: "var(--treaty-purple)", free: true },
          { label: "Food", emoji: "🍽️", color: "var(--treaty-green)", free: false },
          { label: "Fitness", emoji: "💪", color: "var(--treaty-orange)", free: false },
          { label: "Schedule", emoji: "📅", color: "#38bdf8", free: false },
        ].map((mod) => (
          <div
            key={mod.label}
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${mod.color}18` }}
            >
              {mod.emoji}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary text-sm">{mod.label}</p>
              <p className="text-xs text-text-muted">{mod.free ? "Always free" : "Premium"}</p>
            </div>
            {!mod.free && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  background: "var(--treaty-orange-light)",
                  color: "var(--treaty-orange-dark)",
                }}
              >
                🔒 Pro
              </span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
