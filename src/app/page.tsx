import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="relative flex flex-col min-h-svh overflow-hidden">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Decorative orbs */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 animate-spin-slow"
        style={{
          background:
            "radial-gradient(circle, var(--treaty-green) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15 animate-spin-slow"
        style={{
          background:
            "radial-gradient(circle, var(--treaty-purple) 0%, transparent 70%)",
          animationDirection: "reverse",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
        style={{
          background:
            "radial-gradient(circle, var(--treaty-green) 0%, transparent 60%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-between flex-1 px-6 py-12">

        {/* Top: Logo + Wordmark */}
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          {/* Logo mark */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse-glow"
            style={{
              background:
                "linear-gradient(135deg, var(--treaty-green) 0%, var(--treaty-green-dark) 100%)",
              boxShadow: "var(--shadow-glow-green)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Treaty Logo"
            >
              {/* Stylized "T" with a checkmark stroke */}
              <path
                d="M8 12H36M22 12V36"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M14 26L19 31L30 20"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <div className="text-center">
            <h1
              className="text-5xl font-black tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, var(--treaty-green-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Treaty
            </h1>
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-white/40 mt-1">
              Student Lifestyle OS
            </p>
          </div>
        </div>

        {/* Middle: Feature highlights */}
        <div className="flex flex-col items-center gap-6 w-full animate-fade-in-up delay-200">
          <p className="text-center text-white/70 text-base font-medium leading-relaxed max-w-xs">
            Your all-in-one campus companion for{" "}
            <span className="text-treaty-green font-semibold">Food</span>,{" "}
            <span className="text-treaty-purple-light font-semibold">Finance</span>,{" "}
            <span className="text-treaty-orange-light font-semibold">Fitness</span>{" "}
            &amp; Schedule — powered by Shreddy AI.
          </p>

          {/* Feature pill badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "🍽️ Food", color: "var(--treaty-green)" },
              { label: "💸 Finance", color: "var(--treaty-purple-light)" },
              { label: "💪 Fitness", color: "var(--treaty-orange)" },
              { label: "📅 Schedule", color: "#38bdf8" },
              { label: "🤖 Shreddy AI", color: "#f472b6" },
            ].map((pill) => (
              <span
                key={pill.label}
                className="px-3 py-1 rounded-full text-xs font-semibold glass-dark"
                style={{ color: pill.color, border: `1px solid ${pill.color}30` }}
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom: CTAs */}
        <div className="flex flex-col gap-3 w-full animate-fade-in-up delay-400">
          {/* Primary CTA */}
          <Link
            href="/auth/register"
            id="cta-get-started"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, var(--treaty-green) 0%, var(--treaty-green-dark) 100%)",
              boxShadow: "var(--shadow-glow-green)",
            }}
          >
            <span>Get Started</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/auth/login"
            id="cta-login"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base text-white/80 transition-all duration-200 active:scale-95 glass-dark"
          >
            I already have an account
          </Link>

          {/* Footer note */}
          <p className="text-center text-white/30 text-xs font-medium mt-2">
            Built for Covenant University 🎓
          </p>
        </div>
      </div>
    </main>
  );
}
