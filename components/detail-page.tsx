import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "./ui";

export function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

export function DetailPage({
  backHref,
  backLabel,
  meta,
  title,
  summary,
  image,
  video,
  description,
  aside,
  links,
}: {
  backHref: string;
  backLabel: string;
  meta?: string;
  title: string;
  summary: string;
  image?: string;
  video?: string;
  description: string;
  aside?: ReactNode;
  links?: { label: string; url: string }[];
}) {
  const vid = youtubeId(video);
  return (
    <article className="mx-auto max-w-[1000px] px-5 pt-6 pb-24 sm:px-8 sm:pt-10">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800">
        <ArrowLeft className="size-4" /> {backLabel}
      </Link>
      <header className="mt-6 max-w-3xl">
        {meta && <p className="text-[15px] font-bold text-brand-700">{meta}</p>}
        <h1 className="mt-2 text-[38px] leading-[1.06] font-extrabold tracking-[-0.032em] text-gray-900 sm:text-[50px]">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">{summary}</p>
        {links && links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((l, i) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={buttonClass(i === 0 ? "primary" : "secondary")}>
                {l.label} <ArrowUpRight className="size-4" />
              </a>
            ))}
          </div>
        )}
      </header>

      {image && (
        <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-3xl bg-gray-100 shadow-md ring-1 ring-black/5">
          <Image src={image} alt={title} fill priority sizes="(min-width: 1000px) 936px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-gray-700">
          {description
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          {vid && (
            <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-gray-900 shadow-md">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${vid}`}
                title={`Video ${title}`}
                className="size-full"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
        {aside && <aside className="flex flex-col gap-6">{aside}</aside>}
      </div>
    </article>
  );
}

export function AsideList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-gray-200/80">
      <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2 text-[15px] text-gray-600">
        {items.map((it) => (
          <li key={it} className="flex gap-2.5">
            <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brand-500" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
