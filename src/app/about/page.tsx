import Link from "next/link";
import Image from "next/image";
import { Quote } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `About | ${BRAND_NAME}`,
  description: "Why LogicLot exists and who built it.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      <div className="container mx-auto px-4 py-20 max-w-3xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">About {BRAND_NAME}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
            Why this exists
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Automation has been one of the most overpromised and underdelivered categories in tech. Businesses invest time and money into projects that go nowhere, and talented experts struggle to stand out in a market full of noise. {BRAND_NAME} was built to fix both sides of that problem.
          </p>
        </div>

        {/* Mission block */}
        <div className="mb-14 p-8 bg-white border border-border rounded-2xl shadow-sm">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">The mission</h2>
          <p className="text-2xl font-bold text-foreground leading-snug mb-5">
            Make automation buyable. Safely, clearly, and with full accountability on both sides.
          </p>
          <div className="space-y-3 text-muted-foreground text-base leading-relaxed">
            <p>
              Most platforms treat automation like a gig. You post, someone responds, and then you&apos;re on your own. There&apos;s no structured scope, no protected payment, no clear moment where either side is held accountable. The result is a lot of half-finished projects and frustrated buyers.
            </p>
            <p>
              {BRAND_NAME} is built differently. Every project runs on milestones. Every payment sits in escrow until the work is approved. Every interaction is covered by a platform-wide NDA. And every expert on the platform is here by choice, not by accident.
            </p>
          </div>
        </div>

        {/* Founder quote */}
        <div className="mb-14 p-8 md:p-10 bg-white border border-border rounded-2xl flex flex-col md:flex-row items-start gap-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-foreground rounded-l-2xl" />
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border shadow-sm">
              <Image
                src="/founder.png"
                alt="Claudiu — Founder"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <Quote className="h-5 w-5 text-foreground/20 mb-3" />
            <p className="text-foreground text-base leading-relaxed mb-5">
              &ldquo;I spent a long time watching the same pattern repeat itself. I grew up watching businesses in my family struggle not because the idea was wrong or the people were not capable, but because there were simply too many things to do and not enough hands to do them. Tasks piled up. Opportunities got missed. Good businesses stalled under the weight of their own operations.
              <br /><br />
              That stayed with me. When I started seeing what automation could actually do, not the hype version, but the real, quiet, unglamorous kind that just makes things run, I kept thinking about those businesses. About how much would have been different if the right help had been easy to find and safe to trust. That is what I am trying to build here. A place where getting that kind of help is straightforward, protected, and worth the investment.&rdquo;
            </p>
            <p className="text-sm font-bold text-foreground">&mdash; Claudiu, Founder of {BRAND_NAME}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-12 text-center">
          <h3 className="text-xl font-bold mb-2 text-foreground">Ready to see it in practice?</h3>
          <p className="text-muted-foreground text-sm mb-8">Browse what&apos;s available, or join as an expert and start building your reputation.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/solutions"
              className="px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
            >
              Browse Solutions
            </Link>
            <Link
              href="/onboarding/expert"
              className="px-6 py-3 rounded-xl border border-border bg-white hover:bg-secondary/50 transition-colors font-medium text-sm"
            >
              Join as an Expert
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
