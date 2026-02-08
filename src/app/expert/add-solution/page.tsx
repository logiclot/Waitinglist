import { SolutionWizard } from "@/components/solutions/SolutionWizard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewSolutionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // @ts-expect-error: role is part of user session
  if (session.user.role !== "SPECIALIST" && session.user.role !== "ADMIN") {
    redirect("/dashboard"); // Redirect non-experts
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Solution</h1>
        <p className="text-muted-foreground">
          Create a productized automation solution. Follow the steps to ensure a high-quality listing.
        </p>
      </div>
      
      <SolutionWizard />
    </div>
  );
}
