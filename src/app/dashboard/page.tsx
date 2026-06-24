import ShreddyCard from "@/components/ui/ShreddyCard";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardHome() {
  const user = await currentUser();
  const firstName = user?.firstName || "Carlin";

  return (
    <div className="animate-fade-up pt-6">
      <div className="px-1 flex justify-between items-start bg-transparent mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-treaty-text-main">Hey {firstName}! 👋</h1>
          <p className="text-[14px] text-treaty-text-muted mt-0.5">Your campus, your rules.</p>
        </div>
        <div className="bg-treaty-gold text-white px-3.5 py-1.5 rounded-[20px] text-[11px] font-bold shadow-[0_4px_12px_rgba(255,184,0,0.3)]">
          PREMIUM
        </div>
      </div>

      <ShreddyCard />

      <div className="grid grid-cols-2 gap-4">
        {/* Wallet */}
        <Link href="/finance" className="bg-white/70 backdrop-blur-md rounded-[24px] p-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/80 transition-transform active:scale-95">
          <div className="text-[11px] font-semibold text-treaty-text-muted uppercase mb-2 flex items-center gap-1.5">
            <i className="fas fa-wallet text-[#00D26A]"></i> Wallet
          </div>
          <div className="text-[22px] font-extrabold text-treaty-text-main">₦1,250.00</div>
          <div className="text-[12px] text-treaty-text-muted mt-1">+ ₦150 today</div>
        </Link>

        {/* Food */}
        <Link href="/dashboard/food" className="bg-white/70 backdrop-blur-md rounded-[24px] p-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/80 transition-transform active:scale-95">
          <div className="text-[11px] font-semibold text-treaty-text-muted uppercase mb-2 flex items-center gap-1.5">
            <i className="fas fa-utensils text-[#FF5A5F]"></i> Food
          </div>
          <div className="text-[22px] font-extrabold text-treaty-text-main">Gizdodo</div>
          <div className="text-[12px] text-treaty-text-muted mt-1">Caf 2 • ₦2,000</div>
        </Link>

        {/* Fitness */}
        <Link href="/fitness" className="bg-white/70 backdrop-blur-md rounded-[24px] p-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/80 transition-transform active:scale-95 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-treaty-text-muted uppercase mb-2 flex items-center gap-1.5">
            <i className="fas fa-dumbbell text-[#FF7A00]"></i> Fitness
          </div>
          <div className="flex justify-between items-end mt-1">
            <div>
              <div className="text-[22px] font-extrabold text-treaty-text-main">450 cal</div>
              <div className="text-[12px] text-treaty-text-muted mt-1">Remaining</div>
            </div>
            <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[12px] font-extrabold text-treaty-text-main shrink-0" style={{ background: "conic-gradient(#FF7A00 65%, #E2E8F0 0)" }}>
              65%
            </div>
          </div>
        </Link>

        {/* Schedule */}
        <Link href="/schedule" className="bg-white/70 backdrop-blur-md rounded-[24px] p-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/80 transition-transform active:scale-95">
          <div className="text-[11px] font-semibold text-treaty-text-muted uppercase mb-2 flex items-center gap-1.5">
            <i className="fas fa-calendar-day text-[#6D5DF6]"></i> Schedule
          </div>
          <div className="text-[22px] font-extrabold text-treaty-text-main leading-tight">CST Deadline</div>
          <div className="text-[12px] text-treaty-text-muted mt-1">Due tomorrow, 9:00 AM</div>
        </Link>
      </div>

      <div className="mt-4 p-4 rounded-[24px] bg-white/70 backdrop-blur-md border border-white/80 flex flex-col gap-1.5">
        <span className="font-semibold text-treaty-text-main block">Today's Insights</span>
        <span className="bg-[#F1F5F9] px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block w-fit">🔥 3 Day Streak</span>
        <div className="flex justify-between mt-1">
          <span className="text-[12px] text-treaty-text-muted">Spent on food</span>
          <span className="font-semibold text-treaty-text-main">₦2,500</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[12px] text-treaty-text-muted">Budget left</span>
          <span className="font-semibold text-[#FF7A00]">₦800</span>
        </div>
      </div>
    </div>
  );
}
