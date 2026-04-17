"use client";

import { createSpecialistProfile } from "@/actions/onboarding";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  User,
  Check,
  Building2,
  ShieldCheck,
  FileText
} from "lucide-react";
import Link from "next/link";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";
import { COUNTRY_NAME_TO_ISO } from "@/lib/stripe-countries";


// --- Constants ---

const COUNTRIES = Object.keys(COUNTRY_NAME_TO_ISO).sort();

const YEARS_EXPERIENCE = ["0–1", "1–3", "3–5", "5+"];
const IMPLEMENTATION_COUNTS = ["1–5", "6–20", "21–50", "50+"];
const PROJECT_SIZES = ["<$500", "$500–$2k", "$2k–$5k", "$5k+"];

const ACQUISITION_SOURCES = [
  "Referrals", "Freelance platforms", "Agency", "Direct outreach", "Social Media", "Other"
];

const TOTAL_STEPS = 3;

export default function ExpertOnboardingPage() {
  const { update: refreshSession } = useSession();
  const [error, setError] = useState<string | null>(null);
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

  // Step 2: Experience
  const [yearsExperience, setYearsExperience] = useState("");
  const [approxImplementations, setApproxImplementations] = useState("");
  const [typicalProjectSize, setTypicalProjectSize] = useState("");
  const [acquisitionSources, setAcquisitionSources] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState("");

  // Step 3: Legal
  const [legalAgreed, setLegalAgreed] = useState(false);
  const [authorityConsent, setAuthorityConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);

  // --- Effects ---

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

  const validateStep1 = () => !!legalFullName && !!country;

  const validateStep2 = () => !!yearsExperience && !!approxImplementations && !!typicalProjectSize;

  const validateStep3 = () => legalAgreed && authorityConsent;


  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) { setAttempted(true); return; }
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) { setAttempted(true); return; }
      setStep(3);
    }
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
            {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((s) => {
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
                  {s < TOTAL_STEPS && (
                    <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-primary' : 'bg-secondary'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!validateStep3()) { setAttempted(true); return; }
          setPending(true);
          setError(null);

          try {
            const formData = new FormData();

            // Append Arrays & Customs
            acquisitionSources.forEach(s => formData.append("clientAcquisitionSource", s));
            if (customSource) formData.append("clientAcquisitionSource", customSource);

            // Map Fields
            formData.append("legalFullName", legalFullName);
            formData.append("displayName", displayName || legalFullName);
            formData.append("country", country);
            formData.append("roleType", roleType);

            formData.append("yearsExperience", yearsExperience);
            formData.append("approxImplementations", approxImplementations);
            formData.append("typicalProjectSize", typicalProjectSize);

            if (legalAgreed) formData.append("legalAgreed", "on");
            if (authorityConsent) formData.append("authorityConsent", "on");
            if (marketingConsent) formData.append("marketingConsent", "on");

            if (profileImageUrl) formData.append("profileImageUrl", profileImageUrl);

            const result = await createSpecialistProfile(null, formData);

            if (result?.error) {
              setError(result.error);
              setPending(false);
              return;
            }

            // Force JWT refresh so middleware sees updated role + onboardingCompletedAt
            await refreshSession();
            // Hard navigation ensures the browser sends the freshly-set cookie
            window.location.href = "/dashboard";
          } catch {
            setError("Something went wrong. Please try again.");
            setPending(false);
          }
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
                  <p className="text-xs text-muted-foreground mt-1.5">Used for contracts and payments only — not shown on your public profile.</p>
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
                  <label className="block text-sm font-medium mb-1">Years of hands-on automation experience <span className="text-primary">*</span></label>
                  <p className="text-xs text-muted-foreground mb-3">Used internally for matching — not displayed publicly.</p>
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
                  <label className="block text-sm font-medium mb-1">Approx. number of real implementations delivered <span className="text-primary">*</span></label>
                  <p className="text-xs text-muted-foreground mb-3">Helps us route the right opportunities — won&apos;t appear on your profile.</p>
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

              </div>
            </div>
          )}

          {/* STEP 3: LEGAL */}
          {step === 3 && (
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
          {error && (
            <p className="text-sm text-red-500 text-right max-w-2xl mx-auto w-full -mb-4">
              {error}
            </p>
          )}
          {attempted && (
            (step === 1 && !validateStep1()) ||
            (step === 2 && !validateStep2()) ||
            (step === 3 && !validateStep3())
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

            {step < TOTAL_STEPS ? (
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
                {pending ? "Creating Profile..." : "Go to Dashboard"} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>


        </form>
      </div>
    </div>
  );
}
