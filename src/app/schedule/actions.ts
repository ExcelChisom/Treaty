"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export type TaskType = "assignment" | "exam" | "class" | "personal";
export type Priority = "low" | "medium" | "high";

export interface AddTaskPayload {
  title: string;
  course_code?: string;
  task_type: TaskType;
  priority: Priority;
  due_date?: string;
  due_time?: string;
}

export interface ToggleTaskPayload {
  task_id: string;
  is_completed: boolean;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addTask(payload: AddTaskPayload): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };

  if (!payload.title?.trim())
    return { success: false, error: "Task title is required." };

  try {
    const supabase = await createServiceClient();
    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: payload.title.trim(),
      course_code: payload.course_code?.trim() ?? null,
      task_type: payload.task_type,
      priority: payload.priority,
      due_date: payload.due_date ?? null,
      due_time: payload.due_time ?? null,
      is_completed: false,
    });

    if (error) {
      console.error("[addTask] Supabase error:", error.message);
      return { success: false, error: "Failed to add task." };
    }

    revalidatePath("/schedule");
    return { success: true };
  } catch (err) {
    console.error("[addTask] Unexpected:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function toggleTask(
  payload: ToggleTaskPayload
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };

  try {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        is_completed: payload.is_completed,
        completed_at: payload.is_completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.task_id)
      .eq("user_id", userId); // RLS-equivalent: only update own tasks

    if (error) {
      console.error("[toggleTask] Supabase error:", error.message);
      return { success: false, error: "Failed to update task." };
    }

    revalidatePath("/schedule");
    return { success: true };
  } catch (err) {
    console.error("[toggleTask] Unexpected:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
