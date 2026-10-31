/* Laporan Performa (R1): KPI per periode + pembanding, tren harian, platform/pilar/format, funnel, konten teratas, input metrik, ekspor Excel/PDF */
'use strict';
Pages.def('reports', {
  M: [['Jangkauan', 'Jangkauan', 'Reach'], ['Interaksi', 'Interaksi', 'Engagement'], ['Simpan', 'Simpan', 'Saves'], ['Bagikan', 'Bagikan', 'Shares'], ['Komentar', 'Komentar', 'Comments'], ['Klik', 'Klik', 'Clicks'], ['Konversi', 'Konversi', 'Conversions'], ['Pendapatan', 'Pendapatan', 'Revenue']],
  marquee() { return ['Growth R1 // Performance Reports', 'Reach · engagement · saves · conversions · revenue', 'Synced with Google Sheets [METRIK · KONTEN]', 'Export to Excel & PDF']; },
  render(el, params) {
    this.el = el; this.rng = Store.get('rep-rng', 30); this.plat = ''; this.met = 'Jangkauan'; this.q = ''; this.sortK = 'Interaksi'; this.d = null; this.prev = null;
    this.sampai = Fmt.today(); this.dari = Fmt.addDays(this.sampai, -(this.rng - 1));
    bindActs(el, {
      rng: (b) => this.setRng(b.dataset.v), met: (b) => { this.met = b.dataset.v; this.paintChart(); this.paintBreak(); }, add: () => this.form(), xls: () => this.xls(), pdf: () => this.pdf(),
      sort: (b) => { this.sortK = b.dataset.k; this.paintTop(); }, edit: (b) => this.form((this.rows || []).find((x) => x.ID === b.dataset.id)), del: (b) => this.hapus(b.dataset.id), open: (b) => Router.go('generator', { id: b.dataset.id })
    });
    el.innerHTML = App.hero({ word: 'R-01', pills: '<span class="pill mono p-sage">' + ic('monitoring', 'xs') + 'Growth report</span><span class="pill mono p-line" id="rp-range"></span>',
      title: tr('angka jujur. <span class="it">keputusan tajam.</span>', 'honest numbers. <span class="it">sharper decisions.</span>'),
      sub: tr('Catat metrik tiap konten yang terbit, lalu lihat pola: platform, pilar, dan format mana yang benar-benar menghasilkan simpan, klik, dan penjualan.', 'Log metrics for each published post, then spot the patterns: which platforms, pillars and formats actually drive saves, clicks and sales.'),
      side: '<button class="btn btn-ink shine" data-act="add">' + ic('add_chart', 'sm') + tr('Catat metrik', 'Log metrics') + '</button><div class="row gap-8"><button class="btn btn-ghost btn-sm" data-act="xls">' + ic('table_view', 'sm') + 'Excel</button><button class="btn btn-ghost btn-sm" data-act="pdf">' + ic('picture_as_pdf', 'sm') + 'PDF</button></div>' }) +
      '<section class="card tight mt-24 row wrap between gap-12"><div class="seg" id="rp-rng"></div><div class="row wrap gap-8"><input class="inp sm" type="date" id="rp-dari" style="width:160px"><span class="tert">→</span><input class="inp sm" type="date" id="rp-sampai" style="width:160px"><select class="sel sm" id="rp-plat" style="width:170px">' + opts([{ v: '', l: tr('Semua platform', 'All platforms') }].concat(PLATFORM)) + '</select></div></section>' +
      '<div class="grid g4 mt-24" id="rp-kpi">' + UI.sk(4) + '</div>' +
      '<div class="grid mt-24" id="rp-g1" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:start"><section class="card lg col gap-12"><div class="row between wrap gap-8"><div><div class="label">' + tr('Tren harian', 'Daily trend') + '</div><h2 class="h2 mt-4" id="rp-ct"></h2></div><div class="seg" id="rp-met"></div></div><div id="rp-chart" style="min-height:240px"></div><p class="xs muted" id="rp-cnote"></p></section><section class="card lg col gap-12" id="rp-fun"></section></div>' +
      '<div class="grid g3 mt-24" id="rp-break" style="align-items:start"></div>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><div class="label">' + tr('Konten teratas', 'Top content') + '</div><h2 class="h2 mt-4">' + tr('Yang paling bekerja di periode ini', 'What worked best this period') + '</h2></div><input class="inp sm" id="rp-q" style="max-width:280px" placeholder="' + tr('Cari judul…', 'Search title…') + '"></div><div id="rp-top">' + UI.sk(3, 'sk-line') + '</div></section>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><div class="label">' + tr('Riwayat input', 'Input history') + '</div><h2 class="h2 mt-4">Google Sheets: [Metrik]</h2></div><button class="btn btn-ghost btn-sm" data-act="add">' + ic('add', 'sm') + tr('Tambah', 'Add') + '</button></div><div id="rp-rows">' + UI.sk(3, 'sk-line') + '</div></section>';
    if (innerWidth < 1100) { $('#rp-g1', el).style.gridTemplateColumns = 'minmax(0,1fr)'; }
    $('#rp-dari', el).onchange = (e) => { if (e.target.value) { this.dari = e.target.value; this.rng = 0; this.muat(); } };
    $('#rp-sampai', el).onchange = (e) => { if (e.target.value) { this.sampai = e.target.value; this.rng = 0; this.muat(); } };
    $('#rp-plat', el).onchange = (e) => { this.plat = e.target.value; this.muat(); };
    $('#rp-q', el).addEventListener('input', debounce(() => { this.q = $('#rp-q', el).value.toLowerCase(); this.paintTop(); }, 200));
    this._rs = debounce(() => this.paintChart(), 200); window.addEventListener('resize', this._rs);
    if (params.tambah) setTimeout(() => this.form(null, params.id), 300);
    this.muat();
  },
  destroy() { window.removeEventListener('resize', this._rs); },
  onBoot() {},
  setRng(v) {
    this.rng = +v; Store.set('rep-rng', this.rng); this.sampai = Fmt.today();
    this.dari = v === 'bulan' ? Fmt.today().slice(0, 8) + '01' : Fmt.addDays(this.sampai, -(this.rng - 1));
    if (v === 'bulan') this.rng = 'bulan';
    this.muat();
  },
  muat() {
    const span = Math.round((Date.parse(this.sampai) - Date.parse(this.dari)) / 864e5) + 1;
    const pDari = Fmt.addDays(this.dari, -span), pSampai = Fmt.addDays(this.dari, -1), q = { dari: this.dari, sampai: this.sampai, platform: this.plat };
    $('#rp-rng', this.el).innerHTML = [[7, '7 ' + tr('hari', 'days')], [30, '30 ' + tr('hari', 'days')], [90, '90 ' + tr('hari', 'days')], ['bulan', tr('Bulan ini', 'This month')]].map((x) => '<button class="' + (String(this.rng) === String(x[0]) ? 'on' : '') + '" data-act="rng" data-v="' + x[0] + '">' + x[1] + '</button>').join('');
    $('#rp-dari', this.el).value = this.dari; $('#rp-sampai', this.el).value = this.sampai;
    $('#rp-range', this.el).textContent = Fmt.tgl(this.dari, { year: undefined }) + ' – ' + Fmt.tgl(this.sampai) + ' · ' + span + tr(' hari', ' days');
    this.span = span;
    API.swr('laporan.ringkas', q, { maxAge: 30000, onData: (d) => { this.d = d; this.paint(); } });
    API.swr('laporan.ringkas', { dari: pDari, sampai: pSampai, platform: this.plat }, { maxAge: 120000, onData: (d) => { this.prev = d; if (this.d) this.paintKpi(); } });
    API.swr('metrik.list', {}, { maxAge: 30000, onData: (rows) => { this.rows = rows; this.paintRows(); } });
    if (!this.konten) API.swr('konten.list', { limit: 300 }, { maxAge: 60000, onData: (d) => { this.konten = d.rows; this.paintRows(); } });
  },
  paint() { this.paintKpi(); this.paintChart(); this.paintFun(); this.paintBreak(); this.paintTop(); },
  delta(k) {
    if (!this.prev || !this.d) return '';
    const a = k === 'er' ? this.d.er : this.d.total[k], b = k === 'er' ? this.prev.er : this.prev.total[k];
    if (!b) return a ? '<span class="delta" style="color:var(--ok)">' + tr('baru', 'new') + '</span>' : '';
    const p = Math.round(100 * (a - b) / b);
    return '<span class="delta" style="color:' + (p >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + ic(p >= 0 ? 'trending_up' : 'trending_down', 'xs') + (p >= 0 ? '+' : '') + p + '%</span>';
  },
  paintKpi() {
    const d = this.d, t = d.total, rp = (v) => Fmt.rp(v);
    const kpi = (cls, l, v, k, sub) => '<div class="card ' + cls + ' kpi"><div class="row between"><span class="label">' + l + '</span>' + this.delta(k) + '</div><div class="v mt-8">' + v + '</div><div class="xs muted mt-4">' + sub + '</div></div>';
    $('#rp-kpi', this.el).innerHTML = kpi('', tr('Jangkauan', 'Reach'), Fmt.k(t.Jangkauan), 'Jangkauan', Fmt.n(t.Tayangan) + tr(' tayangan', ' views')) +
      kpi('sage', 'Engagement rate', d.er + '<small>%</small>', 'er', Fmt.n(t.Interaksi) + tr(' interaksi', ' engagements')) +
      kpi('blush', tr('Simpan & bagikan', 'Saves & shares'), Fmt.k(t.Simpan + t.Bagikan), 'Simpan', Fmt.n(t.Simpan) + tr(' simpan · ', ' saves · ') + Fmt.n(t.Bagikan) + tr(' bagikan', ' shares')) +
      kpi('butter', tr('Pendapatan', 'Revenue'), '<span style="font-size:30px">' + rp(t.Pendapatan) + '</span>', 'Pendapatan', Fmt.n(t.Konversi) + tr(' konversi · ', ' conversions · ') + d.terbit + tr(' konten terbit', ' posts published'));
  },
  paintChart() {
    if (!this.d) return;
    const m = this.M.find((x) => x[0] === this.met), box = $('#rp-chart', this.el), seri = this.d.seri, total = seri.reduce((s, x) => s + x[this.met], 0);
    $('#rp-met', this.el).innerHTML = this.M.filter((x) => ['Jangkauan', 'Interaksi', 'Simpan', 'Klik', 'Konversi', 'Pendapatan'].indexOf(x[0]) > -1).map((x) => '<button class="' + (this.met === x[0] ? 'on' : '') + '" data-act="met" data-v="' + x[0] + '">' + h(tr(x[1], x[2])) + '</button>').join('');
    $('#rp-ct', this.el).textContent = tr(m[1], m[2]) + ' · ' + (this.met === 'Pendapatan' ? Fmt.rp(total) : Fmt.n(total));
    if (!this.d.baris) { box.innerHTML = UI.empty('query_stats', tr('Belum ada metrik di periode ini', 'No metrics in this period'), tr('Catat angka dari Insights Instagram/TikTok/LinkedIn setelah konten terbit.', 'Log numbers from Instagram/TikTok/LinkedIn insights after a post goes live.'), '<button class="btn btn-ink btn-sm" data-act="add">' + tr('Catat metrik', 'Log metrics') + '</button>'); $('#rp-cnote', this.el).textContent = ''; return; }
    Chart.line(box, seri.map((x) => ({ t: x.t, v: x[this.met] })), { h: 240, unit: tr(m[1], m[2]).toLowerCase(), label: tr(m[1], m[2]), color: this.met === 'Pendapatan' ? 'var(--s4)' : this.met === 'Konversi' || this.met === 'Klik' ? 'var(--s3)' : this.met === 'Simpan' ? 'var(--s2)' : 'var(--s1)' });
    const puncak = seri.reduce((a, x) => (x[this.met] > a[this.met] ? x : a), seri[0]);
    $('#rp-cnote', this.el).textContent = tr('Puncak: ', 'Peak: ') + Fmt.tgl(puncak.t) + ' (' + (this.met === 'Pendapatan' ? Fmt.rp(puncak[this.met]) : Fmt.n(puncak[this.met])) + ') · ' + tr('arahkan kursor ke grafik untuk detail harian', 'hover the chart for daily detail');
  },
  paintFun() {
    const t = this.d.total, st = [[tr('Jangkauan', 'Reach'), t.Jangkauan], [tr('Interaksi', 'Engagement'), t.Interaksi], [tr('Klik link', 'Link clicks'), t.Klik], [tr('Konversi', 'Conversions'), t.Konversi]];
    const mx = Math.max(1, st[0][1]);
    $('#rp-fun', this.el).innerHTML = '<div class="label">Funnel</div><h2 class="h2">' + tr('Dari dilihat ke dibeli', 'From seen to sold') + '</h2><div class="col gap-8 mt-8">' + st.map((s, i) => { const w = Math.max(6, Math.round(100 * Math.sqrt(s[1] / mx))), pr = i ? (st[i - 1][1] ? Math.round(1000 * s[1] / st[i - 1][1]) / 10 : 0) : null; return '<div><div class="row between small"><span class="sb">' + h(s[0]) + '</span><span class="mono">' + Fmt.n(s[1]) + (pr !== null ? ' <span class="tert">· ' + pr + '%</span>' : '') + '</span></div><div style="height:26px;border-radius:8px;margin-top:4px;width:' + w + '%;background:' + ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'][i] + ';opacity:.9"></div></div>'; }).join('') + '</div><p class="xs muted mt-8">' + tr('Persen = konversi dari tahap sebelumnya. Lebar batang diskalakan akar kuadrat agar tahap kecil tetap terlihat.', 'Percent = conversion from the previous stage. Bar width uses a square-root scale so small stages stay visible.') + '</p>';
  },
  paintBreak() {
    if (!this.d) return;
    const m = this.met, fmt = m === 'Pendapatan' ? Fmt.rp : Fmt.n, lab = tr(this.M.find((x) => x[0] === m)[1], this.M.find((x) => x[0] === m)[2]);
    const blok = (judul, obj, lbl) => { const ks = Object.keys(obj).sort((a, b) => obj[b][m] - obj[a][m]).slice(0, 8); return '<section class="card col gap-10"><div class="row between"><div class="label">' + judul + '</div><span class="mono xs tert">' + h(lab) + '</span></div>' + (ks.length ? Chart.hbars(ks.map((k) => ({ l: lbl ? lbl(k) : k, v: obj[k][m] })), { fmt, color: 'var(--s1)' }) : '<p class="xs muted">' + tr('Belum ada data.', 'No data yet.') + '</p>') + '</section>'; };
    $('#rp-break', this.el).innerHTML = blok(tr('Per platform', 'By platform'), this.d.perPlatform) + blok(tr('Per pilar konten', 'By content pillar'), this.d.perPilar) + blok(tr('Per format', 'By format'), this.d.perJenis, jenisLabel);
  },
  paintTop() {
    if (!this.d) return;
    const k = this.sortK, rows = this.d.teratas.filter((x) => !this.q || String(x.Judul).toLowerCase().indexOf(this.q) > -1).sort((a, b) => (b[k] || 0) - (a[k] || 0));
    const th = (key, l) => '<th class="tr" style="cursor:pointer" data-act="sort" data-k="' + key + '">' + l + (k === key ? ' ↓' : '') + '</th>';
    $('#rp-top', this.el).innerHTML = rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>' + tr('Konten', 'Content') + '</th><th>Format</th>' + th('Jangkauan', tr('Jangkauan', 'Reach')) + th('Interaksi', tr('Interaksi', 'Eng.')) + th('er', 'ER %') + th('Simpan', tr('Simpan', 'Saves')) + th('Klik', tr('Klik', 'Clicks')) + th('Konversi', tr('Konversi', 'Conv.')) + th('Pendapatan', 'Rp') + '<th></th></tr></thead><tbody>' +
      rows.map((x, i) => '<tr><td class="mono xs">' + (i + 1) + '</td><td><div class="sb small clamp-2" style="max-width:320px">' + h(x.Judul) + '</div><div class="xs muted">' + h(x.Pilar || '') + '</div></td><td><div class="row gap-4 wrap">' + (x.Jenis ? jenisPill(x.Jenis) : '') + (x.Platform ? platPill(x.Platform) : '') + '</div></td><td class="tr num small">' + Fmt.n(x.Jangkauan) + '</td><td class="tr num small">' + Fmt.n(x.Interaksi) + '</td><td class="tr num small">' + (x.er || 0) + '</td><td class="tr num small">' + Fmt.n(x.Simpan) + '</td><td class="tr num small">' + Fmt.n(x.Klik) + '</td><td class="tr num small">' + Fmt.n(x.Konversi) + '</td><td class="tr num small">' + Fmt.k(x.Pendapatan) + '</td><td><div class="row gap-4" style="justify-content:flex-end;flex-wrap:nowrap"><button class="btn btn-ghost btn-xs" data-act="open" data-id="' + h(x.KontenID) + '">' + tr('Buka', 'Open') + '</button><a class="btn btn-ghost btn-xs" href="#/repurpose?id=' + h(x.KontenID) + '" title="Repurpose">↻</a></div></td></tr>').join('') + '</tbody></table></div><p class="xs muted mt-8">' + tr('Klik judul kolom untuk mengurutkan. ↻ = ubah konten pemenang menjadi format lain.', 'Click a column header to sort. ↻ = turn a winning post into other formats.') + '</p>'
      : UI.empty('leaderboard', tr('Belum ada konten bermetrik', 'No content with metrics yet'));
  },
  paintRows() {
    const box = $('#rp-rows', this.el); if (!box || !this.rows) return;
    const kById = {}; (this.konten || []).forEach((k) => { kById[k.ID] = k; });
    const rows = this.rows.filter((m) => m.Tanggal >= this.dari && m.Tanggal <= this.sampai && (!this.plat || m.Platform === this.plat)).sort((a, b) => String(b.Tanggal).localeCompare(String(a.Tanggal))).slice(0, 100);
    box.innerHTML = rows.length ? '<div class="tbl-wrap" style="max-height:420px"><table class="tbl"><thead><tr><th>' + tr('Tanggal', 'Date') + '</th><th>' + tr('Konten', 'Content') + '</th><th>Platform</th><th class="tr">' + tr('Jangkauan', 'Reach') + '</th><th class="tr">' + tr('Interaksi', 'Eng.') + '</th><th class="tr">' + tr('Simpan', 'Saves') + '</th><th class="tr">' + tr('Klik', 'Clicks') + '</th><th class="tr">' + tr('Konversi', 'Conv.') + '</th><th class="tr">Rp</th><th></th></tr></thead><tbody>' +
      rows.map((m) => '<tr><td class="mono xs">' + h(m.Tanggal) + '</td><td class="small"><div class="clamp-1" style="max-width:280px">' + h((kById[m.KontenID] || {}).Judul || m.KontenID) + '</div></td><td class="small">' + h(m.Platform) + '</td><td class="tr num small">' + Fmt.n(m.Jangkauan) + '</td><td class="tr num small">' + Fmt.n(m.Interaksi) + '</td><td class="tr num small">' + Fmt.n(m.Simpan) + '</td><td class="tr num small">' + Fmt.n(m.Klik) + '</td><td class="tr num small">' + Fmt.n(m.Konversi) + '</td><td class="tr num small">' + Fmt.k(m.Pendapatan) + '</td><td><div class="row gap-4" style="justify-content:flex-end;flex-wrap:nowrap"><button class="icon-btn sm ghost" data-act="edit" data-id="' + h(m.ID) + '" aria-label="Edit">' + ic('edit', 'sm') + '</button><button class="icon-btn sm ghost" data-act="del" data-id="' + h(m.ID) + '" aria-label="' + tr('Hapus', 'Delete') + '">' + ic('delete', 'sm') + '</button></div></td></tr>').join('') + '</tbody></table></div>'
      : '<p class="small muted">' + tr('Belum ada input metrik di periode ini.', 'No metric inputs in this period.') + '</p>';
  },
  form(m, kontenId) {
    m = m || { KontenID: kontenId || '', Tanggal: Fmt.today(), Platform: '', Jangkauan: '', Tayangan: '', Interaksi: '', Simpan: '', Bagikan: '', Komentar: '', Klik: '', Konversi: '', Pendapatan: '', Catatan: '' };
    const ks = (this.konten || []).filter((k) => ['Terbit', 'Terjadwal', 'Disetujui'].indexOf(k.Status) > -1 || k.ID === m.KontenID);
    const pilihan = (ks.length ? ks : this.konten || []).map((k) => ({ v: k.ID, l: k.Judul.slice(0, 70) + ' · ' + k.Platform }));
    const num = (n, l, hint) => '<div class="field"><label>' + l + '</label><input class="inp sm" type="number" min="0" name="' + n + '" value="' + h(m[n]) + '" placeholder="' + (hint || '0') + '"></div>';
    const md = UI.modal({ title: m.ID ? tr('Edit metrik', 'Edit metrics') : tr('Catat metrik konten', 'Log content metrics'), kicker: tr('Laporan Performa', 'Performance'), size: 'wide',
      body: '<form class="col gap-12" id="mf"><div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:12px"><div class="field"><label>' + tr('Konten', 'Content') + '</label><select class="sel sm" name="KontenID">' + opts([{ v: '', l: '— ' + tr('pilih konten', 'choose content') + ' —' }].concat(pilihan), m.KontenID) + '</select></div><div class="field"><label>' + tr('Tanggal', 'Date') + '</label><input class="inp sm" type="date" name="Tanggal" value="' + h(m.Tanggal) + '"></div><div class="field"><label>Platform</label><select class="sel sm" name="Platform">' + opts([{ v: '', l: tr('ikut konten', 'same as content') }].concat(PLATFORM), m.Platform) + '</select></div></div>' +
        '<div class="grid g4" style="gap:12px">' + num('Jangkauan', tr('Jangkauan', 'Reach')) + num('Tayangan', tr('Tayangan', 'Views')) + num('Interaksi', tr('Interaksi (total)', 'Engagement (total)'), tr('suka+komentar+simpan', 'likes+comments+saves')) + num('Komentar', tr('Komentar', 'Comments')) + num('Simpan', tr('Simpan', 'Saves')) + num('Bagikan', tr('Bagikan', 'Shares')) + num('Klik', tr('Klik link', 'Link clicks')) + num('Konversi', tr('Konversi/penjualan', 'Conversions/sales')) + '</div>' +
        '<div class="grid g2" style="gap:12px">' + num('Pendapatan', tr('Pendapatan (Rp)', 'Revenue (IDR)')) + '<div class="field"><label>' + tr('Catatan', 'Notes') + '</label><input class="inp sm" name="Catatan" value="' + h(m.Catatan) + '"></div></div><p class="xs muted">' + tr('Ambil angka dari Insights/Analytics tiap platform (biasanya 48–72 jam setelah terbit).', 'Take numbers from each platform’s Insights/Analytics (usually 48–72 hours after posting).') + '</p></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="mf-ok">' + ic('save', 'sm') + tr('Simpan metrik', 'Save metrics') + '</button>' });
    $('#mf-ok', md.el.parentNode).onclick = async (e) => {
      const v = formVals($('#mf', md.el)); if (!v.KontenID) return UI.toast(tr('Pilih konten.', 'Choose content.'), 'warn');
      UI.busy(e.currentTarget, true); const r = await API.call('metrik.save', Object.assign(v, { ID: m.ID || '' })); UI.busy(e.currentTarget, false);
      if (r.success) { md.close(); this.muat(); }
    };
  },
  async hapus(id) {
    if (!(await UI.confirm(tr('Hapus baris metrik ini?', 'Delete this metric row?'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    const r = await API.call('metrik.delete', { id }); if (r.success) this.muat();
  },
  baris() { return (this.d ? this.d.teratas : []).map((x, i) => ({ No: i + 1, Konten: x.Judul, Format: x.Jenis, Platform: x.Platform, Pilar: x.Pilar, Jangkauan: x.Jangkauan, Tayangan: x.Tayangan, Interaksi: x.Interaksi, 'ER %': x.er, Simpan: x.Simpan, Bagikan: x.Bagikan, Klik: x.Klik, Konversi: x.Konversi, Pendapatan: x.Pendapatan })); },
  xls() {
    if (!this.d) return;
    const rows = this.baris(); if (!rows.length) return UI.toast(tr('Belum ada data untuk diekspor.', 'No data to export yet.'), 'warn');
    Export.xlsx(rows, 'Laporan-Performa-' + this.dari + '_' + this.sampai, 'Konten');
  },
  pdf() {
    if (!this.d) return;
    const rows = this.baris(); if (!rows.length) return UI.toast(tr('Belum ada data untuk diekspor.', 'No data to export yet.'), 'warn');
    const t = this.d.total;
    Export.pdf(tr('Laporan Performa Konten', 'Content Performance Report'), rows.map((r) => { const o = Object.assign({}, r); o.Pendapatan = Fmt.rp(o.Pendapatan); delete o.Tayangan; delete o.Bagikan; return o; }),
      App.set('NAMA_STUDIO', 'plm. studio') + ' · ' + Fmt.tgl(this.dari) + ' – ' + Fmt.tgl(this.sampai) + (this.plat ? ' · ' + this.plat : '') + ' · ' + tr('Jangkauan ', 'Reach ') + Fmt.n(t.Jangkauan) + ' · ER ' + this.d.er + '% · ' + tr('Konversi ', 'Conversions ') + Fmt.n(t.Konversi) + ' · ' + Fmt.rp(t.Pendapatan));
  }
});
