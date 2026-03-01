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
  Globe,
  ShieldCheck,
  FileText
} from "lucide-react";
import Link from "next/link";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";

const initialState = {
  error: null as string | null,
  success: false as boolean,
};

// --- Constants ---

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
  const [attempted, setAttempted] = useState(false);

  // --- Form State ---

  // Step 1: Identity
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [legalFullName, setLegalFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
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


  useEffect(() => {
    window.scrollTo(0, 0);
    setAttempted(false);
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
    const basic = !!legalFullName && !!country;
    if (roleType === "Agency") {
      return basic && !!agencyName && !!businessId && !!agencyTeamSize;
    }
    return basic;
  };

  const validateStep2 = () => !!yearsExperience && !!approxImplementations && !!typicalProjectSize;

  const validateStep3 = () => !!primaryTool && (primaryTool !== "Other" || !!customPrimaryTool) && !!weeklyCapacity;

  const validateStep4 = () => legalAgreed && authorityConsent;


  const handleNext = () => {
    setAttempted(true);
    if (step === 1 && validateStep1()) { setAttempted(false); setStep(2); }
    else if (step === 2 && validateStep2()) { setAttempted(false); setStep(3); }
    else if (step === 3 && validateStep3()) { setAttempted(false); setStep(4); }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const fieldErr = (condition: boolean) =>
    attempted && condition
      ? "border-red-400 ring-1 ring-red-400/20 focus:border-red-400 focus:ring-red-400/20"
      : "border-border focus:border-primary focus:ring-primary/20";

  const FieldError = ({ show, msg = "This field is required" }: { show: boolean; msg?: string }) =>
    attempted && show ? <p className="text-xs text-red-500 mt-1.5">{msg}</p> : null;

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
          formData.append("displayName", displayName || legalFullName);
          formData.append("country", country);
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

          if (profileImageUrl) formData.append("profileImageUrl", profileImageUrl);

          if (!validateStep4()) return;
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
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium mb-3">
                    Profile photo <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <ProfilePicUpload
                    value={profileImageUrl}
                    onChange={setProfileImageUrl}
                    name={displayName || legalFullName || "Profile"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    value={legalFullName}
                    onChange={e => setLegalFullName(e.target.value)}
                    className={`w-full bg-background border rounded-lg px-4 py-3 focus:ring-2 transition-all outline-none ${fieldErr(!legalFullName)}`}
                    placeholder="Jane Doe"
                  />
                  <FieldError show={!legalFullName} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Display Name <span className="text-muted-foreground font-normal text-xs">(shown on your public profile)</span>
                  </label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder={legalFullName || "How clients will see your name"}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Leave blank to use your full name. Some experts prefer a first name or brand name.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country <span className="text-primary">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className={`w-full bg-background border rounded-lg px-4 py-3 focus:ring-2 transition-all outline-none ${fieldErr(!country)}`}
                  >
                    <option value="">Select your country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <FieldError show={!country} />
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
                        className={`w-full bg-background border rounded-lg px-4 py-3 focus:ring-2 transition-all outline-none ${fieldErr(!agencyName)}`}
                        placeholder="Agency Ltd."
                      />
                      <FieldError show={!agencyName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Identification Number <span className="text-primary">*</span></label>
                      <input
                        value={businessId}
                        onChange={e => setBusinessId(e.target.value)}
                        className={`w-full bg-background border rounded-lg px-4 py-3 focus:ring-2 transition-all outline-none ${fieldErr(!businessId)}`}
                        placeholder="Tax ID / EIN / VAT"
                      />
                      <FieldError show={!businessId} />
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
                  <div className={`flex flex-wrap gap-3 p-2 rounded-lg transition-all ${attempted && !yearsExperience ? 'bg-red-50 ring-1 ring-red-300' : ''}`}>
                    {YEARS_EXPERIENCE.map(y => (
                      <label key={y} className={`flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all min-w-[80px] ${yearsExperience === y ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}`}>
                        <input type="radio" name="years" value={y} checked={yearsExperience === y} onChange={() => setYearsExperience(y)} className="sr-only" />
                        <span className="text-sm font-medium">{y}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError show={!yearsExperience} msg="Please select an option" />
                </div>

                {/* Implementations */}
                <div>
                  <label className="block text-sm font-medium mb-3">Approx. number of real implementations delivered <span className="text-primary">*</span></label>
                  <div className={`flex flex-wrap gap-3 p-2 rounded-lg transition-all ${attempted && !approxImplementations ? 'bg-red-50 ring-1 ring-red-300' : ''}`}>
                    {IMPLEMENTATION_COUNTS.map(c => (
                      <label key={c} className={`flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all min-w-[80px] ${approxImplementations === c ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}`}>
                        <input type="radio" name="impls" value={c} checked={approxImplementations === c} onChange={() => setApproxImplementations(c)} className="sr-only" />
                        <span className="text-sm font-medium">{c}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError show={!approxImplementations} msg="Please select an option" />
                </div>

                {/* Project Size */}
                <div>
                  <label className="block text-sm font-medium mb-3">Typical project size you&apos;ve handled <span className="text-primary">*</span></label>
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
                  <div className={`flex flex-wrap gap-3 p-2 rounded-lg transition-all ${attempted && !primaryTool ? 'bg-red-50 ring-1 ring-red-300' : ''}`}>
                    {PRIMARY_TOOLS.map(t => (
                      <label key={t} className={`flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer transition-all ${primaryTool === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary border-border'}`}>
                        <input type="radio" name="primary" value={t} checked={primaryTool === t} onChange={() => setPrimaryTool(t)} className="sr-only" />
                        <span className="text-sm font-medium">{t}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError show={!primaryTool} msg="Please select your primary tool" />
                  {primaryTool === "Other" && (
                    <div className="mt-3">
                      <input
                        value={customPrimaryTool}
                        onChange={e => setCustomPrimaryTool(e.target.value)}
                        placeholder="Which tool?"
                        className={`w-full bg-background border rounded-lg px-4 py-2 text-sm focus:ring-2 transition-all outline-none ${fieldErr(primaryTool === "Other" && !customPrimaryTool)}`}
                      />
                      <FieldError show={primaryTool === "Other" && !customPrimaryTool} msg="Please specify the tool" />
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
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-2 rounded-lg transition-all ${attempted && !weeklyCapacity ? 'bg-red-50 ring-1 ring-red-300' : ''}`}>
                    {CAPACITIES.map(c => (
                      <label key={c} className={`flex items-center justify-center px-4 py-3 rounded-lg border cursor-pointer transition-all ${weeklyCapacity === c ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/20' : 'hover:bg-secondary/50 border-border'}`}>
                        <input type="radio" name="capacity" value={c} checked={weeklyCapacity === c} onChange={() => setWeeklyCapacity(c)} className="sr-only" />
                        <span className="text-sm font-medium">{c}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError show={!weeklyCapacity} msg="Please select your weekly availability" />
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

              <div className="bg-card border border-border rounded-xl p-8 space-y-5 shadow-sm max-w-xl mx-auto">

                {/* NDA notice */}
                <div className="bg-secondary/20 p-5 rounded-xl border border-border flex items-start gap-4">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0 mt-0.5 opacity-80" />
                  <div>
                    <h3 className="font-bold text-sm mb-1">
                    <Link href="/nda" target="_blank" className="hover:text-primary transition-colors underline underline-offset-2">
                      Mutual NDA
                    </Link>{" "}— automatic on sign-up
                  </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All business data, workflows, and expert proposals shared on LogicLot are automatically covered by a legally binding Mutual Non-Disclosure Agreement. Neither party may share the other&apos;s confidential information outside the platform.
                    </p>
                  </div>
                </div>

                {/* Document links */}
                <div className="flex items-center gap-3 py-3 border-y border-border">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Before accepting, please read our{" "}
                    <Link href="/terms" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">Terms &amp; Conditions</Link>
                    ,{" "}
                    <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">Privacy Policy</Link>
                    , and{" "}
                    <Link href="/nda" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">Mutual NDA</Link>
                    . All open in a new tab.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* T&C acceptance — required */}
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${legalAgreed ? 'bg-primary/5 border-primary' : attempted && !legalAgreed ? 'border-red-400 bg-red-50' : 'hover:bg-secondary/50 border-border'}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${legalAgreed ? 'bg-primary border-primary text-primary-foreground' : attempted && !legalAgreed ? 'border-red-400' : 'border-muted-foreground'}`}>
                      {legalAgreed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <input type="checkbox" checked={legalAgreed} onChange={() => setLegalAgreed(!legalAgreed)} className="sr-only" />
                    <span className="text-sm leading-relaxed">
                      I have read and agree to the{" "}
                      <Link href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-primary underline underline-offset-2 font-medium">Terms &amp; Conditions</Link>
                      ,{" "}
                      <Link href="/privacy" target="_blank" onClick={e => e.stopPropagation()} className="text-primary underline underline-offset-2 font-medium">Privacy Policy</Link>
                      , and{" "}
                      <Link href="/nda" target="_blank" onClick={e => e.stopPropagation()} className="text-primary underline underline-offset-2 font-medium">Mutual NDA</Link>
                      . <span className="text-primary font-semibold">*</span>
                    </span>
                  </label>
                  {attempted && !legalAgreed && (
                    <p className="text-xs text-red-500 pl-1">You must accept the Terms &amp; Conditions to continue.</p>
                  )}

                  {/* Platform authority — required */}
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${authorityConsent ? 'bg-primary/5 border-primary' : attempted && !authorityConsent ? 'border-red-400 bg-red-50' : 'hover:bg-secondary/50 border-border'}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${authorityConsent ? 'bg-primary border-primary text-primary-foreground' : attempted && !authorityConsent ? 'border-red-400' : 'border-muted-foreground'}`}>
                      {authorityConsent && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <input type="checkbox" checked={authorityConsent} onChange={() => setAuthorityConsent(!authorityConsent)} className="sr-only" />
                    <span className="text-sm leading-relaxed">
                      I authorise LogicLot to collect performance data, enforce platform workflows, manage escrow payments, and apply visibility changes based on my activity. <span className="text-primary font-semibold">*</span>
                    </span>
                  </label>
                  {attempted && !authorityConsent && (
                    <p className="text-xs text-red-500 pl-1">This authorisation is required to use the platform.</p>
                  )}
                </div>

                {/* Marketing opt-in — optional */}
                <div className="pt-4 border-t border-border">
                  <label className="flex items-center justify-between cursor-pointer group gap-4">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Send me platform updates, new client opportunities, and product news
                      <span className="block text-xs text-muted-foreground/60 mt-0.5">Optional — you can unsubscribe at any time</span>
                    </span>
                    <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${marketingConsent ? 'bg-primary' : 'bg-secondary border border-border'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${marketingConsent ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" checked={marketingConsent} onChange={() => setMarketingConsent(!marketingConsent)} className="sr-only" />
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* NAVIGATION */}
          {attempted && (
            (step === 1 && !validateStep1()) ||
            (step === 2 && !validateStep2()) ||
            (step === 3 && !validateStep3()) ||
            (step === 4 && !validateStep4())
          ) && (
            <p className="text-sm text-red-500 text-right max-w-2xl mx-auto w-full -mb-4">
              Please complete all required fields before continuing.
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
                onClick={() => setAttempted(true)}
                disabled={pending}
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
