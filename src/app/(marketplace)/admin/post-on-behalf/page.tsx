import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBusinessAccounts, getAdminPostedJobs } from "@/actions/admin";
import { PostOnBehalfClient } from "./PostOnBehalfClient";

export default async function AdminPostOnBehalfPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/auth/sign-in");

  const [accountsRes, jobsRes] = await Promise.all([
    getBusinessAccounts(),
    getAdminPostedJobs(),
  ]);

  const businesses = "businesses" in accountsRes ? (accountsRes.businesses ?? []) : [];
  const jobs = "jobs" in jobsRes ? (jobsRes.jobs ?? []) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Post on Behalf of Business
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a Discovery Scan or Custom Project for a business account and generate a payment link to send them.
        </p>
      </div>

      <PostOnBehalfClient businesses={businesses} recentJobs={jobs} />
    </div>
  );
}
