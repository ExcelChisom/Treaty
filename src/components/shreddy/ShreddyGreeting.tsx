"use client";

import { useState, useEffect, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type TimeOfDay = "morning" | "afternoon" | "evening";

interface ShreddyGreetingProps {
  /** User's nickname fetched from session/DB. Falls back to "Champ". */
  nickname?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

const TIME_CONFIG: Record<TimeOfDay, { greeting: string; emoji: string; palette: string }> = {
  morning: {
    greeting: "Good morning",
    emoji: "🌅",
    palette: "linear-gradient(135deg, #f97316 0%, #fdc400 100%)",
  },
  afternoon: {
    greeting: "Good afternoon",
    emoji: "☀️",
    palette: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  },
  evening: {
    greeting: "Good evening",
    emoji: "🌙",
    palette: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
  },
};

/**
 * Shreddy's rotating quip bank.
 * Savage — but motivating. Exactly the voice of a personal AI coach
 * who's seen your diet and your spending in the same week.
 */
const QUIPS: string[] = [
  "Fufu before a two-hour lecture? Bold strategy, champion.",
  "Your budget and that burger are currently in disagreement.",
  "You said 'one more snack' four times yesterday. I counted.",
  "The gym misses you. It's been two days. Very long days.",
  "Three assignments due tomorrow and you opened Treaty first. Respect.",
  "Hydrate. Your brain needs water, not just jollof and ambition.",
  "You can't out-train a bad jollof habit. But let's try anyway.",
  "Another Monday, another chance to pretend last week didn't happen.",
  "Your fitness goals didn't leave — you just forgot to show up.",
  "A budget is just a plan. You're great at making plans.",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

function getRandomQuip(seed: number): string {
  return QUIPS[seed % QUIPS.length];
}

// ── Animated Word Reveal ───────────────────────────────────────────────────

function AnimatedQuip({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block animate-fade-in-up opacity-0"
          style={{
            animationDelay: `${300 + i * 55}ms`,
            animationFillMode: "forwards",
            marginRight: i < words.length - 1 ? "0.28em" : 0,
          }}
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </span>
  );
}

// ── Shreddy Avatar ────────────────────────────────────────────────────────

function ShreddyAvatar({ palette }: { palette: string }) {
  return (
    <div className="relative flex-shrink-0">
      {/* Outer pulse ring */}
      <div
        className="absolute -inset-1.5 rounded-full opacity-30 animate-pulse-glow"
        style={{ background: palette }}
      />
      {/* Avatar circle */}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: palette }}
      >
        {/* "S" monogram */}
        <span className="text-white font-black text-xl tracking-tight select-none">S</span>
      </div>
      {/* Online indicator */}
      <div
        className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
        style={{ background: "#22c55e" }}
        aria-hidden="true"
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ShreddyGreeting({ nickname = "Champ" }: ShreddyGreetingProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [quipIndex, setQuipIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Randomise quip on mount (client-only to avoid hydration mismatch)
  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    setQuipIndex(Math.floor(Math.random() * QUIPS.length));
    setMounted(true);
  }, []);

  const config = TIME_CONFIG[timeOfDay];
  const quip = useMemo(() => getRandomQuip(quipIndex), [quipIndex]);

  // Cycle quip on tap (delightful easter egg)
  function handleNextQuip() {
    setQuipIndex((prev) => (prev + 1) % QUIPS.length);
  }

  if (!mounted) {
    // SSR-safe skeleton to prevent hydration flash
    return (
      <div className="flex items-start gap-4 p-4 rounded-3xl animate-pulse"
        style={{ background: "var(--surface-alt)" }}
      >
        <div className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-3 w-full rounded-full bg-slate-100" />
          <div className="h-3 w-3/4 rounded-full bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleNextQuip}
      className="w-full flex items-start gap-4 p-4 rounded-3xl text-left transition-all duration-200 active:scale-98 group"
      style={{
        background: "var(--surface)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border-subtle)",
      }}
      aria-label="Shreddy's greeting — tap for a new message"
      title="Tap for a new message"
    >
      {/* Avatar */}
      <ShreddyAvatar palette={config.palette} />

      {/* Text content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Greeting line */}
        <div className="flex items-center gap-2 animate-fade-in">
          <p className="font-bold text-text-primary text-base leading-tight">
            {config.greeting}, <span style={{
              background: config.palette,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{nickname}</span>!
          </p>
          <span className="text-base" aria-hidden="true">{config.emoji}</span>
        </div>

        {/* Quip — animated word-by-word reveal */}
        <p className="text-sm text-text-secondary mt-1.5 leading-relaxed font-medium">
          <AnimatedQuip key={quipIndex} text={quip} />
        </p>

        {/* Tap hint */}
        <p className="text-[10px] text-text-muted mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          Tap for a new message ✨
        </p>
      </div>
    </button>
  );
}
