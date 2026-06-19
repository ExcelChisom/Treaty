"use client";

import { useState, useTransition, useMemo } from "react";
import { addTask, toggleTask, type TaskType, type Priority } from "../actions";

interface Task {
  id: string;
  title: string;
  course_code: string | null;
  task_type: string;
  priority: string;
  due_date: string | null;
  due_time: string | null;
  is_completed: boolean;
}

interface ScheduleClientProps {
  tasks: Task[];
}

const TASK_TYPES: { key: TaskType; label: string; emoji: string; color: string }[] = [
  { key: "assignment", label: "Assignment", emoji: "📝", color: "var(--treaty-purple)" },
  { key: "exam",       label: "Exam",       emoji: "📋", color: "#ef4444" },
  { key: "class",      label: "Class",      emoji: "🏫", color: "#38bdf8" },
  { key: "personal",   label: "Personal",   emoji: "👤", color: "var(--treaty-green)" },
];

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: "high",   label: "High",   color: "#ef4444" },
  { key: "medium", label: "Medium", color: "var(--treaty-orange)" },
  { key: "low",    label: "Low",    color: "var(--treaty-green)" },
];

function formatDue(date: string | null, time: string | null): string {
  if (!date) return "";
  const d = new Date(date + (time ? `T${time}` : ""));
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" }) +
    (time ? ` · ${time.slice(0, 5)}` : "");
}

function isOverdue(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export default function ScheduleClient({ tasks: initialTasks }: ScheduleClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("assignment");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [error, setError] = useState("");
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const allTasks = [...optimisticTasks, ...initialTasks];

  const pendingTasks = useMemo(
    () => allTasks.filter((t) => !t.is_completed && !completedIds.has(t.id)),
    [allTasks, completedIds]
  );
  const doneTasks = useMemo(
    () => allTasks.filter((t) => t.is_completed || completedIds.has(t.id)),
    [allTasks, completedIds]
  );

  function handleAdd() {
    if (!taskTitle.trim()) { setError("Title is required."); return; }
    setError("");

    const opt: Task = {
      id: `opt-${Date.now()}`,
      title: taskTitle.trim(),
      course_code: courseCode.trim() || null,
      task_type: taskType,
      priority,
      due_date: dueDate || null,
      due_time: dueTime || null,
      is_completed: false,
    };
    setOptimisticTasks((p) => [opt, ...p]);
    setTaskTitle(""); setCourseCode(""); setDueDate(""); setDueTime("");
    setShowForm(false);

    startTransition(async () => {
      const result = await addTask({
        title: opt.title,
        course_code: opt.course_code ?? undefined,
        task_type: taskType,
        priority,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
      });
      if (!result.success) {
        setOptimisticTasks((p) => p.filter((t) => t.id !== opt.id));
        setError(result.error ?? "Failed to add task.");
      } else {
        setOptimisticTasks((p) => p.filter((t) => t.id !== opt.id));
      }
    });
  }

  function handleToggle(task: Task) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(task.id)) next.delete(task.id);
      else next.add(task.id);
      return next;
    });

    startTransition(async () => {
      const newState = !task.is_completed && !completedIds.has(task.id);
      await toggleTask({ task_id: task.id, is_completed: newState });
    });
  }

  function getPriorityColor(p: string) {
    return PRIORITIES.find((pr) => pr.key === p)?.color ?? "var(--text-muted)";
  }

  function getTypeEmoji(t: string) {
    return TASK_TYPES.find((tt) => tt.key === t)?.emoji ?? "📌";
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">

      {/* ── Stats row ── */}
      <section className="grid grid-cols-3 gap-3 animate-fade-in-up">
        {[
          { label: "Pending", value: pendingTasks.length, color: "var(--treaty-orange)" },
          { label: "Done",    value: doneTasks.length,    color: "var(--treaty-green)" },
          { label: "Total",   value: allTasks.length,     color: "#38bdf8"             },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center py-3 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="text-xl font-black" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-[10px] text-text-muted font-semibold">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Add task button ── */}
      {!showForm && (
        <button
          id="schedule-add-task"
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            boxShadow: "0 0 20px rgba(56,189,248,0.3)",
          }}
        >
          + Add Task or Class
        </button>
      )}

      {/* ── Add form ── */}
      {showForm && (
        <section
          className="rounded-3xl p-4 flex flex-col gap-3 animate-scale-in"
          style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
          aria-label="Add task form"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-text-primary">New Task</h3>
            <button
              id="schedule-close-form"
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted"
              style={{ background: "var(--surface-alt)" }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <input
            id="schedule-task-title"
            type="text"
            value={taskTitle}
            onChange={(e) => { setTaskTitle(e.target.value); setError(""); }}
            placeholder="Task title..."
            maxLength={100}
            className="rounded-xl px-3 py-3 text-sm outline-none w-full"
            style={{
              background: "var(--surface-alt)",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />

          <input
            id="schedule-course-code"
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="Course code (e.g. COS 301) — optional"
            maxLength={20}
            className="rounded-xl px-3 py-3 text-sm outline-none w-full"
            style={{
              background: "var(--surface-alt)",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />

          {/* Task type */}
          <div>
            <p className="text-xs text-text-muted font-semibold mb-2">Type</p>
            <div className="grid grid-cols-4 gap-1.5">
              {TASK_TYPES.map((tt) => (
                <button
                  key={tt.key}
                  id={`schedule-type-${tt.key}`}
                  type="button"
                  onClick={() => setTaskType(tt.key)}
                  className="flex flex-col items-center py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                  style={{
                    background: taskType === tt.key ? `${tt.color}18` : "var(--surface-alt)",
                    border: `1.5px solid ${taskType === tt.key ? tt.color : "var(--border)"}`,
                    color: taskType === tt.key ? tt.color : "var(--text-muted)",
                  }}
                  aria-pressed={taskType === tt.key}
                >
                  <span aria-hidden="true">{tt.emoji}</span>
                  <span>{tt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-text-muted font-semibold mb-2">Priority</p>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.key}
                  id={`schedule-priority-${p.key}`}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{
                    background: priority === p.key ? `${p.color}18` : "var(--surface-alt)",
                    border: `1.5px solid ${priority === p.key ? p.color : "var(--border)"}`,
                    color: priority === p.key ? p.color : "var(--text-muted)",
                  }}
                  aria-pressed={priority === p.key}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date + time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="schedule-due-date" className="text-[10px] text-text-muted font-semibold">
                Due Date
              </label>
              <input
                id="schedule-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--surface-alt)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="schedule-due-time" className="text-[10px] text-text-muted font-semibold">
                Due Time
              </label>
              <input
                id="schedule-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--surface-alt)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold" style={{ color: "var(--treaty-orange)" }}>
              ⚠️ {error}
            </p>
          )}

          <button
            id="schedule-add-submit"
            type="button"
            onClick={handleAdd}
            disabled={isPending || !taskTitle.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
              boxShadow: "0 0 20px rgba(56,189,248,0.3)",
            }}
          >
            {isPending ? "Adding..." : "Add Task"}
          </button>
        </section>
      )}

      {/* ── Pending tasks ── */}
      <section aria-label="Pending tasks">
        <h2 className="text-sm font-bold text-text-primary mb-3">
          Upcoming ({pendingTasks.length})
        </h2>
        {pendingTasks.length === 0 ? (
          <div
            className="flex flex-col items-center py-8 rounded-3xl gap-2"
            style={{ background: "var(--surface)", border: "1.5px dashed var(--border)" }}
          >
            <span className="text-4xl" aria-hidden="true">✅</span>
            <p className="text-sm font-bold text-text-primary">All caught up!</p>
            <p className="text-xs text-text-muted">Add a task above to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isOverdue(task.due_date) ? "rgba(239,68,68,0.3)" : "var(--border-subtle)"}`,
                }}
              >
                <button
                  id={`schedule-toggle-${task.id}`}
                  type="button"
                  onClick={() => handleToggle(task)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all active:scale-90"
                  style={{ borderColor: getPriorityColor(task.priority) }}
                  aria-label={`Mark "${task.title}" as complete`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm" aria-hidden="true">{getTypeEmoji(task.task_type)}</span>
                    <p className="text-xs font-bold text-text-primary truncate">{task.title}</p>
                    {task.course_code && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}
                      >
                        {task.course_code}
                      </span>
                    )}
                  </div>
                  {task.due_date && (
                    <p
                      className="text-[10px] font-medium mt-0.5"
                      style={{
                        color: isOverdue(task.due_date) ? "#ef4444" : "var(--text-muted)",
                      }}
                    >
                      {isOverdue(task.due_date) ? "⚠️ Overdue · " : "📅 "}
                      {formatDue(task.due_date, task.due_time)}
                    </p>
                  )}
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: getPriorityColor(task.priority) }}
                  aria-label={`${task.priority} priority`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Completed ── */}
      {doneTasks.length > 0 && (
        <section aria-label="Completed tasks">
          <h2 className="text-sm font-bold text-text-muted mb-3">
            Done ({doneTasks.length})
          </h2>
          <div className="flex flex-col gap-2">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl opacity-50"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--treaty-green)" }}
                  aria-hidden="true"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-text-muted line-through flex-1">
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
