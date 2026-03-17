export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide navbar + footer on the public audit page */}
      <style>{`nav { display: none !important; } footer { display: none !important; }`}</style>
      {children}
    </>
  );
}
