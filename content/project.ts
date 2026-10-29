// ============================================================
//  PROJECT SAYA
//  Gambar disimpan di folder public/project/, lalu tulis path-nya,
//  mis. image: "/project/robospark.jpg".
// ============================================================

export type Project = {
  slug: string; // dipakai di alamat halaman: /project/<slug>
  title: string;
  summary: string; // 1 kalimat untuk kartu
  description: string; // paragraf; pisahkan paragraf dengan baris kosong
  image?: string;
  year?: number;
  tags?: string[];
  links?: { label: string; url: string }[];
};

export const PROJECTS: Project[] = [
  // Contoh (hapus tanda // di depan setiap baris untuk memakainya):
  // {
  //   slug: "nama-project",
  //   title: "Nama Project",
  //   summary: "Ringkasan satu kalimat.",
  //   description: "Paragraf pertama...\n\nParagraf kedua...",
  //   image: "/project/nama-project.jpg",
  //   year: 2026,
  //   tags: ["Web", "Robotika"],
  //   links: [{ label: "Kunjungi", url: "https://contoh.vercel.app" }],
  // },
];
