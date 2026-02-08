"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }

    // Listen for custom event to open settings
    const handleOpenSettings = () => setIsOpen(true);
    window.addEventListener("open-cookie-settings", handleOpenSettings);

    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
    };
  }, []);

  const savePreferences = (newPrefs?: typeof preferences) => {
    const prefsToSave = newPrefs || preferences;
    localStorage.setItem("cookie-consent", JSON.stringify({
      necessary: true,
      ...prefsToSave,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setIsOpen(false);
  };

  const acceptAll = () => {
    savePreferences({ analytics: true, marketing: true });
  };

  const rejectNonEssential = () => {
    savePreferences({ analytics: false, marketing: false });
  };

  if (!showBanner && !isOpen) return null;

  return (
    <>
      {/* Banner */}
      {showBanner && !isOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50 shadow-lg">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <h3 className="font-bold text-foreground mb-1">Cookies & Privacy</h3>
              <p>We use cookies to improve your experience and to understand site usage. You can accept all, reject non-essential, or manage your preferences.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setIsOpen(true)} className="text-sm underline hover:text-primary">
                Manage preferences
              </button>
              <button onClick={rejectNonEssential} className="px-4 py-2 rounded-md border border-border bg-background hover:bg-secondary/50 text-sm font-medium transition-colors">
                Reject non-essential
              </button>
              <button onClick={acceptAll} className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">Cookie preferences</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Choose which cookies you allow. Necessary cookies are required for the site to function.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="font-medium">Necessary (always on)</span>
                <input type="checkbox" checked disabled className="accent-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Analytics</span>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics} 
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="accent-primary" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Marketing</span>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing} 
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="accent-primary" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-md border border-border hover:bg-secondary/50 text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => savePreferences()}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsLink() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
      className="hover:text-foreground transition-colors text-left"
    >
      Cookie settings
    </button>
  );
}
