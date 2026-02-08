import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }

  // @ts-expect-error: role is part of user session
  const role = session.user.role || "SPECIALIST"; 

  // Basic Gating (Middleware handles most, but double check)
  if (role !== "SPECIALIST" && role !== "ADMIN") {
     redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="SPECIALIST" />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
