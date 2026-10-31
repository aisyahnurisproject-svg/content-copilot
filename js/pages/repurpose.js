/* Modul 7 — Content Repurposing: satu ide → konten lintas platform tanpa mengulang proses */
'use strict';
Pages.def('repurpose', {
  TARGET: [['Video Pendek', 'TikTok'], ['Video Pendek', 'Instagram'], ['Thread', 'Threads'], ['Story', 'Instagram'], ['Carousel', 'LinkedIn'], ['Artikel', 'Substack'], ['Caption', 'Facebook'], ['Caption', 'WhatsApp'], ['Carousel', 'Instagram'], ['Thread', 'X/Twitter']],
  marquee() { return ['MOD-07 // Content Repurposing Engine', '1 core idea → omnichannel outputs', 'Synced with Google Sheets [KONTEN · SumberRepurposing]', 'Keeps core message & CTA']; },
  render(el, params) {
    this.el = el; this.src = null; this.pilih = [0, 2, 3]; this.hasil = [];
    bindActs(el, {
      src: (b) => this.muat(b.dataset.id), tgt: (b) => { const i = +b.dataset.i, a = this.pilih, x = a.indexOf(i); if (x > -1) a.splice(x, 1); else if (a.length < 5) a.push(i); else return UI.toast(tr('Maksimal 5 tujuan sekaligus.', 'Max 5 targets at once.'), 'warn'); this.paintTarget(); },
      preset: (b) => { this.pilih = b.dataset.p.split(',').map(Number); this.paintTarget(); }, gen: (b) => this.gen(b), simpan: (b) => this.simpan(b), open: (b) => Router.go('generator', { id: b.dataset.id })
    });
    el.innerHTML = App.hero({ word: 'W-07', pills: '<span class="pill mono p-line">Omnichannel</span><span class="pill mono p-sage">1 Core idea → 5 outputs</span>', title: tr('satu ide. <span class="it">semua platform.</span>', 'one idea. <span class="it">every platform.</span>'),
      sub: tr('Ubah carousel terbaik menjadi naskah Reels, thread, story polling, LinkedIn, dan newsletter — pesan inti & CTA tetap, gaya menyesuaikan tiap platform.', 'Turn your best carousel into a Reels script, thread, story poll, LinkedIn doc and newsletter — same core message & CTA, styled for each platform.') }) +
      '<div class="grid mt-24" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr);align-items:start" id="rp-grid"><section class="card col gap-12"><div class="label">01 // ' + tr('Konten sumber', 'Source content') + '</div><input class="inp sm" id="rp-q" placeholder="' + tr('Cari konten…', 'Search content…') + '"><div id="rp-list" class="col gap-8" style="max-height:560px;overflow:auto">' + UI.sk(4, 'sk-line') + '</div></section>' +
      '<section class="col gap-16" style="gap:16px"><div class="card" id="rp-src"></div><div class="card"><div class="row between wrap gap-8"><span class="label">02 // ' + tr('Format tujuan', 'Target formats') + ' (≤5)</span><div class="row gap-6 wrap"><button class="btn btn-ghost btn-xs" data-act="preset" data-p="0,2,3,5">Creator stack</button><button class="btn btn-ghost btn-xs" data-act="preset" data-p="4,6,9">B2B stack</button><button class="btn btn-ghost btn-xs" data-act="preset" data-p="1,3,7">Launch stack</button></div></div><div class="chips mt-12" id="rp-tgt"></div><div class="row between wrap gap-12 mt-16"><div id="rp-chain" class="row wrap gap-6 small"></div><button class="btn btn-ink shine" data-act="gen">' + ic('sync_alt', 'sm') + 'Repurpose ✦</button></div></div><div id="rp-out"></div></section></div>';
    if (innerWidth < 1000) $('#rp-grid', el).style.gridTemplateColumns = 'minmax(0,1fr)';
    $('#rp-q', el).addEventListener('input', debounce(() => this.list(), 250));
    API.swr('konten.list', { limit: 300 }, { maxAge: 20000, onData: (d) => { this.rows = d.rows; this.list(); } });
    this.paintSrc(); this.paintTarget();
    if (params.id) this.muat(params.id);
  },
  list() {
    const box = $('#rp-list', this.el); if (!box || !this.rows) return;
    const q = ($('#rp-q', this.el).value || '').toLowerCase(), turunan = {};
    this.rows.forEach((k) => { if (k.SumberRepurposing) turunan[k.SumberRepurposing] = (turunan[k.SumberRepurposing] || 0) + 1; });
    const rows = this.rows.filter((k) => !k.SumberRepurposing && (!q || (k.Judul + ' ' + k.Tema).toLowerCase().indexOf(q) > -1)).slice(0, 80);
    box.innerHTML = rows.length ? rows.map((k) => '<button class="tile w-100' + (this.src && this.src.ID === k.ID ? ' is-sel' : '') + '" style="text-align:left" data-act="src" data-id="' + h(k.ID) + '"><div class="sb small clamp-2">' + h(k.Judul) + '</div><div class="row gap-6 mt-8 wrap">' + jenisPill(k.Jenis) + platPill(k.Platform) + (turunan[k.ID] ? '<span class="pill sm p-lav">↻ ' + turunan[k.ID] + '</span>' : '') + '</div></button>').join('') : UI.empty('search_off', tr('Tidak ada konten', 'No content'));
  },
  async muat(id) {
    const r = await API.read('konten.get', { id }); if (!r.success) return UI.toast(r.message, 'err');
    this.src = r.data; this.hasil = []; this.paintSrc(); this.list(); $('#rp-out', this.el).innerHTML = '';
  },
  paintSrc() {
    const box = $('#rp-src', this.el), k = this.src;
    if (!k) { box.innerHTML = UI.empty('ads_click', tr('Pilih konten sumber di kiri', 'Pick a source on the left'), tr('Konten dengan performa terbaik adalah kandidat repurposing paling kuat.', 'Your best-performing posts are the strongest repurposing candidates.')); return; }
    const s = pj(k.Slides, []);
    box.innerHTML = '<div class="row between top gap-12"><div><div class="label">' + tr('Sumber', 'Source') + ' · ' + h(k.ID) + '</div><h2 class="h2 mt-4">' + h(k.Judul) + '</h2><div class="row gap-6 mt-8 wrap">' + jenisPill(k.Jenis) + platPill(k.Platform) + stPill(k.Status) + (s.length ? '<span class="pill sm p-line">' + s.length + ' slide</span>' : '') + '</div></div><button class="btn btn-ghost btn-sm" data-act="open" data-id="' + h(k.ID) + '">' + tr('Buka', 'Open') + ' ↗</button></div><p class="small muted mt-12 clamp-3">' + h(k.Caption || k.Naskah || '') + '</p>' + (k.CTA ? '<div class="pill p-blush mt-12">CTA: ' + h(k.CTA) + '</div>' : '');
  },
  paintTarget() {
    $('#rp-tgt', this.el).innerHTML = this.TARGET.map((t, i) => '<button class="chip' + (this.pilih.indexOf(i) > -1 ? ' on' : '') + '" data-act="tgt" data-i="' + i + '">' + ic(JENIS_ICON[t[0]] || 'description', 'xs') + h(jenisLabel(t[0])) + ' · ' + h(t[1]) + '</button>').join('');
    $('#rp-chain', this.el).innerHTML = '<span class="pill p-ink">' + ic('lightbulb', 'xs') + (this.src ? h(jenisLabel(this.src.Jenis)) : tr('Ide inti', 'Core idea')) + '</span>' + this.pilih.map((i) => '<span class="tert">→</span><span class="pill sm p-sage">' + h(jenisLabel(this.TARGET[i][0])) + ' · ' + h(this.TARGET[i][1]) + '</span>').join('');
  },
  async gen(btn) {
    if (!this.src) return UI.toast(tr('Pilih konten sumber dulu.', 'Pick a source first.'), 'warn');
    if (!this.pilih.length) return UI.toast(tr('Pilih format tujuan.', 'Pick target formats.'), 'warn');
    UI.busy(btn, true, tr('Menerjemahkan format…', 'Reformatting…'));
    $('#rp-out', this.el).innerHTML = '<div class="grid g2">' + UI.sk(this.pilih.length) + '</div>';
    const r = await API.call('repurpose.generate', { kontenId: this.src.ID, target: this.pilih.map((i) => ({ format: this.TARGET[i][0], platform: this.TARGET[i][1] })) }, { toast: false, noBootRefresh: true });
    UI.busy(btn, false);
    if (!r.success) { $('#rp-out', this.el).innerHTML = ''; return; }
    if (r.data.meta.fallback) UI.toast(r.data.meta.pesan, 'warn');
    this.hasil = r.data.hasil; this.paintOut();
  },
  paintOut() {
    $('#rp-out', this.el).innerHTML = '<div class="row between wrap gap-12 mb-12"><h3 class="h2">' + this.hasil.length + tr(' versi siap', ' versions ready') + '</h3><button class="btn btn-sage" data-act="simpan">' + ic('save', 'sm') + tr('Simpan terpilih sebagai draf', 'Save selected as drafts') + '</button></div><div class="grid g2" style="align-items:start">' +
      this.hasil.map((x, i) => '<article class="card col gap-10 rp-card" data-i="' + i + '"><div class="row between"><div class="row gap-6">' + jenisPill(x.format) + platPill(x.platform) + '</div><label class="check sq small"><input type="checkbox" class="rp-ok" checked> ' + tr('Simpan', 'Keep') + '</label></div><input class="inp sm rp-j" value="' + h(x.judul) + '"><textarea class="ta rp-n" rows="6">' + h(x.naskah || (x.slides || []).map((s) => s.judul + ' — ' + s.isi).join('\n')) + '</textarea><div class="field"><label>Caption</label><textarea class="ta rp-c" rows="4">' + h(x.caption) + '</textarea></div><div class="grid g2" style="gap:8px"><input class="inp sm rp-cta" value="' + h(x.cta) + '" placeholder="CTA"><input class="inp sm rp-h" value="' + h((x.hashtag || []).join(' ')) + '" placeholder="#hashtag"></div>' + ((x.slides || []).length ? '<span class="xs muted">' + x.slides.length + tr(' slide/scene ikut tersimpan', ' slides/scenes included') + '</span>' : '') + '</article>').join('') + '</div>';
  },
  async simpan(btn) {
    const pilih = $$('.rp-card', this.el).filter((c) => $('.rp-ok', c).checked).map((c) => { const x = Object.assign({}, this.hasil[+c.dataset.i]); x.judul = $('.rp-j', c).value; x.naskah = $('.rp-n', c).value; x.caption = $('.rp-c', c).value; x.cta = $('.rp-cta', c).value; x.hashtag = $('.rp-h', c).value.split(/\s+/).filter(Boolean); return x; });
    if (!pilih.length) return UI.toast(tr('Centang minimal satu.', 'Tick at least one.'), 'warn');
    UI.busy(btn, true);
    const r = await API.call('repurpose.simpan', { kontenId: this.src.ID, hasil: pilih });
    UI.busy(btn, false);
    if (r.success) { $('#rp-out', this.el).insertAdjacentHTML('afterbegin', '<div class="card sage row between wrap gap-12 mb-16"><span>' + ic('check_circle', 'sm') + ' ' + r.data.length + tr(' draf baru dibuat dari sumber ini.', ' new drafts created from this source.') + '</span><div class="row gap-8">' + r.data.slice(0, 3).map((k) => '<button class="btn btn-ghost btn-xs" data-act="open" data-id="' + h(k.ID) + '">' + h(jenisLabel(k.Jenis)) + ' ↗</button>').join('') + '</div></div>'); API.read('konten.list', { limit: 300 }).then((x) => { if (x.success) { this.rows = x.data.rows; this.list(); } }); }
  }
});
