import { redirect } from "next/navigation";

// Suite invites are now embedded in the Suites page
export default function SuiteInvitesRedirect() {
  redirect("/expert/ecosystems");
}
