window.MATERI = window.MATERI || {};
window.MATERI[4] = [
{
  id: "algoritma",
  judul: "Algoritma",
  ringkas: "Langkah-langkah yang runtut untuk menyelesaikan masalah.",
  tp: "1.3",
  isi: `
<p class="lead">Setiap hari kita menjalankan langkah-langkah secara berurutan: bangun tidur, berdoa, mandi, lalu sarapan. Kumpulan langkah yang disusun <b>runtut</b> untuk menyelesaikan suatu masalah disebut <b>algoritma</b>.</p>

<div class="analogi">
  <div class="analogi-label">Ibaratnya</div>
  <p>Algoritma itu seperti <b>resep es teh</b>. Kalau langkahnya ditukar, misalnya es batu dimasukkan sebelum gelas disiapkan, hasilnya jadi kacau.</p>
</div>

<h3>Ciri algoritma yang baik</h3>
<ul class="cek">
  <li><b>Runtut</b>: langkahnya berurutan dan tidak diacak.</li>
  <li><b>Jelas</b>: setiap langkah mudah dimengerti dan tidak membingungkan.</li>
  <li><b>Ada awal dan akhir</b>: kita tahu kapan mulai dan kapan selesai.</li>
</ul>

<h3>Contoh: membuat es teh</h3>
<ol class="langkah">
  <li>Siapkan gelas.</li>
  <li>Masukkan teh dan gula.</li>
  <li>Tuang air dingin dan es batu.</li>
  <li>Aduk sampai gula larut.</li>
</ol>

<h3>Algoritma untuk robot</h3>
<p>Robot hanya mengerti perintah yang sangat jelas, misalnya <code>maju</code>, <code>belok kiri</code>, dan <code>belok kanan</code>. Saat belok, robot <b>hanya berputar di tempat</b> dan tidak berpindah petak.</p>
<div data-widget="robot"></div>

<div class="ingat"><b>Ingat!</b> Urutan perintah sangat penting. <code>maju 2, belok kiri</code> hasilnya berbeda dengan <code>belok kiri, maju 2</code>.</div>
`
},
{
  id: "flowchart",
  judul: "Diagram Alir (Flowchart)",
  ringkas: "Algoritma yang digambar dengan simbol dan anak panah.",
  tp: "1.2",
  isi: `
<p class="lead">Algoritma bisa ditulis dengan kalimat, bisa juga <b>digambar</b>. Gambar algoritma yang memakai simbol-simbol khusus dan anak panah disebut <b>diagram alir</b> atau <b>flowchart</b>.</p>

<div class="analogi">
  <div class="analogi-label">Ibaratnya</div>
  <p>Flowchart itu seperti <b>denah jalan</b>. Kita cukup mengikuti arah panah dari <i>Mulai</i> sampai <i>Selesai</i>.</p>
</div>

<h3>Simbol-simbol flowchart</h3>
<div data-widget="simbol"></div>

<h3>Contoh flowchart urut</h3>
<p>Langkah membuat es teh di bab sebelumnya bisa digambar seperti ini. Semua langkahnya adalah <b>proses</b>, jadi memakai persegi panjang.</p>
<figure><img src="img/materi4_fc_esteh.png" alt="Flowchart membuat es teh" style="max-width:300px"></figure>

<h3>Contoh flowchart dengan keputusan</h3>
<p>Belah ketupat berisi <b>pertanyaan</b>. Jawabannya hanya <b>Ya</b> atau <b>Tidak</b>, dan setiap jawaban punya jalannya sendiri.</p>
<figure><img src="img/materi4_fc_lapar.png" alt="Flowchart dengan keputusan Lapar?" style="max-width:340px"></figure>

<div class="ingat"><b>Ingat!</b> Kata <i>Masukkan…</i> dan <i>Tampilkan…</i> selalu ditulis di dalam <b>jajar genjang</b>. Pertanyaan yang berakhiran tanda tanya ditulis di dalam <b>belah ketupat</b>.</div>
`
},
{
  id: "percabangan",
  judul: "Percabangan (if-then)",
  ringkas: "Memilih tindakan berdasarkan syarat.",
  tp: "2.2",
  isi: `
<p class="lead">Kadang kita harus <b>memilih</b>: kalau lapar, kita makan siang. Kalau tidak lapar, kita lanjut belajar. Memilih tindakan berdasarkan <b>syarat</b> disebut <b>percabangan</b>. Dalam pemrograman, percabangan disebut juga <b>if-then</b>.</p>

<div class="analogi">
  <div class="analogi-label">Ibaratnya</div>
  <p>Percabangan itu seperti <b>pertigaan jalan</b>. Kita melihat papan petunjuk (syarat), lalu memilih belok ke kiri atau ke kanan. Kita tidak bisa melewati dua jalan sekaligus.</p>
</div>

<h3>Bentuk percabangan</h3>
<pre class="kode">JIKA <span class="k-syarat">syarat benar</span> MAKA <span class="k-aksi">lakukan tindakan A</span>
JIKA TIDAK <span class="k-aksi">lakukan tindakan B</span></pre>
<p>Bagian setelah kata <b>jika</b> adalah <b>syarat</b>, dan bagian setelah kata <b>maka</b> adalah <b>tindakan</b>.</p>

<h3>Operator perbandingan</h3>
<p>Syarat sering berisi perbandingan. Hasilnya hanya dua: <b>benar</b> atau <b>salah</b>.</p>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Operator</th><th>Artinya</th><th>Contoh</th><th>Hasil</th></tr></thead>
<tbody>
<tr><td><code>&gt;</code></td><td>lebih dari</td><td><code>9 &gt; 4</code></td><td class="ya">benar</td></tr>
<tr><td><code>&lt;</code></td><td>kurang dari</td><td><code>3 &lt; 2</code></td><td class="tidak">salah</td></tr>
<tr><td><code>&gt;=</code></td><td>lebih dari atau sama dengan (minimal)</td><td><code>10 &gt;= 10</code></td><td class="ya">benar</td></tr>
<tr><td><code>&lt;=</code></td><td>kurang dari atau sama dengan (maksimal)</td><td><code>8 &lt;= 5</code></td><td class="tidak">salah</td></tr>
<tr><td><code>==</code></td><td>sama dengan</td><td><code>7 == 7</code></td><td class="ya">benar</td></tr>
<tr><td><code>!=</code></td><td>tidak sama dengan</td><td><code>4 != 4</code></td><td class="tidak">salah</td></tr>
</tbody></table></div>

<div class="ingat"><b>Awas jebakan batas!</b> Aturan "nilai <b>lebih dari</b> 70" ditulis <code>nilai &gt; 70</code>, jadi nilai 70 <b>tidak</b> lolos. Aturan "nilai <b>minimal</b> 70" ditulis <code>nilai &gt;= 70</code>, jadi nilai 70 <b>lolos</b>.</div>
<div data-widget="operator"></div>

<h3>AND dan OR</h3>
<p>Satu percabangan bisa memiliki dua syarat sekaligus.</p>
<div class="dua-kolom">
  <div class="kartu-konsep">
    <div class="tag">AND (dan)</div>
    <p><b>Semua syarat harus benar.</b></p>
    <p class="contoh">"Boleh main bola jika PR selesai <b>AND</b> tidak hujan." Kalau PR sudah selesai tetapi hujan, tetap tidak boleh main.</p>
  </div>
  <div class="kartu-konsep">
    <div class="tag">OR (atau)</div>
    <p><b>Cukup satu syarat yang benar.</b></p>
    <p class="contoh">"Pulang dijemput ayah <b>OR</b> naik mobil antar-jemput." Salah satu saja sudah cukup untuk bisa pulang.</p>
  </div>
</div>
<div data-widget="logika"></div>
`
},
{
  id: "debugging",
  judul: "Menguji dan Memperbaiki Program",
  ringkas: "Mencari kesalahan (bug) lalu memperbaikinya.",
  tp: "2.3 & 2.4",
  isi: `
<p class="lead">Program atau algoritma yang kita buat belum tentu langsung benar. Kesalahan pada program disebut <b>bug</b>. Kegiatan mencari dan menemukan bug disebut <b>debugging</b>.</p>

<div class="analogi">
  <div class="analogi-label">Ibaratnya</div>
  <p>Debugging itu seperti menjadi <b>detektif</b>. Kita mengamati hasilnya, mencari bagian yang salah, lalu memperbaikinya.</p>
</div>

<h3>Langkah debugging</h3>
<ol class="langkah">
  <li><b>Uji</b>: jalankan program dan lihat hasilnya.</li>
  <li><b>Bandingkan</b>: apakah hasilnya sesuai harapan?</li>
  <li><b>Temukan</b> bagian yang salah.</li>
  <li><b>Perbaiki</b>, lalu <b>uji lagi</b> untuk memastikan.</li>
</ol>

<h3>Kesalahan yang sering terjadi</h3>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Jenis kesalahan</th><th>Contoh</th><th>Perbaikan</th></tr></thead>
<tbody>
<tr><td>Urutan tertukar</td><td>Menuang air sebelum gelas disiapkan</td><td>Tukar urutan langkahnya</td></tr>
<tr><td>Arah robot salah</td><td>Seharusnya belok kiri, tetapi ditulis belok kanan</td><td>Ganti perintah beloknya</td></tr>
<tr><td>Langkah kurang</td><td>Robot berhenti 1 petak sebelum tujuan</td><td>Tambah jumlah langkah maju</td></tr>
<tr><td>Simbol salah</td><td><i>Tampilkan skor</i> ditulis di persegi panjang</td><td>Pindahkan ke jajar genjang</td></tr>
<tr><td>Operator salah</td><td>Aturan "minimal 60 poin" ditulis <code>poin &gt; 60</code></td><td>Ganti menjadi <code>poin &gt;= 60</code></td></tr>
</tbody></table></div>

<div class="ingat"><b>Ingat!</b> Setelah memperbaiki, program harus <b>diuji lagi</b>. Uji juga dengan angka batas, misalnya tepat 60, karena bug sering bersembunyi di situ.</div>
`
}
];
