"use client";

import { useState } from "react";
import { respondToInvite } from "@/actions/ecosystems";
import { toast } from "sonner";
import { Check, X, Layers } from "lucide-react";
import Link from "next/link";

interface Invite {
  id: string;
  message?: string | null;
  createdAt: string | Date;
  ecosystem: { id: string; title: string; slug: string };
  solution: { id: string; title: string };
  inviter: { displayName: string; slug: string };
}

export function SuiteInviteManager({ invites: initialInvites }: { invites: Invite[] }) {
  const [invites, setInvites] = useState(initialInvites);
  const [loading, setLoading] = useState<string | null>(null);

  const handleRespond = async (inviteId: string, accept: boolean) => {
    setLoading(inviteId);
    const res = await respondToInvite(inviteId, accept);
    setLoading(null);

    if (res.success) {
      toast.success(accept ? "Invite accepted! Your solution has been added to the suite." : "Invite declined.");
      setInvites(invites.filter((i) => i.id !== inviteId));
    } else {
      toast.error(res.error || "Failed to respond");
    }
  };

  if (invites.length === 0) {
    return null; // Hidden when all invites are handled — parent conditionally renders this component
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <div key={invite.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{invite.solution.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Invited to{" "}
                <Link href={`/stacks/${invite.ecosystem.slug}`} className="text-primary hover:underline font-medium">
                  {invite.ecosystem.title}
                </Link>
                {" "}by{" "}
                <Link href={`/experts/${invite.inviter.slug}`} className="text-primary hover:underline font-medium">
                  {invite.inviter.displayName}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(invite.createdAt).toLocaleDateString("en-IE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {invite.message && (
            <div className="bg-secondary/30 p-3 rounded-lg mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Message from suite owner:</p>
              <p className="text-sm text-foreground">&ldquo;{invite.message}&rdquo;</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleRespond(invite.id, true)}
              disabled={loading === invite.id}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Accept
            </button>
            <button
              onClick={() => handleRespond(invite.id, false)}
              disabled={loading === invite.id}
              className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
