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
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.7"}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
      </svg>
    ),
  },
  {
    href: "/finance",
    label: "Finance",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="2" y="5" width="20" height="14" rx="2"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.7"}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path
          d="M2 10H22"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.7"}
        />
        <circle cx="7" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/food",
    label: "Food",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2C7 2 3 6.5 3 10C3 13 5 16 8 17.5V21H16V17.5C19 16 21 13 21 10C21 6.5 17 2 12 2Z"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.7"}
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path
          d="M9 21H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/fitness",
    label: "Fitness",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 6.5H4C3.17 6.5 2.5 7.17 2.5 8V16C2.5 16.83 3.17 17.5 4 17.5H6.5"
          stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round"
        />
        <path
          d="M17.5 6.5H20C20.83 6.5 21.5 7.17 21.5 8V16C21.5 16.83 20.83 17.5 20 17.5H17.5"
          stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round"
        />
        <rect
          x="6.5" y="9" width="11" height="6" rx="1"
          stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"}
          fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.2 : 0}
        />
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3" y="4" width="18" height="18" rx="2"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.7"}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.1 : 0}
        />
        <path d="M3 9H21" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} />
        <path d="M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8" cy="14" r="1.2" fill="currentColor" />
        <circle cx="12" cy="14" r="1.2" fill="currentColor" />
        <circle cx="16" cy="14" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
      aria-label="Main navigation"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
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
