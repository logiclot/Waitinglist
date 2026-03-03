import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "founding"
  | "proven"
  | "elite"
  | "success"
  | "warning"
  | "info"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  founding:
    "bg-gradient-to-r from-neutral-900 to-neutral-800 text-white border-neutral-700",
  proven:
    "bg-blue-50 text-blue-700 border-blue-200",
  elite:
    "bg-purple-50 text-purple-700 border-purple-200",
  success:
    "bg-green-50 text-green-700 border-green-200",
  warning:
    "bg-yellow-50 text-yellow-700 border-yellow-200",
  info:
    "bg-secondary text-muted-foreground border-border",
  default:
    "bg-secondary text-foreground border-border",
};

export function Badge({ variant = "default", label, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
