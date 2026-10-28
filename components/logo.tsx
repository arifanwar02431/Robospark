import { SITE } from "@/lib/site";
import { cn } from "./ui";

export function LogoMark({ className }: { className?: string }) {
  const initial = SITE.name.trim().charAt(0).toUpperCase() || "W";
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-400 to-brand-600 text-[15px] font-extrabold text-white shadow-[0_2px_6px_rgba(236,100,22,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]",
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function Logo({ className, subtitle }: { className?: string; subtitle?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col">
        <span className="text-[17px] leading-tight font-bold tracking-[-0.02em] text-gray-900">{SITE.name}</span>
        {subtitle && <span className="text-xs font-medium text-gray-500">{subtitle}</span>}
      </span>
    </span>
  );
}
