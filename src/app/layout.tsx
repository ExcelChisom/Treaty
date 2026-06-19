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
          <div className="min-h-screen bg-[#0F172A] text-white selection:bg-treaty-green/30 flex">
            
            {/* Desktop Left Branding Column */}
            <aside className="hidden lg:flex flex-col w-[40%] fixed left-0 h-screen p-12 justify-center border-r border-[#334155] bg-[#0F172A] z-10">
              <div className="max-w-md mx-auto w-full">
                {/* Treaty Logo */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))" }}>
                    <svg width="24" height="24" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                      <path d="M8 12H36M22 12V36" stroke="white" strokeWidth="5" strokeLinecap="round" />
                      <path d="M14 26L19 31L30 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-white font-black text-2xl tracking-tight">Treaty</span>
                </div>

                <h1 className="text-4xl font-bold mt-6 text-white leading-tight">Your Campus.<br/>Your Way.</h1>
                <p className="text-gray-400 mt-4 text-sm leading-relaxed max-w-sm">
                  The all-in-one campus companion for Covenant University students. Plan your day, discover the best spots, manage expenses and make smarter choices.
                </p>

                {/* Shreddy Mascot */}
                <div className="mt-12 flex flex-col items-start gap-4">
                  <div className="w-32 h-32 rounded-full bg-[#00C853]/20 flex items-center justify-center text-7xl shrink-0">
                    🦖
                  </div>
                  <div>
                    <h2 className="text-[#00C853] font-bold text-lg">Shreddy</h2>
                    <p className="text-gray-400 text-sm mt-1 leading-snug">Your hype buddy and campus guide.<br/>Always here to help you win your day!</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right App Column */}
            <div className="flex-1 lg:ml-[40%] flex flex-col min-h-screen w-full relative pb-24 lg:pb-0">
              <TopNav />
              <div className="flex-1 w-full flex justify-center">
                {children}
              </div>
              <BottomNav />
            </div>

          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
