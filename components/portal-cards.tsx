import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bot, FolderKanban } from "lucide-react";
import type { Materi } from "@/content/materi";
import type { Project } from "@/content/project";
import type { Robot } from "@/content/robot";
import { SHAPE_TONE, ShapeIcon } from "./flow-shapes";
import { cn } from "./ui";

export function MateriCard({ m, headingLevel = "h3" }: { m: Materi; headingLevel?: "h2" | "h3" }) {
  const tone = SHAPE_TONE[m.shape];
  const H = headingLevel;
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-xs ring-1 ring-gray-200/80 transition-shadow outline-none hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className={cn("flex items-center justify-between px-6 pt-6 pb-5", tone.soft)}>
        <ShapeIcon shape={m.shape} className="h-14 w-[74px] transition-transform group-hover:-rotate-3" />
        <div className="flex gap-1.5">
          {m.kelas.map((k) => (
            <span key={k} className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-gray-800 ring-1 ring-black/5">
              Kelas {k}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
        <p className={cn("text-[13px] font-bold", tone.text)}>
          {m.topic}
          {m.type === "Asesmen sumatif" && <span className="font-semibold text-gray-500">, asesmen sumatif</span>}
        </p>
        <H className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-gray-900">{m.title}</H>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{m.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {m.activities.map((a) => (
            <li key={a} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
              {a}
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-brand-700 group-hover:text-brand-800">
          {m.type === "Asesmen sumatif" ? "Kerjakan asesmen" : "Buka materi"}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}

function Cover({ image, alt, kind }: { image?: string; alt: string; kind: "robot" | "project" }) {
  if (image) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
    );
  }
  const Icon = kind === "robot" ? Bot : FolderKanban;
  return (
    <div className={cn("flex aspect-[4/3] items-center justify-center", kind === "robot" ? "bg-c6-50 text-c6-500" : "bg-c3-50 text-c3-500")}>
      <Icon className="size-14" strokeWidth={1.5} />
    </div>
  );
}

export function RobotCard({ r }: { r: Robot }) {
  return (
    <Link href={`/robot/${r.slug}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-xs ring-1 ring-gray-200/80 transition-shadow outline-none hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-500">
      <Cover image={r.image} alt={r.name} kind="robot" />
      <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
        {(r.madeBy || r.year) && <p className="text-[13px] font-semibold text-gray-500">{[r.madeBy, r.year].filter(Boolean).join(", ")}</p>}
        <h3 className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-gray-900">{r.name}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{r.summary}</p>
        {r.skills && r.skills.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {r.skills.map((s) => (
              <li key={s} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/project/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-xs ring-1 ring-gray-200/80 transition-shadow outline-none hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-500">
      <Cover image={p.image} alt={p.title} kind="project" />
      <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
        {p.year && <p className="text-[13px] font-semibold text-gray-500">{p.year}</p>}
        <h3 className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-gray-900">{p.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{p.summary}</p>
        {p.tags && p.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li key={t} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

export function ComingSoon({ kind, compact }: { kind: "robot" | "project"; compact?: boolean }) {
  const Icon = kind === "robot" ? Bot : FolderKanban;
  return (
    <div className={cn("flex flex-col items-center rounded-3xl border-2 border-dashed border-gray-300/80 bg-white/60 text-center", compact ? "px-6 py-10" : "px-6 py-16")}>
      <span className={cn("flex size-14 items-center justify-center rounded-2xl", kind === "robot" ? "bg-c6-50 text-c6-500" : "bg-c3-50 text-c3-500")}>
        <Icon className="size-7" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-lg font-extrabold tracking-tight text-gray-900">
        {kind === "robot" ? "Galeri robot sedang disiapkan" : "Daftar project sedang disiapkan"}
      </h3>
      <p className="mt-1.5 max-w-sm text-[15px] text-gray-600">
        {kind === "robot"
          ? "Foto, video, dan cerita di balik setiap robot akan tampil di sini."
          : "Karya dan proyek yang sedang saya kerjakan akan tampil di sini."}
      </p>
    </div>
  );
}
