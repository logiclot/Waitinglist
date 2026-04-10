"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { submitBid } from "@/actions/jobs";
import { toast } from "sonner";
import {
  Loader2, Plus, Trash2, CheckCircle2,
  ChevronDown, ChevronUp, Zap, Target,
  LayoutList, EuroIcon
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Outcome {
  what: string;        // e.g. "Hours saved per week"
  value: string;       // e.g. "12"
  timeframe: string;   // e.g. "30"
  timeframeUnit: string; // "days" | "weeks" | "months"
}

interface Phase {
  name: string;
  scope: string;
  duration: string;      // numeric value
  durationUnit: string;  // "days" | "weeks" | "months"
  price?: string;        // optional per-phase price in EUR — becomes a payment milestone
}

const OUTCOME_PLACEHOLDERS = [
  "e.g. Hours saved per week",
  "e.g. Revenue increase",
  "e.g. Error rate reduction",
  "e.g. Leads generated per month",
  "e.g. Customer response time",
];

const TIMEFRAME_UNITS = ["days", "weeks", "months"] as const;
const DURATION_UNITS = ["days", "weeks", "months"] as const;
const SUPPORT_OPTIONS = [
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ icon, title, subtitle, children, defaultOpen = true }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[44px] sm:min-h-0 touch-manipulation bg-secondary/20 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 py-5 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children, required }: {
  label: string; hint?: string; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

const input = "w-full bg-background border border-border rounded-md px-3 py-2.5 min-h-[44px] sm:min-h-0 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition touch-manipulation";

// ── Main Form ─────────────────────────────────────────────────────────────────

export function ProposalForm({ jobId, jobCategory }: { jobId: string; jobCategory?: string }) {
  const isDiscovery = jobCategory === "Discovery" || jobCategory === "Discovery Scan";

  // Core fields
  const [automationTitle, setAutomationTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [problemAddressed, setProblemAddressed] = useState("");
  const [whatYoullBuild, setWhatYoullBuild] = useState("");

  // Outcomes (measurable results)
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { what: "", value: "", timeframe: "", timeframeUnit: "days" },
    { what: "", value: "", timeframe: "", timeframeUnit: "days" },
  ]);

  // Tools
  const [tools, setTools] = useState<string[]>(["", ""]);

  // Phases
  const [phases, setPhases] = useState<Phase[]>([
    { name: "Phase 1", scope: "", duration: "", durationUnit: "weeks", price: "" },
    { name: "Phase 2", scope: "", duration: "", durationUnit: "weeks", price: "" },
  ]);

  // Support period
  const [supportDays, setSupportDays] = useState("30");

  // Scope
  const [included, setIncluded] = useState<string[]>(["", "", ""]);
  const [excluded, setExcluded] = useState<string[]>(["", ""]);

  // Deal
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [timelineUnit, setTimelineUnit] = useState("weeks");
  const [credibility, setCredibility] = useState("");

  const [pending, setPending] = useState(false);
  const [state, formAction] = useFormState(submitBid as (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }>, null as unknown as { error?: string; success?: boolean });

  // ── Price sync helpers ────────────────────────────────────────────────────
  // Editing total → distribute equally across phases
  const handleTotalPriceChange = (val: string) => {
    setPrice(val);
    const total = parseFloat(val);
    if (!isNaN(total) && total > 0) {
      const per = (total / phases.length).toFixed(2);
      setPhases(prev => prev.map(p => ({ ...p, price: per })));
    } else if (val === "") {
      setPhases(prev => prev.map(p => ({ ...p, price: "" })));
    }
  };

  // Editing a phase price → sum all phases into total
  const handlePhasePriceChange = (idx: number, val: string) => {
    const updated = phases.map((p, i) => i === idx ? { ...p, price: val } : p);
    setPhases(updated);
    const prices = updated.map(p => parseFloat(p.price || "0"));
    const allFilled = updated.every(p => p.price !== "" && !isNaN(parseFloat(p.price || "")));
    if (allFilled) {
      setPrice(prices.reduce((a, b) => a + b, 0).toFixed(2));
    }
  };

  // When a phase is added or removed, redistribute if total is set
  const addPhase = () => {
    const newPhases = [...phases, { name: `Phase ${phases.length + 1}`, scope: "", duration: "", durationUnit: "weeks", price: "" }];
    const total = parseFloat(price);
    if (!isNaN(total) && total > 0) {
      const per = (total / newPhases.length).toFixed(2);
      setPhases(newPhases.map(p => ({ ...p, price: per })));
    } else {
      setPhases(newPhases);
    }
  };

  const removePhase = (idx: number) => {
    const newPhases = phases.filter((_, i) => i !== idx);
    if (newPhases.length === 0) { setPhases([]); return; }
    const total = parseFloat(price);
    if (!isNaN(total) && total > 0) {
      const per = (total / newPhases.length).toFixed(2);
      setPhases(newPhases.map(p => ({ ...p, price: per })));
    } else {
      setPhases(newPhases);
    }
  };

  // Reset pending spinner whenever the server responds (success or error)
  useEffect(() => {
    if (state !== null) {
      setPending(false);
    }
  }, [state]);

  if (state?.success) {
    return (
      <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
        <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Proposal submitted</h3>
        <p className="text-sm text-muted-foreground">The buyer has been notified and can view your full proposal.</p>
      </div>
    );
  }

  // Build the proposal JSON on submit
  function buildProposalJson() {
    return JSON.stringify({
      automationTitle,
      problemAddressed,
      whatYoullBuild,
      outcomes: outcomes.filter(o => o.what && o.value).map(o => ({
        what: o.what,
        value: o.value,
        timeframe: o.timeframe ? `${o.timeframe} ${o.timeframeUnit}` : "",
      })),
      tools: tools.filter(Boolean),
      phases: phases.filter(p => p.scope).map(p => ({
        name: p.name,
        scope: p.scope,
        duration: p.duration ? `${p.duration} ${p.durationUnit}` : "",
        price: p.price ? parseFloat(p.price) : undefined,
      })),
      included: included.filter(Boolean),
      excluded: excluded.filter(Boolean),
      credibility,
      supportDays: parseInt(supportDays),
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!automationTitle.trim() || !summary.trim() || !price.trim() || !timeline.trim()) {
      toast.error("Please fill in all required fields (title, summary, price, timeline).");
      return;
    }
    if (outcomes.filter(o => o.what && o.value).length === 0) {
      toast.error("Add at least one measurable outcome.");
      return;
    }
    if (phases.filter(p => p.scope).length < 2) {
      toast.error("Add at least 2 implementation phases — no project can be paid in full upfront.");
      return;
    }
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("proposedApproach", buildProposalJson());
    (formAction as unknown as (fd: FormData) => void)(fd);
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-primary/5">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Submit a Proposal
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isDiscovery
            ? "Recommend one automation. Be concrete — reference their exact pain points."
            : "Propose your approach. Scope, price, and delivery times must be specific."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <input type="hidden" name="jobId" value={jobId} />
        <input type="hidden" name="estimatedTime" value={timeline ? `${timeline} ${timelineUnit}` : ""} />
        <input type="hidden" name="priceEstimate" value={price ? `€${price}` : ""} />
        <input type="hidden" name="message" value={summary} />

        {/* 1 — The Pitch */}
        <Section
          icon={<Zap className="h-4 w-4" />}
          title="The Pitch"
          subtitle="Your automation recommendation and executive summary"
        >
          <Field label="Automation title" required hint="One clear line. What are you recommending?">
            <input
              className={input}
              placeholder="e.g. Automated customer onboarding pipeline"
              value={automationTitle}
              onChange={e => setAutomationTitle(e.target.value)}
            />
          </Field>

          <Field label="Executive summary" required hint="2–4 sentences. Why does this buyer need exactly this automation, right now?">
            <textarea
              className={`${input} resize-none`}
              rows={4}
              maxLength={1500}
              placeholder="Based on their pain points around manual onboarding and 60 sign-ups/month, I recommend building a fully automated pipeline that handles the entire new-customer journey: CRM entry, welcome email, Slack invite, and kickoff scheduling, with zero manual intervention."
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </Field>

          <Field label="Problem you're addressing" hint="Reference the specific pain point from their brief. Quote or paraphrase their exact words if it helps.">
            <textarea
              className={`${input} resize-none`}
              rows={4}
              maxLength={2000}
              placeholder='e.g. "45 minutes per customer onboarding, 60 customers/month." This automation eliminates that entirely, and at scale, the savings compound quickly.'
              value={problemAddressed}
              onChange={e => setProblemAddressed(e.target.value)}
            />
          </Field>
        </Section>

        {/* 2 — The Solution */}
        <Section
          icon={<Target className="h-4 w-4" />}
          title="The Solution"
          subtitle="What you'll build and what it achieves"
        >
          <Field label="What you'll build" required hint="Describe the automation in plain language — as if explaining to someone non-technical. No jargon, just what happens step by step.">
            <textarea
              className={`${input} resize-none`}
              rows={6}
              maxLength={3000}
              placeholder="When a new customer pays via Stripe, a Make.com automation starts automatically. It saves their details to HubSpot, sends them a personalised welcome email, invites them to your Slack workspace, and books a kickoff call with their account manager in Calendly. The entire process takes under 2 minutes with no manual steps. If anything goes wrong, your ops team receives an alert in Slack so nothing is missed."
              value={whatYoullBuild}
              onChange={e => setWhatYoullBuild(e.target.value)}
            />
          </Field>

          {/* Measurable outcomes */}
          <Field label="Measurable outcomes" required hint="Be specific. Quantify the impact your automation will deliver.">
            <div className="space-y-3">
              {outcomes.map((o, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-secondary/5 relative group">
                  <button type="button" onClick={() => setOutcomes(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <input
                    className={input}
                    placeholder={OUTCOME_PLACEHOLDERS[i % OUTCOME_PLACEHOLDERS.length]}
                    value={o.what}
                    onChange={e => setOutcomes(prev => prev.map((x, j) => j === i ? { ...x, what: e.target.value } : x))}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className={input}
                      placeholder="By how much (e.g. 12)"
                      value={o.value}
                      onChange={e => setOutcomes(prev => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                    />
                    <input
                      className={input}
                      placeholder="Within (e.g. 30)"
                      type="number"
                      min="1"
                      value={o.timeframe}
                      onChange={e => setOutcomes(prev => prev.map((x, j) => j === i ? { ...x, timeframe: e.target.value } : x))}
                    />
                    <select
                      className={input}
                      value={o.timeframeUnit}
                      onChange={e => setOutcomes(prev => prev.map((x, j) => j === i ? { ...x, timeframeUnit: e.target.value } : x))}
                    >
                      {TIMEFRAME_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button type="button"
                onClick={() => setOutcomes(prev => [...prev, { what: "", value: "", timeframe: "", timeframeUnit: "days" }])}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add outcome
              </button>
            </div>
          </Field>

          {/* Tools */}
          <Field label="Tools & stack you'll use" required hint="Every tool the buyer needs to know about.">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 flex-wrap">
                {tools.map((t, i) => (
                  <div key={i} className="flex gap-1">
                    <input
                      className={input}
                      placeholder="e.g. Make.com"
                      value={t}
                      onChange={e => setTools(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                    />
                    <button type="button" onClick={() => setTools(prev => prev.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive transition-colors px-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setTools(prev => [...prev, ""])}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add tool
              </button>
            </div>
          </Field>
        </Section>

        {/* 3 — Implementation Plan */}
        <Section
          icon={<LayoutList className="h-4 w-4" />}
          title="Implementation Plan"
          subtitle="Phases, scope, and what's included vs excluded"
        >
          {/* Phases — become payment milestones */}
          <Field
            label="Phases / milestones"
            required
            hint="Each phase becomes a payment milestone — the client pays per phase when it's delivered. Be specific about what they get in each phase."
          >
            <div className="space-y-3">
              {phases.map((p, i) => (
                <div key={i} className="border border-border rounded-xl p-4 space-y-3 bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <input
                      className={`${input} font-medium flex-1`}
                      placeholder={`Phase ${i + 1} name`}
                      value={p.name}
                      onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    />
                    {/* Only allow removal when more than 2 phases — minimum is 2 */}
                    {phases.length > 2 && (
                      <button type="button" onClick={() => removePhase(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    className={`${input} resize-none`}
                    rows={3}
                    maxLength={1000}
                    placeholder="What exactly gets built and delivered in this phase. Be specific — this is what the client approves before releasing payment."
                    value={p.scope}
                    onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, scope: e.target.value } : x))}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phase price (€)</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">€</span>
                        <input
                          className={`${input} pl-7`}
                          placeholder="e.g. 900"
                          type="number"
                          min="0"
                          value={p.price ?? ""}
                          onChange={e => handlePhasePriceChange(i, e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className={input}
                          placeholder="e.g. 2"
                          type="number"
                          min="1"
                          value={p.duration}
                          onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))}
                        />
                        <select
                          className={input}
                          value={p.durationUnit}
                          onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, durationUnit: e.target.value } : x))}
                        >
                          {DURATION_UNITS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPhase}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add phase
              </button>
            </div>
          </Field>

          {/* Included */}
          <Field label="What's included" hint="List all deliverables: automations, documentation, training, etc.">
            <div className="space-y-2">
              {included.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className={input} placeholder="e.g. Full Make.com scenario build" value={item}
                    onChange={e => setIncluded(prev => prev.map((x, j) => j === i ? e.target.value : x))} />
                  <button type="button" onClick={() => setIncluded(prev => prev.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-destructive transition-colors px-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setIncluded(prev => [...prev, ""])}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add deliverable
              </button>
            </div>
          </Field>

          {/* Excluded */}
          <Field label="What's NOT included" hint="Set expectations. Prevents scope creep and disputes.">
            <div className="space-y-2">
              {excluded.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className={input} placeholder="e.g. Ongoing maintenance after handover" value={item}
                    onChange={e => setExcluded(prev => prev.map((x, j) => j === i ? e.target.value : x))} />
                  <button type="button" onClick={() => setExcluded(prev => prev.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-destructive transition-colors px-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setExcluded(prev => [...prev, ""])}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add exclusion
              </button>
            </div>
          </Field>
        </Section>

        {/* 4 — The Deal */}
        <Section
          icon={<EuroIcon className="h-4 w-4" />}
          title="The Deal"
          subtitle="Price, timeline, and why you"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Total price (€) <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">Set total to auto-split across phases, or set each phase price to auto-calculate here.</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Total delivery time <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">How long until the entire project is delivered.</p>
            </div>
            <div className="relative -mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
              <input
                className={`${input} pl-6`}
                placeholder="1800"
                type="number"
                min="0"
                value={price}
                onChange={e => handleTotalPriceChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 gap-2 -mt-2">
              <input
                className={`${input} col-span-2`}
                placeholder="e.g. 3"
                type="number"
                min="1"
                value={timeline}
                onChange={e => setTimeline(e.target.value)}
              />
              <select
                className={`${input} col-span-3`}
                value={timelineUnit}
                onChange={e => setTimelineUnit(e.target.value)}
              >
                {DURATION_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <Field label="Post-delivery support" required hint="How long you will provide support after the project is delivered and approved.">
            <select
              className={input}
              value={supportDays}
              onChange={e => setSupportDays(e.target.value)}
            >
              {SUPPORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Why you" hint="Relevant experience, similar builds, results you achieved. The more specific, the more trust you build.">
            <textarea
              className={`${input} resize-none`}
              rows={5}
              maxLength={2000}
              placeholder="I have built 12 customer onboarding automations for B2B SaaS companies at this scale, including 3 on Make.com with HubSpot. One client went from 45 min/customer to 0 manual steps, handling 200+ sign-ups/month. Another saved 38 hours/month in their first week. I always work inside your existing tools so your team can maintain everything after handover, with no lock-in."
              value={credibility}
              onChange={e => setCredibility(e.target.value)}
            />
          </Field>
        </Section>

        {state?.error && (
          <p className="text-sm text-destructive text-center border border-destructive/20 rounded-lg p-3 bg-destructive/5">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 min-h-[48px] bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {pending ? "Submitting…" : "Submit Proposal"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          The buyer will see your full proposal including all sections above.
        </p>
      </form>
    </div>
  );
}
