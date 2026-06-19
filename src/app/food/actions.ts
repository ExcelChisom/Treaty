"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface LogMealPayload {
  food_id?: string;
  name: string;
  meal_type: MealType;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function logMeal(payload: LogMealPayload): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };

  if (!payload.name?.trim())
    return { success: false, error: "Meal name is required." };
  if (!payload.calories || payload.calories < 0)
    return { success: false, error: "Enter a valid calorie count." };

  try {
    const supabase = await createServiceClient();
    const { error } = await supabase.from("meal_logs").insert({
      user_id: userId,
      food_id: payload.food_id ?? null,
      name: payload.name.trim(),
      meal_type: payload.meal_type,
      calories: Math.round(payload.calories),
      protein_g: payload.protein_g ?? 0,
      carbs_g: payload.carbs_g ?? 0,
      fat_g: payload.fat_g ?? 0,
    });

    if (error) {
      console.error("[logMeal] Supabase error:", error.message);
      return { success: false, error: "Failed to log meal. Try again." };
    }

    revalidatePath("/food");
    return { success: true };
  } catch (err) {
    console.error("[logMeal] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
