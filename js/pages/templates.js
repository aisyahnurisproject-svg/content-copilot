/* Modul 10 — Template Library: arsip template editorial, spotlight, kustomisasi blueprint, registry tersinkron */
'use strict';
Pages.def('templates', {
  ANGLE: ['Pain-Agitate-Solve', 'Contrarian', 'Curiosity Gap', 'Story Arch', 'Before & After', 'Data & Proof', 'Relatable'],
  marquee() { return ['Module 10 // Template Repository & Reusable Asset Vault', 'Design, hook & slide archetypes', 'Synced with Google Sheets [TEMPLATE]', 'Ready for Instagram, Substack, Reels & TikTok']; },
  render(el, params) {
    if (typeof Engine === 'undefined') { el.innerHTML = '<div class="grid g3">' + UI.sk(3) + '</div>'; App.need('engine').then(() => { if (App.cur === this) this.render(el, params); }); return; }
    this.el = el; this.rows = null; this.jenis = ''; this.q = ''; this.sort = Store.get('tpl-sort', 'rating'); this.sel = params.id || ''; this.kitId = App.kitId(); this.wm = true; this.angle = this.ANGLE[1]; this.pilar = (App.pilar()[0] || {}).nama || '';
    bindActs(el, {
      jenis: (b) => { this.jenis = b.dataset.v; this.paintGrid(); }, pakai: (b) => this.pakai(b.dataset.id), pilih: (b) => { this.sel = b.dataset.id; this.paintSpot(); this.paintBlue(); $('#tp-spot', el).scrollIntoView({ behavior: 'smooth', block: 'start' }); },
      flip: (b) => b.closest('.flip').classList.toggle('on'), baru: () => this.form(), edit: (b) => this.form(this.get(b.dataset.id)), dup: (b) => this.dup(b.dataset.id), menu: (b, e) => { e.stopPropagation(); this.menu(b); },
      sync: (b) => this.muat(b), xls: () => this.ekspor(), kirim: () => this.kirim(), lihat: (b) => this.lihat(b.dataset.id)
    });
    el.innerHTML = App.hero({ word: 'W-10', pills: '<span class="pill mono p-sage">Curated vault</span><span class="pill mono p-line">🍒 PLM-TEMPLATE-SYS</span>',
      title: tr('dibuat sekali. <span class="it">dipakai tanpa batas.</span>', 'crafted once. <span class="it">deployed infinitely.</span>'),
      sub: tr('Kurasi, duplikasi, dan remix template editorial yang terbukti: carousel, naskah video, story funnel, hingga newsletter — tersinkron dengan Google Sheets dan siap dikirim ke Generator.', 'Curate, duplicate and remix proven editorial templates — carousels, video scripts, story funnels and newsletters — synced with Google Sheets and ready for the Generator.'),
      side: '<button class="btn btn-ink shine" data-act="baru">' + ic('add', 'sm') + tr('Template master baru', 'New master template') + '</button><div class="row gap-8"><button class="btn btn-ghost btn-sm" data-act="sync">' + ic('sync', 'sm') + 'Resync</button><button class="btn btn-ghost btn-sm" data-act="xls">' + ic('download', 'sm') + 'Export</button></div><div class="row gap-16 mt-8" id="tp-stat"></div>' }) +
      '<section class="card tight mt-24 row wrap between gap-12"><div class="row wrap gap-10 grow" style="gap:10px"><input class="inp sm" id="tp-q" style="max-width:300px" placeholder="' + tr('Cari template, format, tema…', 'Search templates, format, theme…') + '"><select class="sel sm" id="tp-sort" style="max-width:220px">' + opts([{ v: 'rating', l: tr('Urut: Rating tertinggi', 'Sort: Highest rating') }, { v: 'pakai', l: tr('Urut: Paling sering dipakai', 'Sort: Most used') }, { v: 'baru', l: tr('Urut: Terbaru', 'Sort: Newest') }, { v: 'nama', l: tr('Urut: Nama A–Z', 'Sort: Name A–Z') }], this.sort) + '</select></div><div class="chips nowrap" id="tp-chips"></div></section>' +
      '<section class="card lg mt-24 blush" id="tp-spot">' + UI.sk(1) + '</section>' +
      '<section class="mt-32"><div class="row between wrap gap-12 mb-16"><div class="row gap-12"><h2 class="h1" style="font-size:30px">' + tr('Arketipe siap produksi', 'Production-ready archetypes') + '</h2><span class="pill mono p-line" id="tp-n"></span></div><span class="label">' + tr('Klik ⟳ untuk melihat struktur', 'Tap ⟳ to see the structure') + '</span></div><div class="grid g3" id="tp-grid" style="align-items:stretch">' + UI.sk(3) + '</div></section>' +
      '<section class="card lg mt-32" id="tp-blue"></section>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><div class="row gap-8">' + ic('table_chart', 'sm') + '<h2 class="h2">Synced Master Registry</h2></div><p class="xs muted mt-4 mono">Source: Google Sheets · Template · ' + tr('folder Drive: Template', 'Drive folder: Template') + '</p></div><button class="btn btn-ghost btn-sm" data-act="xls">' + ic('download', 'sm') + 'Excel</button></div><div class="tbl-wrap" id="tp-tbl">' + UI.sk(3, 'sk-line') + '</div></section>';
    $('#tp-q', el).addEventListener('input', debounce(() => { this.q = $('#tp-q', el).value.toLowerCase(); this.paintGrid(); this.paintTbl(); }, 200));
    $('#tp-sort', el).onchange = (e) => { this.sort = e.target.value; Store.set('tpl-sort', this.sort); this.paintGrid(); this.paintTbl(); };
    this.muat();
  },
  onKit(id) { this.kitId = id; this.paintAll(); },
  get(id) { return (this.rows || []).find((t) => t.ID === id); },
  muat(btn) {
    if (btn) { UI.busy(btn, true); API.read('template.list', { _fresh: 1 }).then((r) => { UI.busy(btn, false); if (r.success) { this.rows = r.data; API.remember('template.list', {}, r.data); this.paintAll(); UI.toast(tr('Registry disinkronkan.', 'Registry synced.'), 'ok'); } }); return; }
    API.swr('template.list', {}, { maxAge: 60000, onData: (rows) => { this.rows = rows; this.paintAll(); } });
  },
  aktif() { return (this.rows || []).filter((t) => t.Status !== 'Arsip'); },
  urut(rows) {
    const s = this.sort, f = { rating: (a, b) => b.Rating - a.Rating, pakai: (a, b) => b.Pemakaian - a.Pemakaian, baru: (a, b) => String(b.DibuatPada).localeCompare(String(a.DibuatPada)), nama: (a, b) => String(a.Nama).localeCompare(String(b.Nama)) }[s];
    return rows.slice().sort(f);
  },
  vis() { return this.urut(this.aktif().filter((t) => (!this.jenis || t.Jenis === this.jenis) && (!this.q || (t.Nama + ' ' + t.Jenis + ' ' + t.Platform + ' ' + t.Tema + ' ' + t.Deskripsi).toLowerCase().indexOf(this.q) > -1))); },
  async paintAll() {
    if (!this.rows) return;
    const a = this.aktif(), n = {};
    a.forEach((t) => { n[t.Jenis] = (n[t.Jenis] || 0) + 1; });
    const avg = a.length ? a.reduce((s, t) => s + Number(t.Rating || 0), 0) / a.length : 0, pakai = a.reduce((s, t) => s + Number(t.Pemakaian || 0), 0);
    $('#tp-stat', this.el).innerHTML = '<div class="tr"><div class="h3">' + a.length + '</div><div class="label">' + tr('tersinkron', 'synced') + '</div></div><div class="tr"><div class="h3">★ ' + avg.toFixed(2) + '</div><div class="label">' + tr('rata-rata', 'avg rating') + '</div></div><div class="tr"><div class="h3">' + Fmt.k(pakai) + '</div><div class="label">' + tr('dipakai', 'uses') + '</div></div>';
    $('#tp-chips', this.el).innerHTML = '<button class="chip' + (!this.jenis ? ' on' : '') + '" data-act="jenis" data-v="">' + tr('Semua arketipe', 'All archetypes') + ' <span class="n">' + a.length + '</span></button>' + Object.keys(n).map((j) => '<button class="chip' + (this.jenis === j ? ' on' : '') + '" data-act="jenis" data-v="' + h(j) + '">' + ic(JENIS_ICON[j] || 'description', 'xs') + h(jenisLabel(j)) + ' <span class="n">' + n[j] + '</span></button>').join('');
    if (!this.sel || !this.get(this.sel)) this.sel = (this.urut(a)[0] || {}).ID || '';
    this.kitSiap = await Engine.siapkanKit(App.kit(this.kitId));
    if (App.cur !== this) return;
    this.paintSpot(); this.paintGrid(); this.paintBlue(); this.paintTbl();
  },
  /** slide contoh dari struktur template (untuk pratinjau kanvas) */
  contoh(t) {
    const st = pj(t.Struktur, {}), sl = st.slides && st.slides.length ? st.slides : (st.bagian || st.hari || st.segmen || ['Hook', 'Isi', 'CTA']).map((x, i, arr) => ({ peran: x, layout: i === 0 ? 'hook' : i === arr.length - 1 ? 'cta' : 'poin' }));
    return sl.map((s, i) => ({ judul: i === 0 ? t.Nama : (s.peran || 'Slide ' + (i + 1)), isi: i === 0 ? String(t.Deskripsi || '').split(/[.:]/)[0] : (s.layout === 'cta' ? tr('Simpan & bagikan ke teman kreator.', 'Save & share with a creator friend.') : ''), layout: s.layout || '' }));
  },
  rasio(t) { const st = pj(t.Struktur, {}); return st.rasio || Engine.rasioDari(t.Jenis, t.Platform); },
  kanvas(t, i, w, kitId) {
    const kit = App.kit(kitId || this.kitId), s = this.contoh(t), o = Engine.opsiDariKit(kit, { format: this.rasio(t), index: i, total: s.length });
    o.watermark.logo = this.kitSiap && this.kitSiap.logo; o.watermark.aktif = this.wm;
    const c = Engine.thumb(s[Math.min(i, s.length - 1)], o, w); c.style.width = '100%'; c.style.height = '100%'; c.style.objectFit = 'contain'; c.style.display = 'block'; c.style.filter = 'drop-shadow(0 10px 18px rgba(30,27,27,.16))';
    return c;
  },
  isiStruktur(t) {
    const st = pj(t.Struktur, {}), L = [];
    if (st.slides) st.slides.forEach((s, i) => L.push([('0' + (i + 1)).slice(-2), s.peran + (s.layout ? ' · ' + s.layout : '')]));
    else (st.segmen || st.bagian || st.hari || []).forEach((s, i) => L.push([('0' + (i + 1)).slice(-2), s]));
    return L;
  },
  paintSpot() {
    const box = $('#tp-spot', this.el), t = this.get(this.sel);
    if (!t) { box.innerHTML = UI.empty('folder_special', tr('Belum ada template', 'No templates yet'), '', '<button class="btn btn-ink" data-act="baru">' + tr('Buat template', 'Create template') + '</button>'); return; }
    const st = pj(t.Struktur, {}), n = this.contoh(t).length, rating = Number(t.Rating || 0), tier = rating >= 4.9 ? 'A+' : rating >= 4.7 ? 'A' : rating >= 4.4 ? 'B+' : 'B';
    box.innerHTML = '<div class="grid" style="grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:28px;align-items:center" id="tp-sg"><div class="col gap-12"><div class="row gap-8 wrap"><span class="pill mono p-ink">Spotlight // archetype</span><span class="pill mono p-line">' + h(t.ID) + '</span><span class="pill mono p-sage">★ ' + rating.toFixed(2) + '</span></div>' +
      '<div class="grid g3" id="tp-sc" style="gap:12px">' + [0, 1, 2].map((i) => '<div class="tile" style="padding:8px;background:#fff"><div style="aspect-ratio:4/5;overflow:hidden;border-radius:14px" data-c="' + i + '"></div><div class="row between mt-8"><span class="mono xs tert">' + ('0' + (Math.min(i, n - 1) + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2) + '</span><span class="mono xs tert">' + h(this.rasio(t)) + '</span></div></div>').join('') + '</div>' +
      '<div class="row wrap gap-16 small muted"><span>' + ic('aspect_ratio', 'xs') + tr('Rasio ', 'Aspect ') + h(this.rasio(t)) + '</span><span>' + ic('layers', 'xs') + n + tr(' komponen layout', ' layout components') + '</span>' + (st.captionFramework ? '<span>' + ic('edit_note', 'xs') + 'Caption ' + h(st.captionFramework) + '</span>' : '') + '</div></div>' +
      '<div class="col gap-12"><div class="row wrap gap-8"><span class="pill p-sage">' + h(t.Tema || 'Edukasi') + '</span>' + jenisPill(t.Jenis) + platPill(t.Platform) + '</div><h2 class="display" style="font-size:44px">' + h(t.Nama.split(' ').slice(0, 2).join(' ')) + ' <span class="it">' + h(t.Nama.split(' ').slice(2).join(' ')) + '</span></h2><p class="muted">' + h(t.Deskripsi) + '</p>' +
      '<div class="grid g3" style="gap:10px"><div class="mini tc"><div class="h3">' + Fmt.k(t.Pemakaian) + '</div><div class="label">' + tr('dipakai', 'uses') + '</div></div><div class="mini tc"><div class="h3">' + rating.toFixed(1) + '</div><div class="label">rating</div></div><div class="mini tc"><div class="h3">' + tier + '</div><div class="label">tier</div></div></div>' +
      '<div class="row wrap gap-8"><button class="btn btn-ink shine" data-act="pakai" data-id="' + h(t.ID) + '">' + ic('auto_awesome', 'sm') + tr('Pakai di Generator (W-04)', 'Use in Generator (W-04)') + '</button><button class="btn btn-ghost" data-act="dup" data-id="' + h(t.ID) + '">' + ic('content_copy', 'sm') + tr('Duplikat', 'Duplicate') + '</button><button class="icon-btn" data-act="lihat" data-id="' + h(t.ID) + '" aria-label="' + tr('Pratinjau', 'Preview') + '">' + ic('visibility', 'sm') + '</button></div></div></div>';
    if (innerWidth < 1000) $('#tp-sg', box).style.gridTemplateColumns = 'minmax(0,1fr)';
    $$('[data-c]', box).forEach((d) => d.appendChild(this.kanvas(t, +d.dataset.c, 300)));
  },
  paintGrid() {
    if (!this.rows) return;
    const rows = this.vis(), box = $('#tp-grid', this.el);
    $('#tp-n', this.el).textContent = rows.length + ' ' + tr('template', 'templates');
    box.innerHTML = rows.length ? rows.map((t, i) => {
      const L = this.isiStruktur(t);
      return '<article class="flip" style="border-radius:var(--r-lg)"><div class="flip-in"><div class="flip-f card col gap-10 hover" style="height:100%"><div class="rel" style="height:220px;border-radius:16px;overflow:hidden;padding:12px;background:#EFEAE1 radial-gradient(#ddd5c8 .8px, transparent .8px) 0 0/16px 16px" data-k="' + h(t.ID) + '"><span class="pill sm mono p-ink" style="position:absolute;left:10px;top:10px;z-index:2">' + h(jenisLabel(t.Jenis)) + ' ' + h(this.rasio(t)) + '</span><span class="pill sm mono" style="position:absolute;right:10px;bottom:10px;z-index:2;background:rgba(255,255,255,.9)">' + Fmt.k(t.Pemakaian) + tr(' dipakai', ' uses') + '</span></div>' +
        '<div class="row between"><span class="label">' + tr('Arketipe', 'Archetype') + ' #' + h(String(i + 1).padStart(2, '0')) + ' · ' + h(t.Platform) + '</span><span class="mono xs">★ ' + Number(t.Rating || 0).toFixed(2) + '</span></div><h3 class="h3">' + h(t.Nama) + '</h3><p class="small muted clamp-3">' + h(t.Deskripsi) + '</p>' +
        '<div class="col gap-4 grow">' + L.slice(0, 4).map((x) => '<div class="row gap-8 xs"><span class="mono tert">' + h(x[0]) + '</span><span class="clamp-1">' + h(x[1]) + '</span></div>').join('') + (L.length > 4 ? '<span class="xs tert">+' + (L.length - 4) + tr(' lagi', ' more') + '</span>' : '') + '</div>' +
        '<div class="row gap-6"><button class="btn btn-sage btn-sm grow" data-act="pakai" data-id="' + h(t.ID) + '">' + ic('auto_awesome', 'sm') + tr('Pakai', 'Use') + '</button><button class="icon-btn sm" data-act="flip" aria-label="' + tr('Lihat struktur', 'View structure') + '">' + ic('cached', 'sm') + '</button><button class="icon-btn sm" data-act="pilih" data-id="' + h(t.ID) + '" aria-label="Spotlight">' + ic('tune', 'sm') + '</button><button class="icon-btn sm" data-act="menu" data-id="' + h(t.ID) + '" aria-label="' + tr('Opsi', 'Options') + '">' + ic('more_vert', 'sm') + '</button></div></div>' +
        '<div class="flip-b card ink col gap-10"><div class="row between"><span class="label" style="color:#cfc8bd">' + tr('Struktur blueprint', 'Blueprint structure') + '</span><button class="icon-btn sm" data-act="flip" style="background:rgba(255,255,255,.1);color:#fff" aria-label="' + tr('Kembali', 'Back') + '">' + ic('close', 'sm') + '</button></div><h3 class="h3" style="color:#fff">' + h(t.Nama) + '</h3>' +
        '<div class="col gap-6">' + (L.length ? L.map((x) => '<div class="row gap-10 small" style="border-bottom:1px dashed rgba(255,255,255,.15);padding:6px 0"><span class="mono" style="color:var(--blush-2)">' + h(x[0]) + '</span><span>' + h(x[1]) + '</span></div>').join('') : '<p class="small" style="opacity:.7">' + tr('Struktur bebas.', 'Free-form structure.') + '</p>') + '</div>' +
        (pj(t.Struktur, {}).hookFormula ? '<div class="mini" style="background:rgba(255,255,255,.08);color:#fff;border-color:transparent"><span class="label" style="color:#cfc8bd">Hook formula</span><div class="small mt-4">' + h(pj(t.Struktur, {}).hookFormula) + '</div></div>' : '') +
        '<button class="btn btn-blush btn-sm mt-8" data-act="pakai" data-id="' + h(t.ID) + '">' + tr('Pakai template ini', 'Use this template') + ' →</button></div></div></article>';
    }).join('') : '<div class="span-2">' + UI.empty('search_off', tr('Tidak ada template yang cocok', 'No matching templates')) + '</div>';
    $$('[data-k]', box).forEach((d) => { const t = this.get(d.dataset.k); if (t) d.appendChild(this.kanvas(t, 0, 360)); });
  },
  paintBlue() {
    const t = this.get(this.sel), box = $('#tp-blue', this.el); if (!t) { box.innerHTML = ''; return; }
    const kits = App.kits(), pilar = App.pilar();
    box.innerHTML = '<div class="row between wrap gap-12"><div><div class="row gap-8 wrap"><span class="pill mono p-sage">' + tr('Remix arketipe', 'Archetype remixer') + '</span><span class="label">' + tr('Generator preset langsung', 'Live preset generator') + '</span></div><h2 class="h1 mt-12" style="font-size:32px">' + tr('Kustomisasi blueprint terpilih', 'Customize selected blueprint') + '</h2><p class="muted mt-4">' + tr('Atur nada, palet, dan watermark sebelum dikirim ke AI Content Generator atau Graphic Studio.', 'Adjust tone, palette and watermark before sending to the AI Content Generator or Graphic Studio.') + '</p></div><div class="tr"><div class="label">' + tr('Target aktif', 'Active target') + '</div><div class="mono small mt-4">' + h(t.ID) + '</div><div class="small muted">(' + h(t.Nama) + ')</div></div></div>' +
      '<div class="grid g4 mt-24" style="gap:12px"><div class="inset col gap-8"><span class="label">01 // Branding preset</span><select class="sel sm" id="bp-kit">' + opts(kits.map((k) => ({ v: k.ID, l: k.Nama + (k.Default === 'YA' ? ' (Default)' : '') })), this.kitId) + '</select><span class="xs muted">' + tr('Warna, tipografi & badge.', 'Colors, typography & badges.') + '</span></div>' +
      '<div class="inset col gap-8"><span class="label">02 // Content pillar</span><select class="sel sm" id="bp-pilar">' + opts([{ v: '', l: '— auto —' }].concat(pilar.map((p) => ({ v: p.nama, l: p.nama }))), this.pilar) + '</select><span class="xs muted">' + tr('Menentukan framing konten.', 'Sets the content framing.') + '</span></div>' +
      '<div class="inset col gap-8"><span class="label">03 // Studio watermark</span><label class="row between small"><span>' + tr('Tampilkan watermark', 'Embed watermark') + '</span><span class="sw"><input type="checkbox" id="bp-wm"' + (this.wm ? ' checked' : '') + '><i></i></span></label><span class="xs muted">' + tr('Melindungi aset saat dibagikan.', 'Protects assets when shared.') + '</span></div>' +
      '<div class="inset col gap-8"><span class="label">04 // Hook angle</span><select class="sel sm" id="bp-angle">' + opts(this.ANGLE, this.angle) + '</select><span class="xs muted">' + tr('Intensitas & sudut pembuka.', 'Opening intensity & angle.') + '</span></div></div>' +
      '<div class="row between wrap gap-12 mt-24"><span class="row gap-8 small"><span class="dot pulse" style="background:var(--sage-ink)"></span>' + tr('Siap dikompilasi dengan variabel brand saat ini', 'Ready to compile with current brand variables') + '</span><div class="row wrap gap-8"><button class="btn btn-blush" data-act="lihat" data-id="' + h(t.ID) + '">' + ic('visibility', 'sm') + tr('Pratinjau semua slide', 'Preview all slides') + '</button><button class="btn btn-ink shine" data-act="kirim">' + tr('Kirim ke AI Content Generator (W-04)', 'Send to AI Content Generator (W-04)') + ' →</button></div></div>';
    $('#bp-kit', box).onchange = async (e) => { this.kitId = e.target.value; this.kitSiap = await Engine.siapkanKit(App.kit(this.kitId)); this.paintSpot(); this.paintGrid(); };
    $('#bp-pilar', box).onchange = (e) => { this.pilar = e.target.value; };
    $('#bp-angle', box).onchange = (e) => { this.angle = e.target.value; };
    $('#bp-wm', box).onchange = (e) => { this.wm = e.target.checked; this.paintSpot(); this.paintGrid(); };
  },
  paintTbl() {
    if (!this.rows) return;
    const rows = this.urut((this.rows || []).filter((t) => !this.q || (t.Nama + ' ' + t.Jenis + ' ' + t.Platform + ' ' + t.Tema).toLowerCase().indexOf(this.q) > -1));
    const kitNama = (id) => (App.kit(id) && App.kit(id).ID === id ? App.kit(id).Nama : id || '—');
    $('#tp-tbl', this.el).innerHTML = '<table class="tbl"><thead><tr><th>ID</th><th>' + tr('Nama arketipe', 'Archetype') + '</th><th>Format</th><th>Branding Kit</th><th>' + tr('Tema', 'Theme') + '</th><th class="tr">' + tr('Dipakai', 'Uses') + '</th><th class="tr">Rating</th><th>Status</th><th></th></tr></thead><tbody>' +
      rows.map((t) => '<tr><td class="mono xs">' + h(t.ID) + '</td><td class="sb">' + h(t.Nama) + '</td><td><div class="row gap-4 wrap">' + jenisPill(t.Jenis) + platPill(t.Platform) + '</div></td><td class="small">' + h(kitNama(t.KitID)) + '</td><td class="small">' + h(t.Tema) + '</td><td class="tr num">' + Fmt.n(t.Pemakaian) + '</td><td class="tr num">' + Number(t.Rating || 0).toFixed(2) + '</td><td><span class="pill sm mono ' + (t.Status === 'Aktif' ? 'p-ok' : t.Status === 'Arsip' ? 'p-line' : 'p-butter') + '">' + h(t.Status) + '</span>' + '</td><td><div class="row gap-6" style="justify-content:flex-end;flex-wrap:nowrap"><button class="btn btn-sage btn-xs" data-act="pakai" data-id="' + h(t.ID) + '">' + tr('Pakai', 'Use') + '</button><button class="icon-btn sm ghost" data-act="edit" data-id="' + h(t.ID) + '" aria-label="Edit">' + ic('edit', 'sm') + '</button></div></td></tr>').join('') + '</tbody></table>';
  },
  pakai(id) { Router.go('generator', { template: id, pilar: this.pilar, angle: this.angle }); },
  kirim() { if (this.kitId !== App.kitId()) { Store.set('kit', this.kitId); App.paintShellState(); } this.pakai(this.sel); },
  menu(b) {
    const t = this.get(b.dataset.id); if (!t) return;
    UI.pop(b, [{ icon: 'tune', label: 'Spotlight & remix', fn: () => { this.sel = t.ID; this.paintSpot(); this.paintBlue(); $('#tp-spot', this.el).scrollIntoView({ behavior: 'smooth' }); } }, { icon: 'visibility', label: tr('Pratinjau slide', 'Preview slides'), fn: () => this.lihat(t.ID) }, { icon: 'edit', label: 'Edit', fn: () => this.form(t) }, { icon: 'content_copy', label: tr('Duplikat', 'Duplicate'), fn: () => this.dup(t.ID) },
      { icon: 'inventory_2', label: t.Status === 'Arsip' ? tr('Aktifkan lagi', 'Restore') : tr('Arsipkan', 'Archive'), fn: () => this.simpan(Object.assign({}, t, { Status: t.Status === 'Arsip' ? 'Aktif' : 'Arsip' })) }, '-', { icon: 'delete', label: tr('Hapus', 'Delete'), danger: true, fn: () => this.hapus(t) }]);
  },
  lihat(id) {
    const t = this.get(id); if (!t) return;
    const n = this.contoh(t).length;
    const m = UI.modal({ title: t.Nama, kicker: h(t.ID) + ' · ' + h(this.rasio(t)), size: 'wide', body: '<div class="thumbs" id="tp-all" style="gap:12px"></div><p class="xs muted mt-12">' + tr('Pratinjau memakai Branding Kit terpilih; teks contoh diganti otomatis saat Generate.', 'Preview uses the selected Branding Kit; sample text is replaced when you Generate.') + '</p>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Tutup', 'Close') + '</button><button class="btn btn-ink" id="tp-use">' + tr('Pakai template', 'Use template') + ' →</button>' });
    const box = $('#tp-all', m.el);
    for (let i = 0; i < n; i++) { const d = document.createElement('div'); d.style.cssText = 'flex:none;width:200px'; const c = this.kanvas(t, i, 220); c.style.height = 'auto'; d.appendChild(c); box.appendChild(d); }
    $('#tp-use', m.el.parentNode).onclick = () => { m.close(); this.pakai(t.ID); };
  },
  async dup(id) {
    const t = this.get(id); if (!t) return;
    const r = await API.call('template.save', Object.assign({}, t, { ID: '', Nama: t.Nama + ' (copy)', Status: 'Aktif' }));
    if (r.success) { this.rows.push(r.data); this.sel = r.data.ID; this.paintAll(); }
  },
  async simpan(d) {
    const r = await API.call('template.save', d);
    if (r.success) { const i = this.rows.findIndex((x) => x.ID === r.data.ID); if (i > -1) this.rows[i] = r.data; else this.rows.push(r.data); this.paintAll(); }
    return r;
  },
  async hapus(t) {
    if (!(await UI.confirm(tr('Hapus template "' + t.Nama + '"? Konten yang sudah dibuat tidak terpengaruh.', 'Delete template "' + t.Nama + '"? Existing content is not affected.'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    const r = await API.call('template.delete', { id: t.ID });
    if (r.success) { this.rows = this.rows.filter((x) => x.ID !== t.ID); if (this.sel === t.ID) this.sel = ''; this.paintAll(); }
  },
  form(t) {
    t = t || { Nama: '', Jenis: 'Carousel', Platform: 'Instagram', Tema: 'Edukasi', KitID: App.kitId(), Deskripsi: '', Rating: 4.5, Status: 'Aktif', Struktur: '{}' };
    const st = pj(t.Struktur, {}), slides = (st.slides || []).map((s) => s.peran + (s.layout ? ' | ' + s.layout : '')).join('\n'), lain = st.segmen || st.bagian || st.hari || [];
    const m = UI.modal({ title: t.ID ? tr('Edit template', 'Edit template') : tr('Template master baru', 'New master template'), kicker: 'Template Library', size: 'wide',
      body: '<form class="col gap-12" id="tpf"><div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Nama', 'Name') + '</label><input class="inp" name="Nama" required value="' + h(t.Nama) + '"></div><div class="field"><label>' + tr('Tema / pilar', 'Theme / pillar') + '</label><input class="inp" name="Tema" value="' + h(t.Tema) + '"></div></div>' +
        '<div class="grid g4" style="gap:12px"><div class="field"><label>Format</label><select class="sel" name="Jenis">' + opts(JENIS, t.Jenis, jenisLabel) + '</select></div><div class="field"><label>Platform</label><select class="sel" name="Platform">' + opts(PLATFORM, t.Platform) + '</select></div><div class="field"><label>' + tr('Rasio', 'Ratio') + '</label><select class="sel" name="rasio">' + opts([{ v: '', l: 'auto' }, '4:5', '1:1', '9:16', '16:9'], st.rasio || '') + '</select></div><div class="field"><label>Branding Kit</label><select class="sel" name="KitID">' + opts(App.kits().map((k) => ({ v: k.ID, l: k.Nama })), t.KitID) + '</select></div></div>' +
        '<div class="field"><label>' + tr('Deskripsi', 'Description') + '</label><textarea class="ta" name="Deskripsi" rows="2">' + h(t.Deskripsi) + '</textarea></div>' +
        '<div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Slide / scene (satu per baris: Peran | layout)', 'Slides / scenes (one per line: Role | layout)') + '</label><textarea class="ta mono" name="slides" rows="7" placeholder="Hook | hook\nMasalah | masalah\nKerangka | poin\nCTA | cta">' + h(slides) + '</textarea><span class="hint">Layout: ' + Engine.LAYOUTS.join(', ') + '</span></div>' +
        '<div class="col gap-12"><div class="field"><label>' + tr('Bagian / urutan lain (opsional, satu per baris)', 'Sections / other sequence (optional, one per line)') + '</label><textarea class="ta" name="lain" rows="3">' + h(lain.join('\n')) + '</textarea></div><div class="grid g2" style="gap:12px"><div class="field"><label>Caption framework</label><select class="sel" name="captionFramework">' + opts(['', 'AIDA', 'PAS', 'BAB', '4C', 'Storytelling'], st.captionFramework || '') + '</select></div><div class="field"><label>Rating</label><input class="inp" type="number" step="0.01" min="0" max="5" name="Rating" value="' + h(t.Rating) + '"></div></div><div class="field"><label>Hook formula</label><input class="inp" name="hookFormula" value="' + h(st.hookFormula || '') + '" placeholder="Kenapa 90% {topik} gagal…"></div></div></div>' +
        '<div class="field"><label>Status</label><div class="seg" id="tpf-st">' + ['Aktif', 'Draf', 'Arsip'].map((s) => '<button type="button" class="' + (t.Status === s ? 'on' : '') + '" data-s="' + s + '">' + s + '</button>').join('') + '</div></div></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="tpf-ok">' + ic('save', 'sm') + tr('Simpan template', 'Save template') + '</button>' });
    let status = t.Status || 'Aktif';
    $('#tpf-st', m.el).onclick = (e) => { const b = e.target.closest('[data-s]'); if (!b) return; status = b.dataset.s; $$('#tpf-st button', m.el).forEach((x) => x.classList.toggle('on', x === b)); };
    $('#tpf-ok', m.el.parentNode).onclick = async (e) => {
      const v = formVals($('#tpf', m.el)); if (!v.Nama.trim()) return UI.toast(tr('Nama wajib diisi.', 'Name is required.'), 'warn');
      const s = Object.assign({}, st, { format: v.Jenis }); delete s.segmen; delete s.bagian; delete s.hari;
      if (v.rasio) s.rasio = v.rasio; else delete s.rasio;
      if (v.captionFramework) s.captionFramework = v.captionFramework; else delete s.captionFramework;
      if (v.hookFormula.trim()) s.hookFormula = v.hookFormula.trim(); else delete s.hookFormula;
      const sl = v.slides.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => { const p = x.split('|').map((y) => y.trim()); return { peran: p[0], layout: Engine.LAYOUTS.indexOf(p[1]) > -1 ? p[1] : '' }; });
      if (sl.length) s.slides = sl; else delete s.slides;
      const ln = v.lain.split('\n').map((x) => x.trim()).filter(Boolean); if (ln.length) s[st.segmen ? 'segmen' : st.hari ? 'hari' : 'bagian'] = ln;
      UI.busy(e.currentTarget, true);
      const r = await this.simpan({ ID: t.ID || '', Nama: v.Nama, Jenis: v.Jenis, Platform: v.Platform, Tema: v.Tema, KitID: v.KitID, Deskripsi: v.Deskripsi, Rating: v.Rating, Status: status, Struktur: s });
      UI.busy(e.currentTarget, false); if (r.success) { m.close(); this.sel = r.data.ID; this.paintSpot(); this.paintBlue(); }
    };
  },
  ekspor() {
    const rows = (this.rows || []).map((t) => ({ ID: t.ID, Nama: t.Nama, Format: t.Jenis, Platform: t.Platform, Tema: t.Tema, KitID: t.KitID, Rasio: this.rasio(t), Struktur: this.isiStruktur(t).map((x) => x[1]).join(' → '), Dipakai: t.Pemakaian, Rating: t.Rating, Status: t.Status }));
    Export.xlsx(rows, 'Template-Library-' + Fmt.today(), 'Template');
  }
});
