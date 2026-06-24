"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useShreddy } from "@/context/ShreddyProvider";

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { triggerAnimation } = useShreddy();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: "fa-house" },
    { name: "Food", href: "/dashboard/food", icon: "fa-utensils" },
    { name: "Wallet", href: "/finance", icon: "fa-wallet" },
    { name: "Fitness", href: "/fitness", icon: "fa-dumbbell" },
    { name: "Calendar", href: "/schedule", icon: "fa-calendar-day" },
    { name: "Profile", href: "/profile", icon: "fa-user" },
  ];

  return (
    <div className="w-full max-w-[800px] h-[95vh] max-h-[900px] bg-treaty-bg rounded-[24px] overflow-hidden flex flex-col shadow-2xl relative">
      <div className="flex-1 overflow-y-auto px-6 pb-[100px] scroll-smooth no-scrollbar">
        {children}
      </div>

      <div className="absolute bottom-0 w-full h-[80px] bg-white/60 backdrop-blur-md border-t border-white/80 flex justify-around items-center px-2 pb-3 z-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => triggerAnimation("wink-right", 200)}
              className={`flex flex-col items-center gap-1 cursor-pointer px-4 py-2 rounded-2xl transition-all duration-300 ${
                isActive ? "bg-[#00D26A]/10" : ""
              }`}
            >
              <i
                className={`fas ${item.icon} text-[22px] transition-all duration-300 ${
                  isActive ? "text-treaty-primary -translate-y-[2px]" : "text-treaty-text-muted"
                }`}
              ></i>
              <span
                className={`text-[10px] ${
                  isActive ? "text-treaty-primary font-bold" : "text-treaty-text-muted font-medium"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
