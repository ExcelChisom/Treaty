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
    <div className="w-full max-w-[1280px] mx-auto h-[95vh] md:h-[90vh] max-h-[900px] bg-treaty-bg rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
      
      {/* Desktop Sidebar (md:flex) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-md border-r border-white/80 shrink-0 p-6 z-20">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-treaty-primary tracking-tight">Treaty</h1>
          <p className="text-xs text-treaty-text-muted mt-1 font-medium">Student Lifestyle OS</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => triggerAnimation("wink-right", 200)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 ${
                  isActive ? "bg-treaty-primary/10" : "hover:bg-white/50"
                }`}
              >
                <i
                  className={`fas ${item.icon} text-[18px] transition-all duration-300 w-6 text-center ${
                    isActive ? "text-treaty-primary" : "text-treaty-text-muted"
                  }`}
                ></i>
                <span
                  className={`text-[14px] ${
                    isActive ? "text-treaty-primary font-bold" : "text-treaty-text-muted font-medium"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="p-4 rounded-[16px] bg-gradient-to-br from-treaty-primary to-[#00B85C] text-white flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shrink-0">
              🦖
            </div>
            <div>
              <p className="text-xs font-bold opacity-90">Premium</p>
              <p className="text-[10px] opacity-75">All access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-[100px] md:pb-6 md:pt-6 scroll-smooth no-scrollbar relative w-full">
        {children}
      </div>

      {/* Mobile Bottom Nav (md:hidden) */}
      <div className="md:hidden absolute bottom-0 w-full h-[80px] bg-white/60 backdrop-blur-md border-t border-white/80 flex justify-around items-center px-2 pb-3 z-20">
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
