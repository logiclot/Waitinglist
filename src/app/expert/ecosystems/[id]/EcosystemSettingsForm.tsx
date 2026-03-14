"use client";

import { useState, useMemo } from "react";
import { updateEcosystem, publishEcosystem } from "@/actions/ecosystems";
import { toast } from "sonner";
import { Loader2, Tag, AlertTriangle } from "lucide-react";
import { formatCentsToCurrency } from "@/lib/commission";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EcosystemSettingsForm({ ecosystem }: { ecosystem: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: ecosystem.title,
    description: ecosystem.shortPitch || "",
    bundlePriceCents: ecosystem.bundlePriceCents as number | null,
    extSupport6mCents: ecosystem.extSupport6mCents as number | null,
    extSupport12mCents: ecosystem.extSupport12mCents as number | null,
    extSupportDescription: ecosystem.extSupportDescription || "",
  });
  const [isPublished, setIsPublished] = useState(ecosystem.isPublished);

  // Compute sum-of-parts from items
  const sumOfPartsCents = useMemo(() => {
    if (!ecosystem.items || !Array.isArray(ecosystem.items)) return 0;
    return ecosystem.items.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, item: any) =>
        sum + (item.solution?.implementationPriceCents ?? 0),
      0
    );
  }, [ecosystem.items]);

  // Savings computations
  const hasBundleDiscount =
    formData.bundlePriceCents != null &&
    formData.bundlePriceCents > 0 &&
    formData.bundlePriceCents < sumOfPartsCents;
  const savingsCents = hasBundleDiscount
    ? sumOfPartsCents - formData.bundlePriceCents!
    : 0;
  const savingsPercent = hasBundleDiscount
    ? Math.round((savingsCents / sumOfPartsCents) * 100)
    : 0;
  const bundleTooHigh =
    formData.bundlePriceCents != null &&
    formData.bundlePriceCents > 0 &&
    formData.bundlePriceCents >= sumOfPartsCents;

  const handleSave = async () => {
    setLoading(true);
    const res = await updateEcosystem(ecosystem.id, {
      title: formData.title,
      shortPitch: formData.description,
      bundlePriceCents: formData.bundlePriceCents,
      extSupport6mCents: formData.extSupport6mCents,
      extSupport12mCents: formData.extSupport12mCents,
      extSupportDescription: formData.extSupportDescription || null,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Settings saved");
    } else {
      toast.error(res.error || "Failed to save settings");
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

  /** Convert a €-input string to cents (null if empty) */
  const euroToCents = (val: string): number | null => {
    const n = parseFloat(val.replace(",", "."));
    return isNaN(n) || n === 0 ? null : Math.round(n * 100);
  };
  /** Display cents as a euro string for the input */
  const centsToEuro = (cents: number | null): string => {
    if (cents == null) return "";
    return (cents / 100).toString();
  };

  return (
    <div className="space-y-6">
      {/* Publish toggle */}
      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border">
        <span className="font-medium text-sm">Status</span>
        <button
          onClick={handlePublishToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublished ? "bg-green-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublished ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-24 resize-none"
          maxLength={140}
        />
      </div>

      {/* ── Pricing & Support ─────────────────────────────────────────────────── */}
      <div className="bg-secondary/10 rounded-xl p-4 border border-border space-y-5">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" /> Pricing & Support
        </h3>

        {/* Bundle Discount */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Suite Price (Bundle Discount)
          </label>
          <p className="text-xs text-muted-foreground">
            Set a discounted total price for the full suite. Leave empty for no
            discount.
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={
                sumOfPartsCents > 0
                  ? `Individual total: ${(sumOfPartsCents / 100).toLocaleString("de-DE")}`
                  : "e.g. 10000"
              }
              value={centsToEuro(formData.bundlePriceCents)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bundlePriceCents: euroToCents(e.target.value),
                })
              }
              className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Live savings preview */}
          {hasBundleDiscount && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
              <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-emerald-700">
                {formatCentsToCurrency(sumOfPartsCents)} →{" "}
                <span className="font-bold">
                  {formatCentsToCurrency(formData.bundlePriceCents!)}
                </span>{" "}
                → Save {formatCentsToCurrency(savingsCents)} ({savingsPercent}%)
              </span>
            </div>
          )}

          {/* Warning if suite price ≥ sum */}
          {bundleTooHigh && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-700">
                Suite price should be lower than the individual total (
                {formatCentsToCurrency(sumOfPartsCents)}) to offer a discount.
              </span>
            </div>
          )}
        </div>

        {/* Extended Support */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Extended Support Packages
          </label>
          <p className="text-xs text-muted-foreground">
            Offer paid support beyond the standard delivery period.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                6-Month Support
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 2000"
                  value={centsToEuro(formData.extSupport6mCents)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extSupport6mCents: euroToCents(e.target.value),
                    })
                  }
                  className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                12-Month Support
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 3500"
                  value={centsToEuro(formData.extSupport12mCents)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extSupport12mCents: euroToCents(e.target.value),
                    })
                  }
                  className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Support description */}
          <div>
            <label className="block text-xs font-medium mb-1">
              What&apos;s Included
            </label>
            <textarea
              value={formData.extSupportDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  extSupportDescription: e.target.value,
                })
              }
              placeholder="e.g. Monthly check-ins, priority bug fixes, tool updates, workflow optimization reviews..."
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-20 resize-none"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}
