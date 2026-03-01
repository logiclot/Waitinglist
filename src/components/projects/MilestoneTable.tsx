"use client";

import { useState } from "react";
import { CheckCircle, Clock, Lock, Upload, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

interface Milestone {
  title: string;
  description: string;
  price: number;
  status: "pending_payment" | "waiting_for_funds" | "in_escrow" | "released";
  fundedAt?: string;
  releasedAt?: string;
}

interface MilestoneTableProps {
  orderId: string;
  milestones: Milestone[];
  isBuyer: boolean;
  isSeller: boolean;
}

export function MilestoneTable({ orderId, milestones, isBuyer, isSeller }: MilestoneTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFund = async (index: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/fund-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, milestoneIndex: index }),
      });
      const data = await res.json();
      if (data.useSimulate) {
        const sim = await fetch(`/api/projects/simulate-milestone-fund`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, milestoneIndex: index }),
        });
        const simData = await sim.json();
        if (simData.success) {
          toast.success("Milestone funded (simulated).");
          router.refresh();
        } else {
          toast.error(simData.error || "Simulate failed.");
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Checkout failed.");
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "milestone-checkout" } });
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (index: number) => {
    if (!confirm("Are you sure you want to release funds to the expert? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects/release-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, milestoneIndex: index }),
      });
      if (res.ok) {
        toast.success("Funds Released. Thank you for using LogicLot!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to release funds", { duration: 4000 });
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "milestone-release" } });
      toast.error("Error releasing funds", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = () => {
    // Placeholder for actual upload logic
    toast.success("Proof Sent! Awaiting business approval.");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border">
          <tr>
            <th className="px-6 py-3 w-16">Step</th>
            <th className="px-6 py-3">Deliverable</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {milestones.map((m, idx) => (
            <tr key={idx} className="group hover:bg-secondary/5 transition-colors">
              <td className="px-6 py-4 font-bold text-muted-foreground">#{idx + 1}</td>
              <td className="px-6 py-4">
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{m.description}</div>
              </td>
              <td className="px-6 py-4">€{m.price.toLocaleString("de-DE")}</td>
              <td className="px-6 py-4">
                {m.status === "released" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    <CheckCircle className="w-3 h-3" /> Released
                  </span>
                )}
                {m.status === "in_escrow" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    <Lock className="w-3 h-3" /> In Escrow
                  </span>
                )}
                {(m.status === "waiting_for_funds" || m.status === "pending_payment") && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3 h-3" /> Waiting
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {m.status === "in_escrow" && isBuyer && (
                  <button 
                    onClick={() => handleRelease(idx)}
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Approve & Release"}
                  </button>
                )}
                {m.status === "in_escrow" && isSeller && (
                  <button 
                    onClick={handleSubmitProof}
                    className="border border-border bg-background hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ml-auto"
                  >
                    <Upload className="w-3 h-3" /> Submit Proof
                  </button>
                )}
                {m.status === "waiting_for_funds" && isBuyer && (
                  <button 
                    onClick={() => handleFund(idx)}
                    className="border border-border bg-background hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    Fund Milestone
                  </button>
                )}
                {m.status === "released" && (
                  <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Check className="w-3 h-3" /> Paid
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
