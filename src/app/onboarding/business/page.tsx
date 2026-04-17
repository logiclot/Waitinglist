"use client";

import { createBusinessProfile } from "@/actions/onboarding";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  Check
} from "lucide-react";
import { toast } from "sonner";

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

const POPULAR_TOOLS = [
  "HubSpot", "Salesforce", "Pipedrive",
  "Slack", "Google Workspace", "Microsoft 365",
  "Notion", "Airtable", "ClickUp", "Asana",
  "Shopify", "WooCommerce",
  "Stripe", "QuickBooks", "Xero",
  "Mailchimp", "Klaviyo", "ActiveCampaign",
  "Zendesk", "Intercom",
  "Zapier", "Make",
];

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

const JOB_TITLES = [
  "Founder / CEO",
  "Co-Founder / CTO",
  "Operations Manager",
  "Marketing Manager",
  "Sales Manager",
  "Finance / Accounting",
  "IT / Technical Lead",
  "Product Manager",
  "Consultant",
  "Other",
];

const HOW_HEARD_OPTIONS = [
  "Social Media",
  "Newsletter",
  "Google",
  "Microsoft",
  "Referral",
  "Other",
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada",
  "Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)",
  "Congo (Kinshasa)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti",
  "Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea",
  "Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany",
  "Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras",
  "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia",
  "Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
  "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
  "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
  "North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
  "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
  "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

export default function BusinessOnboardingPage() {
  const { update: refreshSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(1);

  // --- Form State ---

  // Step 1: Workspace
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [customHowHeard, setCustomHowHeard] = useState("");

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

  const resolvedHowHeard = () => {
    const custom = customHowHeard.trim();
    if (howHeard === "Other" && custom) return `Other: ${custom}`;
    return howHeard;
  };

  // --- Validation ---

  const getMissingFieldsForStep = (currentStep: number) => {
    if (currentStep !== 1) return [];

    const missingFields = [];
    if (!fullName.trim()) missingFields.push("Full Name");
    if (!companyName.trim()) missingFields.push("Company Name");
    if (!country) missingFields.push("Country");
    if (!howHeard) missingFields.push("How did you hear about us?");
    return missingFields;
  };

  const showMissingFieldsToast = (missingFields: string[]) => {
    toast.error("Please complete the required fields.", {
      description: missingFields.join(", "),
    });
  };

  const validateStep1 = () => getMissingFieldsForStep(1).length === 0;
  const validateStep2 = () => true;
  const validateStep3 = () => true; // Optional as per instructions ("This must feel optional")

  const handleNext = () => {
    const missingFields = getMissingFieldsForStep(step);
    if (missingFields.length > 0) {
      showMissingFieldsToast(missingFields);
      return;
    }

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

        <form onSubmit={async (e) => {
          e.preventDefault();

          const missingFields = getMissingFieldsForStep(1);
          if (missingFields.length > 0) {
            setStep(1);
            showMissingFieldsToast(missingFields);
            return;
          }

          setPending(true);
          setError(null);

          try {
            const formData = new FormData();

            // Append arrays
            selectedTools.forEach(t => formData.append("tools", t));
            if (customTool) formData.append("tools", customTool);

            painPoints.forEach(p => formData.append("businessPrimaryProblems", p));
            if (customPainPoint) formData.append("businessPrimaryProblems", customPainPoint);

            // Map fields
            formData.append("companyName", companyName);
            formData.append("fullName", fullName);
            formData.append("jobTitle", jobTitle === "Other" ? customJobTitle : jobTitle);
            formData.append("website", website);
            formData.append("country", country);
            formData.append("howHeard", resolvedHowHeard());

            formData.append("industry", industry === "Other" ? customIndustry : industry);
            formData.append("companySize", teamSize);

            formData.append("intent", intent);

            const result = await createBusinessProfile(null, formData);

            if (result?.error) {
              setError(result.error);
              toast.error(result.error);
              setPending(false);
              return;
            }

            // Force JWT refresh so middleware sees updated role + onboardingCompletedAt
            await refreshSession();
            // Hard navigation ensures the browser sends the freshly-set cookie
            window.location.href = "/business";
          } catch {
            const message = "Something went wrong. Please try again.";
            setError(message);
            toast.error(message);
            setPending(false);
          }
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
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Title <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <select
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="">Select your role...</option>
                    {JOB_TITLES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {jobTitle === "Other" && (
                    <input
                      value={customJobTitle}
                      onChange={e => setCustomJobTitle(e.target.value)}
                      placeholder="Your job title..."
                      className="mt-2 w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name <span className="text-primary">*</span>
                  </label>
                  <input
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country <span className="text-primary">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="">Select your country...</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    How did you hear about us? <span className="text-primary">*</span>
                  </label>
                  <select
                    value={howHeard}
                    onChange={e => setHowHeard(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="">Select an option...</option>
                    {HOW_HEARD_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {howHeard === "Other" && (
                    <input
                      value={customHowHeard}
                      onChange={e => setCustomHowHeard(e.target.value)}
                      placeholder="Please specify (optional)"
                      className="mt-2 w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
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
                  <label className="block text-sm font-medium mb-3">Industry <span className="text-muted-foreground font-normal">(Optional)</span></label>
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
                  <label className="block text-sm font-medium mb-3">Team Size <span className="text-muted-foreground font-normal">(Optional)</span></label>
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
                  <h1 className="text-3xl font-bold tracking-tight">What tools does your team use?</h1>
                  <p className="text-muted-foreground text-lg">Select any that apply — experts will already know them.</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TOOLS.map(tool => {
                      const active = selectedTools.includes(tool);
                      return (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => toggleSelection(selectedTools, setSelectedTools, tool)}
                          className={`
                            px-4 py-2 rounded-full border text-sm font-medium transition-all
                            ${active
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background border-border text-foreground hover:border-foreground/40 hover:bg-secondary/50"}
                          `}
                        >
                          {active && <Check className="inline w-3 h-3 mr-1.5 -mt-0.5" />}
                          {tool}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <input
                      value={customTool}
                      onChange={e => setCustomTool(e.target.value)}
                      placeholder="Don't see yours? Type any other tools here..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
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
          {error && (
            <p className="text-sm text-red-500 text-right max-w-2xl mx-auto w-full -mb-4">
              {error}
            </p>
          )}
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
                disabled={pending} 
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
