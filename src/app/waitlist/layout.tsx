import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = session.user.role as "EXPERT" | "BUSINESS";
    if (role === "EXPERT") redirect("/dashboard");
    if (role === "BUSINESS") redirect("/business");
  }

  return <>{children}</>;
}
