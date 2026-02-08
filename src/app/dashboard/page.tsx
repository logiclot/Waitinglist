import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview"; // Fallback only
import { ExpertOverview } from "@/components/dashboard/ExpertOverview";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // @ts-expect-error: role is part of user session
  const role = session.user.role;

  if (role === "SPECIALIST") {
    return <ExpertOverview />;
  }

  if (role === "BUSINESS") {
    // Middleware should have redirected to /business, but if not:
    redirect("/business");
  }

  // Admin or others
  if (role === "ADMIN") {
    redirect("/admin");
  }

  // Fallback
  return <BusinessOverview />;
}
