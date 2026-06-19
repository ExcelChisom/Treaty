"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export type LogType = "weight" | "workout" | "steps";

export interface LogFitnessPayload {
  log_type: LogType;
  weight_kg?: number;
  steps?: number;
  duration_min?: number;
  activity?: string;
  notes?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function logFitness(
  payload: LogFitnessPayload
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };

  if (payload.log_type === "weight") {
    if (!payload.weight_kg || payload.weight_kg <= 0 || payload.weight_kg > 300)
      return { success: false, error: "Enter a valid weight (1–300 kg)." };
  }
  if (payload.log_type === "workout" && !payload.activity?.trim())
    return { success: false, error: "Enter an activity name." };

  try {
    const supabase = await createServiceClient();
    const { error } = await supabase.from("fitness_logs").insert({
      user_id: userId,
      log_type: payload.log_type,
      weight_kg: payload.weight_kg ?? null,
      steps: payload.steps ?? null,
      duration_min: payload.duration_min ?? null,
      activity: payload.activity?.trim() ?? null,
      notes: payload.notes?.trim() ?? null,
    });

    if (error) {
      console.error("[logFitness] Supabase error:", error.message);
      return { success: false, error: "Failed to save. Try again." };
    }

    revalidatePath("/fitness");
    return { success: true };
  } catch (err) {
    console.error("[logFitness] Unexpected:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
