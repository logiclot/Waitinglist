import Link from "next/link";
import { Compass, Briefcase, ArrowRight, Lock } from "lucide-react";

export default function FindWorkPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Find Work</h1>
      <p className="text-muted-foreground text-lg">Choose a work stream to browse opportunities.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Discovery Card */}
        <Link href="/expert/discovery" className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover:shadow-lg">
          <div className="bg-blue-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Compass className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            Discovery Feed <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Paid Rewards</span>
          </h3>
          <p className="text-muted-foreground mb-6 h-12">
            Browse initial business scans. Provide quick assessments and get paid for qualified insights.
          </p>
          <div className="flex items-center text-primary font-bold">
            Browse Feed <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        {/* Custom Projects Card */}
        <Link href="/expert/custom-projects" className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover:shadow-lg">
          <div className="bg-amber-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Briefcase className="h-7 w-7 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            Custom Projects <Lock className="h-4 w-4 text-muted-foreground" />
          </h3>
          <p className="text-muted-foreground mb-6 h-12">
            High-intent projects with €100 deposit. Competitive bidding for elite experts.
          </p>
          <div className="flex items-center text-primary font-bold">
            View Projects <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

      </div>
    </div>
  );
}
