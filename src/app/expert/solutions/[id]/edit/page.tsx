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

  // Map Solution to WizardState
  const initialData: Partial<WizardState> = {
    id: solution.id,
    title: solution.title,
    category: solution.category,
    integrations: solution.integrations,
    short_summary: solution.shortSummary || "",
    longDescription: solution.longDescription || "",
    complexity: solution.complexity || "Standard",
    
    included: solution.included,
    excluded: solution.excluded.join("\n"),
    
    accessRequired: solution.accessRequired || "",
    requiredInputs: solution.requiredInputs,
    requiredInputsText: solution.requiredInputs.join("\n"),
    questions: solution.questions ? (solution.questions as string[]) : [],
    
    delivery_days: solution.deliveryDays,
    support_days: solution.supportDays,
    
    implementation_price: solution.implementationPriceCents / 100,
    monthly_cost_min: solution.monthlyCostMinCents ? solution.monthlyCostMinCents / 100 : 0,
    monthly_cost_max: solution.monthlyCostMaxCents ? solution.monthlyCostMaxCents / 100 : 0,
    outcome: solution.outcome || "",
    
    proofEnabled: !!solution.proofType,
    proofType: solution.proofType || undefined,
    proofContent: solution.proofContent || undefined,
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
