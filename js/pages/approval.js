/* Modul 9 — Preview & Approval: antrean review, mockup ponsel, quality gate (aturan + AI), keputusan & riwayat */
'use strict';
Pages.def('approval', {
  TAB: [['Review', 'Review', 'Review'], ['Revisi', 'Revisi', 'Changes'], ['Draf', 'Draf', 'Draft'], ['Disetujui', 'Disetujui', 'Approved']],
  marquee() { return ['Module 09 // Preview & Approval Gate', 'Rule check + AI editorial review', 'Synced with Google Sheets [KONTEN · PERSETUJUAN]', 'Approved → queued for publishing']; },
  render(el, params) {
    if (typeof Engine === 'undefined') { el.innerHTML = '<div class="grid g3">' + UI.sk(3) + '</div>'; App.need('engine').then(() => { if (App.cur === this) this.render(el, params); }); return; }
    this.el = el; this.tab = 'Review'; this.q = ''; this.rows = null; this.k = null; this.si = 0; this.cek = {}; this.mode = ''; this.want = params.id || '';
    bindActs(el, {
      tab: (b) => { this.tab = b.dataset.v; this.list(); }, pick: (b) => this.pilih(b.dataset.id), nav: (b) => this.geser(+b.dataset.d), dot: (b) => { this.si = +b.dataset.i; this.preview(); },
      mode: (b) => { this.mode = b.dataset.v; this.preview(); }, cek: (b) => this.periksa(b, true), dec: (b) => this.putus(b, b.dataset.v),
      go: (b) => Router.go(b.dataset.p, { id: this.k && this.k.ID }), jadwal: () => Shared.jadwal(this.k, () => this.muat(true)), next: () => this.lanjut()
    });
    el.innerHTML = App.hero({ word: 'W-09', pills: '<span class="pill mono p-line">' + ic('verified', 'xs') + 'Quality gate</span><span class="pill mono p-sage">Rule check · AI review</span>',
      title: tr('lihat dulu. <span class="it">terbitkan dengan yakin.</span>', 'preview first. <span class="it">publish with confidence.</span>'),
      sub: tr('Pratinjau konten seperti tampil di ponsel audiens, cek kepatuhan brand & aturan platform, lalu setujui, minta revisi, atau tolak — keputusan tercatat di Google Sheets.', 'Preview content as your audience sees it, check brand & platform rules, then approve, request changes or reject — every decision is logged in Google Sheets.'),
      side: '<div id="ap-sum" class="row gap-8 wrap" style="justify-content:flex-end">' + UI.sk(1, 'sk-line') + '</div>' }) +
      '<div class="grid mt-24" id="ap-grid" style="grid-template-columns:minmax(0,4fr) minmax(0,4fr) minmax(0,5fr);align-items:start">' +
      '<section class="card col gap-12"><div class="seg w-100" id="ap-tabs"></div><input class="inp sm" id="ap-q" placeholder="' + tr('Cari judul…', 'Search title…') + '"><div id="ap-list" class="col gap-8" style="max-height:680px;overflow:auto">' + UI.sk(4, 'sk-line') + '</div></section>' +
      '<section class="col gap-12" id="ap-prev"></section><section class="col gap-16" id="ap-gate" style="gap:16px"></section></div>';
    const g = $('#ap-grid', el);
    if (innerWidth < 1200) g.style.gridTemplateColumns = innerWidth < 800 ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)';
    $('#ap-q', el).addEventListener('input', debounce(() => { this.q = $('#ap-q', el).value.toLowerCase(); this.list(); }, 200));
    this.kosong();
    this.muat();
  },
  onBoot() { this.muat(true); },
  muat(segar) {
    const done = (d) => {
      this.rows = d.rows; this.ringkas = d.ringkas; this.paintSum(); this.list();
      if (this.want) { const id = this.want; this.want = ''; const r = this.rows.find((x) => x.ID === id); if (r) { this.tab = r.Status; this.list(); } this.pilih(id); }
      else if (this.k) { const r = this.rows.find((x) => x.ID === this.k.ID); if (r) { this.k = Object.assign({}, this.k, r); this.paintGate(); } }
    };
    if (segar) API.read('approval.list', {}).then((r) => { if (r.success) done(r.data); });
    else API.swr('approval.list', {}, { maxAge: 10000, onData: done });
  },
  paintSum() {
    const s = this.ringkas || {};
    $('#ap-sum', this.el).innerHTML = '<span class="pill p-blush">' + ic('rate_review', 'xs') + s.review + ' review</span><span class="pill p-butter">' + ic('edit', 'xs') + s.revisi + ' ' + tr('revisi', 'changes') + '</span><span class="pill p-sage">' + ic('check_circle', 'xs') + s.disetujui + ' ' + tr('disetujui', 'approved') + '</span>';
  },
  list() {
    if (!this.rows) return;
    const n = {}; this.rows.forEach((r) => { n[r.Status] = (n[r.Status] || 0) + 1; });
    $('#ap-tabs', this.el).innerHTML = this.TAB.map((t) => '<button class="grow' + (this.tab === t[0] ? ' on' : '') + '" data-act="tab" data-v="' + t[0] + '">' + h(tr(t[1], t[2])) + ' <span class="mono xs tert">' + (n[t[0]] || 0) + '</span></button>').join('');
    const rows = this.rows.filter((r) => r.Status === this.tab && (!this.q || String(r.Judul).toLowerCase().indexOf(this.q) > -1));
    $('#ap-list', this.el).innerHTML = rows.length ? rows.map((r) => {
      const a = r._apv, j = r._jadwal;
      return '<button class="tile w-100' + (this.k && this.k.ID === r.ID ? ' is-sel' : '') + '" style="text-align:left" data-act="pick" data-id="' + h(r.ID) + '"><div class="row between gap-8"><span class="mono xs tert">' + h(r.ID) + '</span>' + (j ? '<span class="pill sm p-lav">' + ic('schedule', 'xs') + h(Fmt.tgl(j.Tanggal, { year: undefined })) + ' ' + h(j.Jam) + '</span>' : '') + '</div><div class="sb small clamp-2 mt-4">' + h(r.Judul) + '</div><div class="row gap-6 mt-8 wrap">' + jenisPill(r.Jenis) + platPill(r.Platform) + (a ? '<span class="pill sm mono ' + (a.Status === 'Disetujui' ? 'p-ok' : a.Status === 'Revisi' ? 'p-warn' : 'p-danger') + '">' + h(a.Status) + (a.Skor ? ' · ' + h(a.Skor) : '') + '</span>' : '') + '</div></button>';
    }).join('') : UI.empty(this.tab === 'Review' ? 'task_alt' : 'inbox', this.tab === 'Review' ? tr('Antrean review kosong', 'Review queue is empty') : tr('Tidak ada konten', 'No content'), this.tab === 'Review' ? tr('Kirim konten ke review dari Generator / Copy Studio.', 'Send content to review from the Generator / Copy Studio.') : '');
  },
  kosong() {
    $('#ap-prev', this.el).innerHTML = '<div class="card">' + UI.empty('smartphone', tr('Pilih konten dari antrean', 'Pick content from the queue'), tr('Pratinjau ponsel, checklist, dan keputusan muncul di sini.', 'Phone preview, checklist and decision appear here.')) + '</div>';
    $('#ap-gate', this.el).innerHTML = '';
  },
  async pilih(id) {
    $$('#ap-list .tile', this.el).forEach((t) => t.classList.toggle('is-sel', t.dataset.id === id));
    $('#ap-prev', this.el).innerHTML = '<div class="card">' + UI.sk(1) + '</div>'; $('#ap-gate', this.el).innerHTML = '<div class="card">' + UI.sk(2, 'sk-line') + '</div>';
    const r = await API.read('konten.get', { id }); if (!r.success) { this.kosong(); return UI.toast(r.message, 'err'); }
    const meta = (this.rows || []).find((x) => x.ID === id) || {};
    this.k = Object.assign({}, r.data, { _apv: meta._apv, _jadwal: meta._jadwal }); this.si = 0; this.mode = '';
    this.preview(); this.paintGate(); this.riwayat();
    if (innerWidth < 800) $('#ap-prev', this.el).scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!this.cek[id]) this.periksa(null, false);
  },
  slides() { return Engine.slidesDariKonten(this.k); },
  geser(d) { const n = this.slides().length; this.si = (this.si + d + n) % n; this.preview(); },
  async preview() {
    const k = this.k; if (!k) return;
    const fmt = this.mode || Engine.rasioDari(k.Jenis, k.Platform), kit = App.kit(k.KitID) || App.kit(), s = this.slides(), vertikal = fmt === '9:16';
    const nama = (kit && kit.WatermarkTeks) || App.set('NAMA_STUDIO', 'plm. studio'), tag = String(k.Hashtag || '').trim();
    const box = $('#ap-prev', this.el);
    box.innerHTML = '<div class="card col gap-12"><div class="row between wrap gap-8"><span class="label">' + tr('Pratinjau perangkat', 'Device preview') + '</span><div class="seg">' + [['4:5', 'Feed'], ['1:1', '1:1'], ['9:16', 'Reels']].map((m) => '<button class="' + (fmt === m[0] ? 'on' : '') + '" data-act="mode" data-v="' + m[0] + '">' + m[1] + '</button>').join('') + '</div></div>' +
      '<div class="phone"><div class="phone-screen">' + (vertikal ? '<div class="reel" id="ap-canvas" style="display:grid;place-items:center;background:#111"><div class="ov"><b>@' + h(nama.replace(/\s+/g, '')) + '</b><div class="clamp-3 mt-4">' + h(k.Caption || k.Judul) + '</div><div class="mt-4" style="opacity:.8">♪ ' + h(this.musik(k)) + '</div></div></div>'
        : '<div class="ig-head"><span class="avatar" style="width:28px;height:28px;font-size:11px;background:' + h((kit && kit.WarnaPrimer) || '#E57B95') + ';color:#fff">' + h(nama.slice(0, 1).toUpperCase()) + '</span><span class="grow">' + h(nama) + '<div class="xs muted" style="font-weight:400">' + h(k.Platform) + '</div></span>' + ic('more_horiz', 'sm') + '</div><div id="ap-canvas" style="background:#f4f1ec;display:grid;place-items:center;position:relative"></div>' +
          '<div class="row between" style="padding:8px 12px 0"><span class="row gap-10">' + ic('favorite', 'sm') + ic('mode_comment', 'sm') + ic('send', 'sm') + '</span><span class="row gap-4" id="ap-dots"></span>' + ic('bookmark', 'sm') + '</div><div class="ig-cap"><b>' + h(nama) + '</b> ' + h(k.Caption || '') + (k.CTA ? '\n\n' + h(k.CTA) : '') + (tag ? '\n\n<span style="color:#2A78D6">' + h(tag) + '</span>' : '') + '</div>') + '</div></div>' +
      (s.length > 1 ? '<div class="row between"><button class="btn btn-ghost btn-sm" data-act="nav" data-d="-1">' + ic('chevron_left', 'sm') + tr('Sebelumnya', 'Prev') + '</button><span class="mono small nowrap">' + (this.si + 1) + ' / ' + s.length + '</span><button class="btn btn-ghost btn-sm" data-act="nav" data-d="1">' + tr('Berikutnya', 'Next') + ic('chevron_right', 'sm') + '</button></div>' : '') +
      '<div class="row wrap gap-8">' + jenisPill(k.Jenis) + platPill(k.Platform) + stPill(k.Status) + (k.URLAset ? '<a class="pill sm p-sage" href="' + h(k.URLAset) + '" target="_blank" rel="noopener">' + ic('image', 'xs') + tr('Aset diekspor ↗', 'Exported asset ↗') + '</a>' : '') + '</div></div>';
    if (!vertikal && s.length > 1) $('#ap-dots', box).innerHTML = s.slice(0, 10).map((_, i) => '<i data-act="dot" data-i="' + i + '" style="width:6px;height:6px;border-radius:50%;cursor:pointer;background:' + (i === this.si ? '#2A78D6' : '#cfc8bd') + '"></i>').join('');
    const as = await Engine.siapkanKit(kit); if (this.k !== k) return;
    const o = Engine.opsiDariKit(kit, { format: fmt, index: this.si, total: s.length, produk: (App.produk().find((p) => p.ID === k.ProdukID) || {}).Nama });
    o.watermark.logo = as.logo; if (k.Watermark === 'TIDAK') o.watermark.aktif = false;
    const c = Engine.thumb(s[this.si] || { judul: k.Judul }, o, 276); c.style.width = '100%'; c.style.height = 'auto'; c.style.display = 'block';
    if (vertikal) { c.style.maxHeight = '100%'; c.style.width = 'auto'; }
    const tgt = $('#ap-canvas', box); if (tgt) tgt.prepend(c);
    let x0 = null; c.addEventListener('pointerdown', (e) => { x0 = e.clientX; }); c.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 30) this.geser(dx < 0 ? 1 : -1); else if (s.length > 1) { const r = c.getBoundingClientRect(); this.geser(e.clientX > r.left + r.width / 2 ? 1 : -1); } });
  },
  musik(k) { const m = pj(k.MusikMedia, {}); return (m.pustaka && m.pustaka[0] && m.pustaka[0].Nama) || m.saran || tr('Audio original', 'Original audio'); },
  paintGate() {
    const k = this.k; if (!k) return;
    const c = this.cek[k.ID], j = k._jadwal, a = k._apv;
    const ikon = { ok: ['check_circle', 'var(--ok)'], warn: ['error', 'var(--warn)'], fail: ['cancel', 'var(--danger)'] };
    const baris = (x) => '<div class="list-row" style="padding:9px 0;border-bottom:1px dotted var(--line)"><span style="color:' + (ikon[x.status] || ikon.warn)[1] + '">' + ic((ikon[x.status] || ikon.warn)[0], 'sm') + '</span><div class="grow"><div class="sb small">' + h(x.aspek) + '</div><div class="xs muted">' + h(x.catatan || '') + '</div></div></div>';
    $('#ap-gate', this.el).innerHTML =
      '<div class="card col gap-12"><div class="row between top gap-12"><div><div class="label">' + tr('Gerbang kualitas', 'Quality gate') + '</div><h2 class="h2 mt-4 clamp-2">' + h(k.Judul) + '</h2><div class="xs muted mt-4">' + tr('Diperbarui ', 'Updated ') + h(Fmt.rel(k.DiperbaruiPada)) + (j ? ' · ' + tr('Tayang ', 'Goes live ') + h(Fmt.tgl(j.Tanggal)) + ' ' + h(j.Jam) + ' WIB' : '') + '</div></div>' +
        (c ? Chart.ring(c.skor, { size: 84, color: c.skor >= 80 ? 'var(--sage-ink)' : c.skor >= 60 ? 'var(--warn)' : 'var(--danger)' }) : '<div class="sk" style="width:84px;height:84px;border-radius:50%"></div>') + '</div>' +
        (c ? '<div class="row gap-8 wrap"><span class="pill sm mono p-line">' + tr('Aturan', 'Rules') + ' ' + c.skorAturan + '%</span>' + (c.ai ? '<span class="pill sm mono p-lav">AI ' + h(c.ai.skor) + ' · ' + h(c.ai.meta.provider) + (c.ai.meta.cached ? ' · cache' : '') + '</span>' : '') + '<button class="btn btn-text btn-xs" data-act="cek">' + ic('refresh', 'xs') + tr('Periksa ulang', 'Re-check') + '</button></div>' +
          '<div>' + c.cek.map(baris).join('') + '</div>' +
          (c.ai ? '<div class="inset col gap-8"><div class="label">' + ic('auto_awesome', 'xs') + tr('Catatan editorial AI', 'AI editorial notes') + '</div><p class="small">' + h(c.ai.ringkasan || '') + '</p>' + (c.ai.cek || []).map(baris).join('') + ((c.ai.saran || []).length ? '<ul class="small" style="padding-left:18px;margin:4px 0 0">' + c.ai.saran.map((x) => '<li>' + h(x) + '</li>').join('') + '</ul>' : '') + '</div>' : '')
          : '<div class="col gap-8">' + UI.sk(4, 'sk-line') + '</div>') + '</div>' +
      '<div class="card col gap-12"><div class="label">' + tr('Keputusan', 'Decision') + '</div><div class="field"><label>' + tr('Catatan untuk revisi / arsip', 'Notes for changes / archive') + '</label><textarea class="ta" id="ap-note" rows="3" placeholder="' + tr('mis. Hook slide 1 terlalu panjang, CTA ganti ke “simpan”.', 'e.g. Slide 1 hook is too long, change CTA to “save”.') + '"></textarea></div>' +
        '<div class="grid g3" style="gap:8px"><button class="btn btn-sage" data-act="dec" data-v="Disetujui">' + ic('check', 'sm') + tr('Setujui', 'Approve') + '</button><button class="btn btn-blush" data-act="dec" data-v="Revisi">' + ic('edit', 'sm') + tr('Revisi', 'Changes') + '</button><button class="btn btn-ghost" data-act="dec" data-v="Ditolak" style="color:var(--danger)">' + ic('block', 'sm') + tr('Tolak', 'Reject') + '</button></div>' +
        (a ? '<p class="xs muted">' + tr('Keputusan terakhir: ', 'Last decision: ') + '<b>' + h(a.Status) + '</b> · ' + h(Fmt.dt(a.Tanggal)) + '</p>' : '') +
        '<div class="divider"></div><div class="row wrap gap-6"><button class="btn btn-ghost btn-xs" data-act="go" data-p="generator">' + ic('auto_awesome', 'xs') + 'Generator</button><button class="btn btn-ghost btn-xs" data-act="go" data-p="copy">' + ic('edit_note', 'xs') + 'Copy</button><button class="btn btn-ghost btn-xs" data-act="go" data-p="graphic">' + ic('palette', 'xs') + 'Graphic</button>' + (j ? '' : '<button class="btn btn-ghost btn-xs" data-act="jadwal">' + ic('event', 'xs') + tr('Jadwalkan', 'Schedule') + '</button>') + '<button class="btn btn-text btn-xs" data-act="next">' + tr('Berikutnya', 'Next') + ' →</button></div></div>' +
      '<div class="card col gap-8"><div class="label">' + tr('Riwayat persetujuan', 'Approval history') + '</div><div id="ap-hist">' + UI.sk(2, 'sk-line') + '</div></div>';
    if (this.hist && this.hist.id === k.ID) this.paintHist();
  },
  async periksa(btn, fresh) {
    const k = this.k; if (!k) return;
    if (btn) UI.busy(btn, true, tr('Memeriksa…', 'Checking…'));
    const r = await API.call('approval.aiCheck', { kontenId: k.ID, fresh: !!fresh }, { toast: false, noBootRefresh: true });
    if (btn) UI.busy(btn, false);
    if (!r.success) { UI.toast(r.message, 'err'); return; }
    this.cek[k.ID] = r.data;
    if (r.data.ai && r.data.ai.meta && r.data.ai.meta.fallback) UI.toast(r.data.ai.meta.pesan, 'warn');
    if (this.k === k) { const note = $('#ap-note', this.el), v = note ? note.value : ''; this.paintGate(); if (v) $('#ap-note', this.el).value = v; }
  },
  async putus(btn, st) {
    const k = this.k, catatan = $('#ap-note', this.el).value.trim(), c = this.cek[k.ID];
    if (st !== 'Disetujui' && !catatan) { $('#ap-note', this.el).focus(); return UI.toast(tr('Tulis catatan singkat supaya revisinya jelas.', 'Add a short note so the change is clear.'), 'warn'); }
    if (st === 'Disetujui' && c && c.cek.some((x) => x.status === 'fail') && !(await UI.confirm(tr('Masih ada pemeriksaan yang gagal. Tetap setujui?', 'Some checks failed. Approve anyway?')))) return;
    if (st === 'Ditolak' && !(await UI.confirm(tr('Konten akan diarsipkan. Lanjutkan?', 'The content will be archived. Continue?'), { danger: true, ok: tr('Tolak & arsipkan', 'Reject & archive') }))) return;
    UI.busy(btn, true);
    const r = await API.call('approval.decide', { kontenId: k.ID, status: st, catatan, tahap: 'Final', skor: c ? c.skor : 0, checklist: c ? c.cek.map((x) => ({ aspek: x.aspek, status: x.status })) : [] });
    UI.busy(btn, false);
    if (!r.success) return;
    if (st === 'Disetujui') UI.confetti();
    const row = (this.rows || []).find((x) => x.ID === k.ID);
    if (row) { row.Status = r.data.status; row._apv = { Status: st, Skor: c ? c.skor : '', Tanggal: new Date().toISOString() }; if (['Review', 'Revisi', 'Draf', 'Disetujui'].indexOf(row.Status) < 0) this.rows = this.rows.filter((x) => x !== row); }
    this.hist = null; this.lanjut(k.ID); this.muat(true);
  },
  lanjut(dariId) {
    const antre = (this.rows || []).filter((r) => r.Status === this.tab && r.ID !== (dariId || (this.k && this.k.ID)));
    this.list();
    if (antre.length) this.pilih(antre[0].ID); else { this.k = null; this.kosong(); this.list(); }
  },
  async riwayat() {
    const id = this.k.ID, r = await API.read('approval.riwayat', { kontenId: id });
    if (!r.success || !this.k || this.k.ID !== id) return;
    this.hist = { id, rows: r.data }; this.paintHist();
  },
  paintHist() {
    const box = $('#ap-hist', this.el); if (!box) return;
    const rows = this.hist.rows;
    box.innerHTML = rows.length ? '<div class="timeline">' + rows.map((p) => '<div class="tl-item' + (p.Status === 'Disetujui' ? ' soft' : '') + '"><div class="row between gap-8"><span class="sb small">' + h(p.Status) + (p.Skor ? ' · ' + h(p.Skor) : '') + '</span><span class="mono xs tert">' + h(Fmt.dt(p.Tanggal)) + '</span></div>' + (p.Catatan ? '<div class="xs muted mt-4">' + h(p.Catatan) + '</div>' : '') + '</div>').join('') + '</div>' : '<p class="xs muted">' + tr('Belum ada keputusan untuk konten ini.', 'No decisions yet for this content.') + '</p>';
  }
});
