"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, FileText } from "lucide-react";
import { submitDisputeStatement } from "@/actions/orders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DisputeStatementFormProps {
  orderId: string;
  existingStatement: string | null;
  role: "buyer" | "seller";
}

export function DisputeStatementForm({ orderId, existingStatement, role }: DisputeStatementFormProps) {
  const router = useRouter();
  const [statement, setStatement] = useState(existingStatement || "");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(!!existingStatement);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitDisputeStatement(orderId, statement);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Your statement has been saved.");
        setSaved(true);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = role === "buyer"
    ? "Your statement"
    : "Your statement";
  const placeholder = role === "buyer"
    ? "Describe the issue from your perspective. What was agreed, what was delivered, and why you believe a resolution is needed..."
    : "Explain your perspective. What was agreed, what you delivered, and why you believe the work meets the requirements...";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-amber-600" />
        <label className="text-sm font-semibold text-amber-800">{label}</label>
        {saved && !submitting && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" /> Saved
          </span>
        )}
      </div>
      <textarea
        value={statement}
        onChange={(e) => { setStatement(e.target.value); setSaved(false); }}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300 resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-amber-600">
          This is only visible to LogicLot staff reviewing the dispute.
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting || statement.trim().length < 10 || (saved && statement === existingStatement)}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {submitting ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
          ) : saved ? (
            "Update Statement"
          ) : (
            "Submit Statement"
          )}
        </button>
      </div>
    </div>
  );
}
