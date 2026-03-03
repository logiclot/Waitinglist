import { Eye } from "lucide-react";

interface Props {
  count: number;
  hasCover?: boolean;
}

export function PortfolioViewCount({ count, hasCover }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${
      hasCover ? "text-white/50" : "text-muted-foreground/60"
    }`}>
      <Eye className="w-3 h-3" />
      {count.toLocaleString()}
    </span>
  );
}
