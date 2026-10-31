/* Modul 2 — Onboarding & Brand Profile: Branding Kit (multi-kit), audiens & masalah, produk, pilar konten */
'use strict';
Pages.def('onboarding', {
  marquee() { return ['Step 01/03: Brand Identity & Value Proposition', 'Synced with Google Sheets BRAND_PROFIL & BRANDING_KIT', 'Active kit: ' + ((App.kit() || {}).Nama || '-'), 'Multi-branding kits supported']; },
  NADA: [['Hangat & Editorial', '🍒'], ['Lugas & Actionable', '⚡'], ['Nurturing Teacher', '📚'], ['Playful & Trendy', '🌸'], ['Minimalist Pro', '✦'], ['Profesional & Data', '📊']],
  TAG: ['Hook Engine', 'Monetisasi', 'Konsistensi', 'Strategi', 'Produk'],
  render(el, params) {
    this.el = el; this.kitId = params.kit || App.kitId(); this.dirty = false;
    this.load();
    bindActs(el, {
      save: (b) => this.save(b), saran: () => this.saran(), reset: () => this.resetPilar(),
      kitNew: () => this.kitAksi('new'), kitDup: () => this.kitAksi('dup'), kitDef: () => this.kitAksi('def'), kitDel: () => this.kitAksi('del'), logo: (b) => this.upload(b.dataset.j),
      nada: (b) => { this.sync(); const n = b.dataset.v, a = this.d.nada; const i = a.indexOf(n); if (i > -1) a.splice(i, 1); else a.push(n); this.mark(); this.paint(); },
      plat: (b) => { this.sync(); const n = b.dataset.v, a = this.d.platform; const i = a.indexOf(n); if (i > -1) a.splice(i, 1); else a.push(n); this.mark(); this.paint(); },
      addPain: () => { this.sync(); this.d.masalah.push({ teks: '', tingkat: 'Sedang', tag: 'Konsistensi' }); this.mark(); this.paint(); },
      delPain: (b) => { this.sync(); this.d.masalah.splice(+b.dataset.i, 1); this.mark(); this.paint(); },
      addPilar: () => { this.sync(); if (this.d.pilar.length >= 6) return; this.d.pilar.push({ nama: tr('Pilar baru', 'New pillar'), persen: 0, deskripsi: '', format: 'IG Carousel' }); this.mark(); this.paint(); },
      delPilar: (b) => { this.sync(); this.d.pilar.splice(+b.dataset.i, 1); this.mark(); this.paint(); },
      produk: (b) => Produk.form(App.produk().find((p) => p.ID === b.dataset.id), () => App.refreshBoot()),
      hook: (b) => this.testHook(b), tab: (b) => { const t = $('#ob-' + b.dataset.t, el); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
      go: (b) => Router.go(b.dataset.page)
    });
    el.addEventListener('input', (e) => { if (e.target.closest('[data-f]')) { this.mark(); if (/Warna|Font|Latar|Watermark|Emoji/.test(e.target.dataset.f || '')) this.previewSoon(); if (e.target.dataset.f === 'persen') this.sumPilar(); } });
    el.addEventListener('change', (e) => {
      if (e.target.id === 'ob-kit') { if (this.dirty && !confirm(tr('Perubahan belum disimpan. Tetap ganti kit?', 'Unsaved changes. Switch kit anyway?'))) { e.target.value = this.kitId; return; } this.kitId = e.target.value; this.load(); this.paint(); return; }
      if (e.target.closest('[data-f]')) { this.mark(); this.previewSoon(); }
    });
    this.paint();
  },
  onBoot() { if (!this.dirty) { this.load(); this.paint(); } else this.paintProduk(); },
  load() {
    const b = App.boot || {}, kit = App.kits().find((k) => k.ID === this.kitId) || App.kit() || {}, p = App.profil(kit.ID) || {}, me = b.me || {};
    this.kitId = kit.ID;
    const tr8 = pj(p.Transformasi, {});
    this.d = {
      kit: Object.assign({}, kit), nada: String(kit.Nada || '').split(/,\s*/).filter(Boolean),
      profilId: p.KitID === kit.ID ? p.ID : '', NamaBrand: p.NamaBrand || App.set('NAMA_STUDIO', ''), TargetAudiens: p.TargetAudiens || '', Persona: p.Persona || '', Tujuan: p.Tujuan || '',
      masalah: pj(p.MasalahAudiens, []).map((m) => (typeof m === 'string' ? { teks: m, tingkat: 'Sedang', tag: 'Konsistensi' } : m)),
      sebelum: tr8.sebelum || '', sesudah: tr8.sesudah || '', janji: tr8.janji || '', platform: pj(p.Platform, ['Instagram']), Demografi: p.Demografi || '', SuaraKomunitas: p.SuaraKomunitas || '',
      pilar: pj(p.PilarKonten, []), me: Object.assign({}, me)
    };
    if (!this.d.pilar.length) this.d.pilar = this.pilarDefault();
  },
  pilarDefault() {
    return [{ nama: tr('Edukasi & Teardown', 'Educational Teardowns'), persen: 40, deskripsi: tr('Carousel langkah demi langkah, bedah desain/strategi, tips workflow.', 'Step-by-step carousels, design/strategy breakdowns, workflow tips.'), format: 'IG Carousel' },
      { nama: tr('Authority & Behind-the-Scenes', 'Authority & Behind-the-Scenes'), persen: 25, deskripsi: tr('Proses kerja transparan, eksperimen, metrik jujur.', 'Transparent process, experiments, honest metrics.'), format: 'Reels / Video Pendek' },
      { nama: tr('Soft-Sell & Promosi', 'Soft-Sell Promotion'), persen: 20, deskripsi: tr('Problem–solution ke produk, pengumuman, diskon terbatas.', 'Problem–solution to product, launches, limited offers.'), format: 'Story + DM Automation' },
      { nama: tr('Komunitas & Humor', 'Community & Humor'), persen: 15, deskripsi: tr('Keresahan relatable, meme halus, kutipan yang mudah dibagikan.', 'Relatable struggles, gentle memes, shareable quotes.'), format: 'Threads / Single Tile' }];
  },
  mark() { if (!this.dirty) { this.dirty = true; const q = $('#ob-dirty', this.el); if (q) q.hidden = false; } },
  /** baca nilai input ke state (dipanggil sebelum re-render) */
  sync() {
    const el = this.el, d = this.d;
    $$('[data-f]', el).forEach((i) => {
      const f = i.dataset.f, idx = i.dataset.i;
      if (f.indexOf('k.') === 0) d.kit[f.slice(2)] = i.type === 'range' ? Number(i.value) : i.value;
      else if (f.indexOf('m.') === 0) d.masalah[idx][f.slice(2)] = i.value;
      else if (f.indexOf('p.') === 0) d.pilar[idx][f.slice(2)] = f === 'p.persen' ? Number(i.value) || 0 : i.value;
      else if (f === 'persen') d.pilar[idx].persen = Number(i.value) || 0;
      else if (f.indexOf('me.') === 0) d.me[f.slice(3)] = i.value;
      else d[f] = i.value;
    });
  },
  health() {
    const d = this.d, k = d.kit, cek = [!!k.Nama, !!k.FontJudul && !!k.FontIsi, d.nada.length > 0, !!d.TargetAudiens, d.masalah.filter((m) => m.teks).length >= 3, !!(d.sebelum && d.sesudah), this.total() === 100, d.platform.length > 0, App.produk().length > 0, !!d.NamaBrand];
    return Math.round((100 * cek.filter(Boolean).length) / cek.length);
  },
  total() { return this.d.pilar.reduce((s, p) => s + (Number(p.persen) || 0), 0); },
  sumPilar() { this.sync(); const t = this.total(), el = $('#ob-total', this.el); if (el) { el.textContent = tr('Total distribusi: ', 'Total distribution: ') + t + '% ' + (t === 100 ? '✓ ' + tr('terkalibrasi', 'calibrated') : tr('(harus 100%)', '(must be 100%)')); el.style.color = t === 100 ? 'var(--ok)' : 'var(--danger)'; } },
  paint() {
    const el = this.el, d = this.d, k = d.kit, kits = App.kits(), ai = (App.boot && App.boot.ai) || {};
    const sw = [['WarnaPrimer', 'Blush', '#E57B95'], ['WarnaSekunder', 'Sage', '#2F4F3E'], ['WarnaAksen', tr('Aksen', 'Accent'), '#DCE7DF'], ['WarnaLatar', 'Ivory', '#FAF7F2'], ['WarnaTeks', 'Slate', '#1E1B1B']];
    const hl = this.health();
    el.innerHTML =
      App.hero({ word: '01', pills: '<span class="pill mono p-blush">🌸 Onboarding & Profile Engine <span class="dot rose"></span></span>', title: 'craft your brand DNA <span class="it">&amp;</span> audience strategy.',
        sub: tr('Tentukan suara, pilar hook, dan katalog produk digital agar AI Copilot menulis copy autentik yang mengonversi — di carousel, reels, sampai email digest — secara otomatis.', 'Define your voice, hook pillars, and linked digital product catalog so the AI Copilot can write authentic, high-converting copy across carousels, reels, and email digests on autopilot.'),
        side: '<span class="label">Cherries Edition 🍒 &nbsp; 01</span><span class="pill mono p-line"><span class="dot"></span>Sheet: BRAND_PROFIL</span>',
        actions: '<button class="btn btn-sage shine" data-act="save">' + ic('save', 'sm') + tr('Simpan & Buat Strategi', 'Save & Generate Strategy') + ' ✨</button><button class="btn btn-ghost" data-act="saran">' + ic('auto_fix_high', 'sm') + tr('Saran AI dari nol', 'AI suggestions from scratch') + '</button><button class="btn btn-ghost" data-act="go" data-page="settings">' + ic('sync', 'sm') + tr('Import dari Google Sheets', 'Import from Google Sheets') + '</button><button class="btn btn-text" data-act="reset">' + ic('restart_alt', 'sm') + tr('Reset pilar', 'Reset pillars') + '</button>' }) +
      '<div class="grid g3 mt-24" style="gap:12px">' + [['1', tr('Identitas Visual & Nada', 'Visual Identity & Voice'), 'Palette · Typography · Tone', 'check_circle'], ['2', tr('Audiens & Masalah', 'Audience & Pain Points'), 'Ideal persona · desired shift', 'radio_button_checked'], ['3', tr('Hub Monetisasi Digital', 'Digital Monetization Hub'), App.produk().length + tr(' produk tertaut', ' active products linked'), 'storefront']].map((s, i) => '<button class="tile row gap-12' + (i === 1 ? ' is-sel' : '') + '" data-act="tab" data-t="' + s[0] + '" style="text-align:left;' + (i === 1 ? 'background:var(--sage)' : '') + '"><span class="mono tert">0' + s[0] + '</span><span class="grow"><span class="h4" style="display:block">' + h(s[1]) + '</span><span class="label">' + h(s[2]) + '</span></span>' + ic(s[3], 'sm') + '</button>').join('') + '</div>' +
      '<div class="grid g3 mt-16" style="align-items:start">' +
      // ---------------- Langkah 1: Branding Kit ----------------
      '<section class="col gap-16" id="ob-1" style="gap:16px"><div class="card"><div class="card-h"><div class="row gap-8"><span style="font-size:20px">🎨</span><div class="h3">Step 1: Branding Kit</div></div><span class="pill sm mono ' + (k.Default === 'YA' ? 'p-ink' : 'p-line') + '">' + (k.Default === 'YA' ? 'Default' : tr('Alternatif', 'Alternate')) + '</span></div>' +
        '<div class="field"><label>' + tr('Tema visual aktif', 'Active visual theme') + '</label><select class="sel" id="ob-kit">' + opts(kits.map((x) => ({ v: x.ID, l: x.Nama + (x.Default === 'YA' ? ' (Default)' : '') })), k.ID) + '</select></div>' +
        '<div class="row wrap gap-6 mt-8"><button class="btn btn-ghost btn-xs" data-act="kitNew">' + ic('add', 'xs') + tr('Kit baru', 'New kit') + '</button><button class="btn btn-ghost btn-xs" data-act="kitDup">' + ic('content_copy', 'xs') + tr('Duplikat', 'Duplicate') + '</button>' + (k.Default !== 'YA' ? '<button class="btn btn-soft btn-xs" data-act="kitDef">' + ic('star', 'xs') + tr('Jadikan default', 'Make default') + '</button><button class="btn btn-danger btn-xs" data-act="kitDel">' + ic('archive', 'xs') + tr('Arsipkan', 'Archive') + '</button>' : '') + '</div>' +
        '<div class="field mt-16"><label>' + tr('Nama kit', 'Kit name') + '</label><input class="inp" data-f="k.Nama" value="' + h(k.Nama || '') + '"></div>' +
        '<div class="label mt-16 mb-8">' + tr('Warna utama', 'Primary swatches') + '</div><div class="grid" style="grid-template-columns:repeat(5,minmax(0,1fr));gap:8px">' + sw.map((s) => '<label class="col gap-4" style="gap:4px"><input type="color" class="sw-color" style="height:48px" data-f="k.' + s[0] + '" value="' + h(k[s[0]] || s[2]) + '" aria-label="' + s[1] + '"><span class="xs sb">' + s[1] + '</span><span class="mono xs tert">' + h(String(k[s[0]] || s[2]).toUpperCase()) + '</span></label>').join('') + '</div>' +
        '<div class="label mt-16 mb-8">' + tr('Pasangan tipografi', 'Typography pairing') + '</div><div class="grid g2" style="gap:8px"><select class="sel sm" data-f="k.FontJudul">' + opts(FONT_PILIHAN, k.FontJudul || 'Playfair Display') + '</select><select class="sel sm" data-f="k.FontIsi">' + opts(FONT_PILIHAN, k.FontIsi || 'DM Sans') + '</select></div>' +
        '<div class="inset row between mt-8"><span class="font-demo" style="font-family:\'' + h(k.FontJudul || 'Playfair Display') + '\',serif;font-style:italic">' + h(k.FontJudul || 'Playfair') + '</span><span class="small" style="font-family:\'' + h(k.FontIsi || 'DM Sans') + '\'">× ' + h(k.FontIsi || 'DM Sans') + '</span><span class="pill sm mono p-line">Aa / 700</span></div>' +
        '<div class="label mt-16 mb-8">' + tr('Watermark otomatis', 'Auto watermark') + '</div><div class="tile row gap-12"><div class="logo" style="width:42px;height:42px">' + (k.LogoURL ? '<img src="' + h(k.LogoURL) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px" referrerpolicy="no-referrer">' : 'plm.') + '</div><div class="grow"><input class="inp sm" data-f="k.WatermarkTeks" value="' + h(k.WatermarkTeks || '') + '" placeholder="plm. studio"></div><button class="btn btn-ghost btn-xs" data-act="logo" data-j="logo">' + ic('upload', 'xs') + 'Logo</button></div>' +
        '<div class="grid g2 mt-8" style="gap:8px"><select class="sel sm" data-f="k.WatermarkPosisi">' + opts([{ v: 'kanan-bawah', l: tr('Kanan bawah', 'Bottom right') }, { v: 'kiri-bawah', l: tr('Kiri bawah', 'Bottom left') }, { v: 'tengah-bawah', l: tr('Tengah bawah', 'Bottom center') }, { v: 'kanan-atas', l: tr('Kanan atas', 'Top right') }, { v: 'kiri-atas', l: tr('Kiri atas', 'Top left') }], k.WatermarkPosisi || 'kanan-bawah') + '</select><label class="row gap-8 small"><span class="tert">' + tr('Opasitas', 'Opacity') + '</span><input type="range" min="0.1" max="1" step="0.05" data-f="k.WatermarkOpasitas" value="' + h(k.WatermarkOpasitas || 0.85) + '"></label></div>' +
        '<div class="grid g2 mt-8" style="gap:8px"><select class="sel sm" data-f="k.LatarGaya">' + opts([{ v: 'dot-grid', l: 'Dot-grid matrix' }, { v: 'linen', l: 'Linen stationery' }, { v: 'dual-tone', l: 'Dual-tone split' }, { v: 'solid', l: 'Solid' }, { v: 'gradien', l: tr('Gradien neon', 'Neon gradient') }, { v: 'garis', l: tr('Garis buku', 'Notebook lines') }], k.LatarGaya || 'dot-grid') + '</select><input class="inp sm" data-f="k.Emoji" value="' + h(k.Emoji || '') + '" placeholder="🍒✦🌸" aria-label="Emoji stiker"></div>' +
        '<div class="row between mt-16 mb-8"><span class="label">' + tr('Nada bicara (utama)', 'Tone of voice (primary)') + '</span><span class="mono xs tert">' + d.nada.length + ' ' + tr('dipilih', 'selected') + '</span></div><div class="chips">' + this.NADA.map((n) => '<button class="chip' + (d.nada.indexOf(n[0]) > -1 ? ' on' : '') + '" data-act="nada" data-v="' + h(n[0]) + '">' + h(n[0]) + ' ' + n[1] + '</button>').join('') + '</div>' +
        '<div class="field mt-12"><label>' + tr('Gaya visual', 'Visual style') + '</label><input class="inp sm" data-f="k.GayaVisual" value="' + h(k.GayaVisual || '') + '" placeholder="Editorial cream, aksen sage, stiker playful"></div></div>' +
        '<div class="card tight"><div class="label mb-8">' + tr('Moodboard estetika studio', 'Studio aesthetic moodboard') + '</div><div class="canvas-stage" style="min-height:auto;padding:14px" id="ob-prev"></div><div class="row between mt-8 mono xs tert"><span>' + tr('Ekstraksi warna', 'Color extraction') + ': ' + hl + '% match</span><span>Ref: #' + h(String(k.ID || '').slice(-6)) + '</span></div></div></section>' +
      // ---------------- Langkah 2: Audiens ----------------
      '<section class="col gap-16" id="ob-2" style="gap:16px"><div class="card"><div class="card-h"><div class="row gap-8"><span style="font-size:20px">🎯</span><div class="h3">Step 2: Audience Matrix</div></div><span class="pill sm mono p-sage">' + tr('Aktif', 'Active') + '</span></div>' +
        '<div class="field"><label>' + tr('Nama brand', 'Brand name') + '</label><input class="inp" data-f="NamaBrand" value="' + h(d.NamaBrand) + '" placeholder="plm. studio"></div>' +
        '<div class="field mt-12"><label>' + tr('Persona target utama', 'Primary target persona') + '</label><textarea class="ta" rows="3" data-f="TargetAudiens" placeholder="' + tr('Kreator solo & penjual template yang kewalahan…', 'Overwhelmed solo creators & template sellers…') + '">' + h(d.TargetAudiens) + '</textarea></div>' +
        '<div class="row between mt-16 mb-8"><span class="label">' + tr('Masalah inti (bahan bakar hook AI)', 'Core pain points (AI hook fuel)') + '</span><button class="btn-text" data-act="addPain">+ ' + tr('Tambah', 'Add tag') + '</button></div>' +
        '<div class="col gap-8">' + (d.masalah.length ? d.masalah.map((m, i) => '<div class="inset" style="padding:10px"><div class="row gap-8"><span style="color:var(--rose)">✕</span><input class="inp sm white grow" data-f="m.teks" data-i="' + i + '" value="' + h(m.teks) + '" placeholder="' + tr('Posting tidak konsisten & burnout', 'Inconsistent posting & burnout') + '"><button class="icon-btn sm ghost" data-act="delPain" data-i="' + i + '" aria-label="' + tr('Hapus', 'Remove') + '">' + ic('close', 'sm') + '</button></div><div class="row gap-8 mt-8"><select class="sel sm white" data-f="m.tingkat" data-i="' + i + '" style="width:auto">' + opts([{ v: 'Tinggi', l: tr('Tinggi', 'High') }, { v: 'Sedang', l: tr('Sedang', 'Medium') }, { v: 'Rendah', l: tr('Rendah', 'Low') }], m.tingkat) + '</select><select class="sel sm white" data-f="m.tag" data-i="' + i + '" style="width:auto">' + opts(this.TAG, m.tag) + '</select></div></div>').join('') : '<p class="xs muted">' + tr('Tambahkan minimal 3 masalah audiens.', 'Add at least 3 audience pain points.') + '</p>') + '</div>' +
        '<div class="label mt-16 mb-8">' + tr('Narasi transformasi (sebelum → sesudah)', 'Transformation narrative (before → after)') + '</div><div class="card sage tight col gap-8"><span class="label" style="color:var(--sage-ink)">' + tr('Janji', 'Promise') + '</span><input class="inp sm white" data-f="janji" value="' + h(d.janji) + '" placeholder="The 30-Day Clarity Leap"><input class="inp sm white" data-f="sebelum" value="' + h(d.sebelum) + '" placeholder="' + tr('Sebelum: posting dadakan tiap malam', 'Before: frantic last-minute posts') + '"><input class="inp sm white" data-f="sesudah" value="' + h(d.sesudah) + '" placeholder="' + tr('Sesudah: 30 hari konten terjadwal yang menjual', 'After: 30 days of pre-scheduled posts that sell') + '"></div>' +
        '<div class="label mt-16 mb-8">' + tr('Platform utama', 'Main platforms') + '</div><div class="chips">' + PLATFORM.map((p) => '<button class="chip' + (d.platform.indexOf(p) > -1 ? ' on' : '') + '" data-act="plat" data-v="' + h(p) + '">' + h(p) + '</button>').join('') + '</div>' +
        '<div class="grid g2 mt-12" style="gap:8px"><div class="field"><label>' + tr('Demografi', 'Demographics') + '</label><input class="inp sm" data-f="Demografi" value="' + h(d.Demografi) + '" placeholder="Perempuan 72% / 22–38 th"></div><div class="field"><label>' + tr('Tujuan', 'Goal') + '</label><input class="inp sm" data-f="Tujuan" value="' + h(d.Tujuan) + '"></div></div>' +
        '<div class="field mt-12"><label>' + tr('Persona editorial', 'Editorial persona') + '</label><input class="inp sm" data-f="Persona" value="' + h(d.Persona) + '" placeholder="Vogue × SaaS — poised, intimate"></div></div>' +
        '<div class="card tight row gap-12"><div class="avatar sm" style="background:var(--butter)">💬</div><div class="grow"><div class="h4">Community Voice Match</div><input class="inp sm mt-4" data-f="SuaraKomunitas" value="' + h(d.SuaraKomunitas) + '" placeholder="' + tr('Bicara seperti teman agensi yang hangat', 'Speaks like a warm, supportive agency friend') + '"></div></div></section>' +
      // ---------------- Langkah 3: Produk ----------------
      '<section class="col gap-16" id="ob-3" style="gap:16px"><div class="card"><div class="card-h"><div class="row gap-8"><span style="font-size:20px">🛍️</span><div class="h3">Step 3: Product Hub</div></div><span class="pill sm mono p-forest" id="ob-np">' + App.produk().length + ' synced</span></div><p class="xs muted mb-12">' + tr('Produk otomatis dirujuk saat AI membuat CTA, hook, dan soft-pitch newsletter.', 'Products are referenced automatically during AI CTA, hook and newsletter soft-pitches.') + '</p><div class="col gap-8" id="ob-produk"></div></div>' +
        '<div class="card sage"><div class="row between"><div><div class="label" style="color:var(--sage-ink)">' + tr('Indeks kesehatan strategi', 'Strategy health index') + '</div><div class="kpi"><div class="v mt-8">' + hl + '%</div></div><p class="xs mt-4" style="color:var(--sage-ink)">' + (hl === 100 ? tr('Siap dipakai semua modul AI ✦', 'Ready for every AI module ✦') : tr('Lengkapi isian untuk hasil AI terbaik', 'Complete fields for best AI results')) + '</p></div>' + Chart.ring(hl, { color: 'var(--sage-ink)', track: 'rgba(255,255,255,.6)' }) + '</div></div>' +
        '<div class="card"><div class="h4 mb-12">' + tr('Profil pemilik', 'Owner profile') + '</div><div class="col gap-12"><div class="field"><label>' + tr('Nama tampilan', 'Display name') + '</label><input class="inp sm" data-f="me.Nama" value="' + h(d.me.Nama || '') + '"></div><div class="field"><label>WhatsApp <span class="opt">' + tr('untuk pengingat', 'for reminders') + '</span></label><input class="inp sm" data-f="me.WA" inputmode="tel" value="' + h(d.me.WA || '') + '" placeholder="0812…"></div><div class="grid g2" style="gap:8px"><div class="field"><label>' + tr('Pengalaman', 'Experience') + '</label><select class="sel sm" data-f="me.Pengalaman">' + opts([{ v: 'Pemula', l: tr('Pemula', 'Beginner') }, { v: 'Menengah', l: tr('Menengah', 'Intermediate') }, { v: 'Mahir', l: tr('Mahir', 'Advanced') }], d.me.Pengalaman || 'Pemula') + '</select></div><div class="field"><label>' + tr('Bahasa konten', 'Content language') + '</label><select class="sel sm" data-f="me.BahasaKonten">' + opts([{ v: 'id', l: 'Indonesia' }, { v: 'en', l: 'English' }, { v: 'id+en', l: 'ID + EN' }], d.me.BahasaKonten || 'id') + '</select></div></div><div class="field"><label>Niche</label><input class="inp sm" data-f="me.Niche" value="' + h(d.me.Niche || '') + '" placeholder="' + tr('template Notion untuk guru', 'Notion templates for teachers') + '"></div></div></div></section></div>' +
      // ---------------- Pilar ----------------
      '<section class="mt-32"><div class="row between wrap gap-12 mb-16"><div><span class="pill mono p-sage mb-8">✦ 4-Pillar Architecture</span><h2 class="h1 mt-8">content allocation <span class="it">&amp;</span> editorial buckets.</h2></div><div class="row gap-12"><span class="mono xs" id="ob-total"></span><button class="btn btn-ghost btn-sm" data-act="addPilar">' + ic('add', 'sm') + tr('Pilar', 'Pillar') + '</button></div></div>' +
        '<div class="grid g4">' + d.pilar.map((p, i) => '<div class="card ' + ['', 'sage', 'paper', 'sage'][i % 4] + ' col gap-10 hover" style="gap:10px"><div class="row between"><span class="label"><input type="number" min="0" max="100" data-f="persen" data-i="' + i + '" value="' + (Number(p.persen) || 0) + '" class="inp sm white" style="width:64px;height:28px;padding:0 8px;display:inline-block"> % ' + tr('distribusi', 'distribution') + '</span><button class="icon-btn sm ghost" data-act="delPilar" data-i="' + i + '" aria-label="' + tr('Hapus pilar', 'Remove pillar') + '">' + ic('close', 'sm') + '</button></div><input class="inp white" style="font:700 20px var(--f-serif);height:auto;padding:8px 12px;border-radius:14px" data-f="p.nama" data-i="' + i + '" value="' + h(p.nama) + '"><textarea class="ta white" rows="4" data-f="p.deskripsi" data-i="' + i + '">' + h(p.deskripsi || '') + '</textarea><div class="row gap-6"><span class="label">' + tr('Utama', 'Primary') + ':</span><input class="inp sm white grow" data-f="p.format" data-i="' + i + '" value="' + h(p.format || '') + '"></div></div>').join('') + '</div></section>' +
      // ---------------- Simulator hook ----------------
      '<section class="card lg mt-32"><div class="row between wrap gap-12"><div class="row gap-12"><span class="ico-dot sage">' + ic('science') + '</span><div><div class="h2">AI Strategy Preview &amp; Test Hook Simulator</div><p class="xs muted">' + tr('Tolok ukur generasi langsung berdasarkan Brand DNA saat ini', 'Live generation benchmark based on your current Brand Profile DNA') + '</p></div></div><div class="row gap-8"><span class="pill mono p-forest">Model: ' + h(ai.provider === 'template' || !ai.provider ? 'Template Engine' : ai.model || ai.label) + '</span><button class="btn btn-ghost btn-sm" data-act="hook">' + ic('refresh', 'sm') + tr('Regenerate Test Hook', 'Regenerate Test Hook') + '</button></div></div>' +
        '<div class="inset mt-16" id="ob-hook"><div class="row between mono xs tert"><span>' + tr('Contoh hook', 'Generated hook example') + ' #01 · Target: ' + h((d.TargetAudiens || 'kreator').slice(0, 40)) + '</span><span>Est. hook score: —</span></div><p class="serif mt-12" style="font-size:22px;font-style:italic;line-height:1.45">' + tr('Klik "Regenerate Test Hook" untuk melihat bagaimana AI menulis dengan DNA brand Anda.', 'Click "Regenerate Test Hook" to see how AI writes with your brand DNA.') + '</p></div>' +
        '<div class="row between wrap gap-12 mt-16"><span class="xs muted row gap-6"><span class="dot"></span>Google Sheets "BRAND_PROFIL" ' + tr('menyimpan setiap perubahan saat Anda menekan Simpan.', 'stores every change when you press Save.') + '</span><button class="btn btn-sage" data-act="go" data-page="generator">' + tr('Lanjut ke AI Content Generator', 'Proceed to AI Content Generator') + ' ' + ic('arrow_forward', 'sm') + '</button></div></section>' +
      '<div class="qbar" id="ob-dirty" hidden><span class="grow small">' + ic('edit', 'sm') + ' ' + tr('Ada perubahan Brand DNA yang belum disimpan', 'You have unsaved Brand DNA changes') + '</span><button class="btn btn-blush btn-sm" data-act="save">' + ic('save', 'sm') + tr('Simpan sekarang', 'Save now') + '</button></div>';
    if (this.dirty) $('#ob-dirty', el).hidden = false;
    this.sumPilar();
    this.paintProduk();
    this.preview();
  },
  paintProduk() {
    const box = $('#ob-produk', this.el); if (!box) return;
    const ps = App.produk(), per = (App.boot && App.boot.perProduk) || {};
    const pc = { 'Lead Magnet': 'p-line', 'Core Offer': 'p-sage', 'Niche Bundle': 'p-lav', Upsell: 'p-butter' };
    box.innerHTML = ps.map((p) => '<button class="tile w-100" style="text-align:left" data-act="produk" data-id="' + h(p.ID) + '"><div class="row between top gap-8"><span class="sb clamp-2">' + h(p.Nama) + '</span><span class="pill sm ' + (pc[p.Peran] || 'p-line') + '">' + h(p.Peran) + '</span></div><div class="row between mt-8 xs"><span class="mono">' + Fmt.rp(p.Harga) + '</span><span class="mono tert">' + Fmt.n(p.Terjual) + ' ' + tr('terjual', 'sales') + ' · ' + (per[p.ID] || 0) + ' ' + tr('konten', 'posts') + '</span></div>' + (p.HookTrigger ? '<div class="xs muted mt-4 clamp-1">Hook: "' + h(p.HookTrigger) + '"</div>' : '') + '</button>').join('') +
      '<button class="btn btn-ghost btn-block btn-sm" data-act="produk">' + ic('add_circle', 'sm') + tr('Tautkan produk digital baru', 'Link new digital product') + '</button>';
    const np = $('#ob-np', this.el); if (np) np.textContent = ps.length + ' synced';
  },
  previewSoon: debounce(function () { this.sync(); this.preview(); }, 250),
  async preview() {
    const box = $('#ob-prev', this.el); if (!box) return;
    if (typeof Engine === 'undefined') { try { await App.need('engine'); } catch (e) { return; } }
    const k = this.d.kit;
    await Engine.siapkanKit(k);
    const c = Engine.thumb({ judul: (this.d.sesudah || tr('10 aturan brutal produk digital yang laku saat kamu tidur', '10 brutal rules for digital products that sell while you sleep')).slice(0, 80), isi: tr('Geser untuk playbook lengkap →', 'Swipe for the full playbook →') }, Engine.opsiDariKit(k, { format: '4:5', index: 0, total: 6, peran: 'Brand preview' }), 300);
    c.style.maxHeight = '360px';
    box.innerHTML = ''; box.appendChild(c);
  },
  async save(btn) {
    this.sync();
    const d = this.d, t = this.total();
    if (d.pilar.length && t !== 100 && !(await UI.confirm(tr('Total pilar ' + t + '% (idealnya 100%). Tetap simpan?', 'Pillars total ' + t + '% (ideally 100%). Save anyway?')))) return;
    if (t > 100) return UI.toast(tr('Total pilar melebihi 100%.', 'Pillar total exceeds 100%.'), 'err');
    const kit = Object.assign({}, d.kit, { Nada: d.nada.join(', ') });
    const payload = { pemilik: { Nama: d.me.Nama, WA: d.me.WA, Pengalaman: d.me.Pengalaman, BahasaKonten: d.me.BahasaKonten, Niche: d.me.Niche }, kit,
      profil: { ID: d.profilId, NamaBrand: d.NamaBrand, TargetAudiens: d.TargetAudiens, Persona: d.Persona, Tujuan: d.Tujuan, MasalahAudiens: d.masalah.filter((m) => m.teks), Transformasi: { sebelum: d.sebelum, sesudah: d.sesudah, janji: d.janji }, Platform: d.platform, Demografi: d.Demografi, SuaraKomunitas: d.SuaraKomunitas, PilarKonten: d.pilar } };
    const keep = kit.Default !== 'YA';
    UI.busy(btn, true, tr('Menyimpan DNA…', 'Saving DNA…'));
    let r;
    if (keep) {                                       // kit non-default: simpan tanpa mengubah default
      r = await API.call('kit.save', kit, { toast: false });
      if (r.success) r = await API.call('profil.save', Object.assign({}, payload.profil, { KitID: kit.ID }), { toast: false });
      if (r.success) r = await API.call('pemilik.save', payload.pemilik, { toast: false });
      if (r.success) UI.toast(tr('Brand DNA kit "' + kit.Nama + '" tersimpan.', 'Brand DNA for "' + kit.Nama + '" saved.'), 'ok');
    } else r = await API.call('onboarding.selesai', payload);
    UI.busy(btn, false);
    if (!r.success) return;
    this.dirty = false;
    const q = $('#ob-dirty', this.el); if (q) q.hidden = true;
    await App.refreshBoot(true);
    this.load(); this.paint();
    if (btn && /Strategi|Strategy/.test(btn.textContent)) Router.go('strategy');
  },
  saran() {
    const m = UI.modal({ title: tr('Saran Brand DNA dari nol', 'Brand DNA suggestions from scratch'), kicker: tr('Untuk kreator pemula', 'For beginner creators'),
      body: '<div class="col gap-12"><div class="field"><label>' + tr('Niche / keahlian Anda', 'Your niche / expertise') + '</label><input class="inp" id="sr-n" value="' + h(this.d.me.Niche || '') + '" placeholder="' + tr('mis. template Notion untuk guru SD', 'e.g. Notion templates for teachers') + '"></div><div class="field"><label>' + tr('Produk digital (opsional)', 'Digital product (optional)') + '</label><input class="inp" id="sr-p" value="' + h((App.produk()[0] || {}).Nama || '') + '"></div><p class="xs muted">' + tr('AI akan mengisi persona, 5 masalah audiens, transformasi, pilar konten, dan platform. Anda tetap bisa menyunting sebelum menyimpan.', 'AI will fill persona, 5 audience pains, transformation, pillars and platforms. You can still edit before saving.') + '</p></div>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="sr-go">' + ic('auto_awesome', 'sm') + tr('Buat saran', 'Generate') + '</button>' });
    $('#sr-go', m.el.parentNode).onclick = async (e) => {
      UI.busy(e.currentTarget, true, tr('AI berpikir…', 'AI thinking…'));
      const r = await API.call('onboarding.saran', { niche: $('#sr-n', m.el).value, produk: $('#sr-p', m.el).value, pengalaman: this.d.me.Pengalaman, bahasa: this.d.me.BahasaKonten }, { toast: false, noBootRefresh: true });
      UI.busy(e.currentTarget, false);
      if (!r.success) return;
      this.sync();
      const s = r.data.saran, d = this.d;
      d.TargetAudiens = s.targetAudiens || d.TargetAudiens; d.Persona = s.persona || d.Persona; d.Tujuan = s.tujuan || d.Tujuan; d.Demografi = s.demografi || d.Demografi;
      if (s.masalah && s.masalah.length) d.masalah = s.masalah.map((x) => ({ teks: x.teks, tingkat: /tinggi|high/i.test(x.tingkat) ? 'Tinggi' : 'Sedang', tag: this.TAG.indexOf(x.tag) > -1 ? x.tag : 'Konsistensi' }));
      if (s.transformasi) { d.sebelum = s.transformasi.sebelum || d.sebelum; d.sesudah = s.transformasi.sesudah || d.sesudah; d.janji = s.transformasi.janji || d.janji; }
      if (s.pilar && s.pilar.length) d.pilar = s.pilar.slice(0, 6).map((p) => ({ nama: p.nama, persen: Number(p.persen) || 0, deskripsi: p.deskripsi || '', format: p.format || '' }));
      if (s.platform && s.platform.length) d.platform = s.platform.filter((p) => PLATFORM.indexOf(p) > -1);
      if (s.nada && s.nada.length) d.nada = s.nada.slice(0, 3);
      if ($('#sr-n', m.el).value) d.me.Niche = $('#sr-n', m.el).value;
      m.close(); this.mark(); this.paint();
      UI.toast(tr('Saran diterapkan — tinjau lalu Simpan.', 'Suggestions applied — review, then Save.') + (r.data.meta && r.data.meta.fallback ? ' (Mode Template)' : ''), 'ok');
    };
  },
  resetPilar() { this.sync(); this.d.pilar = this.pilarDefault(); this.mark(); this.paint(); },
  async kitAksi(a) {
    const k = this.d.kit;
    if (a === 'new') { const n = await UI.prompt(tr('Nama Branding Kit baru', 'New Branding Kit name'), { placeholder: 'Kit Minimal Mono' }); if (!n) return; const r = await API.call('kit.save', { Nama: n, WarnaPrimer: '#111111', WarnaSekunder: '#E57B95', WarnaAksen: '#F1EFE8', WarnaLatar: '#FFFFFF', WarnaTeks: '#111111', FontJudul: 'DM Serif Display', FontIsi: 'Inter', LatarGaya: 'solid', WatermarkTeks: App.set('NAMA_STUDIO', 'plm. studio') }); if (r.success) { await App.refreshBoot(true); this.kitId = r.data.ID; this.dirty = false; this.load(); this.paint(); } }
    if (a === 'dup') { const r = await API.call('kit.duplicate', { id: k.ID }); if (r.success) { await App.refreshBoot(true); this.kitId = r.data.ID; this.load(); this.paint(); } }
    if (a === 'def') { const r = await API.call('kit.setDefault', { id: k.ID }); if (r.success) { Store.set('kit', k.ID); await App.refreshBoot(true); this.load(); this.paint(); } }
    if (a === 'del') { if (!(await UI.confirm(tr('Arsipkan kit "' + h(k.Nama) + '"? Konten lama tetap memakai warnanya.', 'Archive "' + h(k.Nama) + '"? Old content keeps its colors.'), { danger: true }))) return; const r = await API.call('kit.delete', { id: k.ID }); if (r.success) { await App.refreshBoot(true); this.kitId = App.kitId(); this.load(); this.paint(); } }
  },
  async upload(jenis) {
    const [f] = await Files.pick('image/png,image/jpeg,image/webp,image/svg+xml'); if (!f) return;
    if (f.size > 4 * 1024 * 1024) return UI.toast(tr('Maksimal 4 MB.', 'Max 4 MB.'), 'warn');
    UI.toast(tr('Mengunggah ke Drive…', 'Uploading to Drive…'), 'info');
    const d = await Files.image(f, 800);
    const r = await API.call('kit.upload', { kitId: this.d.kit.ID, jenis, base64: d.base64, mime: d.mime });
    if (r.success) { await App.refreshBoot(true); if (!this.dirty) { this.load(); this.paint(); } }
  },
  async testHook(btn) {
    this.sync();
    UI.busy(btn, true, tr('Menulis…', 'Writing…'));
    const r = await API.call('copy.hooks', { kitId: this.d.kit.ID, framework: 'Contrarian', angle: (this.d.masalah[0] || {}).teks || this.d.TargetAudiens, jumlah: 3, produkId: (App.produk()[0] || {}).ID || '', fresh: true }, { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) return;
    const hk = r.data.hooks[0], p = App.produk()[0];
    $('#ob-hook', this.el).innerHTML = '<div class="row between mono xs tert"><span>' + tr('Contoh hook', 'Generated hook example') + ' #01 · ' + h(hk.angle) + '</span><span>Est. hook score: ' + hk.skor + '/100 ✦</span></div><p class="serif mt-12" style="font-size:22px;font-style:italic;line-height:1.45">“' + h(hk.teks) + '” 🍒</p><div class="row wrap gap-8 mt-12"><span class="pill sm p-line">' + tr('Pilar', 'Pillar') + ': ' + h((this.d.pilar[0] || {}).nama || '-') + '</span>' + (p ? '<span class="pill sm p-line">CTA: ' + h(p.Nama) + '</span>' : '') + '<span class="pill sm p-line">' + tr('Nada', 'Tone') + ': ' + h(this.d.nada.join(' + ') || '-') + '</span><span class="grow"></span><span class="mono xs tert">' + h(r.data.meta.provider) + (r.data.meta.cached ? ' · cache' : '') + '</span></div>';
  },
  destroy() { if (this.dirty) Store.set('ob-draft', { kitId: this.kitId, at: Date.now() }); }
});
