import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Search, Sparkles, Crown } from "lucide-react";

export default async function JobsIndexPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in?next=/jobs");
  }

  const isBuyer = session.user.role === "BUSINESS";
  const isSpecialist = session.user.role === "SPECIALIST";

  let jobs = [];
  let isElite = false;

  if (isBuyer) {
    jobs = await prisma.jobPost.findMany({
      where: { buyerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bids: true } } }
    });
  } else if (isSpecialist) {
    const specialist = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id }
    });
    isElite = specialist?.tier === "ELITE";

    if (isElite) {
      jobs = await prisma.jobPost.findMany({
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { bids: true } } }
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          {isBuyer ? "My Job Requests" : "Open Jobs"}
        </h1>
        {isBuyer && (
          <div className="flex gap-3">
             <Link
              href="/jobs/discovery"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-bold hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"
            >
              <Sparkles className="h-4 w-4" /> Discovery Scan (€50)
            </Link>
            <Link
              href="/jobs/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
            >
              <Crown className="h-4 w-4" /> Custom Project (€100)
            </Link>
          </div>
        )}
      </div>

      {isSpecialist && !isElite ? (
        <div className="bg-secondary/10 border border-border rounded-xl p-12 text-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Elite Access Only</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Job requests are available to Elite specialists. Reach Elite status by
            delivering successful implementations and maintaining high client
            satisfaction.
          </p>
          <Link
            href="/for-experts"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
          >
            View ranking requirements
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <h3 className="text-lg font-medium mb-1">
                {isBuyer ? "No jobs posted yet" : "No open jobs available"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {isBuyer
                  ? "Start by launching a Discovery Scan or posting a Custom Project to get proposals from Elite specialists."
                  : "Check back later for new opportunities."}
              </p>
              {isBuyer && (
                <div className="flex justify-center gap-4">
                    <Link
                      href="/jobs/discovery"
                      className="inline-flex items-center text-primary hover:underline font-medium"
                    >
                      <Sparkles className="mr-2 h-4 w-4" /> Launch Discovery Scan
                    </Link>
                    <Link
                      href="/jobs/new"
                      className="inline-flex items-center text-primary hover:underline font-medium"
                    >
                      <Crown className="mr-2 h-4 w-4" /> Post Custom Project
                    </Link>
                </div>
              )}
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{job.title}</h3>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                        {job.category}
                      </span>
                      {job.status === "pending_payment" && (
                         <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full border border-yellow-500/20">
                           Pending Payment
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {job.goal}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{job.budgetRange}</span>
                      <span>•</span>
                      <span>{job.timeline}</span>
                      <span>•</span>
                      <span>{job._count.bids} proposals</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                     <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <Search className="h-5 w-5 text-muted-foreground" />
                     </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
