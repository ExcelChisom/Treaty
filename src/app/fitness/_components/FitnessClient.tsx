"use client";

import { useState, useTransition } from "react";
import { logFitness, type LogType } from "../actions";

interface FitnessLog {
  id: string;
  log_type: string;
  weight_kg: number | null;
  steps: number | null;
  duration_min: number | null;
  activity: string | null;
  notes: string | null;
  logged_at: string;
}

interface FitnessClientProps {
  recentLogs: FitnessLog[];
  latestWeight: number | null;
  goalWeight: number;
}

const LOG_TYPES: { key: LogType; label: string; emoji: string; color: string }[] = [
  { key: "weight",  label: "Weight",  emoji: "⚖️",  color: "var(--treaty-green)"  },
  { key: "workout", label: "Workout", emoji: "🏋️", color: "var(--treaty-orange)" },
  { key: "steps",   label: "Steps",   emoji: "👟",  color: "#38bdf8"              },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

export default function FitnessClient({
  recentLogs,
  latestWeight,
  goalWeight,
}: FitnessClientProps) {
  const [isPending, startTransition] = useTransition();
  const [activeType, setActiveType] = useState<LogType>("weight");
  const [weightInput, setWeightInput] = useState("");
  const [stepsInput, setStepsInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [activityInput, setActivityInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [optimisticLogs, setOptimisticLogs] = useState<FitnessLog[]>([]);

  const allLogs = [...optimisticLogs, ...recentLogs];

  const weightProgress = latestWeight
    ? Math.min(
        100,
        goalWeight >= latestWeight
          ? ((latestWeight / goalWeight) * 100)
          : (goalWeight / latestWeight) * 100
      )
    : 0;

  function handleLog() {
    const payload = {
      log_type: activeType,
      weight_kg: activeType === "weight" ? parseFloat(weightInput) : undefined,
      steps: activeType === "steps" ? parseInt(stepsInput) : undefined,
      duration_min: activeType === "workout" ? parseInt(durationInput) : undefined,
      activity: activeType === "workout" ? activityInput : undefined,
      notes: notesInput || undefined,
    };

    const optimistic: FitnessLog = {
      id: `opt-${Date.now()}`,
      log_type: activeType,
      weight_kg: payload.weight_kg ?? null,
      steps: payload.steps ?? null,
      duration_min: payload.duration_min ?? null,
      activity: payload.activity ?? null,
      notes: payload.notes ?? null,
      logged_at: new Date().toISOString(),
    };

    setOptimisticLogs((p) => [optimistic, ...p]);
    setWeightInput("");
    setStepsInput("");
    setDurationInput("");
    setActivityInput("");
    setNotesInput("");
    setError("");

    startTransition(async () => {
      const result = await logFitness(payload);
      if (!result.success) {
        setOptimisticLogs((p) => p.filter((l) => l.id !== optimistic.id));
        setError(result.error ?? "Failed.");
      } else {
        setSuccessMsg("Entry logged! ✅");
        setOptimisticLogs((p) => p.filter((l) => l.id !== optimistic.id));
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">

      {/* ── Weight progress card ── */}
      <section
        className="rounded-3xl p-5 animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)",
          boxShadow: "var(--shadow-glow-orange)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
              Current Weight
            </p>
            <p className="text-3xl font-black text-white">
              {latestWeight ? `${latestWeight} kg` : "Not logged"}
            </p>
            <p className="text-white/50 text-xs mt-1">
              Goal: <span className="text-white font-bold">{goalWeight} kg</span>
            </p>
            <div
              className="mt-3 h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.2)", width: "140px" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${weightProgress}%`,
                  background: "var(--treaty-orange)",
                }}
                role="progressbar"
                aria-valuenow={latestWeight ?? 0}
                aria-valuemin={0}
                aria-valuemax={goalWeight}
              />
            </div>
          </div>
          <div className="text-5xl" aria-hidden="true">💪</div>
        </div>
      </section>

      {successMsg && (
        <div
          className="rounded-2xl px-4 py-3 text-sm font-bold text-center"
          style={{ background: "rgba(34,197,94,0.1)", color: "var(--treaty-green-dark)" }}
          role="status"
        >
          {successMsg}
        </div>
      )}

      {/* ── Log type tabs ── */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: "var(--surface-alt)" }}
        role="tablist"
      >
        {LOG_TYPES.map((lt) => (
          <button
            key={lt.key}
            id={`fitness-tab-${lt.key}`}
            type="button"
            role="tab"
            aria-selected={activeType === lt.key}
            onClick={() => { setActiveType(lt.key); setError(""); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: activeType === lt.key ? "var(--surface)" : "transparent",
              color: activeType === lt.key ? lt.color : "var(--text-muted)",
              boxShadow: activeType === lt.key ? "var(--shadow-sm)" : "none",
            }}
          >
            <span aria-hidden="true">{lt.emoji}</span>
            <span>{lt.label}</span>
          </button>
        ))}
      </div>

      {/* ── Input form ── */}
      <section
        className="rounded-3xl p-4 flex flex-col gap-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
        aria-label="Fitness log form"
      >
        {activeType === "weight" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="fitness-weight" className="text-xs font-semibold text-text-muted">
              Weight (kg)
            </label>
            <input
              id="fitness-weight"
              type="number"
              min="1"
              max="300"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 72.5"
              className="rounded-xl px-3 py-3 text-sm outline-none w-full"
              style={{
                background: "var(--surface-alt)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        )}

        {activeType === "workout" && (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="fitness-activity" className="text-xs font-semibold text-text-muted">
                Activity
              </label>
              <input
                id="fitness-activity"
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                placeholder="e.g. Push-ups, Running, Swimming"
                className="rounded-xl px-3 py-3 text-sm outline-none w-full"
                style={{
                  background: "var(--surface-alt)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="fitness-duration" className="text-xs font-semibold text-text-muted">
                Duration (minutes)
              </label>
              <input
                id="fitness-duration"
                type="number"
                min="1"
                max="600"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                placeholder="e.g. 30"
                className="rounded-xl px-3 py-3 text-sm outline-none w-full"
                style={{
                  background: "var(--surface-alt)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </>
        )}

        {activeType === "steps" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="fitness-steps" className="text-xs font-semibold text-text-muted">
              Step Count
            </label>
            <input
              id="fitness-steps"
              type="number"
              min="0"
              max="100000"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              placeholder="e.g. 8000"
              className="rounded-xl px-3 py-3 text-sm outline-none w-full"
              style={{
                background: "var(--surface-alt)",
                border: "1.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="fitness-notes" className="text-xs font-semibold text-text-muted">
            Notes (optional)
          </label>
          <input
            id="fitness-notes"
            type="text"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder="How did it go?"
            maxLength={120}
            className="rounded-xl px-3 py-3 text-sm outline-none w-full"
            style={{
              background: "var(--surface-alt)",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {error && (
          <p className="text-xs font-semibold" style={{ color: "var(--treaty-orange)" }}>
            ⚠️ {error}
          </p>
        )}

        <button
          id="fitness-log-submit"
          type="button"
          onClick={handleLog}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #c2410c, #9a3412)",
            boxShadow: "var(--shadow-glow-orange)",
          }}
        >
          {isPending ? "Logging..." : `Log ${LOG_TYPES.find((l) => l.key === activeType)?.label}`}
        </button>
      </section>

      {/* ── Timeline ── */}
      <section aria-label="Fitness history">
        <h2 className="text-sm font-bold text-text-primary mb-3">Recent Activity</h2>
        {allLogs.length === 0 ? (
          <div
            className="flex flex-col items-center py-8 rounded-3xl gap-2"
            style={{ background: "var(--surface)", border: "1.5px dashed var(--border)" }}
          >
            <span className="text-4xl" aria-hidden="true">💪</span>
            <p className="text-sm font-bold text-text-primary">No entries yet</p>
            <p className="text-xs text-text-muted">Log your first workout above</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allLogs.map((log) => {
              const lt = LOG_TYPES.find((l) => l.key === log.log_type);
              const detail =
                log.log_type === "weight"
                  ? `${log.weight_kg ?? "—"} kg`
                  : log.log_type === "steps"
                  ? `${(log.steps ?? 0).toLocaleString()} steps`
                  : `${log.activity ?? "Workout"} · ${log.duration_min ?? "—"} min`;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${lt?.color ?? "#666"}18` }}
                    aria-hidden="true"
                  >
                    {lt?.emoji ?? "📊"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">{detail}</p>
                    <p className="text-[10px] text-text-muted">{formatTime(log.logged_at)}</p>
                  </div>
                  {log.notes && (
                    <p className="text-[10px] text-text-muted max-w-[80px] truncate">
                      {log.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
