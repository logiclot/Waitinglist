"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  Search,
  AlertCircle,
  LinkIcon,
  Trash2,
  FileText,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  adminPostJobOnBehalf,
  adminGeneratePaymentLink,
  adminCreateBusinessAccount,
  adminDeleteJob,
} from "@/actions/admin";

interface Business {
  userId: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  stripeCustomerId: string | null;
  user: { id: string; email: string };
}

interface RecentJob {
  id: string;
  title: string;
  category: string;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  buyer: {
    email: string;
    businessProfile: {
      firstName: string;
      lastName: string;
      companyName: string | null;
    } | null;
  };
}

interface Props {
  businesses: Business[];
  recentJobs: RecentJob[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Pending Payment", color: "text-amber-600 bg-amber-50 border-amber-200" },
  open: { label: "Open", color: "text-green-700 bg-green-50 border-green-200" },
  awarded: { label: "Awarded", color: "text-blue-700 bg-blue-50 border-blue-200" },
  closed: { label: "Closed", color: "text-muted-foreground bg-secondary border-border" },
  cancelled: { label: "Cancelled", color: "text-destructive bg-destructive/5 border-destructive/20" },
};

const COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
  "United Kingdom", "United States", "Canada", "Australia", "Switzerland",
  "Norway", "Other",
];

export function PostOnBehalfClient({ businesses: initialBusinesses, recentJobs }: Props) {
  const router = useRouter();

  // Local businesses list (can grow when accounts are created)
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);

  // Form state
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [jobType, setJobType] = useState<"discovery" | "custom">("discovery");
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [tools, setTools] = useState("");

  // Submit state
  const [loading, setLoading] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Table link generation state
  const [tableLinkJobId, setTableLinkJobId] = useState<string | null>(null);
  const [tableLinkUrl, setTableLinkUrl] = useState<string | null>(null);
  const [tableLinkLoading, setTableLinkLoading] = useState<string | null>(null);
  const [tableLinkSimulated, setTableLinkSimulated] = useState(false);
  const [tableCopied, setTableCopied] = useState(false);

  // Delete state
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Create Account state
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const jobs = recentJobs;

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || !newFirstName.trim() || !newLastName.trim() || !newCompanyName.trim() || !newCountry) {
      toast.error("All fields are required.");
      return;
    }

    setCreatingAccount(true);
    try {
      const result = await adminCreateBusinessAccount({
        email: newEmail.trim(),
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        companyName: newCompanyName.trim(),
        country: newCountry,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      // Add new business to local list and auto-select
      const newBusiness: Business = {
        userId: result.userId!,
        firstName: result.firstName!,
        lastName: result.lastName!,
        companyName: result.companyName!,
        stripeCustomerId: null,
        user: { id: result.userId!, email: result.email! },
      };

      setBusinesses((prev) => [newBusiness, ...prev]);
      setSelectedBusinessId(result.userId!);
      setAccountCreated(true);
      toast.success("Account created! The business will receive a welcome email.");

      // Reset form after a moment
      setTimeout(() => {
        setNewEmail("");
        setNewFirstName("");
        setNewLastName("");
        setNewCompanyName("");
        setNewCountry("");
      }, 500);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setCreatingAccount(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBusinessId) { toast.error("Select a business account first."); return; }
    if (!title.trim()) { toast.error("Job title is required."); return; }
    if (!goal.trim()) { toast.error("Problem description is required."); return; }

    setLoading(true);
    try {
      const toolList = tools.split(",").map((t) => t.trim()).filter(Boolean);
      const result = await adminPostJobOnBehalf({
        businessUserId: selectedBusinessId,
        jobType,
        title: title.trim(),
        goal: goal.trim(),
        tools: toolList,
      });

      if ("error" in result) { toast.error(result.error); return; }

      const jobId = result.jobId;
      setCreatedJobId(jobId);

      // Automatically generate payment link
      const linkResult = await adminGeneratePaymentLink(jobId);
      if ("error" in linkResult) {
        toast.error(`Job created but failed to generate link: ${linkResult.error}`);
        // Still redirect to questionnaire
        router.push(`/admin/post-on-behalf/fill/${jobId}`);
        return;
      }

      setPaymentUrl(linkResult.paymentUrl ?? null);
      setIsSimulated(linkResult.isSimulated ?? false);
      toast.success("Job created — redirecting to questionnaire...");

      // Redirect to the questionnaire fill page
      setTimeout(() => {
        router.push(`/admin/post-on-behalf/fill/${jobId}`);
      }, 500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(url: string, type: "form" | "table") {
    await navigator.clipboard.writeText(url);
    if (type === "form") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      setTableCopied(true);
      setTimeout(() => setTableCopied(false), 2500);
    }
    toast.success("Payment link copied!");
  }

  async function handleTableGenerateLink(jobId: string) {
    setTableLinkLoading(jobId);
    try {
      const result = await adminGeneratePaymentLink(jobId);
      if ("error" in result) { toast.error(result.error); return; }
      setTableLinkJobId(jobId);
      setTableLinkUrl(result.paymentUrl ?? null);
      setTableLinkSimulated(result.isSimulated ?? false);
    } catch {
      toast.error("Failed to generate payment link.");
    } finally {
      setTableLinkLoading(null);
    }
  }

  async function handleDeleteJob(jobId: string) {
    if (!confirm("Delete this job? This action cannot be undone.")) return;

    setDeletingJobId(jobId);
    try {
      const result = await adminDeleteJob(jobId);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Job deleted.");
      // Refresh page to reflect changes
      router.refresh();
    } catch {
      toast.error("Failed to delete job.");
    } finally {
      setDeletingJobId(null);
    }
  }

  function handleReset() {
    setTitle("");
    setGoal("");
    setTools("");
    setCreatedJobId(null);
    setPaymentUrl(null);
    setIsSimulated(false);
    setCopied(false);
  }

  return (
    <div className="space-y-8">
      {/* ── Create New Account ──────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => { setShowCreateAccount(!showCreateAccount); setAccountCreated(false); }}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              Don&apos;t see the business? Create a new account
            </span>
          </div>
          {showCreateAccount ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showCreateAccount && (
          <div className="px-6 pb-6 border-t border-border pt-4">
            {accountCreated && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Account created and auto-selected below.</p>
                    <p className="text-xs text-green-600 mt-1">
                      The business will receive a welcome email. They can set their password via &ldquo;Forgot Password&rdquo;.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="business@company.com"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1">
                  Country <span className="text-destructive">*</span>
                </label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="">— Select country —</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {creatingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {creatingAccount ? "Creating account…" : "Create Business Account"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Post Job Form ──────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business selector */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Business Account <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              disabled={!!createdJobId}
            >
              <option value="">— Select a business —</option>
              {businesses.map((b) => (
                <option key={b.userId} value={b.userId}>
                  {b.companyName
                    ? `${b.companyName} (${b.firstName} ${b.lastName}) — ${b.user.email}`
                    : `${b.firstName} ${b.lastName} — ${b.user.email}`}
                </option>
              ))}
            </select>
            {businesses.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No business accounts found. Create one above.
              </p>
            )}
          </div>

          {/* Job type toggle */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Job Type <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["discovery", "custom"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => !createdJobId && setJobType(type)}
                  disabled={!!createdJobId}
                  className={`p-4 rounded-lg border text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    jobType === type
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {type === "discovery" ? (
                      <Search className="w-4 h-4 text-primary" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-sm font-bold text-foreground">
                      {type === "discovery" ? "Discovery Scan" : "Custom Project"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {type === "discovery"
                      ? "€50 posting fee — up to 5 expert proposals"
                      : "€100 posting fee — up to 3 Elite expert proposals"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Job Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Automate our lead nurturing workflow in HubSpot"
              disabled={!!createdJobId}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Goal / description */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Problem / Goal Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={5}
              placeholder="Describe the business problem, current process, and desired outcome..."
              disabled={!!createdJobId}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none disabled:opacity-60"
            />
          </div>

          {/* Tools (optional) */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              Tools Currently Used
              <span className="text-muted-foreground font-normal ml-1">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="HubSpot, Slack, Google Sheets…"
              disabled={!!createdJobId}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Submit */}
          {!createdJobId && (
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Creating job & generating link…" : "Create Job Post"}
            </button>
          )}
        </form>

        {/* ── Post-creation: payment link result ─────────────────────────── */}
        {createdJobId && paymentUrl && (
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">Job created — redirecting to questionnaire...</span>
            </div>

            {isSimulated && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  Stripe is not configured. This is a development placeholder link.
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-foreground mb-2">Payment Link — copy and send to the business:</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={paymentUrl}
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground truncate"
                />
                <button
                  onClick={() => handleCopy(paymentUrl, "form")}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-sm font-bold text-foreground"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* View job + create another */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`/admin/post-on-behalf/fill/${createdJobId}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Fill Questionnaire
              </a>
              <span className="text-border">·</span>
              <a
                href={`/jobs/${createdJobId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View job post
              </a>
              <span className="text-border">·</span>
              <button onClick={handleReset} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                + Post another
              </button>
            </div>
          </div>
        )}

        {/* Fallback if job created but link generation failed */}
        {createdJobId && !paymentUrl && !loading && (
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold">
                Job created (ID: <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">{createdJobId}</code>) but link generation failed.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/admin/post-on-behalf/fill/${createdJobId}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Fill Questionnaire
              </a>
              <span className="text-border">·</span>
              <button onClick={handleReset} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                + Post another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Table-level payment link display ────────────────────────────── */}
      {tableLinkJobId && tableLinkUrl && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-green-800">Payment link generated — copy and send to the business:</p>
          {tableLinkSimulated && (
            <p className="text-[10px] text-amber-600">⚠ Dev placeholder — Stripe not configured.</p>
          )}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={tableLinkUrl}
              className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-xs font-mono text-foreground truncate"
            />
            <button
              onClick={() => handleCopy(tableLinkUrl, "table")}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors text-sm font-bold text-foreground"
            >
              {tableCopied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {tableCopied ? "Copied!" : "Copy"}
            </button>
            <a
              href={tableLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <button
            onClick={() => { setTableLinkJobId(null); setTableLinkUrl(null); }}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Recent admin-posted jobs ──────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4">
          Recent Jobs ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Business</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Job</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => {
                    const statusInfo = STATUS_LABELS[job.status] ?? { label: job.status, color: "text-muted-foreground bg-secondary border-border" };
                    const bp = job.buyer.businessProfile;
                    const businessName = bp?.companyName || (bp ? `${bp.firstName} ${bp.lastName}` : job.buyer.email);

                    return (
                      <tr key={job.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground text-xs">{businessName}</p>
                          <p className="text-muted-foreground text-xs">{job.buyer.email}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <a
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline line-clamp-2"
                          >
                            {job.title}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{job.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {job.paidAt && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Paid {new Date(job.paidAt).toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* Fill Questionnaire link (pending_payment only) */}
                            {job.status === "pending_payment" && (
                              <a
                                href={`/admin/post-on-behalf/fill/${job.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                                title="Fill Questionnaire"
                              >
                                <FileText className="w-3 h-3" />
                                Fill
                              </a>
                            )}

                            {/* Get Link (pending_payment only) */}
                            {job.status === "pending_payment" && (
                              <button
                                onClick={() => handleTableGenerateLink(job.id)}
                                disabled={tableLinkLoading === job.id}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-bold hover:bg-secondary transition-colors disabled:opacity-60"
                                title="Generate payment link"
                              >
                                {tableLinkLoading === job.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <LinkIcon className="w-3 h-3" />
                                )}
                                {tableLinkLoading === job.id ? "…" : "Link"}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={deletingJobId === job.id}
                              className="inline-flex items-center gap-1 p-1.5 rounded-md border border-destructive/20 bg-destructive/5 text-destructive text-xs hover:bg-destructive/10 transition-colors disabled:opacity-60"
                              title="Delete job"
                            >
                              {deletingJobId === job.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
