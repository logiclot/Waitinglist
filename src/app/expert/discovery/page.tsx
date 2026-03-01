import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Compass, AlertCircle, ArrowRight, Clock, Wrench } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ExpertDiscoveryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in");

  // Check expert is approved
  const profile = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true, bidBannedUntil: true },
  });

  // Fetch open discovery posts the expert hasn't already bid on
  const existingBid = profile
    ? await prisma.bid.findMany({
        where: { specialistId: profile.id },
        select: { jobPostId: true },
      })
    : [];
  const biddedIds = existingBid.map((b) => b.jobPostId);

  const posts = await prisma.jobPost.findMany({
    where: {
      status: "open",
      category: "Discovery",
      id: { notIn: biddedIds },
    },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { include: { businessProfile: true } },
      _count: { select: { bids: true } },
    },
  });

  // Posts where this expert already submitted
  const submittedPosts = profile
    ? await prisma.jobPost.findMany({
        where: {
          status: "open",
          category: "Discovery",
          bids: { some: { specialistId: profile.id } },
        },
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { include: { businessProfile: true } },
          _count: { select: { bids: true } },
        },
      })
    : [];

  const isBanned = profile?.bidBannedUntil && profile.bidBannedUntil > new Date();
  const banLiftDate = profile?.bidBannedUntil
    ? profile.bidBannedUntil.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" /> Discovery Scan Feed
        </h1>
        <p className="text-sm text-muted-foreground">
          Review business diagnostics and send concrete automation proposals.
          €5 paid for each qualified submission.
        </p>

        {/* Ban banner */}
        {isBanned && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive text-sm">Proposal submissions paused</p>
              <p className="text-sm text-destructive/80 mt-1">
                You received too many &ldquo;Not relevant&rdquo; flags from clients in the past 30 days.
                Submissions are paused until <strong>{banLiftDate}</strong>.
                Use this time to review the quality guidelines below and refine your approach.
              </p>
            </div>
          </div>
        )}

        <div className="bg-secondary/30 border border-border rounded-xl p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-primary" /> Payout &amp; Quality Standards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold mb-1.5">Payout</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li><span className="text-green-600 font-bold">€5</span> per qualified submission</li>
                <li>Max 5 bids per post</li>
                <li>Payments processed monthly</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1.5">Quality bar</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Reference specific tools or processes</li>
                <li>No generic or copy-pasted advice</li>
                <li>Buyer rates: &ldquo;Helpful&rdquo; or &ldquo;Not Relevant&rdquo;</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Open Posts */}
      {posts.length === 0 && submittedPosts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No open posts right now</h3>
          <p className="text-muted-foreground text-sm">New scans are posted regularly. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Open — {posts.length} available
              </h2>
              {posts.map((post) => (
                <DiscoveryCard key={post.id} post={post} submitted={false} />
              ))}
            </div>
          )}

          {submittedPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Already submitted
              </h2>
              {submittedPosts.map((post) => (
                <DiscoveryCard key={post.id} post={post} submitted={true} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function goalPreview(goal: string): string {
  if (!goal) return "";
  if (!goal.trim().startsWith("{")) return goal.slice(0, 200).replace(/\*\*/g, "").trim();
  try {
    const brief = JSON.parse(goal);
    if (brief.version && Array.isArray(brief.sections)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sA = brief.sections.find((s: any) => s.id === "A");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sD = brief.sections.find((s: any) => s.id === "D");
      const model    = sA?.qa?.[0]?.a;
      const products = sA?.qa?.[1]?.a;
      const pain     = sD?.qa?.[0]?.a;
      const modelStr    = Array.isArray(model)    ? model.join(", ")    : (model ?? "");
      const productsStr = Array.isArray(products) ? products.join(", ") : (products ?? "");
      const painArr     = Array.isArray(pain)     ? pain                : (pain ? [pain] : []);
      const parts: string[] = [];
      if (modelStr)           parts.push(modelStr);
      if (productsStr)        parts.push(`selling ${productsStr}`);
      if (painArr.length > 0) parts.push(`Key pain: ${painArr.slice(0, 2).join(", ")}`);
      return parts.join(" · ") || "Discovery Scan — view for full brief";
    }
  } catch { /* fall through */ }
  return "Discovery Scan — view for full brief";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DiscoveryCard({ post, submitted }: { post: any; submitted: boolean }) {
  const company = post.buyer?.businessProfile?.companyName ?? "A business";
  const industry = post.buyer?.businessProfile?.industry ?? "";
  const preview = goalPreview(post.goal ?? "");

  return (
    <Link
      href={`/jobs/${post.id}`}
      className={`block bg-card border rounded-xl p-6 hover:border-primary/50 transition-all group ${
        submitted ? "border-green-500/30 opacity-75" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Company + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {company[0]}
            </div>
            <span className="font-semibold">{company}</span>
            {industry && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                {industry}
              </span>
            )}
            {submitted && (
              <span className="text-xs bg-green-500/10 text-green-600 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                ✓ Submitted
              </span>
            )}
          </div>

          {/* Goal preview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {preview}…
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.tools?.length > 0 && (
              <span className="flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                {post.tools.slice(0, 3).join(", ")}
                {post.tools.length > 3 && ` +${post.tools.length - 3}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span>{post._count.bids} / 5 proposals</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="text-green-600 font-bold text-sm">+€5</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            submitted
              ? "bg-green-500/10 text-green-600"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20"
          }`}>
            {submitted ? "View submission" : "View & Respond"} <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
