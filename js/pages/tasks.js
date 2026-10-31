/* Modul 11 — Tugas Harian Anti-Mager: prioritas, streak, 7 hari, tugas otomatis, timer fokus */
'use strict';
Pages.def('tasks', {
  PRIO: { P1: ['p-ink', 'Wajib hari ini', 'Must do today'], P2: ['p-sage', 'Penting', 'Important'], P3: ['p-butter', 'Kalau sempat', 'If time allows'], P4: ['p-line', 'Investasi diri', 'Self-investment'] },
  GO: { approval: 'approval', copy: 'copy', graphic: 'graphic', calendar: 'calendar', reports: 'reports', generator: 'generator', learning: 'learning', strategy: 'strategy' },
  marquee() { return ['Module 11 // Anti-Mager Daily Workflow', 'Auto tasks from your content pipeline', 'Synced with Google Sheets [TUGAS_HARIAN]', 'Small steps · every day ✦']; },
  render(el, params) {
    this.el = el; this.tgl = params.tanggal || Fmt.today(); this.filter = 'semua'; this.d = null;
    bindActs(el, {
      toggle: (b) => this.toggle(b.dataset.id), tgl: (b) => { this.tgl = b.dataset.d === '0' ? Fmt.today() : Fmt.addDays(this.tgl, +b.dataset.d); this.muat(); },
      filter: (b) => { this.filter = b.dataset.v; this.paintList(); }, add: (b) => this.tambah(b), gen: (b) => this.gen(b), menu: (b, e) => { e.stopPropagation(); this.menu(b); },
      go: (b) => Router.go(b.dataset.page, b.dataset.id ? { id: b.dataset.id } : {}), fokus: (b) => this.fokusMulai(b.dataset.id), fdur: (b) => this.fokusDur(+b.dataset.v), fplay: () => this.fokusPlay(), freset: () => this.fokusReset(), fdone: () => this.fokusSelesai()
    });
    el.innerHTML = App.hero({ word: 'W-11', pills: '<span class="pill mono p-butter">Anti-mager mode</span><span class="pill mono p-line" id="tk-date"></span>',
      title: tr('langkah kecil. <span class="it">tiap hari.</span>', 'small steps. <span class="it">every day.</span>'),
      sub: tr('Sistem menyusun tugas prioritas dari pipeline konten Anda — draf yang menunggu review, desain sebelum tayang, metrik yang belum dicatat — supaya Anda tahu persis apa yang dikerjakan hari ini.', 'The system builds priority tasks from your content pipeline — drafts awaiting review, designs before go-live, metrics not yet logged — so you know exactly what to do today.'),
      side: '<div class="card butter tight tc" style="min-width:160px"><div class="label">' + tr('Streak', 'Streak') + '</div><div class="kpi"><div class="v" id="tk-streak">–</div></div><div class="xs muted">' + tr('hari berturut-turut', 'days in a row') + '</div></div>',
      actions: '<button class="btn btn-ink shine" data-act="gen">' + ic('auto_awesome', 'sm') + tr('Susun tugas otomatis', 'Build auto tasks') + '</button><div class="seg"><button data-act="tgl" data-d="-1" aria-label="prev">' + ic('chevron_left', 'sm') + '</button><button class="on" data-act="tgl" data-d="0" id="tk-tglb"></button><button data-act="tgl" data-d="1" aria-label="next">' + ic('chevron_right', 'sm') + '</button></div>' }) +
      '<div class="grid g4 mt-24" id="tk-kpi">' + UI.sk(4) + '</div>' +
      '<div class="grid mt-24" id="tk-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:start"><section class="card lg col gap-16" style="gap:16px">' +
        '<form class="row wrap gap-8 inset" id="tk-add" style="gap:8px"><input class="inp sm grow" name="Judul" style="min-width:200px" placeholder="' + tr('Tambah tugas… (mis. Rekam 3 hook Reels)', 'Add a task… (e.g. Record 3 Reels hooks)') + '"><select class="sel sm" name="Prioritas" style="width:84px">' + opts(['P1', 'P2', 'P3', 'P4'], 'P2') + '</select><input class="inp sm" type="number" name="Estimasi" value="15" min="1" max="480" style="width:84px" aria-label="' + tr('Estimasi menit', 'Estimate minutes') + '"><button class="btn btn-ink btn-sm" data-act="add">' + ic('add', 'sm') + tr('Tambah', 'Add') + '</button></form>' +
        '<div class="row between wrap gap-8"><h2 class="h2">' + tr('Antrean prioritas', 'Priority queue') + '</h2><div class="seg" id="tk-filter"></div></div><div id="tk-list" class="col gap-16" style="gap:16px">' + UI.sk(3, 'sk-line') + '</div></section>' +
      '<aside class="col gap-16" style="gap:16px"><section class="card lg ink col gap-12" id="tk-focus"></section><section class="card col gap-10"><div class="label">' + tr('Ritme anti-mager', 'Anti-mager rhythm') + '</div>' +
        [['bolt', tr('Mulai dari P1 terkecil — 5 menit pertama paling berat.', 'Start with the smallest P1 — the first 5 minutes are the hardest.')], ['timer', tr('Satu sesi fokus = satu tugas. Tutup tab lain.', 'One focus session = one task. Close other tabs.')], ['celebration', tr('Centang = dopamin. Rayakan tiap langkah kecil.', 'A tick = dopamine. Celebrate small wins.')], ['bedtime', tr('Belum selesai? Pindahkan ke besok, jangan dihapus.', 'Not done? Move it to tomorrow, don’t delete it.')]].map((x) => '<div class="row gap-10 small top"><span class="ico-dot sm line">' + ic(x[0], 'sm') + '</span><span>' + x[1] + '</span></div>').join('') + '</section></aside></div>';
    if (innerWidth < 1000) $('#tk-grid', el).style.gridTemplateColumns = 'minmax(0,1fr)';
    $('#tk-add', el).addEventListener('submit', (e) => { e.preventDefault(); this.tambah($('[data-act="add"]', el)); });
    if (params.tambah) setTimeout(() => $('#tk-add [name=Judul]', el).focus(), 200);
    this.paintFocus(); App.every(() => this.tick(), 1000);
    this.muat();
  },
  onBoot() { this.muat(true); },
  muat(segar) {
    $('#tk-date', this.el).textContent = Fmt.tgl(this.tgl, { weekday: 'long' });
    $('#tk-tglb', this.el).textContent = this.tgl === Fmt.today() ? tr('Hari ini', 'Today') : Fmt.tgl(this.tgl, { year: undefined });
    const done = (d) => { if (d.tanggal !== this.tgl) return; this.d = d; this.paint(); };
    if (segar) API.read('tugas.list', { tanggal: this.tgl }).then((r) => { if (r.success) done(r.data); });
    else API.swr('tugas.list', { tanggal: this.tgl }, { maxAge: 15000, onData: done });
  },
  paint() { this.paintKpi(); this.paintList(); this.paintFocus(); },
  paintKpi() {
    const d = this.d, rows = d.rows, sel = rows.filter((t) => t.Status === 'Selesai').length, pct = rows.length ? Math.round(100 * sel / rows.length) : 0;
    const sisa = rows.filter((t) => t.Status !== 'Selesai').reduce((s, t) => s + Number(t.Estimasi || 0), 0), auto = rows.filter((t) => t.Otomatis === 'YA').length;
    $('#tk-streak', this.el).innerHTML = d.streak + '<small>🔥</small>';
    $('#tk-kpi', this.el).innerHTML =
      '<div class="card sage row gap-16"><div>' + Chart.ring(pct, { size: 76 }) + '</div><div><div class="label">' + tr('Progres hari ini', "Today's progress") + '</div><div class="h2 mt-4">' + sel + ' / ' + rows.length + '</div><div class="xs muted">' + tr('tugas selesai', 'tasks done') + '</div></div></div>' +
      '<div class="card kpi"><div class="label">' + tr('Sisa estimasi', 'Time left') + '</div><div class="v mt-8">' + sisa + '<small>' + tr('mnt', 'min') + '</small></div><div class="xs muted mt-4">' + (sisa ? tr('≈ ', '≈ ') + Math.ceil(sisa / 25) + tr(' sesi fokus', ' focus sessions') : tr('Semua beres ✦', 'All clear ✦')) + '</div></div>' +
      '<div class="card kpi"><div class="label">' + tr('Tugas otomatis', 'Auto tasks') + '</div><div class="v mt-8">' + auto + '</div><div class="xs muted mt-4">' + tr('dari pipeline konten', 'from the content pipeline') + '</div></div>' +
      '<div class="card"><div class="label">' + tr('7 hari terakhir', 'Last 7 days') + '</div><div class="mt-8">' + Chart.cols(d.minggu.map((m) => ({ l: Fmt.hari(m.t), v: m.selesai, c: m.t === this.tgl ? 'var(--rose)' : 'var(--sage-ink)' })), { h: 56 }) + '</div><div class="xs muted">' + tr('tugas selesai per hari', 'tasks done per day') + '</div></div>';
  },
  paintList() {
    if (!this.d) return;
    const all = this.d.rows, n = { semua: all.length, belum: all.filter((t) => t.Status !== 'Selesai').length, selesai: all.filter((t) => t.Status === 'Selesai').length };
    $('#tk-filter', this.el).innerHTML = [['semua', tr('Semua', 'All')], ['belum', tr('Belum', 'Open')], ['selesai', tr('Selesai', 'Done')]].map((f) => '<button class="' + (this.filter === f[0] ? 'on' : '') + '" data-act="filter" data-v="' + f[0] + '">' + f[1] + ' <span class="mono xs tert">' + n[f[0]] + '</span></button>').join('');
    const rows = all.filter((t) => this.filter === 'semua' || (this.filter === 'selesai') === (t.Status === 'Selesai'));
    const box = $('#tk-list', this.el);
    if (!rows.length) { box.innerHTML = UI.empty('task_alt', all.length ? tr('Tidak ada di filter ini', 'Nothing in this filter') : tr('Belum ada tugas untuk hari ini', 'No tasks for this day yet'), all.length ? '' : tr('Klik “Susun tugas otomatis” untuk membuat antrean dari pipeline konten.', 'Click “Build auto tasks” to create a queue from your content pipeline.')); return; }
    box.innerHTML = ['P1', 'P2', 'P3', 'P4'].map((p) => { const g = rows.filter((t) => t.Prioritas === p); if (!g.length) return ''; return '<div class="col gap-8"><div class="row gap-8"><span class="pill sm mono ' + this.PRIO[p][0] + '">' + p + '</span><span class="label">' + h(tr(this.PRIO[p][1], this.PRIO[p][2])) + '</span><span class="mono xs tert">' + g.filter((t) => t.Status !== 'Selesai').length + '/' + g.length + '</span></div>' + g.map((t) => this.row(t)).join('') + '</div>'; }).join('');
  },
  row(t) {
    const done = t.Status === 'Selesai', go = this.GO[t.Modul], f = Store.get('focus', null), aktif = f && f.taskId === t.ID;
    return '<div class="task ' + (done ? 'done' : '') + '"' + (aktif ? ' style="border-color:var(--rose)"' : '') + '><label class="check" style="margin-top:2px"><input type="checkbox" data-act="toggle" data-id="' + h(t.ID) + '"' + (done ? ' checked' : '') + ' aria-label="' + tr('Selesai', 'Done') + '"></label><div class="grow" style="min-width:0"><div class="row gap-6 wrap"><span class="pill sm mono p-line">' + ic('schedule', 'xs') + h(t.Estimasi) + ' ' + tr('mnt', 'min') + '</span>' + (t.Otomatis === 'YA' ? '<span class="pill sm p-lav">✦ auto</span>' : '') + (t.Tanggal < this.tgl && !done ? '<span class="pill sm p-warn">' + tr('tertunda sejak ', 'overdue since ') + h(Fmt.tgl(t.Tanggal, { year: undefined })) + '</span>' : '') + (aktif ? '<span class="pill sm p-blush">⏱ ' + tr('sedang fokus', 'in focus') + '</span>' : '') + '</div><div class="sb mt-8 t-title">' + h(t.Judul) + '</div>' + (t.Catatan ? '<div class="xs muted mt-4">' + h(t.Catatan) + '</div>' : '') + '</div>' +
      '<div class="row gap-4" style="flex:none">' + (go && !done ? '<button class="btn btn-ghost btn-xs" data-act="go" data-page="' + go + '"' + (t.RefID && /^KTN|^LRN/.test(t.RefID) ? ' data-id="' + h(t.RefID) + '"' : '') + '>' + tr('Buka', 'Open') + '</button>' : '') + (!done ? '<button class="icon-btn sm" data-act="fokus" data-id="' + h(t.ID) + '" aria-label="' + tr('Mulai fokus', 'Start focus') + '" title="' + tr('Mulai fokus', 'Start focus') + '">' + ic('timer', 'sm') + '</button>' : '') + '<button class="icon-btn sm ghost" data-act="menu" data-id="' + h(t.ID) + '" aria-label="' + tr('Opsi', 'Options') + '">' + ic('more_vert', 'sm') + '</button></div></div>';
  },
  find(id) { return this.d && this.d.rows.find((t) => t.ID === id); },
  async toggle(id) {
    const t = this.find(id); if (!t) return;
    const lama = t.Status; t.Status = lama === 'Selesai' ? 'Belum' : 'Selesai';
    this.syncBoot(t); this.paint();
    if (t.Status === 'Selesai') { UI.confetti(); const f = Store.get('focus', null); if (f && f.taskId === id) this.fokusReset(); }
    const r = await API.call('tugas.toggle', { id, selesai: t.Status === 'Selesai' }, { toast: false });
    if (!r.success) { t.Status = lama; this.syncBoot(t); this.paint(); }
    else if (t.Status === 'Selesai' && this.d.rows.every((x) => x.Status === 'Selesai')) UI.toast(tr('Semua tugas hari ini selesai. Luar biasa! 🍒', 'All tasks done today. Amazing! 🍒'), 'ok');
  },
  syncBoot(t) { const b = App.boot && (App.boot.tugas || []).find((x) => x.ID === t.ID); if (b) { Object.assign(b, t); App.paintShellState(); } },
  async tambah(btn) {
    const f = $('#tk-add', this.el), v = formVals(f); if (!String(v.Judul || '').trim()) { $('[name=Judul]', f).focus(); return; }
    UI.busy(btn, true);
    const r = await API.call('tugas.save', Object.assign(v, { Tanggal: this.tgl }), { toast: false });
    UI.busy(btn, false);
    if (r.success) { f.reset(); $('[name=Estimasi]', f).value = 15; this.d.rows.push(r.data); this.paint(); UI.toast(tr('Tugas ditambahkan.', 'Task added.'), 'ok'); $('[name=Judul]', f).focus(); }
  },
  async gen(btn) {
    UI.busy(btn, true, tr('Membaca pipeline…', 'Reading pipeline…'));
    const r = await API.call('tugas.generate', { tanggal: this.tgl });
    UI.busy(btn, false);
    if (r.success) this.muat(true);
  },
  menu(b) {
    const t = this.find(b.dataset.id); if (!t) return;
    UI.pop(b, [{ icon: 'edit', label: 'Edit', fn: () => this.edit(t) }, { icon: 'event_upcoming', label: tr('Pindah ke besok', 'Move to tomorrow'), fn: () => this.simpan(t, { Tanggal: Fmt.addDays(Fmt.today(), 1) }) },
      { icon: 'flag', label: tr('Naikkan prioritas', 'Raise priority'), fn: () => this.simpan(t, { Prioritas: 'P' + Math.max(1, Number(String(t.Prioritas).slice(1)) - 1) }) }, '-', { icon: 'delete', label: tr('Hapus', 'Delete'), danger: true, fn: () => this.hapus(t) }]);
  },
  async simpan(t, ubah) {
    const r = await API.call('tugas.save', Object.assign({}, t, ubah), { toast: false });
    if (r.success) { UI.toast(tr('Tugas diperbarui.', 'Task updated.'), 'ok'); this.muat(true); }
  },
  edit(t) {
    const m = UI.modal({ title: tr('Edit tugas', 'Edit task'), kicker: 'Anti-Mager', size: 'sm',
      body: '<form class="col gap-12" id="tke"><div class="field"><label>' + tr('Tugas', 'Task') + '</label><input class="inp" name="Judul" value="' + h(t.Judul) + '"></div><div class="grid g3" style="gap:10px"><div class="field"><label>' + tr('Prioritas', 'Priority') + '</label><select class="sel" name="Prioritas">' + opts(['P1', 'P2', 'P3', 'P4'], t.Prioritas) + '</select></div><div class="field"><label>' + tr('Menit', 'Minutes') + '</label><input class="inp" type="number" name="Estimasi" value="' + h(t.Estimasi) + '"></div><div class="field"><label>' + tr('Tanggal', 'Date') + '</label><input class="inp" type="date" name="Tanggal" value="' + h(t.Tanggal) + '"></div></div><div class="field"><label>' + tr('Catatan', 'Notes') + '</label><textarea class="ta" name="Catatan" rows="2">' + h(t.Catatan) + '</textarea></div></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="tke-ok">' + tr('Simpan', 'Save') + '</button>' });
    $('#tke-ok', m.el.parentNode).onclick = async (e) => { UI.busy(e.currentTarget, true); await this.simpan(t, formVals($('#tke', m.el))); m.close(); };
  },
  async hapus(t) {
    if (!(await UI.confirm(tr('Hapus tugas ini?', 'Delete this task?'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    this.d.rows = this.d.rows.filter((x) => x.ID !== t.ID); this.paint();
    const r = await API.call('tugas.delete', { id: t.ID }, { toast: false }); if (!r.success) this.muat(true);
  },
  /* ---------- timer fokus (bertahan saat pindah halaman / refresh) ---------- */
  fs() { return Store.get('focus', null) || { dur: Store.get('focus-dur', 15) * 60, remain: Store.get('focus-dur', 15) * 60, end: 0, taskId: '' }; },
  sisa(f) { return f.end ? Math.max(0, Math.round((f.end - Date.now()) / 1000)) : f.remain; },
  fokusDur(m) { const f = this.fs(); if (f.end) return UI.toast(tr('Jeda timer dulu untuk mengganti durasi.', 'Pause the timer to change duration.'), 'warn'); Store.set('focus-dur', m); Store.set('focus', Object.assign(f, { dur: m * 60, remain: m * 60 })); this.paintFocus(); },
  fokusMulai(id) { const f = this.fs(); f.taskId = id; if (!f.end) { f.end = Date.now() + this.sisa(f) * 1000; } Store.set('focus', f); this.paintFocus(); this.paintList(); window.scrollTo({ top: $('#tk-focus', this.el).getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); },
  fokusPlay() { const f = this.fs(); if (f.end) { f.remain = this.sisa(f); f.end = 0; } else f.end = Date.now() + (this.sisa(f) || f.dur) * 1000; Store.set('focus', f); this.paintFocus(); },
  fokusReset() { const m = Store.get('focus-dur', 15); Store.del('focus'); this.paintFocus(); this.paintList(); return m; },
  fokusSelesai() { const f = this.fs(); const id = f.taskId; this.fokusReset(); if (id && this.find(id) && this.find(id).Status !== 'Selesai') this.toggle(id); },
  tick() {
    const f = Store.get('focus', null); if (!f || !f.end) return;
    const s = this.sisa(f), el = $('#tk-clock', this.el); if (el) el.textContent = dtkFmt(s);
    const bar = $('#tk-fbar', this.el); if (bar) bar.style.width = (100 - (100 * s) / f.dur) + '%';
    if (s <= 0) { f.end = 0; f.remain = 0; Store.set('focus', f); this.paintFocus(); UI.toast(tr('Sesi fokus selesai! Tandai tugasnya?', 'Focus session done! Mark the task?'), 'ok'); try { navigator.vibrate && navigator.vibrate(200); } catch (e) { /* abaikan */ } }
  },
  paintFocus() {
    const box = $('#tk-focus', this.el); if (!box) return;
    const f = this.fs(), s = this.sisa(f), jalan = !!f.end, t = f.taskId && this.find(f.taskId), m = Math.round(f.dur / 60);
    box.innerHTML = '<div class="row between"><span class="label" style="color:#cfc8bd">' + tr('Sesi fokus', 'Focus session') + '</span><div class="seg dark" style="background:rgba(255,255,255,.08)">' + [15, 25, 45].map((x) => '<button class="' + (m === x ? 'on' : '') + '" data-act="fdur" data-v="' + x + '" style="color:#fff">' + x + "'</button>").join('') + '</div></div>' +
      '<div class="pomodoro tc mt-8" id="tk-clock" style="color:#fff">' + dtkFmt(s) + '</div><div class="bar" style="background:rgba(255,255,255,.12)"><i id="tk-fbar" style="width:' + (100 - (100 * s) / f.dur) + '%;background:var(--rose)"></i></div>' +
      '<div class="small tc" style="color:#e8e2d8;min-height:38px">' + (t ? '⏱ ' + h(t.Judul) : tr('Pilih tugas (ikon ⏱) lalu mulai. Satu sesi, satu tugas.', 'Pick a task (⏱ icon) and start. One session, one task.')) + '</div>' +
      '<div class="row gap-8"><button class="btn btn-blush grow" data-act="fplay">' + ic(jalan ? 'pause' : 'play_arrow', 'sm') + (jalan ? tr('Jeda', 'Pause') : s < f.dur && s > 0 ? tr('Lanjut', 'Resume') : tr('Mulai', 'Start')) + '</button><button class="icon-btn" data-act="freset" aria-label="Reset" style="background:rgba(255,255,255,.1);color:#fff">' + ic('restart_alt', 'sm') + '</button>' + (t ? '<button class="icon-btn" data-act="fdone" aria-label="' + tr('Selesai', 'Done') + '" style="background:var(--sage-ink);color:#fff">' + ic('check', 'sm') + '</button>' : '') + '</div>';
  }
});
function dtkFmt(s) { s = Math.max(0, Math.round(s)); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2); }
