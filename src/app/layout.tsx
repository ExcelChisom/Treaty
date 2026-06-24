import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ShreddyProvider } from "@/context/ShreddyProvider";
import Shell from "@/components/layout/Shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Treaty — Student Lifestyle OS",
  description: "Treaty is a mobile-first Student Lifestyle Operating System for Covenant University.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00D26A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} font-inter`} suppressHydrationWarning>
        <head>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        </head>
        <body className="bg-slate-200 flex justify-center items-center min-h-screen p-5">
          <ShreddyProvider>
            <Shell>{children}</Shell>
          </ShreddyProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
