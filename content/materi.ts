// ============================================================
//  DAFTAR MATERI — dipisah per kelas.
//  Satu materi yang dipakai kelas 4 dan kelas 6 ditulis DUA kali
//  (satu blok per kelas), walaupun link-nya sama.
//  Untuk menambah materi: salin satu blok { ... }, ubah isinya,
//  lalu commit & push ke GitHub. Vercel akan deploy otomatis.
// ============================================================

/** Bentuk flowchart yang mewakili topik (dipakai sebagai ikon kartu). */
export type TopicShape = "terminal" | "process" | "io" | "decision" | "loop" | "document";

export type Materi = {
  slug: string; // unik, mis. "variabel-kelas-4"
  kelas: 4 | 6;
  title: string;
  topic: string; // nama topik singkat, mis. "Percabangan"
  shape: TopicShape;
  type: "Materi interaktif" | "Asesmen sumatif" | "Materi & latihan SAS";
  url: string; // link ke halaman materi (boleh sama untuk kelas 4 dan 6)
  summary: string;
  activities: string[]; // aktivitas singkat yang ada di dalamnya
  hint?: string; // petunjuk tambahan, mis. "Pilih Kelas 4 di halaman awal."
  featured?: boolean; // tampil lebar di paling atas daftar kelas
};

export const MATERI: Materi[] = [
  // ------------------------- KELAS 4 -------------------------
  {
    slug: "ruang-koding-kelas-4",
    kelas: 4,
    title: "Ruang Koding: Persiapan SAS",
    topic: "Rangkuman semester",
    shape: "document",
    type: "Materi & latihan SAS",
    url: "/ruang-koding/index.html#k4-materi",
    summary:
      "Rangkuman empat bab semester ini (Algoritma, Diagram Alir, Percabangan, serta Menguji dan Memperbaiki Program) lengkap dengan kisi-kisi dan latihan soal SAS beserta pembahasannya.",
    activities: ["4 bab materi", "Kisi-kisi SAS", "175 soal + pembahasan", "Latihan acak 10 soal"],
    featured: true,
  },
  {
    slug: "flowchart-kelas-4",
    kelas: 4,
    title: "Petualangan Flowchart",
    topic: "Flowchart & Algoritma",
    shape: "process",
    type: "Materi interaktif",
    url: "https://flowchart-kelas4.vercel.app",
    summary:
      "Mengenal flowchart dan empat bentuk dasarnya (terminal, input/output, proses, keputusan) untuk menyusun langkah penyelesaian masalah.",
    activities: ["Video belajar", "Duel 1 lawan 1", "20 level puzzle", "Kuis HOTS 15 soal"],
  },
  {
    slug: "variabel-kelas-4",
    kelas: 4,
    title: "Ruang Variabel",
    topic: "Variabel",
    shape: "io",
    type: "Materi interaktif",
    url: "https://variabel-opal.vercel.app",
    summary: "Variabel sebagai kotak berlabel untuk menyimpan data, dipelajari lewat kartu perintah dan game.",
    activities: ["30 soal latihan", "Game Misi Kotak Ajaib", "Kuis 25 soal"],
    hint: "Pilih Kelas 4 di halaman awal.",
  },
  {
    slug: "percabangan-kelas-4",
    kelas: 4,
    title: "Petualangan Robo-Code",
    topic: "Percabangan",
    shape: "decision",
    type: "Materi interaktif",
    url: "https://percabangan.vercel.app",
    summary: "Percabangan JIKA–MAKA (if-then) dan tanda perbandingan, dipelajari lewat kuis logika dan simulasi.",
    activities: ["Kuis logika", "Simulasi inspeksi barang", "Tantangan 20 level"],
    hint: "Pilih Kelas 4 di halaman awal.",
  },

  // ------------------------- KELAS 6 -------------------------
  {
    slug: "ruang-koding-kelas-6",
    kelas: 6,
    title: "Ruang Koding: Persiapan SAS",
    topic: "Rangkuman semester",
    shape: "document",
    type: "Materi & latihan SAS",
    url: "/ruang-koding/index.html#k6-materi",
    summary:
      "Rangkuman tujuh bab semester ini, dari Pemecahan Masalah, Variabel, Flowchart, Percabangan, dan Perulangan sampai Data untuk Mengambil Keputusan, lengkap dengan kisi-kisi dan latihan soal SAS.",
    activities: ["7 bab materi", "Kisi-kisi SAS", "175 soal + pembahasan", "Latihan acak 10 soal"],
    featured: true,
  },
  {
    slug: "variabel-kelas-6",
    kelas: 6,
    title: "Ruang Variabel",
    topic: "Variabel",
    shape: "io",
    type: "Materi interaktif",
    url: "https://variabel-opal.vercel.app",
    summary: "Memakai variabel di dalam flowchart untuk menyimpan dan mengubah data selama program berjalan.",
    activities: ["30 soal latihan", "Game Detektif Flowchart", "Kuis 25 soal"],
    hint: "Pilih Kelas 6 di halaman awal.",
  },
  {
    slug: "percabangan-kelas-6",
    kelas: 6,
    title: "Petualangan Robo-Code",
    topic: "Percabangan",
    shape: "decision",
    type: "Materi interaktif",
    url: "https://percabangan.vercel.app",
    summary: "Percabangan JIKA, JIKA TIDAK, dan ATAU JIKA, tanda perbandingan, serta gerbang logika AND, OR, dan NOT.",
    activities: ["Kuis logika", "Simulasi inspeksi barang", "Tantangan 20 level"],
    hint: "Pilih Kelas 6 di halaman awal.",
  },
  {
    slug: "perulangan-kelas-6",
    kelas: 6,
    title: "Petualangan Perulangan",
    topic: "Perulangan",
    shape: "loop",
    type: "Materi interaktif",
    url: "https://perulangan-kelas6.vercel.app",
    summary: "Konsep loop FOR, WHILE, DO-WHILE, dan NESTED lewat analogi sehari-hari dan simulasi robot.",
    activities: ["Playground robot", "Simulasi mesin capit", "Pola bintang", "Ujian HOTS 15 soal"],
  },
  {
    slug: "sumatif-flowchart-kelas-6",
    kelas: 6,
    title: "Sumatif Flowchart",
    topic: "Flowchart & Algoritma",
    shape: "terminal",
    type: "Asesmen sumatif",
    url: "https://sumatifflowchart.vercel.app",
    summary: "Ujian sumatif: siswa menyusun flowchart sendiri untuk menjawab soal tingkat tinggi (HOTS).",
    activities: ["Editor flowchart", "Soal HOTS", "Kumpul jawaban"],
  },
];

export const materiFor = (kelas: 4 | 6) => MATERI.filter((m) => m.kelas === kelas);
