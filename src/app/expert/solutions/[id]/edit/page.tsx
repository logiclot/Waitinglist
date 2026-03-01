import { SolutionWizard } from "@/components/solutions/SolutionWizard";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getSolutionLockState } from "@/lib/solutions/lock";
import { WizardState } from "@/components/solutions/SolutionWizard";

export default async function EditSolutionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  // Fetch solution and verify ownership
  const solution = await prisma.solution.findUnique({
    where: { id: params.id },
    include: { expert: true }
  });

  if (!solution) {
    notFound();
  }

  // Check ownership
  // Need to get expert profile of current user
  const expertProfile = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!expertProfile || solution.expertId !== expertProfile.id) {
    redirect("/dashboard"); // Unauthorized
  }

  // Check Lock State
  const lockState = await getSolutionLockState(solution.id);

  const milestones = (solution.milestones as import("@/types").Milestone[]) || [];

  // Map Solution to WizardState — all fields must be populated to avoid wizard reverting saved data
  const initialData: Partial<WizardState> = {
    id: solution.id,
    title: solution.title,
    category: solution.category,
    integrations: solution.integrations,
    short_summary: solution.shortSummary || "",
    longDescription: solution.longDescription || "",
    complexity: solution.complexity || "Standard",

    included: solution.included.length > 0 ? solution.included : ["Fully configured automation workflow", "Video walkthrough & documentation"],
    excluded: solution.excluded.join("\n"),

    requiredInputs: solution.requiredInputs,
    requiredInputsText: solution.requiredInputs.join("\n"),

    delivery_days: solution.deliveryDays,
    support_days: solution.supportDays,
    paybackPeriod: solution.paybackPeriod || "",

    implementation_price: solution.implementationPriceCents / 100,
    monthly_cost_min: solution.monthlyCostMinCents ? solution.monthlyCostMinCents / 100 : 0,
    monthly_cost_max: solution.monthlyCostMaxCents ? solution.monthlyCostMaxCents / 100 : 0,
    outcome: solution.outcome || "",
    demoPrice: solution.demoPriceCents ? solution.demoPriceCents / 100 : 2,

    milestones: milestones.length > 0 ? milestones : [
      { title: "Core Logic Engine", description: "Setup and configuration of the main automation workflow.", price: 0 },
      { title: "Environment Mapping", description: "Customizing fields and triggers to match your specific tools.", price: 0 },
      { title: "QA & Handover", description: "Testing and final walkthrough session.", price: 0 },
    ],

    outline: solution.outline && solution.outline.length > 0
      ? [...solution.outline, "", "", ""].slice(0, 3)
      : ["", "", ""],

    structureConsistent: solution.structureConsistent || [],
    structureCustom: solution.structureCustom || [],
    businessGoals: solution.businessGoals || [],
    industries: solution.industries || [],

    demoVideoUrl: solution.demoVideoUrl || "",

    proofEnabled: !!solution.proofType,
    proofType: solution.proofType || undefined,
    proofContent: solution.proofContent || undefined,

    lastStep: solution.lastStep || 1,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Solution</h1>
        <p className="text-muted-foreground">
          Update your solution details. Locked fields cannot be changed if the solution is in use.
        </p>
      </div>
      
      <SolutionWizard 
        initialData={initialData} 
        isLocked={lockState.locked}
        lockReason={lockState.reason}
      />
    </div>
  );
}
