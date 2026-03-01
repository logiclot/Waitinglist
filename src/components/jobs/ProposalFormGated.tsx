"use client";

import { useState, useEffect } from "react";
import { BindingOfferModal } from "@/components/jobs/BindingOfferModal";
import { ProposalForm } from "@/components/jobs/ProposalForm";
import { FileText, ArrowRight } from "lucide-react";

const STORAGE_KEY = "logiclot_binding_offer_agreed";

interface ProposalFormGatedProps {
  jobId: string;
  jobCategory: string;
}

export function ProposalFormGated({ jobId, jobCategory }: ProposalFormGatedProps) {
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setAgreed(true);
      }
    } catch {
      // sessionStorage unavailable — no-op
    }
  }, []);

  const handleAgree = () => {
    setAgreed(true);
    setShowModal(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // sessionStorage unavailable — no-op
    }
  };

  // Once agreed, render the full proposal form
  if (agreed) {
    return <ProposalForm jobId={jobId} jobCategory={jobCategory} />;
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
        <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">Ready to submit a proposal?</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Read the brief carefully, then write a structured proposal that addresses the client&apos;s specific pain points.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          Write your proposal <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <BindingOfferModal
        open={showModal}
        onAgree={handleAgree}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
