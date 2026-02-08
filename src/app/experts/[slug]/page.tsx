import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SolutionCard } from "@/components/SolutionCard";
import { ShieldCheck, Award, MessageSquare, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { Solution } from "@/types";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const expert = await prisma.specialistProfile.findUnique({
    where: { slug: params.slug },
  });
  if (!expert) return { title: "Expert Not Found" };
  return {
    title: `${expert.displayName} | AI Marketplace`,
    description: expert.bio || `Hire ${expert.displayName} for AI automations.`,
  };
}

export default async function ExpertProfilePage({ params }: PageProps) {
  const expert = await prisma.specialistProfile.findUnique({
    where: { slug: params.slug },
    include: {
      solutions: {
        where: { status: "published" }
      }
    }
  });

  if (!expert || expert.status !== "APPROVED") {
    // Admin override? For V1, just show not found/public
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Specialist not found</h1>
        <p className="text-muted-foreground mb-8">
          The specialist you are looking for does not exist or has not been approved yet.
        </p>
        <Link
          href="/solutions"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium"
        >
          Browse solutions
        </Link>
      </div>
    );
  }

  // Cast DB solution to UI type if needed, or ensure they match
  const expertSolutions = expert.solutions as unknown as Solution[]; 

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-secondary/10 border-b border-border py-12">
        <div className="container mx-auto px-4">
          <Link href="/solutions" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-8 w-fit">
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to solutions
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar / Initials */}
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-secondary border border-border flex items-center justify-center text-3xl md:text-4xl font-bold relative shrink-0">
              {expert.displayName.substring(0, 2).toUpperCase()}
              {expert.verified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
                  <ShieldCheck className="h-6 w-6 text-blue-400 fill-blue-400/10" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{expert.displayName}</h1>
                {expert.businessVerified && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified Business
                  </span>
                )}
                {expert.founding && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                    <Award className="h-3 w-3" /> Founding Expert
                  </span>
                )}
              </div>
              
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl leading-relaxed">
                {expert.bio || "AI Automation Expert"}
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                {expert.responseTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{expert.responseTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                   <CheckCircle className="h-4 w-4 text-primary" />
                   <span className="font-medium text-foreground">{expert.completedSalesCount}</span> completed implementations
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {expert.tools.map((tool) => (
                  <span key={tool} className="px-3 py-1 bg-card border border-border rounded-md text-sm font-medium">
                    {tool}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                 <Link
                   href={`/messages/new?expert=${expert.id}`}
                   className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors gap-2"
                 >
                   <MessageSquare className="h-4 w-4" /> Message specialist
                 </Link>
                 <a
                   href="#solutions"
                   className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-border bg-background hover:bg-secondary/50 font-medium transition-colors"
                 >
                   Browse solutions
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16" id="solutions">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Available Solutions</h2>
          <span className="text-muted-foreground">{expertSolutions.length} results</span>
        </div>
        
        {expertSolutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertSolutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-border rounded-xl bg-secondary/5">
            <p className="text-muted-foreground">No solutions published yet.</p>
          </div>
        )}
      </div>
      
      {/* Trust / value prop section */}
      <div className="border-t border-border bg-secondary/5 py-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
           <h3 className="text-xl font-bold mb-2">Work directly with the specialist who delivers the implementation</h3>
           <p className="text-muted-foreground">Clear scope. Real delivery. One point of contact from request to completion.</p>
        </div>
      </div>
    </div>
  );
}
