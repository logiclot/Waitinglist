"use client";

import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  ExternalLink,
  Loader2,
  CheckCircle,
  Calendar,
  Link as LinkIcon,
  FileText,
  Landmark,
  AlertTriangle,
} from "lucide-react";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";
import { ProfileSection } from "./ProfileSection";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getExpertSettings,
  updateExpertCalendar,
  updateExpertInvoice,
  updateExpertBankDetails,
  updateExpertCountry,
} from "@/actions/expert";
import { isStripeConnectSupported, COUNTRY_NAME_TO_ISO } from "@/lib/stripe-countries";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countryNames = Object.keys(COUNTRY_NAME_TO_ISO).sort();

export default function ExpertSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile State
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [invoiceCompanyName, setInvoiceCompanyName] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [invoiceVatNumber, setInvoiceVatNumber] = useState("");
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Bank details (manual payout for unsupported countries)
  const [expertCountry, setExpertCountry] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankSwiftBic, setBankSwiftBic] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCurrency, setBankCurrency] = useState("EUR");
  const [savingBank, setSavingBank] = useState(false);

  const { mutate: saveCountry, isPending: savingCountry } = useMutation({
    mutationFn: (country: string) => updateExpertCountry(country),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Country updated successfully");
      }
    },
    onError: () => {
      toast.error("Failed to update country");
    },
  });

  useEffect(() => {
    checkStripeStatus();
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    const res = await getExpertSettings();
    if (res.success && res.settings) {
      setProfileImageUrl(res.settings.profileImageUrl || null);
      setCalendarUrl(res.settings.calendarUrl || "");
      setDisplayName(res.settings.displayName || "");
      setTitle(res.settings.title || "");
      setBio(res.settings.bio || "");
      setInvoiceCompanyName(res.settings.invoiceCompanyName || "");
      setInvoiceAddress(res.settings.invoiceAddress || "");
      setInvoiceVatNumber(res.settings.invoiceVatNumber || "");
      setExpertCountry(res.settings.country || "");
      setBankAccountHolder(res.settings.bankAccountHolder || "");
      setBankIban(res.settings.bankIban || "");
      setBankSwiftBic(res.settings.bankSwiftBic || "");
      setBankName(res.settings.bankName || "");
      setBankCurrency(res.settings.bankCurrency || "EUR");
    }
    setLoadingProfile(false);
  };

  const checkStripeStatus = async () => {
    try {
      const res = await fetch("/api/stripe/status");
      if (res.ok) {
        const data = await res.json();
        setIsStripeConnected(data.isConnected);

        // If returning from Stripe flow
        if (searchParams.get("stripe") === "return" && data.isConnected) {
          setShowSuccess(true);
          // Clear param from URL without refresh
          router.replace("/expert/settings");
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { context: "stripe-status-check" },
      });
    }
  };

  const handleConnectStripe = async () => {
    setLoadingStripe(true);
    try {
      const res = await fetch("/api/stripe/onboard", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start Stripe onboarding");
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "stripe-onboard" } });
      alert("Error connecting to Stripe");
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleSaveCalendar = async () => {
    if (!calendarUrl.trim()) {
      toast.error("Please enter a calendar URL");
      return;
    }

    // Basic validation
    if (!calendarUrl.startsWith("http")) {
      toast.error(
        "Please enter a valid URL (starting with http:// or https://)",
      );
      return;
    }

    setSavingCalendar(true);
    const res = await updateExpertCalendar(calendarUrl);
    setSavingCalendar(false);

    if (res.success) {
      toast.success("Calendar link updated successfully");
    } else {
      toast.error(res.error || "Failed to update calendar link");
    }
  };

  const handleSaveInvoice = async () => {
    setSavingInvoice(true);
    const res = await updateExpertInvoice({
      invoiceCompanyName: invoiceCompanyName.trim() || undefined,
      invoiceAddress: invoiceAddress.trim() || undefined,
      invoiceVatNumber: invoiceVatNumber.trim() || undefined,
    });
    setSavingInvoice(false);
    if (res.success) toast.success("Invoice template updated");
    else toast.error(res.error || "Failed to update");
  };

  const handleSaveBank = async () => {
    if (!bankAccountHolder.trim() || !bankIban.trim() || !bankSwiftBic.trim()) {
      toast.error("Account holder, IBAN, and SWIFT/BIC are required");
      return;
    }
    setSavingBank(true);
    const res = await updateExpertBankDetails({
      bankAccountHolder: bankAccountHolder.trim(),
      bankIban: bankIban.trim(),
      bankSwiftBic: bankSwiftBic.trim(),
      bankName: bankName.trim(),
      bankCurrency: bankCurrency.trim() || "EUR",
    });
    setSavingBank(false);
    if (res.success) toast.success("Bank details saved successfully");
    else toast.error(res.error || "Failed to save bank details");
  };

  const isUnsupportedCountry =
    expertCountry && !isStripeConnectSupported(expertCountry);

  if (loadingProfile) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Nav */}
        <div className="space-y-1">
          <a
            href="#profile"
            className="w-full text-left px-3 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm flex items-center gap-2 hover:bg-primary/15 transition-colors"
          >
            <User className="h-4 w-4" /> Profile & Bio
          </a>
          <a
            href="#payouts"
            className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" /> Payouts
          </a>
          <a
            href="#calendar"
            className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" /> Calendar
          </a>
          <a
            href="#security"
            className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Shield className="h-4 w-4" /> Security
          </a>
          <Link
            href="/expert/notifications"
            className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Bell className="h-4 w-4" /> Notifications
          </Link>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Success Notification */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  Payouts Connected Successfully!
                </p>
                <p className="text-xs mt-1 text-green-700">
                  You are now ready to receive payments for your solutions.
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          )}

          {/* Profile Photo */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile Photo
            </h2>
            <ProfilePicUpload
              value={profileImageUrl}
              onChange={(url) => {
                setProfileImageUrl(url);
              }}
              name={displayName || "Profile"}
              persistOnChange
            />
          </div>

          {/* Country Section */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Country
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your country determines how you receive payouts.
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">
                  Country
                </label>
                <Select
                  value={expertCountry}
                  onValueChange={(value) => setExpertCountry(value)}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={() => saveCountry(expertCountry)}
                disabled={savingCountry || !expertCountry}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm disabled:opacity-70"
              >
                {savingCountry ? "Saving..." : "Save Country"}
              </button>
            </div>
          </div>

          {/* Payouts Section */}
          <div
            id="payouts"
            className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Payout Settings
            </h2>

            {isUnsupportedCountry ? (
              <>
                {/* Manual payout notice */}
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      Stripe Connect is not available in {expertCountry}
                    </p>
                    <p className="text-xs mt-1 text-amber-700">
                      Payouts for your milestones will be transferred manually
                      via bank wire or Wise. Please provide your bank details
                      below so we can process payments.
                    </p>
                  </div>
                </div>

                {/* Bank details form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Account Holder Name{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankAccountHolder}
                      onChange={(e) => setBankAccountHolder(e.target.value)}
                      placeholder="Full name as it appears on the account"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      IBAN <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankIban}
                      onChange={(e) => setBankIban(e.target.value)}
                      placeholder="UA213223130000026007233566001"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        SWIFT / BIC Code <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankSwiftBic}
                        onChange={(e) => setBankSwiftBic(e.target.value)}
                        placeholder="PABORJUX"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. PrivatBank"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Preferred Payout Currency
                    </label>
                    <input
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-70"
                      defaultValue={bankCurrency}
                      disabled
                    />
                  </div>
                  <button
                    onClick={handleSaveBank}
                    disabled={savingBank}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm disabled:opacity-70"
                  >
                    {savingBank ? "Saving..." : "Save Bank Details"}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                  <Landmark className="h-3 w-3" /> Your bank details are stored
                  securely and used only for manual payouts.
                </div>
              </>
            ) : (
              <>
                <div className="bg-secondary/20 p-4 rounded-lg border border-border mb-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {isStripeConnected
                      ? "Your Stripe account is connected. You can now receive automatic payouts to your bank account."
                      : "To receive payments from clients, you must connect a Stripe account. LogicLot uses Stripe Connect to ensure secure, compliant payouts to your bank account."}
                  </p>

                  {isStripeConnected ? (
                    <button
                      disabled
                      className="bg-green-100 text-green-700 border border-green-200 px-4 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 cursor-default"
                    >
                      <CheckCircle className="h-4 w-4" /> Stripe Connected
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      disabled={loadingStripe}
                      className="bg-[#635BFF] hover:bg-[#5851df] text-white px-4 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loadingStripe ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Connecting...
                        </>
                      ) : (
                        <>
                          Connect Stripe Payouts{" "}
                          <ExternalLink className="h-4 w-4 opacity-80" />
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" /> Payments are encrypted and
                  processed securely by Stripe.
                </div>
              </>
            )}
          </div>

          {/* Calendar Section */}
          <div
            id="calendar"
            className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Calendar & Booking
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Link your calendar (Calendly, Cal.com, etc.) so clients can book
                discovery calls directly from your messages.
              </p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Booking URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={calendarUrl}
                      onChange={(e) => setCalendarUrl(e.target.value)}
                      placeholder="https://calendly.com/your-name"
                      className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSaveCalendar}
                    disabled={savingCalendar}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm disabled:opacity-70"
                  >
                    {savingCalendar ? "Saving..." : "Save Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div
            id="security"
            className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Security
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Change your password or manage account security.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              Reset password
            </Link>
            <DeleteAccountButton />
          </div>

          {/* Invoice Template */}
          <div
            id="invoice"
            className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Invoice Template
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Buyers receive an invoice when they pay. Add your company details
              so invoices show your legal name, address, and VAT number.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Company / Trading Name
                </label>
                <input
                  type="text"
                  value={invoiceCompanyName}
                  onChange={(e) => setInvoiceCompanyName(e.target.value)}
                  placeholder="Your Company Ltd"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Address
                </label>
                <textarea
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  placeholder="123 Business St
City, Postal Code
Country"
                  rows={3}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  VAT Number (optional)
                </label>
                <input
                  type="text"
                  value={invoiceVatNumber}
                  onChange={(e) => setInvoiceVatNumber(e.target.value)}
                  placeholder="IE1234567X"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={handleSaveInvoice}
                disabled={savingInvoice}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm disabled:opacity-70"
              >
                {savingInvoice ? "Saving..." : "Save Invoice Template"}
              </button>
            </div>
          </div>

          {/* Public Profile */}
          <ProfileSection
            initialDisplayName={displayName}
            initialTitle={title}
            initialBio={bio}
          />
        </div>
      </div>
    </div>
  );
}
