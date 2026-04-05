import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Leave a Review | ${BRAND_NAME}`,
};

interface Props {
  params: { orderId: string };
}

export default async function ExpertReviewPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in");

  const specialist = await prisma.specialistProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true, displayName: true },
  });

  if (!specialist) redirect("/dashboard");

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      seller: { select: { id: true, userId: true, displayName: true } },
      buyer: {
        select: {
          businessProfile: { select: { companyName: true, firstName: true } },
        },
      },
      solution: { select: { title: true } },
    },
  });

  if (!order) notFound();
  if (order.seller.userId !== session.user.id) redirect("/dashboard");
  if (!["delivered", "approved"].includes(order.status)) redirect("/dashboard");

  const projectTitle = order.solution?.title ?? "Project";
  const buyerName =
    order.buyer?.businessProfile?.companyName ??
    order.buyer?.businessProfile?.firstName ??
    "Client";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Review your client</h1>
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-medium text-foreground">{projectTitle}</span>
            {" · "}Client: <span className="font-medium text-foreground">{buyerName}</span>
          </p>
        </div>

        {/* Review section */}
        <ReviewSection
          orderId={params.orderId}
          role="seller"
          sellerName={specialist.displayName ?? "You"}
          buyerName={buyerName}
        />
      </div>
    </div>
  );
}
