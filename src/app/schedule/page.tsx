import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/subscriptions";
import ScheduleClient from "./_components/ScheduleClient";
import UpgradeButton from "@/components/ui/UpgradeButton";
import BottomNav from "@/components/ui/BottomNav";

async function fetchTasks(userId: string) {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("tasks")
    .select(
      "id, title, course_code, task_type, priority, due_date, due_time, is_completed"
    )
    .eq("user_id", userId)
    .order("is_completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(50);

  return data ?? [];
}

export default async function SchedulePage() {
  const { userId } = await auth();
  const isSubscribed = userId ? await hasAccess(userId, "schedule") : false;

  return (
    <main className="flex flex-col min-h-svh pb-24">
      {/* ── Header ── */}
      <header
        className="px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(160deg, #0c4a6e 0%, #075985 100%)" }}
      >
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">📅</span>
            <h1 className="text-white font-black text-xl tracking-tight">Schedule</h1>
          </div>
          <p className="text-white/40 text-xs font-medium">
            Tasks · Classes · Deadlines
          </p>
        </div>
      </header>

      {isSubscribed ? (
        <ScheduleDataSection userId={userId!} />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6 animate-fade-in-up">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: "rgba(56,189,248,0.1)", border: "2px solid rgba(56,189,248,0.2)" }}
            aria-hidden="true"
          >
            🔒
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-text-primary mb-2">
              Schedule is Premium
            </h2>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Manage your CU timetable, track assignment deadlines
              and never miss a class again with smart reminders.
            </p>
          </div>
          <div
            className="w-full rounded-3xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
          >
            <p className="text-xs font-bold text-text-muted mb-3 uppercase tracking-widest">
              What you unlock
            </p>
            {[
              "📝 Assignment & exam tracker",
              "🏫 Class schedule planner",
              "📅 Due date reminders",
              "✅ Task completion tracking",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 py-2">
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <UpgradeButton defaultPlan="schedule" label="Unlock Schedule" />
        </div>
      )}

      <BottomNav />
    </main>
  );
}

async function ScheduleDataSection({ userId }: { userId: string }) {
  const tasks = await fetchTasks(userId);
  return <ScheduleClient tasks={tasks} />;
}
