import Link from "next/link";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `About | ${BRAND_NAME}`,
  description: "Building a marketplace where buying AI automation feels safe, clear, and outcome-driven.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">About</h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-16 leading-relaxed">
        {BRAND_NAME} is building a marketplace where buying AI automation feels safe, clear, and outcome-driven.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">The mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Make AI implementations buyable: clear scope, transparent expectations, protected payments, and experts who deliver.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">The builder</h2>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-secondary/20 rounded-lg flex items-center justify-center border border-border shrink-0 text-center p-2">
              <span className="text-[10px] text-muted-foreground font-medium">Founder photo (add headshot)</span>
            </div>
            <div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                I&apos;m Claudiu. I built this because the gap between &lsquo;AI demos&rsquo; and real delivery is still massive. The platform is designed to protect buyers and reward experts who ship reliable solutions.
              </p>
              <p className="font-medium text-foreground">
                If you build automations that work in the real world, you&apos;ll fit in here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-12 text-center">
        <h3 className="text-xl font-bold mb-6">Ready to get started?</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/solutions"
            className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
          >
            Browse Solutions
          </Link>
          <Link
            href="/for-experts"
            className="px-6 py-3 rounded-md border border-border bg-background hover:bg-secondary/50 transition-colors"
          >
            Apply as Expert
          </Link>
        </div>
      </div>
    </div>
  );
}
