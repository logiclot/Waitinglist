import dynamic from "next/dynamic";

const AuthBrandingPanel = dynamic(
  () => import("@/components/auth/AuthBrandingPanel").then((m) => m.AuthBrandingPanel),
  { ssr: false },
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hide navbar + footer on auth pages and prevent scrolling */}
      <style>{`nav { display: none !important; } footer { display: none !important; } body { overflow: hidden; }`}</style>

      <div className="h-dvh flex flex-row">
        {/* Left — form content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-background overflow-y-auto px-4 py-8">
          {children}
        </div>

        {/* Right — branding panel with soft gradient left edge */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, hsl(40 14% 98%) 0%, #111827 5%)",
            }}
          />
          <AuthBrandingPanel />
        </div>
      </div>
    </>
  );
}
