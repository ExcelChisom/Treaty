"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function logMeal(foodId: string, price: number, foodName: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized: No user ID found.");
  }

  const now = new Date().toISOString();

  // 1. Log the meal
  const { error: mealError } = await supabase.from("meal_logs").insert({
    user_id: userId,
    food_id: foodId,
    quantity: 1,
    consumed_at: now,
  });

  if (mealError) {
    console.error("Error inserting into meal_logs:", mealError);
    throw new Error("Failed to log meal.");
  }

  // 2. Log the transaction (expense)
  const { error: transactionError } = await supabase.from("expenses").insert({
    user_id: userId,
    amount: price,
    category: "Food",
    description: foodName,
    created_at: now,
  });

  if (transactionError) {
    console.error("Error inserting into expenses:", transactionError);
    throw new Error("Failed to log expense.");
  }

  revalidatePath("/dashboard/food");

  return { success: true };
}
