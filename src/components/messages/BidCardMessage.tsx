"use client";

import { BidCardData } from "@/types";
import Link from "next/link";
import { Calendar, ExternalLink, Clock, FileText, Banknote } from "lucide-react";

interface BidCardMessageProps {
  body: string; // JSON string of BidCardData
}

export function BidCardMessage({ body }: BidCardMessageProps) {
  let data: BidCardData;
  try {
    data = JSON.parse(body);
  } catch {
    return <p className="text-sm text-muted-foreground">{body}</p>;
  }

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-primary/5 border-b border-border">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
          Proposal from {data.expertName}
        </p>
        <h4 className="font-bold text-sm text-foreground leading-tight">
          {data.automationTitle || data.projectTitle}
        </h4>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Excerpt */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.excerpt}
        </p>

        {/* Price + Timeline row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Banknote className="h-3.5 w-3.5 text-primary" />
            {data.price}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {data.timeline}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-secondary/10 border-t border-border flex flex-wrap gap-2">
        <Link
          href={`/business/proposals/${data.jobId}`}
          className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          View Full Proposal
        </Link>

        {data.expertCalendarUrl && (
          <a
            href={data.expertCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            Request Free Demo
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}
