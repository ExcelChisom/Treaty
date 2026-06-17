export default function LoginPage() {
  return (
    <main className="flex flex-col min-h-svh bg-slate-50 px-6 py-10">
      <div className="flex flex-col items-center gap-2 animate-fade-in-up">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--treaty-purple), var(--treaty-purple-dark))" }}
        >
          <span className="text-white text-xl">🔐</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Welcome Back</h1>
        <p className="text-sm text-text-muted text-center">
          Enter your 4-digit PIN to continue.
        </p>
      </div>

      {/* PIN pad — wired in Block 2 (Task: Step 6) */}
      <div className="flex-1 flex items-center justify-center animate-fade-in delay-200">
        <div
          className="w-full max-w-sm rounded-2xl p-6 text-center"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2"
                style={{ borderColor: "var(--treaty-purple)" }}
              />
            ))}
          </div>
          <p className="text-text-muted text-sm font-medium">
            PIN pad coming in Block 2
          </p>
        </div>
      </div>
    </main>
  );
}
