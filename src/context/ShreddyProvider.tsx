"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type EyeAnimation = "blink" | "wink-right" | "wink-left" | null;
export type MouthState = "smile" | "speech";

interface ShreddyContextType {
  message: string;
  eyeAnimation: EyeAnimation;
  mouthState: MouthState;
  isBouncing: boolean;
  setMessage: (msg: string) => void;
  triggerAnimation: (eye: EyeAnimation, duration?: number) => void;
  shreddyReact: (type: string, data?: string) => void;
  triggerTap: () => void;
}

const ShreddyContext = createContext<ShreddyContextType | undefined>(undefined);

const QUOTES = [
  "Fufu before a 2-hour lecture? Bold strategy.",
  "You have ₦650 left. The shawarma stand sees opportunity.",
  "One workout closer to becoming unstoppable.",
  "Deadline tomorrow. Future-you says thank you.",
  "Buying from Caf 2 instead of Caf 1 could save you ₦250.",
  "Your budget says ₦800. Your taste buds say Burger Supreme. One needs counselling.",
  "Burger Supreme detected. Your athletic silhouette just sighed dramatically.",
];

export function ShreddyProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("I'm watching you.");
  const [eyeAnimation, setEyeAnimation] = useState<EyeAnimation>(null);
  const [mouthState, setMouthState] = useState<MouthState>("smile");
  const [isBouncing, setIsBouncing] = useState(false);

  // Auto-blink every 4.5s
  useEffect(() => {
    const interval = setInterval(() => {
      triggerAnimation("blink", 200);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const triggerAnimation = (eye: EyeAnimation, duration = 300) => {
    setEyeAnimation(eye);
    if (eye === "wink-right" || eye === "wink-left") {
      setMouthState("speech");
    }
    setTimeout(() => {
      setEyeAnimation(null);
      setMouthState("smile");
    }, duration);
  };

  const bounceCard = () => {
    setIsBouncing(false);
    setTimeout(() => setIsBouncing(true), 10);
    setTimeout(() => setIsBouncing(false), 500);
  };

  const triggerTap = () => {
    let nextMsg = QUOTES[0];
    const currentIndex = QUOTES.indexOf(message);
    if (currentIndex !== -1) {
      nextMsg = QUOTES[(currentIndex + 1) % QUOTES.length];
    }
    setMessage(nextMsg);
    triggerAnimation("blink", 300);
    bounceCard();
  };

  const shreddyReact = (type: string, data?: string) => {
    let msg = "";
    let anim: EyeAnimation = "blink";

    if (type === "food") {
      if (data === "Gizdodo") msg = "Gizdodo? Your eyelids are about to negotiate with gravity.";
      else if (data === "Chicken Burger") msg = "Burger Supreme. Your gym session just gasped.";
      else msg = `Ordering ${data}? Let me check your wallet first.`;
    } else if (type === "wallet") {
      if (data === "fund") {
        msg = "Money coming in! Shreddy approves.";
        anim = "wink-right";
      } else {
        msg = "Spending? Make sure you track it in the ledger.";
      }
    } else if (type === "schedule") {
      if (data === "deadline") msg = "Deadline in 2 hours. Don't make future-you suffer.";
      else msg = "Planning ahead. I respect it.";
    } else if (type === "home") {
      msg = "Checking the home base. I see you.";
      anim = "wink-right";
    }

    setMessage(msg || "I'm watching you.");
    triggerAnimation(anim, 300);
    bounceCard();
  };

  return (
    <ShreddyContext.Provider
      value={{
        message,
        eyeAnimation,
        mouthState,
        isBouncing,
        setMessage,
        triggerAnimation,
        shreddyReact,
        triggerTap,
      }}
    >
      {children}
    </ShreddyContext.Provider>
  );
}

export function useShreddy() {
  const context = useContext(ShreddyContext);
  if (context === undefined) {
    throw new Error("useShreddy must be used within a ShreddyProvider");
  }
  return context;
}
