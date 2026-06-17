"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PinPad from "@/components/ui/PinPad";

// ── Main Page ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nickname, setNickname] = useState("");
  const [nicknameSubmitted, setNicknameSubmitted] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinErrorMsg, setPinErrorMsg] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);

  // ── Step 1: Submit Nickname ──────────────────────────────────────────────

  function handleNicknameSubmit() {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setNicknameError("Enter your nickname to continue.");
      return;
    }
    setNicknameError("");
    setNicknameSubmitted(true);
  }

  // ── Step 2: PIN Submitted ────────────────────────────────────────────────

  function handlePinComplete(pin: string) {
    if (isPending) return;
    setPinError(false);
    setPinErrorMsg("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: nickname.trim(), pin }),
        });

        const data = await res.json();

        if (!res.ok) {
          const newCount = attemptCount + 1;
          setAttemptCount(newCount);
          setPinError(true);
          setPinErrorMsg(
            newCount >= 3
              ? `Wrong PIN (${newCount} attempts). Double-check and try again.`
              : data.error || "Incorrect PIN. Try again."
          );
          // Auto-clear error state after 2 seconds so user can try again
          setTimeout(() => {
            setPinError(false);
            setPinErrorMsg("");
          }, 2000);
          return;
        }

        // Success — redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } catch {
        setPinError(true);
        setPinErrorMsg("Network error. Please check your connection.");
        setTimeout(() => setPinError(false), 2000);
      }
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-col min-h-svh overflow-hidden">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 gradient-hero" />
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-15 animate-spin-slow"
        style={{ background: "radial-gradient(circle, var(--treaty-purple) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10 animate-spin-slow"
        style={{
          background: "radial-gradient(circle, var(--treaty-green) 0%, transparent 70%)",
          animationDirection: "reverse",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1 px-6 py-12">

        {/* Logo + brand */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
            style={{
              background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
              boxShadow: "var(--shadow-glow-green)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <path d="M8 12H36M22 12V36" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <path d="M14 26L19 31L30 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Sign in to Treaty</p>
          </div>
        </div>

        {/* ── PHASE 1: Nickname Input ── */}
        {!nicknameSubmitted ? (
          <div className="flex flex-col gap-4 mt-10 animate-fade-in-up delay-200">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="login-nickname"
                className="text-sm font-semibold text-white/70"
              >
                Your Nickname
              </label>
              <input
                id="login-nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (nicknameError) setNicknameError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleNicknameSubmit()}
                placeholder="Enter your nickname..."
                autoFocus
                autoComplete="off"
                className="w-full rounded-2xl px-4 py-4 text-base font-medium transition-all duration-200 outline-none"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: `2px solid ${nicknameError ? "var(--treaty-orange)" : "rgba(255,255,255,0.15)"}`,
                  color: "#ffffff",
                }}
              />
              {nicknameError && (
                <p className="text-xs font-medium" style={{ color: "var(--treaty-orange)" }}>
                  ⚠️ {nicknameError}
                </p>
              )}
            </div>

            <button
              id="login-nickname-submit"
              type="button"
              onClick={handleNicknameSubmit}
              disabled={nickname.trim().length < 2}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
                boxShadow: "var(--shadow-glow-green)",
              }}
            >
              Continue →
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-xs text-white/30 font-medium">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>

            <Link
              href="/auth/register"
              id="go-to-register"
              className="w-full flex items-center justify-center py-4 rounded-2xl font-semibold text-sm text-white/70 transition-all active:scale-95 glass-dark"
            >
              Create a new account
            </Link>
          </div>
        ) : (
          /* ── PHASE 2: PIN Entry ── */
          <div className="flex flex-col items-center gap-6 mt-8 animate-scale-in">
            {/* Greeting */}
            <div
              className="w-full rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: "var(--treaty-green)", color: "#fff" }}
              >
                {nickname.trim()[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{nickname.trim()}</p>
                <button
                  type="button"
                  onClick={() => {
                    setNicknameSubmitted(false);
                    setPinError(false);
                    setPinErrorMsg("");
                    setAttemptCount(0);
                  }}
                  className="text-xs underline"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Not you?
                </button>
              </div>
            </div>

            {/* Error banner */}
            {pinErrorMsg && (
              <div
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-center animate-scale-in"
                style={{
                  background: "var(--treaty-orange-glow)",
                  color: "var(--treaty-orange)",
                  border: "1px solid var(--treaty-orange)30",
                }}
              >
                ⚠️ {pinErrorMsg}
              </div>
            )}

            {/* PIN Pad — white themed on dark background */}
            <div
              className="w-full rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <PinPad
                key={pinError ? "error" : "normal"}
                onComplete={handlePinComplete}
                title="Enter your PIN"
                subtitle={isPending ? "Verifying..." : ""}
                accentColor="var(--treaty-green)"
                disabled={isPending}
                hasError={pinError}
              />
            </div>

            <Link
              href="/auth/register"
              className="text-xs underline"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Forgot PIN? Create new account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
