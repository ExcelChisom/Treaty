import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/subscriptions";
import FitnessClient from "./_components/FitnessClient";
import UpgradeButton from "@/components/ui/UpgradeButton";

const GOAL_WEIGHT_KG = 70; // Default — will be pulled from user profile in Block 6

async function fetchFitnessData(userId: string) {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("fitness_logs")
    .select("id, log_type, weight_kg, steps, duration_min, activity, notes, logged_at")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(20);

  const logs = data ?? [];

  // Latest weight entry — optional chain safely
  const latestWeightLog = logs.find((l) => l.log_type === "weight");
  const latestWeight = latestWeightLog?.weight_kg ?? null;

  return { logs, latestWeight };
}

export default async function FitnessPage() {
  const { userId } = await auth();
  const isSubscribed = userId ? await hasAccess(userId, "fitness") : false;

  return (
    <div className="animate-fade-up pt-6">
      {isSubscribed ? (
        <FitnessDataSection userId={userId!} />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6">
          <div
            className="w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl bg-[#FF7A00]/10 border-2 border-[#FF7A00]/20"
          >
            🔒
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-treaty-text-main mb-2">
              Fitness is Premium
            </h2>
            <p className="text-sm text-treaty-text-muted leading-relaxed max-w-xs">
              Track your weight, log workouts, count steps and monitor
              your body transformation progress over time.
            </p>
          </div>
          <div className="w-full rounded-[24px] p-5 bg-white/70 backdrop-blur-md border border-white/80">
            <p className="text-xs font-bold text-treaty-text-muted mb-3 uppercase tracking-widest">
              What you unlock
            </p>
            {[
              "⚖️ Weight progress tracking",
              "🏋️ Workout log with duration",
              "👟 Daily step counter",
              "📈 Progress timeline",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 py-2 text-treaty-text-main">
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <UpgradeButton defaultPlan="fitness" label="Unlock Fitness" />
        </div>
      )}
    </div>
  );
}

async function FitnessDataSection({ userId }: { userId: string }) {
  const { logs, latestWeight } = await fetchFitnessData(userId);
  return (
    <FitnessClient
      recentLogs={logs}
      latestWeight={latestWeight}
      goalWeight={GOAL_WEIGHT_KG}
    />
  );
}
