import { notFound } from "next/navigation";

export default async function WaitlistLayout() {
  return notFound();
  // const session = await getServerSession(authOptions);

  // if (session?.user) {
  //   const role = session.user.role as "EXPERT" | "BUSINESS";
  //   if (role === "EXPERT") redirect("/dashboard");
  //   if (role === "BUSINESS") redirect("/business");
  // }

  // return <>{children}</>;
}
