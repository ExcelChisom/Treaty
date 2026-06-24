"use client";

import React from "react";
import ShreddyAvatar from "./ShreddyAvatar";
import { useShreddy } from "@/context/ShreddyProvider";

export default function ShreddyCard() {
  const { message, isBouncing, triggerTap } = useShreddy();

  return (
    <div
      onClick={triggerTap}
      className={`bg-gradient-to-br from-[#00D26A] to-[#00B85C] rounded-[24px] p-5 mb-6 text-white flex items-center gap-[18px] shadow-[0_12px_32px_rgba(0,210,106,0.3)] cursor-pointer transition-transform duration-200 active:scale-95 ${
        isBouncing ? "animate-bounce-card" : ""
      }`}
    >
      <ShreddyAvatar />
      
      <div className="flex-1">
        <h4 className="text-[13px] font-bold opacity-80 mb-1 tracking-wide">
          ⚡ SHREDDY SAYS:
        </h4>
        <p className="text-[15px] font-medium leading-relaxed">
          "{message}"
        </p>
        <span className="text-[10px] opacity-60 mt-2 block">
          Tap me for more advice
        </span>
      </div>
    </div>
  );
}
