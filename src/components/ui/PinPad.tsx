"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface PinPadProps {
  /** Called with the full PIN string when `pinLength` digits are entered. */
  onComplete: (pin: string) => void;
  /** Number of digits required (default: 4). */
  pinLength?: number;
  /** Label shown above the dot indicators. */
  title?: string;
  /** Secondary label shown below the title. */
  subtitle?: string;
  /** Accent color for filled dots and key ring (CSS color value). */
  accentColor?: string;
  /** When true, the pad dims and ignores input (e.g. during async submission). */
  disabled?: boolean;
  /** When true, shows an error shake animation on the dots. */
  hasError?: boolean;
}

// ── Key layout ─────────────────────────────────────────────────────────────

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
] as const;

// ── Sub-components ─────────────────────────────────────────────────────────

interface KeyButtonProps {
  value: string;
  onPress: (value: string) => void;
  disabled: boolean;
  accentColor: string;
}

function KeyButton({ value, onPress, disabled, accentColor }: KeyButtonProps) {
  if (value === "") {
    // Empty cell spacer
    return <div className="w-16 h-16" aria-hidden="true" />;
  }

  const isBackspace = value === "⌫";

  return (
    <button
      id={`pin-key-${isBackspace ? "backspace" : value}`}
      type="button"
      onClick={() => !disabled && onPress(value)}
      disabled={disabled}
      className="
        w-16 h-16 rounded-full
        flex items-center justify-center
        text-xl font-semibold
        transition-all duration-150
        active:scale-90
        focus:outline-none focus-visible:ring-2
        select-none
        disabled:opacity-40
      "
      style={{
        background: "var(--surface)",
        boxShadow: "var(--shadow-sm)",
        color: isBackspace ? "var(--text-muted)" : "var(--text-primary)",
        border: `1.5px solid var(--border)`,
      }}
      aria-label={isBackspace ? "Delete last digit" : `Digit ${value}`}
    >
      {isBackspace ? (
        // Custom backspace SVG for crisper rendering
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 4L2 10L8 16M2 10H18"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        value
      )}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PinPad({
  onComplete,
  pinLength = 4,
  title = "Enter PIN",
  subtitle,
  accentColor = "var(--treaty-green)",
  disabled = false,
  hasError = false,
}: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([]);

  const handleKey = useCallback(
    (key: string) => {
      if (disabled) return;

      if (key === "⌫") {
        setDigits((prev) => prev.slice(0, -1));
        return;
      }

      setDigits((prev) => {
        const next = [...prev, key];
        if (next.length === pinLength) {
          // Slight delay so the last dot fills before the callback fires
          setTimeout(() => {
            onComplete(next.join(""));
            setDigits([]);
          }, 120);
          return next;
        }
        return next;
      });
    },
    [disabled, pinLength, onComplete]
  );

  return (
    <div
      className="flex flex-col items-center gap-6 select-none"
      role="group"
      aria-label={title}
    >
      {/* Title & subtitle */}
      <div className="text-center">
        <p className="text-lg font-bold text-text-primary">{title}</p>
        {subtitle && (
          <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* ── PIN Dot Indicators ── */}
      <div
        className="flex gap-4"
        aria-label={`${digits.length} of ${pinLength} digits entered`}
        role="status"
        aria-live="polite"
      >
        {Array.from({ length: pinLength }).map((_, i) => {
          const filled = i < digits.length;
          return (
            <div
              key={i}
              className={`
                w-4 h-4 rounded-full border-2 transition-all duration-200
                ${hasError ? "animate-bounce-soft" : ""}
                ${filled ? "scale-110" : "scale-100"}
              `}
              style={{
                background: filled ? accentColor : "transparent",
                borderColor: filled ? accentColor : "var(--border)",
                boxShadow: filled ? `0 0 8px ${accentColor}60` : "none",
              }}
            />
          );
        })}
      </div>

      {/* ── Numeric Keypad ── */}
      <div className="flex flex-col gap-3" role="group" aria-label="Number pad">
        {KEYS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 justify-center">
            {row.map((key, colIdx) => (
              <KeyButton
                key={`${rowIdx}-${colIdx}`}
                value={key}
                onPress={handleKey}
                disabled={disabled || (key !== "⌫" && digits.length >= pinLength)}
                accentColor={accentColor}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
