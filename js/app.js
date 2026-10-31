/* ==========================================================================
   DIGITAL CONTENT COPILOT — app.js (shell, login, navigasi, state boot)
   ========================================================================== */
'use strict';
const NAV = [
  { g: 'core', label: ['Core Modules', 'Core Modules'], items: [
    { id: 'dashboard', icon: 'dashboard', mod: '01', l: ['Dashboard', 'Dashboard'] },
    { id: 'onboarding', icon: 'badge', mod: '02', l: ['Onboarding & Profil', 'Onboarding & Profile'] },
    { id: 'strategy', icon: 'psychology', mod: '03', l: ['AI Strategy', 'AI Strategy'], tag: '⚡' },
    { id: 'generator', icon: 'auto_awesome', mod: '04', l: ['Content Generator', 'Content Generator'] },
    { id: 'copy', icon: 'edit_note', mod: '05', l: ['Copy Studio', 'Copy Studio'] },
    { id: 'graphic', icon: 'palette', mod: '06', l: ['Graphic Studio', 'Graphic Studio'] },
    { id: 'repurpose', icon: 'sync_alt', mod: '07', l: ['Repurposing', 'Repurposing'] },
    { id: 'calendar', icon: 'calendar_today', mod: '08', l: ['Kalender & Planner', 'Calendar & Planner'] },
    { id: 'approval', icon: 'verified', mod: '09', l: ['Preview & Approval', 'Preview & Approval'], badge: 'review' }
  ] },
  { g: 'support', label: ['Supporting', 'Supporting'], items: [
    { id: 'templates', icon: 'folder_special', mod: '10', l: ['Template Library', 'Template Library'] },
    { id: 'tasks', icon: 'checklist', mod: '11', l: ['Tugas Harian', 'Daily Tasks'], badge: 'tugas' },
    { id: 'bilingual', icon: 'translate', mod: '12', l: ['Bilingual & Lokal', 'Bilingual & Locale'] },
    { id: 'assets', icon: 'photo_library', mod: '13', l: ['Asset Library', 'Asset Library'] },
    { id: 'learning', icon: 'school', mod: '14', l: ['Learning Center', 'Learning Center'] },
    { id: 'orchestration', icon: 'hub', mod: '15', l: ['AI Orchestration', 'AI Orchestration'] },
    { id: 'settings', icon: 'settings', mod: '16', l: ['Settings & Workspace', 'Settings & Workspace'] }
  ] },
  { g: 'growth', label: ['Growth & CRM', 'Growth & CRM'], items: [
    { id: 'reports', icon: 'monitoring', mod: 'R1', l: ['Laporan Performa', 'Performance'] },
    { id: 'crm', icon: 'contacts', mod: 'R2', l: ['CRM Kontak', 'CRM Contacts'] },
    { id: 'notif', icon: 'campaign', mod: 'R3', l: ['WA & Notifikasi', 'WA & Notifications'] }
  ] }
];
const NAV_FLAT = NAV.reduce((a, g) => a.concat(g.items.map((i) => Object.assign({ group: g.g }, i))), []);
const navLabel = (it) => tr(it.l[0], it.l[1]);

const App = {
  boot: null, cur: null, curId: '', timers: [], loaded: {},
  /* ---------------- Inisialisasi ---------------- */
  init() {
    setLang(LANG);
    if (!API.configured()) return this.showConfig();
    API.warm('app');
    if (Auth.load()) {
      this.boot = Store.get('boot', null);
      this.showShell();
      this.refreshBoot();
    } else this.showLogin();
    window.addEventListener('hashchange', () => { if (Auth.sess) this.route(); });
    setInterval(() => { if (Auth.sess && Activity.due('boot', 60000, 300000)) this.refreshBoot(true); }, 15000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Auth.sess && Activity.due('boot-vis', 30000, 30000)) this.refreshBoot(true); });
    window.addEventListener('online', () => API.setOnline(true));
    window.addEventListener('offline', () => API.setOnline(false));
  },
  showConfig() {
    document.body.innerHTML = '<div class="auth-wrap"><div class="auth-main"><div class="card lg config-warn"><div class="row gap-12 mb-16"><div class="logo">plm.</div><div><div class="brand-name">Copilot. 🍒</div><div class="brand-sub">Konfigurasi belum lengkap</div></div></div>' +
      '<div class="h2 mb-8">Sambungkan ke backend Apps Script</div><p class="muted mb-16">Isi URL Web App <b>/exec</b> di berkas <code>js/config.js</code>, lalu unggah ulang (git push). URL /exec bukan rahasia — keamanan dijaga token sesi di server.</p>' +
      '<div class="code">window.APP_CONFIG = {\n  GAS_URL: \'https://script.google.com/macros/s/ID_DEPLOYMENT/exec\'\n};</div>' +
      '<ol class="muted mt-16" style="line-height:1.8;padding-left:18px"><li>Apps Script → tempel semua berkas .gs → jalankan <b>setupAppEnvironment</b></li><li>Deploy → New deployment → Web app (Execute as: Me · Who has access: Anyone)</li><li>Salin URL /exec ke <code>js/config.js</code> → push ke GitHub Pages</li></ol></div></div></div>';
  },
  /* ---------------- Login ---------------- */
  showLogin(pesan) {
    this.cur = null; this.curId = '';
    const kit = (this.boot && this.boot.kits && this.boot.kits.find((k) => k.Default === 'YA')) || null;
    document.body.innerHTML = '<div class="auth-wrap">' +
      '<div class="marquee flat"><div class="marquee-track">' + [1, 2].map(() => ['Digital Content Copilot', 'AI Studio & Branding Suite', 'Single-Owner Workspace', 'Google Sheets & Apps Script Powered', 'Ready to Create'].map((s) => '<span>' + s + '</span>').join('')).join('') + '</div></div>' +
      '<main class="auth-main"><div class="auth-card page">' +
      '<div class="ribbon">Pro Studio</div>' +
      '<div class="row between gap-12" style="flex-wrap:wrap"><div class="row gap-12"><div class="logo round">plm.</div><div><div class="brand-name">Copilot. 🍒</div><div class="brand-sub">dcc. single-owner</div></div></div>' +
      '<div class="row gap-8" style="margin-right:34px"><span class="pill mono p-sage" id="api-pill"><span class="dot"></span>v' + VER + ' …</span><span class="pill mono p-line hide-sm">Gate_01</span></div></div>' +
      '<div class="divider" style="margin:20px 0"></div>' +
      '<div class="tc"><span class="pill mono p-blush" style="height:32px;padding:0 16px">✦ Creator Studio Access 🌸</span></div>' +
      '<h1 class="auth-title">welcome to <em>digital content</em> copilot.</h1>' +
      '<p class="tc muted" style="font-size:15.5px;margin-bottom:28px">' + tr('AI Social Media Manager & Content Studio untuk kreator solo & pemilik produk digital.', 'AI Social Media Manager & Content Studio for solo creators & digital product owners.') + '</p>' +
      (pesan ? '<div class="pill p-butter" style="height:auto;padding:10px 14px;white-space:normal;margin-bottom:16px;width:100%">' + ic('info', 'sm') + h(pesan) + '</div>' : '') +
      '<form id="login-form" class="col gap-16" novalidate>' +
      '<div class="field"><label for="lg-email">' + tr('Alamat Email', 'Email Address') + ' <span class="opt">' + tr('wajib', 'required') + '</span></label><div class="inp-wrap">' + ic('alternate_email') + '<input class="inp" id="lg-email" name="email" type="email" autocomplete="username" required placeholder="owner@studio.id"></div></div>' +
      '<div class="field"><label for="lg-pass">' + tr('Kata Sandi', 'Password') + ' <span class="pill sm mono p-sage">✦ ' + tr('Terenkripsi', 'Encrypted') + '</span></label><div class="inp-wrap">' + ic('lock') + '<input class="inp" id="lg-pass" name="password" type="password" autocomplete="current-password" required placeholder="••••••••••••"><button type="button" class="icon-btn sm ghost trail" id="lg-eye" aria-label="' + tr('Tampilkan sandi', 'Show password') + '">' + ic('visibility') + '</button></div></div>' +
      '<div class="row between wrap"><label class="check"><input type="checkbox" name="ingat" checked> ' + tr('Ingat saya 30 hari', 'Remember me for 30 days') + '</label><button type="button" class="link-mono" id="lg-forgot">[ ' + tr('Lupa sandi?', 'Forgot password?') + ' ]</button></div>' +
      '<p class="err-text" id="lg-err" hidden></p>' +
      '<button class="btn btn-ink btn-lg btn-block shine" type="submit" id="lg-btn">' + tr('Masuk ke Creator Studio', 'Enter Creator Studio') + ' ' + ic('arrow_forward', 'sm') + ' ✦</button>' +
      '</form>' +
      '<div class="or-line"><span class="pill mono p-line">' + tr('atau lanjut dengan', 'or continue with') + '</span></div>' +
      '<div id="g-btn-wrap"><button class="btn btn-ghost btn-lg btn-block" id="g-btn" type="button"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>' + tr('Lanjut dengan Google Workspace', 'Continue with Google Workspace') + '</button></div>' +
      '<div class="divider" style="margin:24px 0 18px"></div>' +
      '<div class="row between wrap gap-8"><span class="foot-mono row gap-6">' + ic('verified_user', 'sm') + 'OAuth 2.0 · RBAC Single-Owner</span><span class="pill mono p-butter">🌸 Kit: ' + h(kit ? kit.Nama : 'Pastel Glow') + '</span></div>' +
      '</div>' +
      '<div class="row center wrap gap-12 mt-24 foot-mono"><span class="row gap-4"><span class="avatar sm">🍒</span><span class="avatar sm" style="margin-left:-12px;background:var(--sage)">✦</span><span class="avatar sm" style="margin-left:-12px;background:var(--butter)">⚡</span></span><span>' + tr('Data Anda tersimpan di Google Sheets & Drive milik Anda sendiri', 'Your data lives in your own Google Sheets & Drive') + '</span></div>' +
      '<div class="row center wrap gap-16 mt-16 foot-mono"><a href="#" id="lg-doc">' + tr('Dokumentasi', 'Documentation') + '</a><span>•</span><a href="#" id="lg-health">Apps Script Health</a><span>•</span><a href="#" id="lg-lang">' + (LANG === 'en' ? 'Bahasa Indonesia' : 'English') + '</a></div>' +
      '</main><footer class="tc foot-mono" style="padding:16px;border-top:1px solid var(--line)">Digital Content Copilot (dcc.) • Handcrafted for Solo Creators & Digital Product Strategists</footer></div>';
    API.warm('pub');
    const pill = $('#api-pill');
    const cek = async () => {
      const t0 = performance.now();
      try { const r = await fetch(API.url() + '?action=auth.config', { method: 'GET' }); const j = await r.json(); const ms = Math.round(performance.now() - t0);
        pill.innerHTML = '<span class="dot pulse"></span>v' + VER + ' live · ' + ms + 'ms';
        if (!j.data || !j.data.siap) { pill.className = 'pill mono p-butter'; pill.innerHTML = '<span class="dot amber"></span>' + tr('Setup belum jalan', 'Setup pending'); }
        this._authCfg = j.data || {}; this.initGoogle();
      } catch (e) { pill.className = 'pill mono p-danger'; pill.innerHTML = '<span class="dot red"></span>API offline'; }
    };
    cek();
    $('#lg-eye').onclick = () => { const i = $('#lg-pass'); i.type = i.type === 'password' ? 'text' : 'password'; $('#lg-eye').innerHTML = ic(i.type === 'password' ? 'visibility' : 'visibility_off'); };
    $('#lg-forgot').onclick = () => UI.modal({ title: tr('Lupa kata sandi?', 'Forgot password?'), body: '<p class="muted">' + tr('Demi keamanan, sandi pemilik hanya bisa direset dari editor Apps Script (hanya Anda yang punya akses):', 'For security, the owner password can only be reset from the Apps Script editor (only you have access):') + '</p><ol class="mt-12" style="line-height:1.9;padding-left:18px"><li>' + tr('Buka proyek Apps Script', 'Open the Apps Script project') + '</li><li>' + tr('Pilih fungsi', 'Select function') + ' <b class="mono">resetSandiPemilik</b> → ▶ Run</li><li>' + tr('Buka Execution log → salin sandi baru', 'Open Execution log → copy the new password') + '</li><li>' + tr('Masuk lalu ganti sandi di Settings → Keamanan', 'Sign in, then change it in Settings → Security') + '</li></ol>', foot: '<button class="btn btn-ink" data-x>' + tr('Mengerti', 'Got it') + '</button>' });
    $('#lg-health').onclick = (e) => { e.preventDefault(); cek(); UI.toast(tr('Memeriksa koneksi Apps Script…', 'Checking Apps Script…'), 'info'); };
    $('#lg-doc').onclick = (e) => { e.preventDefault(); window.open('PANDUAN-INSTALASI.md', '_blank'); };
    $('#lg-lang').onclick = (e) => { e.preventDefault(); setLang(LANG === 'en' ? 'id' : 'en'); this.showLogin(); };
    $('#login-form').onsubmit = async (e) => {
      e.preventDefault();
      const v = formVals(e.target), err = $('#lg-err');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) || !v.password) { err.hidden = false; err.textContent = tr('Isi email dan kata sandi dengan benar.', 'Enter a valid email and password.'); return; }
      UI.busy($('#lg-btn'), true, tr('Membuka studio…', 'Opening studio…'));
      const r = await API.post('auth.login', { email: v.email, password: v.password, ingat: v.ingat }, { publik: true });
      UI.busy($('#lg-btn'), false);
      if (!r.success) { err.hidden = false; err.textContent = r.message; $('#lg-pass').select(); return; }
      this.afterLogin(r.data, v.ingat);
    };
    setTimeout(() => { const f = $('#lg-email'); if (f && matchMedia('(hover:hover)').matches) f.focus(); }, 80);
  },
  initGoogle() {
    const cid = this._authCfg && this._authCfg.googleClientId, btn = $('#g-btn');
    if (!btn) return;
    if (!cid) { btn.onclick = () => UI.toast(tr('Login Google belum diaktifkan. Isi Google Client ID di Settings → Keamanan.', 'Google login not enabled yet. Add the Client ID in Settings → Security.'), 'info'); return; }
    Lib.load('https://accounts.google.com/gsi/client').then(() => {
      google.accounts.id.initialize({ client_id: cid, callback: async (resp) => {
        const ingat = $('[name=ingat]') ? $('[name=ingat]').checked : true;
        const r = await API.post('auth.google', { idToken: resp.credential, ingat }, { publik: true });
        if (!r.success) { UI.toast(r.message, 'err'); return; }
        this.afterLogin(r.data, ingat);
      } });
      const wrap = $('#g-btn-wrap'); wrap.innerHTML = '<div id="g-real" class="row center"></div>';
      google.accounts.id.renderButton($('#g-real'), { theme: 'outline', size: 'large', shape: 'pill', width: Math.min(460, wrap.clientWidth || 360), text: 'continue_with' });
    }).catch(() => { btn.onclick = () => UI.toast(tr('Gagal memuat Google Sign-In.', 'Failed to load Google Sign-In.'), 'err'); });
  },
  afterLogin(d, ingat) {
    Auth.save(d, ingat);
    if (d.boot) this.setBoot(d.boot, true);
    this.showShell();
    UI.toast(tr('Selamat datang kembali, ', 'Welcome back, ') + ((d.me && d.me.nama) || 'Studio Director') + ' 🍒', 'ok');
    if (!d.boot) this.refreshBoot();
  },
  async logout() {
    API.post('auth.logout', {});
    Auth.clear(); this.boot = null;
    this.showLogin(tr('Anda telah keluar.', 'You have signed out.'));
  },
  /* ---------------- Boot (state global) ---------------- */
  setBoot(b, quiet) {
    this.boot = b;
    Store.set('boot', b);
    const me = b.me || {};
    if (me.BahasaUI && me.BahasaUI !== LANG && !Store.get('langManual', false)) setLang(me.BahasaUI);
    if (!quiet) this.paintShellState();
  },
  async refreshBoot(silent) {
    const r = await API.read('boot', {});
    if (!r.success) { if (!silent && !this.boot && r.code !== 'AUTH') UI.toast(r.message, 'err'); return; }
    const berubah = JSON.stringify(r.data.stats) + JSON.stringify(r.data.kits) + JSON.stringify(r.data.tugas) + JSON.stringify(r.data.jadwal) + JSON.stringify(r.data.me) !==
      (this.boot ? JSON.stringify(this.boot.stats) + JSON.stringify(this.boot.kits) + JSON.stringify(this.boot.tugas) + JSON.stringify(this.boot.jadwal) + JSON.stringify(this.boot.me) : '');
    const pertama = !this.boot;
    this.setBoot(r.data);
    if (pertama && !this.curId) this.route();
    if (berubah && this.cur && this.cur.onBoot) { try { this.cur.onBoot(r.data); } catch (e) { console.error(e); } }
  },
  refreshBootSoon: debounce(function () { App.refreshBoot(true); }, 900),
  kits() { return ((this.boot && this.boot.kits) || []).filter((k) => k.Status !== 'Arsip'); },
  kitId() { const s = Store.get('kit', ''), ks = this.kits(); return (ks.find((k) => k.ID === s) || ks.find((k) => k.Default === 'YA') || ks[0] || {}).ID || ''; },
  kit(id) { return this.kits().find((k) => k.ID === (id || this.kitId())) || this.kits()[0] || null; },
  produk() { return ((this.boot && this.boot.produk) || []).filter((p) => p.Status !== 'Arsip'); },
  set(k, d) { return ((this.boot && this.boot.settings) || {})[k] || d || ''; },
  profil(kitId) { const ps = (this.boot && this.boot.profil) || []; return ps.find((p) => p.KitID === (kitId || this.kitId())) || ps[0] || null; },
  pilar(kitId) { const p = this.profil(kitId); return pj(p && p.PilarKonten, []); },
  /* ---------------- Shell ---------------- */
  showShell() {
    document.body.innerHTML = '<div id="offline" class="offline" hidden>' + tr('Offline — menampilkan data tersimpan. Perubahan akan gagal sampai koneksi kembali.', 'Offline — showing cached data. Changes will fail until you reconnect.') + '</div>' +
      '<div class="app"><aside class="sidebar" id="sidebar" aria-label="Navigasi"><div><div class="brand"><a href="#/dashboard" class="row gap-10" style="gap:10px"><div class="logo">plm.</div><div><div class="row gap-6"><span class="brand-name">Copilot.</span><span>🍒</span></div><div class="brand-sub">Pastel Studio v' + VER + '</div></div></a><span class="pill sm mono p-blush">Pro ✦</span></div>' +
      NAV.map((g) => '<div class="nav"><div class="nav-h"><span class="label">' + h(tr(g.label[0], g.label[1])) + '</span><span class="count">' + ('0' + g.items.length).slice(-2) + '</span></div>' +
        g.items.map((it) => '<a href="#/' + it.id + '" data-nav="' + it.id + '">' + ic(it.icon) + '<span class="clamp-1">' + h(navLabel(it)) + '</span>' + (it.badge ? '<span class="badge-n" data-badge="' + it.badge + '" hidden></span>' : it.tag ? '<span class="tag">' + it.tag + '</span>' : '') + '</a>').join('') + '</div>').join('') +
      '</div><div class="side-foot"><div class="sys"><div class="row gap-8"><span class="dot pulse" id="sys-dot"></span><span class="mono xs sb" id="sys-txt">API: …</span></div><span class="pill sm mono p-sage" id="sys-ms">—</span></div>' +
      '<button class="nav-btn row between w-100" id="btn-logout" style="padding:9px 12px;border-radius:999px"><span class="row gap-8">' + ic('logout', 'sm') + tr('Keluar', 'Log Out') + '</span><span class="mono xs tert">⌥Q</span></button></div></aside>' +
      '<div class="scrim" id="scrim"></div>' +
      '<div class="main"><header class="topbar"><div class="row gap-12" style="min-width:0">' +
      '<button class="icon-btn show-sm-md" id="btn-menu" aria-label="Menu">' + ic('menu') + '</button>' +
      '<div class="kit-switch" title="' + tr('Branding Kit aktif untuk konten baru', 'Active Branding Kit for new content') + '"><span>🌸</span><select id="kit-sel" aria-label="Branding Kit"></select><span class="kit-dot" id="kit-dot"></span></div>' +
      '<span class="pill mono p-sage hide-md" id="ai-pill" style="cursor:pointer">✦ AI …</span></div>' +
      '<div class="row gap-12"><button class="pill mono p-blush hide-sm" id="btn-lang" title="' + tr('Bahasa antarmuka', 'Interface language') + '">💬 ' + (LANG === 'en' ? 'EN' : 'ID') + '</button>' +
      '<button class="icon-btn" id="btn-bell" aria-label="' + tr('Notifikasi', 'Notifications') + '">' + ic('notifications') + '<span class="n" id="bell-n" hidden></span></button><span class="vsep hide-sm"></span>' +
      '<a href="#/settings" class="row gap-10" style="gap:10px"><div class="tr hide-sm"><div class="h4" id="me-name" style="font-size:15px">Studio Director</div><div class="row end gap-4"><span class="dot"></span><span class="mono xs sage-ink" style="color:var(--sage-mid);font-weight:600">Owner ✦</span></div></div><div class="avatar" id="me-av">🍒</div></a></div></header>' +
      '<main class="view" id="view" tabindex="-1"></main></div>' +
      '<nav class="bottom-nav" aria-label="Navigasi cepat"><a href="#/dashboard" data-bn="dashboard">' + ic('dashboard') + tr('Beranda', 'Home') + '</a><a href="#/generator" data-bn="generator">' + ic('auto_awesome') + tr('Buat', 'Create') + '</a>' +
      '<button class="fab" id="btn-fab" aria-label="' + tr('Aksi cepat', 'Quick actions') + '">' + ic('add', 'lg') + '</button><a href="#/calendar" data-bn="calendar">' + ic('calendar_today') + tr('Kalender', 'Calendar') + '</a><button id="btn-more" data-bn="more">' + ic('apps') + tr('Menu', 'Menu') + '</button></nav></div>';
    const css = document.createElement('style');
    css.textContent = '.show-sm-md{display:none}@media(max-width:1023px){.show-sm-md{display:grid}}.nav-btn:hover{background:#fff}';
    document.head.appendChild(css);
    const side = $('#sidebar'), scrim = $('#scrim');
    const tutup = () => { side.classList.remove('on'); scrim.classList.remove('on'); };
    $('#btn-menu').onclick = $('#btn-more').onclick = () => { side.classList.add('on'); scrim.classList.add('on'); };
    scrim.onclick = tutup;
    side.addEventListener('click', (e) => { if (e.target.closest('a')) tutup(); });
    $('#btn-logout').onclick = () => this.logout();
    document.addEventListener('keydown', (e) => { if (e.altKey && (e.key === 'q' || e.key === 'Q' || e.code === 'KeyQ')) this.logout(); });
    $('#kit-sel').onchange = (e) => { Store.set('kit', e.target.value); this.paintShellState(); UI.toast(tr('Kit aktif: ', 'Active kit: ') + (this.kit(e.target.value) || {}).Nama, 'ok'); if (this.cur && this.cur.onKit) this.cur.onKit(e.target.value); };
    $('#btn-lang').onclick = () => { setLang(LANG === 'en' ? 'id' : 'en'); Store.set('langManual', true); API.call('lokal.save', { BahasaUI: LANG }, { toast: false, silent: true }); this.showShell(); };
    $('#btn-bell').onclick = (e) => this.showNotif(e.currentTarget);
    $('#ai-pill').onclick = () => Router.go('orchestration');
    $('#btn-fab').onclick = (e) => UI.pop(e.currentTarget, [
      { icon: 'auto_awesome', label: tr('Buat konten baru', 'New content'), fn: () => Router.go('generator') },
      { icon: 'edit_note', label: tr('10 hook cepat', '10 quick hooks'), fn: () => Router.go('copy') },
      { icon: 'event', label: tr('Jadwalkan konten', 'Schedule content'), fn: () => Router.go('calendar') },
      { icon: 'add_task', label: tr('Tambah tugas', 'Add task'), fn: () => Router.go('tasks', { tambah: 1 }) }
    ]);
    this.paintShellState();
    this.route();
    this.prefetch();
  },
  paintShellState() {
    const b = this.boot; if (!b || !$('#kit-sel')) return;
    const kits = this.kits(), kid = this.kitId(), k = this.kit(kid);
    $('#kit-sel').innerHTML = kits.map((x) => '<option value="' + h(x.ID) + '"' + (x.ID === kid ? ' selected' : '') + '>Kit: ' + h(x.Nama) + (x.Default === 'YA' ? ' (Default)' : '') + '</option>').join('');
    $('#kit-dot').style.background = (k && k.WarnaPrimer) || 'var(--rose)';
    const me = b.me || {};
    $('#me-name').textContent = me.Nama || 'Studio Director';
    $('#me-av').textContent = me.Avatar || '🍒';
    const ai = b.ai || {};
    $('#ai-pill').innerHTML = '✦ AI: ' + h(ai.provider === 'template' || !ai.provider ? tr('Mode Template', 'Template Mode') : ai.label) + ' <span class="dot ' + (ai.siap === false ? 'amber' : '') + '"></span>';
    const rv = (b.stats && b.stats.review) || 0, tg = (b.tugas || []).filter((t) => t.Status !== 'Selesai' && t.Tanggal === b.hariIni).length;
    $$('[data-badge]').forEach((el) => { const n = el.dataset.badge === 'review' ? rv : tg; el.hidden = !n; el.textContent = n; });
    const notif = this.notifList();
    $('#bell-n').hidden = !notif.length; $('#bell-n').textContent = notif.length;
    const last = Perf.last;
    $('#sys-txt').textContent = API.online ? tr('Sistem: Aktif', 'System: Active') : 'Offline';
    $('#sys-dot').className = 'dot pulse' + (API.online ? '' : ' red');
    $('#sys-ms').textContent = last && last.s ? last.s + 'ms' : 'GAS';
  },
  notifList() {
    const b = this.boot || {}, out = [], now = Date.now();
    (b.jadwal || []).filter((j) => j.Status === 'Terjadwal').forEach((j) => { const t = Fmt.ms(j.Tanggal, j.Jam); if (t > now && t - now < 24 * 3600e3) out.push({ icon: 'schedule', c: 'sage', t: tr('Tayang ', 'Goes live ') + Fmt.rel(new Date(t).toISOString()) + ': ' + j.Judul, s: j.Platform + ' · ' + j.Jam + ' WIB', go: ['calendar'] }); });
    const rv = (b.stats && b.stats.review) || 0; if (rv) out.push({ icon: 'verified', c: 'blush', t: rv + tr(' konten menunggu review', ' items awaiting review'), s: 'Preview & Approval', go: ['approval'] });
    const p1 = (b.tugas || []).filter((t) => t.Status !== 'Selesai' && t.Prioritas === 'P1').length; if (p1) out.push({ icon: 'bolt', c: 'butter', t: p1 + tr(' tugas prioritas P1 hari ini', ' P1 tasks today'), s: 'Anti-Mager Workflow', go: ['tasks'] });
    if ((b.me || {}).Onboarding !== 'SELESAI') out.push({ icon: 'badge', c: 'lav', t: tr('Lengkapi Brand DNA agar AI menulis sesuai brand Anda', 'Complete your Brand DNA so AI writes in your voice'), s: 'Onboarding & Profile', go: ['onboarding'] });
    if (b.ai && b.ai.siap === false) out.push({ icon: 'key', c: 'butter', t: tr('Provider AI dipilih tetapi API key belum diisi', 'AI provider selected but API key missing'), s: 'AI Orchestration', go: ['orchestration'] });
    return out;
  },
  showNotif(anchor) {
    const list = this.notifList();
    const d = UI.drawer({ title: tr('Notifikasi', 'Notifications'), kicker: list.length + tr(' perlu perhatian', ' need attention'), body: list.length ? '<div class="col gap-4">' + list.map((n, i) => '<button class="notif-item w-100" style="text-align:left" data-i="' + i + '"><span class="ico-dot sm ' + n.c + '">' + ic(n.icon, 'sm') + '</span><span class="grow"><span class="sb" style="display:block">' + h(n.t) + '</span><span class="xs muted">' + h(n.s) + '</span></span>' + ic('chevron_right', 'sm') + '</button>').join('') + '</div>' : UI.empty('notifications_off', tr('Semua beres ✦', 'All clear ✦'), tr('Tidak ada yang mendesak saat ini.', 'Nothing urgent right now.')) });
    d.el.onclick = (e) => { const b = e.target.closest('[data-i]'); if (!b) return; d.close(); const n = list[+b.dataset.i]; Router.go(n.go[0], n.go[1]); };
  },
  /* ---------------- Routing & halaman ---------------- */
  route() {
    const { page, params } = Router.parse();
    const id = NAV_FLAT.find((n) => n.id === page) ? page : 'dashboard';
    this.open(id, params);
  },
  async open(id, params) {
    const view = $('#view'); if (!view) return;
    if (this.cur && this.cur.destroy) { try { this.cur.destroy(); } catch (e) { console.error(e); } }
    this.timers.forEach(clearInterval); this.timers = [];
    $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === id));
    $$('[data-bn]').forEach((a) => a.classList.toggle('on', a.dataset.bn === id));
    this.curId = id; this.cur = null;
    const it = NAV_FLAT.find((n) => n.id === id);
    document.title = navLabel(it) + ' · Digital Content Copilot';
    if (!Pages.defs[id]) {
      view.innerHTML = '<div class="page"><div class="sk" style="height:42px;border-radius:999px;margin-bottom:22px"></div><div class="grid g3">' + UI.sk(3) + '</div></div>';
      try { await this.loadPage(id); } catch (e) { view.innerHTML = UI.empty('wifi_off', tr('Gagal memuat modul', 'Failed to load module'), h(e.message), '<button class="btn btn-ink" onclick="location.reload()">' + tr('Muat ulang', 'Reload') + '</button>'); return; }
      if (this.curId !== id) return;
    }
    const def = Pages.defs[id], page = Object.create(def);
    this.cur = page;
    const mq = (def.marquee ? def.marquee() : null) || [it.mod + ' // ' + navLabel(it), 'Synced with Google Sheets', 'Digital Content Copilot'];
    view.innerHTML = '<div class="marquee"><div class="marquee-track">' + [1, 2].map(() => mq.map((s) => '<span>' + h(s) + '</span>').join('')).join('') + '</div></div><div class="page" id="page"></div>' +
      '<div class="page-foot"><span>plm. copilot studio architecture · ' + (it.group === 'core' ? 'core' : it.group === 'growth' ? 'growth' : 'supporting') + ' module ' + it.mod + '</span><span>' + tr('semua sistem berjalan', 'all systems operational') + ' ✦</span></div>';
    window.scrollTo(0, 0);
    try { page.render($('#page'), params || {}); }
    catch (e) { console.error(e); $('#page').innerHTML = UI.empty('bug_report', tr('Terjadi kesalahan tampilan', 'Display error'), h(e.message)); }
  },
  pageFile: { dashboard: 'dashboard', onboarding: 'onboarding', strategy: 'strategy', generator: 'generator', copy: 'copy', graphic: 'graphic', repurpose: 'repurpose', calendar: 'calendar', approval: 'approval', templates: 'templates', tasks: 'tasks', bilingual: 'bilingual', assets: 'assets', learning: 'learning', orchestration: 'orchestration', settings: 'settings', reports: 'reports', crm: 'crm', notif: 'notif' },
  loadPage(id) { return Lib.load('js/pages/' + this.pageFile[id] + '.js?v=' + VER); },
  need(lib) { return Lib.load('js/ui/' + lib + '.js?v=' + VER); },
  prefetch() {
    const ids = Object.keys(this.pageFile), idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
    let i = 0;
    const next = () => { if (i >= ids.length) { this.need('engine').catch(() => {}); return; } const id = ids[i++]; if (Pages.defs[id]) return next(); this.loadPage(id).catch(() => {}).finally(() => idle(next)); };
    setTimeout(() => idle(next), 1500);
  },
  every(fn, ms) { const t = setInterval(fn, ms); this.timers.push(t); return t; },
  /** helper: header halaman bergaya editorial */
  hero(o) {
    return '<section class="card lg hero rel ' + (o.cls || '') + '">' + (o.word ? '<div class="bg-word hide-sm">' + h(o.word) + '</div>' : '') +
      '<div class="row between top wrap gap-24 rel"><div style="max-width:780px" class="col gap-12">' + (o.pills ? '<div class="row wrap gap-8">' + o.pills + '</div>' : '') +
      '<h1 class="display">' + o.title + '</h1>' + (o.sub ? '<p class="lead">' + o.sub + '</p>' : '') + '</div>' + (o.side ? '<div class="col gap-10 hero-side">' + o.side + '</div>' : '') + '</div>' +
      (o.actions ? '<div class="row wrap gap-12 mt-24 rel">' + o.actions + '</div>' : '') + (o.strip ? '<div class="hero-strip">' + o.strip + '</div>' : '') + '</section>';
  }
};
/* Aksi bersama lintas halaman */
const Shared = {
  jadwal(k, done) {
    const besok = Fmt.addDays(Fmt.today(), 1);
    const m = UI.modal({ title: tr('Jadwalkan publikasi', 'Schedule publication'), kicker: 'Calendar & Planner', size: 'sm',
      body: '<form class="col gap-12" id="jd"><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Tanggal', 'Date') + '</label><input class="inp" type="date" name="Tanggal" value="' + besok + '" min="' + Fmt.today() + '"></div><div class="field"><label>' + tr('Jam (WIB)', 'Time (WIB)') + '</label><input class="inp" type="time" name="Jam" value="09:00"></div></div><div class="field"><label>Platform</label><select class="sel" name="Platform">' + opts(PLATFORM, k.Platform || 'Instagram') + '</select></div><div class="field"><label>' + tr('Catatan', 'Notes') + '</label><input class="inp" name="Catatan"></div><p class="xs muted">' + tr('Pengingat WA/email dikirim sebelum jam tayang (atur di WA & Notifikasi).', 'WA/email reminders are sent before go-live (configure in WA & Notifications).') + '</p></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="jd-ok">' + ic('event_available', 'sm') + tr('Jadwalkan', 'Schedule') + '</button>' });
    $('#jd-ok', m.el.parentNode).onclick = async (e) => { UI.busy(e.currentTarget, true); const r = await API.call('kalender.save', Object.assign(formVals($('#jd', m.el)), { KontenID: k.ID })); UI.busy(e.currentTarget, false); if (r.success) { m.close(); if (done) done(r.data); } };
  }
};

/* Form produk dipakai bersama (dashboard & onboarding) */
const Produk = {
  form(p, done) {
    p = p || {};
    const m = UI.modal({ title: p.ID ? tr('Edit produk digital', 'Edit digital product') : tr('Tautkan produk digital baru', 'Link a new digital product'), kicker: 'Digital Monetization Hub',
      body: '<form class="col gap-16" id="pf"><div class="field"><label>' + tr('Nama produk', 'Product name') + '</label><input class="inp" name="Nama" required value="' + h(p.Nama || '') + '" placeholder="Digital Creator E-Book 2026"></div>' +
        '<div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Jenis', 'Type') + '</label><input class="inp" name="Jenis" list="jenis-produk" value="' + h(p.Jenis || 'E-Book') + '"><datalist id="jenis-produk">' + ['E-Book', 'Template Canva', 'Template Notion', 'Planner Notion', 'Worksheet', 'Teacher Kit', 'Kelas Online', 'Preset', 'Membership'].map((x) => '<option value="' + x + '">').join('') + '</datalist></div><div class="field"><label>' + tr('Harga (Rp)', 'Price (IDR)') + '</label><input class="inp" name="Harga" inputmode="numeric" value="' + h(p.Harga || '') + '" placeholder="99000"></div></div>' +
        '<div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Peran di funnel', 'Funnel role') + '</label><select class="sel" name="Peran">' + opts(['Lead Magnet', 'Core Offer', 'Niche Bundle', 'Upsell', 'Kelas', 'Membership'], p.Peran || 'Core Offer') + '</select></div><div class="field"><label>' + tr('Terjual', 'Sold') + '</label><input class="inp" name="Terjual" inputmode="numeric" value="' + h(p.Terjual || 0) + '"></div></div>' +
        '<div class="field"><label>' + tr('Target pembeli', 'Target buyer') + '</label><input class="inp" name="TargetPembeli" value="' + h(p.TargetPembeli || '') + '"></div>' +
        '<div class="field"><label>' + tr('Pemicu hook / kata kunci CTA', 'Hook trigger / CTA keyword') + '</label><input class="inp" name="HookTrigger" value="' + h(p.HookTrigger || '') + '" placeholder="' + tr('Roadmap penghasilan pertama — ketik &quot;CREATOR&quot;', 'Roadmap to your first income — type &quot;CREATOR&quot;') + '"></div>' +
        '<div class="field"><label>' + tr('Link produk', 'Product link') + ' <span class="opt">https://</span></label><input class="inp" name="Link" type="url" value="' + h(p.Link || '') + '" placeholder="https://lynk.id/…"></div>' +
        '<div class="field"><label>' + tr('Deskripsi singkat', 'Short description') + '</label><textarea class="ta" name="Deskripsi" rows="3">' + h(p.Deskripsi || '') + '</textarea></div>' +
        '<div class="field"><label>Branding Kit</label><select class="sel" name="KitID">' + opts(App.kits().map((k) => ({ v: k.ID, l: k.Nama })), p.KitID || App.kitId()) + '</select></div>' +
        (p.ID ? '<div class="field"><label>' + tr('Link form lead magnet (bagikan di bio)', 'Lead magnet form link (share in bio)') + ' <span class="opt mono">' + h(p.ID) + '</span></label><div class="row gap-6"><input class="inp sm mono" id="pf-lead" readonly value="' + h(location.origin + location.pathname.replace(/index\.html$/, '') + 'lead.html?p=' + encodeURIComponent(p.ID) + '&src=bio') + '"><button type="button" class="btn btn-ghost btn-sm" id="pf-copy">' + ic('content_copy', 'sm') + tr('Salin', 'Copy') + '</button></div></div>' : '') + '</form>',
      foot: (p.ID ? '<button class="btn btn-danger" id="pf-del">' + ic('delete', 'sm') + tr('Hapus', 'Delete') + '</button><span class="grow"></span>' : '') + '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="pf-save">' + tr('Simpan Produk', 'Save Product') + '</button>' });
    const root = m.el.parentNode;
    if (p.ID) $('#pf-copy', m.el).onclick = () => { const i = $('#pf-lead', m.el); i.select(); try { navigator.clipboard.writeText(i.value); } catch (e) { document.execCommand('copy'); } UI.toast(tr('Link lead disalin.', 'Lead link copied.'), 'ok'); };
    $('#pf-save', root).onclick = async (e) => {
      const v = formVals($('#pf', m.el)); if (!v.Nama) return UI.toast(tr('Nama produk wajib diisi.', 'Product name is required.'), 'warn');
      if (p.ID) v.ID = p.ID;
      UI.busy(e.currentTarget, true); const r = await API.call('produk.save', v); UI.busy(e.currentTarget, false);
      if (r.success) { m.close(); if (done) done(r.data); }
    };
    if (p.ID) $('#pf-del', root).onclick = async () => { if (!(await UI.confirm(tr('Hapus produk "' + h(p.Nama) + '"? Konten lama tetap aman.', 'Delete "' + h(p.Nama) + '"? Existing content stays safe.'), { danger: true }))) return; const r = await API.call('produk.delete', { id: p.ID }); if (r.success) { m.close(); if (done) done(null); } };
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
