import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `Documentation | ${BRAND_NAME}`,
  description: `Learn about automation, AI agents, workflows, and how ${BRAND_NAME} helps businesses automate.`,
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      {children}
    </div>
  );
}
