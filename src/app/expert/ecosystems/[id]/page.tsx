import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, Eye } from "lucide-react";
import { EcosystemBuilder } from "@/components/ecosystems/EcosystemBuilder";
import { EcosystemSettingsForm } from "./EcosystemSettingsForm";
import type { Solution, SolutionStatus } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSolution(s: any): Solution {
  return {
    ...s,
    implementation_price_cents: s.implementationPriceCents,
    implementation_price: s.implementationPriceCents / 100,
    monthly_cost_min: s.monthlyCostMinCents ? s.monthlyCostMinCents / 100 : 0,
    monthly_cost_max: s.monthlyCostMaxCents ? s.monthlyCostMaxCents / 100 : 0,
    delivery_days: s.deliveryDays,
    short_summary: s.shortSummary ?? "",
    outcome: s.outcome ?? undefined,
    status: s.status as SolutionStatus,
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditEcosystemPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const ecosystem = await prisma.ecosystem.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { solution: true },
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!ecosystem) return notFound();

  // Fetch all expert's solutions for the builder
  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    include: { solutions: true }
  });

  if (!expert || ecosystem.expertId !== expert.id) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/expert/ecosystems" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Bundles
        </Link>
        <div className="flex gap-3">
          {ecosystem.published && (
            <Link
              href={`/stacks/${ecosystem.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors"
            >
              <Eye className="w-4 h-4" /> View Public Page
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-xl mb-4">Bundle Settings</h2>
            <EcosystemSettingsForm ecosystem={ecosystem} />
          </div>
        </div>

        {/* Right: Builder */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-xl mb-6">Stack Builder</h2>
            <EcosystemBuilder
              ecosystemId={ecosystem.id}
              initialItems={ecosystem.items.map(item => ({ ...item, solution: mapSolution(item.solution) }))}
              availableSolutions={expert.solutions.map(mapSolution)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
