"use client";

import { FileText } from "lucide-react";

export function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all print:hidden"
    >
      <FileText className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
