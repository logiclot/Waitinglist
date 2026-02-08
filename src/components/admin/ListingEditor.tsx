"use client";

import { useState } from "react";
import { Solution, ImplementationTime, ImplementationType } from "@/types";
import { CATEGORY_DEFINITIONS } from "@/lib/categories";
import { Check, X } from "lucide-react";
import { validateDemoVideoUrl } from "@/lib/video";

interface ListingEditorProps {
  initialData: Partial<Solution>;
  onSave: (data: Partial<Solution>) => void;
  onCancel: () => void;
}

const IMPLEMENTATION_TIMES: ImplementationTime[] = [
  "Same day", "1–3 days", "4–7 days", "1–2 weeks", "2+ weeks"
];

const IMPLEMENTATION_TYPES: ImplementationType[] = [
  "Done-for-you implementation", "Guided setup", "Audit & optimization"
];

export function ListingEditor({ initialData, onSave, onCancel }: ListingEditorProps) {
  const [formData, setFormData] = useState<Partial<Solution>>({
    title: "",
    short_summary: "",
    description: "",
    category: CATEGORY_DEFINITIONS[0].name,
    integrations: [],
    included: [],
    excluded: [],
    prerequisites: [],
    estimated_implementation_time: "1–3 days",
    implementation_type: "Done-for-you implementation",
    implementation_price: 0,
    monthly_cost_min: 0,
    monthly_cost_max: 0,
    delivery_days: 3,
    support_days: 30, // Default to 30
    demo_video_url: "",
    ...initialData
  });

  const [toolInput, setToolInput] = useState("");
  const [includedInput, setIncludedInput] = useState("");
  const [excludedInput, setExcludedInput] = useState("");
  const [prereqInput, setPrereqInput] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);

  // Validation Checklist
  const checks = {
    title: (formData.title?.length || 0) >= 8,
    summary: (formData.short_summary?.length || 0) >= 60 && (formData.short_summary?.length || 0) <= 140,
    category: !!formData.category,
    tools: (formData.integrations?.length || 0) >= 1,
    deliverables: (formData.included?.length || 0) >= 3,
    prereqs: (formData.prerequisites?.length || 0) >= 1,
    time: !!formData.estimated_implementation_time,
    type: !!formData.implementation_type,
    price: (formData.implementation_price || 0) > 0,
    support: !!formData.support_days, // Mandatory support
  };

  const isFormValid = Object.values(checks).every(Boolean);

  const handleInputChange = (field: keyof Solution, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: 'integrations' | 'included' | 'excluded' | 'prerequisites', value: string, setInput: (v: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
    setInput("");
  };

  const handleArrayRemove = (field: 'integrations' | 'included' | 'excluded' | 'prerequisites', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleVideoChange = (url: string) => {
    handleInputChange('demo_video_url', url);
    if (!url) {
      setVideoError(null);
      return;
    }
    const result = validateDemoVideoUrl(url);
    if (!result.ok) {
      setVideoError(result.error || "Invalid YouTube URL");
    } else {
      setVideoError(null);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    // If video is present but invalid, don't submit or warn?
    // Let's assume valid if no error
    
    onSave({
      ...formData,
      status: 'draft', // Always save as draft first or keep existing status? Prompt implies logic.
      // Mapping legacy price fields if needed
      implementation_price_cents: (formData.implementation_price || 0) * 100,
      monthly_cost_min_cents: (formData.monthly_cost_min || 0) * 100,
      monthly_cost_max_cents: (formData.monthly_cost_max || 0) * 100,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Basic Info */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Automated Lead Qualification for HubSpot"
            />
            <p className="text-xs text-muted-foreground mt-1">Min 8 chars</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Outcome Line (Optional)</label>
            <input 
              type="text" 
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              value={formData.outcome || ''}
              onChange={(e) => handleInputChange('outcome', e.target.value)}
              placeholder="e.g. Reduces manual lead handling for sales teams."
            />
            <p className="text-xs text-muted-foreground mt-1">One sentence describing practical business impact.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Short Summary <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full bg-background border border-border rounded-md px-3 py-2 h-24 resize-none"
              value={formData.short_summary}
              onChange={(e) => handleInputChange('short_summary', e.target.value)}
              maxLength={140}
              placeholder="Describe the outcome in one sentence..."
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={checks.summary ? "text-green-500" : "text-muted-foreground"}>Min 60 chars</span>
              <span>{formData.short_summary?.length || 0}/140</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
            <select 
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {CATEGORY_DEFINITIONS.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tools Used <span className="text-red-500">*</span></label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-2"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('integrations', toolInput, setToolInput)}
                placeholder="Add tool (e.g. Zapier)"
              />
              <button 
                onClick={() => handleArrayAdd('integrations', toolInput, setToolInput)}
                className="px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.integrations?.map((tag, i) => (
                <span key={i} className="bg-secondary/50 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => handleArrayRemove('integrations', i)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation Details */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold">Implementation Scope</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium mb-2">Implementation Type <span className="text-red-500">*</span></label>
               <select 
                  className="w-full bg-background border border-border rounded-md px-3 py-2"
                  value={formData.implementation_type}
                  onChange={(e) => handleInputChange('implementation_type', e.target.value)}
                >
                  {IMPLEMENTATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
               <label className="block text-sm font-medium mb-2">Estimated Time <span className="text-red-500">*</span></label>
               <select 
                  className="w-full bg-background border border-border rounded-md px-3 py-2"
                  value={formData.estimated_implementation_time}
                  onChange={(e) => handleInputChange('estimated_implementation_time', e.target.value)}
                >
                  {IMPLEMENTATION_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Post-Delivery Support <span className="text-red-500">*</span></label>
             <select 
                className="w-full bg-background border border-border rounded-md px-3 py-2"
                value={formData.support_days}
                onChange={(e) => handleInputChange('support_days', parseInt(e.target.value))}
              >
                <option value={15}>15 days included</option>
                <option value={30}>30 days included</option>
                <option value={60}>60 days included</option>
              </select>
             <p className="text-xs text-muted-foreground mt-1">Mandatory support period for bug fixes and adjustments.</p>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Deliverables (Included) <span className="text-red-500">*</span></label>
             <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-2"
                value={includedInput}
                onChange={(e) => setIncludedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('included', includedInput, setIncludedInput)}
                placeholder="Add deliverable"
              />
              <button onClick={() => handleArrayAdd('included', includedInput, setIncludedInput)} className="px-4 py-2 bg-secondary rounded-md">Add</button>
            </div>
            <ul className="space-y-2">
               {formData.included?.map((item, i) => (
                 <li key={i} className="flex items-start gap-2 text-sm">
                   <Check className="h-4 w-4 text-green-500 mt-0.5" />
                   <span className="flex-1">{item}</span>
                   <button onClick={() => handleArrayRemove('included', i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                 </li>
               ))}
            </ul>
             <p className="text-xs text-muted-foreground mt-1">Min 3 items</p>
          </div>

           <div>
             <label className="block text-sm font-medium mb-2">Deliverables (Excluded)</label>
             <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-2"
                value={excludedInput}
                onChange={(e) => setExcludedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('excluded', excludedInput, setExcludedInput)}
                placeholder="Add excluded item (optional)"
              />
              <button onClick={() => handleArrayAdd('excluded', excludedInput, setExcludedInput)} className="px-4 py-2 bg-secondary rounded-md">Add</button>
            </div>
            <ul className="space-y-2">
               {formData.excluded?.map((item, i) => (
                 <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                   <X className="h-4 w-4 mt-0.5" />
                   <span className="flex-1">{item}</span>
                   <button onClick={() => handleArrayRemove('excluded', i)} className="hover:text-destructive"><X className="h-4 w-4" /></button>
                 </li>
               ))}
            </ul>
          </div>
          
           <div>
             <label className="block text-sm font-medium mb-2">Prerequisites <span className="text-red-500">*</span></label>
             <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-2"
                value={prereqInput}
                onChange={(e) => setPrereqInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('prerequisites', prereqInput, setPrereqInput)}
                placeholder="Add prerequisite (e.g. Admin access)"
              />
              <button onClick={() => handleArrayAdd('prerequisites', prereqInput, setPrereqInput)} className="px-4 py-2 bg-secondary rounded-md">Add</button>
            </div>
            <ul className="space-y-2">
               {formData.prerequisites?.map((item, i) => (
                 <li key={i} className="flex items-start gap-2 text-sm">
                   <span className="text-muted-foreground">•</span>
                   <span className="flex-1">{item}</span>
                   <button onClick={() => handleArrayRemove('prerequisites', i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                 </li>
               ))}
            </ul>
             <p className="text-xs text-muted-foreground mt-1">Min 1 item</p>
          </div>
        </section>
        
        {/* Pricing */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold">Pricing</h2>
           <div>
             <label className="block text-sm font-medium mb-2">Implementation Price ($) <span className="text-red-500">*</span></label>
             <input 
               type="number" 
               className="w-full bg-background border border-border rounded-md px-3 py-2"
               value={formData.implementation_price || ''}
               onChange={(e) => handleInputChange('implementation_price', parseFloat(e.target.value))}
               placeholder="2500"
             />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-2">Min Monthly Cost ($)</label>
               <input 
                 type="number" 
                 className="w-full bg-background border border-border rounded-md px-3 py-2"
                 value={formData.monthly_cost_min || ''}
                 onChange={(e) => handleInputChange('monthly_cost_min', parseFloat(e.target.value))}
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-2">Max Monthly Cost ($)</label>
               <input 
                 type="number" 
                 className="w-full bg-background border border-border rounded-md px-3 py-2"
                 value={formData.monthly_cost_max || ''}
                 onChange={(e) => handleInputChange('monthly_cost_max', parseFloat(e.target.value))}
               />
             </div>
           </div>
           <p className="text-xs text-muted-foreground">Estimated third-party costs (OpenAI, hosting, etc.)</p>
        </section>

        {/* Demo Video */}
         <section className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold">Demo Video (Optional)</h2>
           <div>
             <label className="block text-sm font-medium mb-2">YouTube URL</label>
             <input 
               type="text" 
               className="w-full bg-background border border-border rounded-md px-3 py-2"
               value={formData.demo_video_url || ''}
               onChange={(e) => handleVideoChange(e.target.value)}
               placeholder="https://youtube.com/..."
             />
             {videoError && <p className="text-sm text-red-500 mt-1">{videoError}</p>}
             <p className="text-xs text-muted-foreground mt-1">Must be a valid YouTube link.</p>
           </div>
        </section>

      </div>

      {/* Right: Checklist & Actions */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
          <h3 className="font-bold text-lg mb-4">Publishing Checklist</h3>
          <ul className="space-y-3 mb-8">
            <CheckItem label="Title (8+ chars)" checked={checks.title} />
            <CheckItem label="Summary (60-140 chars)" checked={checks.summary} />
            <CheckItem label="Category selected" checked={checks.category} />
            <CheckItem label="Tools listed (1+)" checked={checks.tools} />
            <CheckItem label="Deliverables (3+)" checked={checks.deliverables} />
            <CheckItem label="Prerequisites (1+)" checked={checks.prereqs} />
            <CheckItem label="Time & Type selected" checked={checks.time && checks.type} />
            <CheckItem label="Support included" checked={checks.support} />
             <CheckItem label="Price set" checked={checks.price} />
          </ul>

          <div className="space-y-3">
            <button 
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish Listing
            </button>
            <button 
              onClick={onSave.bind(null, { ...formData, status: 'draft' })}
              className="w-full py-3 border border-border bg-background hover:bg-secondary rounded-md font-medium"
            >
              Save as Draft
            </button>
             <button 
              onClick={onCancel}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${checked ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"}`}>
        {checked ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
      </div>
      <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
    </li>
  )
}
