import { SignUp } from "@clerk/nextjs";

/**
 * /auth/register/[[...rest]]
 *
 * Optional catch-all route required by Clerk to handle internal
 * multi-step flows: email verification, SSO callbacks, profile
 * completion screens, etc.
 * Without [[...rest]], Clerk throws a routing configuration error
 * when it navigates to sub-paths like /auth/register/verify-email-address.
 *
 * Clerk routing props:
 *   path="/auth/register"        — tells Clerk which base URL it's mounted on
 *   routing="path"               — use path-based routing (not hash)
 *   signInUrl="/auth/login"      — cross-link to the sign-in page
 *   forceRedirectUrl="/dashboard" — always redirect here after sign-up
 */
export default function RegisterPage() {
  return (
    <main className="flex flex-col min-h-svh overflow-hidden">
      {/* Dark gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)" }}
      />
      <div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-20 animate-spin-slow"
        style={{
          background:
            "radial-gradient(circle, var(--treaty-green) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-15 animate-spin-slow"
        style={{
          background:
            "radial-gradient(circle, var(--treaty-purple) 0%, transparent 70%)",
          animationDirection: "reverse",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4 py-12 gap-6">
        {/* Treaty wordmark */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
              boxShadow: "var(--shadow-glow-green)",
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 44 44"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 12H36M22 12V36"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M14 26L19 31L30 20"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Join Treaty
            </h1>
            <p className="text-white/40 text-sm mt-1 font-medium">
              Your Student Lifestyle OS awaits
            </p>
          </div>
        </div>

        {/* Clerk SignUp — path routing props enforce sub-path handling */}
        <div className="w-full animate-fade-in-up delay-200">
          <SignUp
            path="/auth/register"
            routing="path"
            signInUrl="/auth/login"
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: "#22c55e",
                colorBackground: "#1e293b",
                colorDanger: "#ef4444",
                borderRadius: "16px",
                fontFamily: "Poppins, sans-serif",
              },
              elements: {
                rootBox: { width: "100%" },
                card: {
                  background: "rgba(30, 41, 59, 0.85)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                  borderRadius: "24px",
                  width: "100%",
                },
                headerTitle: { color: "#f8fafc", fontWeight: "800" },
                headerSubtitle: { color: "#94a3b8" },
                formButtonPrimary: {
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: "0 0 20px rgba(34,197,94,0.4)",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "15px",
                },
                footerActionLink: { color: "#22c55e", fontWeight: "600" },
                formFieldInput: { borderRadius: "12px" },
                dividerLine: { background: "rgba(255,255,255,0.08)" },
                dividerText: { color: "#64748b" },
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
