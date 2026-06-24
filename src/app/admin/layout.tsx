import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // The Gatekeeper
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-poppins">
      {children}
    </div>
  );
}
