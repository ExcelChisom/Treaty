export default function FinancePage() {
  return (
    <main className="flex flex-col min-h-svh bg-slate-50">
      <header className="px-6 pt-12 pb-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "var(--treaty-green-glow)", color: "var(--treaty-green-dark)" }}
        >
          ✅ Always Free
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Finance</h1>
        <p className="text-text-muted text-sm mt-1">Track your campus spending.</p>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4 animate-fade-in">
        {/* Summary cards placeholder */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "This Month", value: "₦0", color: "var(--treaty-green)" },
            { label: "Categories", value: "5", color: "var(--treaty-purple)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{ background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
            >
              <p className="text-xs text-text-muted font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Expense logger placeholder */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="text-4xl mb-2">💸</p>
          <p className="text-text-secondary font-semibold text-sm">No expenses logged yet</p>
          <p className="text-text-muted text-xs mt-1">Full logger coming in Block 3</p>
        </div>
      </div>
    </main>
  );
}
