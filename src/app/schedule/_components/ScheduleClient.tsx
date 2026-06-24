"use client";

import React from "react";
import { useShreddy } from "@/context/ShreddyProvider";

export default function ScheduleClient(props: any) {
  const { shreddyReact } = useShreddy();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-[18px] font-bold text-treaty-text-main"><i className="fas fa-chevron-left mr-2 text-[14px]"></i> June 2026</h3>
        <span className="text-treaty-text-muted"><i className="fas fa-chevron-right text-[14px]"></i></span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <span key={i} className="text-center py-2 text-[13px] text-treaty-text-muted">{day}</span>
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={`empty-${i}`} className="text-center py-2 text-[13px] text-treaty-text-muted">{i+1}</span>
        ))}
        <span className="text-center py-2 text-[13px] text-white font-bold bg-treaty-primary rounded-lg shadow-[0_4px_12px_rgba(0,210,106,0.3)]">15</span>
        <span className="text-center py-2 text-[13px] text-treaty-text-muted">16</span>
        <span className="text-center py-2 text-[13px] text-treaty-text-muted">17</span>
      </div>

      <div className="font-semibold text-treaty-text-main mb-1">Today's Tasks</div>
      
      <div 
        onClick={() => shreddyReact('schedule', 'deadline')}
        className="flex items-center gap-3 p-3.5 rounded-[14px] bg-white/70 backdrop-blur-md mb-2.5 cursor-pointer shadow-sm border border-white/80 transition-transform active:scale-95"
      >
        <div className="w-2 h-2 rounded-full bg-treaty-red shrink-0"></div>
        <div>
          <div className="font-medium text-treaty-text-main text-[14px]">CST Assignment Deadline</div>
          <div className="text-[12px] text-treaty-text-muted mt-0.5">9:00 AM • 2 hours left</div>
        </div>
      </div>
    </div>
  );
}
