/* Modul 14 — Learning Center: kurikulum kreator, roadmap, pembaca materi + kuis, lencana, registry */
'use strict';
Pages.def('learning', {
  FASE: [[1, 5, 'Fondasi & audiens', 'Foundation & audience'], [6, 10, 'Konten yang menjual', 'Content that sells'], [11, 99, 'Sistem & skala', 'Systems & scale']],
  marquee() { return ['Module 14 // Learning Center & Creator Academy', 'Playbooks, frameworks & quizzes', 'Synced with Google Sheets [PEMBELAJARAN]', 'Learn 15 minutes a day ✦']; },
  render(el, params) {
    this.el = el; this.rows = null; this.kat = ''; this.lv = ''; this.q = ''; this.sort = 'jalur';
    bindActs(el, {
      kat: (b) => { this.kat = b.dataset.v; this.paintGrid(); }, baca: (b) => this.baca(b.dataset.id), baru: () => this.form(), edit: (b) => this.form(this.get(b.dataset.id)), del: (b) => this.hapus(b.dataset.id),
      sync: (b) => this.muat(b), habit: (b) => this.habit(b)
    });
    el.innerHTML = App.hero({ word: 'W-14', pills: '<span class="pill mono p-blush">🍒 The solo creator curriculum</span>',
      title: tr('kuasai ilmunya. <span class="it">monetisasi pikiranmu.</span>', 'master the craft. <span class="it">monetize your mind.</span>'),
      sub: tr('Playbook singkat & bisa langsung dipraktikkan untuk kreator solo dan pemilik produk digital — dari hook, carousel, funnel, sampai membaca metrik — lengkap dengan kuis singkat.', 'Bite-sized, actionable playbooks for solo creators and digital product owners — hooks, carousels, funnels and metrics — each with a short quiz.'),
      side: '<button class="btn btn-ink shine" data-act="baru">' + ic('add', 'sm') + tr('Tambah materi', 'Add lesson') + '</button><button class="btn btn-ghost btn-sm" data-act="sync">' + ic('sync', 'sm') + tr('Sinkronkan', 'Sync') + '</button>',
      strip: '<div class="grid g4 w-100" id="ln-stat" style="gap:10px"></div>' }) +
      '<section class="card tight mt-24 col gap-12"><div class="row wrap gap-10" style="gap:10px"><input class="inp sm grow" id="ln-q" style="max-width:320px" placeholder="' + tr('Cari materi…', 'Search lessons…') + '"><select class="sel sm" id="ln-lv" style="max-width:200px">' + opts([{ v: '', l: tr('Semua level', 'All levels') }, 'Pemula', 'Menengah', 'Mahir'], '') + '</select><select class="sel sm" id="ln-sort" style="max-width:220px">' + opts([{ v: 'jalur', l: tr('Urut: Jalur rekomendasi', 'Sort: Recommended path') }, { v: 'pendek', l: tr('Urut: Paling singkat', 'Sort: Shortest') }, { v: 'progres', l: tr('Urut: Sedang dipelajari', 'Sort: In progress') }], 'jalur') + '</select></div><div class="chips nowrap" id="ln-chips"></div></section>' +
      '<div class="grid mt-24" id="ln-grid" style="grid-template-columns:minmax(0,3fr) minmax(0,6fr) minmax(0,3fr);align-items:start"><aside class="col gap-16" style="gap:16px" id="ln-left">' + UI.sk(2) + '</aside><section class="col gap-16" style="gap:16px" id="ln-main">' + UI.sk(2) + '</section><aside class="col gap-16" style="gap:16px" id="ln-right">' + UI.sk(2) + '</aside></div>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><div class="row gap-8 wrap"><h2 class="h2">Google Sheets Registry: [Pembelajaran]</h2><span class="pill sm p-sage">' + tr('Sinkron 2 arah', 'Two-way sync') + '</span></div><p class="xs muted mt-4 mono">' + tr('Progres & skor kuis tercatat otomatis', 'Progress & quiz scores tracked automatically') + '</p></div></div><div id="ln-tbl">' + UI.sk(3, 'sk-line') + '</div></section>';
    const g = $('#ln-grid', el); if (innerWidth < 1250) g.style.gridTemplateColumns = innerWidth < 800 ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,2fr)';
    $('#ln-q', el).addEventListener('input', debounce(() => { this.q = $('#ln-q', el).value.toLowerCase(); this.paintGrid(); }, 200));
    $('#ln-lv', el).onchange = (e) => { this.lv = e.target.value; this.paintGrid(); };
    $('#ln-sort', el).onchange = (e) => { this.sort = e.target.value; this.paintGrid(); };
    this.muat();
    if (params.id) this.baca(params.id);
  },
  get(id) { return (this.rows || []).find((l) => l.ID === id); },
  muat(btn) {
    if (btn) { UI.busy(btn, true); API.read('belajar.list', { _fresh: 1 }).then((r) => { UI.busy(btn, false); if (r.success) { this.rows = r.data; API.remember('belajar.list', {}, r.data); this.paint(); } }); return; }
    API.swr('belajar.list', {}, { maxAge: 60000, onData: (rows) => { this.rows = rows; this.paint(); } });
  },
  streak() { const t = App.set('BELAJAR_TERAKHIR', ''), s = Number(App.set('BELAJAR_STREAK', '0')) || 0; return t === Fmt.today() || t === Fmt.addDays(Fmt.today(), -1) ? s : 0; },
  badges() {
    const rows = this.rows || [], kat = {}; rows.forEach((l) => { (kat[l.Kategori] = kat[l.Kategori] || []).push(l); });
    const done = (k) => kat[k] && kat[k].every((l) => l.StatusBaca === 'Selesai'), kuis = rows.filter((l) => Number(l.SkorKuis) > 0);
    return [
      { i: '🌱', n: tr('Langkah pertama', 'First step'), d: tr('Selesaikan 1 materi', 'Finish 1 lesson'), ok: rows.some((l) => l.StatusBaca === 'Selesai') },
      { i: '🔥', n: tr('Konsisten 3 hari', '3-day streak'), d: tr('Belajar 3 hari beruntun', 'Learn 3 days in a row'), ok: this.streak() >= 3 },
      { i: '🪝', n: 'Hook Master', d: tr('Semua materi Copywriting & Hook', 'All Copywriting & Hook lessons'), ok: done('Copywriting & Hook') },
      { i: '🎨', n: 'Visual Alchemist', d: tr('Semua materi Desain & Estetika', 'All Design & Aesthetics lessons'), ok: done('Desain & Estetika') },
      { i: '💸', n: 'Funnel Architect', d: tr('Semua materi Monetisasi', 'All Monetization lessons'), ok: done('Monetisasi Produk Digital') },
      { i: '🎯', n: 'Quiz Ace', d: tr('Rata-rata kuis ≥ 80 (min. 3 kuis)', 'Quiz average ≥ 80 (min. 3 quizzes)'), ok: kuis.length >= 3 && kuis.reduce((s, l) => s + Number(l.SkorKuis), 0) / kuis.length >= 80 }
    ];
  },
  paint() {
    if (!this.rows) return;
    const rows = this.rows, n = rows.length, avg = n ? Math.round(rows.reduce((s, l) => s + Number(l.Progres || 0), 0) / n) : 0, b = this.badges();
    const tile = (icn, l, v, cls) => '<div class="mini row gap-10"><span class="ico-dot sm ' + (cls || 'line') + '">' + ic(icn, 'sm') + '</span><div><div class="label" style="font-size:9.5px">' + l + '</div><div class="h4">' + v + '</div></div></div>';
    $('#ln-stat', this.el).innerHTML = tile('library_books', tr('Kurikulum', 'Curriculum vault'), n + ' playbook') + tile('donut_large', tr('Progres total', 'Overall progress'), avg + '% ' + tr('selesai', 'completed')) + tile('local_fire_department', tr('Streak belajar', 'Learning streak'), this.streak() + tr(' hari', ' days')) + tile('workspace_premium', tr('Lencana', 'Badges'), b.filter((x) => x.ok).length + tr(' dari ', ' of ') + b.length);
    const kat = {}; rows.forEach((l) => { kat[l.Kategori] = (kat[l.Kategori] || 0) + 1; });
    $('#ln-chips', this.el).innerHTML = '<button class="chip' + (!this.kat ? ' on' : '') + '" data-act="kat" data-v="">' + tr('Semua modul', 'All modules') + ' <span class="n">' + n + '</span></button>' + Object.keys(kat).map((k) => '<button class="chip' + (this.kat === k ? ' on' : '') + '" data-act="kat" data-v="' + h(k) + '">' + h(k) + ' <span class="n">' + kat[k] + '</span></button>').join('');
    this.paintLeft(); this.paintGrid(); this.paintRight(); this.paintTbl();
  },
  urut(rows) {
    const f = { jalur: (a, b) => a.Urutan - b.Urutan, pendek: (a, b) => a.Durasi - b.Durasi, progres: (a, b) => ((b.StatusBaca === 'Dibaca') - (a.StatusBaca === 'Dibaca')) || (a.Progres === 100) - (b.Progres === 100) || a.Urutan - b.Urutan }[this.sort];
    return rows.slice().sort(f);
  },
  aksi(l) { return l.StatusBaca === 'Selesai' ? [tr('Ulas', 'Review'), 'btn-ghost'] : Number(l.Progres) > 0 ? [tr('Lanjutkan', 'Continue'), 'btn-sage'] : [tr('Mulai', 'Start'), 'btn-blush']; },
  paintLeft() {
    const rows = this.urut(this.rows.slice()), box = $('#ln-left', this.el);
    const fase = this.FASE.map((f, i) => { const ls = rows.filter((l) => l.Urutan >= f[0] && l.Urutan <= f[1]), p = ls.length ? Math.round(ls.reduce((s, l) => s + Number(l.Progres || 0), 0) / ls.length) : 0; return { i, nama: tr(f[2], f[3]), p, n: ls.length }; });
    const next = rows.filter((l) => l.StatusBaca !== 'Selesai').sort((a, b) => a.Durasi - b.Durasi || a.Urutan - b.Urutan)[0];
    const kat = {}; rows.forEach((l) => { (kat[l.Kategori] = kat[l.Kategori] || []).push(Number(l.Progres || 0)); });
    box.innerHTML = '<section class="card col gap-12"><div class="row between"><h3 class="h3">Creator Roadmap</h3><span class="pill sm p-sage">' + rows.length + ' modul</span></div><p class="small muted">' + tr('Rencana belajar bertahap dari audiens pertama sampai produk digital yang laku.', 'A step-by-step path from your first audience to a selling digital product.') + '</p><div class="col gap-8">' +
      fase.map((f) => '<div class="inset row gap-10" style="padding:10px 12px;' + (f.p >= 100 ? 'background:var(--sage)' : '') + '"><span class="ico-dot sm ' + (f.p >= 100 ? '' : 'line') + '">' + (f.p >= 100 ? ic('check', 'sm') : '<b class="mono xs">' + (f.i + 1) + '</b>') + '</span><div class="grow"><div class="row between"><span class="sb small">' + tr('Fase ', 'Phase ') + (f.i + 1) + ': ' + h(f.nama) + '</span><span class="mono xs">' + f.p + '%</span></div><div class="bar thin mt-4"><i style="width:' + f.p + '%"></i></div></div></div>').join('') + '</div></section>' +
      (next ? '<section class="card butter col gap-10"><div class="row between"><span class="label">⚡ ' + tr('Sprint mikro hari ini', "Today's micro-sprint") + '</span><span class="pill sm mono p-line">' + h(next.Durasi) + ' ' + tr('mnt', 'min') + '</span></div><h3 class="h3">' + h(next.Judul) + '</h3><p class="small muted clamp-3">' + h(next.Ringkasan) + '</p><button class="btn btn-ink btn-sm" data-act="baca" data-id="' + h(next.ID) + '">' + ic('play_arrow', 'sm') + tr('Mulai sekarang', 'Start now') + '</button></section>' : '') +
      '<section class="card col gap-10"><div class="row between"><h3 class="h3">Creator Radar</h3><span class="mono xs tert">AVG ' + (rows.length ? Math.round(rows.reduce((s, l) => s + Number(l.Progres || 0), 0) / rows.length) : 0) + '%</span></div><p class="xs muted">' + tr('Kompetensi per kategori (rata-rata progres)', 'Competency per category (average progress)') + '</p>' + Chart.hbars(Object.keys(kat).map((k) => ({ l: k, v: Math.round(kat[k].reduce((s, x) => s + x, 0) / kat[k].length) })), { fmt: (v) => v + '%', color: 'var(--sage-ink)' }) + '</section>';
  },
  vis() { return this.urut(this.rows.filter((l) => (!this.kat || l.Kategori === this.kat) && (!this.lv || l.Level === this.lv) && (!this.q || (l.Judul + ' ' + l.Ringkasan + ' ' + l.Kategori).toLowerCase().indexOf(this.q) > -1))); },
  paintGrid() {
    if (!this.rows) return;
    const rows = this.vis(), box = $('#ln-main', this.el);
    const feat = rows.find((l) => l.StatusBaca === 'Dibaca') || rows.find((l) => l.StatusBaca !== 'Selesai') || rows[0];
    if (!feat) { box.innerHTML = '<div class="card">' + UI.empty('search_off', tr('Tidak ada materi', 'No lessons')) + '</div>'; return; }
    const a = this.aksi(feat), sisa = rows.filter((l) => l !== feat);
    box.innerHTML = '<article class="card lg col gap-12 blush"><div class="row wrap gap-8"><span class="pill mono p-ink">' + tr('Blueprint utama', 'Core blueprint') + ' #' + h(String(feat.Urutan).padStart(2, '0')) + ' · ' + h(feat.Durasi) + ' ' + tr('mnt', 'min') + '</span><span class="pill p-sage">' + h(feat.Kategori) + '</span><span class="pill p-line">' + h(feat.Level) + '</span></div>' +
      '<div class="rel" style="border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#2F4F3E,#1E1B1B);color:#fff;padding:26px;min-height:200px;display:flex;flex-direction:column;justify-content:space-between"><span class="pill sm" style="background:rgba(255,255,255,.12);color:#fff;align-self:flex-start">✦ ' + tr('Masterclass pilihan', 'Featured masterclass') + '</span><div class="display" style="font-size:30px;color:#fff;max-width:520px">' + h(feat.Judul) + '</div><div><div class="row between xs mono" style="opacity:.8"><span>' + h(feat.Format) + '</span><span>' + Number(feat.Progres || 0) + '% ' + tr('selesai', 'done') + '</span></div><div class="bar thin mt-4" style="background:rgba(255,255,255,.15)"><i style="width:' + Number(feat.Progres || 0) + '%;background:var(--rose)"></i></div></div></div>' +
      '<p class="muted">' + h(feat.Ringkasan) + '</p><div class="row between wrap gap-8"><span class="row gap-8 small"><span class="avatar sm ini">PLM</span>Studio Director · PLM Academy</span><button class="btn ' + a[1] + '" data-act="baca" data-id="' + h(feat.ID) + '">' + a[0] + ' →</button></div></article>' +
      '<div class="grid g2" style="gap:16px">' + sisa.map((l) => { const x = this.aksi(l), p = Number(l.Progres || 0); return '<article class="card col gap-8 hover"><div class="row between"><span class="pill sm ' + (p >= 100 ? 'p-sage' : p > 0 ? 'p-butter' : 'p-line') + '">' + h(l.Kategori) + '</span><span class="mono xs tert">' + (p >= 100 ? '100% ' + tr('selesai', 'done') : p > 0 ? p + '% ' + tr('berjalan', 'in progress') : tr('baru', 'new')) + '</span></div><h3 class="h3">' + h(l.Judul) + '</h3><p class="small muted clamp-3">' + h(l.Ringkasan) + '</p><div class="row between mt-4" style="margin-top:auto"><span class="xs muted">' + h(l.Durasi) + ' ' + tr('mnt', 'min') + ' · ' + h(l.Level) + (Number(l.SkorKuis) ? ' · ' + tr('kuis ', 'quiz ') + l.SkorKuis : '') + '</span><button class="btn btn-xs ' + x[1] + '" data-act="baca" data-id="' + h(l.ID) + '">' + x[0] + '</button></div></article>'; }).join('') + '</div>' +
      '<p class="xs muted tc">' + tr('Menampilkan ', 'Showing ') + rows.length + tr(' dari ', ' of ') + this.rows.length + tr(' playbook', ' playbooks') + '</p>';
  },
  paintRight() {
    const box = $('#ln-right', this.el), b = this.badges(), on = App.set('BELAJAR_HARIAN', 'YA') !== 'TIDAK';
    const res = this.rows.filter((l) => l.Link).slice(0, 4);
    box.innerHTML = '<section class="card col gap-10"><div class="row between"><h3 class="h3">' + tr('Lencana', 'Milestones & badges') + '</h3><span class="pill sm p-blush">' + b.filter((x) => x.ok).length + '/' + b.length + '</span></div>' +
      b.map((x) => '<div class="inset row gap-10" style="padding:10px 12px;' + (x.ok ? 'background:var(--sage)' : 'opacity:.7') + '"><span style="font-size:20px;filter:' + (x.ok ? 'none' : 'grayscale(1)') + '">' + x.i + '</span><div class="grow"><div class="sb small">' + h(x.n) + '</div><div class="xs muted">' + h(x.d) + '</div></div>' + (x.ok ? ic('verified', 'sm') : ic('lock', 'sm')) + '</div>').join('') + '</section>' +
      '<section class="card col gap-10"><h3 class="h3">' + tr('Sumber belajar', 'Resource vault') + '</h3>' + (res.length ? res.map((l) => '<a class="inset row gap-10" style="padding:10px 12px" href="' + h(l.Link) + '" target="_blank" rel="noopener"><span class="grow small sb clamp-2">' + h(l.Judul) + '</span>' + ic('open_in_new', 'sm') + '</a>').join('') : '<p class="xs muted">' + tr('Tambahkan tautan (Notion, Google Docs, video) di materi untuk menampilkannya di sini.', 'Add links (Notion, Google Docs, video) to lessons to show them here.') + '</p>') +
        '<a class="inset row gap-10" style="padding:10px 12px" href="#/assets"><span class="grow small sb">' + tr('Aset musik, font & visual bebas royalti', 'Royalty-free music, fonts & visuals') + '</span>' + ic('chevron_right', 'sm') + '</a></section>' +
      '<section class="card lav col gap-10"><div class="row between"><h3 class="h4">' + tr('Sinkron ke Anti-Mager', 'Sync to Anti-Mager') + '</h3><span class="pill sm mono p-line">W-11</span></div><p class="xs muted">' + tr('Masukkan target belajar 15 menit ke Tugas Harian setiap pagi.', 'Add a 15-minute learning target to Daily Tasks every morning.') + '</p><label class="row between small"><span>' + tr('Kebiasaan 15 menit harian', 'Daily 15-min habit') + '</span><span class="sw"><input type="checkbox" id="ln-habit"' + (on ? ' checked' : '') + ' data-act="habit"><i></i></span></label></section>';
  },
  async habit(b) {
    const v = b.checked ? 'YA' : 'TIDAK';
    const r = await API.call('pengaturan.save', { BELAJAR_HARIAN: v }, { toast: false });
    if (r.success) { if (App.boot && App.boot.settings) App.boot.settings.BELAJAR_HARIAN = v; UI.toast(v === 'YA' ? tr('Belajar 15 menit masuk Tugas Harian.', '15-min learning added to Daily Tasks.') : tr('Kebiasaan belajar harian dimatikan.', 'Daily learning habit turned off.'), 'ok'); } else b.checked = !b.checked;
  },
  paintTbl() {
    const box = $('#ln-tbl', this.el), rows = this.urut(this.rows.slice());
    box.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>' + tr('Judul modul', 'Module title') + '</th><th>' + tr('Kategori', 'Category') + '</th><th>Format</th><th class="tr">' + tr('Durasi', 'Duration') + '</th><th style="min-width:130px">' + tr('Progres', 'Progress') + '</th><th class="tr">' + tr('Kuis', 'Quiz') + '</th><th></th></tr></thead><tbody>' +
      rows.map((l) => { const p = Number(l.Progres || 0), a = this.aksi(l); return '<tr><td class="mono xs">' + h(l.ID) + '</td><td class="sb">' + h(l.Judul) + '</td><td><span class="pill sm p-line">' + h(l.Kategori) + '</span></td><td class="small">' + h(l.Format) + '</td><td class="tr num small">' + h(l.Durasi) + 'm</td><td>' + (p >= 100 ? '<span class="pill sm mono p-ok">100% ' + tr('selesai', 'done') + '</span>' : '<div class="row gap-8"><div class="bar thin grow"><i style="width:' + p + '%"></i></div><span class="mono xs">' + p + '%</span></div>') + '</td><td class="tr num small">' + (Number(l.SkorKuis) ? l.SkorKuis + '/100' : '—') + '</td><td><div class="row gap-4" style="justify-content:flex-end;flex-wrap:nowrap"><button class="btn btn-xs ' + a[1] + '" data-act="baca" data-id="' + h(l.ID) + '">' + a[0] + '</button><button class="icon-btn sm ghost" data-act="edit" data-id="' + h(l.ID) + '" aria-label="Edit">' + ic('edit', 'sm') + '</button></div></td></tr>'; }).join('') + '</tbody></table></div>';
  },
  async progres(id, p, skor, quiet) {
    const l = this.get(id); if (!l) return;
    const d = { id, progres: Math.max(Number(l.Progres || 0), p) }; if (skor !== undefined) d.skorKuis = skor;
    if (d.progres === Number(l.Progres || 0) && skor === undefined) return;
    const r = await API.call('belajar.progress', d, { toast: !quiet });
    if (r.success) { Object.assign(l, { Progres: r.data.Progres, StatusBaca: r.data.StatusBaca, SkorKuis: r.data.SkorKuis }); if (App.boot && App.boot.settings) { App.boot.settings.BELAJAR_TERAKHIR = Fmt.today(); } this.paint(); if (d.progres >= 100) UI.confetti(); }
  },
  async baca(id) {
    const dr = UI.drawer({ kicker: 'Learning Center', title: (this.get(id) || {}).Judul || tr('Memuat…', 'Loading…'), body: UI.sk(4, 'sk-line') });
    const r = await API.read('belajar.get', { id }); if (!r.success) { dr.close(); return UI.toast(r.message, 'err'); }
    const l = r.data, kuis = pj(l.Kuis, []);
    dr.el.innerHTML = '<div class="row wrap gap-8"><span class="pill p-sage">' + h(l.Kategori) + '</span><span class="pill p-line">' + h(l.Level) + '</span><span class="pill p-line">' + ic('schedule', 'xs') + h(l.Durasi) + ' ' + tr('mnt', 'min') + '</span></div><p class="lead mt-12" style="font-size:16px">' + h(l.Ringkasan) + '</p><div class="md-body mt-16">' + md(l.Isi) + '</div>' +
      (l.Link ? '<a class="btn btn-ghost btn-sm mt-16" href="' + h(l.Link) + '" target="_blank" rel="noopener">' + ic('open_in_new', 'sm') + tr('Buka sumber', 'Open resource') + '</a>' : '') +
      (kuis.length ? '<section class="card paper mt-24 col gap-12" id="qz"><div class="row between"><h3 class="h3">' + tr('Kuis singkat', 'Quick quiz') + '</h3><span class="mono xs">' + kuis.length + tr(' soal', ' questions') + '</span></div>' + kuis.map((q, i) => '<div class="col gap-6"><div class="sb small">' + (i + 1) + '. ' + h(q.q) + '</div>' + q.opsi.map((o, j) => '<label class="check small"><input type="radio" name="q' + i + '" value="' + j + '"> ' + h(o) + '</label>').join('') + '<div class="xs" data-al="' + i + '" hidden></div></div>').join('') + '<button class="btn btn-ink" id="qz-ok">' + tr('Periksa jawaban', 'Check answers') + '</button></section>' : '') +
      '<div class="row between wrap gap-8 mt-24"><span class="xs muted">' + tr('Progres tersimpan otomatis saat membaca.', 'Progress saves automatically while reading.') + '</span><button class="btn btn-sage" id="ln-done">' + ic('check', 'sm') + tr('Tandai selesai', 'Mark complete') + '</button></div>';
    this.progres(id, 30, undefined, true);
    let ke70 = false; const sc = dr.el;
    sc.addEventListener('scroll', () => { if (!ke70 && sc.scrollTop + sc.clientHeight > sc.scrollHeight - 80) { ke70 = true; this.progres(id, 70, undefined, true); } }, { passive: true });
    $('#ln-done', sc).onclick = () => { this.progres(id, 100); dr.close(); };
    const ok = $('#qz-ok', sc);
    if (ok) ok.onclick = () => {
      let benar = 0, isi = 0;
      kuis.forEach((q, i) => { const s = $('input[name=q' + i + ']:checked', sc), al = $('[data-al="' + i + '"]', sc); if (s) isi++; const b = s && +s.value === Number(q.jawab); if (b) benar++; al.hidden = false; al.style.color = b ? 'var(--ok)' : 'var(--danger)'; al.textContent = (b ? '✓ ' : '✗ ' + tr('Jawaban: ', 'Answer: ') + q.opsi[q.jawab] + ' — ') + (q.alasan || ''); });
      if (isi < kuis.length) return UI.toast(tr('Jawab semua soal dulu.', 'Answer all questions first.'), 'warn');
      const skor = Math.round(100 * benar / kuis.length);
      ok.textContent = tr('Skor: ', 'Score: ') + skor + '/100'; ok.disabled = true;
      this.progres(id, skor >= 60 ? 100 : 70, skor);
    };
  },
  form(l) {
    l = l || { Judul: '', Kategori: 'Strategi Konten', Format: 'Artikel + Checklist', Durasi: 10, Level: 'Pemula', Link: '', Ringkasan: '', Isi: '', Urutan: (this.rows || []).length + 1, Kuis: '[]' };
    const kats = Array.from(new Set((this.rows || []).map((x) => x.Kategori).concat(['Strategi Konten']))), kuis = pj(l.Kuis, []);
    const kuisTxt = kuis.map((q) => q.q + ' | ' + q.opsi.join('; ') + ' | ' + (Number(q.jawab) + 1) + (q.alasan ? ' | ' + q.alasan : '')).join('\n');
    const m = UI.modal({ title: l.ID ? tr('Edit materi', 'Edit lesson') : tr('Materi baru', 'New lesson'), kicker: 'Learning Center', size: 'wide',
      body: (l.ID && l.Isi && l.Isi.length <= 180 ? '<p class="xs muted mb-8">' + tr('Memuat isi lengkap…', 'Loading full content…') + '</p>' : '') + '<form class="col gap-12" id="lnf"><div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Judul', 'Title') + '</label><input class="inp" name="Judul" value="' + h(l.Judul) + '"></div><div class="field"><label>' + tr('Kategori', 'Category') + '</label><input class="inp" name="Kategori" list="ln-kats" value="' + h(l.Kategori) + '"><datalist id="ln-kats">' + kats.map((k) => '<option value="' + h(k) + '">').join('') + '</datalist></div></div>' +
        '<div class="grid g4" style="gap:12px"><div class="field"><label>Format</label><input class="inp" name="Format" value="' + h(l.Format) + '"></div><div class="field"><label>' + tr('Durasi (mnt)', 'Duration (min)') + '</label><input class="inp" type="number" name="Durasi" value="' + h(l.Durasi) + '"></div><div class="field"><label>Level</label><select class="sel" name="Level">' + opts(['Pemula', 'Menengah', 'Mahir'], l.Level) + '</select></div><div class="field"><label>' + tr('Urutan', 'Order') + '</label><input class="inp" type="number" name="Urutan" value="' + h(l.Urutan) + '"></div></div>' +
        '<div class="field"><label>' + tr('Ringkasan', 'Summary') + '</label><textarea class="ta" name="Ringkasan" rows="2">' + h(l.Ringkasan) + '</textarea></div><div class="field"><label>' + tr('Isi (Markdown: ## judul, - poin, **tebal**)', 'Content (Markdown: ## heading, - bullet, **bold**)') + '</label><textarea class="ta mono" name="Isi" rows="9" id="lnf-isi">' + h(l.Isi) + '</textarea></div>' +
        '<div class="field"><label>' + tr('Kuis (satu per baris: Pertanyaan | opsi1; opsi2; opsi3 | nomor jawaban | alasan)', 'Quiz (one per line: Question | opt1; opt2; opt3 | answer number | reason)') + '</label><textarea class="ta" name="kuis" rows="3" id="lnf-kuis">' + h(kuisTxt) + '</textarea></div><div class="field"><label>' + tr('Tautan sumber (opsional)', 'Resource link (optional)') + '</label><input class="inp" name="Link" value="' + h(l.Link) + '" placeholder="https://"></div></form>',
      foot: (l.ID ? '<button class="btn btn-ghost" id="lnf-del" style="color:var(--danger);margin-right:auto">' + ic('delete', 'sm') + tr('Hapus', 'Delete') + '</button>' : '') + '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="lnf-ok">' + tr('Simpan', 'Save') + '</button>' });
    if (l.ID) API.read('belajar.get', { id: l.ID }).then((r) => { if (r.success && $('#lnf-isi', m.el)) { $('#lnf-isi', m.el).value = r.data.Isi || ''; const q = pj(r.data.Kuis, []); $('#lnf-kuis', m.el).value = q.map((x) => x.q + ' | ' + x.opsi.join('; ') + ' | ' + (Number(x.jawab) + 1) + (x.alasan ? ' | ' + x.alasan : '')).join('\n'); const p = $('.modal-b > p.xs', m.el); if (p) p.remove(); } });
    const del = $('#lnf-del', m.el.parentNode); if (del) del.onclick = () => { m.close(); this.hapus(l.ID); };
    $('#lnf-ok', m.el.parentNode).onclick = async (e) => {
      const v = formVals($('#lnf', m.el)); if (!v.Judul.trim()) return UI.toast(tr('Judul wajib diisi.', 'Title is required.'), 'warn');
      v.Kuis = v.kuis.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => { const p = x.split('|').map((y) => y.trim()); return { q: p[0], opsi: (p[1] || '').split(';').map((y) => y.trim()).filter(Boolean), jawab: Math.max(0, (Number(p[2]) || 1) - 1), alasan: p[3] || '' }; }).filter((q) => q.q && q.opsi.length >= 2);
      delete v.kuis;
      UI.busy(e.currentTarget, true); const r = await API.call('belajar.save', Object.assign(v, { ID: l.ID || '' })); UI.busy(e.currentTarget, false);
      if (r.success) { m.close(); this.muat(); API.read('belajar.list', {}).then((x) => { if (x.success) { this.rows = x.data; this.paint(); } }); }
    };
  },
  async hapus(id) {
    const l = this.get(id); if (!l || !(await UI.confirm(tr('Hapus materi "' + l.Judul + '"?', 'Delete lesson "' + l.Judul + '"?'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    const r = await API.call('belajar.delete', { id }); if (r.success) { this.rows = this.rows.filter((x) => x.ID !== id); this.paint(); }
  }
});
