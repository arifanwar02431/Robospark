"use client";

import { useState } from "react";
import type { Materi } from "@/content/materi";
import { MateriCard } from "./portal-cards";
import { Segmented } from "./ui";

export function MateriList({ items }: { items: Materi[] }) {
  const [kelas, setKelas] = useState<0 | 4 | 6>(0);
  const shown = kelas === 0 ? items : items.filter((m) => m.kelas.includes(kelas));
  return (
    <>
      <Segmented<0 | 4 | 6>
        label="Filter kelas"
        value={kelas}
        onChange={setKelas}
        options={[
          { value: 0, label: "Semua", count: items.length },
          { value: 4, label: "Kelas 4", count: items.filter((m) => m.kelas.includes(4)).length },
          { value: 6, label: "Kelas 6", count: items.filter((m) => m.kelas.includes(6)).length },
        ]}
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <MateriCard key={m.slug} m={m} headingLevel="h2" />
        ))}
      </div>
    </>
  );
}
