import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treaty — Student Lifestyle OS",
  description:
    "Treaty is a mobile-first Student Lifestyle Operating System for Covenant University. Track your food, finances, fitness, and schedule — powered by AI.",
  keywords: [
    "Treaty",
    "student app",
    "Covenant University",
    "student OS",
    "food tracker",
    "finance tracker",
    "fitness",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Treaty",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          {/*
           * Treaty Mobile Shell
           * ─────────────────────────────────────────────────────────
           * max-w-md (448px) — strict mobile-first constraint.
           * The outer wrapper fills the full viewport with a slate
           * background so the shell "floats" on wider screens.
           * ─────────────────────────────────────────────────────────
           */}
          <div className="min-h-svh bg-slate-100 flex justify-center">
            <div className="treaty-shell w-full">{children}</div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
