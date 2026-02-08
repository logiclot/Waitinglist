"use client";

import { useFormState } from "react-dom";
import { createSpecialistProfile } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ChevronRight, 
  User,
  Check,
  Building2,
  Globe
} from "lucide-react";

const initialState = {
  error: null as string | null,
  success: false as boolean,
};

// --- Constants ---

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "India", "Brazil", "Netherlands", "Spain", "Other"
];

const TIMEZONES = Intl.supportedValuesOf('timeZone');

const TEAM_SIZES = ["1–5", "6–20", "21–50", "50+"];

const YEARS_EXPERIENCE = ["0–1", "1–3", "3–5", "5+"];
const IMPLEMENTATION_COUNTS = ["1–5", "6–20", "21–50", "50+"];
const PROJECT_SIZES = ["<$500", "$500–$2k", "$2k–$5k", "$5k+"];

const ACQUISITION_SOURCES = [
  "Referrals", "Freelance platforms", "Agency", "Direct outreach", "Other"
];

const PRIMARY_TOOLS = ["n8n", "Make", "Zapier", "Custom code", "Other"];

const SECONDARY_TOOLS = [
  "HubSpot", "Salesforce", "Shopify", "Stripe", "Google Sheets", 
  "Notion", "Slack", "AWS", "Azure", "Other"
];

const CAPACITIES = ["<5h", "5–10h", "10–20h", "20h+"];

export default function ExpertOnboardingPage() {
  const router = useRouter();
  // @ts-expect-error: types mismatch
  const [state, formAction] = useFormState(createSpecialistProfile, initialState);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(1);

  // --- Form State ---

  // Step 1: Identity
  const [legalFullName, setLegalFullName] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [roleType, setRoleType] = useState("Individual");
  
  const [agencyName, setAgencyName] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [agencyTeamSize, setAgencyTeamSize] = useState("");

  // Step 2: Experience
  const [yearsExperience, setYearsExperience] = useState("");
  const [approxImplementations, setApproxImplementations] = useState("");
  const [typicalProjectSize, setTypicalProjectSize] = useState("");
  const [acquisitionSources, setAcquisitionSources] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Step 3: Tools & Capacity
  const [primaryTool, setPrimaryTool] = useState("");
  const [customPrimaryTool, setCustomPrimaryTool] = useState("");
  const [secondaryTools, setSecondaryTools] = useState<string[]>([]);
  const [customSecondaryTool, setCustomSecondaryTool] = useState("");
  const [weeklyCapacity, setWeeklyCapacity] = useState("");

  // Step 4: Legal
  const [legalAgreed, setLegalAgreed] = useState(false);
  const [authorityConsent, setAuthorityConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);

  // --- Effects ---

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  // Auto-detect timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // --- Helpers ---

  const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // --- Validation ---

  const validateStep1 = () => {
    const basic = !!legalFullName && !!country && !!timezone;
    if (roleType === "Agency") {
      return basic && !!agencyName && !!businessId && !!agencyTeamSize;
    }
    return basic;
  };

  const validateStep2 = () => !!yearsExperience && !!approxImplementations && !!typicalProjectSize;

  const validateStep3 = () => !!primaryTool && (primaryTool !== "Other" || !!customPrimaryTool) && !!weeklyCapacity;

  const validateStep4 = () => legalAgreed && authorityConsent;

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-background flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Progress Bubbles */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((s) => {
              const isActive = s === step;
              const isCompleted = s < step;
              return (
                <div key={s} className="flex items-center">
                  <div 
                    className={`
                      w-3 h-3 rounded-full transition-all duration-300 
                      ${isActive ? 'bg-primary scale-125 ring-2 ring-primary/30' : ''}
                      ${isCompleted ? 'bg-primary' : ''}
                      ${!isActive && !isCompleted ? 'bg-secondary' : ''}
                    `}
                  />
                  {s < 4 && (
                    <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-primary' : 'bg-secondary'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Step {step} of 4
          </p>
        </div>

        <form action={(formData) => {
          // Append Arrays & Customs
          acquisitionSources.forEach(s => formData.append("clientAcquisitionSource", s));
          if (customSource) formData.append("clientAcquisitionSource", customSource);

          secondaryTools.forEach(t => formData.append("secondaryTools", t));
          if (customSecondaryTool) formData.append("secondaryTools", customSecondaryTool);

          // Map Fields
          formData.append("legalFullName", legalFullName);
          formData.append("country", country);
          formData.append("timezone", timezone);
          formData.append("roleType", roleType);
          
          if (roleType === "Agency") {
            formData.append("agencyName", agencyName);
            formData.append("businessIdentificationNumber", businessId);
            formData.append("agencyTeamSize", agencyTeamSize);
          }

          formData.append("yearsExperience", yearsExperience);
          formData.append("approxImplementations", approxImplementations);
          formData.append("typicalProjectSize", typicalProjectSize);
          formData.append("portfolioUrl", portfolioUrl);

          formData.append("primaryTool", primaryTool === "Other" ? customPrimaryTool : primaryTool);
          formData.append("availability", weeklyCapacity);

          if (legalAgreed) formData.append("legalAgreed", "on");
          if (authorityConsent) formData.append("authorityConsent", "on");
          if (marketingConsent) formData.append("marketingConsent", "on");

          setPending(true);
          // @ts-expect-error: formAction type mismatch
          formAction(formData);
        }} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Identity</h1>
                <p className="text-muted-foreground text-lg">This helps us understand who is building solutions on LogicLot. You can update this later.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-sm">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Legal Name <span className="text-primary">*</span></label>
                  <input 
                    value={legalFullName} 
                    onChange={e => setLegalFullName(e.target.value)} 
                    required 
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Legal Name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Country <span className="text-primary">*</span></label>
                    <select 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    >
                      <option value="">Select...</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone <span className="text-primary">*</span></label>
                    <select 
                      value={timezone} 
                      onChange={e => setTimezone(e.target.value)} 
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    >
                      <option value="">Select...</option>
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Role Type <span className="text-primary">*</span></label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Individual", "Agency"].map(type => (
                      <div 
                        key={type}
                        onClick={() => setRoleType(type)}
                        className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${roleType === type ? "bg-primary/5 border-primary text-primary ring-1 ring-primary/20" : "hover:bg-secondary"}`}
                      >
                        {type === "Individual" ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                        <span className="font-medium text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {roleType === "Agency" && (
                  <div className="space-y-6 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Legal Entity Name <span className="text-primary">*</span></label>
                      <input 
                        value={agencyName} 
                        onChange={e => setAgencyName(e.target.value)} 
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Agency Ltd."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Identification Number <span className="text-primary">*</span></label>
                      <input 
                        value={businessId} 
                        onChange={e => setBusinessId(e.target.value)} 
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Tax ID / EIN / VAT"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Team Size</label>
                      <select 
                        value={agencyTeamSize} 
                        onChange={e => setAgencyTeamSize(e.target.value)} 
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      >
                        <option value="">Select...</option>
                        {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE SNAPSHOT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Experience Snapshot</h1>
                <p className="text-muted-foreground text-lg">No tests. No tricks. Just context so we can route the right opportunities.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
                
                {/* Years Experience */}
                <div>
                  <label className="block text-sm font-medium mb-3">Years of hands-on automation experience <span className="text-primary">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {YEARS_EXPERIENCE.map(y => (
                      <label 
                        key={y}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all min-w-[80px]
                          ${yearsExperience === y ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}
                        `}
                      >
                        <input type="radio" name="years" value={y} checked={yearsExperience === y} onChange={() => setYearsExperience(y)} className="sr-only" />
                        <span className="text-sm font-medium">{y}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Implementations */}
                <div>
                  <label className="block text-sm font-medium mb-3">Approx. number of real implementations delivered <span className="text-primary">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {IMPLEMENTATION_COUNTS.map(c => (
                      <label 
                        key={c}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all min-w-[80px]
                          ${approxImplementations === c ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}
                        `}
                      >
                        <input type="radio" name="impls" value={c} checked={approxImplementations === c} onChange={() => setApproxImplementations(c)} className="sr-only" />
                        <span className="text-sm font-medium">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Project Size */}
                <div>
                  <label className="block text-sm font-medium mb-3">Typical project size you’ve handled <span className="text-primary">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {PROJECT_SIZES.map(s => (
                      <label 
                        key={s}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all min-w-[80px]
                          ${typicalProjectSize === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}
                        `}
                      >
                        <input type="radio" name="size" value={s} checked={typicalProjectSize === s} onChange={() => setTypicalProjectSize(s)} className="sr-only" />
                        <span className="text-sm font-medium">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Acquisition */}
                <div>
                  <label className="block text-sm font-medium mb-3">How do clients usually find you today? <span className="text-muted-foreground font-normal">(Multi-select)</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ACQUISITION_SOURCES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSelection(acquisitionSources, setAcquisitionSources, s)}
                        className={`
                          text-left px-4 py-3 rounded-lg border text-sm transition-all
                          ${acquisitionSources.includes(s) ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/20' : 'bg-background border-border hover:bg-secondary/50'}
                        `}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {acquisitionSources.includes("Other") && (
                    <div className="mt-3">
                      <input 
                        value={customSource}
                        onChange={e => setCustomSource(e.target.value)}
                        placeholder="Tell us more..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Portfolio / LinkedIn / GitHub URL <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      value={portfolioUrl} 
                      onChange={e => setPortfolioUrl(e.target.value)} 
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: TOOLS & CAPACITY */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tools & Capacity</h1>
                <p className="text-muted-foreground text-lg">This is used to match you with the right buyers — not to limit you.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
                
                {/* Primary Tool */}
                <div>
                  <label className="block text-sm font-medium mb-3">Primary Automation Tool <span className="text-primary">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {PRIMARY_TOOLS.map(t => (
                      <label 
                        key={t}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all
                          ${primaryTool === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}
                        `}
                      >
                        <input type="radio" name="primary" value={t} checked={primaryTool === t} onChange={() => setPrimaryTool(t)} className="sr-only" />
                        <span className="text-sm font-medium">{t}</span>
                      </label>
                    ))}
                  </div>
                  {primaryTool === "Other" && (
                    <div className="mt-3">
                      <input 
                        value={customPrimaryTool}
                        onChange={e => setCustomPrimaryTool(e.target.value)}
                        placeholder="Which tool?"
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Secondary Tools */}
                <div>
                  <label className="block text-sm font-medium mb-3">Secondary tools you actively work with</label>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_TOOLS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleSelection(secondaryTools, setSecondaryTools, t)}
                        className={`
                          px-3 py-1.5 rounded-md border text-sm transition-all
                          ${secondaryTools.includes(t) ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-background border-border text-foreground hover:border-foreground/30'}
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                   {secondaryTools.includes("Other") && (
                    <div className="mt-3">
                      <input 
                        value={customSecondaryTool}
                        onChange={e => setCustomSecondaryTool(e.target.value)}
                        placeholder="Other tools..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium mb-3">Current weekly capacity <span className="text-primary">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CAPACITIES.map(c => (
                      <label 
                        key={c}
                        className={`
                          flex items-center justify-center px-4 py-3 rounded-lg border cursor-pointer transition-all
                          ${weeklyCapacity === c ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/20' : 'hover:bg-secondary/50 border-border'}
                        `}
                      >
                        <input type="radio" name="capacity" value={c} checked={weeklyCapacity === c} onChange={() => setWeeklyCapacity(c)} className="sr-only" />
                        <span className="text-sm font-medium">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: LEGAL */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Legal & Platform Authority</h1>
                <p className="text-muted-foreground text-lg">Final step. Confirm your commitment to the platform.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-sm max-w-xl mx-auto">
                
                <div className="space-y-4">
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${legalAgreed ? 'bg-primary/5 border-primary' : 'hover:bg-secondary/50 border-border'}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${legalAgreed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                      {legalAgreed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <input type="checkbox" checked={legalAgreed} onChange={() => setLegalAgreed(!legalAgreed)} className="sr-only" />
                    <span className="text-sm leading-relaxed">I agree to the <strong>LogicLot Terms</strong>, <strong>Mutual NDA</strong>, and <strong>non-circumvention rules</strong>.</span>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${authorityConsent ? 'bg-primary/5 border-primary' : 'hover:bg-secondary/50 border-border'}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${authorityConsent ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                      {authorityConsent && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <input type="checkbox" checked={authorityConsent} onChange={() => setAuthorityConsent(!authorityConsent)} className="sr-only" />
                    <span className="text-sm leading-relaxed">
                      I authorize LogicLot to:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-muted-foreground text-xs">
                        <li>collect performance data</li>
                        <li>enforce platform workflows</li>
                        <li>manage escrow-style payments</li>
                        <li>apply ranking or visibility changes based on behavior</li>
                      </ul>
                    </span>
                  </label>
                </div>

                <div className="pt-6 border-t border-border">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">Receive platform updates & high-intent opportunities</span>
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${marketingConsent ? 'bg-primary' : 'bg-secondary'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${marketingConsent ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" checked={marketingConsent} onChange={() => setMarketingConsent(!marketingConsent)} className="sr-only" />
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between pt-8 max-w-2xl mx-auto w-full">
            <button 
              type="button" 
              onClick={handleBack} 
              className={`px-6 py-3 text-muted-foreground hover:text-foreground font-medium transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              Back
            </button>
            
            {step < 4 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={pending || !validateStep4()} 
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                {pending ? "Creating Profile..." : "Go to Dashboard"} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
