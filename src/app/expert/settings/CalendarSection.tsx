"use client";

import { useState, useMemo } from "react";
import { updateExpertCalendar } from "@/actions/expert";
import { Calendar, ExternalLink, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

function detectProvider(
  url: string
): { name: string; className: string } | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("calendly.com"))
      return {
        name: "Calendly",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      };
    if (hostname.includes("cal.com"))
      return {
        name: "Cal.com",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
    if (hostname.includes("savvycal.com"))
      return {
        name: "SavvyCal",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      };
    if (hostname.includes("hubspot.com"))
      return {
        name: "HubSpot",
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      };
    if (hostname.includes("acuityscheduling.com"))
      return {
        name: "Acuity",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      };
    return null;
  } catch {
    return null;
  }
}

export function CalendarSection({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [savedUrl, setSavedUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = url !== savedUrl;

  const provider = useMemo(
    () => (savedUrl ? detectProvider(savedUrl) : null),
    [savedUrl]
  );

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await updateExpertCalendar(url);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSavedUrl(url);
        setSaved(true);
        toast.success("Calendar link saved");
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      toast.error("Failed to save calendar link");
    } finally {
      setSaving(false);
    }
  };

  const handleTestLink = () => {
    if (savedUrl) {
      window.open(savedUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-bold">Calendar / Booking Link</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Scheduling URL
          </label>
          <input
            type="url"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            placeholder="https://calendly.com/your-name or https://cal.com/your-name"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            This link will be shown on your public profile and sent to clients
            after demo bookings.
          </p>
        </div>

        {/* Provider detection badge */}
        {provider && savedUrl && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${provider.className}`}
            >
              Connected: {provider.name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || (!isDirty && !saved)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm disabled:opacity-50 transition-opacity"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Calendar Link"
            )}
          </button>

          {savedUrl && (
            <button
              onClick={handleTestLink}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Test Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
