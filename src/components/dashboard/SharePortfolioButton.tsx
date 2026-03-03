"use client";

import { useState } from "react";
import { ExternalLink, Link2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SharePortfolioButtonProps {
  slug: string;
}

export function SharePortfolioButton({ slug }: SharePortfolioButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Portfolio link copied to clipboard.");
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/p/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-bold transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        Go to Portfolio
      </a>
      <button
        onClick={handleCopy}
        title="Copy portfolio link"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
