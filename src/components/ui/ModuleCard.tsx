"use client";

import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;           // emoji or short text
  href: string;
  isLocked?: boolean;
  accentColor?: string;   // CSS color value for gradient stripe
  glowColor?: string;     // CSS rgba for glow shadow
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ModuleCard({
  title,
  description,
  icon,
  href,
  isLocked = false,
  accentColor = "var(--treaty-green)",
  glowColor = "rgba(34, 197, 94, 0.15)",
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      id={`module-card-${title.toLowerCase().replace(/\s/g, "-")}`}
      className="relative flex flex-col overflow-hidden rounded-3xl transition-all duration-200 active:scale-95 group bg-white/5 backdrop-blur-md border border-white/10"
      style={{
        minHeight: "148px",
      }}
      aria-label={isLocked ? `${title} — Premium feature` : title}
    >
      {/* ── Accent gradient stripe ── */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
        }}
      />

      {/* ── Glow on hover ── */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${glowColor}, transparent 70%)` }}
      />

      {/* ── Card body ── */}
      <div className="relative flex flex-col flex-1 p-4 gap-2">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${accentColor}18` }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="font-bold text-sm text-text-primary leading-tight">{title}</p>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
        </div>

        {/* Free badge or arrow */}
        {!isLocked ? (
          <div className="flex items-center justify-between mt-auto">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${accentColor}18`,
                color: accentColor,
              }}
            >
              ✓ Free
            </span>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className="opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200"
              aria-hidden="true"
            >
              <path d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="mt-auto">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "var(--treaty-orange-glow)",
                color: "var(--treaty-orange-dark)",
              }}
            >
              🔒 Premium
            </span>
          </div>
        )}
      </div>

      {/* ── Lock overlay (isLocked) ── */}
      {isLocked && (
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-2 transition-opacity duration-200 bg-[#0F172A]/80 backdrop-blur-md"
          aria-hidden="true"
        >
          {/* Lock icon */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--treaty-orange), var(--treaty-orange-dark))",
              boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="3" y="9" width="14" height="10" rx="2" fill="white" fillOpacity="0.9" />
              <path
                d="M6.5 9V6.5C6.5 4.57 8.07 3 10 3C11.93 3 13.5 4.57 13.5 6.5V9"
                stroke="white" strokeWidth="1.8" strokeLinecap="round"
              />
              <circle cx="10" cy="14" r="1.5" fill="rgba(249,115,22,1)" />
            </svg>
          </div>

          {/* Upgrade label */}
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, var(--treaty-orange), var(--treaty-orange-dark))",
              boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
            }}
          >
            Upgrade to unlock
          </span>
        </div>
      )}
    </Link>
  );
}
