export default function FreeAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide navbar + footer on the waitlist audit page — users should not access the main site before launch */}
      <style>{`nav { display: none !important; } footer { display: none !important; } header { display: none !important; }`}</style>
      {children}
    </>
  );
}
