import { EmptyState } from "@/components/EmptyState";

export default function HelpPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Help & Onboarding</h1>
      <EmptyState
        title="Need assistance?"
        description="Access guides, documentation, and support resources."
        primaryCtaLabel="Contact Support"
        primaryCtaHref="mailto:support@logiclot.com"
      />
    </div>
  );
}
