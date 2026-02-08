export default function BusinessHelpPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Help & Onboarding</h1>
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Support Resources</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><a href="#" className="text-primary hover:underline">Platform Documentation</a></li>
            <li><a href="#" className="text-primary hover:underline">How to write a great request</a></li>
            <li><a href="#" className="text-primary hover:underline">Escrow and Payments FAQ</a></li>
            <li><a href="#" className="text-primary hover:underline">Contact Support</a></li>
        </ul>
      </div>
    </div>
  );
}
