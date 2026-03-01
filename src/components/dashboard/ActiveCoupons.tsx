"use client";

import { Gift, Copy } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  code: string;
  title: string;
}

export function ActiveCoupons({ coupons }: { coupons: Coupon[] }) {
  if (coupons.length === 0) return null;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {coupons.map(({ code, title }) => (
        <button
          key={code}
          onClick={() => copyCode(code)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 text-sm font-medium hover:bg-amber-500/20 transition-colors"
        >
          <Gift className="h-3.5 w-3.5" />
          <span className="truncate max-w-[120px]" title={title}>
            {code}
          </span>
          <Copy className="h-3 w-3 opacity-70" />
        </button>
      ))}
    </div>
  );
}
