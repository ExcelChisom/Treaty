import Link from "next/link";

export default function SchedulePage() {
  return (
    <main className="flex flex-col min-h-svh items-center justify-center px-6 bg-slate-50">
      <div className="flex flex-col items-center gap-4 animate-scale-in text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: "rgba(56, 189, 248, 0.1)" }}
        >
          📅
        </div>
        <div>
          <div
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: "rgba(56, 189, 248, 0.12)", color: "#0369a1" }}
          >
            🔒 Premium Feature
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Smart Schedule</h1>
          <p className="text-text-muted text-sm mt-2 max-w-xs">
            Daily &amp; weekly timetable planning with Telegram parsing hooks — import your class schedule instantly.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #38bdf8, #0369a1)" }}
        >
          Upgrade to Premium
        </Link>
      </div>
    </main>
  );
}
