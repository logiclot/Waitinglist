import { LogoMark } from "@/components/LogoMark";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <LogoMark size={56} />
      </div>
    </div>
  );
}
