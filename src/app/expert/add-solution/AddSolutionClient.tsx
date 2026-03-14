"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { JsonImportButton } from "@/components/solutions/JsonImportButton";
import { SolutionWizard } from "@/components/solutions/SolutionWizard";
import { CategorySaturationPanel } from "@/components/solutions/CategorySaturationPanel";
import type { WizardState } from "@/components/solutions/SolutionWizard";

type ImportableData = Partial<
  Pick<WizardState, "title" | "integrations" | "category" | "requiredInputs" | "short_summary">
>;

const ALL_FIELDS = ["Title", "Tools used", "Category", "Required access", "Short summary"];

interface AddSolutionClientProps {
  saturationData: { category: string; count: number }[];
}

export function AddSolutionClient({ saturationData }: AddSolutionClientProps) {
  const [importedData, setImportedData] = useState<ImportableData>({});
  const [importKey, setImportKey]       = useState(0);
  const [importResult, setImportResult] = useState<{
    populated: string[];
    missing: string[];
  } | null>(null);

  function handleImport(data: ImportableData, populatedFields: string[]) {
    const missing = ALL_FIELDS.filter((f) => !populatedFields.includes(f));
    setImportedData(data);
    setImportKey((k) => k + 1); // force wizard re-mount with fresh initial data
    setImportResult({ populated: populatedFields, missing });
  }

  return (
    <>
      {/* Category demand — compact horizontal strip */}
      <CategorySaturationPanel saturationData={saturationData} />

      {/* Import banner */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-secondary/30">
        <p className="text-sm font-bold text-foreground mb-2">Have an existing workflow?</p>
        <JsonImportButton onImport={handleImport} />
      </div>

      {/* Import result banner */}
      {importResult && (
        <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800 mb-1">
                Workflow imported — form pre-filled below
              </p>
              {importResult.populated.length > 0 && (
                <p className="text-xs text-green-700">
                  Pre-filled: {importResult.populated.join(", ")}
                </p>
              )}
              {importResult.missing.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs text-amber-700">
                    Still needed: {importResult.missing.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Solution wizard — key forces full re-mount when JSON is imported */}
      <SolutionWizard key={importKey} initialData={importedData} />
    </>
  );
}
