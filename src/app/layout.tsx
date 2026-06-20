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
          <div className="flex min-h-screen w-full bg-[#0F172A]">
            
            {/* 2. The Left Sidebar (Branding & Shreddy) */}
            <aside className="hidden lg:flex flex-col w-[45%] fixed left-0 top-0 h-screen p-16 justify-center border-r border-[#334155] bg-[#0F172A] z-20">
              <h1 className="text-3xl font-bold text-white mb-8">Treaty</h1>
              <h2 className="text-5xl font-bold text-white leading-tight mb-4">Your Campus.<br/>Your Way.</h2>
              <p className="text-gray-400 text-lg max-w-md mb-12">The all-in-one campus companion for Covenant University students. Plan your day, discover the best spots, manage expenses and make smarter choices.</p>
              <div className="w-48 h-48 bg-[#00C853]/20 rounded-full flex items-center justify-center text-7xl mb-6">🦖</div>
              <h3 className="text-[#00C853] text-xl font-bold">Shreddy</h3>
              <p className="text-gray-400">Your hype buddy and campus guide. Always here to help you win your day!</p>
            </aside>

            {/* 3. The Right Pane (App Feed) & TopNav Confinement */}
            <div className="flex-1 lg:ml-[45%] flex flex-col min-h-screen relative">
              <TopNav />
              <main className="flex-1 w-full">
                {children}
              </main>
              <BottomNav />
            </div>

          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
