// Alur belajar di beranda, digambar sebagai flowchart. Setiap bentuk menautkan ke materinya.
import type { ReactNode } from "react";
import { MATERI } from "@/content/materi";
import { SHAPE_TONE } from "./flow-shapes";

const bySlug = (slug: string) => MATERI.find((m) => m.slug === slug);

function Node({
  href,
  label,
  delay,
  children,
}: {
  href?: string;
  label: string;
  delay: number;
  children: ReactNode;
}) {
  const inner = (
    <g className="flow-node-inner" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </g>
  );
  if (!href) return <g aria-hidden>{inner}</g>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flow-node">
      {inner}
    </a>
  );
}

function Arrow({ d, delay, head }: { d: string; delay: number; head: string }) {
  return (
    <g>
      <path d={d} pathLength={1} className="flow-draw" style={{ animationDelay: `${delay}ms` }} fill="none" stroke="#45403b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} className="flow-node-inner" style={{ animationDelay: `${delay + 250}ms` }} fill="#45403b" />
    </g>
  );
}

function Label({ y, title, sub, dark }: { y: number; title: string; sub: string; dark?: boolean }) {
  return (
    <>
      <text x={250} y={y} textAnchor="middle" fontSize={17} fontWeight={800} fill={dark ? "#fff" : "#1d1b19"}>
        {title}
      </text>
      <text x={250} y={y + 19} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={dark ? "rgba(255,255,255,.8)" : "#5e5751"}>
        {sub}
      </text>
    </>
  );
}

export function HeroFlowchart() {
  const flow = bySlug("flowchart-kelas-4");
  const vari = bySlug("variabel-kelas-4");
  const cab = bySlug("percabangan-kelas-4");
  const loop = bySlug("perulangan-kelas-6");
  const sum = bySlug("sumatif-flowchart-kelas-6");
  const t = SHAPE_TONE;

  return (
    <svg viewBox="0 0 500 660" className="h-auto w-full" role="img" aria-labelledby="flow-title">
      <title id="flow-title">Alur belajar: Flowchart, Variabel, Percabangan, Perulangan, lalu Sumatif</title>

      {/* Mulai */}
      <Node label="Mulai" delay={0}>
        <ellipse cx={250} cy={34} rx={64} ry={24} fill="#1d1b19" />
        <text x={250} y={40} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff">
          Mulai
        </text>
      </Node>
      <Arrow d="M250 58 V92" delay={150} head="M244 90 L250 99 L256 90 Z" />

      {/* Proses: Flowchart */}
      <Node href={flow?.url} label="Buka materi Flowchart & Algoritma, kelas 4" delay={250}>
        <rect className="flow-shape" x={125} y={100} width={250} height={66} rx={10} fill={t.process.fill} stroke={t.process.stroke} strokeWidth={2.5} />
        <Label y={130} title="Flowchart & Algoritma" sub="Kelas 4" />
      </Node>
      <Arrow d="M250 166 V198" delay={400} head="M244 196 L250 205 L256 196 Z" />

      {/* Input/Output: Variabel */}
      <Node href={vari?.url} label="Buka materi Variabel, kelas 4 dan 6" delay={500}>
        <path className="flow-shape" d="M150 206 H385 L350 272 H115 Z" fill={t.io.fill} stroke={t.io.stroke} strokeWidth={2.5} strokeLinejoin="round" />
        <Label y={236} title="Variabel" sub="Kelas 4 & 6" />
      </Node>
      <Arrow d="M250 272 V302" delay={650} head="M244 300 L250 309 L256 300 Z" />

      {/* Keputusan: Percabangan */}
      <Node href={cab?.url} label="Buka materi Percabangan, kelas 4 dan 6" delay={750}>
        <path className="flow-shape" d="M250 310 L380 378 L250 446 L120 378 Z" fill={t.decision.fill} stroke={t.decision.stroke} strokeWidth={2.5} strokeLinejoin="round" />
        <Label y={376} title="Percabangan" sub="Kelas 4 & 6" />
      </Node>
      {/* Tidak → kembali ke Variabel */}
      <Arrow d="M380 378 H438 V239 H372" delay={900} head="M374 233 L365 239 L374 245 Z" />
      <text x={398} y={368} fontSize={13} fontWeight={700} fill="#7d756e">
        Tidak
      </text>
      {/* Ya → Perulangan */}
      <Arrow d="M250 446 V486" delay={950} head="M244 484 L250 493 L256 484 Z" />
      <text x={260} y={470} fontSize={13} fontWeight={700} fill="#7d756e">
        Ya
      </text>

      {/* Proses dengan loop: Perulangan */}
      <Node href={loop?.url} label="Buka materi Perulangan, kelas 6" delay={1050}>
        <rect className="flow-shape" x={125} y={494} width={250} height={66} rx={10} fill={t.loop.fill} stroke={t.loop.stroke} strokeWidth={2.5} />
        <Label y={524} title="Perulangan" sub="Kelas 6" />
      </Node>
      <Arrow d="M125 540 H70 V474 H238" delay={1200} head="M236 468 L245 474 L236 480 Z" />
      <text x={62} y={512} textAnchor="end" fontSize={13} fontWeight={700} fill="#7d756e">
        ulangi
      </text>
      <Arrow d="M250 560 V592" delay={1300} head="M244 590 L250 599 L256 590 Z" />

      {/* Selesai: Sumatif */}
      <Node href={sum?.url} label="Buka asesmen Sumatif Flowchart, kelas 6" delay={1400}>
        <rect className="flow-shape" x={150} y={600} width={200} height={54} rx={27} fill="#ec6416" />
        <Label y={624} title="Sumatif" sub="Kelas 6" dark />
      </Node>
    </svg>
  );
}
