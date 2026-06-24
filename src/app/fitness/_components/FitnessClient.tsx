"use client";

import React from "react";

export default function FitnessClient(props: any) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5 rounded-[24px] p-5 bg-white/70 backdrop-blur-md border border-white/80">
        <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-[18px] font-extrabold shrink-0" style={{ background: "conic-gradient(#FF7A00 65%, #E2E8F0 0)" }}>
          65%
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-treaty-text-main">Goal: Lose Weight</h3>
          <p className="text-[12px] text-treaty-text-muted mt-1">Target: 75kg • Current: 81kg</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-[24px] p-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center text-[14px] font-semibold text-treaty-text-main mb-2.5">
          <span>Today's Intake</span>
          <span>1,450 / 2,000 cal</span>
        </div>
        <div className="flex gap-[6px] h-2 rounded overflow-hidden">
          <div className="bg-treaty-red" style={{ flex: 30 }}></div>
          <div className="bg-treaty-gold" style={{ flex: 45 }}></div>
          <div className="bg-treaty-purple" style={{ flex: 25 }}></div>
        </div>
      </div>
    </div>
  );
}
