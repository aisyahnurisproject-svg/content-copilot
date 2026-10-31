/* Modul 4 — AI Content Generator: ide → konten multi-format (slide, caption, CTA, musik, watermark), bank ide, repositori */
'use strict';
Pages.def('generator', {
  FORMATS: [['Carousel', 'view_carousel', 'Carousel Swipe Deck (7 Slides)'], ['Video Pendek', 'movie', 'Reels / Short Video (45s)'], ['Infografis', 'insert_chart', 'Infographic Teardown'], ['Story', 'amp_stories', 'Story Funnel (Poll + CTA)'], ['Thread', 'forum', 'Thread Stack'], ['Caption', 'notes', 'Single Caption'], ['Artikel', 'article', 'Longform / Newsletter'], ['Foto', 'image', 'Single Photo']],
  ANGLE: ['Pain-Agitate-Solve', 'Contrarian', 'Curiosity Gap', 'Story Arch', 'Before & After', 'Data & Proof', 'Relatable'],
  marquee() { return ['Blueprint SYS // GEN_CORE', 'Sheets: [IDE_KONTEN & KONTEN]', 'Engine: ' + (((App.boot || {}).ai || {}).label || 'Template Engine') + ' + batch scheduler', 'Watermark & music auto-attached']; },
  render(el, params) {
    if (typeof Engine === 'undefined') { el.innerHTML = '<div class="grid g3">' + UI.sk(3) + '</div>'; App.need('engine').then(() => { if (App.cur === this) this.render(el, params); }); return; }
    this.el = el; this.tab = params.tab || 'studio'; this.k = null; this.si = 0; this.meta = null;
    this.f = { format: params.format || 'Carousel', platform: params.platform || 'Instagram', pilar: params.pilar || ((App.pilar()[0] || {}).nama || ''), produkId: '', angle: params.angle || 'Pain-Agitate-Solve', topik: params.topik || '', hook: params.hook || '', templateId: params.template || '', jumlahSlide: 7 };
    bindActs(el, {
      tab: (b) => { this.tab = b.dataset.t; this.paint(); }, fmt: (b) => { this.syncForm(); this.f.format = b.dataset.v; this.f.jumlahSlide = b.dataset.v === 'Carousel' ? 7 : 5; this.paint(); },
      gen: (b) => this.generate(b), reroll: (b) => this.generate(b, true), preset: () => this.presets(), sync: () => { API.markStale(); App.refreshBoot(); this.paint(); UI.toast(tr('Disinkronkan dengan Sheets & Drive', 'Synced with Sheets & Drive'), 'ok'); },
      batch: () => this.batch(), slide: (b) => { this.syncInspector(); this.si = +b.dataset.i; this.paintDeck(); },
      addSlide: () => { this.syncInspector(); const s = this.slides(); s.splice(this.si + 1, 0, { judul: tr('Slide baru', 'New slide'), isi: '' }); this.si++; this.setSlides(s); this.paintDeck(); },
      delSlide: () => { const s = this.slides(); if (s.length <= 1) return; s.splice(this.si, 1); this.si = Math.max(0, this.si - 1); this.setSlides(s); this.paintDeck(); },
      up: () => { this.syncInspector(); const s = this.slides(); if (this.si < 1) return; [s[this.si - 1], s[this.si]] = [s[this.si], s[this.si - 1]]; this.si--; this.setSlides(s); this.paintDeck(); },
      saveDeck: (b) => this.save(b), review: (b) => this.save(b, 'Review'), json: () => Files.download((this.k.ID || 'deck') + '.json', JSON.stringify({ konten: this.k, slides: this.slides() }, null, 2), 'application/json'),
      graphic: () => Router.go('graphic', { id: this.k.ID }), jadwal: () => this.jadwal(this.k), repurpose: () => Router.go('repurpose', { id: this.k.ID }), copy: () => Router.go('copy', { id: this.k.ID }),
      open: (b) => this.open(b.dataset.id), toGraphic: (b) => Router.go('graphic', { id: b.dataset.id }), toCal: (b) => this.jadwal({ ID: b.dataset.id, Platform: b.dataset.p }),
      genIde: (b) => this.genIde(b), ideKonten: (b) => this.ideKonten(b), ideDel: (b) => this.ideDel(b.dataset.id), del: (b) => this.hapus([b.dataset.id]), bulkDel: () => this.hapus(this.cek()),
      xlsx: () => this.exportRepo(), dup: (b) => this.dup(b.dataset.id), baru: () => { this.k = null; this.si = 0; this.tab = 'studio'; this.paint(); }
    });
    el.addEventListener('input', (e) => { if (e.target.closest('#gen-insp')) this.previewSoon(); });
    el.addEventListener('change', (e) => { if (e.target.id === 'insp-wm' || e.target.id === 'insp-fmt') this.previewSoon(); if (e.target.closest('#repo-f')) this.paintRepo(); if (e.target.id === 'chk-all') $$('.chk-k', this.el).forEach((c) => { c.checked = e.target.checked; }); });
    this.paint();
    if (params.id) this.open(params.id);
    else if (params.template) this.pakaiTemplate(params.template);
  },
  onKit() { if (this.k) this.preview(); },
  /* ---------------- shell tab ---------------- */
  paint() {
    const el = this.el, t = this.tab;
    el.innerHTML = '<div class="row between wrap gap-16"><div class="col gap-8"><div class="row gap-8"><span class="pill mono p-ink">MOD-04</span><span class="label">Architecture workspace</span></div><h1 class="h1">AI Content Generator Studio</h1><p class="serif" style="font-size:20px;font-style:italic;color:var(--ink-2)">orchestrate high-converting multi-format content blueprints.</p></div>' +
      '<div class="col gap-8" style="align-items:flex-end"><div class="row gap-8 wrap"><button class="btn btn-ghost btn-sm" data-act="preset">' + ic('dashboard_customize', 'sm') + tr('Muat Preset', 'Load Presets') + '</button><button class="btn btn-ghost btn-sm" data-act="sync">' + ic('cloud_sync', 'sm') + 'Sync Sheets & Drive</button></div><button class="btn btn-ink shine" data-act="batch">' + ic('bolt', 'sm') + tr('Batch 7 Hari Sekaligus', 'Batch Generate 7-Day Matrix') + '</button></div></div>' +
      '<div class="seg mt-24" role="tablist">' + [['studio', tr('Studio', 'Studio')], ['ide', tr('Bank Ide', 'Idea Bank')], ['repo', tr('Repositori Konten', 'Content Repository')]].map((x) => '<button role="tab" class="' + (t === x[0] ? 'on' : '') + '" data-act="tab" data-t="' + x[0] + '">' + x[1] + '</button>').join('') + '</div><div id="gen-body" class="mt-16"></div>';
    if (t === 'ide') return this.paintIde();
    if (t === 'repo') return this.paintRepoShell();
    this.paintStudio();
  },
  paintStudio() {
    const f = this.f, kit = App.kit(), pilar = App.pilar(), nada = String((kit || {}).Nada || '').split(/,\s*/).filter(Boolean);
    $('#gen-body', this.el).innerHTML =
      '<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:start" id="gen-top">' +
      '<form class="card col gap-16" id="gen-form" onsubmit="return false"><div class="row between"><span class="label">' + tr('Strategy binding & channels', 'Strategy binding & channels') + '</span><span class="pill sm p-sage">' + (App.profil() ? '100% Brand Profile Synced' : tr('Lengkapi Brand DNA', 'Complete Brand DNA')) + '</span></div>' +
        '<div class="grid g3" style="gap:12px"><div class="field"><label>Content pillar</label><select class="sel sm" name="pilar">' + opts([{ v: '', l: '— auto —' }].concat(pilar.map((p) => ({ v: p.nama, l: p.nama }))), f.pilar) + '</select></div><div class="field"><label>' + tr('Produk tertaut', 'Digital product linked') + '</label><select class="sel sm" name="produkId"><option value="">—</option>' + opts(App.produk().map((p) => ({ v: p.ID, l: p.Nama })), f.produkId) + '</select></div><div class="field"><label>Hook angle preset</label><select class="sel sm" name="angle">' + opts(this.ANGLE, f.angle) + '</select></div></div>' +
        '<div class="row wrap gap-8"><span class="label">Format:</span>' + this.FORMATS.map((x) => '<button type="button" class="chip' + (f.format === x[0] ? ' on' : '') + '" data-act="fmt" data-v="' + h(x[0]) + '">' + ic(x[1], 'xs') + h(LANG === 'en' ? x[2] : jenisLabel(x[0])) + '</button>').join('') + '</div>' +
        '<div class="field"><label>' + tr('Topik / ide inti', 'Topic / core idea') + '</label><textarea class="ta" name="topik" rows="2" placeholder="' + tr('mis. 10 aturan produk digital yang laku saat kamu tidur', 'e.g. 10 rules for digital products that sell while you sleep') + '">' + h(f.topik) + '</textarea></div>' +
        '<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:12px"><div class="field"><label>Hook <span class="opt">' + tr('opsional', 'optional') + '</span></label><input class="inp sm" name="hook" value="' + h(f.hook) + '"></div><div class="field"><label>Platform</label><select class="sel sm" name="platform">' + opts(PLATFORM, f.platform) + '</select></div><div class="field"><label>' + (f.format === 'Video Pendek' ? tr('Scene', 'Scenes') : 'Slide') + '</label><input class="inp sm" type="number" name="jumlahSlide" min="3" max="12" value="' + f.jumlahSlide + '"></div></div>' +
        (f.templateId ? '<div class="pill p-butter">' + ic('folder_special', 'xs') + tr('Template aktif: ', 'Active template: ') + h(f.templateNama || f.templateId) + '</div>' : '') +
        '<div class="row between wrap gap-12"><span class="xs muted">' + tr('Setiap konten otomatis berisi caption, CTA, hashtag, rekomendasi musik, dan watermark kit aktif.', 'Every piece includes caption, CTA, hashtags, music picks, and the active kit watermark.') + '</span><button class="btn btn-ink shine" data-act="gen">' + ic('auto_awesome', 'sm') + tr('Generate Konten', 'Generate Content') + ' ✦</button></div></form>' +
      '<div class="card col gap-12"><div class="row between"><span class="label">Tone architecture & targets</span><span class="pill sm p-butter">Kit: ' + h((kit || {}).Nama || '-') + '</span></div><div class="small">Tone matrix: <b>' + h(nada.join(' + ') || '—') + '</b></div>' +
        '<div><div class="row between xs tert"><span>Editorial & authoritative</span><span>Casual hook</span></div><div class="bar mt-8"><i style="width:65%"></i></div></div><div class="row wrap gap-6">' + (pj((App.profil() || {}).Platform, ['Instagram'])).map((p) => '<span class="pill sm p-sage">✓ ' + h(p) + '</span>').join('') + '</div>' +
        '<div class="inset xs muted">' + tr('Audiens: ', 'Audience: ') + h(((App.profil() || {}).TargetAudiens || tr('belum diisi — buka Onboarding', 'not set — open Onboarding')).slice(0, 140)) + '</div><a class="link-mono" href="#/onboarding">[ ' + tr('Ubah Brand DNA', 'Edit Brand DNA') + ' ]</a></div></div>' +
      '<div id="gen-deck" class="mt-24"></div>' +
      '<section class="card mt-24"><div class="card-h"><div><div class="row gap-8"><div class="h2">Multi-Format Batch Output Queue</div><span class="pill sm p-sage" id="q-n">…</span></div><p class="xs muted">' + tr('Hasil generator terbaru — tersinkron ke Google Sheets & siap dikirim ke Graphic Studio.', 'Latest generator outputs — synced to Google Sheets & ready for Graphic Studio.') + '</p></div><button class="btn btn-ink btn-sm" data-act="tab" data-t="repo">' + ic('list', 'sm') + tr('Semua konten', 'All content') + '</button></div><div id="gen-queue">' + UI.sk(3, 'sk-line') + '</div></section>' +
      '<div class="grid g3 mt-16" style="gap:12px" id="gen-foot"></div>';
    if (innerWidth < 1100) $('#gen-top', this.el).style.gridTemplateColumns = 'minmax(0,1fr)';
    this.paintDeck(); this.paintQueue(); this.paintFoot();
  },
  syncForm() { const fm = $('#gen-form', this.el); if (fm) Object.assign(this.f, formVals(fm)); },
  paintFoot() {
    const box = $('#gen-foot', this.el); if (!box) return;
    const ai = (App.boot || {}).ai || {}, m = this.meta, sisa = ai.kuota ? Math.max(0, 100 - Math.round((100 * (ai.terpakai || 0)) / ai.kuota)) : 100;
    box.innerHTML = '<div class="tile row gap-12"><span class="ico-dot sm sage">' + ic('timer', 'sm') + '</span><div><div class="label">GAS execution time</div><div class="h3">' + (m ? (m.ms / 1000).toFixed(1) + 's' : '—') + ' <span class="small muted">/ 360s limit' + (m && m.cached ? ' (cached)' : '') + '</span></div></div></div>' +
      '<div class="tile"><div class="row between"><span class="label">Daily AI quota health</span><span class="mono xs">' + sisa + '% ' + tr('tersisa', 'left') + '</span></div><div class="bar mt-8"><i style="width:' + (100 - sisa) + '%"></i></div><div class="xs muted mt-4">' + (ai.terpakai || 0) + '/' + (ai.kuota || 150) + ' · ' + h(ai.provider === 'template' ? 'Template Engine (gratis)' : ai.label || '') + '</div></div>' +
      '<div class="tile row between"><div><div class="label">Batch payload size</div><div class="h3">' + (this.k ? Fmt.bytes(JSON.stringify(this.k).length) : '—') + ' <span class="small muted">JSON</span></div></div><span class="pill sm p-ok">OK</span></div>';
  },
  /* ---------------- deck preview + inspector ---------------- */
  slides() { return this.k ? pj(this.k.Slides, []) : []; },
  setSlides(s) { this.k.Slides = JSON.stringify(s); this.k._dirty = true; },
  paintDeck() {
    const box = $('#gen-deck', this.el); if (!box) return;
    const k = this.k;
    if (!k) { box.innerHTML = '<div class="card lg">' + UI.empty('auto_awesome', tr('Deck preview muncul di sini', 'Deck preview appears here'), tr('Pilih format, isi topik, lalu klik Generate. Atau buka konten dari antrean di bawah.', 'Pick a format, add a topic and Generate. Or open content from the queue below.')) + '</div>'; return; }
    const s = this.slides(), n = s.length, rasio = Engine.rasioDari ? Engine.rasioDari(k.Jenis, k.Platform) : '4:5', cur = s[this.si] || {};
    const musik = pj(k.MusikMedia, {}), kit = App.kit(k.KitID) || App.kit();
    const peran = (i) => i === 0 ? 'Hook' : i === n - 1 && n > 2 ? 'CTA' : i === 1 ? tr('Masalah', 'Pain') : tr('Poin', 'Point') + ' ' + (i - 1);
    box.innerHTML = '<div class="row between wrap gap-12 mb-12"><div class="row gap-10 wrap" style="gap:10px"><span class="pill mono p-ink">' + ('0' + n).slice(-2) + '</span><div class="h3">Deck Preview: “' + h(k.Judul) + '”</div><span class="pill sm p-sage">Ready (' + n + '/' + n + ')</span>' + (k._dirty ? '<span class="pill sm p-butter">' + tr('belum disimpan', 'unsaved') + '</span>' : '') + '</div>' +
      '<div class="row gap-8 wrap"><span class="xs muted">' + tr('Rasio', 'Aspect ratio') + ' ' + rasio + ' · Auto-branded: ' + h((kit || {}).WatermarkTeks || 'plm. studio') + '</span><button class="btn btn-ghost btn-sm" data-act="reroll">' + ic('refresh', 'sm') + 'Reroll</button><button class="btn btn-ink btn-sm" data-act="graphic">' + ic('play_arrow', 'sm') + tr('Kirim ke Graphic Studio', 'Push to Graphic Studio') + '</button></div></div>' +
      '<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(300px,1fr);align-items:start" id="deck-grid">' +
      '<div class="col gap-16"><div class="grid g3" style="gap:12px">' + s.map((x, i) => '<div class="slide-card' + (i === this.si ? ' is-sel' : '') + '" data-act="slide" data-i="' + i + '" role="button" tabindex="0"><div class="row between gap-6"><span class="pill sm mono ' + (i === 0 || i === n - 1 ? 'p-ink' : i % 2 ? 'p-sage' : 'p-blush') + '">Slide ' + ('0' + (i + 1)).slice(-2) + ': ' + h(peran(i)) + '</span>' + (i === 0 ? '<span>🍒</span>' : '') + '</div><div class="label" style="color:var(--blush-ink)">' + h(String(x.catatanVisual || '').slice(0, 34)) + '</div><div class="serif" style="font-size:' + (i === 0 ? 22 : 18) + 'px;font-weight:700;line-height:1.15">' + h(x.judul) + '</div><p class="xs muted clamp-3">' + h(x.isi) + '</p><div class="row between mono xs tert" style="margin-top:auto"><span>' + ('0' + (i + 1)).slice(-2) + ' of ' + ('0' + n).slice(-2) + '</span><span>' + (i === n - 1 ? 'save ✦' : 'swipe →') + '</span></div></div>').join('') + '</div>' +
        '<div class="card"><div class="grid g2" style="align-items:start"><div class="col gap-12"><div class="field"><label>Caption</label><textarea class="ta" id="k-cap" rows="9">' + h(k.Caption) + '</textarea><span class="xs muted" id="k-capn">' + String(k.Caption || '').length + tr(' karakter', ' chars') + '</span></div></div>' +
        '<div class="col gap-12"><div class="field"><label>CTA</label><input class="inp sm" id="k-cta" value="' + h(k.CTA) + '"></div><div class="field"><label>Hashtag</label><textarea class="ta" id="k-tag" rows="2">' + h(k.Hashtag) + '</textarea></div>' +
        '<div class="inset"><div class="label mb-8">🎵 ' + tr('Musik / media pendukung', 'Music / supporting media') + '</div><div class="small">' + h([musik.genre, musik.mood, musik.bpm ? musik.bpm + ' BPM' : ''].filter(Boolean).join(' · ') || '—') + '</div>' + (musik.saran ? '<div class="xs muted mt-4">' + h(musik.saran) + '</div>' : '') + '<div class="col gap-6 mt-8">' + (musik.pustaka || []).map((m) => '<a class="row between xs" href="' + h(m.URL || '#') + '" target="_blank" rel="noopener"><span class="row gap-6">' + ic(m.Jenis === 'SFX' ? 'graphic_eq' : 'music_note', 'xs') + h(m.Nama) + '</span><span class="mono tert">' + h(String(m.Lisensi || '').split(' ')[0]) + ' ↗</span></a>').join('') + '</div></div>' +
        '<label class="row between small"><span class="row gap-8">' + ic('verified', 'sm') + tr('Watermark brand', 'Brand watermark') + '</span><span class="sw"><input type="checkbox" id="k-wm"' + (k.Watermark !== 'TIDAK' ? ' checked' : '') + '><i></i></span></label>' +
        '<div class="row gap-8 wrap"><span class="pill sm p-lav">Skor hook ' + (k.SkorHook || '—') + '/100</span>' + stPill(k.Status) + (k.SumberRepurposing ? '<span class="pill sm p-line">↻ repurposed</span>' : '') + '</div></div></div>' +
        (k.Catatan ? '<div class="inset mt-12 xs"><b>' + tr('Catatan', 'Notes') + ':</b> ' + h(k.Catatan) + '</div>' : '') +
        '<div class="row wrap gap-8 mt-16"><button class="btn btn-ink btn-sm" data-act="saveDeck">' + ic('check_circle', 'sm') + tr('Simpan', 'Save') + '</button><button class="btn btn-blush btn-sm" data-act="review">' + ic('send', 'sm') + tr('Ajukan review', 'Submit for review') + '</button><button class="btn btn-ghost btn-sm" data-act="jadwal">' + ic('event', 'sm') + tr('Jadwalkan', 'Schedule') + '</button><button class="btn btn-ghost btn-sm" data-act="copy">' + ic('edit_note', 'sm') + 'Copy Studio</button><button class="btn btn-ghost btn-sm" data-act="repurpose">' + ic('sync_alt', 'sm') + 'Repurpose</button><span class="grow"></span><button class="btn btn-text" data-act="baru">+ ' + tr('Konten baru', 'New content') + '</button></div></div></div>' +
      '<aside class="card col gap-12" id="gen-insp" style="position:sticky;top:90px"><div class="row between"><span class="row gap-8">' + ic('tune', 'sm') + '<span class="label">Slide inspector [active: slide ' + ('0' + (this.si + 1)).slice(-2) + ']</span></span><span class="pill sm p-sage">Viral ' + (k.SkorHook || 90) + '/100</span></div>' +
        '<div class="field"><label>' + tr('Judul / headline', 'Headline copy') + '</label><textarea class="ta" rows="3" id="insp-j">' + h(cur.judul) + '</textarea></div>' +
        '<div class="field"><label>' + tr('Isi / subtitle', 'Subtitle / body') + '</label><textarea class="ta" rows="3" id="insp-i">' + h(cur.isi) + '</textarea></div>' +
        '<div class="field"><label>' + tr('Arahan visual (AI mockup)', 'Visual art direction') + '</label><textarea class="ta" rows="2" id="insp-v">' + h(cur.catatanVisual || '') + '</textarea></div>' +
        '<div class="canvas-stage" style="min-height:220px;padding:12px" id="insp-prev"></div>' +
        '<div class="row between"><label class="check sq small"><input type="checkbox" id="insp-wm"' + (k.Watermark !== 'TIDAK' ? ' checked' : '') + '> Inject studio watermark</label><select class="sel sm" id="insp-fmt" style="width:auto">' + opts(Object.keys(Engine.FORMATS), rasio) + '</select></div>' +
        '<div class="row gap-6"><button class="btn btn-ghost btn-xs" data-act="up">' + ic('arrow_upward', 'xs') + tr('Naik', 'Up') + '</button><button class="btn btn-ghost btn-xs" data-act="addSlide">' + ic('add', 'xs') + 'Slide</button><button class="btn btn-danger btn-xs" data-act="delSlide">' + ic('delete', 'xs') + '</button></div>' +
        '<button class="btn btn-ink btn-block" data-act="saveDeck">' + ic('check_circle', 'sm') + tr('Simpan perubahan deck', 'Save changes to deck') + '</button><button class="btn btn-ghost btn-block btn-sm" data-act="json">' + ic('download', 'sm') + 'Download slide JSON payload</button></aside></div>';
    if (innerWidth < 1100) $('#deck-grid', this.el).style.gridTemplateColumns = 'minmax(0,1fr)';
    $('#k-cap', this.el).addEventListener('input', (e) => { $('#k-capn', this.el).textContent = e.target.value.length + tr(' karakter', ' chars'); this.k._dirty = true; });
    this.preview();
  },
  syncInspector() {
    if (!this.k || !$('#insp-j', this.el)) return;
    const s = this.slides(), cur = s[this.si]; if (!cur) return;
    const j = $('#insp-j', this.el).value, i = $('#insp-i', this.el).value, v = $('#insp-v', this.el).value;
    if (cur.judul !== j || cur.isi !== i || (cur.catatanVisual || '') !== v) { cur.judul = j; cur.isi = i; cur.catatanVisual = v; this.setSlides(s); }
  },
  previewSoon: debounce(function () { this.syncInspector(); this.preview(); const c = $$('.slide-card', this.el)[this.si]; if (c && this.slides()[this.si]) { $('.serif', c).textContent = this.slides()[this.si].judul; $('p', c).textContent = this.slides()[this.si].isi; } }, 220),
  async preview() {
    const box = $('#insp-prev', this.el); if (!box || !this.k) return;
    const kit = App.kit(this.k.KitID) || App.kit(), s = this.slides(), as = await Engine.siapkanKit(kit);
    const fmt = ($('#insp-fmt', this.el) || {}).value || '4:5', wm = ($('#insp-wm', this.el) || {}).checked !== false;
    const o = Engine.opsiDariKit(kit, { format: fmt, index: this.si, total: s.length, produk: (App.produk().find((p) => p.ID === this.k.ProdukID) || {}).Nama });
    o.watermark.aktif = wm; o.watermark.logo = as.logo;
    const c = Engine.thumb(s[this.si] || { judul: this.k.Judul }, o, 320);
    c.style.maxHeight = '300px';
    box.innerHTML = ''; box.appendChild(c);
    const lab = document.createElement('span'); lab.className = 'pill sm mono p-ink'; lab.style.cssText = 'position:absolute;left:12px;bottom:12px'; lab.textContent = 'Preview render: ' + Engine.FORMATS[fmt].join('×');
    box.appendChild(lab);
  },
  /* ---------------- aksi ---------------- */
  async generate(btn, reroll) {
    this.syncForm();
    const f = this.f;
    if (!reroll && !String(f.topik).trim()) { UI.toast(tr('Isi topik atau ide inti dulu.', 'Add a topic or core idea first.'), 'warn'); $('[name=topik]', this.el).focus(); return; }
    const data = reroll && this.k ? { topik: this.k.Tema || this.k.Judul, format: this.k.Jenis, platform: this.k.Platform, pilar: this.k.Pilar, produkId: this.k.ProdukID, kitId: this.k.KitID, fresh: true }
      : { topik: f.topik, hook: f.hook, format: f.format, platform: f.platform, pilar: f.pilar, produkId: f.produkId, hookAngle: f.angle, jumlahSlide: f.jumlahSlide, templateId: f.templateId, kitId: App.kitId() };
    UI.busy(btn, true, tr('AI menulis deck…', 'AI is writing…'));
    const r = await API.call('konten.generate', data, { toast: false });
    UI.busy(btn, false);
    if (!r.success) return;
    this.k = r.data.konten; this.meta = r.data.meta; this.si = 0;
    UI.toast(r.data.meta.fallback ? r.data.meta.pesan : r.message, r.data.meta.fallback ? 'warn' : 'ok');
    this.paintDeck(); this.paintQueue(); this.paintFoot();
    $('#gen-deck', this.el).scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  async open(id) {
    this.tab = 'studio';
    if (!$('#gen-deck', this.el)) this.paint();
    $('#gen-deck', this.el).innerHTML = '<div class="card lg">' + UI.sk(1, 'sk-line') + '<div class="grid g3 mt-16">' + UI.sk(3) + '</div></div>';
    const r = await API.read('konten.get', { id });
    if (!r.success) { UI.toast(r.message, 'err'); this.k = null; this.paintDeck(); return; }
    this.k = r.data; this.si = 0; this.paintDeck(); this.paintFoot();
  },
  async save(btn, status) {
    if (!this.k) return;
    this.syncInspector();
    const k = this.k, d = { ID: k.ID, Slides: this.slides(), Caption: $('#k-cap', this.el).value, CTA: $('#k-cta', this.el).value, Hashtag: $('#k-tag', this.el).value, Watermark: $('#k-wm', this.el).checked };
    if (status) d.Status = status;
    UI.busy(btn, true);
    const r = await API.call('konten.save', d, { toast: false });
    UI.busy(btn, false);
    if (r.success) { this.k = r.data; UI.toast(status === 'Review' ? tr('Diajukan ke Preview & Approval ✓', 'Submitted to Preview & Approval ✓') : tr('Deck tersimpan ke Sheets ✓', 'Deck saved to Sheets ✓'), 'ok'); this.paintDeck(); this.paintQueue(); }
  },
  jadwal(k) { Shared.jadwal(k); },
  async dup(id) { const r = await API.call('konten.duplicate', { id }); if (r.success) { this.k = r.data; this.si = 0; this.tab = 'studio'; this.paint(); } },
  presets() {
    API.swr('template.list', {}, { maxAge: 120000, onData: (rows) => {
      if (this._pm) this._pm.close();
      const m = this._pm = UI.modal({ title: tr('Muat preset dari Template Library', 'Load a preset from Template Library'), size: 'wide', onClose: () => { this._pm = null; },
        body: '<div class="grid g3" style="gap:12px">' + rows.filter((t) => t.Status !== 'Arsip').map((t) => '<button class="tile" style="text-align:left" data-tid="' + h(t.ID) + '"><div class="row between">' + jenisPill(t.Jenis) + '<span class="mono xs tert">★ ' + Number(t.Rating || 0).toFixed(2) + '</span></div><div class="h4 mt-8">' + h(t.Nama) + '</div><p class="xs muted mt-4 clamp-3">' + h(t.Deskripsi) + '</p></button>').join('') + '</div>' });
      m.el.onclick = (e) => { const b = e.target.closest('[data-tid]'); if (!b) return; m.close(); this.pakaiTemplate(b.dataset.tid, rows); };
    } });
  },
  async pakaiTemplate(id, rows) {
    if (!rows) { const r = await API.read('template.list', {}); rows = r.success ? r.data : []; }
    const t = rows.find((x) => x.ID === id); if (!t) return;
    const st = pj(t.Struktur, {});
    this.syncForm();
    Object.assign(this.f, { templateId: t.ID, templateNama: t.Nama, format: t.Jenis, platform: t.Platform, jumlahSlide: (st.slides || []).length || this.f.jumlahSlide });
    API.call('template.pakai', { id: t.ID }, { toast: false, silent: true, noBootRefresh: true });
    this.tab = 'studio'; this.paint();
    UI.toast(tr('Preset "' + t.Nama + '" dimuat — isi topik lalu Generate.', 'Preset "' + t.Nama + '" loaded — add a topic and Generate.'), 'ok');
  },
  paintQueue() {
    API.swr('konten.list', { limit: 8 }, { maxAge: 15000, onData: (d) => {
      const box = $('#gen-queue', this.el); if (!box) return;
      $('#q-n', this.el).textContent = d.total + ' ' + tr('item', 'items');
      const ps = {}; App.produk().forEach((p) => { ps[p.ID] = p; });
      box.innerHTML = d.rows.length ? '<div class="tbl-wrap" style="border:0;max-height:none"><table class="tbl"><thead><tr><th>' + tr('Judul & konsep', 'Title & concept blueprint') + '</th><th>Format</th><th class="hide-sm">' + tr('Pilar & produk', 'Pillar & product') + '</th><th>Hook</th><th>Status</th><th class="tr">' + tr('Aksi', 'Ops') + '</th></tr></thead><tbody>' +
        d.rows.map((k) => '<tr><td><button data-act="open" data-id="' + h(k.ID) + '" style="text-align:left"><div class="sb clamp-1">' + h(k.Judul) + '</div><div class="xs muted mono">' + h(k.ID) + ' · ' + h(Fmt.rel(k.DiperbaruiPada)) + '</div></button></td><td>' + jenisPill(k.Jenis) + '</td><td class="hide-sm"><div class="small clamp-1">' + h(k.Pilar || '—') + '</div><div class="xs muted clamp-1">' + h((ps[k.ProdukID] || {}).Nama || '') + '</div></td><td><span class="pill sm mono ' + (k.SkorHook >= 90 ? 'p-sage' : 'p-line') + '">' + (k.SkorHook || '—') + '/100 ✦</span></td><td>' + stPill(k.Status) + '</td><td class="tr nowrap"><button class="icon-btn sm ghost" data-act="toCal" data-id="' + h(k.ID) + '" data-p="' + h(k.Platform) + '" aria-label="' + tr('Jadwalkan', 'Schedule') + '" title="' + tr('Jadwalkan', 'Schedule') + '">' + ic('calendar_add_on', 'sm') + '</button><button class="icon-btn sm ghost" data-act="toGraphic" data-id="' + h(k.ID) + '" aria-label="Graphic Studio" title="Graphic Studio">' + ic('palette', 'sm') + '</button><button class="icon-btn sm ghost" data-act="dup" data-id="' + h(k.ID) + '" aria-label="' + tr('Duplikat', 'Duplicate') + '" title="' + tr('Duplikat', 'Duplicate') + '">' + ic('content_copy', 'sm') + '</button></td></tr>').join('') + '</tbody></table></div>'
        : UI.empty('inventory_2', tr('Antrean kosong', 'Queue is empty'), tr('Konten yang Anda buat akan tampil di sini.', 'Content you create appears here.'));
    } });
  },
  /* ---------------- Batch 7 hari ---------------- */
  batch() {
    this.syncForm();
    const m = UI.modal({ title: tr('Batch Generate 7-Day Matrix', 'Batch Generate 7-Day Matrix'), kicker: tr('Produksi seminggu sekali klik', 'A week of content in one click'), size: 'wide', sticky: true,
      body: '<form class="grid g3" id="bt" style="gap:12px"><div class="field"><label>' + tr('Tema / kampanye minggu ini', "This week's theme / campaign") + '</label><input class="inp" name="tema" value="' + h(this.f.topik || '') + '" placeholder="' + tr('mis. soft launch e-book', 'e.g. e-book soft launch') + '"></div><div class="field"><label>' + tr('Mulai tanggal', 'Start date') + '</label><input class="inp" type="date" name="mulai" value="' + Fmt.addDays(Fmt.today(), 1) + '"></div><div class="field"><label>' + tr('Jam tayang', 'Publish time') + '</label><input class="inp" type="time" name="jam" value="09:00"></div><div class="field"><label>Platform</label><select class="sel" name="platform">' + opts(PLATFORM, this.f.platform) + '</select></div><div class="field"><label>' + tr('Produk', 'Product') + '</label><select class="sel" name="produkId"><option value="">—</option>' + opts(App.produk().map((p) => ({ v: p.ID, l: p.Nama })), this.f.produkId) + '</select></div><div class="field"><label>' + tr('Jumlah', 'Count') + '</label><input class="inp" type="number" name="jumlah" min="3" max="7" value="7"></div>' +
        '<label class="check full"><input type="checkbox" name="jadwalkan" checked> ' + tr('Langsung jadwalkan 1 konten/hari di Kalender', 'Auto-schedule 1 post/day in the Calendar') + '</label></form><div id="bt-log" class="col gap-8 mt-16"></div>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Tutup', 'Close') + '</button><button class="btn btn-ink" id="bt-go">' + ic('bolt', 'sm') + tr('Mulai batch', 'Start batch') + '</button>' });
    const root = m.el.parentNode;
    $('#bt-go', root).onclick = async (e) => {
      const v = formVals($('#bt', m.el)), log = $('#bt-log', m.el), btn = e.currentTarget;
      const add = (t, cls) => { const d = document.createElement('div'); d.className = 'tile row gap-10 small ' + (cls || ''); d.style.gap = '10px'; d.innerHTML = t; log.appendChild(d); return d; };
      UI.busy(btn, true, tr('Berjalan…', 'Running…'));
      const ide = await API.call('ide.generate', { jumlah: v.jumlah, tema: v.tema, platform: v.platform, produkId: v.produkId, kitId: App.kitId(), fresh: true }, { toast: false });
      if (!ide.success) { UI.busy(btn, false); return; }
      add(ic('lightbulb', 'sm') + '<b>' + ide.data.ide.length + tr(' ide dibuat', ' ideas created') + '</b> · ' + h(ide.data.meta.provider));
      const fm = ['Carousel', 'Video Pendek', 'Carousel', 'Story', 'Thread', 'Carousel', 'Video Pendek'];
      for (let i = 0; i < ide.data.ide.length; i++) {
        const it = ide.data.ide[i], row = add(ic('progress_activity', 'spin sm') + '<span class="grow">' + (i + 1) + '. ' + h(it.Hook) + '</span>');
        const r = await API.call('ide.toKonten', { id: it.ID, format: fm[i % fm.length], platform: v.platform, kitId: App.kitId() }, { toast: false, silent: true, noBootRefresh: true });
        if (!r.success) { row.innerHTML = ic('error', 'sm') + '<span class="grow">' + h(r.message) + '</span>'; continue; }
        let jad = '';
        if (v.jadwalkan) { const tgl = Fmt.addDays(v.mulai, i), j = await API.call('kalender.save', { KontenID: r.data.konten.ID, Tanggal: tgl, Jam: v.jam, Platform: v.platform }, { toast: false, silent: true, noBootRefresh: true }); if (j.success) jad = ' · ' + Fmt.tgl(tgl) + ' ' + v.jam; }
        row.innerHTML = ic('check_circle', 'sm') + '<span class="grow"><b>' + h(r.data.konten.Judul) + '</b><span class="xs muted"> · ' + h(jenisLabel(r.data.konten.Jenis)) + jad + '</span></span><button class="btn btn-ghost btn-xs" data-open="' + h(r.data.konten.ID) + '">' + tr('Buka', 'Open') + '</button>';
      }
      UI.busy(btn, false); btn.hidden = true;
      add(ic('celebration', 'sm') + '<b>' + tr('Selesai! Minggu ini sudah terisi ✦', 'Done! This week is filled ✦') + '</b>', 'is-sel');
      UI.confetti(); App.refreshBoot(true); this.paintQueue();
      log.onclick = (ev) => { const b = ev.target.closest('[data-open]'); if (b) { m.close(); this.open(b.dataset.open); } };
    };
  },
  /* ---------------- Bank Ide ---------------- */
  paintIde() {
    $('#gen-body', this.el).innerHTML = '<div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,2.4fr);align-items:start" id="ide-grid"><form class="card col gap-12" id="ide-f" onsubmit="return false"><div class="label">' + tr('Generator ide', 'Idea generator') + '</div><div class="field"><label>' + tr('Tema', 'Theme') + '</label><input class="inp sm" name="tema" placeholder="' + tr('mis. produktivitas guru', 'e.g. teacher productivity') + '"></div><div class="field"><label>Pilar</label><select class="sel sm" name="pilar"><option value="">auto</option>' + opts(App.pilar().map((p) => p.nama)) + '</select></div><div class="grid g2" style="gap:8px"><div class="field"><label>Format</label><select class="sel sm" name="format">' + opts(JENIS, 'Carousel', jenisLabel) + '</select></div><div class="field"><label>Platform</label><select class="sel sm" name="platform">' + opts(PLATFORM, 'Instagram') + '</select></div></div><div class="field"><label>' + tr('Produk', 'Product') + '</label><select class="sel sm" name="produkId"><option value="">—</option>' + opts(App.produk().map((p) => ({ v: p.ID, l: p.Nama }))) + '</select></div><div class="field"><label>' + tr('Jumlah', 'Count') + '</label><input class="inp sm" type="number" name="jumlah" value="6" min="1" max="12"></div><button class="btn btn-ink" data-act="genIde">' + ic('lightbulb', 'sm') + tr('Buat ide', 'Generate ideas') + '</button></form><div id="ide-list">' + UI.sk(3) + '</div></div>';
    if (innerWidth < 1000) $('#ide-grid', this.el).style.gridTemplateColumns = 'minmax(0,1fr)';
    API.swr('ide.list', {}, { maxAge: 15000, onData: (rows) => this.listIde(rows) });
  },
  listIde(rows) {
    const box = $('#ide-list', this.el); if (!box) return;
    rows = rows.slice().sort((a, b) => (a.Status === 'Dipakai') - (b.Status === 'Dipakai') || String(b.DibuatPada).localeCompare(String(a.DibuatPada)));
    box.innerHTML = rows.length ? '<div class="grid g2" style="gap:12px">' + rows.slice(0, 60).map((i) => '<div class="card tight hover col gap-8' + (i.Status === 'Dipakai' ? '' : '') + '" style="' + (i.Status === 'Dipakai' ? 'opacity:.6' : '') + '"><div class="row between gap-8"><div class="row gap-6 wrap">' + jenisPill(i.Format) + platPill(i.Platform) + '</div><span class="pill sm mono p-sage">' + (i.Skor || '—') + '</span></div><div class="serif" style="font-size:18px;font-weight:700;line-height:1.25">“' + h(i.Hook) + '”</div><div class="xs muted">' + h(i.Topik) + (i.Pilar ? ' · ' + h(i.Pilar) : '') + '</div>' + (i.Alasan ? '<div class="xs" style="color:var(--sage-ink)">' + h(i.Alasan) + '</div>' : '') + '<div class="row between mt-4">' + stPill(i.Status) + '<div class="row gap-6"><button class="icon-btn sm ghost" data-act="ideDel" data-id="' + h(i.ID) + '" aria-label="' + tr('Hapus', 'Delete') + '">' + ic('delete', 'sm') + '</button><button class="btn btn-ink btn-xs" data-act="ideKonten" data-id="' + h(i.ID) + '">' + ic('auto_awesome', 'xs') + tr('Jadikan konten', 'Make content') + '</button></div></div></div>').join('') + '</div>'
      : '<div class="card">' + UI.empty('lightbulb', tr('Bank ide kosong', 'Idea bank is empty'), tr('Buat ide di kiri, atau turunkan dari AI Strategy.', 'Generate ideas on the left, or send them from AI Strategy.')) + '</div>';
  },
  async genIde(btn) {
    const v = formVals($('#ide-f', this.el));
    UI.busy(btn, true, tr('Mencari ide…', 'Ideating…'));
    const r = await API.call('ide.generate', Object.assign(v, { kitId: App.kitId() }), { toast: false });
    UI.busy(btn, false);
    if (r.success) { UI.toast(r.message, r.data.meta.fallback ? 'warn' : 'ok'); API.read('ide.list', {}).then((x) => x.success && this.listIde(x.data)); }
  },
  async ideKonten(btn) {
    UI.busy(btn, true, tr('Menulis…', 'Writing…'));
    const r = await API.call('ide.toKonten', { id: btn.dataset.id, kitId: App.kitId() }, { toast: false });
    UI.busy(btn, false);
    if (r.success) { UI.toast(r.message, 'ok'); this.k = r.data.konten; this.meta = r.data.meta; this.si = 0; this.tab = 'studio'; this.paint(); }
  },
  async ideDel(id) { const r = await API.call('ide.delete', { id }, { toast: false }); if (r.success) API.read('ide.list', {}).then((x) => x.success && this.listIde(x.data)); },
  /* ---------------- Repositori ---------------- */
  paintRepoShell() {
    $('#gen-body', this.el).innerHTML = '<div class="card"><div class="row wrap gap-8 mb-16" id="repo-f"><input class="inp sm" style="max-width:260px" id="repo-q" placeholder="' + tr('Cari judul, tema, pilar…', 'Search title, theme, pillar…') + '"><select class="sel sm" id="repo-st" style="width:auto"><option value="">' + tr('Semua status', 'All statuses') + '</option>' + opts(['Draf', 'Review', 'Revisi', 'Disetujui', 'Terjadwal', 'Terbit', 'Arsip'], '', stLabel) + '</select><select class="sel sm" id="repo-j" style="width:auto"><option value="">' + tr('Semua format', 'All formats') + '</option>' + opts(JENIS, '', jenisLabel) + '</select><select class="sel sm" id="repo-p" style="width:auto"><option value="">' + tr('Semua platform', 'All platforms') + '</option>' + opts(PLATFORM) + '</select><span class="grow"></span><button class="btn btn-ghost btn-sm" data-act="xlsx">' + ic('download', 'sm') + 'Excel</button><button class="btn btn-danger btn-sm" data-act="bulkDel">' + ic('delete', 'sm') + tr('Hapus terpilih', 'Delete selected') + '</button></div><div id="repo-t">' + UI.sk(4, 'sk-line') + '</div></div>';
    $('#repo-q', this.el).addEventListener('input', debounce(() => this.paintRepo(), 300));
    API.swr('konten.list', { limit: 500 }, { maxAge: 15000, onData: (d) => { this.repo = d.rows; this.paintRepo(); } });
  },
  paintRepo() {
    const box = $('#repo-t', this.el); if (!box || !this.repo) return;
    const q = ($('#repo-q', this.el).value || '').toLowerCase(), st = $('#repo-st', this.el).value, j = $('#repo-j', this.el).value, p = $('#repo-p', this.el).value;
    const rows = this.repo.filter((k) => (!st || k.Status === st) && (!j || k.Jenis === j) && (!p || k.Platform === p) && (!q || (k.Judul + ' ' + k.Tema + ' ' + k.Pilar).toLowerCase().indexOf(q) > -1));
    this.repoView = rows;
    box.innerHTML = rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:36px"><input type="checkbox" id="chk-all" aria-label="' + tr('Pilih semua', 'Select all') + '"></th><th>' + tr('Judul', 'Title') + '</th><th>Format</th><th>Platform</th><th class="hide-sm">Pilar</th><th>Status</th><th class="hide-sm">' + tr('Diperbarui', 'Updated') + '</th><th></th></tr></thead><tbody>' +
      rows.map((k) => '<tr><td><input type="checkbox" class="chk-k" value="' + h(k.ID) + '" aria-label="' + h(k.Judul) + '"></td><td><button data-act="open" data-id="' + h(k.ID) + '" style="text-align:left" class="sb clamp-2">' + h(k.Judul) + '</button></td><td>' + jenisPill(k.Jenis) + '</td><td>' + platPill(k.Platform) + '</td><td class="hide-sm small">' + h(k.Pilar || '') + '</td><td>' + stPill(k.Status) + '</td><td class="hide-sm xs muted nowrap">' + h(Fmt.rel(k.DiperbaruiPada)) + '</td><td class="tr"><button class="icon-btn sm ghost" data-act="del" data-id="' + h(k.ID) + '" aria-label="' + tr('Hapus', 'Delete') + '">' + ic('delete', 'sm') + '</button></td></tr>').join('') + '</tbody></table></div><div class="pager"><span class="xs muted">' + rows.length + ' / ' + this.repo.length + ' ' + tr('konten', 'items') + '</span></div>'
      : UI.empty('search_off', tr('Tidak ada konten yang cocok', 'No matching content'));
  },
  cek() { return $$('.chk-k:checked', this.el).map((c) => c.value); },
  async hapus(ids) {
    if (!ids.length) return UI.toast(tr('Pilih konten dulu.', 'Select content first.'), 'warn');
    if (!(await UI.confirm(tr('Hapus ' + ids.length + ' konten beserta jadwalnya? Tindakan ini tidak bisa dibatalkan.', 'Delete ' + ids.length + ' items and their schedules? This cannot be undone.'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    const r = await API.call('konten.delete', { ids });
    if (r.success) { if (this.tab === 'repo') { this.repo = this.repo.filter((k) => ids.indexOf(k.ID) === -1); this.paintRepo(); } else this.paintQueue(); }
  },
  exportRepo() { Export.xlsx((this.repoView || this.repo || []).map((k) => ({ ID: k.ID, Judul: k.Judul, Format: k.Jenis, Platform: k.Platform, Pilar: k.Pilar, Status: k.Status, SkorHook: k.SkorHook, Diperbarui: k.DiperbaruiPada })), 'Konten-' + Fmt.today(), 'Konten'); }
});
