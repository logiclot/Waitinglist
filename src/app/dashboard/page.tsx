import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { ExpertOverview } from "@/components/dashboard/ExpertOverview";
import { getExpertOverviewData } from "@/actions/expert";
import { getPersonalizedRecommendations } from "@/lib/recommendation-engine";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const role = (session.user as { role?: string }).role;

  if (role === "EXPERT") {
    const data = await getExpertOverviewData();
    if ("error" in data) redirect("/auth/sign-in");
    return <ExpertOverview data={data} />;
  }

  if (role === "BUSINESS") {
    redirect("/business");
  }

  if (role === "ADMIN") {
    redirect("/admin");
  }

  // Fallback (e.g. USER role before onboarding)
  let recommendations: Awaited<ReturnType<typeof getPersonalizedRecommendations>> = [];
  try {
    recommendations = await getPersonalizedRecommendations(session.user.id);
  } catch {
    recommendations = [];
  }

  return <BusinessOverview recommendations={recommendations} />;
}
