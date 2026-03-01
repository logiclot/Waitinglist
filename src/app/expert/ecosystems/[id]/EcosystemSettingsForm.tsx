"use client";

import { useState } from "react";
import { updateEcosystem, publishEcosystem } from "@/actions/ecosystems";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EcosystemSettingsForm({ ecosystem }: { ecosystem: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: ecosystem.title,
    description: ecosystem.description || "",
  });
  const [isPublished, setIsPublished] = useState(ecosystem.published);

  const handleSave = async () => {
    setLoading(true);
    const res = await updateEcosystem(ecosystem.id, formData);
    setLoading(false);

    if (res.success) {
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
  };

  const handlePublishToggle = async () => {
    const newState = !isPublished;
    setLoading(true);
    const res = await publishEcosystem(ecosystem.id, newState);
    setLoading(false);

    if (res.success) {
      setIsPublished(newState);
      toast.success(newState ? "Suite published!" : "Suite unpublished");
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border">
        <span className="font-medium text-sm">Status</span>
        <button
          onClick={handlePublishToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublished ? 'bg-green-500' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isPublished ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-24 resize-none"
          maxLength={140}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
      </button>
    </div>
  );
}
