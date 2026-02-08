import { User, Shield, Bell } from "lucide-react";

export default function ExpertSettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Nav */}
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm flex items-center gap-2">
            <User className="h-4 w-4" /> Profile & Bio
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" /> Account & Security
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors font-medium text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Public Profile</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Display Name</label>
                  <input className="w-full bg-background border border-border rounded-md px-3 py-2" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <input className="w-full bg-background border border-border rounded-md px-3 py-2" placeholder="Automation Architect" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <textarea className="w-full bg-background border border-border rounded-md px-3 py-2 h-24" placeholder="Tell businesses about your expertise..." />
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
