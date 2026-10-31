/* Modul 6 — AI Graphic Design Studio: kanvas multi-slide, Branding Kit, watermark otomatis, latar AI/aset, ekspor Drive/PNG/PDF/ZIP */
'use strict';
Pages.def('graphic', {
  STIKER: [['🍒', 'Cherries'], ['✦', 'Sparkle'], ['🌸', 'Flora'], ['🔮', 'Mirror ball'], ['⚡', 'Bolt'], ['💬', 'Chat'], ['📌', 'Pin'], ['☕', 'Coffee']],
  marquee() { return ['Module 06 // AI Graphic Design Studio', 'Automated branding kit & watermark engine', 'Synced with Google Drive [ASET_MEDIA & EKSPOR]', 'Multi-slide carousel generator']; },
  render(el, params) {
    if (typeof Engine === 'undefined') { el.innerHTML = '<div class="grid g3">' + UI.sk(3) + '</div>'; App.need('engine').then(() => { if (App.cur === this) this.render(el, params); }); return; }
    this.el = el; this.k = null; this.idx = 0; this.bg = null; this.bgNama = '';
    const kit = App.kit();
    this.o = { format: '4:5', kitId: App.kitId(), latar: (kit || {}).LatarGaya || 'dot-grid', wmOn: true, wmPos: (kit || {}).WatermarkPosisi || 'kanan-bawah', wmOp: Number((kit || {}).WatermarkOpasitas) || 0.85, stickers: true, image: true, grid: false, scale: 1, lh: 1.1, align: 'left', emoji: '' };
    this.slides = [{ judul: tr('Pilih konten atau tulis headline', 'Pick content or write a headline'), isi: tr('Teks slide tampil di sini dengan Branding Kit aktif.', 'Slide copy renders here with your active Branding Kit.') }];
    bindActs(el, {
      fmt: (b) => { this.o.format = b.dataset.v; this.seg('fmt', b); this.draw(true); }, nav: (b) => { this.go(this.idx + Number(b.dataset.d)); }, tab: (b) => this.go(+b.dataset.i),
      stk: (b) => { this.o.emoji = this.o.emoji === b.dataset.v ? '' : b.dataset.v; $$('[data-act=stk]', el).forEach((x) => x.classList.toggle('is-sel', x.dataset.v === this.o.emoji)); this.draw(true); },
      lh: (b) => { this.o.lh = Number(b.dataset.v); this.seg('lh', b); this.draw(); }, al: (b) => { this.o.align = b.dataset.v; this.seg('al', b); this.draw(); },
      art: (b) => this.artPrompt(b), bgUp: () => this.bgUpload(), bgAset: () => this.bgAset(), bgAi: () => this.bgAi(), bgOff: () => { this.bg = null; this.bgNama = ''; this.paintBgInfo(); this.draw(true); },
      ekspor: (b) => this.ekspor(b), dl: (b) => this.download(b.dataset.t, b), wmAll: () => { this.o.wmOn = true; const c = $('#g-wm', el); if (c) c.checked = true; this.draw(true); UI.toast(tr('Watermark diterapkan ke semua slide ✓', 'Watermark applied to all slides ✓'), 'ok'); },
      gen5: (b) => this.gen5(b), saveTxt: (b) => this.simpanTeks(b), kal: () => this.jadwal(), layout: () => {}, openK: () => this.pilihKonten()
    });
    el.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'g-kit') { this.o.kitId = t.value; const k = App.kit(t.value) || {}; this.o.latar = k.LatarGaya || this.o.latar; this.o.wmPos = k.WatermarkPosisi || this.o.wmPos; this.o.wmOp = Number(k.WatermarkOpasitas) || this.o.wmOp; this.paint(); return; }
      if (t.id === 'g-konten') { if (t.value) this.muat(t.value); return; }
      if (t.name === 'latar') { this.o.latar = t.value; this.draw(true); return; }
      if (t.id === 'g-wmpos') { this.o.wmPos = t.value; this.draw(true); return; }
      if (t.id === 'g-layout') { this.slides[this.idx].layout = t.value; this.draw(); return; }
      if (t.dataset.layer) { this.o[t.dataset.layer] = t.checked; this.draw(true); }
    });
    el.addEventListener('input', (e) => {
      const t = e.target;
      if (t.id === 'g-wmop') { this.o.wmOp = Number(t.value); this.drawSoon(); }
      if (t.id === 'g-scale') { this.o.scale = Number(t.value); $('#g-scale-v', el).textContent = Math.round(t.value * 100) + '%'; this.drawSoon(); }
      if (t.id === 'g-j' || t.id === 'g-i') { const s = this.slides[this.idx]; s.judul = $('#g-j', el).value; s.isi = $('#g-i', el).value; this.dirty = true; this.drawSoon(); }
    });
    this.paint();
    if (params.id) this.muat(params.id);
  },
  onKit(id) { this.o.kitId = id; this.paint(); },
  seg(name, b) { $$('[data-act=' + name + ']', this.el).forEach((x) => x.classList.toggle('on', x === b)); },
  kit() { return App.kit(this.o.kitId) || App.kit(); },
  paint() {
    const el = this.el, o = this.o, kit = this.kit() || {}, fmts = [['4:5', 'Carousel 4:5'], ['9:16', 'Reels / Story 9:16'], ['1:1', 'Square 1:1'], ['16:9', 'Landscape 16:9']];
    el.innerHTML = '<section class="row between top wrap gap-24"><div class="col gap-12" style="max-width:640px"><div class="row gap-8 wrap"><span class="pill mono p-sage">✦ Visual Composition Suite</span><span class="pill mono p-blush">Drive synced: Aset_Media</span></div>' +
      '<h1 class="display">Visuals that captivate <span class="it" style="background:var(--sage);border-radius:40px;padding:0 14px;box-decoration-break:clone;-webkit-box-decoration-break:clone">without feeling like a template.</span></h1><p class="lead">' + tr('Buat dan sunting grafis editorial on-brand, carousel multi-slide, dan aset sosial dengan tipografi real-time serta ekspor batch ke Google Drive — watermark brand ditempel otomatis.', 'Generate and refine on-brand editorial graphics, multi-slide carousels and social assets with real-time typography and automated Google Drive batch exports — brand watermark applied automatically.') + '</p></div>' +
      '<div class="col gap-10" style="gap:10px;align-items:flex-end"><button class="btn btn-text" data-act="gen5">✨ ' + tr('Generate carousel 5 slide', 'Generate 5-Slide Carousel') + '</button><div class="row gap-8 wrap"><button class="btn btn-ghost" data-act="ekspor">' + ic('drive_folder_upload', 'sm') + tr('Ekspor ke Drive', 'Export to Drive') + ' 📁</button><button class="btn btn-soft" data-act="wmAll">' + ic('verified', 'sm') + 'Batch Watermark All</button></div></div></section>' +
      '<section class="card paper tight row wrap gap-16 mt-24" style="background:var(--paper-2)"><div class="row gap-8"><span>🌸</span><div><div class="label">Branding kit</div><select class="sel sm white" id="g-kit" style="min-width:170px">' + opts(App.kits().map((k) => ({ v: k.ID, l: 'Kit: ' + k.Nama })), kit.ID) + '</select></div></div>' +
        '<div class="seg dark">' + fmts.map((f) => '<button class="' + (o.format === f[0] ? 'on' : '') + '" data-act="fmt" data-v="' + f[0] + '">' + f[1] + '</button>').join('') + '</div>' +
        '<div class="row gap-8"><div><div class="label">Watermark</div><select class="sel sm white" id="g-wmpos" style="width:auto">' + opts([{ v: 'kanan-bawah', l: tr('Kanan bawah', 'Bottom-right') }, { v: 'kiri-bawah', l: tr('Kiri bawah', 'Bottom-left') }, { v: 'tengah-bawah', l: tr('Tengah bawah', 'Bottom-center') }, { v: 'kanan-atas', l: tr('Kanan atas', 'Top-right') }, { v: 'kiri-atas', l: tr('Kiri atas', 'Top-left') }], o.wmPos) + '</select></div><div style="width:110px"><div class="label">' + Math.round(o.wmOp * 100) + '% opacity</div><input type="range" id="g-wmop" min="0.1" max="1" step="0.05" value="' + o.wmOp + '"></div></div>' +
        '<span class="grow"></span><div class="row gap-8"><span class="ico-dot sm line">' + ic('memory', 'sm') + '</span><div><div class="label">AI graphics engine</div><div class="xs sb">Canvas + ' + h(((App.boot || {}).ai || {}).provider === 'template' ? tr('prompt (tanpa API)', 'prompts (no API)') : 'AI image') + '</div></div></div></section>' +
      '<div class="grid mt-16" style="grid-template-columns:260px minmax(0,1fr) 270px;align-items:start;gap:16px" id="g-grid">' +
      // kiri
      '<aside class="col gap-16" style="gap:16px"><div class="card tight col gap-10"><div class="row between"><span class="label">⚡ Sync W-05 copy</span><span class="dot"></span></div><select class="sel sm" id="g-konten"><option value="">' + tr('— pilih konten —', '— pick content —') + '</option></select><div class="xs muted" id="g-ksrc">' + tr('Atau ketik teks langsung di bawah kanvas.', 'Or type copy right below the canvas.') + '</div></div>' +
        '<div class="card tight"><div class="label mb-8">' + tr('Pasangan tipografi', 'Typography pairing') + '</div><div class="inset"><div class="xs tert">Display headline</div><div class="row between"><span style="font:700 22px \'' + h(kit.FontJudul || 'Playfair Display') + '\',serif">' + h(kit.FontJudul || 'Playfair Display') + '</span><span class="pill sm p-line">Serif</span></div><div class="xs tert mt-8">Body & metadata</div><div class="row between"><span style="font:500 15px \'' + h(kit.FontIsi || 'DM Sans') + '\',sans-serif">' + h(kit.FontIsi || 'DM Sans') + '</span><span class="pill sm p-line">Sans</span></div></div></div>' +
        '<div class="card tight"><div class="label mb-8">Palette distribution</div><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:6px">' + [['WarnaPrimer', 'Primer'], ['WarnaSekunder', 'Sage'], ['WarnaLatar', 'Ivory'], ['WarnaTeks', 'Ink']].map((c) => '<div class="col gap-4" style="align-items:center;gap:4px"><span class="swatch" style="width:100%;background:' + h(kit[c[0]] || '#ccc') + '"></span><span class="mono" style="font-size:9px">' + c[1] + '</span></div>').join('') + '</div></div>' +
        '<div class="card tight"><div class="row between mb-8"><span class="label">Playful sticker pack</span><span class="mono xs tert">' + this.STIKER.length + ' items</span></div><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:6px">' + this.STIKER.map((s) => '<button class="tile col gap-4' + (o.emoji === s[0] ? ' is-sel' : '') + '" data-act="stk" data-v="' + s[0] + '" style="align-items:center;padding:8px 4px;gap:2px" title="' + s[1] + '"><span style="font-size:20px">' + s[0] + '</span><span style="font-size:9px" class="mono">' + s[1] + '</span></button>').join('') + '</div></div>' +
        '<div class="card tight col gap-8"><div class="label">Background styling</div>' + [['dot-grid', 'Dot-grid matrix (pastel)'], ['linen', 'Linen stationery soft'], ['dual-tone', 'Dual-tone split horizon'], ['solid', 'Solid'], ['gradien', tr('Gradien glow', 'Glow gradient')], ['garis', tr('Garis buku catatan', 'Notebook lines')]].map((b) => '<label class="check small" style="justify-content:space-between;width:100%"><span>' + b[1] + '</span><input type="radio" name="latar" value="' + b[0] + '"' + (o.latar === b[0] ? ' checked' : '') + '></label>').join('') +
        '<div class="divider" style="margin:6px 0"></div><div class="label">' + tr('Gambar latar', 'Background image') + '</div><div class="row wrap gap-6"><button class="btn btn-ghost btn-xs" data-act="bgUp">' + ic('upload', 'xs') + 'Upload</button><button class="btn btn-ghost btn-xs" data-act="bgAset">' + ic('photo_library', 'xs') + tr('Aset', 'Assets') + '</button><button class="btn btn-blush btn-xs" data-act="bgAi">' + ic('auto_awesome', 'xs') + 'AI</button></div><div id="g-bginfo" class="xs muted"></div></div></aside>' +
      // tengah
      '<section class="card col gap-12" style="padding:16px"><div class="row between wrap gap-8"><div class="chips nowrap" id="g-tabs"></div><span class="mono xs tert" id="g-pos"></span></div>' +
        '<div class="canvas-stage" id="g-stage"><canvas id="g-cv" aria-label="' + tr('Pratinjau desain', 'Design preview') + '"></canvas></div>' +
        '<div class="row between wrap gap-8"><div class="row gap-6"><button class="icon-btn sm" data-act="nav" data-d="-1" aria-label="' + tr('Sebelumnya', 'Previous') + '">' + ic('chevron_left', 'sm') + '</button><span class="pill mono p-line" id="g-pos2"></span><button class="icon-btn sm" data-act="nav" data-d="1" aria-label="' + tr('Berikutnya', 'Next') + '">' + ic('chevron_right', 'sm') + '</button></div><div class="row gap-6 wrap"><button class="btn btn-soft btn-sm" data-act="art">' + ic('refresh', 'sm') + 'Regenerate art prompt</button><button class="btn btn-ghost btn-sm" data-act="bgUp">' + ic('wallpaper', 'sm') + 'Swap background</button></div></div>' +
        '<div class="thumbs" id="g-thumbs"></div>' +
        '<div class="grid g2" style="gap:10px"><div class="field"><label>Headline · slide <span id="g-sn">1</span></label><textarea class="ta" id="g-j" rows="2"></textarea></div><div class="field"><label>' + tr('Isi / subtitle', 'Body / subtitle') + '</label><textarea class="ta" id="g-i" rows="2"></textarea></div></div>' +
        '<div class="row between wrap gap-8"><div class="row gap-8"><span class="label">Layout</span><select class="sel sm" id="g-layout" style="width:auto"><option value="">auto</option>' + opts(Engine.LAYOUTS) + '</select></div><button class="btn btn-ghost btn-sm" data-act="saveTxt">' + ic('save', 'sm') + tr('Simpan teks ke konten', 'Save copy to content') + '</button></div><div id="g-art" class="inset xs" hidden></div></section>' +
      // kanan
      '<aside class="col gap-16" style="gap:16px"><div class="card tight col gap-8"><div class="row between"><span class="label">Layer hierarchy</span><span class="mono xs tert">5 layers</span></div>' + [['wmOn', 'verified', 'Auto-watermark'], ['stickers', 'star', 'Accent stickers'], ['image', 'image', tr('Gambar latar', 'Background image')], ['grid', 'grid_on', tr('Garis bantu grid', 'Grid guides')]].map((l) => '<label class="row between small"><span class="row gap-8">' + ic(l[1], 'sm') + l[2] + '</span><span class="sw"><input type="checkbox" data-layer="' + l[0] + '"' + (l[0] === 'wmOn' ? ' id="g-wm"' : '') + (o[l[0]] ? ' checked' : '') + '><i></i></span></label>').join('') + '</div>' +
        '<div class="card tight col gap-10"><div class="label">Fine-tune typography</div><div class="row between xs"><span>Headline scale</span><span class="mono" id="g-scale-v">' + Math.round(o.scale * 100) + '%</span></div><input type="range" id="g-scale" min="0.6" max="1.4" step="0.05" value="' + o.scale + '">' +
        '<div class="xs">Leading</div><div class="seg">' + [['1', 'Tight'], ['1.1', 'Normal'], ['1.25', 'Airy']].map((x) => '<button class="' + (String(o.lh) === x[0] ? 'on' : '') + '" data-act="lh" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
        '<div class="xs">Alignment</div><div class="seg">' + [['left', 'format_align_left'], ['center', 'format_align_center'], ['right', 'format_align_right']].map((x) => '<button class="' + (o.align === x[0] ? 'on' : '') + '" data-act="al" data-v="' + x[0] + '" aria-label="' + x[0] + '">' + ic(x[1], 'sm') + '</button>').join('') + '</div></div>' +
        '<div class="card tight col gap-10"><div class="row between"><span class="label">Drive export hub</span><span class="pill sm mono p-sage">Connected</span></div><div class="xs muted">Target: <span class="mono">/' + tr('Ekspor', 'Exports') + '/' + h(kit.Nama || '') + '/' + Fmt.today().slice(0, 7) + '/</span></div>' +
        '<label class="check sq small"><input type="checkbox" id="ex-png" checked> PNG (1080px)</label><label class="check sq small"><input type="checkbox" id="ex-pdf"> PDF deck</label><label class="check sq small"><input type="checkbox" id="ex-zip"> ZIP</label>' +
        '<button class="btn btn-sage btn-block" data-act="ekspor">🚀 Render & Save to Drive</button><div class="row gap-6"><button class="btn btn-ghost btn-xs grow" data-act="dl" data-t="png">' + ic('download', 'xs') + 'PNG</button><button class="btn btn-ghost btn-xs grow" data-act="dl" data-t="zip">ZIP</button><button class="btn btn-ghost btn-xs grow" data-act="dl" data-t="pdf">PDF</button></div><button class="btn-text" data-act="kal">' + tr('Kirim ke Kalender W-08', 'Send to W-08 Calendar') + ' →</button></div></aside></div>' +
      '<section class="mt-32"><div class="row between wrap gap-12 mb-16"><div><div class="h2">📁 Recent Studio Renders &amp; Carousel Decks</div><p class="mono xs tert">Synced with Google Sheet: "Aset_Media" · live queue</p></div><span class="pill mono p-sage" id="g-rn">…</span></div><div class="grid g4" id="g-recent">' + UI.sk(4) + '</div></section>';
    const g = $('#g-grid', el); if (innerWidth < 1200) g.style.gridTemplateColumns = innerWidth < 800 ? 'minmax(0,1fr)' : 'minmax(0,1fr) 260px';
    if (innerWidth < 1200 && innerWidth >= 800) { g.insertBefore(g.children[1], g.children[0]); }
    this.kontenList();
    this.paintBgInfo();
    this.draw(true);
    this.recent();
  },
  kontenList() {
    API.swr('konten.list', { limit: 100 }, { maxAge: 20000, onData: (d) => {
      const s = $('#g-konten', this.el); if (!s) return;
      s.innerHTML = '<option value="">' + tr('— pilih konten —', '— pick content —') + '</option>' + d.rows.filter((k) => ['Caption', 'Artikel'].indexOf(k.Jenis) === -1).map((k) => '<option value="' + h(k.ID) + '"' + (this.k && this.k.ID === k.ID ? ' selected' : '') + '>' + h(k.Judul.slice(0, 60)) + ' · ' + h(jenisLabel(k.Jenis)) + '</option>').join('');
    } });
  },
  async muat(id) {
    const r = await API.read('konten.get', { id }); if (!r.success) return UI.toast(r.message, 'err');
    this.k = r.data; this.slides = Engine.slidesDariKonten(r.data); this.idx = 0; this.dirty = false;
    this.o.format = Engine.rasioDari(r.data.Jenis, r.data.Platform);
    if (r.data.KitID && App.kit(r.data.KitID)) this.o.kitId = r.data.KitID;
    this.o.wmOn = r.data.Watermark !== 'TIDAK';
    this.paint();
    const src = $('#g-ksrc', this.el); if (src) src.innerHTML = '<span class="pill sm p-line">Hook #01</span> “' + h(String(r.data.Copywriting || r.data.Judul).slice(0, 90)) + '”<div class="mt-4">Source: ' + h(jenisLabel(r.data.Jenis)) + ' · ' + h(r.data.Platform) + ' ✦</div>';
    const art = String(r.data.Catatan || '').replace(/^Art direction:\s*/, '');
    if (art) { const a = $('#g-art', this.el); a.hidden = false; a.innerHTML = '<b>Art prompt:</b> ' + h(art); }
  },
  go(i) { const n = this.slides.length; this.idx = (i + n) % n; this.draw(true); },
  drawSoon: debounce(function () { this.draw(); }, 60),
  opsi(i) {
    const kit = Object.assign({}, this.kit() || {}), o = this.o;
    if (o.emoji) kit.Emoji = o.emoji + (kit.Emoji || '');
    const op = Engine.opsiDariKit(kit, { format: o.format, index: i, total: this.slides.length, latar: o.latar, bgImg: o.image ? this.bg : null, layers: { stickers: o.stickers, image: o.image, grid: o.grid }, type: { scale: o.scale, lh: o.lh, align: o.align },
      produk: this.k ? (App.produk().find((p) => p.ID === this.k.ProdukID) || {}).Nama : '', peran: i === 0 ? 'Blueprint' : '', noImg: tr('tambahkan gambar latar', 'add a background image') });
    op.watermark.aktif = o.wmOn; op.watermark.posisi = o.wmPos; op.watermark.opasitas = o.wmOp; op.watermark.logo = this.logo || null;
    return op;
  },
  async draw(full) {
    const cv = $('#g-cv', this.el); if (!cv) return;
    const as = await Engine.siapkanKit(this.kit()); this.logo = as.logo;
    const s = this.slides[this.idx] || this.slides[0];
    Engine.render(cv, s, this.opsi(this.idx));
    const n = this.slides.length, p = ('0' + (this.idx + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2);
    $('#g-pos', this.el).textContent = 'Slide ' + (this.idx + 1) + ' of ' + n; $('#g-pos2', this.el).textContent = p; $('#g-sn', this.el).textContent = this.idx + 1;
    if (document.activeElement && !/g-j|g-i/.test(document.activeElement.id)) { $('#g-j', this.el).value = s.judul || ''; $('#g-i', this.el).value = s.isi || ''; }
    $('#g-layout', this.el).value = s.layout || '';
    if (!full) { this.thumbOne(this.idx); return; }
    $('#g-tabs', this.el).innerHTML = this.slides.map((x, i) => '<button class="chip' + (i === this.idx ? ' on' : '') + '" data-act="tab" data-i="' + i + '" style="height:28px;font-size:11.5px">' + ('0' + (i + 1)).slice(-2) + ' ' + h(Engine.autoLayout(x, i, n)) + '</button>').join('');
    const th = $('#g-thumbs', this.el); th.innerHTML = '';
    this.slides.forEach((x, i) => { const c = Engine.thumb(x, this.opsi(i), 120); c.dataset.act = 'tab'; c.dataset.i = i; if (i === this.idx) c.classList.add('on'); th.appendChild(c); });
  },
  thumbOne(i) { const th = $$('#g-thumbs canvas', this.el)[i]; if (!th) return; const c = Engine.thumb(this.slides[i], this.opsi(i), 120); th.getContext('2d').clearRect(0, 0, th.width, th.height); th.width = c.width; th.height = c.height; th.getContext('2d').drawImage(c, 0, 0); },
  paintBgInfo() { const b = $('#g-bginfo', this.el); if (b) b.innerHTML = this.bg ? '✓ ' + h(this.bgNama || 'gambar') + ' · <button class="btn-text" data-act="bgOff">' + tr('lepas', 'remove') + '</button>' : tr('Tanpa gambar — memakai gaya latar kit.', 'No image — using kit background style.'); },
  async setBg(dataUrl, nama) { this.bg = await Files.loadImg(dataUrl); this.bgNama = nama; this.o.image = true; this.paintBgInfo(); this.draw(true); },
  async bgUpload() {
    const [f] = await Files.pick('image/*'); if (!f) return;
    const d = await Files.image(f, 1600, 0.9); await this.setBg(d.dataUrl, f.name);
    if (await UI.confirm(tr('Simpan gambar ini ke Asset Library (Drive) agar bisa dipakai lagi?', 'Save this image to the Asset Library (Drive) for reuse?'), { ok: tr('Simpan', 'Save') })) API.call('aset.upload', { Nama: f.name, base64: d.base64, mime: d.mime, Jenis: 'Visual', Tag: 'latar,graphic', KitID: this.o.kitId });
  },
  bgAset() {
    API.swr('aset.list', {}, { maxAge: 60000, onData: (rows) => {
      if (this._am) this._am.close();
      const img = rows.filter((a) => a.DriveID && /image/.test(a.MimeType || 'image'));
      const m = this._am = UI.modal({ title: tr('Pilih dari Asset Library', 'Pick from Asset Library'), size: 'wide', onClose: () => { this._am = null; },
        body: img.length ? '<div class="grid g4" style="gap:10px">' + img.map((a) => '<button class="tile col gap-6" data-aid="' + h(a.ID) + '" style="gap:6px"><img src="' + h(a.URL) + '" alt="" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:110px;object-fit:cover;border-radius:10px;background:var(--paper-2)"><span class="xs clamp-1">' + h(a.Nama) + '</span></button>').join('') + '</div>' : UI.empty('photo_library', tr('Belum ada gambar di Drive', 'No images in Drive yet'), tr('Unggah lewat tombol Upload atau Asset Library.', 'Upload via the Upload button or Asset Library.')) });
      m.el.onclick = async (e) => { const b = e.target.closest('[data-aid]'); if (!b) return; b.style.opacity = '.5'; const r = await API.read('aset.data', { id: b.dataset.aid }); if (r.success) { m.close(); this.setBg(r.data.dataUrl, r.data.nama); } else UI.toast(r.message, 'err'); };
    } });
  },
  async artPrompt(btn) {
    const s = this.slides[this.idx] || {};
    UI.busy(btn, true, '…');
    const r = await API.call('desain.prompt', { teks: s.judul || (this.k || {}).Judul, kitId: this.o.kitId, format: this.o.format, kontenId: (this.k || {}).ID, fresh: true }, { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) return;
    this.lastPrompt = r.data.prompt;
    const a = $('#g-art', this.el); a.hidden = false;
    a.innerHTML = '<div class="row between gap-8"><b>Art prompt (' + h(r.data.gaya || '') + ')</b><button class="btn btn-ghost btn-xs" id="g-cp">' + ic('content_copy', 'xs') + tr('Salin', 'Copy') + '</button></div><p class="mt-4">' + h(r.data.prompt) + '</p><p class="mt-4 muted"><b>Negative:</b> ' + h(r.data.negatif) + '</p>';
    $('#g-cp', a).onclick = () => navigator.clipboard && navigator.clipboard.writeText(r.data.prompt).then(() => UI.toast(tr('Prompt disalin', 'Prompt copied'), 'ok'));
  },
  bgAi() {
    const def = this.lastPrompt || String((this.k || {}).Catatan || '').replace(/^Art direction:\s*/, '') || ('Minimal tactile editorial flat-lay, ' + ((this.kit() || {}).GayaVisual || 'pastel'));
    const m = UI.modal({ title: tr('Generate gambar latar AI', 'Generate AI background'), kicker: 'Gemini / OpenAI image', body: '<div class="field"><label>Prompt</label><textarea class="ta" id="ai-p" rows="5">' + h(def) + '</textarea></div><p class="xs muted mt-8">' + tr('Butuh provider Gemini/OpenAI dengan API key (AI Orchestration). Hasil disimpan ke Asset Library di Drive.', 'Requires Gemini/OpenAI with an API key (AI Orchestration). Results are saved to the Asset Library in Drive.') + '</p>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="ai-go">' + ic('auto_awesome', 'sm') + 'Generate</button>' });
    $('#ai-go', m.el.parentNode).onclick = async (e) => {
      UI.busy(e.currentTarget, true, tr('Melukis…', 'Painting…'));
      const r = await API.call('desain.gambar', { prompt: $('#ai-p', m.el).value, rasio: this.o.format === '16:9' ? '16:9' : this.o.format === '1:1' ? '1:1' : this.o.format, kitId: this.o.kitId }, { toast: false });
      UI.busy(e.currentTarget, false);
      if (r.success) { m.close(); this.setBg(r.data.dataUrl, 'AI'); UI.toast(r.message, 'ok'); this.recent(true); }
    };
  },
  pngAll() { return this.slides.map((s, i) => { const c = document.createElement('canvas'); Engine.render(c, s, this.opsi(i)); return { c, nama: this.namaFile(i) }; }); },
  namaFile(i) { return (String((this.k || {}).Judul || 'desain').replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').slice(0, 40) + '-slide-' + ('0' + (i + 1)).slice(-2)).toLowerCase(); },
  async ekspor(btn) {
    await Engine.siapkanKit(this.kit());
    UI.busy(btn, true, tr('Merender…', 'Rendering…'));
    const all = this.pngAll(), files = [];
    if ($('#ex-png', this.el).checked) all.forEach((x) => files.push({ nama: x.nama + '.png', mime: 'image/png', base64: x.c.toDataURL('image/png').split(',')[1] }));
    if ($('#ex-pdf', this.el).checked) { try { const b = await this.pdfBlob(all); files.push({ nama: this.namaFile(0).replace(/-slide-01$/, '') + '-deck.pdf', mime: 'application/pdf', base64: await this.b64(b) }); } catch (e) { UI.toast(tr('PDF gagal: ', 'PDF failed: ') + e.message, 'warn'); } }
    if ($('#ex-zip', this.el).checked) { try { const b = await this.zipBlob(all); files.push({ nama: this.namaFile(0).replace(/-slide-01$/, '') + '.zip', mime: 'application/zip', base64: await this.b64(b) }); } catch (e) { UI.toast(tr('ZIP gagal: ', 'ZIP failed: ') + e.message, 'warn'); } }
    if (!files.length) { UI.busy(btn, false); return UI.toast(tr('Pilih minimal satu format ekspor.', 'Select at least one export format.'), 'warn'); }
    let ok = 0, url = '';
    for (let i = 0; i < files.length;) {                              // kirim per ±6 MB agar aman dari batas payload
      const part = []; let size = 0;
      while (i < files.length && (part.length === 0 || size + files[i].base64.length < 6e6)) { size += files[i].base64.length; part.push(files[i++]); }
      UI.busy(btn, true, tr('Mengunggah ', 'Uploading ') + Math.min(i, files.length) + '/' + files.length + '…');
      const r = await API.call('desain.ekspor', { files: part, kontenId: (this.k || {}).ID || '', kitId: this.o.kitId, watermark: this.o.wmOn }, { toast: false });
      if (!r.success) break;
      ok += r.data.files.length; url = r.data.folderUrl;
    }
    UI.busy(btn, false);
    if (ok) { UI.toast(ok + tr(' berkas tersimpan di Google Drive ✓', ' files saved to Google Drive ✓'), 'ok'); this.recent(true); if (url) UI.modal({ title: tr('Ekspor selesai ✦', 'Export complete ✦'), size: 'sm', body: '<p class="muted">' + ok + tr(' berkas tersimpan & tertaut ke konten. Watermark brand sudah ditempel.', ' files saved & linked to the content. Brand watermark applied.') + '</p>', foot: '<a class="btn btn-ink" href="' + h(url) + '" target="_blank" rel="noopener">' + ic('folder_open', 'sm') + tr('Buka folder Drive', 'Open Drive folder') + '</a>' }); }
  },
  b64(blob) { return new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob); }); },
  async pdfBlob(all) {
    const J = await Lib.pdf(), [W, H] = Engine.FORMATS[this.o.format], doc = new J({ orientation: W > H ? 'landscape' : 'portrait', unit: 'px', format: [W, H], hotfixes: ['px_scaling'] });
    all.forEach((x, i) => { if (i) doc.addPage([W, H], W > H ? 'landscape' : 'portrait'); doc.addImage(x.c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, H); });
    return doc.output('blob');
  },
  async zipBlob(all) { const Z = await Lib.zip(), z = new Z(); all.forEach((x) => z.file(x.nama + '.png', x.c.toDataURL('image/png').split(',')[1], { base64: true })); return z.generateAsync({ type: 'blob' }); },
  async download(t, btn) {
    await Engine.siapkanKit(this.kit());
    if (t === 'png') { const c = document.createElement('canvas'); Engine.render(c, this.slides[this.idx], this.opsi(this.idx)); c.toBlob((b) => Files.download(this.namaFile(this.idx) + '.png', b)); return; }
    UI.busy(btn, true, '…');
    try { const all = this.pngAll(), b = t === 'zip' ? await this.zipBlob(all) : await this.pdfBlob(all); Files.download(this.namaFile(0).replace(/-slide-01$/, '') + (t === 'zip' ? '.zip' : '-deck.pdf'), b); }
    catch (e) { UI.toast(tr('Pustaka ' + t.toUpperCase() + ' gagal dimuat — mengunduh PNG per slide.', t.toUpperCase() + ' library failed — downloading PNG per slide.'), 'warn'); this.pngAll().forEach((x, i) => setTimeout(() => x.c.toBlob((b) => Files.download(x.nama + '.png', b)), i * 350)); }
    UI.busy(btn, false);
  },
  async simpanTeks(btn) {
    if (!this.k) { UI.toast(tr('Teks ini belum terhubung ke konten — membuat konten baru.', 'Copy is not linked yet — creating new content.'), 'info'); }
    UI.busy(btn, true);
    const r = this.k ? await API.call('konten.save', { ID: this.k.ID, Slides: this.slides, Watermark: this.o.wmOn }, { toast: false }) : await API.call('konten.save', { Judul: this.slides[0].judul.slice(0, 140), Jenis: 'Carousel', Platform: 'Instagram', Slides: this.slides, KitID: this.o.kitId, Watermark: this.o.wmOn }, { toast: false });
    UI.busy(btn, false);
    if (r.success) { this.k = r.data; this.dirty = false; UI.toast(tr('Teks slide tersimpan ✓', 'Slide copy saved ✓'), 'ok'); this.kontenList(); }
  },
  async gen5(btn) {
    const t = await UI.prompt(tr('Topik carousel 5 slide', '5-slide carousel topic'), { placeholder: tr('mis. 5 kesalahan template Notion', 'e.g. 5 Notion template mistakes'), ok: 'Generate' });
    if (!t) return;
    UI.busy(btn, true, tr('Menulis…', 'Writing…'));
    const r = await API.call('konten.generate', { topik: t, format: 'Carousel', platform: 'Instagram', jumlahSlide: 5, kitId: this.o.kitId }, { toast: false });
    UI.busy(btn, false);
    if (r.success) { UI.toast(r.message, r.data.meta.fallback ? 'warn' : 'ok'); this.muat(r.data.konten.ID); }
  },
  jadwal() { if (!this.k) return UI.toast(tr('Simpan/ pilih konten dulu.', 'Save or pick content first.'), 'warn'); Shared.jadwal(this.k); },
  recent(fresh) {
    API.swr('aset.list', {}, { fresh, maxAge: 30000, onData: (rows) => {
      const box = $('#g-recent', this.el); if (!box) return;
      const ex = rows.filter((a) => a.Jenis === 'Ekspor' || /^AI/.test(a.Sumber || '')).sort((a, b) => String(b.DibuatPada).localeCompare(String(a.DibuatPada))).slice(0, 8);
      $('#g-rn', this.el).textContent = ex.length + ' assets cached';
      box.innerHTML = ex.length ? ex.map((a) => '<article class="card tight hover col gap-8"><div style="height:150px;border-radius:14px;overflow:hidden;background:var(--paper-2);display:grid;place-items:center">' + (/image/.test(a.MimeType) ? '<img src="' + h(a.URL) + '" alt="" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover">' : ic(/pdf/.test(a.MimeType) ? 'picture_as_pdf' : 'folder_zip', 'xl')) + '</div><span class="label">' + h(a.Jenis === 'Ekspor' ? tr('Siap ekspor', 'Ready to export') : 'AI') + '</span><div class="h4 clamp-2">' + h(a.Nama) + '</div><div class="row between"><span class="mono xs tert">' + h(Fmt.dt(a.DibuatPada)) + ' · ' + Fmt.bytes(a.Ukuran) + '</span><a class="btn btn-ghost btn-xs" href="https://drive.google.com/file/d/' + h(a.DriveID) + '/view" target="_blank" rel="noopener">Drive ↗</a></div></article>').join('')
        : '<div class="card full">' + UI.empty('photo_library', tr('Belum ada render', 'No renders yet'), tr('Klik Render & Save to Drive untuk menyimpan hasil desain.', 'Click Render & Save to Drive to store your designs.')) + '</div>';
    } });
  },
  pilihKonten() {}
});
