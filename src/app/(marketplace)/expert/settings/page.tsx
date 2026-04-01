"use client";

import Link from "next/link";
import { User, Shield, Bell, CreditCard, ExternalLink, Loader2, CheckCircle, Calendar, Link as LinkIcon, FileText } from "lucide-react";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getExpertSettings, updateExpertCalendar, updateExpertInvoice } from "@/actions/expert";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

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
      setTitle("");
      setBio(res.settings.bio || "");
      setInvoiceCompanyName(res.settings.invoiceCompanyName || "");
      setInvoiceAddress(res.settings.invoiceAddress || "");
      setInvoiceVatNumber(res.settings.invoiceVatNumber || "");
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
      Sentry.captureException(error, { tags: { context: "stripe-status-check" } });
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
      toast.error("Please enter a valid URL (starting with http:// or https://)");
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
          <a href="#profile" className="w-full text-left px-3 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm flex items-center gap-2 hover:bg-primary/15 transition-colors">
            <User className="h-4 w-4" /> Profile & Bio
          </a>
          <a href="#payouts" className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Payouts
          </a>
          <a href="#calendar" className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Calendar
          </a>
          <a href="#security" className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </a>
          <Link href="/expert/notifications" className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
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
                <p className="font-bold text-sm">Payouts Connected Successfully!</p>
                <p className="text-xs mt-1 text-green-700">You are now ready to receive payments for your solutions.</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="ml-auto text-green-600 hover:text-green-800">×</button>
            </div>
          )}

          {/* Profile Photo */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile Photo
            </h2>
            <ProfilePicUpload
              value={profileImageUrl}
              onChange={(url) => { setProfileImageUrl(url); }}
              name={displayName || "Profile"}
              persistOnChange
            />
          </div>

          {/* Payouts Section */}
          <div id="payouts" className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Payout Settings
            </h2>
            <div className="bg-secondary/20 p-4 rounded-lg border border-border mb-4">
              <p className="text-sm text-muted-foreground mb-4">
                {isStripeConnected 
                  ? "Your Stripe account is connected. You can now receive automatic payouts to your bank account."
                  : "To receive payments from clients, you must connect a Stripe account. LogicLot uses Stripe Connect to ensure secure, compliant payouts to your bank account."
                }
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
                    </>
                  ) : (
                    <>
                      Connect Stripe Payouts <ExternalLink className="h-4 w-4 opacity-80" />
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" /> Payments are encrypted and processed securely by Stripe.
            </div>
          </div>

          {/* Calendar Section */}
          <div id="calendar" className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Calendar & Booking
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Link your calendar (Calendly, Cal.com, etc.) so clients can book discovery calls directly from your messages.
              </p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Booking URL</label>
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
          <div id="security" className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6">
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
          <div id="invoice" className="scroll-mt-8 bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Invoice Template
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Buyers receive an invoice when they pay. Add your company details so invoices show your legal name, address, and VAT number.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company / Trading Name</label>
                <input
                  type="text"
                  value={invoiceCompanyName}
                  onChange={(e) => setInvoiceCompanyName(e.target.value)}
                  placeholder="Your Company Ltd"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Address</label>
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
                <label className="text-sm font-medium mb-1.5 block">VAT Number (optional)</label>
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
          <div className="scroll-mt-8 bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Public Profile</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Display Name</label>
                  <input 
                    className="w-full bg-background border border-border rounded-md px-3 py-2" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <input 
                    className="w-full bg-background border border-border rounded-md px-3 py-2" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Automation Architect" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <textarea 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 h-24" 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell businesses about your expertise..." 
                />
              </div>
              
              <div className="pt-4 border-t border-border">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
