"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteEcosystem } from "@/actions/ecosystems";

export function DeleteEcosystemButton({ ecosystemId }: { ecosystemId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this suite permanently? This cannot be undone.")) return;
    setLoading(true);
    await deleteEcosystem(ecosystemId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors disabled:opacity-50"
      title="Delete suite"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
