"use client";

import { useState } from "react";
import { Link2, CheckCircle } from "lucide-react";
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
    toast.success("Your portfolio link is ready to share with clients.");
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-bold transition-all"
    >
      {copied ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700">Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          Share your portfolio
        </>
      )}
    </button>
  );
}
