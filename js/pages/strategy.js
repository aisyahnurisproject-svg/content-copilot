/* Modul 3 — AI Content Strategist: pilar & rencana bulanan dari nol → turunkan jadi ide konten */
'use strict';
Pages.def('strategy', {
  marquee() { return ['MOD-03 // AI Content Strategist', 'Pillars · monthly plan · KPI', 'Synced with Google Sheets [STRATEGI]', 'Engine: ' + (((App.boot || {}).ai || {}).label || 'Template')]; },
  render(el, params) {
    this.el = el; this.plat = ['Instagram', 'TikTok', 'Threads']; this.sel = params.id || '';
    const pf = App.profil(); if (pf) { const p = pj(pf.Platform, []); if (p.length) this.plat = p.slice(0, 4); }
    bindActs(el, {
      gen: (b) => this.generate(b), plat: (b) => { const v = b.dataset.v, i = this.plat.indexOf(v); if (i > -1) this.plat.splice(i, 1); else this.plat.push(v); b.classList.toggle('on'); },
      open: (b) => this.open(b.dataset.id), terapkan: (b) => this.terapkan(b), aktif: (b) => this.aktifkan(b), hapus: () => this.hapus(), xlsx: () => this.xlsx(),
      buat: (b) => { const it = this.item(b.dataset.w, b.dataset.k); Router.go('generator', { topik: it.topik, hook: it.hook, format: it.format, platform: it.platform, pilar: it.pilar }); }
    });
    el.addEventListener('input', (e) => { if (e.target.name === 'frekuensi') $('#st-fv', el).textContent = e.target.value + tr('×/minggu', '×/week'); });
    this.paint();
    this.loadList();
    if (this.sel) this.open(this.sel);
  },
  paint() {
    const el = this.el, now = Fmt.today().slice(0, 7), nx = Fmt.addDays(now + '-28', 7).slice(0, 7), ai = (App.boot || {}).ai || {};
    el.innerHTML = App.hero({ word: 'W-03', pills: '<span class="pill mono p-lav">⚡ AI Content Strategist</span><span class="pill mono p-line">Mod // 03</span>',
      title: tr('rencanakan sebulan. <span class="it">biarkan sistemnya berjalan.</span>', 'plan the month. <span class="it">let the system run.</span>'),
      sub: tr('Dari Brand DNA Anda, Copilot menyusun pilar, distribusi, rencana 4 minggu, KPI, dan hook pembuka — lalu menurunkannya jadi bank ide siap produksi.', 'From your Brand DNA, Copilot builds pillars, distribution, a 4-week plan, KPIs and opening hooks — then turns it into a production-ready idea bank.') }) +
      '<div class="grid mt-24" style="grid-template-columns:minmax(0,1fr) minmax(0,2.2fr);align-items:start" id="st-grid">' +
      '<div class="col gap-20" style="gap:20px"><form class="card col gap-16" id="st-form" onsubmit="return false"><div class="row between"><span class="label">01 // ' + tr('Parameter', 'Parameters') + '</span><span class="pill sm mono p-sage">' + h(ai.provider === 'template' || !ai.provider ? 'Template' : ai.label) + '</span></div>' +
        '<div class="field"><label>' + tr('Bulan', 'Month') + '</label><select class="sel" name="bulan">' + opts([{ v: now, l: Fmt.bulan(now) }, { v: nx, l: Fmt.bulan(nx) }], nx > now && new Date().getDate() > 20 ? nx : now) + '</select></div>' +
        '<div class="field"><label>' + tr('Frekuensi', 'Frequency') + ' <span class="mono" id="st-fv">5' + tr('×/minggu', '×/week') + '</span></label><input type="range" name="frekuensi" min="1" max="14" value="5"></div>' +
        '<div class="field"><label>' + tr('Platform', 'Platforms') + '</label><div class="chips">' + PLATFORM.slice(0, 9).map((p) => '<button type="button" class="chip' + (this.plat.indexOf(p) > -1 ? ' on' : '') + '" data-act="plat" data-v="' + h(p) + '">' + h(p) + '</button>').join('') + '</div></div>' +
        '<div class="field"><label>' + tr('Fokus / tujuan bulan ini', 'Focus / goal this month') + '</label><textarea class="ta" name="fokus" rows="3" placeholder="' + tr('mis. soft launch e-book & tambah 50 lead', 'e.g. soft launch the e-book & add 50 leads') + '"></textarea></div>' +
        '<div class="grid g2" style="gap:10px"><div class="field"><label>Kit</label><select class="sel sm" name="kitId">' + opts(App.kits().map((k) => ({ v: k.ID, l: k.Nama })), App.kitId()) + '</select></div><div class="field"><label>' + tr('Produk', 'Product') + '</label><select class="sel sm" name="produkId"><option value="">—</option>' + opts(App.produk().map((p) => ({ v: p.ID, l: p.Nama }))) + '</select></div></div>' +
        '<button class="btn btn-ink btn-block shine" data-act="gen">' + ic('auto_awesome', 'sm') + tr('Susun Strategi Bulanan', 'Build Monthly Strategy') + ' ✨</button><p class="xs muted">' + tr('Hasil tersimpan sebagai draf di sheet Strategi. Generate ulang = versi baru.', 'Saved as a draft in the Strategi sheet. Regenerate = new version.') + '</p></form>' +
        '<div class="card"><div class="card-h"><div class="h3">' + tr('Riwayat strategi', 'Strategy history') + '</div></div><div id="st-list" class="col gap-8">' + UI.sk(3, 'sk-line') + '</div></div></div>' +
      '<div id="st-out">' + this.kosong() + '</div></div>';
    if (innerWidth < 1100) $('#st-grid', el).style.gridTemplateColumns = 'minmax(0,1fr)';
  },
  kosong() { return '<div class="card lg">' + UI.empty('psychology', tr('Belum ada strategi dipilih', 'No strategy selected'), tr('Atur parameter lalu klik <b>Susun Strategi Bulanan</b>, atau buka strategi dari riwayat.', 'Set parameters and click <b>Build Monthly Strategy</b>, or open one from history.')) + '</div>'; },
  loadList() {
    API.swr('strategi.list', {}, { maxAge: 20000, onData: (rows) => {
      const box = $('#st-list', this.el); if (!box) return;
      rows = rows.slice().sort((a, b) => String(b.DibuatPada).localeCompare(String(a.DibuatPada)));
      box.innerHTML = rows.length ? rows.slice(0, 12).map((s) => '<button class="tile w-100' + (s.ID === this.sel ? ' is-sel' : '') + '" style="text-align:left" data-act="open" data-id="' + h(s.ID) + '"><div class="row between gap-8"><span class="sb clamp-1">' + h(s.Judul) + '</span>' + stPill(s.Status) + '</div><div class="row between mt-4 xs muted"><span>' + h(Fmt.bulan(s.Bulan)) + '</span><span class="mono">' + h(s.Sumber) + ' · ' + h(Fmt.rel(s.DibuatPada)) + '</span></div></button>').join('') : '<p class="xs muted">' + tr('Belum ada riwayat.', 'No history yet.') + '</p>';
      if (!this.sel && rows.length && !this.plan) this.open((rows.find((r) => r.Status === 'Aktif') || rows[0]).ID);
    } });
  },
  async generate(btn) {
    const v = formVals($('#st-form', this.el));
    if (!this.plat.length) return UI.toast(tr('Pilih minimal satu platform.', 'Pick at least one platform.'), 'warn');
    UI.busy(btn, true, tr('Menyusun 4 minggu…', 'Planning 4 weeks…'));
    $('#st-out', this.el).innerHTML = '<div class="card lg">' + UI.sk(1, 'sk-line') + '<div class="grid g4 mt-16">' + UI.sk(4) + '</div></div>';
    const r = await API.call('strategi.generate', Object.assign(v, { platform: this.plat }), { toast: false });
    UI.busy(btn, false);
    if (!r.success) { $('#st-out', this.el).innerHTML = this.kosong(); return; }
    if (r.data.meta.fallback) UI.toast(r.data.meta.pesan, 'warn'); else UI.toast(r.message, 'ok');
    this.sel = r.data.strategi.ID; this.row = r.data.strategi; this.plan = r.data.plan;
    this.paintPlan(); this.loadList();
  },
  async open(id) {
    this.sel = id;
    $$('#st-list .tile', this.el).forEach((t) => t.classList.toggle('is-sel', t.dataset.id === id));
    const r = await API.swr('strategi.get', { id }, { maxAge: 60000, onData: (row) => { this.row = row; this.plan = pj(row.RencanaBulanan, {}); this.paintPlan(); } });
    if (!r.success) UI.toast(r.message, 'err');
  },
  item(w, k) { return ((this.plan.rencana || [])[w] || {}).konten[k]; },
  paintPlan() {
    const p = this.plan || {}, s = this.row || {}, box = $('#st-out', this.el); if (!box) return;
    const warna = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)'];
    const total = (p.rencana || []).reduce((a, m) => a + (m.konten || []).length, 0);
    box.innerHTML = '<div class="card lg"><div class="row between top wrap gap-12"><div><div class="row gap-8 wrap">' + stPill(s.Status) + '<span class="pill sm mono p-line">' + h(Fmt.bulan(s.Bulan || '')) + '</span><span class="pill sm mono p-lav">' + total + tr(' konten', ' posts') + '</span></div><h2 class="h1 mt-12">' + h(p.judul || s.Judul) + '</h2><p class="lead mt-8">' + h(p.ringkasan || s.Ringkasan || '') + '</p></div>' +
      '<div class="row wrap gap-8"><button class="btn btn-ink btn-sm" data-act="terapkan">' + ic('playlist_add', 'sm') + tr('Turunkan ke bank ide', 'Send to idea bank') + '</button>' + (s.Status !== 'Aktif' ? '<button class="btn btn-soft btn-sm" data-act="aktif">' + ic('check', 'sm') + tr('Aktifkan', 'Activate') + '</button>' : '') + '<button class="btn btn-ghost btn-sm" data-act="xlsx">' + ic('download', 'sm') + 'Excel</button><button class="icon-btn sm" data-act="hapus" aria-label="' + tr('Hapus', 'Delete') + '">' + ic('delete', 'sm') + '</button></div></div>' +
      '<div class="grid g2 mt-24" style="align-items:start"><div><div class="label mb-12">' + tr('Distribusi pilar', 'Pillar distribution') + '</div>' + Chart.hbars((p.pilar || []).map((x, i) => ({ l: x.nama, v: Number(x.persen) || 0, c: warna[i % 5] })), { fmt: (v) => v + '%' }) + '</div>' +
      '<div><div class="label mb-12">KPI</div><div class="col gap-8">' + (p.kpi || []).map((k) => '<div class="tile row between gap-8"><span class="small">' + h(k.nama) + '</span><span class="pill sm mono p-sage">' + h(k.target) + '</span></div>').join('') + '</div></div></div>' +
      '<div class="grid g4 mt-24" style="gap:12px">' + (p.pilar || []).map((x, i) => '<div class="card ' + ['blush', 'sage', 'paper', 'butter', 'lav'][i % 5] + ' tight"><div class="label">' + (Number(x.persen) || 0) + '% · ' + h(x.format || '') + '</div><div class="h4 mt-8">' + h(x.nama) + '</div><p class="xs mt-8">' + h(x.deskripsi || '') + '</p>' + ((x.contohTopik || []).length ? '<ul class="xs mt-8" style="padding-left:16px;margin:8px 0 0">' + x.contohTopik.map((t) => '<li>' + h(t) + '</li>').join('') + '</ul>' : '') + '</div>').join('') + '</div></div>' +
      '<div class="row between wrap mt-24 mb-12"><h3 class="h2">' + tr('Rencana 4 minggu', '4-week plan') + '</h3><span class="xs muted">' + tr('Klik "Buat" untuk langsung menulis konten di Generator', 'Click "Create" to write it in the Generator') + '</span></div>' +
      '<div class="grid g4" style="align-items:start;gap:14px">' + (p.rencana || []).map((m, w) => '<div class="cal-day" style="min-height:auto"><div class="px"><div class="label">' + tr('Minggu', 'Week') + ' ' + h(m.minggu) + '</div><div class="h4 mt-4">' + h(m.fokus || '') + '</div></div>' +
        (m.konten || []).map((k, i) => '<div class="post" style="cursor:default"><div class="row between gap-6"><span class="label">' + h(k.hari || '') + '</span>' + platPill(k.platform) + '</div><div class="row gap-6 wrap">' + jenisPill(k.format) + '<span class="pill sm p-line clamp-1" style="max-width:140px">' + h(k.pilar || '') + '</span></div><div class="sb small">' + h(k.topik || '') + '</div><div class="serif xs" style="font-style:italic;color:var(--ink-2)">“' + h(k.hook || '') + '”</div><div class="row between"><span class="mono xs tert">' + (k.skor ? k.skor + '/100' : '') + '</span><button class="btn btn-ghost btn-xs" data-act="buat" data-w="' + w + '" data-k="' + i + '">' + ic('auto_awesome', 'xs') + tr('Buat', 'Create') + '</button></div></div>').join('') + '</div>').join('') + '</div>' +
      ((p.tips || []).length ? '<div class="card sage mt-24"><div class="label mb-8" style="color:var(--sage-ink)">✦ ' + tr('Tips eksekusi', 'Execution tips') + '</div><ul style="margin:0;padding-left:18px;line-height:1.8">' + p.tips.map((t) => '<li>' + h(t) + '</li>').join('') + '</ul></div>' : '');
  },
  async terapkan(btn) {
    const ok = await UI.confirm(tr('Semua konten di rencana akan masuk ke <b>Bank Ide</b> Content Generator. Terapkan juga pilar ini ke Brand DNA?', 'All planned posts will be added to the Generator <b>Idea Bank</b>. Also apply these pillars to your Brand DNA?'), { ok: tr('Ya, termasuk pilar', 'Yes, include pillars') });
    UI.busy(btn, true);
    const r = await API.call('strategi.terapkan', { id: this.sel, terapkanPilar: ok });
    UI.busy(btn, false);
    if (r.success) { this.row.Status = 'Aktif'; this.paintPlan(); this.loadList(); UI.toast(r.message, 'ok'); setTimeout(() => Router.go('generator', { tab: 'ide' }), 600); }
  },
  async aktifkan(btn) { UI.busy(btn, true); const r = await API.call('strategi.save', { ID: this.sel, Status: 'Aktif', Bulan: this.row.Bulan }); UI.busy(btn, false); if (r.success) { this.row.Status = 'Aktif'; this.paintPlan(); this.loadList(); } },
  async hapus() { if (!(await UI.confirm(tr('Hapus strategi ini?', 'Delete this strategy?'), { danger: true }))) return; const r = await API.call('strategi.delete', { id: this.sel }); if (r.success) { this.sel = ''; this.plan = null; $('#st-out', this.el).innerHTML = this.kosong(); this.loadList(); } },
  xlsx() {
    const rows = []; (this.plan.rencana || []).forEach((m) => (m.konten || []).forEach((k) => rows.push({ Minggu: m.minggu, Fokus: m.fokus, Hari: k.hari, Platform: k.platform, Format: k.format, Pilar: k.pilar, Topik: k.topik, Hook: k.hook, Skor: k.skor })));
    Export.xlsx(rows, 'Strategi-' + (this.row.Bulan || ''), 'Rencana');
  }
});
