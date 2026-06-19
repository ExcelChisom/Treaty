import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/ui/BottomNav";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

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
      <html lang="en" className={`${poppins.variable} font-poppins`} suppressHydrationWarning>
        <body>
          <div className="min-h-screen bg-[#0F172A] text-white selection:bg-treaty-green/30 pb-24 md:pb-8 flex flex-col">
            <TopNav />
            <div className="flex-1">
              {children}
            </div>
            <BottomNav />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
