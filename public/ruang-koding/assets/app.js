(function () {
  "use strict";
  var M = window.MATERI || {}, LT = window.LATIHAN || {};
  var app = document.getElementById("app");
  var LEVEL = { L1: "Pemahaman", L2: "Aplikasi", L3: "Penalaran" };
  var state = { kelas: null, tab: "materi", bab: null, butir: null, acak: null };

  /* ---------- storage (aman) ---------- */
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  var answers = { 4: load("rk-jawab-4", {}), 6: load("rk-jawab-6", {}) };
  function setAns(no, idx) { answers[state.kelas][no] = idx; save("rk-jawab-" + state.kelas, answers[state.kelas]); }

  /* ---------- util ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function h(tag, attrs, html) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "on") Object.keys(attrs.on).forEach(function (ev) { el.addEventListener(ev, attrs.on[ev]); });
      else if (k === "class") el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    if (html != null) el.innerHTML = html;
    return el;
  }
  function data() { return LT[state.kelas]; }
  function allSoal(k) {
    var d = LT[k], out = [];
    d.urutan.forEach(function (b) { d.latihan[b].soal.forEach(function (q) { out.push({ q: q, butir: b }); }); });
    return out;
  }
  function tpOfButir(b) {
    var d = data(), r = null;
    d.tp.forEach(function (t) { t.ipk.forEach(function (i) { if (i.items.indexOf(b) >= 0) r = { tp: t, ipk: i }; }); });
    return r;
  }

  /* ---------- routing (#k4-materi-algoritma, #k6-latihan-b12, #k4-kisi, #k6-acak) ---------- */
  function hashFor() {
    if (!state.kelas) return "";
    var s = "k" + state.kelas + "-" + state.tab;
    if (state.tab === "materi" && state.bab) s += "-" + state.bab;
    if (state.tab === "latihan" && state.butir) s += "-b" + state.butir;
    return s;
  }
  function go(patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    try { history.replaceState(null, "", hashFor() ? "#" + hashFor() : location.pathname); } catch (e) { /* abaikan */ }
    render();
    window.scrollTo({ top: 0 });
  }
  function readHash() {
    var m = /^#k(4|6)-(materi|kisi|latihan|acak)(?:-(.+))?$/.exec(location.hash || "");
    if (!m) return;
    state.kelas = +m[1]; state.tab = m[2];
    if (m[2] === "materi" && m[3]) state.bab = m[3];
    if (m[2] === "latihan" && m[3] && /^b\d+$/.test(m[3])) state.butir = +m[3].slice(1);
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var savedTheme = load("rk-tema", null);
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  function toggleTheme() {
    var dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    var t = dark ? "light" : "dark";
    root.setAttribute("data-theme", t); save("rk-tema", t);
  }

  /* ---------- icons: simbol flowchart sebagai penanda ---------- */
  var ICON = {
    materi: '<svg viewBox="0 0 22 16" aria-hidden="true"><rect x="1.5" y="2" width="19" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    kisi: '<svg viewBox="0 0 22 16" aria-hidden="true"><path d="M6 2h15l-5 12H1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    latihan: '<svg viewBox="0 0 22 16" aria-hidden="true"><path d="M11 1l9 7-9 7-9-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    acak: '<svg viewBox="0 0 22 16" aria-hidden="true"><ellipse cx="11" cy="8" rx="9.5" ry="6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    mark: '<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true"><rect x="1" y="1" width="32" height="32" rx="8" fill="var(--primary)"/><path d="M17 7l8 6-8 6-8-6z" fill="var(--accent)"/><rect x="11" y="22" width="12" height="6" rx="1.5" fill="var(--primary-ink)"/></svg>'
  };

  /* ---------- layout ---------- */
  function topbar() {
    var bar = h("header", { class: "topbar" });
    var w = h("div", { class: "wrap" });
    var brand = h("a", { class: "brand", href: "#", on: { click: function (e) { e.preventDefault(); go({ kelas: null, bab: null, butir: null }); } } },
      ICON.mark + '<span><b>Ruang Koding</b><small>MIN 1 Kota Malang</small></span>');
    w.appendChild(brand);
    if (state.kelas) {
      var sw = h("div", { class: "kelas-switch", role: "group", "aria-label": "Pilih kelas" });
      [4, 6].forEach(function (k) {
        sw.appendChild(h("button", { "aria-pressed": String(state.kelas === k), on: { click: function () { go({ kelas: k, bab: null, butir: null, acak: null }); } } }, "Kelas " + k));
      });
      w.appendChild(sw);
    }
    w.appendChild(h("button", { class: "theme-btn", "aria-label": "Ganti tema terang/gelap", on: { click: toggleTheme } }, ICON.moon));
    bar.appendChild(w);
    if (state.kelas) {
      var tabs = h("nav", { class: "tabs", "aria-label": "Menu" });
      var tw = h("div", { class: "wrap", role: "tablist" });
      [["materi", "Materi"], ["kisi", "Kisi-kisi"], ["latihan", "Latihan Soal"], ["acak", "Latihan Acak"]].forEach(function (t) {
        tw.appendChild(h("button", { class: "tab", role: "tab", "aria-selected": String(state.tab === t[0]), on: { click: function () { go({ tab: t[0], acak: null }); } } }, ICON[t[0]] + t[1]));
      });
      tabs.appendChild(tw); bar.appendChild(tabs);
    }
    return bar;
  }
  function footer() {
    return h("footer", { class: "foot" }, '<div class="wrap">Ruang Koding · Materi, kisi-kisi, dan latihan Sumatif Akhir Semester Koding · MIN 1 Kota Malang · Tahun Ajaran 2026/2027</div>');
  }

  function render() {
    app.innerHTML = "";
    app.appendChild(topbar());
    var main = h("main", { class: "wrap", id: "isi" });
    if (!state.kelas) main.appendChild(landing());
    else if (state.tab === "materi") main.appendChild(viewMateri());
    else if (state.tab === "kisi") main.appendChild(viewKisi());
    else if (state.tab === "latihan") main.appendChild(viewLatihan());
    else main.appendChild(viewAcak());
    app.appendChild(main);
    app.appendChild(footer());
    var t = state.kelas ? ({ materi: "Materi", kisi: "Kisi-kisi", latihan: "Latihan Soal", acak: "Latihan Acak" }[state.tab] + " Kelas " + state.kelas + " · Ruang Koding") : "Ruang Koding";
    document.title = t;
  }

  /* ---------- landing ---------- */
  function landing() {
    var s = h("section", { class: "landing" });
    s.innerHTML = '<div class="landing-head"><div class="eyebrow">Koding · Semester 1 · 2026/2027</div>' +
      '<h1>Belajar koding langkah demi langkah</h1>' +
      '<p>Pelajari materinya, lihat kisi-kisinya, lalu berlatih soal lengkap dengan pembahasan. Mulai dengan memilih kelasmu.</p></div>';
    var pick = h("div", { class: "fc-picker", "aria-label": "Pilih kelas" });
    pick.innerHTML = '<div class="fc-node fc-oval">Mulai</div><div class="fc-line"></div><div class="fc-node fc-diamond"><span>Kamu kelas<br>berapa?</span></div>';
    var br = h("div", { class: "fc-branch" });
    var info = {
      4: { judul: "Algoritma, Flowchart, dan Percabangan", isi: ["Algoritma dan robot di petak", "Simbol dan cara membaca flowchart", "Percabangan dengan > < >= <= == != AND OR", "Menguji dan memperbaiki program"] },
      6: { judul: "Variabel, Percabangan, Perulangan, dan Data", isi: ["Pemecahan masalah sistematis", "Variabel dan tabel penelusuran", "JIKA – ATAU JIKA – JIKA TIDAK, AND OR NOT", "FOR, WHILE, DO-WHILE, nested loop", "Membaca data untuk mengambil keputusan"] }
    };
    [4, 6].forEach(function (k) {
      var d = h("div");
      d.appendChild(h("span", { class: "lbl" }, k === 4 ? "4" : "6"));
      var b = h("button", { class: "kelas-card", on: { click: function () { go({ kelas: k, tab: "materi", bab: null }); } } },
        '<span class="num">Kelas ' + k + '</span><h2>' + info[k].judul + '</h2><ul>' + info[k].isi.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
        '</ul><span class="go">Masuk kelas ' + k + ' →</span>');
      d.appendChild(b); br.appendChild(d);
    });
    pick.appendChild(br); s.appendChild(pick);
    s.appendChild(h("div", { class: "landing-foot" },
      '<div><b>Materi</b><p>Penjelasan singkat dengan contoh sehari-hari dan alat coba-coba.</p></div>' +
      '<div><b>Kisi-kisi</b><p>Tujuan pembelajaran dan indikator yang diujikan saat SAS.</p></div>' +
      '<div><b>Latihan Soal</b><p>175 soal per kelas. Jawabanmu langsung diperiksa dan ada pembahasannya.</p></div>'));
    return s;
  }

  /* ---------- materi ---------- */
  function viewMateri() {
    var list = M[state.kelas];
    var bab = list.filter(function (b) { return b.id === state.bab; })[0] || list[0];
    var idx = list.indexOf(bab);
    var w = h("div", { class: "work" });
    var side = h("nav", { class: "side", "aria-label": "Daftar materi" });
    side.appendChild(h("div", { class: "side-title" }, "Materi Kelas " + state.kelas));
    list.forEach(function (b, i) {
      side.appendChild(h("button", { class: "side-item", "aria-current": String(b === bab), on: { click: function () { go({ bab: b.id }); } } },
        '<span class="n">' + (i + 1) + '</span><span><b>' + esc(b.judul) + '</b><small>' + esc(b.ringkas) + '</small></span>'));
    });
    var art = h("article", { class: "sheet" });
    art.innerHTML = '<div class="sheet-head"><span class="badge"><span class="pill">Bab ' + (idx + 1) + '</span><span class="pill">TP ' + esc(bab.tp) + '</span></span><h2>' + esc(bab.judul) +
      '</h2><p>' + esc(bab.ringkas) + '</p></div><div class="prose">' + bab.isi + '</div>';
    var nr = h("div", { class: "next-row" });
    if (idx > 0) nr.appendChild(h("button", { class: "btn", on: { click: function () { go({ bab: list[idx - 1].id }); } } }, "← " + esc(list[idx - 1].judul)));
    else nr.appendChild(h("span"));
    if (idx < list.length - 1) nr.appendChild(h("button", { class: "btn primary", on: { click: function () { go({ bab: list[idx + 1].id }); } } }, esc(list[idx + 1].judul) + " →"));
    else nr.appendChild(h("button", { class: "btn primary", on: { click: function () { go({ tab: "latihan", butir: null }); } } }, "Mulai latihan soal →"));
    art.appendChild(nr);
    w.appendChild(side); w.appendChild(art);
    art.querySelectorAll("[data-widget]").forEach(mountWidget);
    return w;
  }

  /* ---------- kisi-kisi ---------- */
  function viewKisi() {
    var d = data(), s = h("section", { style: "padding-block:24px 64px" });
    var levels = { L1: 0, L2: 0, L3: 0 };
    Object.keys(d.indikator).forEach(function (n) { levels[d.indikator[n].level]++; });
    s.appendChild(h("div", { class: "intro-card" },
      '<div class="eyebrow">Kisi-kisi SAS · Kelas ' + state.kelas + '</div><h2>Apa saja yang diujikan?</h2>' +
      '<p>Soal SAS berjumlah 35: 25 pilihan ganda (PG) dan 10 benar-salah (BS). Setiap butir di bawah ini punya 5 soal latihan. Tekan <b>Latihan</b> untuk mencobanya.</p>' +
      '<div class="legend"><span><span class="lvl L1">L1</span> Pemahaman (' + levels.L1 + ' butir)</span><span><span class="lvl L2">L2</span> Aplikasi (' + levels.L2 +
      ' butir)</span><span><span class="lvl L3">L3</span> Penalaran (' + levels.L3 + ' butir)</span></div>'));
    d.tp.forEach(function (t) {
      var blk = h("div", { class: "tp-block" });
      blk.appendChild(h("div", { class: "tp-head" }, '<span class="el">' + esc(t.elemen) + ' · TP ' + esc(t.no) + '</span><h3>' + esc(t.teks) + '</h3>'));
      t.ipk.forEach(function (i) {
        var ip = h("div", { class: "ipk" });
        ip.appendChild(h("div", { class: "ipk-title" }, '<span>' + esc(i.no) + '</span>' + esc(i.teks)));
        i.items.forEach(function (n) {
          var ind = d.indikator[n];
          var row = h("div", { class: "ind-row" }, '<span class="bn">Butir ' + n + '</span><p>' + esc(ind.teks) + '</p><span class="lvl ' + ind.level + '" title="' + LEVEL[ind.level] + '">' + ind.level + '</span>');
          row.appendChild(h("button", { class: "btn", on: { click: function () { go({ tab: "latihan", butir: n }); } } }, "Latihan →"));
          ip.appendChild(row);
        });
        blk.appendChild(ip);
      });
      s.appendChild(blk);
    });
    return s;
  }

  /* ---------- latihan ---------- */
  function scoreOf(list) {
    var a = answers[state.kelas], done = 0, ok = 0;
    list.forEach(function (x) { if (a[x.q.no] != null) { done++; if (a[x.q.no] === x.q.kunci) ok++; } });
    return { done: done, ok: ok, total: list.length };
  }
  function scoreBar(list, extra) {
    var s = scoreOf(list);
    var bar = h("div", { class: "score-bar" },
      '<div class="stat"><b>' + s.done + '/' + s.total + '</b><small>soal dijawab</small></div>' +
      '<div class="stat"><b>' + s.ok + '</b><small>jawaban tepat</small></div>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + s.total + '" aria-valuenow="' + s.ok + '"><i style="width:' + (s.total ? s.ok / s.total * 100 : 0) + '%"></i></div>');
    if (extra) bar.appendChild(extra);
    return bar;
  }
  function renderParts(parts, wrap) {
    parts.forEach(function (p) {
      if (p.t != null) wrap.appendChild(h("p", null, esc(p.t)));
      else if (p.code != null) wrap.appendChild(h("pre", { class: "q-code" }, esc(p.code)));
      else if (p.img) {
        var f = h("div", { class: "qimg", style: "max-width:" + Math.max(p.w + 18, 160) + "px" });
        f.appendChild(h("img", { src: p.img, alt: "Gambar soal", loading: "lazy" }));
        wrap.appendChild(f);
      }
    });
  }
  function mainStore() {
    return { get: function (no) { return answers[state.kelas][no]; }, set: setAns };
  }
  function qCard(q, onAnswer, store) {
    store = store || mainStore();
    var card = h("div", { class: "q", id: "soal-" + q.no });
    card.appendChild(h("div", { class: "q-top" }, '<span class="q-no">' + q.no + '</span><span class="q-type">' + (q.tipe === "pg" ? "Pilihan ganda" : "Benar atau salah") + '</span>'));
    var st = h("div", { class: "q-stem" }); renderParts(q.stem, st); card.appendChild(st);
    var opts = h("div", { class: "opts" + (q.tipe === "bs" ? " bs" : "") });
    var fb = h("div");
    function paint() {
      var chosen = store.get(q.no);
      opts.innerHTML = "";
      q.opsi.forEach(function (o, i) {
        var L = q.tipe === "pg" ? "ABCD"[i] : (i === 0 ? "B" : "S");
        var cls = "opt";
        if (chosen != null) {
          if (i === q.kunci) cls += " benar";
          else if (i === chosen) cls += " salah";
          else cls += " redup";
        }
        var b = h("button", { class: cls, on: { click: function () { store.set(q.no, i); paint(); if (onAnswer) onAnswer(); } } }, '<span class="L">' + L + '</span><span>' + esc(o) + '</span>');
        if (chosen != null) b.disabled = true;
        opts.appendChild(b);
      });
      fb.innerHTML = "";
      if (chosen != null) {
        var ok = chosen === q.kunci;
        var kunciTxt = q.tipe === "pg" ? "ABCD"[q.kunci] + ". " + q.opsi[q.kunci] : q.opsi[q.kunci];
        fb.className = "feedback " + (ok ? "ok" : "bad");
        fb.innerHTML = "<b>" + (ok ? "Tepat!" : "Belum tepat. Jawaban yang benar: " + esc(kunciTxt)) + '</b><span class="pemb-label">Pembahasan</span><p>' + esc(q.pemb) + "</p>";
      } else fb.className = "";
    }
    paint();
    card.appendChild(opts); card.appendChild(fb);
    return card;
  }
  function viewLatihan() {
    var d = data();
    var butir = state.butir && d.latihan[state.butir] ? state.butir : d.urutan[0];
    var w = h("div", { class: "work" });
    var side = h("nav", { class: "side", "aria-label": "Daftar butir latihan" });
    var a = answers[state.kelas];
    d.tp.forEach(function (t) {
      var g = h("div", { class: "side-group" });
      g.appendChild(h("div", { class: "side-title" }, "TP " + esc(t.no)));
      t.ipk.forEach(function (i) {
        i.items.forEach(function (n) {
          var L = d.latihan[n], dots = L.soal.map(function (q) { var c = a[q.no]; return "<i class='" + (c == null ? "" : (c === q.kunci ? "ok" : "bad")) + "'></i>"; }).join("");
          g.appendChild(h("button", { class: "side-item", "aria-current": String(n === butir), on: { click: function () { go({ butir: n }); } } },
            '<span class="n">' + n + '</span><span><b>Butir ' + n + ' · ' + d.indikator[n].bentuk + '</b><small>' + esc(shortInd(d.indikator[n].teks)) + '</small><span class="dots">' + dots + '</span></span>'));
        });
      });
      side.appendChild(g);
    });
    var main = h("section", { style: "min-width:0" });
    var all = allSoal(state.kelas);
    var reset = h("button", { class: "btn ghost", on: { click: function () { d.latihan[butir].soal.forEach(function (q) { delete answers[state.kelas][q.no]; }); save("rk-jawab-" + state.kelas, answers[state.kelas]); render(); } } }, "Ulangi butir ini");
    main.appendChild(scoreBar(all, reset));
    var L = d.latihan[butir], ind = d.indikator[butir], loc = tpOfButir(butir);
    main.appendChild(h("div", { class: "butir-head" },
      '<span class="badge"><span class="pill">TP ' + esc(loc.tp.no) + '</span><span class="pill">' + (ind.bentuk === "PG" ? "Pilihan ganda" : "Benar-salah") +
      '</span><span class="lvl ' + ind.level + '">' + ind.level + ' · ' + LEVEL[ind.level] + '</span></span><h2>Butir ' + butir + '</h2><p class="ind">' + esc(ind.teks) + '.</p>'));
    if (L.stim.length) { var stim = h("div", { class: "stim" }); renderParts(L.stim, stim); main.appendChild(stim); }
    var ql = h("div", { class: "qlist" });
    function refreshSide() { var keep = window.scrollY; render(); window.scrollTo({ top: keep }); }
    L.soal.forEach(function (q) { ql.appendChild(qCard(q, refreshSide)); });
    main.appendChild(ql);
    var pos = d.urutan.indexOf(butir), nav = h("div", { class: "butir-nav" });
    nav.appendChild(pos > 0 ? h("button", { class: "btn", on: { click: function () { go({ butir: d.urutan[pos - 1] }); } } }, "← Butir " + d.urutan[pos - 1]) : h("span"));
    nav.appendChild(pos < d.urutan.length - 1 ? h("button", { class: "btn primary", on: { click: function () { go({ butir: d.urutan[pos + 1] }); } } }, "Butir " + d.urutan[pos + 1] + " →")
      : h("button", { class: "btn primary", on: { click: function () { go({ tab: "acak" }); } } }, "Coba latihan acak →"));
    main.appendChild(nav);
    w.appendChild(side); w.appendChild(main);
    return w;
  }
  function shortInd(t) {
    t = t.replace(/^Disajikan [^,]+, /, "").replace(/^[Pp]eserta didik dapat /, "");
    t = t.charAt(0).toUpperCase() + t.slice(1);
    return t.length > 70 ? t.slice(0, 68) + "…" : t;
  }

  /* ---------- latihan acak ---------- */
  function viewAcak() {
    var s = h("section", { style: "padding-block:24px 64px; max-width:860px" });
    if (!state.acak) {
      var pool = allSoal(state.kelas).slice();
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      state.acak = { list: pool.slice(0, 10), jawab: {} };
    }
    var A = state.acak;
    s.appendChild(h("div", { class: "intro-card" }, '<div class="eyebrow">Latihan acak · Kelas ' + state.kelas + '</div><h2>10 soal acak dari semua butir</h2><p>Cocok untuk persiapan SAS. Jawaban di sini tidak memengaruhi catatan latihan per butir.</p>'));
    var store = { get: function (no) { return A.jawab[no]; }, set: function (no, i) { A.jawab[no] = i; } };
    var ql = h("div", { class: "qlist" });
    var hasil = h("div");
    function upd() {
      var done = 0, ok = 0;
      A.list.forEach(function (x) { if (A.jawab[x.q.no] != null) { done++; if (A.jawab[x.q.no] === x.q.kunci) ok++; } });
      hasil.innerHTML = "";
      if (done === A.list.length) {
        hasil.className = "hasil-acak";
        hasil.innerHTML = "<span class='pemb-label'>Hasil</span><b>" + ok + " dari " + A.list.length + " benar · nilai " + ok * 10 + "</b><p>" +
          (ok >= 8 ? "Bagus sekali! Pertahankan." : ok >= 6 ? "Sudah baik. Baca lagi pembahasan soal yang belum tepat." : "Pelajari lagi materinya, lalu coba lagi.") + "</p>";
        hasil.appendChild(h("button", { class: "btn primary", on: { click: function () { state.acak = null; render(); window.scrollTo({ top: 0 }); } } }, "Acak 10 soal baru"));
      } else { hasil.className = "empty-note"; hasil.textContent = "Terjawab " + done + " dari " + A.list.length + " soal."; }
    }
    A.list.forEach(function (x, k) {
      var card = qCard(x.q, upd, store);
      card.querySelector(".q-no").textContent = (k + 1) + "/10";
      card.querySelector(".q-type").textContent += " · butir " + x.butir + " (soal " + x.q.no + ")";
      ql.appendChild(card);
    });
    s.appendChild(ql); s.appendChild(hasil);
    upd();
    return s;
  }
  /* ---------- widgets ---------- */
  function mountWidget(el) {
    var k = el.getAttribute("data-widget");
    ({ simbol: wSimbol, robot: wRobot, operator: wOperator, logika: wLogika, mangkok: wMangkok, loop: wLoop, data: wData }[k] || function () {})(el);
  }
  function wSimbol(el) {
    var A = '<line class="a" x1="6" y1="22" x2="70" y2="22"/><path class="ah" d="M78 22l-10-6v12z"/>';
    var rows = [
      ['<ellipse class="s" cx="42" cy="22" rx="36" ry="17"/>', "Oval (terminator)", "Menandai <b>Mulai</b> dan <b>Selesai</b>."],
      ['<path class="s" d="M18 6h62l-14 32H4z"/>', "Jajar genjang (input/output)", "Memasukkan atau menampilkan data, misalnya <code>Masukkan nilai</code> atau <code>Tampilkan hasil</code>."],
      ['<rect class="s" x="6" y="6" width="72" height="32" rx="2"/>', "Persegi panjang (proses)", "Kegiatan atau perhitungan, misalnya <code>Aduk teh</code> atau <code>skor ← skor + 1</code>."],
      ['<path class="s" d="M42 3l38 19-38 19L4 22z"/>', "Belah ketupat (keputusan)", "Pertanyaan yang dijawab <b>Ya</b> atau <b>Tidak</b>, misalnya <code>Lapar?</code>."],
      [A, "Anak panah (garis alir)", "Menunjukkan arah urutan langkah."]
    ];
    var box = h("div", { class: "simbol-list" });
    rows.forEach(function (r) { box.appendChild(h("div", { class: "simbol-row" }, '<svg viewBox="0 0 84 44" aria-hidden="true">' + r[0] + '</svg><div><b>' + r[1] + '</b><p>' + r[2] + '</p></div>')); });
    el.appendChild(box);
  }
  function wRobot(el) {
    var W = h("div", { class: "widget" }); W.appendChild(h("div", { class: "widget-title" }, "Coba: gerakkan robot ke bintang"));
    var area = h("div", { class: "robot-area" }), grid = h("div", { class: "grid5", "aria-label": "Papan petak 5 × 5" });
    var ctrl = h("div", { style: "display:grid;gap:10px;min-width:0" });
    var prog = h("div", { class: "prog", "aria-live": "polite" }), msg = h("div", { class: "msg" });
    var star = { x: 3, y: 1 }, r;
    var DIR = [[1, 0], [0, -1], [-1, 0], [0, 1]], ARROW = ["→", "↑", "←", "↓"];
    function reset() { r = { x: 0, y: 4, d: 0, cmd: [] }; draw(); }
    function draw() {
      grid.innerHTML = "";
      for (var y = 0; y < 5; y++) for (var x = 0; x < 5; x++) {
        var c = h("div"); if (x === star.x && y === star.y) { c.className = "bintang"; c.textContent = "★"; }
        if (x === r.x && y === r.y) { c.className = "robot"; c.innerHTML = "<span>" + ARROW[r.d] + "</span>"; }
        grid.appendChild(c);
      }
      prog.innerHTML = r.cmd.length ? r.cmd.map(function (c) { return "<span>" + c + "</span>"; }).join("") : "<span style='opacity:.6'>Belum ada perintah</span>";
      if (r.x === star.x && r.y === star.y) { msg.className = "msg ok"; msg.textContent = "Robot sampai di bintang dengan " + r.cmd.length + " perintah. Bisakah kamu memakai perintah yang lebih sedikit?"; }
    }
    function maju() {
      var nx = r.x + DIR[r.d][0], ny = r.y + DIR[r.d][1];
      if (nx < 0 || ny < 0 || nx > 4 || ny > 4) { msg.className = "msg bad"; msg.textContent = "Robot menabrak dinding! Ubah urutan perintahmu."; return; }
      r.x = nx; r.y = ny; r.cmd.push("maju"); msg.textContent = ""; draw();
    }
    function belok(s) { r.d = (r.d + (s === "kiri" ? 1 : 3)) % 4; r.cmd.push("belok " + s); msg.textContent = ""; draw(); }
    var b = h("div", { class: "row" });
    b.appendChild(h("button", { class: "btn primary", on: { click: maju } }, "Maju 1"));
    b.appendChild(h("button", { class: "btn", on: { click: function () { belok("kiri"); } } }, "Belok kiri"));
    b.appendChild(h("button", { class: "btn", on: { click: function () { belok("kanan"); } } }, "Belok kanan"));
    b.appendChild(h("button", { class: "btn ghost", on: { click: function () { reset(); msg.textContent = ""; } } }, "Ulang"));
    ctrl.appendChild(b); ctrl.appendChild(h("div", { class: "pemb-label" }, "Algoritma kamu")); ctrl.appendChild(prog); ctrl.appendChild(msg);
    area.appendChild(grid); area.appendChild(ctrl); W.appendChild(area); el.appendChild(W); reset();
  }
  function wOperator(el) {
    var W = h("div", { class: "widget" }); W.appendChild(h("div", { class: "widget-title" }, "Coba: operator perbandingan"));
    var a = h("input", { class: "inp", type: "number", value: "10", "aria-label": "Nilai kiri", id: "op-a-" + Math.random().toString(36).slice(2, 7) });
    var op = h("select", { class: "inp", "aria-label": "Operator", id: "op-o-" + Math.random().toString(36).slice(2, 7) });
    [">", "<", ">=", "<=", "==", "!="].forEach(function (o) { op.appendChild(h("option", { value: o }, esc(o))); });
    op.value = ">=";
    var b = h("input", { class: "inp", type: "number", value: "10", "aria-label": "Nilai kanan", id: "op-b-" + Math.random().toString(36).slice(2, 7) });
    var out = h("div", { class: "out", "aria-live": "polite" });
    var ARTI = { ">": "lebih dari", "<": "kurang dari", ">=": "lebih dari atau sama dengan", "<=": "kurang dari atau sama dengan", "==": "sama dengan", "!=": "tidak sama dengan" };
    function calc() {
      var x = +a.value, y = +b.value, o = op.value, r = { ">": x > y, "<": x < y, ">=": x >= y, "<=": x <= y, "==": x === y, "!=": x !== y }[o];
      out.innerHTML = esc(x + " " + o + " " + y) + " → <span class='" + (r ? "ya" : "tidak") + "'>" + (r ? "benar" : "salah") + "</span><br><span style='font-family:var(--f-ui);font-size:14px;color:var(--muted)'>Apakah " + x + " " + ARTI[o] + " " + y + "? " + (r ? "Ya." : "Tidak.") + "</span>";
    }
    [a, op, b].forEach(function (e) { e.addEventListener("input", calc); });
    var row = h("div", { class: "row" }); row.appendChild(a); row.appendChild(op); row.appendChild(b);
    W.appendChild(row); W.appendChild(out); el.appendChild(W); calc();
  }
  function wLogika(el) {
    var withNot = el.getAttribute("data-not") === "1";
    var W = h("div", { class: "widget" }); W.appendChild(h("div", { class: "widget-title" }, "Coba: AND, OR" + (withNot ? ", NOT" : "")));
    var lab = withNot ? ["Ada tahu di mangkok", "Kuahnya pedas"] : ["PR sudah selesai", "Tidak hujan"];
    var t1 = h("input", { type: "checkbox", id: "lg1-" + Math.random().toString(36).slice(2, 7) }), t2 = h("input", { type: "checkbox", id: "lg2-" + Math.random().toString(36).slice(2, 7) });
    t1.checked = true;
    var l1 = h("label", { class: "toggle" }); l1.appendChild(t1); l1.appendChild(document.createTextNode("Syarat 1: " + lab[0]));
    var l2 = h("label", { class: "toggle" }); l2.appendChild(t2); l2.appendChild(document.createTextNode("Syarat 2: " + lab[1]));
    var out = h("div", { class: "logic-out", "aria-live": "polite" });
    function v(b) { return "<b class='" + (b ? "ya" : "tidak") + "' style='color:var(--" + (b ? "ok" : "bad") + ")'>" + (b ? "benar" : "salah") + "</b>"; }
    function calc() {
      var a = t1.checked, b = t2.checked;
      out.innerHTML = "<div>S1 AND S2 → " + v(a && b) + "</div><div>S1 OR S2 → " + v(a || b) + "</div>" + (withNot ? "<div>NOT S1 → " + v(!a) + "</div>" : "");
    }
    t1.addEventListener("change", calc); t2.addEventListener("change", calc);
    W.appendChild(l1); W.appendChild(l2); W.appendChild(out); el.appendChild(W); calc();
  }
  function wMangkok(el) {
    var W = h("div", { class: "widget" }); W.appendChild(h("div", { class: "widget-title" }, "Coba: mangkok variabel pentol"));
    var area = h("div", { class: "bowl-area" }), bowl = h("div", { class: "bowl" }), right = h("div", { style: "display:grid;gap:10px;min-width:0" });
    var val = null, log = [];
    var cmds = [["pentol ← 5", function () { return 5; }], ["pentol ← pentol + 2", function (v) { return v + 2; }], ["pentol ← pentol − 3", function (v) { return v - 3; }], ["pentol ← 0", function () { return 0; }]];
    var msg = h("div", { class: "msg" });
    var tbl = h("div", { class: "tabel-wrap" });
    function draw() {
      var n = val == null ? 0 : Math.max(0, Math.min(val, 14)), dots = "";
      var pos = [[70, 92], [95, 96], [120, 96], [145, 92], [82, 78], [108, 80], [134, 78], [60, 78], [158, 78], [95, 64], [121, 64], [70, 64], [146, 64], [108, 50]];
      for (var i = 0; i < n; i++) dots += '<circle class="pentol" cx="' + pos[i][0] + '" cy="' + pos[i][1] + '" r="11"/>';
      bowl.innerHTML = '<svg viewBox="0 0 220 170" role="img" aria-label="Mangkok berlabel pentol berisi ' + (val == null ? "kosong" : val + " pentol") + '">' +
        '<path class="kuah" d="M30 70h160c0 40-35 66-80 66S30 110 30 70z"/>' + dots +
        '<path class="bowl-body" d="M22 66h176c0 48-40 78-88 78S22 114 22 66z" fill="none"/>' +
        '<rect class="label-box" x="70" y="104" width="80" height="24" rx="4"/><text class="label-txt" x="110" y="121" text-anchor="middle">pentol</text>' +
        '<text class="val-txt" x="110" y="163" text-anchor="middle">nilai = ' + (val == null ? "(kosong)" : val) + '</text></svg>';
      tbl.innerHTML = '<table class="tabel"><thead><tr><th>Langkah</th><th>Perintah</th><th>Nilai pentol</th></tr></thead><tbody>' +
        (log.length ? log.map(function (l, i) { return "<tr><td>" + (i + 1) + "</td><td><code>" + esc(l[0]) + "</code></td><td class='num'>" + l[1] + "</td></tr>"; }).join("") :
          "<tr><td colspan='3' style='color:var(--muted)'>Tekan salah satu perintah untuk mengisi mangkok.</td></tr>") + "</tbody></table>";
    }
    var c = h("div", { class: "cmds" });
    cmds.forEach(function (cm) {
      c.appendChild(h("button", { class: "btn", on: { click: function () {
        if (val == null && cm[0].indexOf("pentol +") > 0 || val == null && cm[0].indexOf("pentol −") > 0) { msg.className = "msg bad"; msg.textContent = "Mangkok belum diisi! Beri nilai awal dulu, misalnya pentol ← 5."; return; }
        var nv = cm[1](val);
        if (nv < 0) { msg.className = "msg bad"; msg.textContent = "Pentolnya tidak cukup untuk dikurangi 3."; return; }
        val = nv; log.push([cm[0], val]); if (log.length > 6) log.shift(); msg.textContent = ""; draw();
      } } }, esc(cm[0])));
    });
    c.appendChild(h("button", { class: "btn ghost", on: { click: function () { val = null; log = []; msg.textContent = ""; draw(); } } }, "Kosongkan mangkok"));
    right.appendChild(c); right.appendChild(msg); right.appendChild(tbl);
    area.appendChild(bowl); area.appendChild(right); W.appendChild(area); el.appendChild(W); draw();
  }
  function wLoop(el) {
    var W = h("div", { class: "widget" });
    var rid = Math.random().toString(36).slice(2, 7);
    var aw = h("input", { class: "inp", type: "number", value: "1", id: "lp-a-" + rid, "aria-label": "Nilai awal" });
    var ak = h("input", { class: "inp", type: "number", value: "5", id: "lp-b-" + rid, "aria-label": "Nilai akhir" });
    var lg = h("input", { class: "inp", type: "number", value: "1", id: "lp-c-" + rid, "aria-label": "Langkah" });
    var code = h("pre", { class: "kode" }), out = h("div", { class: "loop-out", "aria-live": "polite" }), info = h("div", { class: "msg" });
    function run() {
      var a = +aw.value, b = +ak.value, s = +lg.value;
      code.textContent = "for (i = " + a + "; i <= " + b + "; i = i + " + s + ") {\n      cetak(i)\n}";
      out.innerHTML = ""; info.className = "msg";
      if (s <= 0 && a <= b) { info.className = "msg bad"; info.textContent = "Langkah 0 atau negatif membuat i tidak pernah melewati " + b + ". Ini infinite loop!"; return; }
      var n = 0;
      for (var i = a; i <= b && n < 60; i += s) { out.appendChild(h("span", null, String(i))); n++; }
      info.className = "msg ok"; info.textContent = n === 0 ? "Syarat i <= " + b + " sudah salah sejak awal, jadi perulangan tidak berjalan." : "Perulangan berjalan " + n + " kali." + (n >= 60 ? " (ditampilkan 60 pertama)" : "");
    }
    [aw, ak, lg].forEach(function (e) { e.addEventListener("input", run); });
    var row = h("div", { class: "row" });
    row.appendChild(h("label", { for: aw.id }, "awal")); row.appendChild(aw);
    row.appendChild(h("label", { for: ak.id }, "akhir")); row.appendChild(ak);
    row.appendChild(h("label", { for: lg.id }, "langkah")); row.appendChild(lg);
    W.appendChild(row); W.appendChild(code); W.appendChild(out); W.appendChild(info); el.appendChild(W); run();
  }

  function wData(el) {
    var W = h("div", { class: "widget" }); W.appendChild(h("div", { class: "widget-title" }, "Coba: aturan keputusan dari data"));
    var data = [["Senin", 18], ["Selasa", 22], ["Rabu", 15], ["Kamis", 25], ["Jumat", 30]], max = 30;
    W.appendChild(h("p", { style: "font-weight:700" }, "Mangkok bakso yang terjual di kantin"));
    var chart = h("div", { class: "bar-chart", role: "img", "aria-label": "Diagram batang penjualan bakso" });
    var rid = Math.random().toString(36).slice(2, 7);
    var op = h("select", { class: "inp", id: "dt-o-" + rid, "aria-label": "Operator aturan" });
    [">=", ">", "<", "<="].forEach(function (o) { op.appendChild(h("option", { value: o }, esc(o))); });
    var n = h("input", { class: "inp", type: "number", value: "25", id: "dt-n-" + rid, "aria-label": "Batas aturan" });
    var out = h("div", { class: "out", "aria-live": "polite", style: "font-family:var(--f-ui)" });
    function run() {
      var o = op.value, v = +n.value, pass = [];
      chart.innerHTML = "";
      data.forEach(function (d) {
        var ok = { ">=": d[1] >= v, ">": d[1] > v, "<": d[1] < v, "<=": d[1] <= v }[o];
        if (ok) pass.push(d[0]);
        var row = h("div", { class: "bar-row" + (ok ? " lolos" : "") });
        row.innerHTML = '<span class="bar-lbl">' + d[0] + '</span><span class="bar-track"><i style="width:' + (d[1] / max * 100) + '%"></i></span><span class="bar-val">' + d[1] + '</span>';
        chart.appendChild(row);
      });
      out.innerHTML = "<b>JIKA penjualan " + esc(o) + " " + v + " MAKA tambah persediaan</b><br>" +
        (pass.length ? "Persediaan ditambah pada hari <b>" + pass.join(", ") + "</b> (" + pass.length + " hari)." : "Tidak ada hari yang memenuhi aturan.");
    }
    op.addEventListener("input", run); n.addEventListener("input", run);
    var row = h("div", { class: "row" });
    row.appendChild(h("span", { style: "font-family:var(--f-code);font-size:14px" }, "JIKA penjualan")); row.appendChild(op); row.appendChild(n);
    W.appendChild(chart); W.appendChild(row); W.appendChild(out); el.appendChild(W); run();
  }

  /* ---------- start ---------- */
  readHash();
  render();
})();
