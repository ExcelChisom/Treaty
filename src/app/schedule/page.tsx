import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/subscriptions";
import ScheduleClient from "./_components/ScheduleClient";
import UpgradeButton from "@/components/ui/UpgradeButton";

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
    <div className="animate-fade-up pt-6">
      {isSubscribed ? (
        <ScheduleDataSection userId={userId!} />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6">
          <div
            className="w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl bg-[#6D5DF6]/10 border-2 border-[#6D5DF6]/20"
          >
            🔒
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-treaty-text-main mb-2">
              Schedule is Premium
            </h2>
            <p className="text-sm text-treaty-text-muted leading-relaxed max-w-xs">
              Manage your CU timetable, track assignment deadlines
              and never miss a class again with smart reminders.
            </p>
          </div>
          <div className="w-full rounded-[24px] p-5 bg-white/70 backdrop-blur-md border border-white/80">
            <p className="text-xs font-bold text-treaty-text-muted mb-3 uppercase tracking-widest">
              What you unlock
            </p>
            {[
              "📝 Assignment & exam tracker",
              "🏫 Class schedule planner",
              "📅 Due date reminders",
              "✅ Task completion tracking",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 py-2 text-treaty-text-main">
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <UpgradeButton defaultPlan="schedule" label="Unlock Schedule" />
        </div>
      )}
    </div>
  );
}

async function ScheduleDataSection({ userId }: { userId: string }) {
  const tasks = await fetchTasks(userId);
  return <ScheduleClient tasks={tasks} />;
}
