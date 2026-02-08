import Link from "next/link";
import { User, Shield, Bell, CreditCard } from "lucide-react";

export default function BusinessSettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Nav */}
        <div className="space-y-1">
          <Link href="/business/company" className="w-full text-left px-3 py-2 rounded-md bg-secondary/50 text-foreground font-medium text-sm flex items-center gap-2 hover:bg-secondary transition-colors">
            <User className="h-4 w-4" /> Company Profile
          </Link>
          <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <Link href="/business/billing" className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Billing
          </Link>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
           <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account credentials and preferences.</p>
                {/* Placeholder content */}
                <div className="mt-4 pt-4 border-t border-border">
                    <button className="text-sm text-red-500 font-medium">Delete Account</button>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}
