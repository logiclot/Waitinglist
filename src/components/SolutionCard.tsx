"use client";

import Link from "next/link";
import { Clock, PlayCircle, ShieldCheck, Award, Heart, TrendingUp, Users, Wrench, Lock, Edit, Trash2 } from "lucide-react";
import { Solution } from "@/types";
import { useSavedSolutions } from "@/hooks/useSavedSolutions";
import { useRouter } from "next/navigation";
import { useState, MouseEvent } from "react";
import { archiveSolution } from "@/actions/solutions";

interface SolutionCardProps {
  solution: Solution;
  editHref?: string;
  isLocked?: boolean;
  lockReason?: string;
}

export function SolutionCard({ solution, editHref, isLocked, lockReason }: SolutionCardProps) {
  const { savedIds, toggleSaved } = useSavedSolutions();
  const router = useRouter();
  const isSaved = savedIds.has(solution.id);
  const [isSaving, setIsSaving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

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

  // Badge Logic (Max 3, Priority Order)
  const badges = [];
  
  // Status Badge for Owner View
  if (solution.status === "draft") {
    badges.push({ label: "Draft", icon: Edit, tooltip: "Not visible to public", className: "text-slate-600 bg-slate-100 border-slate-300" });
  }

  if (solution.is_vetted) badges.push({ label: "Vetted", icon: ShieldCheck, tooltip: "Verified portfolio and identity; performance tracked on‑platform.", className: "text-blue-700 bg-blue-50 border-blue-200" });
  if (solution.requires_nda) badges.push({ label: "NDA", icon: LockIcon, tooltip: "Covered by platform NDA; files and chat protected.", className: "text-purple-700 bg-purple-50 border-purple-200" });
  if (solution.is_founding_expert) badges.push({ label: "Founding Expert", icon: Award, tooltip: "Early expert with proven delivery; reduced platform fee.", className: "text-amber-700 bg-amber-50 border-amber-200" });
  if (solution.support_days) badges.push({ label: `Support: ${solution.support_days}d`, icon: Wrench, tooltip: "Includes post‑delivery support (bug‑fix scope).", className: "text-emerald-700 bg-emerald-50 border-emerald-200" });
  badges.push({ label: "Escrow", icon: Lock, tooltip: "Milestone escrow — funds release only after buyer approval.", className: "text-slate-700 bg-slate-50 border-slate-200" });

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
    <div className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full overflow-hidden">
      
      {/* Edit/Remove Buttons (Owner View) */}
      {editHref && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {/* Remove Button (for Published/Archived) */}
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
              className={`p-2 rounded-full shadow-sm border transition-all flex items-center justify-center ${
                isLocked 
                  ? "bg-secondary text-muted-foreground cursor-not-allowed border-transparent" 
                  : "bg-white text-red-500 border-border hover:border-red-500 hover:bg-red-50"
              }`}
              title={isLocked ? `Locked: ${lockReason}` : "Remove Solution"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {/* Edit Button */}
          <Link
            href={isLocked ? "#" : editHref}
            className={`p-2 rounded-full shadow-sm border transition-all flex items-center justify-center ${
              isLocked 
                ? "bg-secondary text-muted-foreground cursor-not-allowed border-transparent" 
                : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
            }`}
            title={isLocked ? `Locked: ${lockReason}` : "Edit Solution"}
            onClick={(e) => isLocked && e.preventDefault()}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Link>
        </div>
      )}

      {/* Top Section */}
      <div className="p-6 flex-1 flex flex-col">
        
        {/* Header Row: Category & Badges */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border border-border bg-secondary text-muted-foreground truncate max-w-[140px]">
            {solution.category}
          </span>
          
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
            {solution.demo_video_status === 'approved' && (
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
            <span key={tool} className="text-xs font-medium border border-border bg-background px-2 py-1 rounded text-muted-foreground">
              {tool}
            </span>
          ))}
          {solution.integrations.length > 3 && (
            <span className="text-xs font-medium border border-border bg-background px-2 py-1 rounded text-muted-foreground">
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
      <div className="p-6 pt-0 bg-card">
        <div className="flex items-end justify-between py-4 border-t border-border">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Implementation</p>
            <p className="font-bold text-xl text-foreground tracking-tight">${solution.implementation_price ? solution.implementation_price.toLocaleString() : (solution.implementationPriceCents / 100).toLocaleString()}</p>
            
            {/* Delivery & ROI Lines & Support */}
            <div className="flex flex-col gap-0.5 mt-1.5">
              {(solution.delivery_days_range || solution.delivery_days) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 
                  Delivery: {solution.delivery_days_range ? `${solution.delivery_days_range} days` : `~${solution.delivery_days} days`}
                </p>
              )}
              {solution.support_days > 0 && (
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
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
              ${solution.monthly_cost_min || 0}-${solution.monthly_cost_max || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {editHref && solution.status === 'draft' ? (
            <Link
              href={`${editHref}?step=${solution.lastStep || 1}`}
              className="flex-1 text-center bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              Continue Editing
            </Link>
          ) : (
            <Link
              href={`/solutions/${solution.id}`}
              className="flex-1 text-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              View Solution
            </Link>
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
