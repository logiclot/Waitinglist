import Image from "next/image";
import { BRAND_NAME } from "@/lib/branding";

export function FounderNote() {
  return (
    <section className="py-24 border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          <div className="shrink-0">
            <div className="relative w-32 h-32 rounded-full border border-border overflow-hidden shadow-sm shrink-0">
              <Image 
                src="/founder.png" 
                alt="Claudiu - Founder" 
                width={128}
                height={128}
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Built to run in real businesses</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed max-w-2xl text-lg">
              A lot of modern technology never makes it past the idea stage.
              I built {BRAND_NAME} to help businesses work with specialists who deliver real implementations of workflow automations, AI solutions, and automated services, with clear scope and real accountability.
            </p>
            <p className="text-sm text-muted-foreground">
              Built by Claudiu — founder of {BRAND_NAME}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
