import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ProposalReviewClient } from "@/components/jobs/ProposalReviewClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BusinessProposalReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    redirect("/auth/sign-in");
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: params.id },
    include: {
      bids: {
        include: {
          specialist: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!job || job.buyerId !== session.user.id) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Projects
        </Link>

        <ProposalReviewClient job={job} />
      </div>
    </div>
  );
}
