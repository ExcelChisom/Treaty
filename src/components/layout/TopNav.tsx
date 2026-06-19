"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex sticky top-0 z-50 w-full bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10 items-center justify-between px-8 py-4">
      {/* Left: Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 transition-all active:scale-95">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--treaty-green), var(--treaty-green-dark))",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <path d="M8 12H36M22 12V36" stroke="white" strokeWidth="5" strokeLinecap="round" />
            <path
              d="M14 26L19 31L30 20"
              stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-white font-black text-xl tracking-tight">Treaty</span>
      </Link>

      {/* Right: Menu / Profile */}
      <div className="flex items-center gap-6">
        <div className="flex gap-6 text-sm font-semibold text-text-muted">
          <Link href="/dashboard" className={`hover:text-white transition-colors ${pathname.includes('/dashboard') ? 'text-treaty-green' : ''}`}>Home</Link>
          <Link href="/schedule" className={`hover:text-white transition-colors ${pathname.includes('/schedule') ? 'text-treaty-green' : ''}`}>Schedule</Link>
          <Link href="/finance" className={`hover:text-white transition-colors ${pathname.includes('/finance') ? 'text-treaty-green' : ''}`}>Wallet</Link>
        </div>
        <button className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
