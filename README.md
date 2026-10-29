# Portal Belajar — Materi, Robot, Project + Admin Jadwal & Rapor

Portal pribadi dengan halaman publik (**Beranda**, **Materi**, **Robot**, **Project**) dan **panel Admin** yang hanya bisa diakses oleh Anda.

**Halaman publik**

- **Beranda** — alur belajar digambar sebagai flowchart (Flowchart → Variabel → Percabangan → Perulangan → Sumatif); setiap bentuk membuka materinya.
- **Materi** — kartu materi interaktif dengan filter Kelas 4 / Kelas 6.
- **Robot** & **Project** — galeri dengan halaman detail (foto, deskripsi, video YouTube, komponen, tautan).

**Fitur admin**

- **Nilai rapor** — kelas 4A–4I dan 6A–6I, per tahun ajaran & semester. Komponen penilaian berbobot (bawaan: Tugas 20, Praktik 30, UTS 20, UAS 30) yang bisa diubah, nilai akhir dihitung otomatis, deskripsi capaian, KKTP, ringkasan kelas, tempel nilai langsung dari Excel, tersimpan otomatis, dan unduh ke Excel (per kelas atau semua kelas sekaligus).
- **Data siswa** — tempel daftar NIS + nama dari Excel per kelas, edit, pindah kelas, hapus. Daftar siswa berlaku per tahun ajaran.

- **Jadwal Pelajaran** (mingguan) — tambah, edit, hapus, aktif/nonaktifkan, cari & filter per hari.
- **Jadwal Kegiatan** (tanggal tertentu) — tambah, edit, hapus, tab Mendatang / Sudah lewat.
- **Pengingat Telegram otomatis** — setiap jadwal bisa punya beberapa pengingat (Hari-H, H-1, H-3, H-7, atau H-berapa pun yang Anda ketik). Dikirim setiap pagi ± 06.00 WIB lewat Vercel Cron.
- **Dashboard** — jadwal hari ini, antrean pengingat hari ini & besok, kegiatan terdekat.
- **Pengaturan Telegram** — status koneksi, kirim pesan tes, jalankan pengingat manual, cari Chat ID, riwayat pengingat.

**Tema** bergaya *planner* yang hangat: latar putih dengan cahaya peach, aksen oranye, tombol bulat, font **Plus Jakarta Sans**, papan jadwal per hari, dan kalender jam-per-jam. Setiap mata pelajaran/kegiatan otomatis mendapat warnanya sendiri. Semua token warna ada di `app/globals.css`, warna blok jadwal di `lib/colors.ts`.

**Teknologi:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · PostgreSQL (Neon) · Vercel Cron · Telegram Bot API.

---

## 1. Upload ke GitHub

Buat repository **baru dan kosong** di GitHub (mis. `website-pribadi`, boleh Private). Lalu dari folder proyek ini:

```bash
git remote add origin https://github.com/USERNAME/website-pribadi.git
git push -u origin main
```

> Folder ini sudah berisi commit pertama. Jika Anda lebih suka lewat web, buka repo kosong → **uploading an existing file** → seret semua isi folder (kecuali `node_modules` dan `.next`, yang memang tidak disertakan).

## 2. Deploy di Vercel

1. Buka [vercel.com/new](https://vercel.com/new) → **Import** repository tadi → klik **Deploy**. Website publik langsung tampil; admin baru bisa dipakai setelah langkah 2–4.
2. **Database:** di project Vercel → tab **Storage** → **Create Database** → pilih **Neon (Postgres)** → **Connect** ke project ini. Variabel alamat database otomatis terisi (`DATABASE_URL`, atau `STORAGE_URL` jika memakai prefix bawaan; keduanya dikenali). Jika tidak muncul, salin alamat database dari halaman Storage dan tambahkan manual sebagai `DATABASE_URL`. Tabel dibuat otomatis saat aplikasi pertama kali dipakai.
3. **Environment Variables:** **Settings → Environment Variables**, tambahkan:

| Nama | Isi |
|---|---|
| `ADMIN_USERNAME` | Username login Anda, mis. `arif` |
| `ADMIN_PASSWORD` | Password yang panjang & unik (min. 12 karakter) |
| `AUTH_SECRET` | String acak ≥ 32 karakter (lihat cara membuat di bawah) |
| `CRON_SECRET` | String acak lain (Vercel memakainya untuk mengamankan cron) |
| `TELEGRAM_BOT_TOKEN` | Token dari @BotFather |
| `TELEGRAM_CHAT_ID` | Chat ID Anda (bisa dicari dari menu Admin, lihat langkah 3) |
| `NEXT_PUBLIC_SITE_NAME` | *(opsional)* Nama yang tampil di website |

Membuat string acak: jalankan `openssl rand -base64 48` di terminal, atau buka [generate-secret.vercel.app/48](https://generate-secret.vercel.app/48).

4. **Deployments → ⋯ → Redeploy** agar semua variabel terbaca.
5. Buka `https://nama-project.vercel.app/admin` dan masuk.

## 3. Hubungkan Telegram

1. Di Telegram buka **@BotFather** → kirim `/newbot` → ikuti petunjuk → salin **token** ke `TELEGRAM_BOT_TOKEN` → redeploy.
2. Buka bot Anda dan kirim **/start**.
3. Di website: **Admin → Pengaturan Telegram → Cari Chat ID** → salin angkanya ke `TELEGRAM_CHAT_ID` → redeploy.
4. Klik **Kirim pesan tes**. Jika pesan masuk, pengingat otomatis sudah siap.

## Cara kerja pengingat

- Vercel Cron memanggil `/api/cron/reminder` **sekali sehari** (`vercel.json`: `0 23 * * *` UTC = **06.00 WIB**). Pada paket gratis (Hobby) Vercel hanya mengizinkan cron harian dan waktunya bisa meleset hingga 59 menit, jadi pesan tiba antara 06.00–06.59 WIB.
- Setiap pagi sistem menghitung jadwal mana yang jatuh **H-n** dari hari itu, lalu mengirim **satu pesan ringkas** berisi semua pengingat hari itu.
- **Jadwal pelajaran** berulang tiap minggu, jadi pengingatnya maksimal **H-6**. **Kegiatan** bisa sampai **H-365**.
- Setiap pengingat dicatat, sehingga **tidak pernah terkirim dua kali** walau cron terpanggil ulang atau Anda menekan "Jalankan pengingat hari ini". Jika Telegram gagal, catatannya dilepas lagi supaya bisa dicoba ulang.
- Nonaktifkan pelajaran (mis. saat libur) untuk menghentikan pengingatnya tanpa menghapus jadwal.

**Mengubah jam kirim:** ubah `schedule` di `vercel.json` (format UTC, jam WIB dikurangi 7). Contoh 05.00 WIB → `0 22 * * *`, 19.00 WIB → `0 12 * * *`. Commit & push, Vercel akan memperbaruinya.

## Keamanan

- Semua halaman `/admin/*` dan setiap aksi simpan/hapus memeriksa sesi di server.
- Sesi berupa cookie `httpOnly` bertanda tangan (berlaku 7 hari). Mengganti `ADMIN_PASSWORD` otomatis mengeluarkan semua sesi lama.
- Login dikunci 15 menit setelah 5 kali salah dari IP yang sama.
- Endpoint cron hanya menerima permintaan dengan `CRON_SECRET` yang benar.
- Halaman admin tidak diindeks mesin pencari.

## Pengembangan lokal (opsional)

```bash
npm install
cp .env.example .env.local   # isi nilainya; DATABASE_URL bisa pakai Neon yang sama
npm run dev                  # http://localhost:3000
```

Menjalankan pengingat secara manual (lokal):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminder
```

## Mengubah isi Materi, Robot, dan Project

Isi halaman publik ada di folder `content/`:

- `content/materi.ts` — daftar materi (judul, topik, kelas, link, ringkasan, aktivitas).
- `content/robot.ts` — galeri robot. Foto taruh di `public/robot/`, lalu tulis `image: "/robot/nama-file.jpg"`.
- `content/project.ts` — daftar project. Gambar taruh di `public/project/`.

Setiap file berisi contoh yang tinggal disalin. Setelah diubah, commit & push ke GitHub; Vercel deploy otomatis.

## Rapor: cara pakai singkat

1. **Admin → Siswa**: pilih tahun ajaran dan kelas, klik **Tambah siswa**, tempel kolom NIS + Nama dari Excel (kolom No boleh ikut), lalu **Simpan**.
2. **Admin → Nilai**: pilih semester dan kelas. Ketik nilai (Enter = turun satu baris) atau salin satu kolom/blok nilai dari Excel lalu tempel di sel pertama. Semua perubahan tersimpan otomatis.
3. **Komponen & bobot**: ubah nama/bobot komponen dan KKTP. Berlaku untuk semua kelas di semester itu. Semester baru otomatis menyalin komponen semester sebelumnya.
4. **Excel 4A / Excel semua kelas**: unduh nilai lengkap dengan nilai akhir, keterangan Tuntas/Belum tuntas, dan deskripsi capaian.

Data nilai dan nama siswa hanya bisa dilihat setelah login admin.

## Struktur folder

```
app/
  page.tsx                 Beranda (publik)
  materi/, robot/, project/  Halaman publik
  login/                   Halaman & aksi login
  admin/                   Dashboard, pelajaran, kegiatan, nilai, siswa, Telegram + server actions
  admin/nilai/export/      Unduh nilai ke Excel
content/                   Isi Materi, Robot, Project (ubah di sini)
  api/cron/reminder/       Endpoint yang dipanggil Vercel Cron
components/                Komponen UI (tombol, kartu jadwal, kalender, modal)
lib/
  db.ts, schema.ts         Koneksi Postgres & skema tabel (dibuat otomatis)
  auth.ts, session.ts      Login & sesi admin
  reminders.ts             Logika pengingat H-n
  rapor.ts, rapor-shared.ts  Data siswa, komponen, nilai & perhitungan nilai akhir
  telegram.ts              Kirim pesan Telegram
  site.ts                  Nama & tagline website (ubah di sini)
proxy.ts                   Proteksi /admin (Next.js 16)
vercel.json                Jadwal cron
```
