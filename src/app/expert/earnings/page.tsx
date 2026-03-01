import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExpertEarnings } from "@/actions/expert";
import { EarningsClient } from "./EarningsClient";

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/sign-in");

  const data = await getExpertEarnings();
  if ("error" in data) redirect("/dashboard");

  return <EarningsClient data={data} />;
}
