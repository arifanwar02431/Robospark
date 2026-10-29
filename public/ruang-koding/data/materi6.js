window.MATERI = window.MATERI || {};
window.MATERI[6] = [
{
  id: "pemecahan-masalah",
  judul: "Pemecahan Masalah Sistematis",
  ringkas: "Empat tahap menyelesaikan masalah dengan runtut.",
  tp: "1.1",
  isi: `
<p class="lead">Masalah, besar maupun kecil, lebih mudah diselesaikan jika dikerjakan dengan <b>sistematis</b>, yaitu langkah demi langkah dan tidak asal coba.</p>

<h3>Empat tahap pemecahan masalah</h3>
<div class="tahap">
  <div class="tahap-item"><span class="tahap-no">1</span><div><b>Memahami masalah</b><p>Apa yang diketahui? Apa yang ditanyakan?</p></div></div>
  <div class="tahap-item"><span class="tahap-no">2</span><div><b>Menyusun rencana</b><p>Cara apa yang akan dipakai? Langkahnya apa saja?</p></div></div>
  <div class="tahap-item"><span class="tahap-no">3</span><div><b>Melaksanakan rencana</b><p>Kerjakan langkah-langkahnya sesuai rencana.</p></div></div>
  <div class="tahap-item"><span class="tahap-no">4</span><div><b>Memeriksa kembali</b><p>Apakah hasilnya benar dan masuk akal?</p></div></div>
</div>

<h3>Contoh: jajan bakso bersama</h3>
<p>Raka membawa uang Rp30.000 dan ingin mentraktir bakso untuk dirinya dan 2 temannya. Satu mangkok bakso harganya Rp9.000. Apakah uangnya cukup?</p>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Tahap</th><th>Yang dilakukan Raka</th></tr></thead>
<tbody>
<tr><td>Memahami masalah</td><td>Diketahui: uang Rp30.000, 3 orang, 1 mangkok Rp9.000. Ditanya: apakah uangnya cukup?</td></tr>
<tr><td>Menyusun rencana</td><td>Hitung harga 3 mangkok, lalu bandingkan dengan uang yang dibawa.</td></tr>
<tr><td>Melaksanakan rencana</td><td>3 × Rp9.000 = Rp27.000. Uangnya Rp30.000, jadi cukup.</td></tr>
<tr><td>Memeriksa kembali</td><td>Rp27.000 + sisa Rp3.000 = Rp30.000. Hasilnya cocok.</td></tr>
</tbody></table></div>

<div class="ingat"><b>Ingat!</b> Kalau saat memeriksa ternyata ada yang salah, kembali ke langkah yang keliru, perbaiki, lalu periksa lagi.</div>
`
},
{
  id: "variabel",
  judul: "Variabel",
  ringkas: "Tempat menyimpan data yang nilainya bisa berubah.",
  tp: "1.2",
  isi: `
<p class="lead">Program perlu <b>mengingat</b> sesuatu, misalnya skor, nama, atau sisa waktu. Tempat untuk menyimpan data itu disebut <b>variabel</b>.</p>

<div class="analogi">
  <div class="analogi-label">Ibaratnya</div>
  <p>Variabel itu seperti <b>mangkok bakso yang diberi label</b>.</p>
  <ul>
    <li><b>Mangkok</b> adalah <b>variabel</b>, yaitu tempatnya.</li>
    <li><b>Label</b> pada mangkok adalah <b>nama variabel</b>, misalnya <code>pentol</code>.</li>
    <li><b>Isi mangkok</b> (5 pentol, tahu, atau mi) adalah <b>data atau nilai</b>.</li>
  </ul>
  <p>Isi mangkok bisa ditambah, dikurangi, atau diganti. Begitu juga nilai variabel: bisa berubah selama program berjalan.</p>
</div>

<h3>Mengisi variabel dengan tanda ←</h3>
<p>Tanda <code>←</code> artinya <b>"diisi dengan"</b>. Bagian kanan dihitung lebih dulu, lalu hasilnya disimpan ke variabel di kiri.</p>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Perintah</th><th>Artinya</th><th>Isi mangkok <code>pentol</code></th></tr></thead>
<tbody>
<tr><td><code>pentol ← 5</code></td><td>Mangkok diisi 5 pentol</td><td class="num">5</td></tr>
<tr><td><code>pentol ← pentol + 2</code></td><td>Ditambah 2 pentol lagi</td><td class="num">7</td></tr>
<tr><td><code>pentol ← pentol − 3</code></td><td>Dimakan 3 pentol</td><td class="num">4</td></tr>
<tr><td><code>pentol ← 10</code></td><td>Isi lama diganti dengan 10 pentol</td><td class="num">10</td></tr>
</tbody></table></div>
<p>Satu variabel hanya menyimpan <b>satu nilai</b> pada satu waktu. Nilai baru <b>menggantikan</b> nilai lama.</p>
<div data-widget="mangkok"></div>

<h3>Aturan memberi nama variabel</h3>
<ul class="cek">
  <li>Gunakan nama yang jelas, misalnya <code>nyawa</code>, <code>skor</code>, atau <code>hargaBakso</code>.</li>
  <li>Jangan memakai spasi. Tulis <code>hargaBakso</code>, bukan <code>harga bakso</code>.</li>
  <li>Jangan diawali angka atau memakai simbol aneh. <code>3pentol</code> dan <code>pentol@</code> tidak boleh.</li>
</ul>

<h3>Peran variabel di flowchart</h3>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Simbol</th><th>Yang terjadi pada variabel</th><th>Contoh</th></tr></thead>
<tbody>
<tr><td>Jajar genjang (input)</td><td><b>Diisi</b> oleh pengguna</td><td><code>Masukkan nama</code></td></tr>
<tr><td>Persegi panjang (proses)</td><td><b>Diisi atau diubah</b></td><td><code>waktu ← waktu − 1</code></td></tr>
<tr><td>Belah ketupat (keputusan)</td><td><b>Diperiksa</b> dan nilainya tidak berubah</td><td><code>nyawa == 0?</code></td></tr>
<tr><td>Jajar genjang (output)</td><td><b>Ditampilkan</b> isinya</td><td><code>Tampilkan nama</code></td></tr>
</tbody></table></div>

<h3>Tabel penelusuran</h3>
<p>Untuk mengetahui hasil sebuah algoritma, kita <b>menelusuri</b> langkahnya satu per satu dan mencatat isi variabel di sebuah tabel.</p>
<pre class="kode">mangkok ← 2
pentol ← mangkok × 4
pentol ← pentol + 1
Tampilkan pentol</pre>
<div class="tabel-wrap"><table class="tabel sempit">
<thead><tr><th>Langkah</th><th>mangkok</th><th>pentol</th></tr></thead>
<tbody>
<tr><td>1</td><td class="num">2</td><td class="num">–</td></tr>
<tr><td>2</td><td class="num">2</td><td class="num">8</td></tr>
<tr><td>3</td><td class="num">2</td><td class="num">9</td></tr>
<tr><td>4</td><td colspan="2">Layar menampilkan <b>9</b></td></tr>
</tbody></table></div>
`
},
{
  id: "flowchart",
  judul: "Algoritma dan Flowchart",
  ringkas: "Menyusun algoritma dengan simbol flowchart.",
  tp: "1.2",
  isi: `
<p class="lead"><b>Algoritma</b> adalah langkah-langkah runtut untuk menyelesaikan masalah. Algoritma bisa digambar sebagai <b>flowchart</b> (diagram alir) dengan simbol dan anak panah, dibaca dari <i>Mulai</i> sampai <i>Selesai</i>.</p>

<h3>Simbol flowchart</h3>
<div data-widget="simbol"></div>

<h3>Tiga jenis flowchart</h3>
<div class="tiga-kolom">
  <figure class="fc-card">
    <img src="img/materi6_fc_urut.png" alt="Flowchart urut">
    <figcaption><b>Urut (sekuensial)</b>: langkah dijalankan satu per satu dari atas ke bawah.</figcaption>
  </figure>
  <figure class="fc-card">
    <img src="img/materi6_fc_cabang.png" alt="Flowchart percabangan">
    <figcaption><b>Percabangan</b>: ada keputusan Ya/Tidak, dan hanya satu jalur yang dijalankan.</figcaption>
  </figure>
  <figure class="fc-card">
    <img src="img/materi6_fc_ulang.png" alt="Flowchart perulangan">
    <figcaption><b>Perulangan</b>: anak panah kembali ke atas sampai syaratnya terpenuhi. Hasilnya: 1 2 3.</figcaption>
  </figure>
</div>

<div class="ingat"><b>Urutan yang benar:</b> input → proses → output. Hasil tidak bisa ditampilkan sebelum dihitung.</div>
`
},
{
  id: "percabangan",
  judul: "Percabangan",
  ringkas: "JIKA, ATAU JIKA, JIKA TIDAK serta AND, OR, NOT.",
  tp: "1.2 & 1.3",
  isi: `
<p class="lead">Percabangan membuat program bisa <b>memilih</b> tindakan berdasarkan syarat. Hasil sebuah syarat hanya dua: <b>benar</b> atau <b>salah</b>.</p>

<h3>JIKA – ATAU JIKA – JIKA TIDAK</h3>
<p>Jika pilihannya lebih dari dua, kita memakai <b>ATAU JIKA</b>. Contoh: penjual bakso menentukan ukuran mangkok dari banyaknya pentol yang dipesan.</p>
<pre class="kode">JIKA pentol >= 10        MAKA pakai mangkok besar
ATAU JIKA pentol >= 5    MAKA pakai mangkok sedang
JIKA TIDAK               pakai mangkok kecil</pre>
<div class="analogi">
  <div class="analogi-label">Cara mesin membaca</div>
  <p>Mesin memeriksa syarat <b>dari atas ke bawah</b>. Begitu menemukan syarat yang benar, mesin <b>langsung berhenti</b> dan tidak memeriksa syarat di bawahnya. Pesanan 12 pentol langsung mendapat mangkok besar.</p>
</div>
<div class="ingat"><b>Jebakan urutan:</b> jika <code>pentol >= 5</code> ditulis paling atas, pesanan 12 pentol akan mendapat mangkok sedang karena syarat itu sudah benar lebih dulu. Letakkan syarat yang paling ketat di atas.</div>

<h3>Operator perbandingan</h3>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Operator</th><th>Artinya</th><th>Contoh</th></tr></thead>
<tbody>
<tr><td><code>&gt;</code></td><td>lebih dari</td><td><code>pentol &gt; 10</code>: 10 pentol <b>tidak</b> lolos</td></tr>
<tr><td><code>&gt;=</code></td><td>lebih dari atau sama dengan (minimal)</td><td><code>pentol &gt;= 10</code>: 10 pentol <b>lolos</b></td></tr>
<tr><td><code>&lt;</code></td><td>kurang dari</td><td><code>3 &lt; 8</code> benar</td></tr>
<tr><td><code>&lt;=</code></td><td>kurang dari atau sama dengan (maksimal)</td><td><code>harga &lt;= 10000</code></td></tr>
<tr><td><code>==</code></td><td>sama dengan</td><td><code>kuah == "pedas"</code></td></tr>
<tr><td><code>!=</code></td><td>tidak sama dengan</td><td><code>7 != 9</code> benar</td></tr>
</tbody></table></div>
<div data-widget="operator"></div>

<h3>Operator logika AND, OR, NOT</h3>
<div class="tiga-kolom">
  <div class="kartu-konsep"><div class="tag">AND</div><p>Benar jika <b>semua</b> syarat benar.</p><p class="contoh"><code>(pentol &gt; 5) AND (kuah == "pedas")</code></p></div>
  <div class="kartu-konsep"><div class="tag">OR</div><p>Benar jika <b>minimal satu</b> syarat benar.</p><p class="contoh"><code>(tahu == "ada") OR (siomay == "ada")</code></p></div>
  <div class="kartu-konsep"><div class="tag">NOT</div><p><b>Membalik</b> nilai: benar menjadi salah, salah menjadi benar.</p><p class="contoh"><code>NOT pedas</code> artinya tidak pedas.</p></div>
</div>
<div data-widget="logika" data-not="1"></div>
`
},
{
  id: "perulangan",
  judul: "Perulangan (Loop)",
  ringkas: "FOR, WHILE, DO-WHILE, dan nested loop.",
  tp: "1.2 & 1.3",
  isi: `
<p class="lead">Perulangan membuat komputer mengulang perintah yang sama tanpa harus menuliskannya berkali-kali.</p>

<h3>Tiga hal yang dibutuhkan setiap perulangan</h3>
<ul class="cek">
  <li><b>Titik awal</b>: mulai dari angka berapa.</li>
  <li><b>Syarat berhenti</b>: kapan perulangan selesai. Tanpa syarat ini terjadi <i>infinite loop</i> (perulangan tak pernah berhenti).</li>
  <li><b>Langkah</b>: bertambah atau berkurang berapa setiap putaran.</li>
</ul>

<h3>Jenis-jenis perulangan</h3>
<div class="loop-grid">
  <div class="kartu-konsep">
    <div class="tag">FOR</div>
    <p>Dipakai jika <b>jumlah pengulangannya sudah pasti</b>.</p>
    <p class="contoh">Memasukkan 5 pentol ke mangkok satu per satu.</p>
<pre class="kode">for (i = 1; i &lt;= 5; i = i + 1) {
      masukkanPentol()
}</pre>
  </div>
  <div class="kartu-konsep">
    <div class="tag">WHILE</div>
    <p>Mengulang <b>selama</b> syarat benar. Syarat diperiksa <b>di awal</b>.</p>
    <p class="contoh">Makan bakso selama pentol di mangkok masih ada.</p>
<pre class="kode">while (pentol &gt; 0) {
      pentol ← pentol − 1
}</pre>
  </div>
  <div class="kartu-konsep">
    <div class="tag">DO-WHILE</div>
    <p>Dikerjakan <b>minimal sekali</b>, lalu syarat diperiksa <b>di akhir</b>.</p>
    <p class="contoh">Cicipi kuah dulu, lalu tambah garam selama rasanya belum pas.</p>
<pre class="kode">do {
      cicipiKuah()
} while (rasa != "pas")</pre>
  </div>
  <div class="kartu-konsep">
    <div class="tag">NESTED LOOP</div>
    <p>Perulangan <b>di dalam</b> perulangan. Loop luar mengatur baris, loop dalam mengatur isi setiap baris.</p>
    <p class="contoh">Menyiapkan 3 mangkok, setiap mangkok diisi 4 pentol. Totalnya 3 × 4 = 12 pentol.</p>
<pre class="kode">for (m = 1; m &lt;= 3; m = m + 1) {
      for (p = 1; p &lt;= 4; p = p + 1) {
            masukkanPentol()
      }
}</pre>
  </div>
</div>

<h3>Coba sendiri: perulangan FOR</h3>
<div data-widget="loop"></div>

<div class="ingat"><b>Awas infinite loop!</b> <code>while (pentol &gt; 0) { pentol ← pentol + 1 }</code> tidak akan pernah berhenti karena pentol terus bertambah. Seharusnya pentol dikurangi.</div>
`
},
{
  id: "eksperimen",
  judul: "Uji Coba dan Memperbaiki",
  ringkas: "Menjalankan rancangan solusi dan menemukan kesalahan.",
  tp: "1.3",
  isi: `
<p class="lead">Rancangan solusi (algoritma atau flowchart) perlu <b>diuji coba</b> sebelum dipakai. Caranya: jalankan langkahnya dengan beberapa nilai, catat isi variabel, lalu lihat apakah hasilnya sesuai harapan.</p>

<h3>Tips uji coba</h3>
<ul class="cek">
  <li>Uji dengan nilai biasa, misalnya 7 pentol.</li>
  <li>Uji dengan nilai <b>batas</b>, misalnya tepat 10 jika syaratnya <code>pentol &gt;= 10</code>.</li>
  <li>Uji dengan nilai yang tidak memenuhi syarat, misalnya 0.</li>
  <li>Catat perubahan variabel di <b>tabel penelusuran</b>.</li>
</ul>

<h3>Kesalahan yang sering terjadi</h3>
<div class="tabel-wrap"><table class="tabel">
<thead><tr><th>Kesalahan</th><th>Akibatnya</th><th>Perbaikan</th></tr></thead>
<tbody>
<tr><td>Lupa memberi nilai awal</td><td>Hasil penjumlahan kacau</td><td>Tulis <code>jumlah ← 0</code> sebelum perulangan</td></tr>
<tr><td>Langkah perulangan salah arah</td><td>Infinite loop</td><td>Pastikan nilainya bergerak menuju syarat berhenti</td></tr>
<tr><td>Batas syarat kurang tepat</td><td>Nilai batas tidak ikut</td><td>Ganti <code>&lt;</code> menjadi <code>&lt;=</code> atau <code>&gt;</code> menjadi <code>&gt;=</code></td></tr>
<tr><td>Urutan ATAU JIKA terbalik</td><td>Pilihan yang muncul salah</td><td>Letakkan syarat paling ketat di atas</td></tr>
<tr><td>Urutan langkah salah</td><td>Output muncul sebelum dihitung</td><td>Ikuti urutan input → proses → output</td></tr>
<tr><td>Simbol salah</td><td>Flowchart membingungkan</td><td>Input/output memakai jajar genjang, pertanyaan memakai belah ketupat</td></tr>
</tbody></table></div>
`
},
{
  id: "data",
  judul: "Data untuk Mengambil Keputusan",
  ringkas: "Membaca diagram, tabel, dan piktogram lalu memutuskan.",
  tp: "2.3",
  isi: `
<p class="lead">Data adalah kumpulan fakta, misalnya banyak mangkok bakso yang terjual setiap hari. Data yang disajikan dengan rapi bisa kita pakai untuk <b>menjawab pertanyaan</b> dan <b>mengambil keputusan</b>.</p>

<div class="analogi">
  <div class="analogi-label">Ibaratnya</div>
  <p>Penjual bakso yang mencatat penjualannya tidak perlu menebak. Dari catatannya ia tahu kapan harus membuat <b>lebih banyak</b> pentol dan kapan cukup sedikit, sehingga bakso tidak bersisa.</p>
</div>

<h3>Tiga cara menyajikan data</h3>
<div class="tiga-kolom">
  <div class="kartu-konsep"><div class="tag">Tabel</div><p>Data ditulis dalam baris dan kolom. Cocok untuk membandingkan beberapa hal sekaligus.</p></div>
  <div class="kartu-konsep"><div class="tag">Diagram batang</div><p>Tinggi batang menunjukkan besar data. Batang tertinggi berarti data terbesar.</p></div>
  <div class="kartu-konsep"><div class="tag">Piktogram</div><p>Data digambar dengan ikon. Selalu lihat <b>keterangan</b>-nya, misalnya 1 ikon = 5 mangkok.</p></div>
</div>

<h3>Langkah membaca data</h3>
<ol class="langkah">
  <li>Baca <b>judul</b>: data tentang apa?</li>
  <li>Baca <b>satuan</b> dan <b>keterangan</b>: porsi, kg, siswa, atau 1 ikon mewakili berapa.</li>
  <li>Cari nilai yang ditanyakan, lalu hitung bila perlu: jumlah, selisih, terbanyak, atau tersedikit.</li>
</ol>

<h3>Dari data ke keputusan</h3>
<p>Keputusan yang baik memakai <b>data</b> dan <b>aturan</b> yang jelas. Aturannya sering memakai operator yang sudah kamu pelajari di bab percabangan.</p>
<pre class="kode">JIKA penjualan >= 25 MAKA tambah persediaan pentol
JIKA TIDAK persediaan tetap</pre>
<div class="ingat"><b>Awas jebakan batas!</b> "Lebih dari 25" ditulis <code>&gt; 25</code>, jadi 25 tidak termasuk. "Minimal 25" ditulis <code>&gt;= 25</code>, jadi 25 termasuk.</div>
<div data-widget="data"></div>

<div class="ingat"><b>Ingat!</b> Keputusan diambil dari data, bukan tebakan. Kalau data menunjukkan suatu barang selalu bersisa, persediaannya dikurangi. Kalau selalu habis, persediaannya ditambah.</div>
`
}
];
