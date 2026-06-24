"use client";

import { useState, useTransition } from "react";
import { logMeal } from "@/actions/food";
import { Food } from "@/types/database";

interface LogMealButtonProps {
  food: Food;
}

export default function LogMealButton({ food }: LogMealButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLog = () => {
    setIsSuccess(false);
    setErrorMsg("");

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

  let buttonText = "Log Meal";
  if (isPending) buttonText = "Logging...";
  if (isSuccess) buttonText = "Logged! ✅";
  if (errorMsg) buttonText = errorMsg;

  return (
    <button
      onClick={handleLog}
      disabled={isPending || isSuccess}
      className="w-full mt-2 py-3 rounded-lg font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60 bg-[#00C853]"
    >
      {buttonText}
    </button>
  );
}
