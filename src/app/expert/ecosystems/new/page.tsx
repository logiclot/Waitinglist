"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEcosystem } from "@/actions/ecosystems";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewEcosystemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const res = await createEcosystem(formData);
    setLoading(false);

    if (res.success && res.ecosystemId) {
      toast.success("Suite created!");
      router.push(`/expert/ecosystems/${res.ecosystemId}`);
    } else {
      toast.error(res.error || "Failed to create suite");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/expert/ecosystems" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to Suites
      </Link>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Create New Suite</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Suite Title</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              placeholder="e.g. Complete Lead Gen Stack"
              maxLength={60}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (1-2 sentences)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 h-24 resize-none"
              placeholder="Explain the value of this suite in simple terms..."
              maxLength={140}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{formData.description.length}/140</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Start Building"}
          </button>
        </form>
      </div>
    </div>
  );
}
