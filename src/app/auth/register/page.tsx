export default function RegisterPage() {
  return (
    <main className="flex flex-col min-h-svh bg-slate-50 px-6 py-10">
      <div className="flex flex-col items-center gap-2 animate-fade-in-up">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))" }}
        >
          <span className="text-white text-xl">✍️</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Create Account</h1>
        <p className="text-sm text-text-muted text-center">
          Register your Treaty profile to get started.
        </p>
      </div>

      {/* Multi-step registration form — wired in Block 2 (Task: Step 6) */}
      <div className="flex-1 flex items-center justify-center animate-fade-in delay-200">
        <div
          className="w-full max-w-sm rounded-2xl p-6 text-center"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}
        >
          <p className="text-text-muted text-sm font-medium">
            Registration flow coming in Block 2
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full w-1/3 gradient-green"
              aria-label="Step 1 of 3"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
