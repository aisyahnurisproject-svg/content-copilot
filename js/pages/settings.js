/* Modul 16 — Settings & Workspace: pengaturan, profil pemilik, keamanan, infrastruktur GAS, data (backup · migrasi · CSV) */
'use strict';
Pages.def('settings', {
  TABS: [['workspace', 'tune', 'Workspace', 'Workspace'], ['profil', 'person', 'Profil pemilik', 'Owner profile'], ['keamanan', 'shield_lock', 'Keamanan', 'Security'], ['infra', 'dns', 'Infrastruktur', 'Infrastructure'], ['data', 'database', 'Data & migrasi', 'Data & migration']],
  GRUP: [
    ['Umum', 'General', ['NAMA_STUDIO', 'APP_URL', 'MARQUEE_TEKS']],
    ['Otomasi & jadwal', 'Automation & schedule', ['PENGINGAT_MENIT', 'RINGKASAN_HARIAN_JAM', 'LAPORAN_MINGGUAN', 'TARGET_MINGGUAN', 'BELAJAR_HARIAN', 'CRM_SYNC_MENIT', 'KEEP_WARM']],
    ['Lead magnet publik', 'Public lead magnet', ['LEAD_FORM_AKTIF', 'LEAD_JUDUL', 'LEAD_PESAN_SUKSES']],
    ['Data', 'Data', ['BACKUP_SIMPAN', 'SEED_DEMO']]
  ],
  CSV: { Produk: ['Nama', 'Jenis', 'Harga', 'TargetPembeli', 'Deskripsi', 'Link', 'HookTrigger', 'Status'], Konten: ['Judul', 'Jenis', 'Platform', 'Caption', 'CTA', 'Hashtag', 'Pilar', 'Status'], Metrik: ['KontenID', 'Tanggal', 'Platform', 'Jangkauan', 'Tayangan', 'Interaksi', 'Komentar', 'Simpan', 'Bagikan', 'Klik', 'Konversi', 'Pendapatan'], Aset_Media: ['Nama', 'Jenis', 'Sumber', 'URL', 'Lisensi', 'Tema', 'Tag'], Ide_Konten: ['Hook', 'Topik', 'Tema', 'Pilar', 'Platform', 'Format'], Template: ['Nama', 'Jenis', 'Platform', 'Tema', 'Deskripsi'], CRM_Kontak: ['Nama', 'Email', 'NoWA', 'Segmen', 'Tag', 'Catatan'] },
  marquee() { return ['Module 16 // Settings & Workspace', 'Script Properties for secrets · Sheets for settings', 'Backup · migration · CSV import', 'GAS infrastructure health']; },
  render(el, params) {
    this.el = el; this.tab = params.tab || Store.get('set-tab', 'workspace'); this.set = null; this.sys = null; this.mig = null;
    bindActs(el, {
      tab: (b) => { this.tab = b.dataset.v; Store.set('set-tab', this.tab); this.paint(); }, simpanSet: (b) => this.simpanSet(b), appurl: () => { $('[data-k="APP_URL"]', el).value = location.origin + location.pathname.replace(/index\.html$/, ''); },
      simpanProfil: (b) => this.simpanProfil(b), sandi: (b) => this.gantiSandi(b), email: (b) => this.gantiEmail(b), cid: (b) => this.simpanCid(b), cidDel: (b) => this.hapusCid(b), keluarSemua: () => this.keluarSemua(), audit: (b) => this.audit(b),
      sys: (b) => this.muatSys(b, true), warm: (b) => this.warm(b), creset: (b) => this.cacheReset(b), perf: () => this.paintPerf(),
      bkBuat: (b) => this.backup(b), bkList: (b) => this.backupList(b), bkJson: (b) => this.eksporJson(b), scan: (b) => this.migrasi(b, true), run: (b) => this.migrasi(b, false), csv: (b) => this.csv(b), csvTpl: () => this.csvTpl(), contoh: (b) => this.hapusContoh(b)
    });
    el.innerHTML = App.hero({ word: 'W-16', pills: '<span class="pill mono p-line">' + ic('settings', 'xs') + 'Workspace control</span><span class="pill mono p-sage">' + ic('lock', 'xs') + 'Secrets → Script Properties</span>',
      title: tr('satu ruang kendali. <span class="it">semua tetap aman.</span>', 'one control room. <span class="it">everything stays safe.</span>'),
      sub: tr('Atur workspace, profil, keamanan login, kesehatan server Apps Script, hingga backup & migrasi data dari aplikasi lama — tanpa membuka editor kode.', 'Manage your workspace, profile, login security, Apps Script server health, backups and data migration from an older app — without opening the code editor.') }) +
      '<div class="seg mt-24" id="st-tabs" style="max-width:100%"></div><div id="st-body" class="mt-16"></div>';
    this.paint();
  },
  paint() {
    $('#st-tabs', this.el).innerHTML = this.TABS.map((t) => '<button class="' + (this.tab === t[0] ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '">' + ic(t[1], 'sm') + ' ' + h(tr(t[2], t[3])) + '</button>').join('');
    const b = $('#st-body', this.el);
    b.innerHTML = '<div class="grid g2">' + UI.sk(2) + '</div>';
    this['tab_' + this.tab]();
  },
  /* ---------------- Workspace ---------------- */
  tab_workspace() {
    API.swr('pengaturan.list', {}, { maxAge: 20000, onData: (rows) => { this.set = rows; if (this.tab === 'workspace') this.paintSet(); } });
  },
  inp(r) {
    const v = r.Nilai, k = r.Kunci;
    if (/^(YA|TIDAK)$/.test(v) || /_AKTIF$|^KEEP_WARM$|^LAPORAN_MINGGUAN$|^SEED_DEMO$|^BELAJAR_HARIAN$/.test(k)) return '<span class="sw"><input type="checkbox" data-k="' + h(k) + '" data-yn="1"' + (v !== 'TIDAK' ? ' checked' : '') + '><i></i></span>';
    if (/^\d+$/.test(v) && !/JAM$/.test(k)) return '<input class="inp sm" type="number" data-k="' + h(k) + '" value="' + h(v) + '" style="max-width:140px">';
    if (k === 'RINGKASAN_HARIAN_JAM') return '<select class="sel sm" data-k="' + h(k) + '" style="max-width:140px">' + opts(Array.from({ length: 24 }, (_, i) => String(i)), v, (x) => ('0' + x).slice(-2) + ':00 WIB') + '</select>';
    if (String(v).length > 80) return '<textarea class="ta sm" data-k="' + h(k) + '" rows="2">' + h(v) + '</textarea>';
    return '<input class="inp sm" data-k="' + h(k) + '" value="' + h(v) + '">';
  },
  paintSet() {
    const by = {}; this.set.forEach((r) => { by[r.Kunci] = r; });
    if (!by.TARGET_MINGGUAN) by.TARGET_MINGGUAN = { Kunci: 'TARGET_MINGGUAN', Nilai: '5', Keterangan: tr('Target posting per minggu (Kalender · Cadence Health)', 'Target posts per week (Calendar · Cadence Health)') };
    const dipakai = {}, row = (r) => '<div class="list-row" style="border-bottom:1px dotted var(--line);align-items:flex-start"><div class="grow" style="min-width:0"><div class="mono xs sb">' + h(r.Kunci) + '</div><div class="xs muted mt-4">' + h(r.Keterangan) + '</div></div><div style="flex:0 1 48%;min-width:140px;display:flex;justify-content:flex-end;gap:6px">' + this.inp(r) + (r.Kunci === 'APP_URL' ? '<button class="icon-btn sm" data-act="appurl" title="' + tr('Isi dengan alamat halaman ini', 'Use this page address') + '" aria-label="auto">' + ic('my_location', 'sm') + '</button>' : '') + '</div></div>';
    let html = '<div class="grid g2" style="align-items:start">' + this.GRUP.map((g) => '<section class="card col gap-4"><div class="label mb-8">' + h(tr(g[0], g[1])) + '</div>' + g[2].filter((k) => by[k]).map((k) => { dipakai[k] = 1; return row(by[k]); }).join('') + '</section>').join('') + '</div>';
    const lain = this.set.filter((r) => !dipakai[r.Kunci] && !/^(AI_|NOTIF_|WA_|EMAIL_|BELAJAR_STREAK|BELAJAR_TERAKHIR)/.test(r.Kunci));
    html += '<section class="card mt-16 col gap-8"><div class="row between wrap gap-8"><div class="label">' + tr('Dikelola di modul lain', 'Managed in other modules') + '</div></div><div class="row wrap gap-8"><a class="btn btn-ghost btn-sm" href="#/orchestration">' + ic('hub', 'sm') + tr('AI (provider, model, kuota)', 'AI (provider, model, quota)') + '</a><a class="btn btn-ghost btn-sm" href="#/notif">' + ic('campaign', 'sm') + tr('WhatsApp & Email', 'WhatsApp & Email') + '</a><a class="btn btn-ghost btn-sm" href="#/onboarding">' + ic('palette', 'sm') + 'Branding Kit</a></div>' + (lain.length ? '<details class="mt-8"><summary class="small sb" style="cursor:pointer">' + tr('Kunci lain (lanjutan)', 'Other keys (advanced)') + ' · ' + lain.length + '</summary><div class="mt-8">' + lain.map(row).join('') + '</div></details>' : '') + '</section>' +
      '<div class="qbar"><span class="grow small">' + ic('info', 'sm') + ' ' + tr('Rahasia (API key, token, sandi) tidak tampil di sini — disimpan di Script Properties.', 'Secrets (API keys, tokens, passwords) are not shown here — they live in Script Properties.') + '</span><button class="btn btn-blush btn-sm" data-act="simpanSet">' + ic('save', 'sm') + tr('Simpan pengaturan', 'Save settings') + '</button></div>';
    $('#st-body', this.el).innerHTML = html;
  },
  async simpanSet(btn) {
    const by = {}; (this.set || []).forEach((r) => { by[r.Kunci] = r.Nilai; });
    const ubah = {};
    $$('[data-k]', $('#st-body', this.el)).forEach((x) => { const k = x.dataset.k, v = x.dataset.yn ? (x.checked ? 'YA' : 'TIDAK') : String(x.value).trim(); if (by[k] === undefined ? v !== '' : String(by[k]) !== v) ubah[k] = v; });
    if (ubah.APP_URL && !/^https?:\/\//.test(ubah.APP_URL)) return UI.toast(tr('APP_URL harus diawali https://', 'APP_URL must start with https://'), 'warn');
    if (!Object.keys(ubah).length) return UI.toast(tr('Tidak ada perubahan.', 'No changes.'), 'info');
    UI.busy(btn, true); const r = await API.call('pengaturan.save', ubah); UI.busy(btn, false);
    if (r.success) { Object.assign((App.boot && App.boot.settings) || {}, r.data); API.read('pengaturan.list', {}).then((x) => { if (x.success) { this.set = x.data; this.paintSet(); } }); }
  },
  /* ---------------- Profil ---------------- */
  tab_profil() {
    const me = (App.boot && App.boot.me) || {}, emo = ['🍒', '🌸', '🌿', '✨', '☕', '📚', '🎨', '🚀', '🦋', '🍓'];
    $('#st-body', this.el).innerHTML = '<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:start" id="pf-g"><section class="card lg col gap-12"><div class="label">' + tr('Profil pemilik (single owner)', 'Owner profile (single owner)') + '</div><form class="col gap-12" id="pf"><div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Nama tampilan', 'Display name') + '</label><input class="inp" name="Nama" value="' + h(me.Nama || '') + '"></div><div class="field"><label>WhatsApp <span class="opt">' + tr('untuk notifikasi', 'for notifications') + '</span></label><input class="inp" name="WA" inputmode="tel" value="' + h(me.WA || '') + '" placeholder="0812xxxxxxx"></div></div>' +
      '<div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Pengalaman', 'Experience') + '</label><select class="sel" name="Pengalaman">' + opts(['Pemula', 'Menengah', 'Mahir'], me.Pengalaman || 'Pemula') + '</select></div><div class="field"><label>Niche</label><input class="inp" name="Niche" value="' + h(me.Niche || '') + '" placeholder="' + tr('mis. template Notion untuk guru', 'e.g. Notion templates for teachers') + '"></div></div>' +
      '<div class="field"><label>Avatar</label><div class="chips" id="pf-av">' + emo.map((e) => '<button type="button" class="chip' + ((me.Avatar || '🍒') === e ? ' on' : '') + '" data-e="' + e + '" style="font-size:18px">' + e + '</button>').join('') + '</div></div></form><div class="row end"><button class="btn btn-ink" data-act="simpanProfil">' + ic('save', 'sm') + tr('Simpan profil', 'Save profile') + '</button></div></section>' +
      '<aside class="card col gap-10"><div class="label">' + tr('Akun login', 'Login account') + '</div><div class="row gap-12"><span class="avatar">' + h(me.Avatar || '🍒') + '</span><div><div class="sb">' + h(me.Nama || 'Studio Director') + '</div><div class="xs muted">' + h(me.Email || '') + '</div></div></div><p class="xs muted">' + tr('Aplikasi ini untuk satu pemilik. Email & kata sandi login diubah di tab Keamanan.', 'This app has a single owner. Change login email & password in the Security tab.') + '</p><button class="btn btn-ghost btn-sm" data-act="tab" data-v="keamanan">' + ic('shield_lock', 'sm') + tr('Buka Keamanan', 'Open Security') + '</button></aside></div>';
    if (innerWidth < 900) $('#pf-g', this.el).style.gridTemplateColumns = 'minmax(0,1fr)';
    $('#pf-av', this.el).onclick = (e) => { const b = e.target.closest('[data-e]'); if (!b) return; $$('#pf-av .chip', this.el).forEach((x) => x.classList.toggle('on', x === b)); };
  },
  async simpanProfil(btn) {
    const v = formVals($('#pf', this.el)), av = $('#pf-av .chip.on', this.el); v.Avatar = av ? av.dataset.e : '🍒';
    UI.busy(btn, true); const r = await API.call('pemilik.save', v); UI.busy(btn, false);
    if (r.success && App.boot) { App.boot.me = Object.assign(App.boot.me || {}, r.data); App.paintShellState(); }
  },
  /* ---------------- Keamanan ---------------- */
  tab_keamanan() {
    $('#st-body', this.el).innerHTML = '<div class="grid g2" style="align-items:start"><section class="card col gap-12"><div class="label">' + tr('Ganti kata sandi', 'Change password') + '</div><form class="col gap-10" id="pw" autocomplete="off"><div class="field"><label>' + tr('Kata sandi lama', 'Current password') + '</label><input class="inp" type="password" name="lama" autocomplete="current-password"></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Kata sandi baru', 'New password') + '</label><input class="inp" type="password" name="baru" autocomplete="new-password"></div><div class="field"><label>' + tr('Ulangi', 'Repeat') + '</label><input class="inp" type="password" name="ulang" autocomplete="new-password"></div></div><span class="hint">' + tr('Minimal 10 karakter, huruf + angka. Perangkat lain otomatis dikeluarkan.', 'At least 10 characters, letters + numbers. Other devices are signed out.') + '</span></form><button class="btn btn-ink" data-act="sandi">' + ic('key', 'sm') + tr('Perbarui kata sandi', 'Update password') + '</button></section>' +
      '<section class="card col gap-12"><div class="label">' + tr('Ganti email login', 'Change login email') + '</div><form class="col gap-10" id="em" autocomplete="off"><div class="field"><label>' + tr('Email baru', 'New email') + '</label><input class="inp" type="email" name="email" value="' + h(((App.boot && App.boot.me) || {}).Email || '') + '"></div><div class="field"><label>' + tr('Konfirmasi kata sandi', 'Confirm password') + '</label><input class="inp" type="password" name="password" autocomplete="current-password"></div></form><button class="btn btn-ghost" data-act="email">' + ic('alternate_email', 'sm') + tr('Perbarui email', 'Update email') + '</button></section>' +
      '<section class="card col gap-12" id="cid-box">' + UI.sk(1, 'sk-line') + '</section>' +
      '<section class="card col gap-12"><div class="label">' + tr('Sesi & perangkat', 'Sessions & devices') + '</div><p class="small muted">' + tr('Token sesi bertanda tangan HMAC (12 jam, atau 30 hari bila “ingat saya”). Keluar dari semua perangkat mencabut semua token yang pernah diterbitkan.', 'Sessions use HMAC-signed tokens (12 hours, or 30 days with “remember me”). Signing out everywhere revokes every token ever issued.') + '</p><div class="inset small">' + tr('Sesi ini berakhir: ', 'This session expires: ') + '<b>' + h(Auth.sess && Auth.sess.exp ? Fmt.dt(new Date(Auth.sess.exp).toISOString()) : '—') + '</b></div><button class="btn btn-danger" data-act="keluarSemua">' + ic('logout', 'sm') + tr('Keluar dari semua perangkat', 'Sign out of all devices') + '</button></section></div>' +
      '<section class="card lg mt-16"><div class="row between wrap gap-8 mb-12"><div><div class="label">Audit_Log</div><p class="xs muted mt-4">' + tr('200 aktivitas penting terakhir — isi rahasia selalu disamarkan.', 'Last 200 important actions — secret values are always masked.') + '</p></div><button class="btn btn-ghost btn-sm" data-act="audit">' + ic('refresh', 'sm') + tr('Muat', 'Load') + '</button></div><div id="au-box">' + UI.sk(3, 'sk-line') + '</div></section>';
    API.read('rahasia.status', {}).then((r) => { if (r.success) { this.rah = r.data; this.paintCid(); } });
    this.audit();
  },
  paintCid() {
    const c = (this.rah || {}).GOOGLE_CLIENT_ID || {};
    $('#cid-box', this.el).innerHTML = '<div class="row between"><div class="label">' + tr('Login dengan Google (opsional)', 'Sign in with Google (optional)') + '</div><span class="pill sm ' + (c.ada ? 'p-ok' : 'p-line') + '">' + (c.ada ? tr('aktif', 'active') : tr('nonaktif', 'off')) + '</span></div><p class="small muted">' + tr('Isi OAuth Client ID (Web) dari Google Cloud Console. Tambahkan alamat GitHub Pages Anda ke “Authorized JavaScript origins”. Hanya email pemilik yang bisa masuk.', 'Paste a Web OAuth Client ID from Google Cloud Console. Add your GitHub Pages address to “Authorized JavaScript origins”. Only the owner email can sign in.') + '</p>' +
      '<div class="field"><label>Client ID ' + (c.samar ? '<span class="opt mono">' + h(c.samar) + '</span>' : '') + '</label><input class="inp" id="cid" autocomplete="off" placeholder="xxxxxxxx.apps.googleusercontent.com"></div><div class="row gap-8"><button class="btn btn-ink btn-sm" data-act="cid">' + tr('Simpan', 'Save') + '</button>' + (c.ada ? '<button class="btn btn-text btn-sm" data-act="cidDel" style="color:var(--danger)">' + tr('Nonaktifkan', 'Disable') + '</button>' : '') + '</div>';
  },
  async gantiSandi(btn) {
    const v = formVals($('#pw', this.el));
    if (!v.lama || !v.baru) return UI.toast(tr('Lengkapi kolom kata sandi.', 'Fill in the password fields.'), 'warn');
    if (v.baru !== v.ulang) return UI.toast(tr('Ulangi kata sandi tidak sama.', 'Passwords do not match.'), 'warn');
    if (v.baru.length < 10 || !/\d/.test(v.baru) || !/[A-Za-z]/.test(v.baru)) return UI.toast(tr('Minimal 10 karakter dengan huruf & angka.', 'At least 10 characters with letters & numbers.'), 'warn');
    UI.busy(btn, true); const r = await API.call('auth.changePassword', { lama: v.lama, baru: v.baru }, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) { Auth.setToken(r.data.token, r.data.exp); $('#pw', this.el).reset(); }
  },
  async gantiEmail(btn) {
    const v = formVals($('#em', this.el)); if (!v.email || !v.password) return UI.toast(tr('Isi email baru dan kata sandi.', 'Enter the new email and password.'), 'warn');
    UI.busy(btn, true); const r = await API.call('auth.changeEmail', v, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) { Auth.setToken(r.data.token, r.data.exp); if (App.boot && App.boot.me) App.boot.me.Email = r.data.email; $('[name=password]', $('#em', this.el)).value = ''; }
  },
  async simpanCid(btn) {
    const v = $('#cid', this.el).value.trim(); if (!v) return UI.toast(tr('Tempel Client ID dulu.', 'Paste the Client ID first.'), 'warn');
    UI.busy(btn, true); const r = await API.call('rahasia.simpan', { kunci: 'GOOGLE_CLIENT_ID', nilai: v }, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) { this.rah.GOOGLE_CLIENT_ID = { ada: r.data.ada, samar: r.data.samar }; this.paintCid(); }
  },
  async hapusCid() {
    if (!(await UI.confirm(tr('Nonaktifkan login Google?', 'Disable Google sign-in?')))) return;
    const r = await API.call('rahasia.simpan', { kunci: 'GOOGLE_CLIENT_ID', nilai: '__HAPUS__' }, { noBootRefresh: true });
    if (r.success) { this.rah.GOOGLE_CLIENT_ID = { ada: false, samar: '' }; this.paintCid(); }
  },
  async keluarSemua() {
    if (!(await UI.confirm(tr('Semua perangkat (termasuk yang ini) akan keluar. Lanjutkan?', 'All devices (including this one) will be signed out. Continue?'), { danger: true, ok: tr('Keluar semua', 'Sign out all') }))) return;
    const r = await API.call('auth.logoutAll', {}, { noBootRefresh: true });
    if (r.success) { Auth.clear(); App.showLogin(tr('Semua sesi telah dicabut. Silakan masuk kembali.', 'All sessions revoked. Please sign in again.')); }
  },
  async audit(btn) {
    if (btn) UI.busy(btn, true); const r = await API.read('audit.list', {}); if (btn) UI.busy(btn, false);
    const box = $('#au-box', this.el); if (!box || !r.success) return;
    box.innerHTML = r.data.length ? '<div class="tbl-wrap" style="max-height:420px"><table class="tbl"><thead><tr><th>' + tr('Waktu', 'Time') + '</th><th>' + tr('Aksi', 'Action') + '</th><th>' + tr('Entitas', 'Entity') + '</th><th>Detail</th></tr></thead><tbody>' + r.data.map((a) => '<tr><td class="mono xs">' + h(Fmt.dt(a.Waktu)) + '</td><td class="mono xs sb">' + h(a.Aksi) + '</td><td class="small">' + h(a.Entitas) + '</td><td class="xs muted" style="max-width:420px">' + h(a.Detail) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="small muted">' + tr('Belum ada aktivitas tercatat.', 'No activity logged yet.') + '</p>';
  },
  /* ---------------- Infrastruktur ---------------- */
  tab_infra() { this.muatSys(null, false); },
  muatSys(btn, fresh) {
    if (btn) UI.busy(btn, true);
    const done = (s) => { if (btn) UI.busy(btn, false); this.sys = s; if (this.tab === 'infra') this.paintSys(); };
    if (fresh) API.read('sistem.status', { _fresh: 1 }).then((r) => { if (r.success) { API.remember('sistem.status', {}, r.data); done(r.data); } else if (btn) UI.busy(btn, false); });
    else API.swr('sistem.status', {}, { maxAge: 120000, onData: done });
  },
  paintSys() {
    const s = this.sys, selPct = Math.round(100 * s.totalSel / s.batasSel), prPct = Math.round(100 * s.propertiBytes / s.propertiBatas), dPct = s.drive && s.drive.batas ? Math.round(100 * s.drive.terpakai / s.drive.batas) : 0;
    const meter = (l, p, sub) => '<div class="col gap-4"><div class="row between small"><span class="sb">' + l + '</span><span class="mono xs">' + p + '%</span></div><div class="bar"><i style="width:' + Math.max(1, p) + '%;background:' + (p > 85 ? 'var(--danger)' : p > 65 ? 'var(--s4)' : 'var(--sage-ink)') + '"></i></div><span class="xs muted">' + sub + '</span></div>';
    const trg = s.triggers || [], t1 = trg.indexOf('tickMenit') > -1, t2 = trg.indexOf('tickHarian') > -1;
    $('#st-body', this.el).innerHTML = '<div class="grid g3" style="align-items:start"><section class="card col gap-12"><div class="row between"><div class="label">' + tr('Kapasitas', 'Capacity') + '</div><span class="pill sm mono p-line">v' + h(s.versi) + ' · skema ' + h(s.skema) + '</span></div>' +
        meter(tr('Sel Google Sheets', 'Google Sheets cells'), selPct, Fmt.n(s.totalSel) + ' / ' + Fmt.n(s.batasSel)) + meter('Script Properties', prPct, Fmt.bytes(s.propertiBytes) + ' / ' + Fmt.bytes(s.propertiBatas)) + meter('Google Drive', dPct, s.drive && s.drive.batas ? Fmt.bytes(s.drive.terpakai) + ' / ' + Fmt.bytes(s.drive.batas) : '—') +
        '<div class="row wrap gap-8">' + (s.spreadsheetUrl ? '<a class="btn btn-ghost btn-sm" href="' + h(s.spreadsheetUrl) + '" target="_blank" rel="noopener">' + ic('table_chart', 'sm') + 'Spreadsheet ↗</a>' : '') + (s.folderUrl ? '<a class="btn btn-ghost btn-sm" href="' + h(s.folderUrl) + '" target="_blank" rel="noopener">' + ic('folder', 'sm') + 'Drive ↗</a>' : '') + '</div></section>' +
      '<section class="card col gap-10"><div class="label">' + tr('Mesin & kuota', 'Engine & quota') + '</div>' +
        [[t1 ? 'p-ok' : 'p-danger', 'tickMenit', t1 ? tr('aktif · tiap 1 menit', 'active · every minute') : tr('belum terpasang', 'not installed')], [t2 ? 'p-ok' : 'p-danger', 'tickHarian', t2 ? tr('aktif · harian', 'active · daily') : tr('belum terpasang', 'not installed')], [s.keepWarm !== 'TIDAK' ? 'p-ok' : 'p-line', 'Keep-warm', s.keepWarm !== 'TIDAK' ? tr('cache dipanaskan', 'cache kept warm') : tr('dimatikan', 'off')], [s.antrian ? 'p-butter' : 'p-line', tr('Antrean notifikasi', 'Notification queue'), s.antrian ? tr('ada pesan menunggu', 'messages waiting') : tr('kosong', 'empty')], ['p-line', tr('Sisa kuota email', 'Email quota left'), String(s.sisaEmail)], ['p-line', tr('Panggilan AI hari ini', 'AI calls today'), String(s.aiHariIni)]].map((x) => '<div class="row between small" style="border-bottom:1px dotted var(--line);padding:6px 0"><span>' + h(x[1]) + '</span><span class="pill sm mono ' + x[0] + '">' + h(x[2]) + '</span></div>').join('') +
        '<p class="xs muted">' + tr('Warmup terakhir: ', 'Last warmup: ') + h(s.warm ? Fmt.dt(s.warm.at) + ' (' + s.warm.scope + ')' : '—') + (s.cached ? ' · ' + tr('status dari cache 5 mnt', 'status from 5-min cache') : '') + '</p></section>' +
      '<section class="card col gap-10"><div class="label">' + tr('Aksi server', 'Server actions') + '</div><button class="btn btn-ink btn-sm" data-act="sys">' + ic('refresh', 'sm') + tr('Cek ulang (segar)', 'Re-check (fresh)') + '</button><button class="btn btn-ghost btn-sm" data-act="warm">' + ic('local_fire_department', 'sm') + tr('Panaskan cache sekarang', 'Warm cache now') + '</button><button class="btn btn-ghost btn-sm" data-act="creset">' + ic('mop', 'sm') + tr('Reset semua cache', 'Reset all caches') + '</button><button class="btn btn-ghost btn-sm" data-act="perf">' + ic('speed', 'sm') + tr('Performa API (browser ini)', 'API performance (this browser)') + '</button><p class="xs muted">' + tr('Reset cache dipakai setelah Anda mengedit Google Sheets secara langsung. Trigger memakan kuota ±90 mnt/hari (akun gratis); matikan keep-warm via fungsi matikanKeepWarm() bila perlu.', 'Reset the cache after editing Google Sheets directly. Triggers use ~90 min/day quota (free accounts); run matikanKeepWarm() if needed.') + '</p></section></div>' +
      '<section class="card lg mt-16"><div class="label mb-12">' + tr('Isi spreadsheet', 'Spreadsheet contents') + '</div><div class="tbl-wrap" style="max-height:380px"><table class="tbl"><thead><tr><th>Sheet</th><th class="tr">' + tr('Baris', 'Rows') + '</th><th class="tr">' + tr('Kolom', 'Cols') + '</th></tr></thead><tbody>' + (s.sheets || []).map((x) => '<tr><td class="mono xs sb">' + h(x.nama) + '</td><td class="tr num small">' + Fmt.n(x.baris) + '</td><td class="tr num small">' + x.kolom + '</td></tr>').join('') + '</tbody></table></div></section><div id="perf-box"></div>';
  },
  async warm(btn) { UI.busy(btn, true); const r = await API.read('sistem.warm', {}); UI.busy(btn, false); UI.toast(r.success ? tr('Cache dipanaskan: ', 'Cache warmed: ') + r.data.warm : r.message, r.success ? 'ok' : 'err'); },
  async cacheReset(btn) {
    if (!(await UI.confirm(tr('Kosongkan semua cache server? Permintaan berikutnya membaca langsung dari Google Sheets.', 'Clear all server caches? The next requests read directly from Google Sheets.')))) return;
    UI.busy(btn, true); const r = await API.call('sistem.cacheReset', {}); UI.busy(btn, false); if (r.success) { Store.clearCache(); API.mem = {}; }
  },
  paintPerf() {
    const L = (Perf.log || []).slice(-40).reverse(), box = $('#perf-box', this.el); if (!box) return;
    const avg = (f) => L.length ? Math.round(L.reduce((s, e) => s + (f(e) || 0), 0) / L.length) : 0;
    box.innerHTML = '<section class="card lg mt-16"><div class="row between wrap gap-8 mb-12"><div class="label">' + tr('Performa API (40 terakhir di browser ini)', 'API performance (last 40 in this browser)') + '</div><span class="mono xs">' + tr('rata-rata total ', 'avg total ') + avg((e) => e.t) + ' ms · server ' + avg((e) => e.s) + ' ms</span></div>' + (L.length ? '<div class="tbl-wrap" style="max-height:360px"><table class="tbl"><thead><tr><th>' + tr('Aksi', 'Action') + '</th><th class="tr">Total</th><th class="tr">Server</th><th class="tr">' + tr('Jaringan', 'Network') + '</th><th>Cache</th><th>Batch</th></tr></thead><tbody>' + L.map((e) => '<tr><td class="mono xs">' + h(e.a) + '</td><td class="tr num small">' + e.t + '</td><td class="tr num small">' + (e.s || 0) + '</td><td class="tr num small">' + Math.max(0, e.t - (e.s || 0)) + '</td><td>' + (e.c ? '✓' : '') + '</td><td class="xs">' + h(e.b || '') + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="small muted">' + tr('Belum ada data.', 'No data yet.') + '</p>') + '<p class="xs muted mt-8">' + tr('Tip: buka Console browser lalu ketik Perf.table() atau Perf.summary().', 'Tip: open the browser Console and run Perf.table() or Perf.summary().') + '</p></section>';
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  /* ---------------- Data ---------------- */
  tab_data() {
    $('#st-body', this.el).innerHTML = '<div class="grid g2" style="align-items:start"><section class="card col gap-12"><div class="label">Backup</div><p class="small muted">' + tr('Salinan penuh spreadsheet ke folder Backup di Google Drive (disimpan ', 'Full spreadsheet copy into the Backup folder in Google Drive (keeps the latest ') + h(App.set('BACKUP_SIMPAN', '10')) + tr(' terbaru).', ').') + '</p><div class="row wrap gap-8"><button class="btn btn-ink btn-sm" data-act="bkBuat">' + ic('backup', 'sm') + tr('Buat backup sekarang', 'Back up now') + '</button><button class="btn btn-ghost btn-sm" data-act="bkJson">' + ic('data_object', 'sm') + tr('Ekspor JSON', 'Export JSON') + '</button><button class="btn btn-ghost btn-sm" data-act="bkList">' + ic('list', 'sm') + tr('Daftar backup', 'List backups') + '</button></div><div id="bk-list"></div></section>' +
      '<section class="card col gap-12"><div class="label">' + tr('Import CSV', 'CSV import') + '</div><p class="small muted">' + tr('Baris pertama = nama kolom (sama dengan header sheet). Baris dengan ID yang sudah ada dilewati kecuali “timpa” dicentang.', 'First row = column names (matching the sheet header). Rows whose ID already exists are skipped unless “overwrite” is ticked.') + '</p><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Tujuan', 'Target') + '</label><select class="sel sm" id="csv-t">' + opts(Object.keys(this.CSV)) + '</select></div><div class="field"><label>&nbsp;</label><label class="check sq small"><input type="checkbox" id="csv-ow"> ' + tr('Timpa yang sudah ada', 'Overwrite existing') + '</label></div></div><div class="row wrap gap-8"><button class="btn btn-ink btn-sm" data-act="csv">' + ic('upload_file', 'sm') + tr('Pilih & import CSV', 'Pick & import CSV') + '</button><button class="btn btn-ghost btn-sm" data-act="csvTpl">' + ic('download', 'sm') + tr('Unduh template', 'Download template') + '</button></div><div id="csv-res"></div></section></div>' +
      '<section class="card lg mt-16 col gap-12"><div class="row between wrap gap-8"><div><div class="label">' + tr('Migrasi dari aplikasi lama', 'Migrate from an older app') + '</div><h3 class="h2 mt-4">' + tr('Import spreadsheet lama (aman diulang)', 'Import an old spreadsheet (safe to repeat)') + '</h3></div><span class="pill p-sage">' + ic('verified', 'xs') + tr('Sumber hanya dibaca', 'Source is read-only') + '</span></div>' +
        '<p class="small muted">' + tr('Tempel URL/ID Google Sheets lama (akun Google yang sama). Klik Pindai untuk melihat hasil tanpa menulis apa pun, lalu Jalankan. Menjalankan ulang tidak membuat data dobel; ulangi tepat sebelum pindah (delta sync).', 'Paste the old Google Sheets URL/ID (same Google account). Click Scan to preview without writing anything, then Run. Re-running never duplicates data; run it again right before cutover (delta sync).') + '</p>' +
        '<div class="field"><label>' + tr('URL atau ID spreadsheet lama', 'Old spreadsheet URL or ID') + '</label><input class="inp" id="mg-src" placeholder="https://docs.google.com/spreadsheets/d/…"></div><div class="chips" id="mg-sheets">' + UI.sk(1, 'sk-line') + '</div><label class="check sq small"><input type="checkbox" id="mg-ow"> ' + tr('Timpa data yang sudah ada (default: hanya tambah yang belum ada)', 'Overwrite existing rows (default: only add missing rows)') + '</label>' +
        '<div class="row wrap gap-8"><button class="btn btn-ghost" data-act="scan">' + ic('search', 'sm') + tr('Pindai (dry-run)', 'Scan (dry-run)') + '</button><button class="btn btn-ink" data-act="run">' + ic('play_arrow', 'sm') + tr('Jalankan import', 'Run import') + '</button></div><div id="mg-res"></div></section>' +
      '<section class="card mt-16 row between wrap gap-12" style="border:1px dashed var(--danger)"><div><div class="label" style="color:var(--danger)">' + tr('Zona hati-hati', 'Careful zone') + '</div><p class="small mt-4">' + tr('Hapus semua data contoh (ID mengandung “-DEMO-”). Branding Kit, template, aset, dan materi belajar tetap ada.', 'Delete all sample data (IDs containing “-DEMO-”). Branding Kits, templates, assets and lessons remain.') + '</p></div><button class="btn btn-danger btn-sm" data-act="contoh">' + ic('delete_sweep', 'sm') + tr('Hapus data contoh', 'Delete sample data') + '</button></section>';
    API.swr('migrasi.peta', {}, { maxAge: 600000, onData: (p) => { const b = $('#mg-sheets', this.el); if (b) b.innerHTML = p.map((x) => '<label class="chip"><input type="checkbox" data-sh="' + h(x.sheet) + '"' + (x.opsional ? '' : ' checked') + ' style="accent-color:var(--sage-ink)"> ' + h(x.sheet) + (x.opsional ? ' <span class="n">opsional</span>' : '') + '</label>').join(''); } });
  },
  async backup(btn) { UI.busy(btn, true, tr('Menyalin…', 'Copying…')); const r = await API.call('backup.buat', {}, { noBootRefresh: true }); UI.busy(btn, false); if (r.success) this.backupList(); },
  async backupList(btn) {
    if (btn) UI.busy(btn, true); const r = await API.read('backup.list', {}); if (btn) UI.busy(btn, false);
    const box = $('#bk-list', this.el); if (!box || !r.success) return;
    box.innerHTML = r.data.length ? '<div class="col gap-6">' + r.data.slice(0, 10).map((b) => '<a class="inset row between small" style="padding:8px 12px" href="' + h(b.url) + '" target="_blank" rel="noopener"><span class="clamp-1">' + h(b.nama) + '</span><span class="mono xs tert nowrap">' + h(Fmt.dt(b.tanggal)) + ' ↗</span></a>').join('') + '</div>' : '<p class="xs muted">' + tr('Belum ada backup.', 'No backups yet.') + '</p>';
  },
  async eksporJson(btn) {
    UI.busy(btn, true); const r = await API.call('backup.export', {}, { noBootRefresh: true, toast: false }); UI.busy(btn, false);
    if (r.success) { Files.download('dcc-backup-' + Fmt.today() + '.json', JSON.stringify(r.data, null, 1), 'application/json'); UI.toast(tr('JSON diunduh (tanpa rahasia).', 'JSON downloaded (no secrets).'), 'ok'); }
  },
  async migrasi(btn, dry) {
    const src = $('#mg-src', this.el).value.trim(); if (!src) { $('#mg-src', this.el).focus(); return UI.toast(tr('Tempel URL/ID spreadsheet lama.', 'Paste the old spreadsheet URL/ID.'), 'warn'); }
    const sheets = $$('[data-sh]', this.el).filter((x) => x.checked).map((x) => x.dataset.sh); if (!sheets.length) return UI.toast(tr('Pilih minimal satu sheet.', 'Pick at least one sheet.'), 'warn');
    if (!dry && !(await UI.confirm(tr('Jalankan import ke database aplikasi ini? Spreadsheet lama tidak diubah.', 'Run the import into this app’s database? The old spreadsheet is not changed.')))) return;
    UI.busy(btn, true, dry ? tr('Memindai…', 'Scanning…') : tr('Mengimpor…', 'Importing…'));
    const r = await API.call(dry ? 'migrasi.scan' : 'migrasi.run', { source: src, sheets, overwrite: $('#mg-ow', this.el).checked }, { noBootRefresh: dry });
    UI.busy(btn, false); if (!r.success) return;
    const d = r.data, rep = d.report || {};
    $('#mg-res', this.el).innerHTML = '<div class="inset mt-8 col gap-8"><div class="row between wrap gap-8"><span class="sb small">' + (d.dryRun ? tr('Hasil pindai', 'Scan result') : tr('Hasil import', 'Import result')) + ' · ' + h(d.source.name) + '</span><span class="pill sm mono ' + (d.dryRun ? 'p-butter' : 'p-ok') + '">' + (d.dryRun ? 'DRY-RUN' : 'DONE') + '</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sheet</th><th class="tr">' + tr('Di sumber', 'In source') + '</th><th class="tr">' + tr('Ditambah', 'Added') + '</th><th class="tr">' + tr('Diperbarui', 'Updated') + '</th><th class="tr">' + tr('Dilewati', 'Skipped') + '</th></tr></thead><tbody>' + Object.keys(rep).map((k) => '<tr><td class="mono xs sb">' + h(k) + (rep[k].catatan ? ' <span class="tert">(' + h(rep[k].catatan) + ')</span>' : '') + '</td><td class="tr num">' + (rep[k].source || 0) + '</td><td class="tr num">' + rep[k].inserted + '</td><td class="tr num">' + rep[k].updated + '</td><td class="tr num">' + rep[k].skipped + '</td></tr>').join('') + '</tbody></table></div>' + ((d.warnings || []).length ? '<ul class="small" style="padding-left:18px;margin:0;color:var(--warn)">' + d.warnings.map((w) => '<li>' + h(w) + '</li>').join('') + '</ul>' : '') + '</div>';
  },
  async csv(btn) {
    const t = $('#csv-t', this.el).value, fs = await Files.pick('.csv,text/csv'); if (!fs[0]) return;
    const rows = Files.csv(await fs[0].text()); if (!rows.length) return UI.toast(tr('CSV kosong.', 'Empty CSV.'), 'warn');
    if (!(await UI.confirm(rows.length + tr(' baris akan diimpor ke ', ' rows will be imported into ') + t + '. ' + tr('Lanjutkan?', 'Continue?')))) return;
    UI.busy(btn, true); const r = await API.call('migrasi.csv', { sheet: t, rows, overwrite: $('#csv-ow', this.el).checked }); UI.busy(btn, false);
    $('#csv-res', this.el).innerHTML = r.success ? '<div class="inset small mt-4">' + ic('check_circle', 'sm') + ' ' + h(r.message) + '</div>' : '';
  },
  csvTpl() { const t = $('#csv-t', this.el).value, k = this.CSV[t]; Files.download('template-' + t + '.csv', '﻿' + k.join(',') + '\n', 'text/csv'); },
  async hapusContoh(btn) {
    if (!(await UI.confirm(tr('Hapus semua data contoh? Tindakan ini tidak bisa dibatalkan (buat backup dulu bila ragu).', 'Delete all sample data? This cannot be undone (make a backup first if unsure).'), { danger: true, ok: tr('Hapus data contoh', 'Delete sample data') }))) return;
    UI.busy(btn, true); const r = await API.call('data.hapusContoh', {}); UI.busy(btn, false);
    if (r.success) { Store.clearCache(); API.mem = {}; App.refreshBoot(true); }
  }
});
