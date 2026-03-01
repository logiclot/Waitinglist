import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminGetJobForFill, adminGeneratePaymentLink } from "@/actions/admin";
import { AdminQuestionnaireFill } from "./AdminQuestionnaireFill";

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function AdminFillPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/auth/sign-in");

  const { jobId } = await params;

  const [jobRes, linkRes] = await Promise.all([
    adminGetJobForFill(jobId),
    adminGeneratePaymentLink(jobId),
  ]);

  if ("error" in jobRes || !jobRes.job) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-sm font-bold text-destructive">
            {("error" in jobRes && jobRes.error) || "Job not found."}
          </p>
          <a href="/admin/post-on-behalf" className="text-xs text-primary hover:underline mt-2 inline-block">
            &larr; Back to Post on Behalf
          </a>
        </div>
      </div>
    );
  }

  const paymentUrl = "paymentUrl" in linkRes ? (linkRes.paymentUrl ?? null) : null;
  const isSimulated = "isSimulated" in linkRes ? (linkRes.isSimulated ?? false) : false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <AdminQuestionnaireFill
        job={jobRes.job}
        paymentUrl={paymentUrl}
        isSimulated={isSimulated}
      />
    </div>
  );
}
