import { EmptyState } from "@/components/EmptyState";
import { CreditCard, Wallet } from "lucide-react";

export default function BusinessBillingPage() {
  // Mock check for payment method
  // In real app: const paymentMethods = await prisma.paymentMethod.findMany({ where: { userId: session.user.id } });
  const hasPaymentMethod = false; // Toggle this to test states (or leave false as per instructions for placeholder)

  if (!hasPaymentMethod) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" /> Billing
        </h1>
        
        <EmptyState
          title="No payment method"
          description="Add a payment method to purchase solutions and post requests."
          primaryCtaLabel="Add Payment Method"
          primaryCtaHref="/business/settings" // Redirects to settings where presumably they can add one
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <CreditCard className="h-8 w-8 text-primary" /> Billing
      </h1>
      
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
           <Wallet className="h-5 w-5 text-muted-foreground" /> Payment Methods
        </h2>
        <div className="p-4 border border-border rounded-lg flex justify-between items-center bg-secondary/20">
            <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-foreground rounded flex items-center justify-center text-[10px] text-background font-bold">VISA</div>
                <span className="font-medium">•••• 4242</span>
            </div>
            <span className="text-sm text-muted-foreground">Default</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Transaction History</h2>
        <EmptyState
          title="No payments yet"
          description="No payments have been made through the platform yet."
          primaryCtaLabel="Browse Solutions"
          primaryCtaHref="/solutions" 
        />
      </div>
    </div>
  );
}
