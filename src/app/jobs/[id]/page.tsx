import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PaymentStub } from "@/components/jobs/PaymentStub";
import { BidForm } from "@/components/jobs/BidForm";
import { BidList } from "@/components/jobs/BidList";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/auth/sign-in?next=/jobs/${params.id}`);
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: params.id },
    include: {
      buyer: { include: { businessProfile: true } },
      bids: {
        include: {
          specialist: { include: { user: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!job) notFound();

  const isBuyer = job.buyerId === session.user.id;
  const isSpecialist = session.user.role === "SPECIALIST";

  // Specialist Access Control
  let specialistProfile = null;
  if (isSpecialist) {
    specialistProfile = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id }
    });
  }

  const isElite = specialistProfile?.tier === "ELITE";

  // Pending Payment View (Buyer Only)
  if (job.status === "pending_payment") {
    if (!isBuyer) return <div>This job is not yet active.</div>;
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href="/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-8">
           <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Link>
        <PaymentStub jobId={job.id} />
      </div>
    );
  }

  // Locked Access for Non-Elite Specialists
  if (isSpecialist && !isElite && job.status === "open") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-secondary/10 border border-border rounded-xl p-12">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Elite Access Only</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Job requests are available to Elite specialists. Reach Elite status by delivering successful implementations and maintaining high client satisfaction.
          </p>
          <Link href="/for-experts" className="text-primary font-medium hover:underline">
            View ranking requirements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 uppercase tracking-wide">
                 {job.category}
               </span>
               <span className="text-sm text-muted-foreground">
                 Posted {new Date(job.createdAt).toLocaleDateString()}
               </span>
            </div>
            <h1 className="text-3xl font-bold mb-6">{job.title}</h1>
            
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="font-bold mb-4">Goal</h3>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.goal}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
               <div className="bg-secondary/5 border border-border p-4 rounded-lg">
                 <div className="text-sm text-muted-foreground mb-1">Budget Range</div>
                 <div className="font-medium">{job.budgetRange}</div>
               </div>
               <div className="bg-secondary/5 border border-border p-4 rounded-lg">
                 <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                 <div className="font-medium">{job.timeline}</div>
               </div>
            </div>

            {job.tools.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold mb-3">Tools involved</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tools.map(tool => (
                    <span key={tool} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm border border-border">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Bids Section */}
          <div id="bids">
            {(isBuyer || (isSpecialist && isElite)) && (
               <BidList bids={job.bids} jobId={job.id} isOwner={isBuyer} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {isSpecialist && isElite && job.status === 'open' && (
             <BidForm jobId={job.id} />
          )}

          <div className="bg-secondary/10 border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">About the Client</h3>
            <div className="flex items-center gap-3 mb-4">
               <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                 {job.buyer.businessProfile?.companyName?.[0] || "C"}
               </div>
               <div>
                 <div className="font-medium">{job.buyer.businessProfile?.companyName || "Company"}</div>
                 <div className="text-xs text-muted-foreground">{job.buyer.businessProfile?.industry || "Tech"}</div>
               </div>
            </div>
            <div className="text-sm text-muted-foreground">
               Verified payment method
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
