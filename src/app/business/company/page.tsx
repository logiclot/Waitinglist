import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Save } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";

export default async function CompanyProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { profileImageUrl: true } } }
  });

  if (!profile) {
    // Should not happen if onboarding is enforced, but safe fallback
    return <div>Profile not found. Please contact support.</div>;
  }

  async function updateProfile(formData: FormData) {
    "use server";
    
    if (!session?.user?.id) return; // Should handle error better in real app

    const companyName = formData.get("companyName") as string;
    const website = formData.get("website") as string;
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;
    const billingEmail = formData.get("billingEmail") as string;
    const timezone = formData.get("timezone") as string;
    const whatToAutomate = formData.get("whatToAutomate") as string;
    const invoiceAddress = formData.get("invoiceAddress") as string;
    const invoiceVatNumber = formData.get("invoiceVatNumber") as string;
    const invoiceRegistrationNumber = formData.get("invoiceRegistrationNumber") as string;
    const tools = formData.getAll("tools") as string[];

    await prisma.businessProfile.update({
      where: { userId: session.user.id },
      data: {
        companyName,
        website,
        industry,
        companySize,
        billingEmail,
        timezone,
        whatToAutomate,
        tools,
        invoiceAddress: invoiceAddress || null,
        invoiceVatNumber: invoiceVatNumber || null,
        invoiceRegistrationNumber: invoiceRegistrationNumber || null,
      }
    });
    
    redirect("/business/company"); // Refresh page
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Avatar
          src={profile.user?.profileImageUrl}
          name={`${profile.firstName} ${profile.lastName}`}
          size="lg"
        />
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company details and operating context.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Profile Photo</h2>
        <ProfilePicUpload
          value={profile.user?.profileImageUrl ?? null}
          onChange={() => {}}
          name={`${profile.firstName} ${profile.lastName}`}
          persistOnChange
        />
      </div>

      <form action={updateProfile} className="space-y-8">
        
        {/* 1. Company Basics */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b border-border">1. Company Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
              <input 
                name="companyName" 
                defaultValue={profile.companyName} 
                required 
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Website (Optional)</label>
              <input 
                name="website" 
                defaultValue={profile.website || ""} 
                placeholder="https://example.com"
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <select 
                name="industry" 
                defaultValue={profile.industry || ""} 
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              >
                <option value="">Select Industry</option>
                <option value="SaaS">SaaS</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Agency">Agency</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Size</label>
              <select 
                name="companySize" 
                defaultValue={profile.companySize || ""} 
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. Operating Context */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b border-border">2. Operating Context (Optional)</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Tools you use</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["HubSpot", "Slack", "Google Workspace", "Shopify", "Xero", "Salesforce", "Notion", "Airtable"].map(tool => (
                  <label key={tool} className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input 
                      type="checkbox" 
                      name="tools" 
                      value={tool} 
                      defaultChecked={profile.tools?.includes(tool)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{tool}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Primary Goal</label>
              <input 
                name="whatToAutomate" 
                defaultValue={profile.whatToAutomate || ""} 
                placeholder="e.g. Reduce manual admin work"
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* 3. Contact / Admin */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b border-border">3. Contact / Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Billing Email (Optional)</label>
              <input
                type="email"
                name="billingEmail"
                defaultValue={profile.billingEmail || ""}
                placeholder="billing@company.com"
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timezone (Optional)</label>
              <select
                name="timezone"
                defaultValue={profile.timezone || ""}
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              >
                <option value="">Select Timezone</option>
                <option value="UTC">UTC</option>
                <option value="EST">EST (UTC-5)</option>
                <option value="PST">PST (UTC-8)</option>
                <option value="CET">CET (UTC+1)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. Invoice Details */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-2 pb-2 border-b border-border">4. Invoice Details</h2>
          <p className="text-xs text-muted-foreground mb-6">These details appear on invoices for your orders.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Billing Address (Optional)</label>
              <textarea
                name="invoiceAddress"
                defaultValue={profile.invoiceAddress || ""}
                placeholder={"123 Main Street\nDublin 2\nIreland"}
                rows={3}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VAT Number (Optional)</label>
              <input
                name="invoiceVatNumber"
                defaultValue={profile.invoiceVatNumber || ""}
                placeholder="IE1234567T"
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Required for EU reverse charge treatment on cross-border invoices.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Registration No. (Optional)</label>
              <input
                name="invoiceRegistrationNumber"
                defaultValue={(profile as Record<string, unknown>).invoiceRegistrationNumber as string || ""}
                placeholder="e.g. 123456"
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
