import { redirect } from "next/navigation";

export default function ExpertCompletedPage() {
  redirect("/expert/projects?tab=completed");
}
