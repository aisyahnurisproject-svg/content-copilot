/* ==========================================================================
   DIGITAL CONTENT COPILOT — core.js
   Utilitas, i18n inline, penyimpanan lokal aman, klien API turbo (dedupe,
   batch otomatis, SWR, epoch tulis, drain antrean, warmup), UI kit (toast,
   modal, drawer, konfirmasi), router hash, chart SVG ringan, markdown mini.
   ========================================================================== */
'use strict';
const VER = '1.0.0';
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const h = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (name, cls) => '<span class="ms ' + (cls || '') + '" aria-hidden="true">' + name + '</span>';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 9);
function debounce(fn, ms) { let t; return function () { const a = arguments, s = this; clearTimeout(t); t = setTimeout(() => fn.apply(s, a), ms); }; }
function pj(s, d) { if (s === null || s === undefined || s === '') return d; if (typeof s === 'object') return s; try { return JSON.parse(s); } catch (e) { return d; } }

/* ---------- Penyimpanan lokal (selalu try/catch: private mode bisa melempar) ---------- */
const Store = {
  p: 'dcc.',
  get(k, d) { try { const v = localStorage.getItem(this.p + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(this.p + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(this.p + k); } catch (e) { /* abaikan */ } },
  sget(k, d) { try { const v = sessionStorage.getItem(this.p + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  sset(k, v) { try { sessionStorage.setItem(this.p + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
  sdel(k) { try { sessionStorage.removeItem(this.p + k); } catch (e) { /* abaikan */ } },
  clearCache() { try { Object.keys(localStorage).filter((k) => k.indexOf(this.p + 'c.') === 0).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* abaikan */ } }
};

/* ---------- Bahasa antarmuka (inline: tr('Indonesia', 'English')) ---------- */
let LANG = Store.get('lang', 'id');
const tr = (id, en) => (LANG === 'en' && en !== undefined ? en : id);
function setLang(l) { LANG = l === 'en' ? 'en' : 'id'; Store.set('lang', LANG); document.documentElement.lang = LANG; }
const ST_EN = { Draf: 'Draft', Review: 'In Review', Revisi: 'Revision', Disetujui: 'Approved', Terjadwal: 'Scheduled', Terbit: 'Published', Arsip: 'Archived', Tertunda: 'Pending', Batal: 'Cancelled', Menunggu: 'Waiting', Ditolak: 'Rejected', Belum: 'To do', Selesai: 'Done', Proses: 'Processing', Antri: 'Queued', Terkirim: 'Sent', Gagal: 'Failed', Aktif: 'Active', Baru: 'New', Dipakai: 'Used', Berjalan: 'Running', Dihentikan: 'Stopped', Dibaca: 'Reading' };
const stLabel = (s) => (LANG === 'en' ? ST_EN[s] || s : s);
const ST_PILL = { Draf: 'p-line', Review: 'p-blush', Revisi: 'p-butter', Disetujui: 'p-sage', Terjadwal: 'p-sage2', Terbit: 'p-ok', Arsip: 'p-line', Tertunda: 'p-butter', Batal: 'p-danger', Menunggu: 'p-blush', Ditolak: 'p-danger', Antri: 'p-butter', Proses: 'p-lav', Terkirim: 'p-ok', Gagal: 'p-danger', Berjalan: 'p-lav', Selesai: 'p-ok', Dihentikan: 'p-line', Baru: 'p-blush', Dipakai: 'p-line' };
const stPill = (s, extra) => '<span class="pill sm mono ' + (ST_PILL[s] || 'p-line') + ' ' + (extra || '') + '">' + h(stLabel(s)) + '</span>';

/* ---------- Format tanggal/angka (zona Asia/Jakarta) ---------- */
const TZ = 'Asia/Jakarta';
const _ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const _hm = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const Fmt = {
  today: () => _ymd.format(new Date()),
  ymd: (d) => _ymd.format(d instanceof Date ? d : new Date(d)),
  hm: (d) => _hm.format(d instanceof Date ? d : new Date(d)),
  addDays(ymd, n) { const [y, m, d] = String(ymd).split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d + n, 5)); return t.toISOString().slice(0, 10); },
  dow(ymd) { const [y, m, d] = String(ymd).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 5)).getUTCDay(); },
  mondayOf(ymd) { const w = Fmt.dow(ymd); return Fmt.addDays(ymd, -((w + 6) % 7)); },
  ms(tgl, jam) { const t = new Date(String(tgl) + 'T' + (jam || '09:00') + ':00+07:00').getTime(); return isNaN(t) ? 0 : t; },
  loc: () => (LANG === 'en' ? 'en-GB' : 'id-ID'),
  tgl(ymd, o) { if (!ymd) return '-'; const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number); if (!y) return String(ymd); return new Intl.DateTimeFormat(Fmt.loc(), Object.assign({ day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }, o || {})).format(new Date(Date.UTC(y, m - 1, d, 5))); },
  hari(ymd, panjang) { return Fmt.tgl(ymd, { weekday: panjang ? 'long' : 'short', day: undefined, month: undefined, year: undefined }); },
  bulan(ym) { return Fmt.tgl(ym + '-01', { day: undefined, month: 'long', year: 'numeric' }); },
  dt(iso) { if (!iso) return '-'; const d = new Date(iso); return isNaN(d) ? String(iso) : new Intl.DateTimeFormat(Fmt.loc(), { timeZone: TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d); },
  rel(iso) {
    const t = new Date(iso).getTime(); if (!t) return '-';
    const s = Math.round((Date.now() - t) / 1000), a = Math.abs(s), f = s >= 0;
    const u = a < 60 ? [a, tr('dtk', 's')] : a < 3600 ? [Math.round(a / 60), tr('mnt', 'm')] : a < 86400 ? [Math.round(a / 3600), tr('jam', 'h')] : [Math.round(a / 86400), tr('hari', 'd')];
    return f ? u[0] + ' ' + u[1] + ' ' + tr('lalu', 'ago') : tr('dalam ', 'in ') + u[0] + ' ' + u[1];
  },
  n(v) { return new Intl.NumberFormat(Fmt.loc()).format(Number(v) || 0); },
  k(v) { v = Number(v) || 0; return v >= 1e6 ? (v / 1e6).toFixed(1).replace('.0', '') + (LANG === 'en' ? 'M' : 'jt') : v >= 1e3 ? (v / 1e3).toFixed(1).replace('.0', '') + 'k' : String(Math.round(v)); },
  rp(v) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(Number(v) || 0)); },
  bytes(b) { b = Number(b) || 0; return b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : b > 1e3 ? Math.round(b / 1e3) + ' KB' : b + ' B'; },
  pct: (a, b) => (b ? Math.round((100 * a) / b) : 0)
};

/* ---------- Pengukur performa (Perf.table() di console) ---------- */
const Perf = {
  log: [],
  push(e) { this.log.push(e); if (this.log.length > 300) this.log.shift(); },
  table() { console.table(this.log.slice(-40).map((e) => ({ aksi: e.a, total_ms: e.t, server_ms: e.s, net_ms: e.t - (e.s || 0), cache: e.c ? '✓' : '', batch: e.b || '' }))); },
  summary() { const m = {}; this.log.forEach((e) => { (m[e.a] = m[e.a] || []).push(e.t); }); console.table(Object.keys(m).map((a) => ({ aksi: a, n: m[a].length, rata_ms: Math.round(m[a].reduce((x, y) => x + y, 0) / m[a].length) }))); },
  last: null
};
window.Perf = Perf;

/* ---------- Klien API (fetch text/plain → GAS /exec, tanpa preflight CORS) ---------- */
const API = {
  epoch: 0, inflight: {}, mem: {}, drainT: null, drainN: 0, online: true,
  url() { return (window.APP_CONFIG && window.APP_CONFIG.GAS_URL) || ''; },
  configured() { const u = this.url(); return /^https:\/\/script\.google(usercontent)?\.com\/.+\/exec/.test(u) && !/GANTI|XXXX/.test(u) || /^http:\/\/(localhost|127\.0\.0\.1)/.test(u); },
  token() { return (Auth.sess && Auth.sess.token) || ''; },
  isLong: (a) => /generate|hooks|caption|rewrite|aiCheck|translate|prompt|gambar|repurpose|saran|ai\.test|ai\.models|migrasi|backup|gcal|ekspor|upload|blastProcess|processNow|validate/.test(a),
  async post(action, data, opt) {
    opt = opt || {};
    const t0 = performance.now(), ctl = new AbortController(), to = setTimeout(() => ctl.abort(), opt.timeout || (this.isLong(action) ? 150000 : 45000));
    let j;
    try {
      const r = await fetch(this.url(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: opt.publik ? '' : this.token(), data: data || {} }), signal: ctl.signal, redirect: 'follow' });
      const txt = await r.text();
      try { j = JSON.parse(txt); } catch (e) { j = { success: false, code: 'BADJSON', message: tr('Server membalas bukan JSON. Pastikan deployment Web App "Anyone" & URL /exec benar.', 'Server did not return JSON. Check the Web App "Anyone" deployment & /exec URL.') }; }
      this.setOnline(true);
    } catch (e) {
      j = { success: false, code: e.name === 'AbortError' ? 'TIMEOUT' : 'NET', message: e.name === 'AbortError' ? tr('Server terlalu lama merespons. Coba lagi.', 'Server took too long. Please retry.') : tr('Tidak bisa terhubung ke server. Periksa koneksi internet.', 'Cannot reach the server. Check your connection.') };
      if (j.code === 'NET') this.setOnline(false);
    } finally { clearTimeout(to); }
    const t = Math.round(performance.now() - t0);
    Perf.push({ a: action, t, s: j.ms, c: !!j.cached, b: opt.batchN });
    Perf.last = { a: action, t, s: j.ms, at: Date.now() };
    if (j.code === 'AUTH' && !opt.publik && action !== 'auth.login') { Auth.expired(); }
    if (j.nq > 0) this.scheduleDrain();
    return j;
  },
  setOnline(v) { if (this.online === v) return; this.online = v; const b = $('#offline'); if (b) b.hidden = v; },
  key(a, d) { return a + '|' + JSON.stringify(d || {}); },
  /** baca: dedupe in-flight + digabung ke batch otomatis */
  read(action, data, opt) {
    const k = this.epoch + '|' + this.key(action, data);
    if (this.inflight[k]) return this.inflight[k];
    const p = (opt && opt.noBatch) ? this.post(action, data, opt) : Batcher.add(action, data);
    this.inflight[k] = p;
    p.then(() => delete this.inflight[k], () => delete this.inflight[k]);
    return p.then((r) => { if (r && r.success) this.remember(action, data, r.data); return r; });
  },
  /** tulis: epoch naik → baca berikutnya tidak menumpang data lama; semua cache ditandai basi */
  async call(action, data, opt) {
    opt = opt || {};
    this.epoch++;
    const r = await this.post(action, data, opt);
    if (r.success) { this.markStale(); if (!opt.noBootRefresh && typeof App !== 'undefined') App.refreshBootSoon(); }
    if (!r.success && !opt.silent && r.code !== 'AUTH') UI.toast(r.message || tr('Gagal.', 'Failed.'), 'err');
    if (r.success && opt.toast !== false && r.message) UI.toast(r.message, 'ok');
    return r;
  },
  /* ----- cache respons: memori + localStorage (stale-while-revalidate) ----- */
  ck(a, d) { let x = 0; const s = this.key(a, d); for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return 'c.' + a + '.' + x.toString(36); },
  remember(a, d, data) {
    const k = this.ck(a, d), e = { at: Date.now(), data, stale: false };
    this.mem[k] = e;
    try { const s = JSON.stringify(e); if (s.length < 350000) Store.set(k, e); } catch (err) { /* kuota penuh — cukup di memori */ }
  },
  cached(a, d) { const k = this.ck(a, d); return this.mem[k] || (this.mem[k] = Store.get(k, null)) || null; },
  markStale() { Object.keys(this.mem).forEach((k) => { if (this.mem[k]) this.mem[k].stale = true; }); this.staleAt = Date.now(); },
  /** SWR: kembalikan cache segera (via onData), lalu ambil segar bila basi/kedaluwarsa */
  swr(action, data, opt) {
    opt = opt || {};
    const c = this.cached(action, data), maxAge = opt.maxAge === undefined ? 30000 : opt.maxAge;
    const basi = !c || c.stale || (this.staleAt && c.at < this.staleAt) || Date.now() - c.at > maxAge || opt.fresh;
    if (c && opt.onData) { try { opt.onData(c.data, { cached: true }); } catch (e) { console.error(e); } }
    if (!basi) return Promise.resolve({ success: true, data: c.data, cached: true });
    const lama = c ? JSON.stringify(c.data) : null;
    return this.read(action, data).then((r) => {
      if (r.success && opt.onData && JSON.stringify(r.data) !== lama) { try { opt.onData(r.data, { cached: false }); } catch (e) { console.error(e); } }
      if (!r.success && !c && opt.onError) opt.onError(r);
      return r;
    });
  },
  scheduleDrain() {
    clearTimeout(this.drainT);
    this.drainT = setTimeout(async () => {
      const r = await this.post('drain', {}, { publik: true });
      if (r.success && r.data && r.data.left > 0 && this.drainN < 3) { this.drainN++; this.scheduleDrain(); } else this.drainN = 0;
    }, 400);
  },
  warm(scope) {
    if (!this.configured()) return;
    const k = 'warm_' + scope, last = Store.sget(k, 0);
    if (Date.now() - last < 240000) return;
    Store.sset(k, Date.now());
    try { fetch(this.url() + '?w=' + scope, { mode: 'no-cors' }).catch(() => {}); } catch (e) { /* abaikan */ }
  }
};
/** Penggabung batch otomatis: baca di tik yang sama → 1 eksekusi 'batch' (maks 10) */
const Batcher = {
  q: null,
  add(action, data) {
    return new Promise((res) => {
      if (!this.q) { this.q = []; setTimeout(() => this.flush(), 0); }
      this.q.push({ action, data: data || {}, res });
    });
  },
  async flush() {
    const q = this.q; this.q = null;
    const uniq = [], map = {};
    q.forEach((x) => { const k = API.key(x.action, x.data); if (!map[k]) { map[k] = []; uniq.push(x); } map[k].push(x.res); });
    for (let i = 0; i < uniq.length; i += 10) {
      const part = uniq.slice(i, i + 10);
      if (part.length === 1) { const r = await API.post(part[0].action, part[0].data); map[API.key(part[0].action, part[0].data)].forEach((f) => f(r)); continue; }
      const r = await API.post('batch', { calls: part.map((p) => ({ action: p.action, data: p.data })) }, { batchN: part.length });
      part.forEach((p, j) => {
        const res = r.success ? Object.assign({ ms: r.ms }, r.data.results[j]) : r;
        if (res && res.code === 'AUTH') Auth.expired();
        map[API.key(p.action, p.data)].forEach((f) => f(res));
      });
    }
  }
};

/* ---------- Sesi pemilik ---------- */
const Auth = {
  sess: null,
  load() {
    const s = Store.get('sess', null) || Store.sget('sess', null);
    if (s && s.token && s.exp > Date.now() + 60000) this.sess = s; else this.sess = null;
    return this.sess;
  },
  save(d, ingat) {
    this.sess = { token: d.token, exp: d.exp, me: d.me };
    if (ingat) Store.set('sess', this.sess); else { Store.del('sess'); Store.sset('sess', this.sess); }
  },
  setToken(t, exp) { if (!this.sess) return; this.sess.token = t; if (exp) this.sess.exp = exp; if (Store.get('sess', null)) Store.set('sess', this.sess); else Store.sset('sess', this.sess); },
  clear() { this.sess = null; Store.del('sess'); Store.sdel('sess'); Store.del('boot'); Store.clearCache(); API.mem = {}; },
  expired() { if (!this.sess) return; this.clear(); if (typeof App !== 'undefined') App.showLogin(tr('Sesi berakhir. Silakan masuk kembali.', 'Session expired. Please sign in again.')); }
};

/* ---------- UI kit ---------- */
const UI = {
  toast(msg, type) {
    let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok');
    t.innerHTML = ic(type === 'err' ? 'error' : type === 'warn' ? 'warning' : type === 'info' ? 'info' : 'check_circle') + '<span>' + h(msg) + '</span>';
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, type === 'err' ? 5200 : 3200);
  },
  modal(o) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal ' + (o.size || '') + '" role="dialog" aria-modal="true" aria-label="' + h(o.title || '') + '">' +
      '<div class="modal-h"><div>' + (o.kicker ? '<div class="label mb-8">' + o.kicker + '</div>' : '') + '<div class="h2">' + (o.titleHtml || h(o.title || '')) + '</div>' + (o.sub ? '<p class="muted mt-4">' + o.sub + '</p>' : '') + '</div>' +
      '<button class="icon-btn sm ghost" data-x aria-label="' + tr('Tutup', 'Close') + '">' + ic('close') + '</button></div>' +
      '<div class="modal-b">' + (o.body || '') + '</div>' + (o.foot ? '<div class="modal-f">' + o.foot + '</div>' : '') + '</div>';
    document.body.appendChild(bg);
    document.body.style.overflow = 'hidden';
    const close = () => { bg.remove(); if (!$('.modal-bg') && !$('.drawer.on')) document.body.style.overflow = ''; document.removeEventListener('keydown', esc); if (o.onClose) o.onClose(); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    bg.addEventListener('mousedown', (e) => { if (e.target === bg && !o.sticky) close(); });
    $$('[data-x]', bg).forEach((x) => { x.onclick = close; });
    const m = { el: $('.modal', bg), close };
    setTimeout(() => { const f = $('input:not([type=hidden]),textarea,select', m.el); if (f && !o.noFocus && matchMedia('(hover:hover)').matches) f.focus(); }, 60);
    if (o.onOpen) o.onOpen(m.el, m);
    return m;
  },
  confirm(msg, o) {
    o = o || {};
    return new Promise((res) => {
      let done = false;
      const m = UI.modal({ title: o.title || tr('Konfirmasi', 'Confirm'), size: 'sm', body: '<p class="muted" style="font-size:15px">' + msg + '</p>',
        foot: '<button class="btn btn-ghost" data-no>' + tr('Batal', 'Cancel') + '</button><button class="btn ' + (o.danger ? 'btn-danger' : 'btn-ink') + '" data-yes>' + (o.ok || tr('Ya, lanjutkan', 'Yes, continue')) + '</button>',
        onClose: () => { if (!done) res(false); } });
      $('[data-no]', m.el).onclick = () => { done = true; res(false); m.close(); };
      $('[data-yes]', m.el).onclick = () => { done = true; res(true); m.close(); };
    });
  },
  prompt(label, o) {
    o = o || {};
    return new Promise((res) => {
      let done = false;
      const m = UI.modal({ title: o.title || label, size: 'sm', body: '<div class="field"><label>' + h(label) + '</label><input class="inp" data-v value="' + h(o.value || '') + '" placeholder="' + h(o.placeholder || '') + '"></div>',
        foot: '<button class="btn btn-ghost" data-no>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" data-yes>' + (o.ok || 'OK') + '</button>', onClose: () => { if (!done) res(null); } });
      const go = () => { done = true; res($('[data-v]', m.el).value); m.close(); };
      $('[data-no]', m.el).onclick = () => { done = true; res(null); m.close(); };
      $('[data-yes]', m.el).onclick = go;
      $('[data-v]', m.el).onkeydown = (e) => { if (e.key === 'Enter') go(); };
    });
  },
  drawer(o) {
    let bg = $('#drawer-bg'), dr = $('#drawer');
    if (!dr) {
      bg = document.createElement('div'); bg.id = 'drawer-bg'; bg.className = 'drawer-bg'; document.body.appendChild(bg);
      dr = document.createElement('aside'); dr.id = 'drawer'; dr.className = 'drawer'; dr.setAttribute('role', 'dialog'); document.body.appendChild(dr);
    }
    dr.innerHTML = '<div class="drawer-h"><div class="grow">' + (o.kicker ? '<div class="label">' + o.kicker + '</div>' : '') + '<div class="h3 clamp-1">' + h(o.title || '') + '</div></div><button class="icon-btn sm" data-x aria-label="' + tr('Tutup', 'Close') + '">' + ic('close') + '</button></div><div class="drawer-b">' + (o.body || '') + '</div>';
    requestAnimationFrame(() => { dr.classList.add('on'); bg.classList.add('on'); });
    document.body.style.overflow = 'hidden';
    const close = () => { dr.classList.remove('on'); bg.classList.remove('on'); if (!$('.modal-bg')) document.body.style.overflow = ''; document.removeEventListener('keydown', esc); if (o.onClose) o.onClose(); };
    const esc = (e) => { if (e.key === 'Escape' && !$('.modal-bg')) close(); };
    document.addEventListener('keydown', esc);
    bg.onclick = close; $('[data-x]', dr).onclick = close;
    const d = { el: $('.drawer-b', dr), close, root: dr };
    if (o.onOpen) o.onOpen(d.el, d);
    return d;
  },
  pop(anchor, items) {
    $$('.pop').forEach((p) => p.remove());
    const r = anchor.getBoundingClientRect(), p = document.createElement('div');
    p.className = 'pop';
    p.innerHTML = items.map((it, i) => it === '-' ? '<div class="divider" style="margin:6px 0"></div>' : '<button class="mi" data-i="' + i + '"' + (it.danger ? ' style="color:var(--danger)"' : '') + '>' + ic(it.icon || 'chevron_right', 'sm') + h(it.label) + '</button>').join('');
    document.body.appendChild(p);
    const w = p.offsetWidth, top = r.bottom + window.scrollY + 6, left = Math.min(window.innerWidth - w - 10, Math.max(10, r.right - w));
    p.style.top = top + 'px'; p.style.left = left + 'px';
    const off = (e) => { if (!p.contains(e.target)) { p.remove(); document.removeEventListener('mousedown', off, true); } };
    setTimeout(() => document.addEventListener('mousedown', off, true), 0);
    p.onclick = (e) => { const b = e.target.closest('[data-i]'); if (!b) return; p.remove(); const it = items[+b.dataset.i]; if (it && it.fn) it.fn(); };
  },
  busy(btn, on, teks) {
    if (!btn) return;
    if (on) { btn.dataset.html = btn.innerHTML; btn.classList.add('loading'); btn.innerHTML = ic('progress_activity', 'spin sm') + '<span>' + h(teks || tr('Memproses…', 'Working…')) + '</span>'; }
    else if (btn.dataset.html !== undefined) { btn.classList.remove('loading'); btn.innerHTML = btn.dataset.html; delete btn.dataset.html; }
  },
  sk(n, cls) { return Array.from({ length: n || 3 }, () => '<div class="sk ' + (cls || 'sk-card') + '"></div>').join(''); },
  empty(icon, title, sub, act) { return '<div class="empty">' + ic(icon || 'inbox') + '<div class="h4">' + h(title) + '</div>' + (sub ? '<p class="small">' + sub + '</p>' : '') + (act ? '<div class="mt-12">' + act + '</div>' : '') + '</div>'; },
  confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = ['#E57B95', '#2F4F3E', '#EDA100', '#7B5CD6', '#DCE7DF'];
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('i'); d.className = 'confetti';
      d.style.left = (40 + Math.random() * 20) + 'vw'; d.style.top = '30vh'; d.style.background = c[i % c.length];
      d.style.setProperty('--dx', (Math.random() * 60 - 30) + 'vw'); d.style.animationDelay = (Math.random() * 0.2) + 's';
      document.body.appendChild(d); setTimeout(() => d.remove(), 1700);
    }
  }
};
/** Delegasi klik: <button data-act="nama" data-id="..."> → handlers.nama(el, event) */
function bindActs(root, handlers) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || !root.contains(el)) return;
    const fn = handlers[el.dataset.act];
    if (fn) { if (!(el.tagName === 'INPUT' && /^(checkbox|radio)$/.test(el.type))) e.preventDefault(); fn(el, e); }   // centang tetap berubah
  });
}
function formVals(root) {
  const o = {};
  $$('[name]', root).forEach((el) => {
    if (el.type === 'checkbox') { if (el.dataset.multi) { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
    else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
    else if (el.type === 'number' || el.type === 'range') o[el.name] = el.value === '' ? '' : Number(el.value);
    else o[el.name] = el.value;
  });
  return o;
}
const opts = (list, sel, labelFn) => list.map((x) => { const v = typeof x === 'object' ? x.v : x, l = typeof x === 'object' ? x.l : (labelFn ? labelFn(x) : x); return '<option value="' + h(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + h(l) + '</option>'; }).join('');

/* ---------- Berkas & pustaka (lazy) ---------- */
const Files = {
  toB64(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res({ base64: String(r.result).split(',')[1], mime: file.type || 'application/octet-stream', name: file.name, size: file.size, dataUrl: r.result }); r.onerror = rej; r.readAsDataURL(file); }); },
  /** kompres gambar (maks lebar) agar unggahan cepat di HP */
  async image(file, maxW, q) {
    const d = await Files.toB64(file);
    if (!/^image\/(png|jpe?g|webp)$/.test(d.mime)) return d;
    const img = await Files.loadImg(d.dataUrl), s = Math.min(1, (maxW || 1600) / img.width);
    if (s >= 1 && d.size < 900000) return d;
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const mime = d.mime === 'image/png' ? 'image/png' : 'image/jpeg', url = c.toDataURL(mime, q || 0.88);
    return { base64: url.split(',')[1], mime, name: d.name, size: Math.round(url.length * 0.75), dataUrl: url };
  },
  loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); },
  pick(accept, multiple) { return new Promise((res) => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept || '*/*'; i.multiple = !!multiple; i.onchange = () => res(Array.from(i.files || [])); i.click(); }); },
  download(name, data, mime) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  },
  csv(text) {                                   // parser CSV sederhana (mendukung tanda kutip)
    const rows = []; let row = [], cell = '', q = false;
    text = String(text).replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true; else if (ch === ',' || ch === ';' && !text.slice(0, 200).includes(',')) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map((x) => x.trim());
    return rows.filter((r) => r.join('').trim()).map((r) => { const o = {}; head.forEach((k, i) => { o[k] = (r[i] || '').trim(); }); return o; });
  }
};
const Lib = {
  _p: {},
  load(url) { if (!this._p[url]) this._p[url] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = url; s.async = true; s.onload = res; s.onerror = () => { delete this._p[url]; rej(new Error('Gagal memuat ' + url)); }; document.head.appendChild(s); }); return this._p[url]; },
  xlsx() { return this.load('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js').then(() => window.XLSX); },
  async pdf() { await this.load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'); await this.load('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'); return window.jspdf.jsPDF; },
  zip() { return this.load('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js').then(() => window.JSZip); }
};
const Export = {
  async xlsx(rows, name, sheet) {
    try { const X = await Lib.xlsx(); const ws = X.utils.json_to_sheet(rows); const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, (sheet || 'Data').slice(0, 30)); X.writeFile(wb, name + '.xlsx'); }
    catch (e) { UI.toast(tr('Excel gagal dimuat — mengunduh CSV.', 'Excel failed to load — downloading CSV.'), 'warn'); Export.csv(rows, name); }
  },
  csv(rows, name) {
    if (!rows.length) return;
    const k = Object.keys(rows[0]), esc = (v) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    Files.download(name + '.csv', '﻿' + [k.map(esc).join(',')].concat(rows.map((r) => k.map((c) => esc(r[c])).join(','))).join('\n'), 'text/csv');
  },
  async pdf(title, rows, sub) {
    try {
      const J = await Lib.pdf(), doc = new J({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      doc.setFont('times', 'bold'); doc.setFontSize(20); doc.text(title, 40, 50);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90); doc.text(sub || ('Digital Content Copilot · ' + Fmt.tgl(Fmt.today())), 40, 68);
      const k = rows.length ? Object.keys(rows[0]) : [];
      doc.autoTable({ startY: 84, head: [k], body: rows.map((r) => k.map((c) => String(r[c] === undefined ? '' : r[c]))), styles: { fontSize: 8.5, cellPadding: 5 }, headStyles: { fillColor: [47, 79, 62] }, alternateRowStyles: { fillColor: [250, 247, 242] } });
      doc.save(title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.pdf');
    } catch (e) { UI.toast(tr('PDF gagal dibuat: ', 'PDF failed: ') + e.message, 'err'); }
  }
};
/** Muat Google Font untuk kanvas (Branding Kit) */
const Fonts = {
  ok: {},
  async load(fam) {
    if (!fam || this.ok[fam]) return;
    const id = 'gf-' + fam.replace(/\s+/g, '-');
    if (!document.getElementById(id)) {
      const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap';
      document.head.appendChild(l);
    }
    try { await Promise.race([Promise.all([document.fonts.load('700 40px "' + fam + '"'), document.fonts.load('400 20px "' + fam + '"'), document.fonts.load('italic 400 20px "' + fam + '"')]), sleep(2500)]); } catch (e) { /* abaikan */ }
    this.ok[fam] = true;
  }
};
const FONT_PILIHAN = ['Playfair Display', 'DM Serif Display', 'Fraunces', 'Instrument Serif', 'Lora', 'DM Sans', 'Plus Jakarta Sans', 'Inter', 'Manrope', 'Space Grotesk', 'Syne', 'Outfit', 'Poppins', 'Bricolage Grotesque', 'Archivo', 'Caveat', 'JetBrains Mono'];

/* ---------- Markdown mini (aman: escape dulu) ---------- */
function md(src) {
  const lines = h(src || '').split('\n'); let out = '', list = null;
  const inline = (s) => s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="link-mono">$1</a>');
  const close = () => { if (list) { out += '</' + list + '>'; list = null; } };
  lines.forEach((l) => {
    let m;
    if ((m = l.match(/^(#{1,3})\s+(.*)/))) { close(); out += '<h' + (m[1].length + 1) + '>' + inline(m[2]) + '</h' + (m[1].length + 1) + '>'; }
    else if ((m = l.match(/^\s*- \[( |x)\]\s+(.*)/))) { if (list !== 'ul') { close(); out += '<ul>'; list = 'ul'; } out += '<li class="task-li"><input type="checkbox" class="md-check"' + (m[1] === 'x' ? ' checked' : '') + '> <span>' + inline(m[2]) + '</span></li>'; }
    else if ((m = l.match(/^\s*[-•]\s+(.*)/))) { if (list !== 'ul') { close(); out += '<ul>'; list = 'ul'; } out += '<li>' + inline(m[1]) + '</li>'; }
    else if ((m = l.match(/^\s*\d+\.\s+(.*)/))) { if (list !== 'ol') { close(); out += '<ol>'; list = 'ol'; } out += '<li>' + inline(m[1]) + '</li>'; }
    else if (!l.trim()) close();
    else { close(); out += '<p>' + inline(l) + '</p>'; }
  });
  close();
  return out;
}

/* ---------- Chart SVG ringan (palet tervalidasi, tooltip hover, label teks) ---------- */
const Chart = {
  spark(vals, o) {
    o = o || {}; const w = o.w || 160, hh = o.h || 40, mx = Math.max(1, ...vals), n = vals.length;
    const pts = vals.map((v, i) => [(i / Math.max(1, n - 1)) * w, hh - 4 - (v / mx) * (hh - 10)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1] || [0, 0];
    return '<svg viewBox="0 0 ' + w + ' ' + hh + '" width="100%" height="' + hh + '" preserveAspectRatio="none" role="img" aria-label="' + h(o.label || 'tren') + '"><path d="' + d + ' L' + w + ' ' + hh + ' L0 ' + hh + 'Z" fill="' + (o.fill || 'rgba(152,74,92,.08)') + '"/><path d="' + d + '" fill="none" stroke="' + (o.color || 'var(--blush-ink)') + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="' + last[0] + '" cy="' + last[1] + '" r="3.5" fill="' + (o.color || 'var(--blush-ink)') + '" stroke="#fff" stroke-width="2"/></svg>';
  },
  ring(pct, o) {
    o = o || {}; const r = 34, c = 2 * Math.PI * r, p = clamp(pct, 0, 100);
    return '<div class="ring" style="width:' + (o.size || 84) + 'px;height:' + (o.size || 84) + 'px"><svg viewBox="0 0 84 84" role="img" aria-label="' + p + '%"><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="' + (o.track || 'var(--paper-2)') + '" stroke-width="7"/><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="' + (o.color || 'var(--sage-ink)') + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (c * p / 100).toFixed(1) + ' ' + c.toFixed(1) + '"/></svg><b style="font-size:' + (o.fs || 18) + 'px">' + (o.text !== undefined ? o.text : p + '%') + '</b></div>';
  },
  /** garis 1 seri + crosshair tooltip. points: [{t:'yyyy-mm-dd', v}] */
  line(el, points, o) {
    o = o || {};
    const W = el.clientWidth || 600, H = o.h || 220, pl = 44, pr = 12, pt = 14, pb = 26, n = points.length;
    const mx = Math.max(1, ...points.map((p) => p.v)), nice = Math.pow(10, Math.floor(Math.log10(mx))), top = Math.ceil(mx / nice) * nice;
    const x = (i) => pl + (i / Math.max(1, n - 1)) * (W - pl - pr), y = (v) => pt + (1 - v / top) * (H - pt - pb);
    let grid = ''; for (let g = 0; g <= 4; g++) { const v = (top / 4) * g; grid += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#EFE9DF" stroke-width="1"/><text x="' + (pl - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="10.5" fill="#6b6462" font-family="JetBrains Mono">' + Fmt.k(v) + '</text>'; }
    const step = Math.max(1, Math.ceil(n / 7));
    let xl = ''; points.forEach((p, i) => { if (i % step === 0 || i === n - 1) xl += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10.5" fill="#6b6462" font-family="JetBrains Mono">' + h(Fmt.tgl(p.t, { year: undefined })) + '</text>'; });
    const d = points.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ');
    const col = o.color || 'var(--s1)';
    el.classList.add('chart');
    el.innerHTML = '<svg width="' + W + '" height="' + H + '" role="img" aria-label="' + h(o.label || '') + '">' + grid + xl +
      '<path d="' + d + ' L' + x(n - 1) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + 'Z" fill="' + col + '" opacity=".08"/>' +
      '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<line class="xh" y1="' + pt + '" y2="' + (H - pb) + '" stroke="#1E1B1B" stroke-width="1" stroke-dasharray="3 3" opacity="0"/><circle class="xd" r="5" fill="' + col + '" stroke="#fff" stroke-width="2" opacity="0"/>' +
      '<rect x="' + pl + '" y="0" width="' + (W - pl - pr) + '" height="' + H + '" fill="transparent" class="hit"/></svg><div class="tip"></div>';
    const svg = $('svg', el), tip = $('.tip', el), xh = $('.xh', el), xd = $('.xd', el);
    const move = (cx) => {
      const r = svg.getBoundingClientRect(), i = clamp(Math.round(((cx - r.left - pl) / (W - pl - pr)) * (n - 1)), 0, n - 1), p = points[i];
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', '.5');
      xd.setAttribute('cx', x(i)); xd.setAttribute('cy', y(p.v)); xd.setAttribute('opacity', '1');
      tip.innerHTML = '<b>' + Fmt.n(p.v) + '</b> ' + h(o.unit || '') + '<br><span style="opacity:.7">' + h(Fmt.tgl(p.t)) + '</span>';
      tip.style.left = x(i) + 'px'; tip.style.top = y(p.v) + 'px'; tip.classList.add('on');
    };
    const hide = () => { tip.classList.remove('on'); xh.setAttribute('opacity', '0'); xd.setAttribute('opacity', '0'); };
    svg.addEventListener('pointermove', (e) => move(e.clientX)); svg.addEventListener('pointerleave', hide);
  },
  /** bar horizontal 1 seri, label nilai selalu tampil */
  hbars(items, o) {
    o = o || {}; const mx = Math.max(1, ...items.map((i) => i.v));
    return '<div role="list">' + items.map((it) => '<div class="hbar" role="listitem" title="' + h(it.l + ': ' + (o.fmt ? o.fmt(it.v) : Fmt.n(it.v))) + '"><span class="clamp-1">' + h(it.l) + '</span><span class="track"><i style="width:' + Math.max(2, (100 * it.v) / mx) + '%;background:' + (it.c || o.color || 'var(--s1)') + '"></i></span><b class="num small">' + (o.fmt ? o.fmt(it.v) : Fmt.n(it.v)) + '</b></div>').join('') + '</div>';
  },
  /** kolom vertikal kecil (mis. 7 hari) */
  cols(items, o) {
    o = o || {}; const mx = Math.max(1, ...items.map((i) => i.v)), H = o.h || 90;
    return '<div class="row gap-8" style="align-items:flex-end;height:' + (H + 20) + 'px">' + items.map((it) => '<div class="col gap-4 grow" style="align-items:center" title="' + h(it.l + ': ' + it.v) + '"><div style="width:100%;max-width:26px;height:' + Math.max(3, (H * it.v) / mx) + 'px;border-radius:4px 4px 0 0;background:' + (it.c || 'var(--sage-ink)') + '"></div><span class="xs mono tert">' + h(it.l) + '</span></div>').join('') + '</div>';
  }
};

/* ---------- Router hash ---------- */
const Router = {
  parse() {
    const raw = (location.hash || '').replace(/^#\/?/, ''), [p, q] = raw.split('?'), params = {};
    (q || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { page: p || 'dashboard', params };
  },
  go(page, params) {
    const q = params ? Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== '').map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&') : '';
    const target = '#/' + page + (q ? '?' + q : '');
    if (location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = target;
  }
};

/* ---------- Aktivitas pengguna (polling adaptif) ---------- */
const Activity = {
  at: Date.now(), last: {},
  init() { ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focus'].forEach((ev) => addEventListener(ev, () => { this.at = Date.now(); }, { passive: true })); },
  idle() { return Date.now() - this.at > 120000; },
  due(key, activeMs, idleMs) {
    if (document.visibilityState !== 'visible') return false;
    if (Date.now() - (this.last[key] || 0) < (this.idle() ? idleMs : activeMs) - 500) return false;
    this.last[key] = Date.now(); return true;
  }
};
Activity.init();
/* Ikon: bila font Material Symbols gagal dimuat (offline/diblokir), sembunyikan teks ligatur */
window.addEventListener('load', () => {
  if (!document.fonts || !document.fonts.load) return;
  Promise.race([document.fonts.load('24px "Material Symbols Outlined"', 'home'), sleep(4000).then(() => null)])
    .then((f) => { if (!f || !f.length) document.documentElement.classList.add('no-icons'); })
    .catch(() => document.documentElement.classList.add('no-icons'));
});

/* ---------- Registrasi halaman ---------- */
const Pages = { defs: {}, def(id, o) { this.defs[id] = o; } };
const PLATFORM = ['Instagram', 'TikTok', 'Threads', 'LinkedIn', 'Facebook', 'YouTube', 'X/Twitter', 'Pinterest', 'Substack', 'WhatsApp'];
const JENIS = ['Carousel', 'Video Pendek', 'Infografis', 'Foto', 'Story', 'Caption', 'Thread', 'Artikel'];
const JENIS_EN = { Carousel: 'Carousel', 'Video Pendek': 'Short Video', Infografis: 'Infographic', Foto: 'Photo', Story: 'Story', Caption: 'Caption', Thread: 'Thread', Artikel: 'Article' };
const jenisLabel = (j) => (LANG === 'en' ? JENIS_EN[j] || j : j);
const PLAT_ICON = { Instagram: 'photo_camera', TikTok: 'music_note', Threads: 'alternate_email', LinkedIn: 'business_center', Facebook: 'thumb_up', YouTube: 'smart_display', 'X/Twitter': 'tag', Pinterest: 'push_pin', Substack: 'mail', WhatsApp: 'chat' };
const JENIS_ICON = { Carousel: 'view_carousel', 'Video Pendek': 'play_circle', Infografis: 'insert_chart', Foto: 'image', Story: 'auto_stories', Caption: 'notes', Thread: 'forum', Artikel: 'article' };
const platPill = (p) => '<span class="pill sm p-line">' + ic(PLAT_ICON[p] || 'public', 'xs') + h(p) + '</span>';
const jenisPill = (j) => '<span class="pill sm p-blush">' + ic(JENIS_ICON[j] || 'description', 'xs') + h(jenisLabel(j)) + '</span>';
