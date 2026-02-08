import Link from "next/link";
import { orders } from "@/data/mock";
import { Clock, CheckCircle, Package, AlertCircle, LucideIcon } from "lucide-react";
import { OrderStatus } from "@/types";

export const metadata = {
  title: "My Orders | AI Marketplace",
  description: "View and manage your AI automation orders.",
};

const statusMap: Record<OrderStatus, { label: string; color: string; icon: LucideIcon }> = {
  draft: { label: "Draft", color: "text-muted-foreground", icon: Clock },
  paid_pending_implementation: { label: "Paid & Pending", color: "text-blue-400", icon: Clock },
  in_progress: { label: "In Progress", color: "text-yellow-500", icon: Package },
  delivered: { label: "Delivered", color: "text-purple-400", icon: CheckCircle },
  approved: { label: "Completed", color: "text-green-500", icon: CheckCircle },
  refunded: { label: "Refunded", color: "text-red-400", icon: AlertCircle },
  disputed: { label: "Disputed", color: "text-red-500", icon: AlertCircle },
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border border-border">
          <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/solutions"
            className="inline-block px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium"
          >
            Browse Solutions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
             const status = statusMap[order.status] || statusMap.draft;
             const Icon = status.icon;
             
             return (
               <Link
                 key={order.id}
                 href={`/orders/${order.id}`}
                 className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-md"
               >
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.color.replace('text-', 'bg-').replace('400', '400/10').replace('500', '500/10') + ' border-' + status.color.replace('text-', '').replace('400', '400/20').replace('500', '500/20') + ' ' + status.color}`}>
                         <Icon className="h-3 w-3" /> {status.label}
                       </span>
                       <span className="text-xs text-muted-foreground">Order #{order.id}</span>
                     </div>
                     <h3 className="font-bold text-lg mb-1">{order.solution?.title || "Unknown Solution"}</h3>
                     <p className="text-sm text-muted-foreground">
                       Provider: <span className="text-foreground">{order.seller?.name}</span>
                     </p>
                   </div>
                   
                   <div className="text-right">
                     <div className="text-xl font-bold">${(order.price_cents / 100).toLocaleString()}</div>
                     <div className="text-xs text-muted-foreground mt-1">
                       Ordered {new Date(order.created_at).toLocaleDateString()}
                     </div>
                   </div>
                 </div>
               </Link>
             );
          })}
        </div>
      )}
    </div>
  );
}
