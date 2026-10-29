// ============================================================
//  GALERI ROBOT
//  Foto disimpan di folder public/robot/, lalu tulis path-nya,
//  mis. image: "/robot/line-follower.jpg".
//  Video: tempel link YouTube biasa (https://youtu.be/... atau
//  https://www.youtube.com/watch?v=...).
// ============================================================

export type Robot = {
  slug: string; // dipakai di alamat halaman: /robot/<slug>
  name: string;
  summary: string; // 1 kalimat untuk kartu
  description: string; // paragraf; pisahkan paragraf dengan baris kosong
  image?: string;
  video?: string;
  year?: number;
  madeBy?: string; // mis. "Siswa kelas 6B" atau "Arif Anwar"
  components?: string[]; // komponen/bahan
  skills?: string[]; // konsep yang dipelajari
};

export const ROBOTS: Robot[] = [
  // Contoh (hapus tanda // di depan setiap baris untuk memakainya):
  // {
  //   slug: "robot-line-follower",
  //   name: "Robot Line Follower",
  //   summary: "Robot yang mengikuti garis hitam memakai sensor inframerah.",
  //   description: "Paragraf pertama...\n\nParagraf kedua...",
  //   image: "/robot/line-follower.jpg",
  //   video: "https://youtu.be/xxxxxxxxxxx",
  //   year: 2026,
  //   madeBy: "Siswa kelas 6A",
  //   components: ["Arduino Uno", "2 sensor IR", "Motor driver L298N"],
  //   skills: ["Percabangan", "Perulangan"],
  // },
];
