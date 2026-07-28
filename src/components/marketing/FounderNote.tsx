import Image from "next/image";
import { Quote } from "lucide-react";

export function FounderNote() {
  return (
    <section className="pt-14 md:pt-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl bg-white flex flex-col items-center gap-8 relative mx-auto p-6 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl md:flex-row md:p-8 xl:p-10">
          <div className="shrink-0">
            <div className="size-24 p-1 border border-ash-300 ring-[3px] ring-ash-100 rounded-full">
              <Image
                src="/founder.png"
                alt="Claudiu — Founder"
                width={96}
                height={96}
                className="object-cover rounded-full"
              />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-xl text-ash-800 font-noto font-medium tracking-tight">Where this all started</h4>
            <p className="text-ash-500 mt-2">
              &ldquo;I built LogicLot after spending years watching good businesses stay stuck on work that should have been automated long ago. The talent to fix it was always out there. Getting the two in the same room, reliably, was the hard part. Thank you for being here.&rdquo;
            </p>
            <p className="text-ash-400 mt-4">&mdash; Claudiu, Founder</p>
          </div>
        </div>
      </div>
    </section>
  );
}
