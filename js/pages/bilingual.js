/* Modul 12 — Bilingual & Lokal: bahasa antarmuka, bahasa konten default, lokalisasi konten ID ⇄ EN berdampingan */
'use strict';
Pages.def('bilingual', {
  marquee() { return ['Module 12 // Bilingual & Localization', 'Bahasa Indonesia ⇄ English', 'Synced with Google Sheets [PEMILIK · KONTEN]', 'Localize, not translate word-by-word']; },
  render(el, params) {
    this.el = el; this.rows = null; this.src = null; this.ke = 'en'; this.hasil = null; this.q = ''; this.fb = '';
    const me = (App.boot && App.boot.me) || {};
    this.konten = me.BahasaKonten || 'id';
    bindActs(el, {
      ui: (b) => this.setUi(b.dataset.v), kb: (b) => this.setKonten(b.dataset.v), src: (b) => this.muatSrc(b.dataset.id), ke: (b) => { this.ke = b.dataset.v; this.siapkan(); }, fb: (b) => { this.fb = b.dataset.v; this.list(); },
      ai: (b) => this.terjemah(b), salin: () => this.salinAsli(), simpan: (b) => this.simpan(b), copy: () => { const c = $('#bl-cap', this.el); if (c) { navigator.clipboard && navigator.clipboard.writeText(c.value); UI.toast(tr('Caption disalin.', 'Caption copied.'), 'ok'); } }, open: (b) => Router.go('generator', { id: b.dataset.id })
    });
    const ai = (App.boot && App.boot.ai) || {}, aiOn = ai.provider && ai.provider !== 'template';
    el.innerHTML = App.hero({ word: 'W-12', pills: '<span class="pill mono p-lav">ID ⇄ EN</span><span class="pill mono ' + (aiOn ? 'p-sage' : 'p-butter') + '">' + (aiOn ? 'AI: ' + h(ai.label || ai.provider) : tr('Mode manual (tanpa API)', 'Manual mode (no API)')) + '</span>',
      title: tr('dua bahasa. <span class="it">satu suara brand.</span>', 'two languages. <span class="it">one brand voice.</span>'),
      sub: tr('Atur bahasa antarmuka & bahasa konten, lalu lokalisasi konten terbaik Anda ke audiens global — tetap dengan nada, CTA, dan hashtag yang terasa natural.', 'Set your interface & content language, then localize your best content for a global audience — keeping tone, CTA and hashtags natural.') }) +
      '<div class="grid g3 mt-24" id="bl-pref"></div>' +
      '<div class="grid mt-24" id="bl-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr);align-items:start"><section class="card col gap-12"><div class="label">01 // ' + tr('Konten sumber', 'Source content') + '</div><input class="inp sm" id="bl-q" placeholder="' + tr('Cari konten…', 'Search content…') + '"><div class="seg w-100" id="bl-fb"></div><div id="bl-list" class="col gap-8" style="max-height:620px;overflow:auto">' + UI.sk(4, 'sk-line') + '</div></section><section id="bl-work" class="col gap-16" style="gap:16px"></section></div>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><div class="label">' + tr('Pasangan terjemahan', 'Translation pairs') + '</div><h2 class="h2 mt-4">' + tr('Riwayat lokalisasi', 'Localization history') + '</h2></div></div><div id="bl-pairs">' + UI.sk(2, 'sk-line') + '</div></section>';
    if (innerWidth < 1000) $('#bl-grid', el).style.gridTemplateColumns = 'minmax(0,1fr)';
    $('#bl-q', el).addEventListener('input', debounce(() => { this.q = $('#bl-q', el).value.toLowerCase(); this.list(); }, 200));
    this.paintPref(); this.paintWork();
    API.swr('konten.list', { limit: 300 }, { maxAge: 20000, onData: (d) => { this.rows = d.rows; this.list(); this.pairs(); } });
    if (params.id) this.muatSrc(params.id);
  },
  paintPref() {
    const seg = (act, cur) => '<div class="seg">' + [['id', '🇮🇩 Indonesia'], ['en', '🇬🇧 English']].map((x) => '<button class="' + (cur === x[0] ? 'on' : '') + '" data-act="' + act + '" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
    const now = new Date(), d = Fmt.today(), en = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now), idt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now);
    $('#bl-pref', this.el).innerHTML =
      '<div class="card col gap-10"><div class="row gap-8"><span class="ico-dot sm line">' + ic('translate', 'sm') + '</span><div class="label">' + tr('Bahasa antarmuka', 'Interface language') + '</div></div>' + seg('ui', LANG) + '<p class="xs muted">' + tr('Menu, tombol, dan pesan aplikasi. Tersimpan di profil pemilik.', 'Menus, buttons and app messages. Saved to the owner profile.') + '</p></div>' +
      '<div class="card col gap-10"><div class="row gap-8"><span class="ico-dot sm line">' + ic('edit_note', 'sm') + '</span><div class="label">' + tr('Bahasa konten default', 'Default content language') + '</div></div>' + seg('kb', this.konten) + '<p class="xs muted">' + tr('Bahasa hasil Generator, Copy Studio, dan template pesan.', 'Language for Generator, Copy Studio and message templates.') + '</p></div>' +
      '<div class="card paper col gap-8"><div class="label">' + tr('Format lokal', 'Locale formats') + '</div><div class="grid g2 small" style="gap:8px"><div class="mini"><div class="mono xs tert">ID</div><div>' + h(idt) + '</div><div>Rp 149.000</div><div>1.250,5</div></div><div class="mini"><div class="mono xs tert">EN</div><div>' + h(en) + '</div><div>IDR 149,000</div><div>1,250.5</div></div></div><p class="xs muted">' + tr('Zona waktu tetap WIB (Asia/Jakarta) — ', 'Time zone stays WIB (Asia/Jakarta) — ') + h(d) + '</p></div>';
  },
  async setUi(l) {
    if (l === LANG) return;
    setLang(l); Store.set('langManual', true);
    API.call('lokal.save', { BahasaUI: l }, { toast: false, silent: true, noBootRefresh: true });
    App.showShell();
  },
  async setKonten(l) {
    if (l === this.konten) return;
    const lama = this.konten; this.konten = l; this.paintPref();
    const r = await API.call('lokal.save', { BahasaKonten: l }, { toast: false });
    if (!r.success) { this.konten = lama; this.paintPref(); } else { if (App.boot && App.boot.me) App.boot.me.BahasaKonten = l; UI.toast(tr('Bahasa konten default: ', 'Default content language: ') + (l === 'en' ? 'English' : 'Indonesia'), 'ok'); }
  },
  list() {
    const box = $('#bl-list', this.el); if (!box || !this.rows) return;
    const n = { '': 0, id: 0, en: 0 }; this.rows.forEach((k) => { n['']++; n[k.Bahasa === 'en' ? 'en' : 'id']++; });
    $('#bl-fb', this.el).innerHTML = [['', tr('Semua', 'All')], ['id', 'ID'], ['en', 'EN']].map((x) => '<button class="grow' + (this.fb === x[0] ? ' on' : '') + '" data-act="fb" data-v="' + x[0] + '">' + x[1] + ' <span class="mono xs tert">' + n[x[0]] + '</span></button>').join('');
    const rows = this.rows.filter((k) => (!this.fb || (k.Bahasa === 'en' ? 'en' : 'id') === this.fb) && (!this.q || String(k.Judul).toLowerCase().indexOf(this.q) > -1)).slice(0, 80);
    box.innerHTML = rows.length ? rows.map((k) => '<button class="tile w-100' + (this.src && this.src.ID === k.ID ? ' is-sel' : '') + '" style="text-align:left" data-act="src" data-id="' + h(k.ID) + '"><div class="row between gap-8"><span class="pill sm mono ' + (k.Bahasa === 'en' ? 'p-lav' : 'p-blush') + '">' + (k.Bahasa === 'en' ? 'EN' : 'ID') + '</span><span class="mono xs tert">' + h(k.ID) + '</span></div><div class="sb small clamp-2 mt-8">' + h(k.Judul) + '</div><div class="row gap-6 mt-8 wrap">' + jenisPill(k.Jenis) + platPill(k.Platform) + '</div></button>').join('') : UI.empty('search_off', tr('Tidak ada konten', 'No content'));
  },
  async muatSrc(id) {
    $('#bl-work', this.el).innerHTML = '<div class="card">' + UI.sk(2) + '</div>';
    const r = await API.read('konten.get', { id }); if (!r.success) return UI.toast(r.message, 'err');
    this.src = r.data; this.ke = this.src.Bahasa === 'en' ? 'id' : 'en'; this.list(); this.siapkan();
  },
  fields(k) { return { judul: k.Judul || '', caption: k.Caption || '', cta: k.CTA || '', hashtag: k.Hashtag || '', naskah: k.Naskah || '', slides: pj(k.Slides, []) }; },
  siapkan() { this.hasil = null; this.paintWork(); },
  paintWork() {
    const box = $('#bl-work', this.el), k = this.src;
    if (!k) { box.innerHTML = '<div class="card">' + UI.empty('translate', tr('Pilih konten untuk dilokalisasi', 'Pick content to localize'), tr('Konten dengan performa terbaik di satu bahasa sering berhasil juga di bahasa lain.', 'Top performers in one language often work in the other too.')) + '</div>'; return; }
    const a = this.fields(k), dari = k.Bahasa === 'en' ? 'en' : 'id', ai = (App.boot && App.boot.ai) || {}, aiOn = ai.provider && ai.provider !== 'template', t = this.hasil;
    const L = (x) => (x === 'en' ? 'English' : 'Indonesia');
    box.innerHTML = '<div class="card col gap-12"><div class="row between wrap gap-12"><div><div class="label">02 // ' + tr('Arah lokalisasi', 'Localization direction') + '</div><h2 class="h2 mt-4 clamp-2">' + h(k.Judul) + '</h2></div><div class="row gap-8"><span class="pill p-line">' + L(dari) + '</span>' + ic('arrow_forward', 'sm') + '<div class="seg">' + ['id', 'en'].filter((x) => x !== dari || true).map((x) => '<button class="' + (this.ke === x ? 'on' : '') + '" data-act="ke" data-v="' + x + '"' + (x === dari ? ' disabled style="opacity:.4"' : '') + '>' + L(x) + '</button>').join('') + '</div></div></div>' +
      '<div class="row wrap gap-8"><button class="btn btn-ink shine" data-act="ai"' + (aiOn ? '' : ' title="' + h(tr('Aktifkan provider AI di AI Orchestration', 'Enable an AI provider in AI Orchestration')) + '"') + '>' + ic('auto_awesome', 'sm') + tr('Lokalisasi dengan AI', 'Localize with AI') + '</button><button class="btn btn-ghost" data-act="salin">' + ic('content_copy', 'sm') + tr('Terjemahkan manual (salin teks asli)', 'Translate manually (copy original)') + '</button></div>' +
      (aiOn ? '' : '<p class="xs muted">' + ic('info', 'xs') + tr('Mode Template (tanpa API) tidak bisa menerjemahkan otomatis. Anda tetap bisa menulis versi terjemahan di kolom kanan, atau aktifkan Gemini/OpenAI/Claude di AI Orchestration.', 'Template Mode (no API) cannot auto-translate. You can still write the translated version on the right, or enable Gemini/OpenAI/Claude in AI Orchestration.') + '</p>') + '</div>' +
      '<div class="grid g2" style="gap:16px;align-items:start" id="bl-side"><div class="card paper col gap-10"><div class="row between"><span class="label">' + tr('Asli', 'Original') + ' · ' + dari.toUpperCase() + '</span>' + platPill(k.Platform) + '</div>' + this.ro(a) + '</div>' +
      '<div class="card col gap-10" style="border:1.5px solid var(--ink)"><div class="row between"><span class="label">' + tr('Versi ', 'Version ') + this.ke.toUpperCase() + '</span>' + (t && t.meta ? '<span class="pill sm mono p-lav">' + h(t.meta.provider) + (t.meta.cached ? ' · cache' : '') + '</span>' : '') + '</div>' + this.ed(t ? t.data : null) + '<div class="row wrap gap-8 mt-4"><button class="btn btn-sage" data-act="simpan">' + ic('save', 'sm') + tr('Simpan sebagai draf baru', 'Save as new draft') + '</button><button class="btn btn-ghost btn-sm" data-act="copy">' + ic('content_copy', 'sm') + 'Caption</button></div></div></div>';
    if (innerWidth < 1200) $('#bl-side', box).style.gridTemplateColumns = 'minmax(0,1fr)';
    $$('#bl-side textarea, #bl-side input', box).forEach((x) => x.addEventListener('input', () => this.hitung()));
    this.hitung();
  },
  ro(a) {
    const blok = (l, v) => v ? '<div><div class="flabel">' + l + '</div><div class="small" style="white-space:pre-wrap">' + h(v) + '</div></div>' : '';
    return blok(tr('Judul', 'Title'), a.judul) + blok('Caption', a.caption) + blok('CTA', a.cta) + blok('Hashtag', a.hashtag) + blok(tr('Naskah', 'Script'), a.naskah) + (a.slides.length ? '<div><div class="flabel">Slides</div>' + a.slides.map((s, i) => '<div class="small mt-4"><span class="mono xs tert">' + (i + 1) + '.</span> <b>' + h(s.judul) + '</b>' + (s.isi ? ' — ' + h(s.isi) : '') + '</div>').join('') + '</div>' : '');
  },
  ed(t) {
    t = t || { judul: '', caption: '', cta: '', hashtag: '', naskah: '', slides: this.fields(this.src).slides.map(() => ({ judul: '', isi: '' })) };
    const sl = (t.slides || []);
    return '<div class="field"><label>' + tr('Judul', 'Title') + '</label><input class="inp sm" id="bl-j" value="' + h(t.judul) + '"></div><div class="field"><label>Caption <span class="opt" id="bl-cc"></span></label><textarea class="ta" id="bl-cap" rows="6">' + h(t.caption) + '</textarea></div><div class="grid g2" style="gap:8px"><div class="field"><label>CTA</label><input class="inp sm" id="bl-cta" value="' + h(t.cta) + '"></div><div class="field"><label>Hashtag</label><input class="inp sm" id="bl-h" value="' + h(Array.isArray(t.hashtag) ? t.hashtag.join(' ') : t.hashtag) + '"></div></div>' +
      (this.src.Naskah || t.naskah ? '<div class="field"><label>' + tr('Naskah', 'Script') + '</label><textarea class="ta" id="bl-n" rows="5">' + h(t.naskah) + '</textarea></div>' : '') +
      (sl.length ? '<div class="field"><label>Slides</label><div class="col gap-6" id="bl-sl">' + sl.map((s, i) => '<div class="grid" style="grid-template-columns:22px minmax(0,1fr) minmax(0,1.4fr);gap:6px;align-items:center"><span class="mono xs tert">' + (i + 1) + '</span><input class="inp sm" data-sj="' + i + '" value="' + h(s.judul) + '" placeholder="' + tr('Judul slide', 'Slide title') + '"><input class="inp sm" data-si="' + i + '" value="' + h(s.isi) + '" placeholder="' + tr('Isi', 'Body') + '"></div>').join('') + '</div></div>' : '');
  },
  hitung() { const c = $('#bl-cap', this.el), n = $('#bl-cc', this.el); if (c && n) n.textContent = c.value.length + ' ' + tr('karakter', 'chars'); },
  baca() {
    const v = (id) => { const x = $(id, this.el); return x ? x.value : ''; };
    const slides = this.fields(this.src).slides.map((s, i) => { const j = $('[data-sj="' + i + '"]', this.el), b = $('[data-si="' + i + '"]', this.el); return Object.assign({}, s, { judul: j ? j.value : s.judul, isi: b ? b.value : s.isi }); });
    return { judul: v('#bl-j'), caption: v('#bl-cap'), cta: v('#bl-cta'), hashtag: v('#bl-h'), naskah: v('#bl-n'), slides };
  },
  salinAsli() { this.hasil = { data: this.fields(this.src) }; this.paintWork(); UI.toast(tr('Teks asli disalin ke kolom kanan — tinggal ditulis ulang.', 'Original copied to the right — just rewrite it.'), 'info'); },
  async terjemah(btn) {
    const ai = (App.boot && App.boot.ai) || {};
    if (!ai.provider || ai.provider === 'template') { if (await UI.confirm(tr('Terjemahan otomatis membutuhkan provider AI. Buka AI Orchestration sekarang?', 'Auto translation needs an AI provider. Open AI Orchestration now?'))) Router.go('orchestration'); return; }
    UI.busy(btn, true, tr('Melokalisasi…', 'Localizing…'));
    const r = await API.call('lokal.translate', { kontenId: this.src.ID, ke: this.ke }, { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) return;
    const d = r.data.hasil || {}, a = this.fields(this.src);
    this.hasil = { data: { judul: d.judul || '', caption: d.caption || '', cta: d.cta || '', hashtag: d.hashtag || '', naskah: d.naskah || '', slides: (d.slides || []).length ? d.slides : a.slides }, meta: r.data.meta };
    this.paintWork();
  },
  async simpan(btn) {
    const t = this.baca(), k = this.src;
    if (!t.judul.trim() && !t.caption.trim()) return UI.toast(tr('Isi minimal judul atau caption versi terjemahan.', 'Fill at least the translated title or caption.'), 'warn');
    UI.busy(btn, true);
    const r = await API.call('konten.save', { Judul: (t.judul || k.Judul) + ' [' + this.ke.toUpperCase() + ']', Jenis: k.Jenis, Platform: k.Platform, Caption: t.caption, CTA: t.cta, Hashtag: t.hashtag, Naskah: t.naskah, Slides: t.slides, Tema: k.Tema, Pilar: k.Pilar, KitID: k.KitID, ProdukID: k.ProdukID, Watermark: k.Watermark, MusikMedia: k.MusikMedia, Bahasa: this.ke, SumberRepurposing: k.ID, Status: 'Draf' }, { toast: false });
    UI.busy(btn, false);
    if (!r.success) return;
    UI.toast(tr('Versi ' + this.ke.toUpperCase() + ' disimpan sebagai draf.', this.ke.toUpperCase() + ' version saved as a draft.'), 'ok');
    this.rows = [r.data].concat(this.rows || []); this.list(); this.pairs();
  },
  pairs() {
    const box = $('#bl-pairs', this.el); if (!box || !this.rows) return;
    const by = {}; this.rows.forEach((k) => { by[k.ID] = k; });
    const ps = this.rows.filter((k) => k.SumberRepurposing && by[k.SumberRepurposing] && (by[k.SumberRepurposing].Bahasa || 'id') !== (k.Bahasa || 'id'));
    box.innerHTML = ps.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + tr('Sumber', 'Source') + '</th><th></th><th>' + tr('Versi lokal', 'Localized version') + '</th><th>Status</th><th></th></tr></thead><tbody>' + ps.map((k) => { const s = by[k.SumberRepurposing]; return '<tr><td><span class="pill sm mono p-blush">' + h((s.Bahasa || 'id').toUpperCase()) + '</span> ' + h(s.Judul) + '</td><td>→</td><td><span class="pill sm mono p-lav">' + h((k.Bahasa || 'id').toUpperCase()) + '</span> ' + h(k.Judul) + '</td><td>' + stPill(k.Status) + '</td><td class="tr"><button class="btn btn-ghost btn-xs" data-act="open" data-id="' + h(k.ID) + '">' + tr('Buka', 'Open') + ' ↗</button></td></tr>'; }).join('') + '</tbody></table></div>'
      : '<p class="small muted">' + tr('Belum ada versi terjemahan. Pilih konten di atas untuk mulai.', 'No translated versions yet. Pick content above to start.') + '</p>';
  }
});
