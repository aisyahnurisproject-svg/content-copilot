/* Modul 15 — AI Orchestration: provider & model, API key (Script Properties), kuota, cache, prompt manager berversi, log AI */
'use strict';
Pages.def('orchestration', {
  KEY: { gemini: 'GEMINI_API_KEY', openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY' },
  LINK: { gemini: 'https://aistudio.google.com/apikey', openai: 'https://platform.openai.com/api-keys', anthropic: 'https://console.anthropic.com/settings/keys' },
  MSET: { gemini: ['AI_MODEL_GEMINI', 'AI_MODEL_GAMBAR_GEMINI'], openai: ['AI_MODEL_OPENAI', 'AI_MODEL_GAMBAR_OPENAI'], anthropic: ['AI_MODEL_ANTHROPIC', ''] },
  ICON: { template: 'bolt', gemini: 'auto_awesome', openai: 'psychology', anthropic: 'neurology' },
  marquee() { return ['Module 15 // AI Orchestration & Prompt Manager', 'Template · Gemini · OpenAI · Claude', 'API keys stored in Script Properties only', 'Versioned prompts · cache · daily quota · fallback']; },
  render(el) {
    this.el = el; this.st = null; this.prompts = null; this.pk = 'KONTEN'; this.models = {}; this.logF = '';
    bindActs(el, {
      aktif: (b) => this.config({ provider: b.dataset.p }, b), test: (b) => this.test(b), key: (b) => this.simpanKey(b), hapusKey: (b) => this.hapusKey(b), models: (b) => this.muatModel(b),
      cfg: (b) => this.simpanCfg(b), pk: (b) => { this.pk = b.dataset.k; this.paintPrompt(); }, psave: (b) => this.psave(b), pprev: (b) => this.pprev(b), preset: (b) => this.preset(b), pver: (b) => this.pver(b),
      logf: (b) => { this.logF = b.dataset.v; this.paintLog(); }, cc: (b) => this.cacheClear(b), logs: (b) => this.muatLog(b)
    });
    el.innerHTML = App.hero({ word: 'W-15', pills: '<span class="pill mono p-lav">' + ic('hub', 'xs') + 'Multi-provider</span><span class="pill mono p-sage">' + ic('lock', 'xs') + 'Keys in Script Properties</span>',
      title: tr('satu otak. <span class="it">banyak model.</span>', 'one brain. <span class="it">many models.</span>'),
      sub: tr('Pilih mesin AI: Mode Template gratis tanpa API, atau Gemini / OpenAI / Claude dengan API key Anda sendiri. Atur kuota, cache, dan sunting prompt per modul — semua berversi dan bisa dikembalikan.', 'Pick your AI engine: free Template Mode with no API, or Gemini / OpenAI / Claude with your own API key. Control quota, cache, and edit per-module prompts — all versioned and reversible.'),
      side: '<div id="or-side" class="col gap-8" style="align-items:flex-end">' + UI.sk(1, 'sk-line') + '</div>' }) +
      '<div class="grid g4 mt-24" id="or-kpi">' + UI.sk(4) + '</div>' +
      '<section class="mt-24"><div class="row between wrap gap-12 mb-12"><h2 class="h1" style="font-size:30px">' + tr('Provider & model', 'Providers & models') + '</h2><span class="xs muted">' + tr('API key tidak pernah dikirim balik ke browser — hanya versi tersamar.', 'API keys are never sent back to the browser — only a masked version.') + '</span></div><div class="grid g4" id="or-prov" style="align-items:stretch">' + UI.sk(4) + '</div></section>' +
      '<div class="grid mt-24" id="or-mid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);align-items:start"><section class="card col gap-12" id="or-cfg"></section><section class="card col gap-10" id="or-mod"></section><section class="card col gap-10" id="or-day"></section></div>' +
      '<section class="card lg mt-24" id="or-prompt">' + UI.sk(2) + '</section>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><h2 class="h2">Log_AI</h2><p class="xs muted mt-4">' + tr('Setiap panggilan AI tercatat: provider, model, durasi, token, perkiraan biaya, cache.', 'Every AI call is logged: provider, model, duration, tokens, estimated cost, cache.') + '</p></div><div class="row gap-8 wrap"><div class="seg" id="or-logf"></div><button class="btn btn-ghost btn-sm" data-act="logs">' + ic('refresh', 'sm') + tr('Segarkan', 'Refresh') + '</button><button class="btn btn-ghost btn-sm" data-act="cc">' + ic('mop', 'sm') + tr('Kosongkan cache AI', 'Clear AI cache') + '</button></div></div><div id="or-log">' + UI.sk(3, 'sk-line') + '</div></section>';
    if (innerWidth < 1100) $('#or-mid', el).style.gridTemplateColumns = 'minmax(0,1fr)';
    this.muat(); this.muatPrompt(); this.muatLog();
  },
  muat() { API.swr('ai.status', {}, { maxAge: 15000, onData: (d) => { this.st = d; this.paint(); } }); },
  segar() { return API.read('ai.status', {}).then((r) => { if (r.success) { this.st = r.data; this.paint(); if (App.boot) { App.boot.ai = Object.assign(App.boot.ai || {}, { provider: r.data.provider, label: r.data.label, model: r.data.model, siap: r.data.siap }); App.paintShellState(); } } }); },
  paint() {
    const s = this.st; if (!s) return;
    const pct = s.kuota ? Math.min(100, Math.round(100 * s.terpakai / s.kuota)) : 0, hit = s.cacheHit + s.cacheMiss ? Math.round(100 * s.cacheHit / (s.cacheHit + s.cacheMiss)) : 0;
    $('#or-side', this.el).innerHTML = '<span class="pill ' + (s.provider === 'template' ? 'p-butter' : 'p-sage') + '">' + ic(this.ICON[s.provider], 'xs') + h(s.label) + '</span><span class="mono xs tert">' + h(s.model) + '</span>';
    $('#or-kpi', this.el).innerHTML =
      '<div class="card sage row gap-16"><div>' + Chart.ring(pct, { size: 76, color: pct > 85 ? 'var(--danger)' : 'var(--sage-ink)' }) + '</div><div><div class="label">' + tr('Kuota hari ini', "Today's quota") + '</div><div class="h2 mt-4">' + s.terpakai + ' / ' + s.kuota + '</div><div class="xs muted">' + tr('panggilan API (reset 00:00 WIB)', 'API calls (resets 00:00 WIB)') + '</div></div></div>' +
      '<div class="card kpi"><div class="label">Cache hit</div><div class="v mt-8">' + hit + '<small>%</small></div><div class="xs muted mt-4">' + s.cacheHit + ' hit · ' + s.cacheMiss + ' miss · TTL ' + s.cacheJam + tr(' jam', 'h') + '</div></div>' +
      '<div class="card kpi"><div class="label">' + tr('Latensi rata-rata', 'Avg latency') + '</div><div class="v mt-8">' + (s.rataMs ? (s.rataMs / 1000).toFixed(1) : '0') + '<small>' + tr('dtk', 's') + '</small></div><div class="xs muted mt-4">' + s.jumlahLog + tr(' log terakhir', ' recent logs') + '</div></div>' +
      '<div class="card kpi"><div class="label">' + tr('Perkiraan biaya', 'Estimated cost') + '</div><div class="v mt-8" style="font-size:32px">$' + Number(s.biaya || 0).toFixed(4) + '</div><div class="xs muted mt-4">' + tr('dari log terakhir · Mode Template = $0', 'from recent logs · Template Mode = $0') + '</div></div>';
    $('#or-prov', this.el).innerHTML = s.providers.map((p) => this.provCard(p, s.provider === p.id)).join('');
    this.paintCfg(); this.paintUsage();
  },
  provCard(p, aktif) {
    const tpl = p.id === 'template', ms = this.models[p.id], dl = ms ? '<datalist id="dl-' + p.id + '">' + ms.map((m) => '<option value="' + h(m.id) + '">' + h(m.nama) + '</option>').join('') + '</datalist>' : '';
    return '<article class="card col gap-10 ' + (aktif ? 'ink' : '') + '" data-prov="' + p.id + '" style="' + (aktif ? '' : '') + '"><div class="row between"><span class="ico-dot sm ' + (aktif ? '' : 'line') + '"' + (aktif ? ' style="background:rgba(255,255,255,.12);color:#fff"' : '') + '>' + ic(this.ICON[p.id], 'sm') + '</span>' + (aktif ? '<span class="pill sm p-blush">' + tr('AKTIF', 'ACTIVE') + '</span>' : p.adaKunci ? '<span class="pill sm p-ok">' + (tpl ? tr('selalu siap', 'always ready') : tr('key tersimpan', 'key saved')) + '</span>' : '<span class="pill sm p-line">' + tr('belum ada key', 'no key') + '</span>') + '</div>' +
      '<h3 class="h3"' + (aktif ? ' style="color:#fff"' : '') + '>' + h(p.label) + '</h3>' +
      (tpl ? '<p class="small" style="opacity:.8">' + tr('Mesin aturan bawaan: hook, caption, strategi, naskah, dan review dari pola copywriting teruji. Gratis, cepat, tanpa kuota — tidak bisa menerjemahkan.', 'Built-in rule engine: hooks, captions, strategy, scripts and review from proven copywriting patterns. Free, fast, no quota — cannot translate.') + '</p><div class="mono xs" style="opacity:.7;margin-top:auto">template-engine-v1</div>'
        : '<div class="field"><label' + (aktif ? ' style="color:#cfc8bd"' : '') + '>API key ' + (p.kunciSamar ? '<span class="opt mono">' + h(p.kunciSamar) + '</span>' : '') + '</label><div class="row gap-6"><input class="inp sm" type="password" autocomplete="off" data-key="' + p.id + '" placeholder="' + (p.adaKunci ? tr('isi untuk mengganti', 'type to replace') : tr('tempel API key', 'paste API key')) + '"><button class="btn btn-sm ' + (aktif ? 'btn-blush' : 'btn-ink') + '" data-act="key" data-p="' + p.id + '">' + tr('Simpan', 'Save') + '</button></div><a class="xs link-mono" href="' + this.LINK[p.id] + '" target="_blank" rel="noopener"' + (aktif ? ' style="color:#cfc8bd"' : '') + '>' + tr('Dapatkan API key ↗', 'Get an API key ↗') + '</a></div>' +
          '<div class="field"><label' + (aktif ? ' style="color:#cfc8bd"' : '') + '>' + tr('Model teks', 'Text model') + '</label><div class="row gap-6"><input class="inp sm mono" data-model="' + p.id + '" value="' + h(p.model) + '"' + (ms ? ' list="dl-' + p.id + '"' : '') + '><button class="icon-btn sm" data-act="models" data-p="' + p.id + '" title="' + tr('Muat daftar model dari provider', 'Load model list from provider') + '" aria-label="models"' + (aktif ? ' style="background:rgba(255,255,255,.1);color:#fff"' : '') + '>' + ic('list', 'sm') + '</button></div>' + dl + '</div>' +
          (p.gambar !== '' && this.MSET[p.id][1] ? '<div class="field"><label' + (aktif ? ' style="color:#cfc8bd"' : '') + '>' + tr('Model gambar', 'Image model') + '</label><input class="inp sm mono" data-gmodel="' + p.id + '" value="' + h(p.gambar) + '"' + (ms ? ' list="dl-' + p.id + '"' : '') + '></div>' : '') +
          '<div class="row gap-6 wrap" style="margin-top:auto">' + (p.adaKunci ? '<button class="btn btn-text btn-xs" data-act="hapusKey" data-p="' + p.id + '"' + (aktif ? ' style="color:#f3c9d3"' : ' style="color:var(--danger)"') + '>' + tr('Hapus key', 'Remove key') + '</button>' : '') + '</div>') +
      '<div class="row gap-6 wrap"><button class="btn btn-sm ' + (aktif ? 'btn-blush' : 'btn-ghost') + ' grow" data-act="test" data-p="' + p.id + '">' + ic('network_check', 'sm') + tr('Tes', 'Test') + '</button>' + (aktif ? '' : '<button class="btn btn-sm btn-sage grow" data-act="aktif" data-p="' + p.id + '">' + tr('Jadikan aktif', 'Make active') + '</button>') + '</div></article>';
  },
  paintCfg() {
    const s = this.st, box = $('#or-cfg', this.el), fb = s.fallback !== 'TIDAK';
    box.innerHTML = '<div class="label">' + tr('Kebijakan AI', 'AI policy') + '</div><form class="col gap-10" id="or-f"><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Kuota harian', 'Daily quota') + '</label><input class="inp sm" type="number" min="1" max="5000" name="AI_KUOTA_HARIAN" value="' + h(s.kuota) + '"></div><div class="field"><label>' + tr('Cache hasil (jam)', 'Result cache (hours)') + '</label><input class="inp sm" type="number" min="0" max="6" name="AI_CACHE_JAM" value="' + h(s.cacheJam) + '"></div></div>' +
      '<label class="row between small"><span>' + tr('Fallback ke Mode Template bila API gagal / kuota habis', 'Fall back to Template Mode when the API fails / quota runs out') + '</span><span class="sw"><input type="checkbox" name="AI_FALLBACK_TEMPLATE"' + (fb ? ' checked' : '') + '><i></i></span></label>' +
      '<details><summary class="small sb" style="cursor:pointer">' + tr('Lanjutan: harga per 1 juta token (JSON)', 'Advanced: price per 1M tokens (JSON)') + '</summary><textarea class="ta mono mt-8" name="AI_HARGA_JSON" rows="4" placeholder=\'{"gemini":[0.3,2.5],"openai":[0.4,1.6],"anthropic":[1,5]}\'>' + h(App.set('AI_HARGA_JSON', '')) + '</textarea><p class="xs muted mt-4">' + tr('[masuk, keluar] USD — hanya untuk perkiraan di log.', '[input, output] USD — estimate only.') + '</p></details></form><button class="btn btn-ink btn-sm" data-act="cfg">' + ic('save', 'sm') + tr('Simpan kebijakan', 'Save policy') + '</button>' +
      '<p class="xs muted">' + tr('Cache membuat permintaan identik tidak memakai kuota lagi selama TTL. Kuota mencegah tagihan API membengkak.', 'Caching makes identical requests free during the TTL. The quota keeps your API bill in check.') + '</p>';
  },
  paintUsage() {
    const s = this.st, pm = s.perModul || {}, ph = s.perHari || {};
    $('#or-mod', this.el).innerHTML = '<div class="row between"><div class="label">' + tr('Pemakaian per modul', 'Usage per module') + '</div><span class="mono xs tert">' + s.jumlahLog + ' log</span></div>' + (Object.keys(pm).length ? Chart.hbars(Object.keys(pm).sort((a, b) => pm[b] - pm[a]).map((k) => ({ l: k || '—', v: pm[k] })), { color: 'var(--s5)' }) : '<p class="xs muted">' + tr('Belum ada panggilan AI.', 'No AI calls yet.') + '</p>');
    const hari = Array.from({ length: 7 }, (_, i) => Fmt.addDays(Fmt.today(), i - 6));
    $('#or-day', this.el).innerHTML = '<div class="label">' + tr('7 hari terakhir', 'Last 7 days') + '</div>' + Chart.cols(hari.map((d) => ({ l: Fmt.hari(d), v: (ph[d] || {}).n || 0, c: d === Fmt.today() ? 'var(--rose)' : 'var(--s5)' })), { h: 90 }) + '<div class="row gap-12 xs muted"><span>' + tr('Panggilan AI per hari', 'AI calls per day') + '</span><span>' + tr('gagal: ', 'failed: ') + hari.reduce((t, d) => t + ((ph[d] || {}).gagal || 0), 0) + '</span><span>cache: ' + hari.reduce((t, d) => t + ((ph[d] || {}).hit || 0), 0) + '</span></div>';
  },
  async config(d, btn) {
    UI.busy(btn, true); const r = await API.call('ai.config', d, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) this.segar();
  },
  async simpanKey(btn) {
    const p = btn.dataset.p, inp = $('[data-key="' + p + '"]', this.el), v = inp.value.trim();
    if (!v) { inp.focus(); return UI.toast(tr('Tempel API key dulu.', 'Paste the API key first.'), 'warn'); }
    UI.busy(btn, true); const r = await API.call('rahasia.simpan', { kunci: this.KEY[p], nilai: v }, { noBootRefresh: true }); UI.busy(btn, false);
    inp.value = '';
    if (r.success) { await this.segar(); if (this.st.provider === 'template' && await UI.confirm(tr('Key tersimpan. Jadikan ' + p + ' sebagai provider aktif sekarang?', 'Key saved. Make ' + p + ' the active provider now?'))) this.config({ provider: p }); }
  },
  async hapusKey(btn) {
    const p = btn.dataset.p;
    if (!(await UI.confirm(tr('Hapus API key ' + p + ' dari Script Properties? Modul akan memakai Mode Template bila provider ini aktif.', 'Remove the ' + p + ' API key from Script Properties? Modules will use Template Mode if this provider is active.'), { danger: true, ok: tr('Hapus key', 'Remove key') }))) return;
    const r = await API.call('rahasia.simpan', { kunci: this.KEY[p], nilai: '__HAPUS__' }, { noBootRefresh: true }); if (r.success) this.segar();
  },
  async muatModel(btn) {
    const p = btn.dataset.p; UI.busy(btn, true); const r = await API.read('ai.models', { provider: p, _fresh: 1 }); UI.busy(btn, false);
    if (!r.success) return UI.toast(r.message, 'err');
    this.models[p] = r.data; UI.toast(r.data.length + tr(' model tersedia — klik kolom model untuk memilih.', ' models available — click the model field to choose.'), 'ok');
    const card = $('[data-prov="' + p + '"]', this.el), cur = { m: $('[data-model]', card).value, g: ($('[data-gmodel]', card) || {}).value };
    card.outerHTML = this.provCard(this.st.providers.find((x) => x.id === p), this.st.provider === p);
    const c2 = $('[data-prov="' + p + '"]', this.el); $('[data-model]', c2).value = cur.m; if (cur.g !== undefined && $('[data-gmodel]', c2)) $('[data-gmodel]', c2).value = cur.g;
  },
  async test(btn) {
    const p = btn.dataset.p, card = $('[data-prov="' + p + '"]', this.el), mi = card && $('[data-model]', card), gi = card && $('[data-gmodel]', card);
    if (mi && p !== 'template') {                                   // simpan model bila diubah
      const s = this.st.providers.find((x) => x.id === p), ch = {};
      if (mi.value.trim() && mi.value.trim() !== s.model) ch[this.MSET[p][0]] = mi.value.trim();
      if (gi && gi.value.trim() && gi.value.trim() !== s.gambar) ch[this.MSET[p][1]] = gi.value.trim();
      if (Object.keys(ch).length) { const c = await API.call('ai.config', ch, { toast: false, noBootRefresh: true }); if (!c.success) return; await this.segar(); }
    }
    UI.busy(btn, true, tr('Menguji…', 'Testing…'));
    const r = await API.call('ai.test', { provider: p, model: mi ? mi.value.trim() : '' }, { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (r.success) UI.modal({ title: r.message, kicker: 'AI test', size: 'sm', body: '<div class="inset small"><div class="label">' + tr('Contoh balasan', 'Sample reply') + '</div><p class="mt-8">' + h(r.data.contoh || '') + '</p></div>' + (r.data.model ? '<p class="xs muted mt-12 mono">' + h(r.data.provider) + ' · ' + h(r.data.model) + (r.data.ms ? ' · ' + r.data.ms + ' ms' : '') + '</p>' : ''), foot: '<button class="btn btn-ink" data-x>OK</button>' });
    else UI.toast(r.message, 'err');
  },
  async simpanCfg(btn) {
    const f = $('#or-f', this.el), v = formVals(f), d = { AI_KUOTA_HARIAN: v.AI_KUOTA_HARIAN, AI_CACHE_JAM: v.AI_CACHE_JAM, AI_FALLBACK_TEMPLATE: $('[name=AI_FALLBACK_TEMPLATE]', f).checked ? 'YA' : 'TIDAK' };
    if (String(v.AI_HARGA_JSON || '').trim()) d.AI_HARGA_JSON = v.AI_HARGA_JSON.trim();
    this.config(d, btn);
  },
  /* ---------- Prompt manager ---------- */
  muatPrompt() { API.swr('prompt.list', {}, { maxAge: 30000, onData: (d) => { this.prompts = d; this.paintPrompt(); } }); },
  paintPrompt() {
    const box = $('#or-prompt', this.el); if (!this.prompts) return;
    const P = this.prompts.find((x) => x.Kode === this.pk) || this.prompts[0], a = P.aktif || { Sistem: P.default.sistem, Template: P.default.template, Suhu: P.default.suhu, Versi: 0 };
    const vars = Array.from(new Set(((P.default.template || '') + (P.default.sistem || '')).match(/\{\{\w+\}\}/g) || []));
    box.innerHTML = '<div class="row between wrap gap-12"><div><div class="label">Prompt Manager</div><h2 class="h1 mt-4" style="font-size:30px">' + tr('Sunting otak tiap modul', 'Edit each module’s brain') + '</h2><p class="muted mt-4 small">' + tr('Simpan = versi baru (versi lama tetap ada & bisa dipulihkan). Prompt wajib meminta keluaran JSON.', 'Save = new version (older versions stay & can be restored). Prompts must ask for JSON output.') + '</p></div></div>' +
      '<div class="grid mt-16" id="or-pg" style="grid-template-columns:minmax(220px,1fr) minmax(0,3fr);gap:16px;align-items:start"><div class="col gap-6">' + this.prompts.map((x) => '<button class="tile w-100' + (x.Kode === P.Kode ? ' is-sel' : '') + '" style="text-align:left;padding:10px 12px" data-act="pk" data-k="' + h(x.Kode) + '"><div class="row between gap-6"><span class="mono xs sb">' + h(x.Kode) + '</span><span class="pill sm mono p-line">v' + (x.aktif ? x.aktif.Versi : 0) + '</span></div><div class="xs muted mt-4 clamp-1">' + h(x.Nama) + ' · ' + h(x.Modul) + '</div></button>').join('') + '</div>' +
      '<div class="col gap-12"><div class="row wrap gap-8"><span class="pill p-lav">' + h(P.Modul) + '</span><span class="pill p-line mono">' + h(P.Kode) + ' · v' + a.Versi + '</span>' + vars.map((v) => '<span class="pill sm mono p-butter">' + h(v) + '</span>').join('') + '</div>' +
        '<div class="grid g2" style="gap:12px"><div class="field"><label>' + tr('Nama', 'Name') + '</label><input class="inp sm" id="pm-nama" value="' + h(a.Nama || P.Nama) + '"></div><div class="field"><label>' + tr('Suhu (kreativitas 0–1.5)', 'Temperature (creativity 0–1.5)') + '</label><input class="inp sm" type="number" step="0.1" min="0" max="1.5" id="pm-suhu" value="' + h(a.Suhu) + '"></div></div>' +
        '<div class="field"><label>' + tr('Instruksi sistem', 'System instruction') + '</label><textarea class="ta mono" id="pm-sis" rows="4">' + h(a.Sistem) + '</textarea></div><div class="field"><label>Template</label><textarea class="ta mono" id="pm-tpl" rows="10">' + h(a.Template) + '</textarea></div>' +
        '<div class="row wrap gap-8"><button class="btn btn-ink" data-act="psave">' + ic('save', 'sm') + tr('Simpan versi baru', 'Save new version') + '</button><button class="btn btn-ghost" data-act="pprev">' + ic('visibility', 'sm') + tr('Pratinjau terisi', 'Preview filled') + '</button><button class="btn btn-text" data-act="preset" style="color:var(--danger)">' + ic('restart_alt', 'sm') + tr('Kembalikan default', 'Reset to default') + '</button></div>' +
        (P.versi.length > 1 ? '<div class="inset col gap-6"><div class="label">' + tr('Riwayat versi', 'Version history') + '</div>' + P.versi.map((v) => '<div class="row between small"><span class="mono">v' + v.Versi + ' · ' + h(Fmt.dt(v.DiperbaruiPada)) + '</span>' + (v.Aktif === 'YA' ? '<span class="pill sm p-ok">' + tr('aktif', 'active') + '</span>' : '<button class="btn btn-ghost btn-xs" data-act="pver" data-id="' + h(v.ID) + '">' + tr('Aktifkan', 'Activate') + '</button>') + '</div>').join('') + '</div>' : '') + '</div></div>';
    if (innerWidth < 900) $('#or-pg', box).style.gridTemplateColumns = 'minmax(0,1fr)';
  },
  async psave(btn) {
    const d = { Kode: this.pk, Nama: $('#pm-nama', this.el).value, Sistem: $('#pm-sis', this.el).value, Template: $('#pm-tpl', this.el).value, Suhu: $('#pm-suhu', this.el).value };
    UI.busy(btn, true); const r = await API.call('prompt.save', d, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) this.reloadPrompt();
  },
  async pprev(btn) {
    UI.busy(btn, true); const r = await API.read('prompt.preview', { Kode: this.pk, Sistem: $('#pm-sis', this.el).value, Template: $('#pm-tpl', this.el).value }); UI.busy(btn, false);
    if (!r.success) return UI.toast(r.message, 'err');
    UI.modal({ title: tr('Pratinjau prompt ', 'Prompt preview ') + this.pk, kicker: tr('Variabel diisi dari Branding Kit default', 'Variables filled from the default Branding Kit'), size: 'wide', body: '<div class="label">' + tr('Sistem', 'System') + '</div><div class="code mt-8" style="white-space:pre-wrap">' + h(r.data.sistem) + '</div><div class="label mt-16">Template</div><div class="code mt-8" style="white-space:pre-wrap">' + h(r.data.template) + '</div>', foot: '<button class="btn btn-ink" data-x>OK</button>' });
  },
  async preset(btn) {
    if (!(await UI.confirm(tr('Kembalikan prompt ' + this.pk + ' ke default (disimpan sebagai versi baru)?', 'Reset prompt ' + this.pk + ' to default (saved as a new version)?')))) return;
    UI.busy(btn, true); const r = await API.call('prompt.reset', { Kode: this.pk }, { noBootRefresh: true }); UI.busy(btn, false); if (r.success) this.reloadPrompt();
  },
  async pver(btn) { UI.busy(btn, true); const r = await API.call('prompt.reset', { Kode: this.pk, versiId: btn.dataset.id }, { noBootRefresh: true }); UI.busy(btn, false); if (r.success) this.reloadPrompt(); },
  reloadPrompt() { API.read('prompt.list', {}).then((r) => { if (r.success) { this.prompts = r.data; this.paintPrompt(); } }); },
  /* ---------- Log ---------- */
  muatLog(btn) {
    if (btn) UI.busy(btn, true);
    API.read('ai.logs', {}).then((r) => { if (btn) UI.busy(btn, false); if (r.success) { this.logs = r.data; this.paintLog(); } });
  },
  paintLog() {
    const all = this.logs || [], n = { '': all.length, OK: 0, GAGAL: 0, CACHE: 0 };
    all.forEach((l) => { if (l.Cache === 'YA') n.CACHE++; else if (l.Status === 'OK') n.OK++; else n.GAGAL++; });
    $('#or-logf', this.el).innerHTML = [['', tr('Semua', 'All')], ['OK', 'OK'], ['CACHE', 'Cache'], ['GAGAL', tr('Gagal', 'Failed')]].map((x) => '<button class="' + (this.logF === x[0] ? 'on' : '') + '" data-act="logf" data-v="' + x[0] + '">' + x[1] + ' <span class="mono xs tert">' + n[x[0]] + '</span></button>').join('');
    const rows = all.filter((l) => !this.logF || (this.logF === 'CACHE' ? l.Cache === 'YA' : this.logF === 'OK' ? l.Status === 'OK' && l.Cache !== 'YA' : l.Status !== 'OK' && l.Cache !== 'YA')).slice(0, 120);
    $('#or-log', this.el).innerHTML = rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + tr('Waktu', 'Time') + '</th><th>' + tr('Modul', 'Module') + '</th><th>Prompt</th><th>Provider · model</th><th class="tr">ms</th><th class="tr">Token</th><th class="tr">$</th><th>Status</th></tr></thead><tbody>' +
      rows.map((l) => '<tr><td class="mono xs">' + h(Fmt.dt(l.Tanggal)) + '</td><td class="small">' + h(l.Modul) + '</td><td class="mono xs">' + h(l.PromptKode) + (l.VersiPrompt ? ' v' + h(l.VersiPrompt) : '') + '</td><td class="small">' + h(l.Provider) + ' <span class="mono xs tert">' + h(l.Model) + '</span></td><td class="tr num small">' + Fmt.n(l.DurasiMs) + '</td><td class="tr num small">' + Fmt.n(Number(l.TokenMasuk || 0) + Number(l.TokenKeluar || 0)) + '</td><td class="tr num small">' + Number(l.Biaya || 0).toFixed(4) + '</td><td>' + (l.Cache === 'YA' ? '<span class="pill sm mono p-lav">CACHE</span>' : '<span class="pill sm mono ' + (l.Status === 'OK' ? 'p-ok' : 'p-danger') + '" title="' + h(l.Pesan || '') + '">' + h(l.Status) + '</span>') + '</td></tr>').join('') + '</tbody></table></div>'
      : UI.empty('receipt_long', tr('Belum ada log AI', 'No AI logs yet'), tr('Log muncul setelah Anda memakai Generator, Copy Studio, Strategy, atau Approval.', 'Logs appear after you use the Generator, Copy Studio, Strategy or Approval.'));
  },
  async cacheClear(btn) { UI.busy(btn, true); await API.call('ai.cacheClear', {}, { noBootRefresh: true }); UI.busy(btn, false); this.segar(); }
});
