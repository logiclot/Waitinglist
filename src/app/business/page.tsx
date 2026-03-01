import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPersonalizedRecommendations } from "@/lib/recommendation-engine";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";

export default async function BusinessDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  let recommendations: Awaited<ReturnType<typeof getPersonalizedRecommendations>> = [];

  try {
    recommendations = await getPersonalizedRecommendations(session.user.id);
  } catch {
    // Fail silently — the dashboard still renders with empty recommendations
    recommendations = [];
  }

  return <BusinessOverview recommendations={recommendations} />;
}
