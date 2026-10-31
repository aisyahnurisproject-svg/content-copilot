/* Modul 8 — Content Calendar & Planner: mingguan/bulanan/daftar, drag & drop, batch jadwal, Google Calendar, pillar balance */
'use strict';
Pages.def('calendar', {
  marquee() { return ['Module 08 // Content Calendar & Planner', 'Automated schedule dispatcher', 'Synced with Google Sheets [KALENDER, KONTEN, PERSETUJUAN]', 'Reminder ' + App.set('PENGINGAT_MENIT', '60') + ' min before go-live via WA/Email']; },
  render(el, params) {
    this.el = el; this.view = Store.get('cal-view', 'minggu'); this.plat = ''; this.anchor = Fmt.mondayOf(params.tgl || Fmt.today()); this.rows = null; this.range = null;
    bindActs(el, {
      view: (b) => { this.view = b.dataset.v; Store.set('cal-view', this.view); this.paint(); }, nav: (b) => this.geser(+b.dataset.d), today: () => { this.anchor = Fmt.mondayOf(Fmt.today()); this.load(); },
      plat: (b) => { this.plat = b.dataset.v; this.paint(); }, add: (b) => this.addSlot(b.dataset.tgl), batch: () => this.batch(), gcal: (b) => this.gcal(b),
      menu: (b, e) => { e.stopPropagation(); this.menu(b); }, open: (b) => Router.go('generator', { id: b.dataset.id }), approve: (b) => Router.go('approval', { id: b.dataset.id }),
      terbit: (b) => this.status(b.dataset.id, 'Terbit'), copy: (b) => Router.go('copy', { id: b.dataset.id }), bulan: () => this.pilihBulan()
    });
    el.addEventListener('dragstart', (e) => { const p = e.target.closest('[data-drag]'); if (!p) return; e.dataTransfer.setData('text/plain', p.dataset.drag); e.dataTransfer.effectAllowed = 'move'; p.classList.add('dragging'); });
    el.addEventListener('dragend', (e) => { const p = e.target.closest('[data-drag]'); if (p) p.classList.remove('dragging'); $$('.cal-day.drop', el).forEach((d) => d.classList.remove('drop')); });
    el.addEventListener('dragover', (e) => { const d = e.target.closest('[data-day]'); if (!d) return; e.preventDefault(); $$('.cal-day.drop', el).forEach((x) => { if (x !== d) x.classList.remove('drop'); }); d.classList.add('drop'); });
    el.addEventListener('drop', (e) => { const d = e.target.closest('[data-day]'); if (!d) return; e.preventDefault(); d.classList.remove('drop'); const id = e.dataTransfer.getData('text/plain'); if (id) this.pindah(id, d.dataset.day); });
    this.paint();
    this.load();
  },
  onBoot() { this.load(true); },
  load(quiet) {
    const dari = Fmt.addDays(this.anchor, -42), sampai = Fmt.addDays(this.anchor, 77);
    if (this.range && !quiet && this.anchor >= Fmt.addDays(this.range[0], 35) && Fmt.addDays(this.anchor, 42) <= this.range[1]) { this.paint(); return; }
    API.swr('kalender.list', { dari, sampai }, { maxAge: 15000, onData: (d) => { this.rows = d.rows; this.range = [d.dari, d.sampai]; this.paint(); } });
  },
  geser(d) {
    if (this.view === 'bulan') { const [y, m] = Fmt.addDays(this.anchor, 3).split('-').map(Number), t = new Date(Date.UTC(y, m - 1 + d, 1, 5)), ym = t.toISOString().slice(0, 7); let a = Fmt.mondayOf(ym + '-01'); if (Fmt.addDays(a, 3).slice(0, 7) !== ym) a = Fmt.addDays(a, 7); this.anchor = a; }
    else this.anchor = Fmt.addDays(this.anchor, 7 * d);
    this.load();
  },
  minggu(ymd) { const [y, m, d] = ymd.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d)); const day = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - day + 3); const f = new Date(Date.UTC(t.getUTCFullYear(), 0, 4)); return 1 + Math.round(((t - f) / 864e5 - 3 + ((f.getUTCDay() + 6) % 7)) / 7); },
  vis() { return (this.rows || []).filter((r) => r.Status !== 'Batal' && (!this.plat || r.Platform === this.plat)); },
  paint() {
    const el = this.el, a = this.anchor, akhir = Fmt.addDays(a, 6), all = (this.rows || []).filter((r) => r.Status !== 'Batal');
    const wk = all.filter((r) => r.Tanggal >= a && r.Tanggal <= akhir), cnt = {}; wk.forEach((r) => { cnt[r.Platform] = (cnt[r.Platform] || 0) + 1; });
    const label = this.view === 'bulan' ? Fmt.bulan(Fmt.addDays(a, 3).slice(0, 7)) : Fmt.tgl(a, { year: undefined }) + ' – ' + Fmt.tgl(akhir);
    el.innerHTML = '<header class="card lg rel" style="overflow:visible"><div class="row gap-8" style="position:absolute;top:-14px;right:36px;transform:rotate(2deg)"><span class="pill p-blush" style="box-shadow:var(--sh)">🍒 Editorial cadence</span><span class="pill p-sage" style="box-shadow:var(--sh)">🌸 ' + all.filter((r) => r.Status === 'Terjadwal').length + ' slots queued</span></div>' +
      '<span class="pill mono p-line mb-12">' + ic('event_repeat', 'xs') + 'Dispatch orchestration layer</span><h1 class="display mt-12" style="text-transform:lowercase">curate your cadence.<br><span class="it">publish with grace.</span></h1><p class="lead mt-12">' + tr('Atur jadwal publikasi multi-platform, pengingat otomatis, dan pipeline publikasi yang tersinkron langsung dengan skema kalender Google Sheets Anda.', 'Orchestrate your multi-platform publishing schedule, automated reminder triggers and publication pipeline synced with your Google Sheets calendar schema.') + '</p>' +
      '<div class="row wrap gap-12 mt-24"><button class="btn btn-sage" data-act="batch">✦ ' + tr('Jadwalkan batch baru', 'Schedule New Batch') + '</button><button class="btn btn-ghost" data-act="gcal">' + ic('sync', 'sm') + 'Sync Google Calendar 📅</button><button class="btn btn-ghost" data-act="bulan">' + ic('calendar_month', 'sm') + h(Fmt.bulan(Fmt.addDays(a, 3).slice(0, 7))) + ' ' + ic('expand_more', 'sm') + '</button><span class="grow"></span><span class="label row gap-6"><span class="dot"></span>Sheet sync: ' + (Perf.last ? Fmt.rel(new Date(Perf.last.at).toISOString()) : '—') + '</span></div></header>' +
      '<section class="card tight mt-24 row wrap between gap-12"><div class="row wrap gap-10" style="gap:10px"><div class="seg"><button data-act="nav" data-d="-1" aria-label="prev">' + ic('chevron_left', 'sm') + '</button><button class="on" data-act="today" style="font-family:var(--f-serif);font-weight:700">' + h(label) + '</button><button data-act="nav" data-d="1" aria-label="next">' + ic('chevron_right', 'sm') + '</button></div><span class="pill mono p-blush">' + tr('Minggu', 'Week') + ' ' + this.minggu(a) + tr(' aktif', ' active') + '</span>' +
      '<div class="seg">' + [['bulan', tr('Bulanan', 'Monthly')], ['minggu', 'Weekly Pipeline'], ['daftar', 'Platform Grid']].map((v) => '<button class="' + (this.view === v[0] ? 'on' : '') + '" data-act="view" data-v="' + v[0] + '">' + v[1] + '</button>').join('') + '</div></div>' +
      '<div class="chips nowrap"><button class="chip' + (!this.plat ? ' on' : '') + '" data-act="plat" data-v="">All <span class="n">' + wk.length + '</span></button>' + Object.keys(cnt).map((p) => '<button class="chip' + (this.plat === p ? ' on' : '') + '" data-act="plat" data-v="' + h(p) + '">' + h(p) + ' <span class="n">' + cnt[p] + '</span></button>').join('') + '</div>' +
      '<span class="pill mono p-sage"><span class="dot pulse"></span>GAS cron: 1 mnt · ' + h(App.set('PENGINGAT_MENIT', '60')) + "' reminder</span></section>" +
      '<section class="mt-16" id="cal-body">' + (this.rows ? '' : '<div class="cal-grid">' + UI.sk(7) + '</div>') + '</section>' +
      '<section class="grid mt-24" style="grid-template-columns:minmax(0,7fr) minmax(0,5fr);align-items:start" id="cal-low"><div class="card lg" id="cal-q"></div><div class="card lg" id="cal-bal"></div></section>';
    if (innerWidth < 1100) $('#cal-low', el).style.gridTemplateColumns = 'minmax(0,1fr)';
    if (!this.rows) return;
    if (this.view === 'bulan') this.paintBulan(); else if (this.view === 'daftar') this.paintDaftar(); else this.paintMinggu();
    this.paintQueue(); this.paintBalance();
  },
  card(r) {
    const jamTxt = h(r.Jam), st = r.Status === 'Terbit' ? 'Terbit' : (r.KontenStatus === 'Review' || r.KontenStatus === 'Revisi' ? r.KontenStatus : r.Status);
    const rasio = Engine_rasio(r.Jenis, r.Platform);
    return '<article class="post" draggable="' + (r.Status === 'Terbit' ? 'false' : 'true') + '" data-drag="' + h(r.ID) + '"><div class="row between gap-6"><span class="pill sm ' + (/Video|Story/.test(r.Jenis) ? 'p-blush' : 'p-lav') + '">' + ic(PLAT_ICON[r.Platform] || 'public', 'xs') + h(r.Platform) + '</span><span class="mono xs tert">' + jamTxt + '</span></div>' +
      (r.URLAset ? '<div class="thumb" style="background-image:url(\'' + h(r.URLAset) + '\')"><span class="pill sm mono" style="position:absolute;right:6px;bottom:6px;background:rgba(30,27,27,.8);color:#fff;height:18px">' + rasio + '</span></div>' : '') +
      '<div><span class="label" style="color:var(--sage-mid)">' + h(r.Pilar || jenisLabel(r.Jenis)) + '</span><h3 class="h4 clamp-2 mt-4" style="font-size:14.5px">' + h(r.Judul) + '</h3></div><div class="row between">' + stPill(st) + '<button class="icon-btn sm ghost" data-act="menu" data-id="' + h(r.ID) + '" aria-label="' + tr('Opsi', 'Options') + '">' + ic('more_vert', 'sm') + '</button></div></article>';
  },
  paintMinggu() {
    const a = this.anchor, rows = this.vis(), today = Fmt.today();
    $('#cal-body', this.el).innerHTML = '<div class="cal-grid">' + Array.from({ length: 7 }, (_, i) => {
      const d = Fmt.addDays(a, i), list = rows.filter((r) => r.Tanggal === d).sort((x, y) => x.Jam.localeCompare(y.Jam));
      return '<div class="cal-day' + (d === today ? ' today' : '') + '" data-day="' + d + '"><div class="row between gap-6"><div class="label">' + h(Fmt.hari(d, true)) + '</div><span class="pill sm mono ' + (list.length > 1 ? 'p-blush' : 'p-line') + '">' + list.length + '</span></div><div class="h3 nowrap" style="margin-top:-4px">' + h(Fmt.tgl(d, { year: undefined })) + '</div>' + list.map((r) => this.card(r)).join('') + (d >= today ? '<button class="btn btn-ghost btn-sm btn-block" data-act="add" data-tgl="' + d + '" style="box-shadow:none">' + ic('add', 'sm') + 'Add slot</button>' : '') + '</div>';
    }).join('') + '</div><p class="xs muted mt-8">' + tr('Tip: seret kartu ke hari lain untuk memindahkan jadwal.', 'Tip: drag a card to another day to reschedule.') + '</p>';
  },
  paintBulan() {
    const [y, m] = Fmt.addDays(this.anchor, 3).slice(0, 7).split('-').map(Number), first = y + '-' + ('0' + m).slice(-2) + '-01', start = Fmt.mondayOf(first), rows = this.vis(), today = Fmt.today();
    const hari = Array.from({ length: 7 }, (_, i) => Fmt.hari(Fmt.addDays(start, i)));
    $('#cal-body', this.el).innerHTML = '<div class="month-grid">' + hari.map((x) => '<div class="mh">' + h(x) + '</div>').join('') + Array.from({ length: 42 }, (_, i) => {
      const d = Fmt.addDays(start, i), list = rows.filter((r) => r.Tanggal === d);
      return '<div class="md' + (d.slice(5, 7) !== first.slice(5, 7) ? ' out' : '') + (d === today ? ' today' : '') + '" data-day="' + d + '"><span class="dn">' + Number(d.slice(8)) + '</span>' + list.slice(0, 3).map((r) => '<span class="mchip" data-act="menu" data-id="' + h(r.ID) + '" draggable="true" data-drag="' + h(r.ID) + '" title="' + h(r.Jam + ' ' + r.Platform + ' — ' + r.Judul) + '">' + h(r.Jam) + ' ' + h(r.Judul) + '</span>').join('') + (list.length > 3 ? '<span class="xs muted">+' + (list.length - 3) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  },
  paintDaftar() {
    const rows = this.vis().filter((r) => r.Tanggal >= Fmt.addDays(Fmt.today(), -14)).sort((a, b) => (a.Tanggal + a.Jam).localeCompare(b.Tanggal + b.Jam));
    $('#cal-body', this.el).innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + tr('Tanggal', 'Date') + '</th><th>Platform</th><th>' + tr('Konten', 'Content') + '</th><th class="hide-sm">Pilar</th><th>Status</th><th></th></tr></thead><tbody>' + (rows.length ? rows.map((r) => '<tr><td class="nowrap"><b>' + h(Fmt.tgl(r.Tanggal, { weekday: 'short' })) + '</b><div class="mono xs tert">' + h(r.Jam) + ' WIB</div></td><td>' + platPill(r.Platform) + '</td><td><div class="sb clamp-1">' + h(r.Judul) + '</div><div class="xs muted">' + h(jenisLabel(r.Jenis)) + '</div></td><td class="hide-sm small">' + h(r.Pilar || '') + '</td><td>' + stPill(r.Status) + '</td><td class="tr"><button class="icon-btn sm ghost" data-act="menu" data-id="' + h(r.ID) + '" aria-label="' + tr('Opsi', 'Options') + '">' + ic('more_vert', 'sm') + '</button></td></tr>').join('') : '<tr><td colspan="6">' + UI.empty('event_busy', tr('Belum ada jadwal', 'Nothing scheduled')) + '</td></tr>') + '</tbody></table></div>';
  },
  paintQueue() {
    const now = Date.now(), list = (this.rows || []).filter((r) => r.Status === 'Terjadwal' && Fmt.ms(r.Tanggal, r.Jam) > now - 3600e3 && Fmt.ms(r.Tanggal, r.Jam) < now + 48 * 3600e3).sort((a, b) => Fmt.ms(a.Tanggal, a.Jam) - Fmt.ms(b.Tanggal, b.Jam));
    $('#cal-q', this.el).innerHTML = '<div class="row between"><div class="row gap-10" style="gap:10px"><span class="dot pulse" style="width:12px;height:12px"></span><h2 class="h2">Upcoming 48-Hour Dispatch Queue</h2></div><span class="label">GAS hooks: verified</span></div><p class="muted mt-8">' + tr('Pipeline real-time: render aset, watermark, dan status baris Google Sheets.', 'Real-time pipeline triggering asset rendering, watermark application and Google Sheets row status dispatch.') + '</p><div class="col gap-12 mt-16">' +
      (list.length ? list.map((r, i) => { const jam = Math.max(0, Math.round((Fmt.ms(r.Tanggal, r.Jam) - now) / 3600e3)), siap = r.KontenStatus === 'Terjadwal' || r.KontenStatus === 'Disetujui';
        return '<div class="inset row wrap between gap-12"><div class="row gap-12 top"><div class="avatar" style="background:' + ['var(--blush)', 'var(--sage)', 'var(--lav)'][i % 3] + ';font:700 13px var(--f-mono)">' + jam + 'h</div><div><div class="row gap-8 wrap"><span class="label" style="color:var(--sage-mid)">' + h(Fmt.hari(r.Tanggal)) + ' ' + h(r.Jam) + ' WIB</span><span class="pill sm mono ' + (r.Watermark === 'YA' ? 'p-sage' : 'p-line') + '">' + (r.URLAset ? 'Watermark OK' : tr('Belum ada aset', 'No asset yet')) + '</span>' + (!siap ? '<span class="pill sm mono p-blush">' + tr('Perlu approval', 'Pending approval') + '</span>' : '') + '</div><h3 class="h4 mt-4">' + h(r.Judul) + '</h3><p class="xs muted">' + h(jenisLabel(r.Jenis)) + ' · ' + h(r.Platform) + '</p></div></div><div class="row gap-6">' + (siap ? '<button class="btn btn-sage btn-xs" data-act="terbit" data-id="' + h(r.ID) + '">' + tr('Tandai terbit', 'Mark published') + '</button>' : '<button class="btn btn-ink btn-xs" data-act="approve" data-id="' + h(r.KontenID) + '">' + tr('Kirim ke W-09', 'Send to W-09') + ' ➔</button>') + '<button class="icon-btn sm" data-act="copy" data-id="' + h(r.KontenID) + '" aria-label="Copy Studio">' + ic('edit', 'sm') + '</button></div></div>'; }).join('')
        : UI.empty('schedule', tr('Tidak ada yang tayang 48 jam ke depan', 'Nothing going live in the next 48 hours'), '', '<button class="btn btn-ghost btn-sm" data-act="add" data-tgl="' + Fmt.addDays(Fmt.today(), 1) + '">' + tr('Tambah jadwal', 'Add schedule') + '</button>')) + '</div>';
  },
  paintBalance() {
    const a = this.anchor, akhir = Fmt.addDays(a, 6), wk = (this.rows || []).filter((r) => r.Status !== 'Batal' && r.Tanggal >= a && r.Tanggal <= akhir);
    const pilar = App.pilar(), target = Number(App.set('TARGET_MINGGUAN', '5')) || 5, cadence = Math.min(100, Math.round((100 * wk.length) / target));
    const slot = {}; let clash = 0; wk.forEach((r) => { const k = r.Tanggal + r.Jam + r.Platform; if (slot[k]) clash++; slot[k] = 1; });
    const per = {}; wk.forEach((r) => { per[r.Pilar || '—'] = (per[r.Pilar || '—'] || 0) + 1; });
    $('#cal-bal', this.el).innerHTML = '<span class="pill mono p-sage">✦ Google Sheets [KALENDER] audit</span><h2 class="h2 mt-12">Pillar Balance &amp; Cadence Health</h2><p class="muted mt-4">' + tr('Alokasi strategis mingguan lintas pilar konten brand.', 'Weekly strategic allocation across your brand content pillars.') + '</p>' +
      '<div class="grid g2 mt-16" style="gap:10px"><div class="inset"><div class="row between"><span class="label">Cadence score</span>✦</div><div class="h1" style="color:var(--sage-mid)">' + cadence + '%</div><div class="xs muted">' + wk.length + '/' + target + tr(' target minggu ini', ' weekly target') + '</div></div><div class="inset"><div class="row between"><span class="label">Clash check</span>' + (clash ? '⚠️' : '✓') + '</div><div class="h1">' + clash + '</div><div class="xs muted">' + tr('Jadwal bentrok platform', 'Platform schedule overlap') + '</div></div></div>' +
      '<div class="col gap-12 mt-16">' + (pilar.length ? pilar.map((p, i) => { const act = wk.length ? Math.round((100 * (per[p.nama] || 0)) / wk.length) : 0, tg = Number(p.persen) || 0; return '<div><div class="row between small"><span class="sb">' + h(p.nama) + '</span><span class="mono xs" style="color:' + (Math.abs(act - tg) <= 7 ? 'var(--ok)' : 'var(--warn)') + '">' + act + '% / ' + tg + '% target</span></div><div class="bar mt-8" style="position:relative"><i style="width:' + act + '%;background:' + ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)'][i % 5] + '"></i><span style="position:absolute;top:-3px;bottom:-3px;left:' + tg + '%;width:2px;background:var(--ink);border-radius:2px" title="target"></span></div></div>'; }).join('') : '<p class="xs muted">' + tr('Atur pilar di Onboarding untuk melihat keseimbangan.', 'Set pillars in Onboarding to see the balance.') + '</p>') + '</div>' +
      '<div class="card blush tight row between mt-16" style="box-shadow:none"><span class="small sb">🌸 ' + tr('Siap review visual?', 'Ready for visual review?') + '</span><a class="btn-text" href="#/approval">' + tr('Lanjut ke W-09 Approval', 'Proceed to W-09 Approval') + ' ➔</a></div>';
  },
  row(id) { return (this.rows || []).find((r) => r.ID === id); },
  menu(b) {
    const r = this.row(b.dataset.id); if (!r) return;
    UI.pop(b, [
      { icon: 'open_in_new', label: tr('Buka konten', 'Open content'), fn: () => Router.go('generator', { id: r.KontenID }) },
      { icon: 'verified', label: tr('Pratinjau & approval', 'Preview & approval'), fn: () => Router.go('approval', { id: r.KontenID }) },
      { icon: 'palette', label: 'Graphic Studio', fn: () => Router.go('graphic', { id: r.KontenID }) },
      '-',
      { icon: 'event', label: tr('Ubah tanggal/jam…', 'Change date/time…'), fn: () => this.ubah(r) },
      { icon: 'task_alt', label: tr('Tandai terbit', 'Mark published'), fn: () => this.status(r.ID, 'Terbit') },
      { icon: 'pause_circle', label: tr('Tunda', 'Postpone'), fn: () => this.status(r.ID, 'Tertunda') },
      { icon: 'cancel', label: tr('Batalkan', 'Cancel'), fn: () => this.status(r.ID, 'Batal') },
      { icon: 'delete', label: tr('Hapus jadwal', 'Delete schedule'), danger: true, fn: () => this.hapus(r) }
    ]);
  },
  async pindah(id, tgl) {
    const r = this.row(id); if (!r || r.Tanggal === tgl) return;
    if (tgl < Fmt.today()) return UI.toast(tr('Tidak bisa memindah ke tanggal lampau.', 'Cannot move to a past date.'), 'warn');
    const lama = r.Tanggal; r.Tanggal = tgl; this.paint();                       // optimistic
    const x = await API.call('kalender.move', { id, Tanggal: tgl });
    if (!x.success) { r.Tanggal = lama; this.paint(); }
  },
  ubah(r) {
    const m = UI.modal({ title: tr('Ubah jadwal', 'Edit schedule'), size: 'sm', body: '<div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Tanggal', 'Date') + '</label><input class="inp" type="date" id="u-t" value="' + h(r.Tanggal) + '"></div><div class="field"><label>' + tr('Jam', 'Time') + '</label><input class="inp" type="time" id="u-j" value="' + h(r.Jam) + '"></div></div>', foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="u-ok">' + tr('Simpan', 'Save') + '</button>' });
    $('#u-ok', m.el.parentNode).onclick = async () => { const t = $('#u-t', m.el).value, j = $('#u-j', m.el).value; const x = await API.call('kalender.move', { id: r.ID, Tanggal: t, Jam: j }); if (x.success) { r.Tanggal = t; r.Jam = j; m.close(); this.paint(); } };
  },
  async status(id, st) {
    const r = this.row(id); if (!r) return;
    const lama = r.Status; r.Status = st; if (st === 'Terbit') r.KontenStatus = 'Terbit'; this.paint();
    const x = await API.call('kalender.status', { id, status: st });
    if (!x.success) { r.Status = lama; this.paint(); } else if (st === 'Terbit') UI.confetti();
  },
  async hapus(r) { if (!(await UI.confirm(tr('Hapus jadwal "' + h(r.Judul) + '"? Kontennya tetap ada.', 'Delete schedule for "' + h(r.Judul) + '"? The content stays.'), { danger: true }))) return; const x = await API.call('kalender.delete', { id: r.ID }); if (x.success) { this.rows = this.rows.filter((y) => y.ID !== r.ID); this.paint(); } },
  async kandidat() {
    const r = await API.read('konten.list', { limit: 300 }); if (!r.success) return [];
    const ada = {}; (this.rows || []).forEach((j) => { if (j.Status === 'Terjadwal') ada[j.KontenID] = 1; });
    return r.data.rows.filter((k) => ['Arsip', 'Terbit'].indexOf(k.Status) === -1).sort((a, b) => (ada[a.ID] ? 1 : 0) - (ada[b.ID] ? 1 : 0)).map((k) => Object.assign({ _ada: !!ada[k.ID] }, k));
  },
  async addSlot(tgl) {
    const ks = await this.kandidat();
    const m = UI.modal({ title: tr('Tambah slot ', 'Add slot ') + Fmt.tgl(tgl, { weekday: 'long' }), kicker: 'Calendar & Planner',
      body: ks.length ? '<div class="col gap-12"><div class="field"><label>' + tr('Konten', 'Content') + '</label><select class="sel" id="as-k">' + ks.map((k) => '<option value="' + h(k.ID) + '" data-p="' + h(k.Platform) + '">' + (k._ada ? '• ' : '') + h(k.Judul.slice(0, 70)) + ' — ' + h(stLabel(k.Status)) + '</option>').join('') + '</select><span class="xs muted">' + tr('Tanda • = sudah punya jadwal lain', '• = already scheduled elsewhere') + '</span></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Jam (WIB)', 'Time (WIB)') + '</label><input class="inp" type="time" id="as-j" value="09:00"></div><div class="field"><label>Platform</label><select class="sel" id="as-p">' + opts(PLATFORM, ks[0].Platform) + '</select></div></div></div>' : UI.empty('inventory_2', tr('Belum ada konten', 'No content yet'), '', '<a class="btn btn-ink btn-sm" href="#/generator">' + tr('Buat konten', 'Create content') + '</a>'),
      foot: ks.length ? '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="as-ok">' + ic('event_available', 'sm') + tr('Jadwalkan', 'Schedule') + '</button>' : '' });
    if (!ks.length) return;
    $('#as-k', m.el).onchange = (e) => { $('#as-p', m.el).value = e.target.selectedOptions[0].dataset.p || 'Instagram'; };
    $('#as-ok', m.el.parentNode).onclick = async (e) => {
      UI.busy(e.currentTarget, true);
      const x = await API.call('kalender.save', { KontenID: $('#as-k', m.el).value, Tanggal: tgl, Jam: $('#as-j', m.el).value, Platform: $('#as-p', m.el).value });
      UI.busy(e.currentTarget, false);
      if (x.success) { m.close(); this.range = null; this.load(); }
    };
  },
  async batch() {
    const ks = (await this.kandidat()).filter((k) => !k._ada);
    const m = UI.modal({ title: tr('Jadwalkan batch baru', 'Schedule a new batch'), kicker: tr('Pilih konten, sistem membagi per hari', 'Pick content, the system spreads it by day'), size: 'wide',
      body: '<div class="grid g4" style="gap:10px"><div class="field"><label>' + tr('Mulai', 'Start') + '</label><input class="inp" type="date" id="bt-s" value="' + Fmt.addDays(Fmt.today(), 1) + '"></div><div class="field"><label>' + tr('Jam', 'Time') + '</label><input class="inp" type="time" id="bt-j" value="09:00"></div><div class="field"><label>' + tr('Setiap (hari)', 'Every (days)') + '</label><input class="inp" type="number" id="bt-n" value="1" min="1" max="7"></div><div class="field"><label>' + tr('Lewati Minggu', 'Skip Sundays') + '</label><label class="sw mt-8"><input type="checkbox" id="bt-w"><i></i></label></div></div>' +
        '<div class="col gap-6 mt-16" style="max-height:340px;overflow:auto">' + (ks.length ? ks.map((k, i) => '<label class="tile row gap-10"><input type="checkbox" class="bt-k" value="' + h(k.ID) + '" data-p="' + h(k.Platform) + '"' + (i < 5 && ['Disetujui', 'Review', 'Draf'].indexOf(k.Status) > -1 ? ' checked' : '') + '><span class="grow small"><b>' + h(k.Judul) + '</b> <span class="muted">· ' + h(jenisLabel(k.Jenis)) + ' · ' + h(k.Platform) + '</span></span>' + stPill(k.Status) + '</label>').join('') : UI.empty('inventory_2', tr('Semua konten sudah terjadwal', 'Everything is already scheduled'))) + '</div><div id="bt-log" class="xs muted mt-8"></div>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Tutup', 'Close') + '</button><button class="btn btn-sage" id="bt-ok">' + ic('event_repeat', 'sm') + tr('Jadwalkan terpilih', 'Schedule selected') + '</button>' });
    $('#bt-ok', m.el.parentNode).onclick = async (e) => {
      const pil = $$('.bt-k:checked', m.el), btn = e.currentTarget; if (!pil.length) return;
      let t = $('#bt-s', m.el).value; const j = $('#bt-j', m.el).value, n = Number($('#bt-n', m.el).value) || 1, skip = $('#bt-w', m.el).checked;
      UI.busy(btn, true);
      for (let i = 0; i < pil.length; i++) {
        if (skip && Fmt.dow(t) === 0) t = Fmt.addDays(t, 1);
        $('#bt-log', m.el).textContent = tr('Menjadwalkan ', 'Scheduling ') + (i + 1) + '/' + pil.length + '…';
        await API.call('kalender.save', { KontenID: pil[i].value, Tanggal: t, Jam: j, Platform: pil[i].dataset.p }, { toast: false, silent: true, noBootRefresh: i < pil.length - 1 });
        t = Fmt.addDays(t, n);
      }
      UI.busy(btn, false); m.close(); UI.toast(pil.length + tr(' konten dijadwalkan ✦', ' posts scheduled ✦'), 'ok'); this.range = null; this.load();
    };
  },
  async gcal(btn) { UI.busy(btn, true, tr('Sinkron…', 'Syncing…')); await API.call('kalender.gcal', { dari: Fmt.today(), sampai: Fmt.addDays(Fmt.today(), 60) }); UI.busy(btn, false); this.range = null; this.load(); },
  async pilihBulan() {
    const v = await UI.prompt(tr('Lompat ke bulan (yyyy-mm)', 'Jump to month (yyyy-mm)'), { value: Fmt.addDays(this.anchor, 3).slice(0, 7) });
    if (!v || !/^\d{4}-\d{2}$/.test(v)) return;
    let a = Fmt.mondayOf(v + '-01'); if (Fmt.addDays(a, 3).slice(0, 7) !== v) a = Fmt.addDays(a, 7); this.anchor = a; this.view = 'bulan'; Store.set('cal-view', 'bulan'); this.load();
  }
});
function Engine_rasio(j, p) { return typeof Engine !== 'undefined' ? Engine.rasioDari(j, p) : '4:5'; }
