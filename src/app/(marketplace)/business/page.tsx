import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function BusinessDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return <BusinessOverview />;
}
