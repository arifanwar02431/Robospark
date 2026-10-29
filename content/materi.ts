// ============================================================
//  DAFTAR MATERI
//  Untuk menambah materi: salin satu blok { ... }, ubah isinya,
//  lalu commit & push ke GitHub. Vercel akan deploy otomatis.
// ============================================================

/** Bentuk flowchart yang mewakili topik (dipakai sebagai ikon kartu). */
export type TopicShape = "terminal" | "process" | "io" | "decision" | "loop";

export type Materi = {
  slug: string;
  title: string;
  topic: string; // nama topik singkat, mis. "Percabangan"
  shape: TopicShape;
  kelas: (4 | 6)[];
  type: "Materi interaktif" | "Asesmen sumatif";
  url: string; // link ke halaman materi
  summary: string;
  activities: string[]; // aktivitas singkat yang ada di dalamnya
};

export const MATERI: Materi[] = [
  {
    slug: "flowchart-kelas-4",
    title: "Petualangan Flowchart",
    topic: "Flowchart & Algoritma",
    shape: "process",
    kelas: [4],
    type: "Materi interaktif",
    url: "https://flowchart-kelas4.vercel.app",
    summary:
      "Mengenal flowchart dan empat bentuk dasarnya (terminal, input/output, proses, keputusan) untuk menyusun langkah penyelesaian masalah.",
    activities: ["Video belajar", "Duel 1 lawan 1", "20 level puzzle", "Kuis HOTS 15 soal"],
  },
  {
    slug: "variabel",
    title: "Ruang Variabel",
    topic: "Variabel",
    shape: "io",
    kelas: [4, 6],
    type: "Materi interaktif",
    url: "https://variabel-opal.vercel.app",
    summary:
      "Cara program menyimpan dan mengingat data. Kelas 4 belajar lewat kotak berlabel, kelas 6 memakai variabel di dalam flowchart.",
    activities: ["30 soal latihan", "Game Misi Kotak Ajaib", "Game Detektif Flowchart", "Kuis 25 soal"],
  },
  {
    slug: "percabangan",
    title: "Petualangan Robo-Code",
    topic: "Percabangan",
    shape: "decision",
    kelas: [4, 6],
    type: "Materi interaktif",
    url: "https://percabangan.vercel.app",
    summary:
      "Logika JIKA, JIKA TIDAK, dan ATAU JIKA, tanda perbandingan, serta gerbang logika AND, OR, dan NOT.",
    activities: ["Kuis logika sehari-hari", "Simulasi inspeksi barang", "Tantangan 20 level"],
  },
  {
    slug: "perulangan-kelas-6",
    title: "Petualangan Perulangan",
    topic: "Perulangan",
    shape: "loop",
    kelas: [6],
    type: "Materi interaktif",
    url: "https://perulangan-kelas6.vercel.app",
    summary: "Konsep loop FOR, WHILE, DO-WHILE, dan NESTED lewat analogi sehari-hari dan simulasi robot.",
    activities: ["Playground robot", "Simulasi mesin capit", "Pola bintang", "Ujian HOTS 15 soal"],
  },
  {
    slug: "sumatif-flowchart-kelas-6",
    title: "Sumatif Flowchart",
    topic: "Flowchart & Algoritma",
    shape: "terminal",
    kelas: [6],
    type: "Asesmen sumatif",
    url: "https://sumatifflowchart.vercel.app",
    summary: "Ujian sumatif: siswa menyusun flowchart sendiri untuk menjawab soal tingkat tinggi (HOTS).",
    activities: ["Editor flowchart", "Soal HOTS", "Kumpul jawaban"],
  },
];
