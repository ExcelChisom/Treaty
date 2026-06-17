"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PinPad from "@/components/ui/PinPad";

// ── Types ──────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

type Goal =
  | "lose_weight"
  | "maintain"
  | "gain_muscle"
  | "improve_fitness"
  | "eat_healthy";

interface ProfileData {
  gender: "male" | "female" | "prefer_not_to_say" | "";
  age: string;
  height_cm: string;
  weight_kg: string;
  goal: Goal | "";
}

// ── Constants ──────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: "male", label: "Male", emoji: "🧑" },
  { value: "female", label: "Female", emoji: "👩" },
  { value: "prefer_not_to_say", label: "Prefer not to say", emoji: "🤫" },
] as const;

const GOAL_OPTIONS: { value: Goal; label: string; emoji: string }[] = [
  { value: "lose_weight", label: "Lose Weight", emoji: "🔥" },
  { value: "maintain", label: "Stay Fit", emoji: "⚖️" },
  { value: "gain_muscle", label: "Build Muscle", emoji: "💪" },
  { value: "improve_fitness", label: "Get Active", emoji: "🏃" },
  { value: "eat_healthy", label: "Eat Better", emoji: "🥗" },
];

// ── Step Indicator ─────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: isActive || isDone
                  ? "var(--treaty-green)"
                  : "var(--surface-alt)",
                color: isActive || isDone ? "#fff" : "var(--text-muted)",
                boxShadow: isActive ? "var(--shadow-glow-green)" : "none",
              }}
            >
              {isDone ? "✓" : stepNum}
            </div>
            {i < total - 1 && (
              <div
                className="w-8 h-0.5 rounded-full transition-all duration-500"
                style={{
                  background: isDone ? "var(--treaty-green)" : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Multi-step state
  const [step, setStep] = useState<Step>(1);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [pin, setPin] = useState("");
  const [pinStep, setPinStep] = useState<"create" | "confirm">("create");
  const [pinError, setPinError] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    gender: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    goal: "",
  });
  const [submitError, setSubmitError] = useState("");

  // ── Step 1: Nickname ──

  function handleNicknameNext() {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setNicknameError("Nickname must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 30) {
      setNicknameError("Nickname must be 30 characters or fewer.");
      return;
    }
    if (!/^[a-zA-Z0-9_\-. ]+$/.test(trimmed)) {
      setNicknameError("Only letters, numbers, spaces, _ - . allowed.");
      return;
    }
    setNicknameError("");
    setStep(2);
  }

  // ── Step 2: PIN ──

  function handlePinComplete(enteredPin: string) {
    if (pinStep === "create") {
      setPin(enteredPin);
      setPinStep("confirm");
    } else {
      if (enteredPin !== pin) {
        setPinError("PINs don't match. Try again.");
        setPinStep("create");
        setPin("");
        setTimeout(() => setPinError(""), 2000);
      } else {
        setPinError("");
        setStep(3);
      }
    }
  }

  // ── Step 3: Profile & Submit ──

  function handleProfileChange(field: keyof ProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitError("");

    const payload = {
      nickname: nickname.trim(),
      pin,
      ...(profile.gender && { gender: profile.gender }),
      ...(profile.age && { age: Number(profile.age) }),
      ...(profile.height_cm && { height_cm: Number(profile.height_cm) }),
      ...(profile.weight_kg && { weight_kg: Number(profile.weight_kg) }),
      ...(profile.goal && { goal: profile.goal }),
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setSubmitError(data.error || "Registration failed. Please try again.");
          return;
        }

        // Automatically log the user in after successful registration
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: nickname.trim(), pin }),
        });

        if (loginRes.ok) {
          router.push("/dashboard");
        } else {
          router.push("/auth/login");
        }
      } catch {
        setSubmitError("Network error. Please check your connection.");
      }
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-col min-h-svh bg-slate-50">
      {/* ── Header ── */}
      <div
        className="px-6 pt-12 pb-8"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}
      >
        <div className="animate-fade-in-up">
          <StepIndicator current={step} total={3} />
          <h1 className="text-2xl font-bold text-white mt-5">
            {step === 1 && "What's your name?"}
            {step === 2 &&
              (pinStep === "create" ? "Create your PIN" : "Confirm your PIN")}
            {step === 3 && "Your Profile"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {step === 1 && "Pick a nickname — this is how Shreddy will greet you."}
            {step === 2 && pinStep === "create" && "Choose a secret 4-digit PIN to secure your account."}
            {step === 2 && pinStep === "confirm" && "Enter your PIN once more to confirm."}
            {step === 3 && "Help Shreddy personalise your experience. All optional."}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-6 py-8 animate-fade-in">

        {/* ── STEP 1: Nickname ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nickname-input"
                className="text-sm font-semibold text-text-secondary"
              >
                Nickname
              </label>
              <input
                id="nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (nicknameError) setNicknameError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleNicknameNext()}
                placeholder="e.g. ChampGod, AdesBoss..."
                maxLength={30}
                autoFocus
                autoComplete="off"
                className="w-full rounded-2xl px-4 py-4 text-base font-medium transition-all duration-200 outline-none"
                style={{
                  background: "var(--surface)",
                  border: `2px solid ${nicknameError ? "var(--treaty-orange)" : nickname ? "var(--treaty-green)" : "var(--border)"}`,
                  color: "var(--text-primary)",
                  boxShadow: nickname && !nicknameError ? "var(--shadow-glow-green)" : "var(--shadow-sm)",
                }}
              />
              {nicknameError && (
                <p className="text-xs font-medium" style={{ color: "var(--treaty-orange)" }}>
                  ⚠️ {nicknameError}
                </p>
              )}
              <p className="text-xs text-text-muted">
                {nickname.trim().length}/30 characters
              </p>
            </div>

            <button
              id="nickname-next-btn"
              type="button"
              onClick={handleNicknameNext}
              disabled={nickname.trim().length < 2}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
                boxShadow: "var(--shadow-glow-green)",
              }}
            >
              Continue →
            </button>

            <p className="text-center text-text-muted text-sm">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-semibold"
                style={{ color: "var(--treaty-purple)" }}
              >
                Log in
              </a>
            </p>
          </div>
        )}

        {/* ── STEP 2: PIN ── */}
        {step === 2 && (
          <div className="flex flex-col items-center gap-6">
            {pinError && (
              <div
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-center animate-scale-in"
                style={{
                  background: "var(--treaty-orange-glow)",
                  color: "var(--treaty-orange-dark)",
                }}
              >
                ⚠️ {pinError}
              </div>
            )}

            <PinPad
              key={pinStep} // remount to reset internal state on confirm step
              onComplete={handlePinComplete}
              title={pinStep === "create" ? "Create 4-digit PIN" : "Confirm your PIN"}
              subtitle={
                pinStep === "create"
                  ? "Don't use obvious numbers like 1234"
                  : `Confirming PIN for @${nickname.trim()}`
              }
              accentColor="var(--treaty-green)"
              hasError={!!pinError}
            />

            {pinStep === "confirm" && (
              <button
                type="button"
                onClick={() => {
                  setPinStep("create");
                  setPin("");
                  setPinError("");
                }}
                className="text-sm text-text-muted underline"
              >
                Change PIN
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-text-muted"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── STEP 3: Profile ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            {/* Gender */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-text-secondary">Gender</p>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    id={`gender-${opt.value}`}
                    type="button"
                    onClick={() => handleProfileChange("gender", opt.value)}
                    className="flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-95"
                    style={{
                      background: profile.gender === opt.value
                        ? "var(--treaty-green-glow)"
                        : "var(--surface)",
                      border: `2px solid ${profile.gender === opt.value ? "var(--treaty-green)" : "var(--border)"}`,
                      color: profile.gender === opt.value
                        ? "var(--treaty-green-dark)"
                        : "var(--text-secondary)",
                      boxShadow: profile.gender === opt.value ? "var(--shadow-glow-green)" : "none",
                    }}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { field: "age", label: "Age", placeholder: "19", unit: "yrs" },
                { field: "height_cm", label: "Height", placeholder: "170", unit: "cm" },
                { field: "weight_kg", label: "Weight", placeholder: "65", unit: "kg" },
              ].map((item) => (
                <div key={item.field} className="flex flex-col gap-1">
                  <label
                    htmlFor={`profile-${item.field}`}
                    className="text-xs font-semibold text-text-muted"
                  >
                    {item.label}
                  </label>
                  <div className="relative">
                    <input
                      id={`profile-${item.field}`}
                      type="number"
                      value={profile[item.field as keyof ProfileData]}
                      onChange={(e) =>
                        handleProfileChange(
                          item.field as keyof ProfileData,
                          e.target.value
                        )
                      }
                      placeholder={item.placeholder}
                      className="w-full rounded-xl px-3 py-3 text-sm font-medium outline-none transition-all duration-200"
                      style={{
                        background: "var(--surface)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <span
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Goal */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-text-secondary">Your Goal</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    id={`goal-${opt.value}`}
                    type="button"
                    onClick={() => handleProfileChange("goal", opt.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95"
                    style={{
                      background: profile.goal === opt.value
                        ? "var(--treaty-purple-glow)"
                        : "var(--surface)",
                      border: `1.5px solid ${profile.goal === opt.value ? "var(--treaty-purple)" : "var(--border)"}`,
                      color: profile.goal === opt.value
                        ? "var(--treaty-purple-dark)"
                        : "var(--text-secondary)",
                    }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {submitError && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-semibold animate-scale-in"
                style={{
                  background: "var(--treaty-orange-glow)",
                  color: "var(--treaty-orange-dark)",
                }}
              >
                ⚠️ {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: isPending
                  ? "var(--treaty-green-dark)"
                  : "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
                boxShadow: "var(--shadow-glow-green)",
              }}
            >
              {isPending ? "Creating account..." : "🚀 Create My Account"}
            </button>

            <p className="text-center text-xs text-text-muted">
              Profile info is optional — you can update it anytime.
            </p>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-text-muted text-center"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
