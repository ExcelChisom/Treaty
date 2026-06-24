"use client";

import React from "react";
import { useShreddy } from "@/context/ShreddyProvider";

export default function ShreddyAvatar() {
  const { eyeAnimation, mouthState } = useShreddy();

  return (
    <div className="w-[70px] h-[70px] shrink-0 animate-float">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#00D26A" stroke="#00B85C" strokeWidth="4" />
        
        {/* Left Eye */}
        <g 
          className="transition-transform duration-150 origin-center"
          style={{
            transform: eyeAnimation === "blink" || eyeAnimation === "wink-left" 
              ? "scaleY(0.05)" 
              : "none",
            transformOrigin: eyeAnimation === "wink-left" ? "36px 40px" : "center"
          }}
        >
          <circle cx="35" cy="40" r="7" fill="white" />
          <circle cx="36" cy="40" r="3.5" fill="#1E293B" />
        </g>
        
        {/* Right Eye */}
        <g 
          className="transition-transform duration-150 origin-center"
          style={{
            transform: eyeAnimation === "blink" || eyeAnimation === "wink-right" 
              ? "scaleY(0.05)" 
              : "none",
            transformOrigin: eyeAnimation === "wink-right" ? "64px 40px" : "center"
          }}
        >
          <circle cx="65" cy="40" r="7" fill="white" />
          <circle cx="66" cy="40" r="3.5" fill="#1E293B" />
        </g>
        
        {/* Mouth */}
        <path
          className="transition-all duration-300"
          d={mouthState === "smile" ? "M35 55 Q50 68 65 55" : "M35 58 Q50 78 65 58"}
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Teeth / T */}
        <rect x="40" y="70" width="20" height="12" rx="4" fill="white" opacity="0.8" />
        <text x="50" y="80" fontSize="12" fontWeight="900" textAnchor="middle" fill="#00B85C">
          T
        </text>
      </svg>
    </div>
  );
}
