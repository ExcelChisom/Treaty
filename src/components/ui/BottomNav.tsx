"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Nav Item Definition ────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} />
        <path d="M3 9H21" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} />
        <path d="M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8" cy="14" r="1.2" fill="currentColor" />
        <circle cx="12" cy="14" r="1.2" fill="currentColor" />
        <circle cx="16" cy="14" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/map",
    label: "Map",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
      </svg>
    ),
  },
  {
    href: "/finance",
    label: "Wallet",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
        <path d="M2 10H22" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} />
        <circle cx="7" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
      </svg>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 border-t border-white/10"
      aria-label="Main navigation"
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <ul className="flex items-center justify-around px-2 py-2" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-90 group"
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                {/* Icon */}
                <div
                  className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive
                      ? "var(--treaty-green-glow)"
                      : "transparent",
                    color: isActive
                      ? "var(--treaty-green)"
                      : "var(--text-muted)",
                  }}
                >
                  {item.icon(isActive)}

                  {/* Active dot indicator */}
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--treaty-green)" }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                  style={{
                    color: isActive ? "var(--treaty-green)" : "var(--text-muted)",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
