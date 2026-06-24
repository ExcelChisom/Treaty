import { NextResponse } from "next/server";
import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    if (!secret) {
      console.error("Missing Paystack secret key.");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid Paystack signature.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const email = event.data?.customer?.email;

      if (!email) {
        console.error("No email found in Paystack event payload.");
        return NextResponse.json({ message: "Missing email" }, { status: 400 });
      }

      const client = await clerkClient();
      const userList = await client.users.getUserList({ emailAddress: [email] });

      if (userList.data && userList.data.length > 0) {
        const user = userList.data[0];
        await client.users.updateUser(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            isPremium: true,
          },
        });
        console.log(`Successfully upgraded user ${user.id} to premium.`);
      } else {
        console.warn(`User with email ${email} not found in Clerk.`);
      }
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
