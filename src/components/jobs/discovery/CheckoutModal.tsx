import { Lightbulb, Check, X } from "lucide-react";

interface CheckoutModalProps {
  onClose: () => void;
  onSubmit: () => void;
  pending: boolean;
}

export function CheckoutModal({ onClose, onSubmit, pending }: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-8 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Start Discovery Scan</h2>
          <p className="text-muted-foreground">
            Your business profile will be shared with Elite experts who will identify opportunities and propose solutions.
          </p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 mb-6 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-foreground">Discovery Scan Fee</span>
            <span className="font-bold text-xl text-foreground">€50.00 one-time</span>
          </div>
          <div className="text-xs text-emerald-600 flex items-center gap-1.5">
            <Check className="w-3 h-3" /> 100% Credited to future build
          </div>
        </div>

        <div className="space-y-3 mb-6 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Get 3-5 high-quality architectural proposals</span>
          </div>
          <div className="flex gap-3">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Experts identify your best automation opportunities</span>
          </div>
          <div className="flex gap-3">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Full refund if no viable solution found</span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={pending}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          {pending ? "Processing..." : "Pay & Start Scan"}
        </button>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Secure payment via Stripe. One-time fee.
        </p>
      </div>
    </div>
  );
}
