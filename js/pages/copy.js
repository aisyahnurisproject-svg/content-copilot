/* Modul 5 — AI Copywriting Studio: framework persuasi, Hook Matrix Lab, Full Story & Caption Studio, Snippet Vault */
'use strict';
Pages.def('copy', {
  FW: [['PAS', 'Pain • Agitate • Solve'], ['AIDA', 'Attention • Desire'], ['BAB', 'Before • Bridge'], ['Contrarian', 'Polarizing truth'], ['Storytelling', 'Story arc'], ['Curiosity', 'Open loop']],
  DEST: ['Instagram Carousel', 'Instagram Reels', 'TikTok Script', 'Threads Stack', 'Substack Post', 'LinkedIn Post', 'WhatsApp Broadcast'],
  BATAS: { 'Instagram Carousel': 2200, 'Instagram Reels': 2200, 'TikTok Script': 4000, 'Threads Stack': 500, 'Substack Post': 100000, 'LinkedIn Post': 3000, 'WhatsApp Broadcast': 65000 },
  marquee() { return ['Module 05 // AI Copywriting Studio', 'Emotional hooks & conversion frameworks', 'Synced with Google Sheets [KONTEN]', 'High-converting editorial narratives']; },
  render(el, params) {
    this.el = el; this.fw = 'PAS'; this.dest = 'Instagram Carousel'; this.hooks = []; this.sel = 0; this.cap = null; this.kid = params.id || '';
    this.draft = Store.get('copy-draft', null);
    bindActs(el, {
      fw: (b) => { this.fw = b.dataset.v; $$('[data-act=fw]', el).forEach((x) => { const on = x === b; x.classList.toggle('is-sel', on); x.style.background = on ? 'var(--blush)' : ''; }); },
      dest: (b) => { this.dest = b.dataset.v; $$('[data-act=dest]', el).forEach((x) => x.classList.toggle('on', x === b)); this.count(); },
      hooks: (b) => this.genHooks(b), synth: (b) => this.synth(b), pick: (b) => { this.sel = +b.dataset.i; this.paintHooks(); },
      inject: (b) => this.inject(b, +b.dataset.i), tweak: (b) => this.tweak(b), copyHook: (b) => this.salin(this.hooks[+b.dataset.i].teks, b), copyAll: (b) => this.salin($('#cp-ed', el).value, b),
      fmt: (b) => this.format(b.dataset.f), snip: (b) => this.simpan(b), push: (b) => this.push(b), bulk: () => this.bulk(), matrix: () => this.matrix(),
      vault: (b) => this.muat(b.dataset.id), tag: (b) => { const ed = $('#cp-ed', el); ed.value = ed.value.replace(/\s*$/, '') + ' ' + b.dataset.v; this.count(); this.autosave(); }
    });
    el.addEventListener('input', (e) => { if (e.target.id === 'cp-ed') { this.count(); this.autosave(); } });
    this.paint();
    if (this.kid) this.muat(this.kid); else if (this.draft && this.draft.teks) { $('#cp-ed', el).value = this.draft.teks; this.count(); }
    this.vaultLoad();
  },
  paint() {
    const el = this.el, p = App.produk(), prof = App.profil() || {}, masalah = pj(prof.MasalahAudiens, []);
    el.innerHTML = '<header class="row between top wrap gap-24"><div class="col gap-12" style="max-width:720px"><div class="row gap-8"><span class="pill p-blush">🍒 Conversion Lab</span><span class="pill sm mono p-sage"><span class="dot"></span>GAS Synced</span></div><h1 class="h1">words that sell <span class="it">without feeling</span> like a sales pitch.</h1><p class="muted">' + tr('Kurasi hook organik yang menghentikan scroll, alur narasi psikologis, dan caption editorial yang selaras dengan ekosistem peluncuran produk digital Anda.', 'Curate scroll-stopping organic hooks, psychological narrative arcs, and editorial captions aligned with your digital launch ecosystem.') + '</p></div>' +
      '<div class="row wrap gap-10" style="gap:10px"><button class="btn btn-ink shine" data-act="hooks">' + ic('auto_awesome', 'sm') + tr('Generate 10 Hooks', 'Generate 10 Hooks') + '</button><button class="btn btn-ghost" data-act="bulk">' + ic('library_books', 'sm') + 'Bulk Captions</button><button class="btn btn-ghost" data-act="matrix">' + ic('tune', 'sm') + 'Formula Matrix</button></div></header>' +
      '<div class="grid mt-24" style="grid-template-columns:minmax(0,3fr) minmax(0,4fr) minmax(0,5fr);align-items:start" id="cp-grid">' +
      // kiri: parameter
      '<section class="card col gap-16" id="cp-par"><div class="row between"><span class="row gap-8"><span class="dot"></span><span class="label">01 // ' + tr('Parameter', 'Parameters') + '</span></span><span class="pill sm mono p-sage">' + tr('Aktif', 'Active') + '</span></div>' +
        '<div class="field"><label>Persuasion framework <span class="opt">Psychology</span></label><div class="grid g2" style="gap:8px">' + this.FW.map((f) => '<button class="tile' + (f[0] === this.fw ? ' is-sel' : '') + '" style="text-align:left;padding:10px;' + (f[0] === this.fw ? 'background:var(--blush)' : '') + '" data-act="fw" data-v="' + f[0] + '"><b class="small">' + f[0] + '</b><span class="xs muted" style="display:block">' + f[1] + '</span></button>').join('') + '</div></div>' +
        '<div class="field"><label>' + tr('Target offer / aset digital', 'Target offer / digital asset') + '</label><select class="sel sm" id="cp-prod"><option value="">—</option>' + opts(p.map((x) => ({ v: x.ID, l: x.Nama + ' · ' + x.Peran })), (p.find((x) => x.Peran === 'Lead Magnet') || p[0] || {}).ID) + '</select></div>' +
        '<div class="field"><label>' + tr('Angle inti / topik', 'Core angle / topic') + '</label><textarea class="ta" id="cp-angle" rows="3" placeholder="' + tr('mis. kenapa feed estetik tapi sepi pembeli', 'e.g. why an aesthetic feed still has no buyers') + '">' + h((masalah[0] && (masalah[0].teks || masalah[0])) || '') + '</textarea></div>' +
        '<div class="field"><label>Format & destination</label><div class="chips">' + this.DEST.map((d) => '<button class="chip' + (d === this.dest ? ' on' : '') + '" data-act="dest" data-v="' + h(d) + '" style="height:28px;font-size:12px">' + h(d) + '</button>').join('') + '</div></div>' +
        '<div class="field"><label>Editorial persona <span class="opt">' + h(String((App.kit() || {}).Nada || '').split(',')[0] || '') + '</span></label><input class="inp sm" id="cp-persona" value="' + h(prof.Persona || 'Poised, warm, intimate') + '"></div>' +
        '<div class="field"><label>' + tr('Panjang caption', 'Caption length') + '</label><div class="seg" id="cp-len">' + [['pendek', tr('Pendek', 'Short')], ['sedang', tr('Sedang', 'Medium')], ['panjang', tr('Panjang', 'Long')]].map((x, i) => '<button class="' + (i === 1 ? 'on' : '') + '" data-v="' + x[0] + '" onclick="this.parentNode.querySelectorAll(\'button\').forEach(b=>b.classList.remove(\'on\'));this.classList.add(\'on\')">' + x[1] + '</button>').join('') + '</div></div>' +
        '<button class="btn btn-sage btn-block" data-act="synth">' + ic('magic_button', 'sm') + 'Synthesize Copy Set</button></section>' +
      // tengah: hook lab
      '<section class="card paper col gap-12" style="background:var(--paper-2)"><div class="row between"><span class="row gap-8"><span class="dot ink"></span><span class="label">02 // Hook Matrix Lab</span></span><span class="xs muted" id="cp-hn">0 / 10</span></div>' +
        '<div class="chips nowrap"><button class="chip" data-act="tweak" data-g="lebih relatable, santai">☕ More Relatable</button><button class="chip" data-act="tweak" data-g="lebih berani dan polarizing">🔥 Add Polarity</button><button class="chip" data-act="tweak" data-g="punchy di bawah 70 karakter">⚡ Punchy &lt;70</button><button class="chip" data-act="tweak" data-g="formal profesional">👔 Formal</button></div>' +
        '<div id="cp-hooks" class="col gap-12">' + UI.empty('bolt', tr('Belum ada hook', 'No hooks yet'), tr('Klik <b>Generate 10 Hooks</b> atau <b>Synthesize</b>.', 'Click <b>Generate 10 Hooks</b> or <b>Synthesize</b>.')) + '</div>' +
        '<div class="card sage tight row between" id="cp-bench"><div><div class="label" style="color:var(--sage-ink)">Hook performance benchmark</div><div class="h3" id="cp-bench-t">—</div></div><div class="avatar" style="background:#fff;font:700 13px var(--f-mono);color:var(--sage-ink)" id="cp-grade">–</div></div></section>' +
      // kanan: editor
      '<section class="card col gap-12"><div class="row between wrap gap-8"><span class="row gap-8"><span class="dot"></span><span class="label">03 // Full Story & Caption Studio</span></span><span class="row gap-8"><span class="mono xs" id="cp-n">0</span><button class="btn btn-ghost btn-xs" data-act="copyAll">' + ic('content_copy', 'xs') + tr('Salin semua', 'Copy all') + '</button></span></div>' +
        '<div class="inset row between" style="padding:6px 10px"><div class="row gap-4">' + [['bold', 'format_bold', 'B'], ['list', 'format_list_bulleted'], ['quote', 'format_quote'], ['emoji', 'sentiment_satisfied'], ['upper', 'text_fields'], ['line', 'horizontal_rule']].map((x) => '<button class="icon-btn sm ghost" data-act="fmt" data-f="' + x[0] + '" title="' + x[0] + '" aria-label="' + x[0] + '">' + ic(x[1], 'sm') + '</button>').join('') + '</div><span class="row gap-6 xs" style="color:var(--sage-ink)"><b>Auto-save</b><span class="dot pulse"></span></span></div>' +
        '<textarea class="ta" id="cp-ed" rows="18" style="min-height:420px;font-size:14.5px;line-height:1.65" placeholder="' + tr('Hook lead, cerita, poin kunci, CTA, hashtag — semua di sini. Tulis manual atau biarkan AI menyusun.', 'Hook lead, story, key points, CTA, hashtags — all here. Write manually or let AI compose.') + '"></textarea>' +
        '<div id="cp-sticker" class="card sage tight" hidden></div><div><div class="label mb-8">Hashtags & discoverability</div><div class="chips" id="cp-tags"><span class="xs muted">—</span></div></div>' +
        '<div class="row between wrap gap-8"><button class="btn btn-ghost btn-sm" data-act="snip">' + ic('draw', 'sm') + (this.kid ? tr('Simpan ke konten', 'Save to content') : 'Save to Snippets') + '</button><button class="btn btn-ink btn-sm" data-act="push">' + ic('send_to_mobile', 'sm') + tr('Kirim ke Graphic Studio', 'Push to Graphic Studio') + '</button></div></section></div>' +
      '<section class="mt-32"><div class="row between wrap gap-12 mb-16"><div><span class="row gap-8"><span class="dot"></span><span class="label">Archive & Sync</span></span><h2 class="h2 mt-4">Saved Snippet Vault &amp; GAS Sheet [KONTEN]</h2></div><span class="xs muted row gap-6"><span class="dot"></span>' + tr('Tersambung ke tab', 'Connected to tab') + ': <b>"Konten"</b></span></div><div class="grid g3" id="cp-vault">' + UI.sk(3) + '</div></section>';
    if (innerWidth < 1200) $('#cp-grid', el).style.gridTemplateColumns = innerWidth < 800 ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)';
  },
  vals() { return { framework: this.fw, produkId: $('#cp-prod', this.el).value, angle: $('#cp-angle', this.el).value, platform: this.dest, persona: $('#cp-persona', this.el).value, panjang: ($('#cp-len .on', this.el) || {}).dataset ? $('#cp-len .on', this.el).dataset.v : 'sedang', kitId: App.kitId() }; },
  async genHooks(btn, fresh) {
    const v = this.vals(); if (!v.angle.trim()) { UI.toast(tr('Isi angle inti dulu.', 'Add a core angle first.'), 'warn'); return false; }
    UI.busy(btn, true, tr('Meracik hook…', 'Crafting hooks…'));
    const r = await API.call('copy.hooks', Object.assign(v, { jumlah: 10, fresh: !!fresh }), { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) return false;
    this.hooks = r.data.hooks; this.sel = 0; this.meta = r.data.meta;
    if (r.data.meta.fallback) UI.toast(r.data.meta.pesan, 'warn');
    this.paintHooks();
    return true;
  },
  paintHooks() {
    const box = $('#cp-hooks', this.el), hs = this.hooks;
    $('#cp-hn', this.el).textContent = hs.length + ' / 10 ' + tr('dimuat', 'loaded');
    box.innerHTML = hs.map((x, i) => '<article class="card tight hoverable col gap-8" style="cursor:pointer;' + (i === this.sel ? 'background:linear-gradient(90deg,var(--blush),#fff);box-shadow:0 0 0 1.5px var(--ink)' : '') + '" data-act="pick" data-i="' + i + '"><div class="row between"><span class="pill sm mono ' + (x.skor >= 95 ? 'p-sage2' : x.skor >= 90 ? 'p-sage' : 'p-blush') + '">★ score ' + x.skor + '/100</span><span class="row gap-4"><span class="label">' + h(x.angle || '') + '</span><button class="icon-btn sm ghost" data-act="copyHook" data-i="' + i + '" aria-label="' + tr('Salin', 'Copy') + '">' + ic('content_copy', 'sm') + '</button></span></div><p class="serif" style="font-size:19px;font-weight:600;line-height:1.35">“' + h(x.teks) + '”</p><div class="row between"><span class="xs muted row gap-4">' + ic('trending_up', 'xs') + h((x.metrik && x.metrik.label) || 'Viral potential') + ': ' + h((x.metrik && x.metrik.nilai) || '—') + '</span><button class="btn-text" data-act="inject" data-i="' + i + '" style="color:var(--blush-ink)">' + (i === this.sel && this.cap ? 'Loaded in caption ➔' : 'Inject to body') + '</button></div></article>').join('');
    const avg = hs.length ? Math.round(hs.reduce((s, x) => s + x.skor, 0) / hs.length) : 0;
    $('#cp-bench-t', this.el).textContent = avg ? 'Top ' + Math.max(1, 100 - avg) + '% creator percentile' : '—';
    $('#cp-grade', this.el).textContent = avg >= 92 ? 'A+' : avg >= 86 ? 'A' : avg >= 80 ? 'B+' : avg ? 'B' : '–';
  },
  async synth(btn) {
    UI.busy(btn, true, tr('Mensintesis…', 'Synthesizing…'));
    const ok = this.hooks.length ? true : await this.genHooks(null);
    if (ok) await this.inject(null, this.sel);
    UI.busy(btn, false);
  },
  async inject(btn, i) {
    const hk = this.hooks[i]; if (!hk) return;
    this.sel = i;
    UI.busy(btn, true, '…');
    const r = await API.call('copy.caption', Object.assign(this.vals(), { hook: hk.teks }), { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) return;
    this.cap = r.data.caption;
    $('#cp-ed', this.el).value = this.susun(this.cap);
    this.count(); this.autosave(); this.paintHooks();
    const st = $('#cp-sticker', this.el);
    if (this.cap.instruksiSticker) { st.hidden = false; st.innerHTML = '<div class="label" style="color:var(--sage-ink)">02 // Conversion trigger & sticker instruction</div><p class="small mt-4">' + h(this.cap.instruksiSticker) + '</p>'; }
    $('#cp-tags', this.el).innerHTML = (this.cap.hashtag || []).map((t) => '<button class="chip" data-act="tag" data-v="' + h(t.tag || t) + '" style="height:28px"><span>' + h(t.tag || t) + '</span><span class="n">' + h(t.relevansi || '') + '</span></button>').join('') || '<span class="xs muted">—</span>';
  },
  susun(c) {
    const poin = (c.poin || []).map((p, i) => ('0' + (i + 1)).slice(-2) + '. ' + p.judul + (p.isi ? ' — ' + p.isi : '')).join('\n');
    return [c.hookLead, (c.paragraf || []).join('\n\n'), poin, c.cta, (c.hashtag || []).map((t) => t.tag || t).join(' ')].filter(Boolean).join('\n\n');
  },
  count() {
    const v = ($('#cp-ed', this.el) || {}).value || '', lim = this.BATAS[this.dest] || 2200, n = $('#cp-n', this.el);
    if (n) { n.textContent = Fmt.n(v.length) + ' / ' + Fmt.n(lim) + tr(' karakter', ' chars'); n.style.color = v.length > lim ? 'var(--danger)' : ''; }
  },
  autosave: debounce(function () { Store.set('copy-draft', { teks: ($('#cp-ed', this.el) || {}).value || '', at: Date.now() }); }, 600),
  async tweak(btn) {
    const hk = this.hooks[this.sel]; if (!hk) return UI.toast(tr('Pilih hook dulu.', 'Pick a hook first.'), 'warn');
    UI.busy(btn, true, '…');
    const r = await API.call('copy.rewrite', { teks: hk.teks, gaya: btn.dataset.g, kitId: App.kitId(), fresh: true }, { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) return;
    hk.teks = r.data.teks; hk.angle = btn.textContent.replace(/[^\w\s<]/g, '').trim();
    (r.data.varian || []).slice(0, 2).forEach((v) => this.hooks.splice(this.sel + 1, 0, { teks: v, skor: Math.max(70, hk.skor - 3), angle: 'Varian', metrik: {} }));
    this.hooks = this.hooks.slice(0, 12);
    this.paintHooks();
  },
  format(f) {
    const ed = $('#cp-ed', this.el), a = ed.selectionStart, b = ed.selectionEnd, s = ed.value.slice(a, b);
    const map = { bold: () => '*' + (s || tr('teks tebal', 'bold text')) + '*', list: () => (s || tr('poin', 'point')).split('\n').map((l) => '• ' + l.replace(/^•\s*/, '')).join('\n'), quote: () => '“' + (s || 'kutipan') + '”', emoji: () => s + ' 🍒', upper: () => s.toUpperCase(), line: () => s + '\n— — —\n' };
    const out = map[f](); ed.setRangeText(out, a, b, 'end'); ed.focus(); this.count(); this.autosave();
  },
  salin(t, btn) {
    const ok = () => { const o = btn.innerHTML; btn.innerHTML = ic('check', 'xs') + tr('Tersalin!', 'Copied!'); setTimeout(() => { btn.innerHTML = o; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, () => UI.toast(tr('Gagal menyalin', 'Copy failed'), 'err'));
    else { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok(); }
  },
  pisah() {
    const v = $('#cp-ed', this.el).value, tags = (v.match(/#[\wÀ-ɏ]+/g) || []).slice(0, 30), tanpa = v.replace(/(\s*#[\wÀ-ɏ]+)+\s*$/g, '').trim();
    const cta = (this.cap && this.cap.cta) || (tanpa.split('\n').filter(Boolean).pop() || '');
    return { Caption: tanpa, Hashtag: tags.join(' '), CTA: cta, judul: (this.hooks[this.sel] || {}).teks || tanpa.split('\n')[0].slice(0, 120) };
  },
  async simpan(btn) {
    const p = this.pisah(); if (!p.Caption) return UI.toast(tr('Editor masih kosong.', 'Editor is empty.'), 'warn');
    UI.busy(btn, true);
    const d = this.kid ? { ID: this.kid, Caption: p.Caption, Hashtag: p.Hashtag, CTA: p.CTA, Copywriting: p.judul } : { Judul: p.judul, Jenis: 'Caption', Platform: this.dest.split(' ')[0] === 'TikTok' ? 'TikTok' : this.dest.split(' ')[0], Caption: p.Caption, Hashtag: p.Hashtag, CTA: p.CTA, Copywriting: p.judul, ProdukID: $('#cp-prod', this.el).value, KitID: App.kitId(), Pilar: (App.pilar()[0] || {}).nama || '', SkorHook: (this.hooks[this.sel] || {}).skor || 0 };
    const r = await API.call('konten.save', d, { toast: false });
    UI.busy(btn, false);
    if (r.success) { UI.toast(this.kid ? tr('Caption disimpan ke konten ✓', 'Caption saved to content ✓') : tr('Tersimpan di Snippet Vault ✓', 'Saved to Snippet Vault ✓'), 'ok'); Store.del('copy-draft'); this.vaultLoad(true); }
  },
  async push(btn) {
    const p = this.pisah(); if (!p.Caption) return UI.toast(tr('Editor masih kosong.', 'Editor is empty.'), 'warn');
    if (this.kid) { await this.simpan(btn); Router.go('graphic', { id: this.kid }); return; }
    const c = this.cap || {}, slides = [{ judul: c.hookLead || p.judul, isi: tr('Geser untuk selengkapnya →', 'Swipe for more →') }].concat((c.poin || []).map((x) => ({ judul: x.judul, isi: x.isi }))).concat([{ judul: tr('Simpan ini', 'Save this'), isi: p.CTA }]);
    UI.busy(btn, true);
    const r = await API.call('konten.save', { Judul: p.judul, Jenis: 'Carousel', Platform: 'Instagram', Caption: p.Caption, Hashtag: p.Hashtag, CTA: p.CTA, Slides: slides, ProdukID: $('#cp-prod', this.el).value, KitID: App.kitId(), SkorHook: (this.hooks[this.sel] || {}).skor || 0 }, { toast: false });
    UI.busy(btn, false);
    if (r.success) Router.go('graphic', { id: r.data.ID });
  },
  async muat(id) {
    const r = await API.read('konten.get', { id }); if (!r.success) return UI.toast(r.message, 'err');
    const k = r.data; this.kid = k.ID;
    $('#cp-ed', this.el).value = [k.Caption, k.Hashtag].filter(Boolean).join('\n\n');
    if (k.Copywriting || k.Judul) this.hooks = [{ teks: k.Copywriting || k.Judul, skor: k.SkorHook || 85, angle: tr('Dari konten', 'From content'), metrik: {} }].concat(this.hooks.slice(0, 9));
    this.paintHooks(); this.count();
    $('[data-act=snip]', this.el).innerHTML = ic('draw', 'sm') + tr('Simpan ke konten', 'Save to content');
    UI.toast(tr('Memuat caption: ', 'Loaded caption: ') + k.Judul, 'info');
  },
  vaultLoad(fresh) {
    API.swr('konten.list', { jenis: 'Caption', limit: 6 }, { fresh, maxAge: 20000, onData: (d) => {
      const box = $('#cp-vault', this.el); if (!box) return;
      const warna = ['blush', 'sage', ''];
      box.innerHTML = d.rows.length ? d.rows.map((k, i) => '<article class="card ' + warna[i % 3] + ' hover col gap-12" style="justify-content:space-between"><div class="row between"><span class="pill sm mono" style="background:#fff">' + h(k.Platform) + ' • ' + h(stLabel(k.Status)) + '</span><span class="mono xs tert">#' + h(String(k.ID).slice(-5)) + '</span></div><div><h3 class="h3">“' + h(k.Judul) + '”</h3><p class="small muted mt-8 clamp-3">' + h(k.Caption) + '</p></div><div class="row between"><span class="xs muted">' + h(Fmt.rel(k.DiperbaruiPada)) + '</span><button class="btn btn-ghost btn-xs" data-act="vault" data-id="' + h(k.ID) + '">' + tr('Edit vault', 'Edit vault') + '</button></div></article>').join('')
        : '<div class="card full">' + UI.empty('inventory_2', tr('Vault masih kosong', 'Vault is empty'), tr('Simpan caption terbaik Anda dengan tombol Save to Snippets.', 'Save your best captions with Save to Snippets.')) + '</div>';
    } });
  },
  async bulk() {
    if (!this.hooks.length) return UI.toast(tr('Generate hook dulu.', 'Generate hooks first.'), 'warn');
    const m = UI.modal({ title: 'Bulk Captions', kicker: tr('Buat caption untuk beberapa hook sekaligus', 'Write captions for several hooks at once'), size: 'wide',
      body: '<div class="col gap-8">' + this.hooks.slice(0, 6).map((x, i) => '<label class="tile row gap-10"><input type="checkbox" class="bk" value="' + i + '"' + (i < 3 ? ' checked' : '') + '><span class="grow small">' + h(x.teks) + '</span><span class="mono xs">' + x.skor + '</span></label>').join('') + '</div><div id="bk-out" class="col gap-8 mt-16"></div>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Tutup', 'Close') + '</button><button class="btn btn-ink" id="bk-go">' + ic('library_books', 'sm') + tr('Buat & simpan ke Vault', 'Create & save to Vault') + '</button>' });
    $('#bk-go', m.el.parentNode).onclick = async (e) => {
      const btn = e.currentTarget, idx = $$('.bk:checked', m.el).map((c) => +c.value), out = $('#bk-out', m.el);
      UI.busy(btn, true);
      for (const i of idx) {
        const hk = this.hooks[i], r = await API.call('copy.caption', Object.assign(this.vals(), { hook: hk.teks }), { toast: false, silent: true, noBootRefresh: true });
        if (!r.success) continue;
        const c = r.data.caption, teks = this.susun(c);
        const s = await API.call('konten.save', { Judul: hk.teks.slice(0, 140), Jenis: 'Caption', Platform: this.dest.split(' ')[0], Caption: teks.replace(/(\s*#\S+)+\s*$/, ''), CTA: c.cta, Hashtag: (c.hashtag || []).map((t) => t.tag || t).join(' '), Copywriting: hk.teks, KitID: App.kitId(), SkorHook: hk.skor, ProdukID: $('#cp-prod', this.el).value }, { toast: false, silent: true, noBootRefresh: true });
        out.insertAdjacentHTML('beforeend', '<div class="tile row gap-8 small">' + ic(s.success ? 'check_circle' : 'error', 'sm') + h(hk.teks) + '</div>');
      }
      UI.busy(btn, false); btn.hidden = true; this.vaultLoad(true); App.refreshBoot(true);
    };
  },
  matrix() {
    const rows = [['PAS', 'Masalah → perparah → solusi', 'Edukasi, soft-sell, lead magnet'], ['AIDA', 'Perhatian → minat → keinginan → aksi', 'Peluncuran produk, promo'], ['BAB', 'Sebelum → sesudah → jembatan', 'Studi kasus, testimoni proses'], ['Contrarian', 'Bantah mitos dengan alasan & bukti', 'Otoritas, opini, thread'], ['Storytelling', 'Konflik → titik balik → pelajaran', 'Behind-the-scenes, personal brand'], ['Curiosity', 'Buka rasa penasaran, tutup di akhir', 'Hook video, carousel']];
    UI.modal({ title: 'Formula Matrix', kicker: tr('Kapan memakai framework apa', 'When to use which framework'), size: 'wide', body: '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Framework</th><th>' + tr('Alur', 'Flow') + '</th><th>' + tr('Paling cocok untuk', 'Best for') + '</th></tr></thead><tbody>' + rows.map((r) => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td class="muted">' + r[2] + '</td></tr>').join('') + '</tbody></table></div><p class="xs muted mt-12">' + tr('Aturan emas: satu konten, satu CTA. Bacakan caption dengan suara — buang kalimat yang terdengar seperti iklan.', 'Golden rule: one post, one CTA. Read captions aloud — cut anything that sounds like an ad.') + '</p>' });
  }
});
