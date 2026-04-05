"use client";

import { useState } from "react";
import { updateExpertProfile } from "@/actions/expert";
import { toast } from "sonner";

interface ProfileSectionProps {
  initialDisplayName: string;
  initialBio: string;
}

export function ProfileSection({ initialDisplayName, initialBio }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateExpertProfile({ displayName, bio });
    setSaving(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Public Profile</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Display Name</label>
            <input
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <input
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              placeholder="Automation Architect"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Bio</label>
          <textarea
            className="w-full bg-background border border-border rounded-md px-3 py-2 h-24"
            placeholder="Tell businesses about your expertise..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
