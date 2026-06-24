"use client";

import { useState, useTransition } from "react";
import { logMeal } from "@/actions/food";
import { Food } from "@/types/database";
import { useShreddy } from "@/context/ShreddyProvider";

interface LogMealButtonProps {
  food: Food;
}

export default function LogMealButton({ food }: LogMealButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { shreddyReact } = useShreddy();

  const handleLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSuccess(false);
    setErrorMsg("");

    shreddyReact("food", food.name);

    startTransition(async () => {
      try {
        const result = await logMeal(food.id, food.price, food.name);
        if (result.success) {
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to log.");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    });
  };

  let buttonText = "Log";
  if (isPending) buttonText = "Logging...";
  if (isSuccess) buttonText = "Logged! ✅";
  if (errorMsg) buttonText = errorMsg;

  return (
    <button
      onClick={handleLog}
      disabled={isPending || isSuccess}
      className="mt-2 py-1.5 px-4 rounded-full font-bold text-white text-xs transition-transform active:scale-95 disabled:opacity-60 bg-treaty-primary shadow-[0_4px_12px_rgba(0,210,106,0.3)]"
    >
      {buttonText}
    </button>
  );
}
