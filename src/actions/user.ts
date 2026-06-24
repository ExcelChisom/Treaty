"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function completeUserOnboarding(nickname: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User is not authenticated");
  }
  
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      onboardingComplete: true,
      nickname,
    },
  });
}
