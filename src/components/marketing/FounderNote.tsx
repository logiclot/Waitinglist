import Image from "next/image";
import { Quote } from "lucide-react";

export function FounderNote() {
  return (
    <section className="pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto p-6 bg-white flex flex-col items-center gap-8 relative border border-ash-300 shadow-2xl shadow-ash-200 rounded-2xl md:flex-row md:p-8 xl:p-10">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-sm">
              <Image
                src="/founder.png"
                alt="Claudiu — Founder"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>
          <div className="text-center md:text-left">
            <Quote className="h-6 w-6 text-foreground/20 mb-3 mx-auto md:mx-0" />
            <h4 className="font-bold text-xl mb-3 text-foreground">Where this all started</h4>
            <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-2xl">
              &ldquo;I built LogicLot after spending years watching good businesses stay stuck on work that should have been automated long ago. The talent to fix it was always out there. Getting the two in the same room, reliably, was the hard part. Thank you for being here.&rdquo;
            </p>
            <p className="text-sm font-bold text-foreground">&mdash; Claudiu, Founder</p>
          </div>
        </div>
      </div>
    </section>
  );
}
