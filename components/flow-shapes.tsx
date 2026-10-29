// Bentuk-bentuk flowchart dipakai sebagai "ikon" topik di seluruh portal.
import type { TopicShape } from "@/content/materi";
import { cn } from "./ui";

export const SHAPE_TONE: Record<TopicShape, { fill: string; stroke: string; soft: string; text: string }> = {
  process: { fill: "#dceffd", stroke: "#4ba6ea", soft: "bg-c1-50", text: "text-c1-900" },
  io: { fill: "#ebe4fd", stroke: "#8e6cf0", soft: "bg-c3-50", text: "text-c3-900" },
  decision: { fill: "#ffe9d2", stroke: "#f99a2e", soft: "bg-c2-50", text: "text-c2-900" },
  loop: { fill: "#d9f3e5", stroke: "#3db57a", soft: "bg-c4-50", text: "text-c4-900" },
  terminal: { fill: "#ffe7d4", stroke: "#ec6416", soft: "bg-brand-50", text: "text-brand-800" },
};

/** Ikon bentuk flowchart kecil (viewBox 64×48). */
export function ShapeIcon({ shape, className }: { shape: TopicShape; className?: string }) {
  const t = SHAPE_TONE[shape];
  const common = { fill: t.fill, stroke: t.stroke, strokeWidth: 2.5, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 64 48" className={cn("h-12 w-16", className)} aria-hidden>
      {shape === "process" && <rect x="6" y="10" width="52" height="28" rx="4" {...common} />}
      {shape === "io" && <path d="M16 10 H58 L48 38 H6 Z" {...common} />}
      {shape === "decision" && <path d="M32 4 L60 24 L32 44 L4 24 Z" {...common} />}
      {shape === "terminal" && <rect x="4" y="11" width="56" height="26" rx="13" {...common} />}
      {shape === "loop" && (
        <>
          <rect x="14" y="14" width="44" height="24" rx="4" {...common} />
          <path d="M14 30 H6 V8 H34 V13" fill="none" stroke={t.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 9.5 L34 14 L38 9.5" fill="none" stroke={t.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}
