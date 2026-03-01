import { BRAND_NAME } from "@/lib/branding";
import { AuditQuiz } from "@/components/audit/AuditQuiz";
import { ClipboardList, ShieldCheck, Clock } from "lucide-react";

export const metadata = {
  title: `Free Automation Audit | ${BRAND_NAME}`,
  description:
    "Find out where your business is losing time and money to manual work. Free 5-question audit — instant results, no account needed.",
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-4">
            Free Automation Audit
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Where is your business
            <br />
            losing time?
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            5 questions. Instant results. Find out what&apos;s costing you the
            most — and whether automation is worth it for your stage of growth.
          </p>

          {/* Trust chips */}
          <div className="flex items-center justify-center gap-4 flex-wrap mt-6">
            {[
              { icon: Clock, label: "2 minutes" },
              { icon: ShieldCheck, label: "No account needed" },
              { icon: ClipboardList, label: "Instant report" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz */}
        <AuditQuiz />
      </div>
    </div>
  );
}
