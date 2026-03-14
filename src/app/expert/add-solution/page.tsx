import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddSolutionClient } from "./AddSolutionClient";
import { getCategorySaturation } from "@/actions/solutions";

export default async function NewSolutionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "EXPERT" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const saturationData = await getCategorySaturation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Solution</h1>
        <p className="text-muted-foreground">
          Create a productized automation solution. Follow the steps to ensure a high-quality listing.
        </p>
      </div>

      <AddSolutionClient saturationData={saturationData} />
    </div>
  );
}
