import { getAdminData } from "@/actions/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const data = await getAdminData();

  if ('error' in data) {
    // Basic redirect for unauthorized
    redirect("/");
  }

  return <AdminDashboard initialExperts={data.experts} initialSolutions={data.solutions} />;
}
