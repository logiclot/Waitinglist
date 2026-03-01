import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }
  const role = (session.user.role || "BUSINESS") as "ADMIN" | "BUSINESS" | "EXPERT";
  
  let isFoundingExpert = false;
  if (role === "EXPERT") {
    const expert = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: { isFoundingExpert: true }
    });
    isFoundingExpert = expert?.isFoundingExpert || false;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} isFoundingExpert={isFoundingExpert} />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
