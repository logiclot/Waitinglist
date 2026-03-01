"use client";

import React from "react";

// ─── SingleSelect ────────────────────────────────────────────────────────────

export const SingleSelect = ({
  label,
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
  helperText,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  helperText?: string;
}) => (
  <div className="space-y-3 mb-8">
    <label className="block text-lg font-bold text-foreground">
      {label} <span className="text-primary">*</span>
    </label>
    {helperText && (
      <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          type="button"
          className={`p-3 rounded-lg border text-left text-sm transition-all ${
            value === opt
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
              : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
    {(value === "Other" || value === "Yes") && onOtherChange && (
      <input
        value={otherValue}
        onChange={(e) => onOtherChange(e.target.value)}
        className="w-full mt-2 bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
        placeholder="Please specify..."
        autoFocus
      />
    )}
  </div>
);

// ─── MultiSelectMax2 ─────────────────────────────────────────────────────────

export const MultiSelectMax2 = ({
  label,
  options,
  selected,
  onToggle,
  otherValue,
  onOtherChange,
  helperText,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  helperText?: string;
}) => {
  const handleToggle = (val: string) => {
    if (selected.includes(val)) onToggle(val);
    else if (selected.length < 2) onToggle(val);
  };
  return (
    <div className="space-y-3 mb-8">
      <label className="block text-lg font-bold text-foreground">
        {label} <span className="text-primary">*</span>
      </label>
      {helperText && (
        <p className="text-sm text-muted-foreground -mt-2 mb-2">
          {helperText}
        </p>
      )}
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
        Select up to 2
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => handleToggle(opt)}
              type="button"
              disabled={!isSelected && selected.length >= 2}
              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected.includes("Other") && onOtherChange && (
        <input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          className="w-full mt-2 bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
          placeholder="Please specify..."
          autoFocus
        />
      )}
    </div>
  );
};

// ─── MultiSelectWithToolNames ────────────────────────────────────────────────

export const MultiSelectWithToolNames = ({
  label,
  options,
  selected,
  onToggle,
  toolNames,
  onToolNameChange,
  otherValue,
  onOtherChange,
  helperText,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  toolNames: Record<string, string>;
  onToolNameChange: (tool: string, name: string) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  helperText?: string;
}) => (
  <div className="space-y-3 mb-8">
    <label className="block text-lg font-bold text-foreground">
      {label} <span className="text-primary">*</span>
    </label>
    {helperText && (
      <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>
    )}
    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
      Select all that apply
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <div key={opt} className="space-y-1">
            <button
              onClick={() => onToggle(opt)}
              type="button"
              className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt}
            </button>
            {isSelected && opt !== "Other" && (
              <input
                value={toolNames[opt] || ""}
                onChange={(e) => onToolNameChange(opt, e.target.value)}
                placeholder="Name of tool"
                className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
              />
            )}
          </div>
        );
      })}
    </div>
    {selected.includes("Other") && onOtherChange && (
      <div className="space-y-1">
        <input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
          placeholder="Please specify..."
          autoFocus
        />
        <input
          value={toolNames["Other"] || ""}
          onChange={(e) => onToolNameChange("Other", e.target.value)}
          placeholder="Name of tool"
          className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
        />
      </div>
    )}
  </div>
);

// ─── MultiSelect ─────────────────────────────────────────────────────────────

export const MultiSelect = ({
  label,
  options,
  selected,
  onToggle,
  otherValue,
  onOtherChange,
  helperText,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  helperText?: string;
}) => (
  <div className="space-y-3 mb-8">
    <label className="block text-lg font-bold text-foreground">
      {label} <span className="text-primary">*</span>
    </label>
    {helperText && (
      <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>
    )}
    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
      Select all that apply
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            type="button"
            className={`p-3 rounded-lg border text-left text-sm transition-all ${
              isSelected
                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
    {selected.includes("Other") && onOtherChange && (
      <input
        value={otherValue}
        onChange={(e) => onOtherChange(e.target.value)}
        className="w-full mt-2 bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
        placeholder="Please specify..."
        autoFocus
      />
    )}
  </div>
);
