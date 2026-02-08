"use client";

import { useFormState } from "react-dom";
import { createBusinessProfile } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { 
  ChevronRight, 
  ChevronLeft,
  Check,
  Search
} from "lucide-react";

const initialState = {
  error: null as string | null,
  success: false as boolean,
};

// --- Constants ---

const INDUSTRIES = [
  "SaaS",
  "E-commerce",
  "Professional Services",
  "Marketing / Agency",
  "Finance / Accounting",
  "Operations / Logistics",
  "Healthcare",
  "Real Estate",
  "Other"
];

const TEAM_SIZES = [
  "Solo",
  "1–5",
  "6–20",
  "21–50",
  "50+"
];

const TOOL_CATEGORIES = {
  "Sales & CRM": ["HubSpot", "Salesforce", "Pipedrive", "Zoho CRM", "Freshsales"],
  "Finance & Accounting": ["QuickBooks", "Xero", "Stripe", "Sage", "Wave"],
  "Marketing": ["Mailchimp", "Klaviyo", "HubSpot Marketing", "ActiveCampaign", "Meta Ads"],
  "Support": ["Zendesk", "Intercom", "Freshdesk", "Help Scout", "Gorgias"],
  "Productivity & Ops": ["Google Workspace", "Notion", "Airtable", "ClickUp", "Asana"],
  "E-commerce": ["Shopify", "WooCommerce", "Magento", "BigCommerce", "Wix"],
  "Cloud / Hosting": ["AWS", "Azure", "Google Cloud", "Vercel", "Netlify"]
};

const PAIN_POINTS = [
  "Manual data entry or repetitive work",
  "Leads not being followed up properly",
  "Customer support taking too much time",
  "Invoicing, payments, or reporting issues",
  "Internal processes breaking as we grow",
  "Too many tools that don’t talk to each other",
  "I’m not sure — I just know things are inefficient",
  "Other"
];

const INTENT_OPTIONS = [
  "Just explore ready-made solutions",
  "Compare options for a known problem",
  "Get help defining the right solution",
  "Replace a manual or inefficient process"
];

// Helper to get all timezones
const TIMEZONES = Intl.supportedValuesOf('timeZone');

export default function BusinessOnboardingPage() {
  const router = useRouter();
  // @ts-expect-error: types mismatch
  const [state, formAction] = useFormState(createBusinessProfile, initialState);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(1);

  // --- Form State ---
  
  // Step 1: Workspace
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2: Context
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Step 3: Tools & Friction
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [customPainPoint, setCustomPainPoint] = useState("");

  // Step 4: Intent
  const [intent, setIntent] = useState("");

  // --- Effects ---

  useEffect(() => {
    if (state?.success) {
      router.push("/business"); // Direct to dashboard
    }
  }, [state, router]);

  // Auto-detect timezone/country
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
      // Rough country guess from timezone could be added here, but leaving blank for accuracy
    } catch (e) {
      // ignore
    }
  }, []);

  // Scroll to top on step change
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

  const validateStep1 = () => !!companyName && !!fullName && !!country && !!timezone;
  const validateStep2 = () => !!industry && (industry !== "Other" || !!customIndustry) && !!teamSize;
  const validateStep3 = () => true; // Optional as per instructions ("This must feel optional")
  const validateStep4 = () => !!intent;

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // --- Render ---

  return (
    <div className="min-h-screen py-12 px-4 bg-background flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* GLOBAL UI: Step Indicator */}
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
          // Append arrays
          selectedTools.forEach(t => formData.append("tools", t));
          if (customTool) formData.append("tools", customTool);
          
          painPoints.forEach(p => formData.append("businessPrimaryProblems", p));
          if (customPainPoint) formData.append("businessPrimaryProblems", customPainPoint);

          // Map fields
          formData.append("companyName", companyName);
          formData.append("fullName", fullName);
          formData.append("website", website);
          formData.append("country", country);
          formData.append("timezone", timezone);
          
          formData.append("industry", industry === "Other" ? customIndustry : industry);
          formData.append("companySize", teamSize);
          
          formData.append("intent", intent);
          
          setPending(true); 
          // @ts-expect-error: formAction type mismatch
          formAction(formData); 
        }} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* STEP 1: WORKSPACE SETUP */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Let&apos;s set up your workspace</h1>
                <p className="text-muted-foreground text-lg">This takes about a minute. No technical details required.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-sm">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name <span className="text-primary">*</span></label>
                  <input 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    required 
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Full Name <span className="text-primary">*</span></label>
                  <input 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required 
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Jane Doe"
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
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="India">India</option>
                      <option value="Other">Other</option>
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
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="https://acme.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS CONTEXT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tell us a bit about your business</h1>
                <p className="text-muted-foreground text-lg">This helps us show solutions that fit your reality.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
                <div>
                  <label className="block text-sm font-medium mb-3">Industry <span className="text-primary">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INDUSTRIES.map(ind => (
                      <label 
                        key={ind} 
                        className={`
                          flex items-center p-3 rounded-lg border cursor-pointer transition-all
                          ${industry === ind ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'hover:bg-secondary/50 border-border'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name="industry" 
                          value={ind}
                          checked={industry === ind}
                          onChange={() => setIndustry(ind)}
                          className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-3 text-sm font-medium">{ind}</span>
                      </label>
                    ))}
                  </div>
                  {industry === "Other" && (
                    <div className="mt-3">
                      <input 
                        value={customIndustry}
                        onChange={e => setCustomIndustry(e.target.value)}
                        placeholder="Please specify..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Team Size <span className="text-primary">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {TEAM_SIZES.map(s => (
                      <label 
                        key={s} 
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all min-w-[80px]
                          ${teamSize === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name="teamSize" 
                          value={s}
                          checked={teamSize === s}
                          onChange={() => setTeamSize(s)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TOOLS & FRICTION */}
          {step === 3 && (
            <div className="space-y-12">
              
              {/* Part 1: Tools */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Tools you already use</h1>
                  <p className="text-muted-foreground text-lg">We&apos;ll prioritize solutions that fit your setup.</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
                  {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => (
                    <div key={category}>
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {tools.map(tool => (
                          <button
                            key={tool}
                            type="button"
                            onClick={() => toggleSelection(selectedTools, setSelectedTools, tool)}
                            className={`
                              px-3 py-1.5 rounded-md border text-sm transition-all
                              ${selectedTools.includes(tool) 
                                ? 'bg-primary/10 border-primary text-primary font-medium' 
                                : 'bg-background border-border text-foreground hover:border-foreground/30'}
                            `}
                          >
                            {tool}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Other</h3>
                    <input 
                      value={customTool}
                      onChange={e => setCustomTool(e.target.value)}
                      placeholder="Type other tools..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Don&apos;t worry — this is just to help us avoid recommending tools you don&apos;t use.
                  </p>
                </div>
              </div>

              {/* Part 2: Friction (Step 3.5) */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">What&apos;s slowing you down the most right now?</h2>
                  <p className="text-muted-foreground">This helps us surface the most relevant solutions first.</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                  <div className="grid grid-cols-1 gap-3">
                    {PAIN_POINTS.map(pain => (
                      <label 
                        key={pain} 
                        className={`
                          flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                          ${painPoints.includes(pain) ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'hover:bg-secondary/50 border-border'}
                        `}
                      >
                        <input 
                          type="checkbox" 
                          checked={painPoints.includes(pain)} 
                          onChange={() => toggleSelection(painPoints, setPainPoints, pain)}
                          className="mt-1 w-4 h-4 text-primary border-gray-300 focus:ring-primary rounded"
                        />
                        <span className="text-sm font-medium leading-relaxed">{pain}</span>
                      </label>
                    ))}
                  </div>
                  {painPoints.includes("Other") && (
                    <div className="mt-4 pl-8">
                       <input 
                        value={customPainPoint}
                        onChange={e => setCustomPainPoint(e.target.value)}
                        placeholder="Tell us more..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: INTENT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">What would you like to do next?</h1>
                <p className="text-muted-foreground text-lg">You can change this anytime.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 space-y-4 shadow-sm max-w-xl mx-auto">
                {INTENT_OPTIONS.map(opt => (
                  <label 
                    key={opt} 
                    className={`
                      flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all
                      ${intent === opt ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'hover:bg-secondary/50 border-border'}
                    `}
                  >
                    <span className="font-medium text-lg">{opt}</span>
                    <div className={`
                      w-5 h-5 rounded-full border flex items-center justify-center
                      ${intent === opt ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}
                    `}>
                      {intent === opt && <Check className="w-3 h-3" />}
                    </div>
                    <input 
                      type="radio" 
                      name="intent" 
                      value={opt}
                      checked={intent === opt}
                      onChange={() => setIntent(opt)}
                      className="sr-only"
                    />
                  </label>
                ))}
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
                {pending ? "Setting up..." : "Go to Dashboard"} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
