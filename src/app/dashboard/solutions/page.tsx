import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MySolutionsPage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role is in session
  const role = session?.user?.role;
  const isExpert = role === "SPECIALIST";

  if (!isExpert) {
     // Fallback for business users if they end up here
     return (
        <div className="p-8 max-w-4xl mx-auto">
           <h1 className="text-3xl font-bold mb-8">My Solutions</h1>
           <EmptyState
             title="Saved Solutions"
             description="Solutions you have saved or purchased will appear here."
             primaryCtaLabel="Browse Solutions"
             primaryCtaHref="/solutions"
           />
        </div>
     )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Solutions</h1>
      <EmptyState
        title="No solutions listed"
        description="Create productized solutions to sell your expertise on the marketplace."
        primaryCtaLabel="Add Solution"
        primaryCtaHref="/solutions/new"
      />
    </div>
  );
}
