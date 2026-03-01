import Image from "next/image";
import { Quote } from "lucide-react";

export function FounderNote() {
  return (
    <section className="py-16 border-t border-border bg-[#FBFAF8]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto p-8 md:p-10 bg-white border border-border rounded-2xl flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-foreground rounded-l-2xl" />
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
