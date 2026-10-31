/* Modul 1 — Dashboard Utama: ringkasan brand aktif, tugas hari ini, jadwal terdekat, ekosistem 16 modul */
'use strict';
Pages.def('dashboard', {
  marquee() { return String(App.set('MARQUEE_TEKS', 'MAKING CONTENT CREATION SIMPLE ✦ AI STRATEGY & ENGINE ACTIVE ✦ BATCH AUTOMATION RUNNING ✦ MULTI-BRANDING KITS CONNECTED')).split('✦').map((s) => s.trim()).filter(Boolean); },
  render(el) {
    this.el = el;
    bindActs(el, {
      toggle: (b) => this.toggle(b.dataset.id),
      quick: () => this.quickTask(),
      produk: () => this.quickProduk(),
      go: (b) => Router.go(b.dataset.page, b.dataset.id ? { id: b.dataset.id } : null)
    });
    el.addEventListener('change', (e) => { if (e.target.id === 'dash-filter') this.paint(); });
    this.paint();
    if (!App.boot) App.refreshBoot();
  },
  onBoot() { this.paint(); },
  onKit() { this.paint(); },
  paint() {
    const el = this.el, b = App.boot;
    if (!b) { el.innerHTML = '<div class="grid g4">' + UI.sk(4) + '</div>'; return; }
    const st = b.stats || {}, kit = App.kit(), ai = b.ai || {}, me = b.me || {};
    const kits = App.kits(), produk = App.produk();
    const delta = st.kontenBulanLalu ? Math.round(((st.kontenBulanIni - st.kontenBulanLalu) / st.kontenBulanLalu) * 100) : (st.kontenBulanIni ? 100 : 0);
    const sisaAi = ai.kuota ? Math.max(0, Math.round(100 - (100 * (ai.terpakai || 0)) / ai.kuota)) : 100;
    const hit = (ai.cacheHit || 0) + (ai.cacheMiss || 0) ? Math.round((100 * ai.cacheHit) / (ai.cacheHit + ai.cacheMiss)) : 0;
    const jadwal = (b.jadwal || []).filter((j) => j.Status === 'Terjadwal' && Fmt.ms(j.Tanggal, j.Jam) >= Date.now() - 1800e3);
    const next = jadwal[0];
    const perPlat = Object.entries(st.perPlatform || {}).sort((a, c) => c[1] - a[1]).slice(0, 3);
    const tugas = (b.tugas || []).slice().sort((a, c) => (a.Status === 'Selesai') - (c.Status === 'Selesai') || String(a.Prioritas).localeCompare(String(c.Prioritas)));
    const filt = ($('#dash-filter', el) || {}).value || '';
    const terbaru = (b.terbaru || []).filter((k) => !filt || k.Jenis === filt);
    const hariIni = Fmt.tgl(b.hariIni || Fmt.today(), { weekday: 'long' });
    el.innerHTML =
      App.hero({ word: 'W-01', pills: '<span class="pill mono p-sage"><span class="dot pulse"></span>Workspace Live</span><span class="pill mono p-line">Mod // 01.Desk</span><span class="pill p-blush">🍒 Kit: ' + h(kit ? kit.Nama : '-') + (kit && kit.Default === 'YA' ? ' (Default)' : '') + ' · ' + produk.length + tr(' produk tertaut', ' products linked') + '</span>',
        title: tr('the hub for <span class="it">social media creators</span> &amp; performance.', 'the hub for <span class="it">social media creators</span> &amp; performance.'),
        sub: tr('Halo ' + h(me.Nama || 'Studio Director') + ' — ' + h(hariIni) + '. Orkestrasi multi-produk, sinkron Google Sheets, dan antrean produksi instan untuk kreator solo yang ingin konsisten tanpa burnout.', 'Hi ' + h(me.Nama || 'Studio Director') + ' — ' + h(hariIni) + '. Multi-product orchestration, Google Sheets sync and instant production queues for solo creators who want consistency without burnout.'),
        actions: '<button class="btn btn-ink shine" data-act="go" data-page="generator"><span class="ico-in">' + ic('add', 'sm') + '</span>' + tr('Buat Konten Baru', 'Generate New Content') + ' ✦</button><button class="btn btn-soft" data-act="go" data-page="strategy">' + ic('bolt') + tr('Jalankan Strategy AI', 'Run Strategy AI') + '</button><button class="btn btn-ghost" data-act="go" data-page="calendar">' + ic('calendar_month') + tr('Lihat Kalender', 'View Calendar') + '</button>',
        strip: '<span class="pill mono p-sage">' + ic('sync', 'xs') + 'Autonomous Sync</span><span>Sheets: 22 tabs · Drive ' + h(kit ? kit.Nama : '') + '</span><span>|</span><span>' + tr('Antrean konten', 'Content queue') + ': ' + (st.review || 0) + ' review · ' + (st.terjadwal || 0) + tr(' terjadwal', ' scheduled') + '</span><span class="grow"></span><span class="pill mono p-line">' + tr('Latensi', 'Latency') + ': ' + (Perf.last && Perf.last.t ? Perf.last.t + 'ms' : '—') + '</span>' }) +
      (me.Onboarding !== 'SELESAI' ? '<div class="card blush mt-24 row wrap between gap-16"><div class="row gap-12"><span class="ico-dot">' + ic('badge') + '</span><div><div class="h3">' + tr('Lengkapi Brand DNA Anda dulu', 'Complete your Brand DNA first') + '</div><p class="muted small">' + tr('3 langkah singkat: identitas visual & nada, audiens & masalahnya, produk digital. AI akan menulis dengan suara brand Anda.', '3 quick steps: visual identity & voice, audience & pain points, digital products. AI will then write in your brand voice.') + '</p></div></div><button class="btn btn-ink" data-act="go" data-page="onboarding">' + tr('Mulai Onboarding', 'Start Onboarding') + ' ' + ic('arrow_forward', 'sm') + '</button></div>' : '') +
      '<div class="grid g4 mt-24 stagger">' +
        '<div class="card blush kpi hover"><div class="row between top"><span class="label">' + tr('Total konten diproduksi', 'Total content produced') + '</span><span class="ico-dot sm" style="background:#fff">' + ic('photo_library', 'sm') + '</span></div><div class="v mt-12 num">' + Fmt.n(st.totalKonten || 0) + '<small>' + tr('aset', 'assets') + '</small></div><div class="row gap-8 mt-8"><span class="delta" style="color:' + (delta >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + ic(delta >= 0 ? 'arrow_upward' : 'arrow_downward', 'xs') + Math.abs(delta) + '%</span><span class="xs muted">' + tr('vs bulan lalu', 'vs previous month') + '</span></div><div class="mini mt-12"><div class="row between xs mono tert"><span>14 ' + tr('hari', 'days') + '</span><span>' + tr('hari ini', 'today') + ' ✦</span></div>' + Chart.spark((st.harian || []).map((x) => x.n), { h: 42, label: tr('Konten per hari', 'Content per day') }) + '</div></div>' +
        '<div class="card butter kpi hover"><div class="row between top"><span class="label">' + tr('Branding kit aktif', 'Active branding kits') + '</span><span class="ico-dot sm" style="background:#fff">' + ic('palette', 'sm') + '</span></div><div class="v mt-12">' + kits.length + '<small>' + tr('kit live', 'kits live') + '</small></div><p class="small mt-8">Default: <b class="ul-blush">' + h((kits.find((k) => k.Default === 'YA') || {}).Nama || '-') + '</b> 🌸</p><div class="mini mt-12 col gap-4">' + kits.slice(0, 3).map((k) => '<div class="row between xs"><span class="row gap-6"><span class="kit-dot" style="background:' + h(k.WarnaPrimer) + '"></span>' + h(k.Nama) + '</span><span class="mono tert">' + ((b.perKit || {})[k.ID] || 0) + ' ' + tr('aset', 'assets') + '</span></div>').join('') + '</div></div>' +
        '<div class="card sage kpi hover"><div class="row between top"><span class="label">' + tr('Antrean terjadwal', 'Scheduled queue') + '</span><span class="ico-dot sm" style="background:#fff;color:var(--sage-ink)">' + ic('schedule_send', 'sm') + '</span></div><div class="v mt-12">' + (st.terjadwal || 0) + '<small>' + tr('siap tayang', 'posts ready') + '</small></div><p class="small mt-8 row gap-6"><span class="dot"></span>' + (next ? tr('Berikutnya ', 'Next ') + h(Fmt.rel(new Date(Fmt.ms(next.Tanggal, next.Jam)).toISOString())) + ' · ' + h(next.Platform) : tr('Belum ada jadwal', 'Nothing scheduled')) + '</p><div class="mini mt-12 row gap-8"><span class="xs tert">' + tr('Kanal', 'Channels') + ':</span>' + (perPlat.length ? perPlat.map((p) => '<span class="pill sm p-line">' + h(p[0].slice(0, 2).toUpperCase()) + ': ' + p[1] + '</span>').join('') : '<span class="xs muted">—</span>') + '</div></div>' +
        '<div class="card lav kpi hover"><div class="row between top"><span class="label">' + tr('Kuota AI & cache', 'AI quota & cache') + '</span><span class="ico-dot sm" style="background:#fff;color:var(--lav-ink)">' + ic('memory', 'sm') + '</span></div><div class="v mt-12">' + sisaAi + '%<small>' + tr('tersisa', 'remaining') + '</small></div><p class="small mt-8" style="color:var(--sage-ink)">' + tr('Engine', 'Engine') + ': ' + h(ai.provider === 'template' || !ai.provider ? tr('Mode Template', 'Template Mode') : ai.label) + ' ⚡ · cache ' + hit + '%</p><div class="mini mt-12"><div class="row between xs"><span class="tert">' + tr('Pemakaian harian', 'Daily runs') + '</span><span class="mono">' + (ai.terpakai || 0) + ' / ' + (ai.kuota || 150) + '</span></div><div class="bar thin lav mt-8"><i style="width:' + clamp(100 - sisaAi, 0, 100) + '%"></i></div></div></div>' +
      '</div>' +
      '<div class="grid mt-24" style="grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:start" id="dash-grid">' +
        '<div class="col gap-20" style="gap:20px">' +
          '<section class="card"><div class="card-h"><div class="row gap-12"><span class="ico-dot">' + ic('checklist') + '</span><div><div class="h2">' + tr('Tugas Anti-Mager Hari Ini', "Today's Anti-Mager Tasks") + '</div><div class="label mt-4">' + tr('Antrean prioritas', 'Priority execution queue') + ' (' + ('0' + tugas.filter((t) => t.Status !== 'Selesai').length).slice(-2) + ' item)</div></div></div><button class="btn btn-soft btn-sm" data-act="quick">' + ic('add', 'sm') + tr('Tambah Cepat', 'Quick Add') + '</button></div>' +
            (tugas.length ? '<div class="col gap-10" style="gap:10px">' + tugas.slice(0, 6).map((t) => this.taskRow(t)).join('') + '</div><div class="row end mt-12"><a class="link-mono" href="#/tasks">[ ' + tr('Buka semua tugas', 'Open all tasks') + ' ]</a></div>' : UI.empty('task_alt', tr('Hari ini bebas tugas', 'No tasks today'), tr('Tugas otomatis dibuat setiap pagi dari pipeline konten Anda.', 'Tasks are generated every morning from your content pipeline.'), '<button class="btn btn-ghost btn-sm" data-act="go" data-page="tasks">' + tr('Buat tugas otomatis', 'Generate tasks') + '</button>')) + '</section>' +
          '<section class="card"><div class="card-h"><div class="row gap-12"><span class="ico-dot sage">' + ic('stream') + '</span><div><div class="h2">' + tr('Aliran Konten Terbaru', 'Recent Content Stream') + '</div><div class="label mt-4">' + tr('Pipeline & aset yang dihasilkan', 'Generated pipeline & assets') + '</div></div></div><select class="sel sm white" id="dash-filter" style="width:auto"><option value="">' + tr('Semua format', 'All formats') + ' (' + (st.totalKonten || 0) + ')</option>' + opts(JENIS, filt, jenisLabel) + '</select></div>' +
            (terbaru.length ? '<div class="tbl-wrap" style="max-height:none;border:0"><table class="tbl"><thead><tr><th>' + tr('Konten & judul', 'Content & title') + '</th><th class="hide-sm">Format</th><th>' + tr('Kanal', 'Channel') + '</th></tr></thead><tbody>' + terbaru.map((k) => '<tr style="cursor:pointer" data-act="go" data-page="generator" data-id="' + h(k.ID) + '"><td><div class="row gap-12"><div class="thumb">' + (k.URLAset ? '<img src="' + h(k.URLAset) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover" referrerpolicy="no-referrer">' : ic(JENIS_ICON[k.Jenis] || 'description', 'sm')) + '</div><div style="min-width:0"><div class="sb clamp-1">' + h(k.Judul) + '</div><div class="xs muted">' + h(Fmt.rel(k.DiperbaruiPada)) + ' · ' + stLabel(k.Status) + (pj(k.Slides, []).length ? ' · ' + pj(k.Slides, []).length + ' slide' : '') + '</div></div></div></td><td class="hide-sm">' + jenisPill(k.Jenis) + '</td><td>' + platPill(k.Platform) + '</td></tr>').join('') + '</tbody></table></div>' : UI.empty('auto_awesome', tr('Belum ada konten', 'No content yet'), tr('Mulai dari Content Generator — hasil langsung tersimpan di Sheets.', 'Start in the Content Generator — results are saved to Sheets.'))) +
            '<div class="row between mt-12 wrap gap-8"><span class="xs muted">' + tr('Menampilkan ', 'Showing ') + terbaru.length + tr(' terbaru dari ', ' latest of ') + (st.totalKonten || 0) + '</span><a class="link-mono" href="#/generator?tab=repo">✦ [ ' + tr('Buka repositori konten', 'Open full content repository') + ' ] ✦</a></div></section>' +
        '</div>' +
        '<div class="col gap-20" style="gap:20px">' +
          '<section class="card"><div class="card-h"><div class="row gap-12"><span class="ico-dot butter">' + ic('shopping_bag') + '</span><div><div class="h2">' + tr('Produk Tertaut', 'Product Linkage') + '</div><div class="label mt-4">' + tr('Aset monetisasi aktif', 'Active monetization assets') + '</div></div></div><span class="pill p-blush">⚡ ' + produk.length + ' ' + tr('aktif', 'active') + '</span></div>' +
            '<div class="col gap-10" style="gap:10px">' + (produk.length ? produk.slice(0, 5).map((p) => '<div class="tile row gap-12"><span class="ico-dot sm line">' + ic(/notion|planner/i.test(p.Jenis) ? 'event_note' : /canva|template/i.test(p.Jenis) ? 'design_services' : 'menu_book', 'sm') + '</span><div class="grow"><div class="sb clamp-1">' + h(p.Nama) + '</div><div class="row gap-8 mt-4"><span class="pill sm mono p-sage">' + Fmt.rp(p.Harga) + '</span><span class="xs muted">' + ((b.perProduk || {})[p.ID] || 0) + tr(' konten terkait', ' contents attached') + '</span></div></div>' + (p.Link ? '<a class="icon-btn sm ghost" href="' + h(p.Link) + '" target="_blank" rel="noopener" aria-label="Link">' + ic('link', 'sm') + '</a>' : '') + '</div>').join('') : UI.empty('shopping_bag', tr('Belum ada produk', 'No products yet'))) +
            '<button class="btn btn-ghost btn-block" data-act="produk">' + ic('add_circle', 'sm') + tr('Tautkan Produk Baru', 'Attach New Product Offer') + ' ✦</button></div></section>' +
          '<section class="card"><div class="card-h"><div class="row gap-12"><span class="ico-dot line">' + ic('timer') + '</span><div><div class="h2">' + tr('Jadwal Publikasi', 'Publishing Schedule') + '</div><div class="label mt-4">' + tr('48 jam ke depan', 'Next 48 hours') + '</div></div></div><span class="pill p-sage">🌸 Live Sync</span></div>' +
            this.jadwal48(jadwal) + '</section>' +
          '<section class="card"><div class="card-h"><div class="row gap-12"><span class="ico-dot">' + ic('terminal') + '</span><div><div class="h2">AI &amp; GAS Monitor</div><div class="label mt-4">' + tr('Batas & kesehatan backend', 'Backend limits & health') + '</div></div></div><span class="pill p-sage">✦ ' + ((b.sistem && b.sistem.antrian) ? tr('Antrean aktif', 'Queue active') : '0 errors') + '</span></div>' +
            '<div class="col gap-16"><div><div class="row between small"><span>' + tr('Kuota AI harian', 'Daily AI quota') + '</span><span class="mono xs">' + sisaAi + '% ' + tr('tersisa', 'left') + ' (' + (ai.terpakai || 0) + '/' + (ai.kuota || 150) + ')</span></div><div class="bar thin blush mt-8"><i style="width:' + (100 - sisaAi) + '%"></i></div></div>' +
            '<div><div class="row between small"><span>' + tr('Cache hit respons AI', 'AI response cache hit') + '</span><span class="mono xs">' + hit + '%</span></div><div class="bar thin mt-8"><i style="width:' + hit + '%"></i></div></div>' +
            '<div><div class="row between small"><span>' + tr('Latensi API terakhir', 'Last API latency') + '</span><span class="mono xs">' + (Perf.last ? Perf.last.t + ' ms (server ' + (Perf.last.s || '–') + ' ms)' : '—') + '</span></div><div class="bar thin butter mt-8"><i style="width:' + clamp(Perf.last ? Perf.last.t / 30 : 0, 2, 100) + '%"></i></div></div>' +
            '<a href="#/settings?tab=infra" class="tile row between"><span class="row gap-8"><span class="dot pulse"></span><span class="small">GAS Engine v' + VER + '</span></span><span class="mono xs tert">' + tr('Warm', 'Warm') + ': ' + h(b.sistem && b.sistem.warm ? Fmt.rel(b.sistem.warm.at) : '—') + '</span></a></div></section>' +
        '</div>' +
      '</div>' +
      this.matrix(st, b);
    if (innerWidth < 1100) { const g = $('#dash-grid', el); if (g) g.style.gridTemplateColumns = 'minmax(0,1fr)'; }
  },
  taskRow(t) {
    const pc = { P1: 'p-ink', P2: 'p-sage', P3: 'p-butter', P4: 'p-line' }[t.Prioritas] || 'p-line', done = t.Status === 'Selesai';
    const go = { approval: 'approval', copy: 'copy', graphic: 'graphic', calendar: 'calendar', reports: 'reports', generator: 'generator', learning: 'learning' }[t.Modul];
    return '<div class="task ' + (done ? 'done' : '') + '"><label class="check" style="margin-top:2px"><input type="checkbox" data-act="toggle" data-id="' + h(t.ID) + '"' + (done ? ' checked' : '') + ' aria-label="' + tr('Selesai', 'Done') + '"></label><div class="grow"><div class="row gap-8 wrap"><span class="pill sm mono ' + pc + '">' + h(t.Prioritas) + ' · ' + h(t.Estimasi) + ' ' + tr('mnt', 'min') + '</span>' + (t.Otomatis === 'YA' ? '<span class="pill sm p-lav">✦ auto</span>' : '') + (t.Tanggal < (App.boot.hariIni || '') ? '<span class="pill sm p-warn">' + tr('tertunda', 'overdue') + '</span>' : '') + '</div><div class="sb mt-8 t-title">' + h(t.Judul) + '</div>' + (t.Catatan ? '<div class="xs muted mt-4">' + h(t.Catatan) + '</div>' : '') + '</div>' + (go && !done ? '<button class="btn btn-ghost btn-xs" data-act="go" data-page="' + go + '"' + (t.RefID && /^KTN|^LRN/.test(t.RefID) ? ' data-id="' + h(t.RefID) + '"' : '') + '>' + tr('Buka', 'Open') + ' ' + ic('chevron_right', 'xs') + '</button>' : '') + '</div>';
  },
  jadwal48(j) {
    const now = Date.now(), list = j.filter((x) => Fmt.ms(x.Tanggal, x.Jam) <= now + 48 * 3600e3).slice(0, 4);
    if (!list.length) return UI.empty('event_available', tr('Tidak ada jadwal 48 jam ke depan', 'Nothing in the next 48 hours'), '', '<button class="btn btn-ghost btn-sm" data-act="go" data-page="calendar">' + tr('Atur jadwal', 'Plan schedule') + '</button>');
    return '<div class="timeline">' + list.map((x, i) => { const t = Fmt.ms(x.Tanggal, x.Jam), hari = x.Tanggal === Fmt.today() ? tr('Hari ini', 'Today') : x.Tanggal === Fmt.addDays(Fmt.today(), 1) ? tr('Besok', 'Tomorrow') : Fmt.tgl(x.Tanggal);
      return '<div class="tl-item ' + (i ? 'soft' : '') + '"><div class="' + (i ? 'inset' : 'card blush tight') + '" style="' + (i ? '' : 'box-shadow:none') + '"><div class="row between"><span class="label">⚡ ' + h(hari) + ' · ' + h(x.Jam) + ' WIB</span>' + platPill(x.Platform) + '</div><div class="row gap-12 mt-8"><div class="thumb" style="width:44px;height:44px;border-radius:12px;background:#fff;display:grid;place-items:center;overflow:hidden;flex:none">' + (x.URLAset ? '<img src="' + h(x.URLAset) + '" alt="" style="width:100%;height:100%;object-fit:cover" referrerpolicy="no-referrer">' : ic(JENIS_ICON[x.Jenis] || 'image', 'sm')) + '</div><div class="grow"><div class="sb clamp-2">' + h(x.Judul) + '</div><div class="xs muted">' + h(jenisLabel(x.Jenis)) + ' · ' + stLabel(x.KontenStatus) + ' · ' + h(Fmt.rel(new Date(t).toISOString())) + '</div></div></div>' + (i === 0 ? '<div class="row end mt-12"><button class="btn btn-ink btn-sm" data-act="go" data-page="approval" data-id="' + h(x.KontenID) + '">' + tr('Pratinjau & Setujui', 'Preview & Approve') + ' ✦</button></div>' : '') + '</div></div>'; }).join('') + '</div>';
  },
  matrix(st, b) {
    const ai = b.ai || {}, n = (x) => Fmt.n(x || 0);
    const M = [
      ['onboarding', 'Brand DNA & ' + tr('profil audiens', 'audience profile'), (b.profil || []).length + ' profil', 'p-sage', 'Active'],
      ['strategy', tr('Pilar & rencana bulanan dari nol', 'Pillars & monthly plan from scratch'), tr('AI siap', 'AI ready'), 'p-lav', 'Blueprint'],
      ['generator', tr('Ide & konten multi-format', 'Ideas & multi-format content'), n(st.totalKonten) + tr(' dibuat', ' created'), 'p-blush', 'Live'],
      ['copy', tr('Hook, caption, CTA, framework', 'Hooks, captions, CTA, frameworks'), '6 framework', 'p-butter', 'Editorial'],
      ['graphic', tr('Desain + Branding Kit + watermark', 'Design + Branding Kit + watermark'), App.kits().length + ' kit', 'p-sage', 'Canvas'],
      ['repurpose', tr('1 ide → lintas platform', '1 idea → cross-platform'), '5 format', 'p-line', 'Omnichannel'],
      ['calendar', tr('Jadwal, drag & drop, pengingat', 'Schedule, drag & drop, reminders'), n(st.terjadwal) + tr(' terjadwal', ' scheduled'), 'p-sage2', 'Synced'],
      ['approval', tr('Pratinjau perangkat & quality gate', 'Device preview & quality gate'), n(st.review) + ' review', 'p-blush', 'Gate'],
      ['templates', tr('Arketipe siap pakai', 'Ready-to-use archetypes'), '7+ ' + tr('arketipe', 'archetypes'), 'p-line', 'Vault'],
      ['tasks', tr('Tugas prioritas & streak', 'Priority tasks & streak'), (b.tugas || []).length + tr(' hari ini', ' today'), 'p-butter', 'Focus'],
      ['bilingual', tr('UI & konten ID/EN terpisah', 'Separate UI & content ID/EN'), 'ID · EN', 'p-lav', 'Locale'],
      ['assets', tr('Musik, SFX, font, visual', 'Music, SFX, fonts, visuals'), 'Drive', 'p-sage', 'Library'],
      ['learning', tr('Playbook social media', 'Social media playbooks'), '14 playbook', 'p-blush', 'Academy'],
      ['orchestration', tr('Prompt, kuota, cache, log', 'Prompts, quota, cache, logs'), (ai.terpakai || 0) + tr(' run hari ini', ' runs today'), 'p-lav', ai.provider === 'template' ? 'Template' : 'AI'],
      ['settings', tr('Workspace, keamanan, infrastruktur', 'Workspace, security, infrastructure'), tr('22 tab Sheets', '22 Sheets tabs'), 'p-sage', 'Healthy'],
      ['reports', tr('Metrik, grafik, ekspor', 'Metrics, charts, export'), 'Excel · PDF', 'p-butter', 'Insight'],
      ['crm', tr('Kontak lead & pembeli', 'Leads & buyers'), 'CRM', 'p-blush', 'Growth'],
      ['notif', tr('WA Fonnte + Email + blast', 'WA Fonnte + Email + blast'), tr('Antrean', 'Queue'), 'p-sage2', 'Notify']
    ];
    return '<section class="card mt-24"><div class="card-h"><div class="row gap-12"><span class="ico-dot">' + ic('hub') + '</span><div><div class="h2">' + tr('Ekosistem 16 Modul Terpadu', 'Unified 16-Module Ecosystem') + ' 🍒</div><div class="xs muted mt-4">' + tr('Orkestrasi ide → draf → visual → jadwal → evaluasi, tersinkron dua arah dengan Google Sheets.', 'Orchestrating idea → draft → visual → schedule → evaluation, two-way synced with Google Sheets.') + '</div></div></div><span class="pill mono p-sage">' + M.length + '/' + M.length + ' online</span></div>' +
      '<div class="grid g3" style="gap:12px">' + M.map((m) => { const it = NAV_FLAT.find((x) => x.id === m[0]); return '<a class="mod-card" href="#/' + m[0] + '"><div class="top"><span class="row gap-8"><span class="ico-dot sm line">' + ic(it.icon, 'sm') + '</span><span><span class="label" style="font-size:9.5px">W-' + it.mod + '</span><span class="h4" style="display:block">' + h(navLabel(it)) + '</span></span></span><span class="pill sm ' + m[3] + '">' + h(m[4]) + '</span></div><p class="xs muted clamp-2">' + h(m[1]) + '</p><div class="row between mt-4" style="margin-top:auto"><span class="mono xs tert">' + h(m[2]) + '</span><span class="xs sb">' + tr('Buka', 'Open') + ' ›</span></div></a>'; }).join('') + '</div></section>';
  },
  async toggle(id) {
    const b = App.boot, t = (b.tugas || []).find((x) => x.ID === id); if (!t) return;
    const lama = t.Status; t.Status = lama === 'Selesai' ? 'Belum' : 'Selesai';           // optimistic
    this.paint();
    if (t.Status === 'Selesai') UI.confetti();
    const r = await API.call('tugas.toggle', { id, selesai: t.Status === 'Selesai' }, { toast: false });
    if (!r.success) { t.Status = lama; this.paint(); }
  },
  quickTask() {
    const m = UI.modal({ title: tr('Tambah tugas cepat', 'Quick add task'), kicker: 'Anti-Mager', size: 'sm',
      body: '<form class="col gap-16" id="qt"><div class="field"><label>' + tr('Tugas', 'Task') + '</label><input class="inp" name="Judul" required placeholder="' + tr('mis. Rekam 3 hook untuk Reels', 'e.g. Record 3 hooks for Reels') + '"></div><div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Prioritas', 'Priority') + '</label><select class="sel" name="Prioritas">' + opts(['P1', 'P2', 'P3', 'P4'], 'P2') + '</select></div><div class="field"><label>' + tr('Estimasi (menit)', 'Estimate (min)') + '</label><input class="inp" type="number" name="Estimasi" value="15" min="1"></div></div></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="qt-save">' + tr('Simpan', 'Save') + '</button>' });
    $('#qt-save', m.el.parentNode).onclick = async (e) => {
      const v = formVals($('#qt', m.el)); if (!v.Judul) return UI.toast(tr('Isi nama tugas.', 'Enter a task name.'), 'warn');
      UI.busy(e.currentTarget, true);
      const r = await API.call('tugas.save', Object.assign(v, { Tanggal: Fmt.today() }));
      UI.busy(e.currentTarget, false);
      if (r.success) { m.close(); App.boot.tugas = (App.boot.tugas || []).concat([r.data]); this.paint(); }
    };
  },
  quickProduk() { Produk.form(null, () => App.refreshBoot()); }
});

