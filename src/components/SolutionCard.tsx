"use client";

import Link from "next/link";
import { Clock, PlayCircle, ShieldCheck, Heart, TrendingUp, Users, Wrench, Lock, Edit, Trash2, ArrowUpCircle } from "lucide-react";
import { Solution } from "@/types";
import { TierBadge } from "@/components/ui/TierBadge";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { useSavedSolutionsContext } from "@/hooks/SavedSolutionsContext";
import { useRouter } from "next/navigation";
import { useState, MouseEvent } from "react";
import { archiveSolution, createSolutionVersion } from "@/actions/solutions";
import { toast } from "sonner";

interface SolutionCardProps {
  solution: Solution;
  editHref?: string;
  isLocked?: boolean;
  lockReason?: string;
}

export function SolutionCard({ solution, editHref, isLocked, lockReason }: SolutionCardProps) {
  const { savedIds, toggleSaved } = useSavedSolutionsContext();
  const router = useRouter();
  const isSaved = savedIds.has(solution.id);
  const [isSaving, setIsSaving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePrice, setUpgradePrice] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  const handleSave = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    const success = await toggleSaved(solution.id);
    setIsSaving(false);
    if (!success) {
      router.push("/auth/sign-in");
    }
  };

  const handleRemove = async () => {
    if (isLocked) return;
    await archiveSolution(solution.id);
    setShowRemoveConfirm(false);
    router.refresh();
  };

  const handleCreateVersion = async () => {
    if (!upgradePrice || !changelog) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreatingVersion(true);
    const res = await createSolutionVersion(solution.id, changelog, parseFloat(upgradePrice) * 100);
    setIsCreatingVersion(false);

    if (res.success) {
      setShowUpgradeModal(false);
      setChangelog("");
      setUpgradePrice("");
      toast.success(`v${(solution.version || 1) + 1}.0 draft created! Find it in your Drafts tab.`);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to create version");
    }
  };

  // Badge Logic (Max 3, Priority Order)
  const badges = [];

  // Status Badge for Owner View
  if (solution.status === "draft") {
    badges.push({ label: "Draft", icon: Edit, tooltip: "Not visible to public", className: "text-slate-600 bg-slate-100 border-slate-300" });
  }

  if (solution.is_vetted) badges.push({ label: "Vetted", icon: ShieldCheck, tooltip: "Verified portfolio and identity; performance tracked on‑platform.", className: "text-blue-700 bg-blue-50 border-blue-200" });
  if (solution.requires_nda) badges.push({ label: "NDA", icon: LockIcon, tooltip: "Covered by platform NDA; files and chat protected.", className: "text-purple-700 bg-purple-50 border-purple-200" });
  if (solution.support_days) badges.push({ label: `Support: ${solution.support_days}d`, icon: Wrench, tooltip: "Includes post‑delivery support (bug‑fix scope).", className: "text-slate-600 bg-slate-50 border-slate-200" });

  const displayBadges = badges.slice(0, 3);

  // Proof Strip Logic
  const buildProofStrip = () => {
    const parts = [];
    if (solution.adoption_count) parts.push(`Trusted by ${solution.adoption_count}+ teams`);
    if (solution.avg_roi) parts.push(`Avg ROI ${solution.avg_roi}x`);
    if (solution.delivery_days) parts.push(`Live in ${solution.delivery_days} days`);
    
    if (solution.adoption_count && solution.avg_roi && solution.delivery_days) {
      return `Trusted by ${solution.adoption_count}+ teams · Avg ROI ${solution.avg_roi}x · Live in ${solution.delivery_days} days`;
    }
    if (solution.adoption_count && solution.delivery_days) {
      return `Trusted by ${solution.adoption_count}+ teams · Live in ${solution.delivery_days} days`;
    }
    if (solution.adoption_count && solution.avg_roi) {
      return `Trusted by ${solution.adoption_count}+ teams · Avg ROI ${solution.avg_roi}x`;
    }
    if (solution.adoption_count) {
      return `Trusted by ${solution.adoption_count}+ teams`;
    }
    return null;
  };

  const proofStrip = buildProofStrip();

  return (
    <div className="group relative rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 flex flex-col h-full overflow-hidden">
      
      {/* Top Section */}
      <div className="p-6 flex-1 flex flex-col">
        
        {/* Header Row: Category & Badges */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <CategoryBadge category={solution.category} size="sm" />
          
          <div className="flex items-center gap-1.5 shrink-0">
            {displayBadges.map((badge, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.className} cursor-help`}
                title={badge.tooltip}
              >
                <badge.icon className="h-3 w-3" />
                <span className="hidden xl:inline">{badge.label}</span>
              </div>
            ))}
            {(solution.demoVideoStatus === 'approved' || solution.demo_video_status === 'approved') && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full" title="Verified Demo Video Available">
                <PlayCircle className="h-3 w-3" /> Demo
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-lg leading-tight mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] tracking-tight">
          {solution.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {solution.short_summary || solution.description}
        </p>

        {/* Outline / Highlights (New) */}
        {solution.outline && solution.outline.length > 0 && (
          <div className="mb-4 space-y-1">
            {solution.outline.slice(0, 3).map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                <span className="line-clamp-1">{line}</span>
              </div>
            ))}
          </div>
        )}

        {/* Outcome Line */}
        {solution.outcome && (
          <div className="mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100 flex items-start gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="leading-snug">{solution.outcome}</span>
          </div>
        )}

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {solution.integrations.slice(0, 3).map((tool) => (
            <span key={tool} className="text-xs font-medium border border-border/60 bg-secondary/50 px-2 py-1 rounded-md text-muted-foreground">
              {tool}
            </span>
          ))}
          {solution.integrations.length > 3 && (
            <span className="text-xs font-medium border border-border/60 bg-secondary/50 px-2 py-1 rounded-md text-muted-foreground">
              +{solution.integrations.length - 3}
            </span>
          )}
        </div>

        {/* Proof Strip */}
        {proofStrip && (
          <div className="mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary/70" />
              <span className="truncate">{proofStrip}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Pricing & CTA */}
      <div className="p-6 pt-0 bg-secondary/5">
        {/* Expert Attribution */}
        {solution.expert && (
          <div className="flex items-center gap-2 pb-3 pt-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/15 overflow-hidden relative">
              {solution.expert.profile_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={solution.expert.profile_image_url} alt={solution.expert.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                (solution.expert.name || "?").slice(0, 2).toUpperCase()
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate flex-1">{solution.expert.name}</span>
            {(solution.expert.founding || (solution.expert.tier && solution.expert.tier !== "STANDARD")) && (
              <TierBadge
                tier={(solution.expert.tier || "STANDARD") as "STANDARD" | "PROVEN" | "ELITE"}
                isFoundingExpert={solution.expert.founding}
                size="sm"
              />
            )}
          </div>
        )}
        <div className="flex items-end justify-between py-4 border-t border-border">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Implementation</p>
            <p className="font-bold text-xl text-foreground tracking-tight">€{solution.implementation_price.toLocaleString("de-DE")}</p>
            
            {/* Delivery & ROI Lines & Support */}
            <div className="flex flex-col gap-0.5 mt-1.5">
              {(solution.delivery_days_range || solution.delivery_days) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 
                  Delivery: {solution.delivery_days_range ? `${solution.delivery_days_range} days` : `~${solution.delivery_days} days`}
                </p>
              )}
              {(solution.support_days ?? 0) > 0 && (
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  Support: {solution.support_days} days
                </p>
              )}
              {solution.roi_months && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Payback: {solution.roi_months}mo
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right pl-4">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Est. Monthly AI</p>
            <p className="font-medium text-sm text-foreground">
              €{solution.monthly_cost_min || 0}–€{solution.monthly_cost_max || 0}
            </p>
            {(solution.version || 1) > 1 && (
              <p className="text-[10px] text-muted-foreground mt-1.5">v{solution.version}.0</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {editHref && solution.status === 'draft' ? (
            <Link
              href={`${editHref}?step=${solution.lastStep || 1}`}
              className="flex-1 text-center bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              Continue Editing
            </Link>
          ) : (
            <Link
              href={`/solutions/${solution.id}`}
              className="flex-1 text-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-primary/30"
            >
              View Solution
            </Link>
          )}
          
          {/* Owner Actions (Moved to Footer) */}
          {editHref && (
            <>
              {/* Upgrade Button (if published) */}
              {solution.status === 'published' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUpgradeModal(true);
                  }}
                  className="p-2.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center"
                  title="Create New Version"
                >
                  <ArrowUpCircle className="h-5 w-5" />
                </button>
              )}

              {/* Edit Button (if not draft) */}
              {solution.status !== 'draft' && (
                <Link
                  href={isLocked ? "#" : editHref}
                  onClick={(e) => isLocked && e.preventDefault()}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                    isLocked
                      ? "bg-secondary text-muted-foreground cursor-not-allowed border-transparent"
                      : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary/50"
                  }`}
                  title={isLocked ? `Locked: ${lockReason}` : "Edit Solution"}
                >
                  {isLocked ? <Lock className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                </Link>
              )}

              {/* Remove Button */}
              {solution.status !== 'draft' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLocked) {
                      alert(`Cannot remove: ${lockReason}`);
                      return;
                    }
                    setShowRemoveConfirm(true);
                  }}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                    isLocked
                      ? "bg-secondary text-muted-foreground cursor-not-allowed border-transparent"
                      : "bg-background border-border text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                  }`}
                  title="Remove Solution"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {!editHref && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2.5 rounded-lg border transition-all ${
                isSaved 
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
              title={isSaved ? "Saved" : "Save Solution"}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal Overlay */}
      {showRemoveConfirm && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-xs text-center">
            <h4 className="font-bold text-lg mb-2">Remove Solution?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This will hide the solution from Browse Solutions. You can re-publish later.
            </p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal Overlay — fixed full-screen so it's never clipped by the card */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-lg w-full text-left"
            onClick={e => e.stopPropagation()}
          >
            <h4 className="font-bold text-xl mb-1 flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-primary" /> Create Version {(solution.version || 1) + 1}.0
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              Describe what&apos;s improved and set an optional upgrade fee for existing buyers.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  What&apos;s New? <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={changelog}
                  onChange={e => setChangelog(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm h-40 resize-none focus:outline-none focus:border-primary transition-colors"
                  placeholder="Describe the improvements, bug fixes, and new features in this version..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Upgrade Fee (€) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={upgradePrice}
                  onChange={e => setUpgradePrice(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. 99"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Buyers of v{solution.version || 1}.0 pay this to upgrade. New buyers always pay the full price.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={(e) => { e.preventDefault(); setShowUpgradeModal(false); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-lg border border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); handleCreateVersion(); }}
                  disabled={isCreatingVersion}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isCreatingVersion ? "Creating…" : "Create Draft"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icon component
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
