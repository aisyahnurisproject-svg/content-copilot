/* Modul 13 — Asset Library: musik & SFX, font, visual/tekstur/stiker — Google Drive + registry Sheets */
'use strict';
Pages.def('assets', {
  GRUP: [['', 'Semua aset', 'All assets'], ['audio', 'Musik & SFX', 'Audio & SFX'], ['font', 'Tipografi', 'Typography'], ['visual', 'Visual & tekstur', 'Visuals & textures'], ['ekspor', 'Ekspor & AI', 'Exports & AI']],
  JENIS: ['Musik', 'SFX', 'Font', 'Visual', 'Tekstur', 'Stiker', 'Lainnya'],
  marquee() { return ['Module 13 // Multimedia Asset Library', 'Soundscapes · SFX · typography · visual assets', 'Synced with Google Drive [ASET_MEDIA] & Sheets', 'Royalty-free & licensed micro-assets']; },
  grupDari(j) { return j === 'Musik' || j === 'SFX' ? 'audio' : j === 'Font' ? 'font' : j === 'Ekspor' ? 'ekspor' : 'visual'; },
  render(el, params) {
    this.el = el; this.rows = null; this.g = params.grup || ''; this.q = ''; this.hal = 0; this.play = null; this.audio = null; this.feat = null;
    bindActs(el, {
      g: (b) => { this.g = b.dataset.v; this.hal = 0; this.paint(); const t = { audio: '#as-sonic', visual: '#as-vis', ekspor: '#as-vis', font: '#as-font' }[this.g]; if (t && b.closest('#as-chips')) $(t, el).scrollIntoView({ behavior: 'smooth', block: 'start' }); }, up: () => this.upload(), link: () => this.form(), sync: (b) => this.muat(b), edit: (b) => this.form(this.get(b.dataset.id)), del: (b) => this.hapus(b.dataset.id),
      play: (b) => this.putar(b.dataset.id), feat: (b) => { this.feat = b.dataset.id; this.paintSonic(); }, buka: (b) => { const a = this.get(b.dataset.id); if (a) window.open(a.DriveID ? 'https://drive.google.com/file/d/' + a.DriveID + '/view' : a.URL, '_blank', 'noopener'); },
      pg: (b) => { this.hal = +b.dataset.p; this.paintTbl(); }, graphic: () => Router.go('graphic'), xls: () => this.ekspor(), kit: () => Router.go('onboarding'), drive: () => this.drive()
    });
    el.innerHTML = App.hero({ word: 'W-13', pills: '<span class="pill mono p-blush">🍒 Sonic & visual identity engine</span>',
      title: tr('soundscapes, <span class="it">letterforms</span> & visual.<br>alkimia <span class="it">brand</span> Anda.', 'soundscapes, <span class="it">letterforms</span> & visuals.<br>your brand <span class="it">alchemy</span>.'),
      sub: tr('Kurasi audio ambient bebas royalti, SFX, pasangan tipografi, dan aset visual berlisensi — dipetakan langsung ke Branding Kit aktif dan pipeline konten Anda.', 'Curate royalty-free ambient audio, SFX, typography pairings and licensed visuals — mapped straight to your active Branding Kit and content pipeline.'),
      side: '<button class="btn btn-blush shine" data-act="up">' + ic('upload', 'sm') + tr('Unggah aset', 'Upload asset') + ' ✦</button><button class="btn btn-ghost btn-sm" data-act="link">' + ic('add_link', 'sm') + tr('Tambah tautan', 'Add link') + '</button><button class="btn btn-ghost btn-sm" data-act="drive">' + ic('folder_open', 'sm') + tr('Buka folder Drive', 'Open Drive folder') + '</button><button class="btn btn-ghost btn-sm" data-act="sync">' + ic('sync', 'sm') + tr('Sinkronkan', 'Sync assets') + '</button>',
      strip: '<span class="pill p-line" id="as-store">' + ic('cloud', 'xs') + 'Storage: …</span><span class="pill p-line" id="as-idx">' + ic('inventory_2', 'xs') + '…</span><span class="pill p-sage" id="as-lic">' + ic('verified_user', 'xs') + '…</span><span class="pill p-line">' + ic('bolt', 'xs') + tr('Cache GAS 6 jam', 'GAS cache 6h') + '</span>' }) +
      '<section class="card tight mt-24 col gap-12"><div class="row wrap gap-10" style="gap:10px"><input class="inp sm grow" id="as-q" style="max-width:360px" placeholder="' + tr('Cari aset: mood, tag, nama…', 'Search assets: mood, tag, name…') + '"><span class="pill p-line">' + ic('gavel', 'xs') + tr('Lisensi tercatat per aset', 'License tracked per asset') + '</span></div><div class="chips nowrap" id="as-chips"></div></section>' +
      '<div class="grid mt-24" id="as-grid" style="grid-template-columns:minmax(0,4fr) minmax(0,5fr) minmax(0,3fr);align-items:start"><section class="card lg col gap-12" id="as-sonic">' + UI.sk(2) + '</section><section class="card lg col gap-12" id="as-vis">' + UI.sk(2) + '</section><aside class="col gap-16" style="gap:16px"><section class="card col gap-10" id="as-kit"></section><section class="card col gap-10" id="as-health">' + UI.sk(1) + '</section></aside></div>' +
      '<section class="card lg mt-24" id="as-font"></section>' +
      '<section class="card lg mt-24"><div class="row between wrap gap-12 mb-16"><div><div class="row gap-8 wrap"><h2 class="h2">Google Sheets Registry: [ASET_MEDIA]</h2><span class="pill sm p-sage">' + tr('Sinkron 2 arah', 'Two-way sync') + '</span></div><p class="xs muted mono mt-4">' + tr('Edit di Sheets → klik Sinkronkan untuk membaca ulang', 'Edit in Sheets → click Sync to re-read') + '</p></div><div class="row gap-8"><button class="btn btn-ghost btn-sm" data-act="sync">' + ic('refresh', 'sm') + tr('Segarkan', 'Refresh') + '</button><button class="btn btn-ghost btn-sm" data-act="xls">' + ic('download', 'sm') + 'Excel</button></div></div><div id="as-tbl">' + UI.sk(3, 'sk-line') + '</div></section>';
    const g = $('#as-grid', el); if (innerWidth < 1250) g.style.gridTemplateColumns = innerWidth < 800 ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)';
    $('#as-q', el).addEventListener('input', debounce(() => { this.q = $('#as-q', el).value.toLowerCase(); this.hal = 0; this.paint(); }, 200));
    this.paintKit();
    this.muat();
    API.swr('sistem.status', {}, { maxAge: 300000, onData: (s) => { this.sys = s; this.paintHealth(); } });
  },
  destroy() { if (this.audio) { this.audio.pause(); this.audio = null; } },
  onKit() { this.paintKit(); },
  get(id) { return (this.rows || []).find((a) => a.ID === id); },
  muat(btn) {
    if (btn) { UI.busy(btn, true); API.read('aset.list', { _fresh: 1 }).then((r) => { UI.busy(btn, false); if (r.success) { this.rows = r.data; API.remember('aset.list', {}, r.data); this.paint(); UI.toast(tr('Registry aset disinkronkan.', 'Asset registry synced.'), 'ok'); } }); return; }
    API.swr('aset.list', {}, { maxAge: 60000, onData: (rows) => { this.rows = rows; this.paint(); } });
  },
  cocok(a) { return !this.q || (a.Nama + ' ' + a.Jenis + ' ' + a.Tema + ' ' + a.Tag + ' ' + a.Sumber).toLowerCase().indexOf(this.q) > -1; },
  vis() { return (this.rows || []).filter((a) => (!this.g || this.grupDari(a.Jenis) === this.g) && this.cocok(a)); },
  paint() {
    if (!this.rows) return;
    const all = this.rows, n = { '': all.length }; all.forEach((a) => { const g = this.grupDari(a.Jenis); n[g] = (n[g] || 0) + 1; });
    $('#as-chips', this.el).innerHTML = this.GRUP.map((x) => '<button class="chip' + (this.g === x[0] ? ' on' : '') + '" data-act="g" data-v="' + x[0] + '">' + h(tr(x[1], x[2])) + ' <span class="n">' + (n[x[0]] || 0) + '</span></button>').join('');
    const lic = all.filter((a) => String(a.Lisensi || '').trim()).length;
    $('#as-idx', this.el).innerHTML = ic('inventory_2', 'xs') + tr('Terindeks: ', 'Indexed: ') + all.length + tr(' aset', ' assets');
    $('#as-lic', this.el).innerHTML = ic('verified_user', 'xs') + (all.length ? Math.round(100 * lic / all.length) : 100) + '% ' + tr('berlisensi jelas', 'clearly licensed');
    this.paintSonic(); this.paintVis(); this.paintFont(); this.paintTbl(); this.paintHealth(); this.paintKit();
  },
  paintSonic() {
    const box = $('#as-sonic', this.el), list = (this.rows || []).filter((a) => (a.Jenis === 'Musik' || a.Jenis === 'SFX') && this.cocok(a));
    const f = this.get(this.feat) || list.find((a) => a.Jenis === 'Musik') || list[0], main = this.play && f && this.play === f.ID;
    box.innerHTML = '<div class="row between top"><div><h2 class="h2">Sonic Branding Station</h2><p class="xs muted mt-4">' + tr('Waveform & stem siap pakai', 'Ready-to-use waveforms & stems') + '</p></div><span class="pill sm p-blush">' + list.length + ' audio</span></div>' +
      (f ? '<div class="inset col gap-10"><div class="row between"><span class="label">' + tr('Signature pilihan', 'Featured signature') + '</span><span class="pill sm mono p-line">' + h(f.Jenis) + (f.Durasi ? ' · ' + h(f.Durasi) : '') + '</span></div><h3 class="h2" style="font-size:24px">' + h(f.Nama) + '</h3><p class="xs muted">' + h(f.Tema) + '</p>' +
        '<div class="waveform' + (main ? '' : ' paused') + '" aria-hidden="true">' + Array.from({ length: 28 }, (_, i) => '<i style="height:' + (14 + Math.round(Math.abs(Math.sin(i * 1.7 + f.ID.length)) * 38)) + 'px;animation-delay:' + (i % 7) * 0.12 + 's"></i>').join('') + '</div>' +
        '<div class="row between gap-8"><button class="btn btn-ink btn-sm" data-act="play" data-id="' + h(f.ID) + '">' + ic(main ? 'pause' : 'play_arrow', 'sm') + (f.DriveID ? (main ? tr('Jeda', 'Pause') : tr('Putar', 'Play')) : tr('Dengar', 'Listen') + ' ↗') + '</button><span class="xs muted clamp-1">' + h(f.Sumber) + ' · ' + h(f.Lisensi) + '</span></div></div>' : UI.empty('music_off', tr('Belum ada audio', 'No audio yet'), '', '<button class="btn btn-ghost btn-sm" data-act="up">' + tr('Unggah audio', 'Upload audio') + '</button>')) +
      '<div class="label mt-4">' + tr('Pustaka audio', 'Audio library') + '</div><div class="col gap-8" style="max-height:380px;overflow:auto">' + list.map((a, i) => '<div class="list-row inset" style="padding:10px 12px;cursor:pointer' + (f && a.ID === f.ID ? ';box-shadow:0 0 0 1.5px var(--ink) inset' : '') + '" data-act="feat" data-id="' + h(a.ID) + '"><span class="mono xs tert">' + ('0' + (i + 1)).slice(-2) + '</span><div class="grow" style="min-width:0"><div class="sb small clamp-1">' + h(a.Nama) + '</div><div class="xs muted clamp-1">' + h(a.Durasi || '') + (a.Tag ? ' · ' + h(a.Tag.split(',').slice(0, 3).join(', ')) : '') + '</div></div><button class="icon-btn sm" data-act="play" data-id="' + h(a.ID) + '" aria-label="' + tr('Putar', 'Play') + '">' + ic(this.play === a.ID ? 'pause' : (a.DriveID ? 'play_arrow' : 'open_in_new'), 'sm') + '</button></div>').join('') + '</div>' +
      '<p class="xs muted">' + ic('shield', 'xs') + tr('Audio bebas royalti (Pixabay/Mixkit) aman untuk Reels & TikTok — tetap cek lisensi tiap trek.', 'Royalty-free audio (Pixabay/Mixkit) is safe for Reels & TikTok — still check each track’s license.') + '</p>';
  },
  async putar(id) {
    const a = this.get(id); if (!a) return;
    if (!a.DriveID) { window.open(a.URL, '_blank', 'noopener'); return; }
    if (this.play === id && this.audio) { this.audio.pause(); this.play = null; this.paintSonic(); return; }
    if (this.audio) this.audio.pause();
    this.feat = id; this.play = id; this.paintSonic();
    const r = await API.read('aset.data', { id });
    if (!r.success) { this.play = null; this.paintSonic(); return UI.toast(r.message, 'err'); }
    if (this.play !== id) return;
    this.audio = new Audio(r.data.dataUrl); this.audio.onended = () => { this.play = null; this.paintSonic(); };
    this.audio.play().catch(() => { this.play = null; this.paintSonic(); });
  },
  thumb(a) {
    const ic2 = { Visual: 'image', Tekstur: 'texture', Stiker: 'auto_awesome', Ekspor: 'photo_library', Lainnya: 'category' }[a.Jenis] || 'image';
    const bg = { Visual: 'linear-gradient(135deg,#F5E6D3,#E8D5C4)', Tekstur: 'linear-gradient(135deg,#EFEAE1,#DDD5C8)', Stiker: 'linear-gradient(135deg,#FDE8EC,#F7D4DC)', Ekspor: 'linear-gradient(135deg,#DCE7DF,#C9DACE)' }[a.Jenis] || 'var(--paper-2)';
    const img = a.DriveID && /thumbnail/.test(a.URL || '') ? '<img src="' + h(a.URL.replace(/sz=w\d+/, 'sz=w600')) + '" alt="" loading="lazy" referrerpolicy="no-referrer" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">' : '';
    return '<div class="rel" style="height:140px;border-radius:14px;overflow:hidden;background:' + bg + ';display:grid;place-items:center">' + ic(ic2, 'lg') + img + '<span class="pill sm mono p-ink" style="position:absolute;right:8px;top:8px">' + h(a.MimeType ? a.MimeType.split('/')[1].toUpperCase().slice(0, 8) : a.Sumber.split(' ')[0]) + '</span></div>';
  },
  paintVis() {
    const box = $('#as-vis', this.el), list = (this.rows || []).filter((a) => ['Visual', 'Tekstur', 'Stiker', 'Ekspor', 'Lainnya'].indexOf(a.Jenis) > -1 && (this.g !== 'ekspor' || a.Jenis === 'Ekspor') && this.cocok(a));
    const lim = list.slice(0, 8);
    box.innerHTML = '<div class="row between top"><div><h2 class="h2">' + tr('Katalog visual & tekstur', 'Visual asset & texture catalog') + '</h2><p class="xs muted mt-4">' + tr('Overlay, tekstur, stiker, dan hasil ekspor', 'Overlays, textures, stickers and exports') + '</p></div><span class="pill sm p-sage">' + list.length + ' item</span></div>' +
      (lim.length ? '<div class="grid g2" style="gap:12px">' + lim.map((a) => '<article class="tile col gap-8" style="padding:10px">' + this.thumb(a) + '<div class="sb small clamp-1">' + h(a.Nama) + '</div><div class="xs muted clamp-2">' + h(a.Tema || a.Tag || '') + '</div><div class="row between gap-6"><button class="btn btn-text btn-xs" data-act="buka" data-id="' + h(a.ID) + '">' + ic('visibility', 'xs') + tr('Lihat', 'Preview') + '</button><button class="btn btn-ghost btn-xs" data-act="graphic">' + tr('Graphic Studio', 'Graphic Studio') + '</button></div></article>').join('') + '</div>' : UI.empty('image_not_supported', tr('Belum ada visual', 'No visuals yet'))) +
      '<div class="row between small"><span class="muted">' + tr('Menampilkan ', 'Showing ') + lim.length + tr(' dari ', ' of ') + list.length + '</span><button class="btn btn-text btn-xs" data-act="g" data-v="visual">' + tr('Lihat semua', 'Browse all') + ' →</button></div>';
  },
  paintFont() {
    const box = $('#as-font', this.el), list = (this.rows || []).filter((a) => a.Jenis === 'Font' && this.cocok(a));
    box.innerHTML = '<div class="row between wrap gap-12 mb-16"><div><h2 class="h2">' + tr('Spesimen tipografi', 'Typography specimens') + '</h2><p class="xs muted mt-4">' + tr('Font bebas (SIL OFL) dari Google Fonts — dimuat langsung untuk kanvas Graphic Studio.', 'Free (SIL OFL) Google Fonts — loaded directly for the Graphic Studio canvas.') + '</p></div><button class="btn btn-ghost btn-sm" data-act="kit">' + ic('palette', 'sm') + tr('Atur font di Branding Kit', 'Set fonts in Branding Kit') + '</button></div>' +
      (list.length ? '<div class="grid g4" style="gap:12px">' + list.map((a) => '<div class="tile col gap-8"><div class="font-demo" style="font-family:\'' + h(a.Nama) + '\',serif;font-size:34px">Aa Bb &amp;</div><div class="xs muted" style="font-family:\'' + h(a.Nama) + '\',sans-serif">' + tr('Konten yang konsisten membangun kepercayaan.', 'Consistent content builds trust.') + '</div><div class="row between"><span class="sb small">' + h(a.Nama) + '</span><button class="icon-btn sm ghost" data-act="buka" data-id="' + h(a.ID) + '" aria-label="' + tr('Buka', 'Open') + '">' + ic('open_in_new', 'sm') + '</button></div><span class="xs tert">' + h(a.Lisensi) + '</span></div>').join('') + '</div>' : UI.empty('font_download_off', tr('Belum ada font', 'No fonts yet')));
    list.forEach((a) => { if (FONT_PILIHAN.indexOf(a.Nama) > -1) Fonts.load(a.Nama); });
  },
  paintKit() {
    const k = App.kit(), box = $('#as-kit', this.el); if (!box || !k) return;
    const sonic = (this.rows || []).find((a) => a.Jenis === 'Musik' && a.KitID === k.ID) || (this.rows || []).find((a) => a.Jenis === 'Musik');
    const row = (l, v) => '<div class="inset" style="padding:10px 12px"><div class="label" style="font-size:9.5px">' + l + '</div><div class="sb small mt-4 clamp-1">' + h(v || '—') + '</div></div>';
    box.innerHTML = '<div class="row between"><h3 class="h3">Kit Bindings</h3><span class="pill sm p-blush">' + h(k.Default === 'YA' ? 'Default' : tr('Aktif', 'Active')) + '</span></div>' + row(tr('Kit aktif', 'Active kit'), k.Nama) + row(tr('Font judul', 'Display font'), k.FontJudul) + row(tr('Font isi', 'Body font'), k.FontIsi) + row('Watermark', (k.WatermarkTeks || '') + (k.WatermarkID ? ' + logo' : '')) + row(tr('Sonic bed default', 'Default sonic bed'), sonic && sonic.Nama) +
      '<div class="row gap-6">' + ['WarnaPrimer', 'WarnaSekunder', 'WarnaAksen', 'WarnaLatar', 'WarnaTeks'].map((c) => '<span title="' + h(k[c]) + '" style="flex:1;height:22px;border-radius:6px;border:1px solid var(--line);background:' + h(k[c] || '#fff') + '"></span>').join('') + '</div><button class="btn btn-ghost btn-sm" data-act="kit">' + tr('Ubah di Onboarding', 'Edit in Onboarding') + ' →</button>';
  },
  paintHealth() {
    const box = $('#as-health', this.el); if (!box || !this.rows) return;
    const per = {}; let tot = 0; this.rows.forEach((a) => { const g = this.grupDari(a.Jenis), u = Number(a.Ukuran) || 0; per[g] = (per[g] || 0) + u; tot += u; });
    const d = (this.sys && this.sys.drive) || {}, pct = d.batas ? Math.round(100 * d.terpakai / d.batas) : 0;
    if ($('#as-store', this.el)) $('#as-store', this.el).innerHTML = ic('cloud', 'xs') + 'Storage: ' + (d.batas ? Fmt.bytes(d.terpakai) + ' / ' + Fmt.bytes(d.batas) : tr('memuat…', 'loading…'));
    const col = { audio: 'var(--s1)', visual: 'var(--s2)', font: 'var(--s3)', ekspor: 'var(--s4)' }, lab = { audio: tr('Audio', 'Audio'), visual: tr('Visual', 'Visual'), font: 'Font', ekspor: tr('Ekspor', 'Exports') };
    box.innerHTML = '<div class="row between"><h3 class="h3">Storage Health</h3><span class="pill sm mono ' + (pct > 85 ? 'p-danger' : 'p-sage') + '">' + (d.batas ? pct + '%' : '—') + '</span></div><div class="bar"><i style="width:' + pct + '%;background:' + (pct > 85 ? 'var(--danger)' : 'var(--sage-ink)') + '"></i></div><p class="xs muted">Google Drive ' + (d.batas ? Fmt.bytes(d.terpakai) + tr(' terpakai dari ', ' used of ') + Fmt.bytes(d.batas) : '') + '</p>' +
      '<div class="label mt-4">' + tr('Unggahan di Asset Library', 'Uploads in Asset Library') + ' · ' + Fmt.bytes(tot) + '</div>' + (tot ? Chart.hbars(Object.keys(per).filter((g) => per[g]).map((g) => ({ l: lab[g], v: per[g], c: col[g] })), { fmt: Fmt.bytes }) : '<p class="xs muted">' + tr('Belum ada berkas yang diunggah — aset bawaan berupa tautan sumber gratis.', 'No uploads yet — built-in assets are links to free sources.') + '</p>');
  },
  paintTbl() {
    const box = $('#as-tbl', this.el); if (!box || !this.rows) return;
    const rows = this.vis(), per = 12, max = Math.max(0, Math.ceil(rows.length / per) - 1); this.hal = Math.min(this.hal, max);
    const pg = rows.slice(this.hal * per, this.hal * per + per), kitN = (id) => { const k = App.kits().find((x) => x.ID === id); return k ? k.Nama : tr('Semua kit', 'All kits'); };
    const pill = { audio: 'p-sage', visual: 'p-blush', font: 'p-lav', ekspor: 'p-butter' };
    box.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>' + tr('Nama aset', 'Asset title') + '</th><th>' + tr('Kategori', 'Category') + '</th><th>' + tr('Sumber / path', 'Source / path') + '</th><th>Kit</th><th>' + tr('Lisensi', 'License') + '</th><th class="tr">' + tr('Ukuran', 'Size') + '</th><th></th></tr></thead><tbody>' +
      (pg.length ? pg.map((a) => '<tr><td class="mono xs">' + h(a.ID) + '</td><td class="sb">' + h(a.Nama) + '</td><td><span class="pill sm ' + pill[this.grupDari(a.Jenis)] + '">' + h(a.Jenis) + '</span></td><td class="mono xs" style="max-width:260px"><span class="clamp-1">' + h(a.DriveID ? '/Asset Library/' + a.Jenis + '/' + a.Nama : a.Sumber + ' · ' + String(a.URL).replace(/^https?:\/\//, '')) + '</span></td><td class="small">' + h(kitN(a.KitID)) + '</td><td><span class="pill sm mono ' + (a.Lisensi ? 'p-ok' : 'p-warn') + '">' + h(a.Lisensi ? tr('Jelas', 'Cleared') : tr('Cek', 'Check')) + '</span></td><td class="tr num small">' + (a.Ukuran ? Fmt.bytes(a.Ukuran) : '—') + '</td><td><div class="row gap-4" style="justify-content:flex-end;flex-wrap:nowrap"><button class="icon-btn sm ghost" data-act="buka" data-id="' + h(a.ID) + '" aria-label="' + tr('Buka', 'Open') + '">' + ic('open_in_new', 'sm') + '</button><button class="icon-btn sm ghost" data-act="edit" data-id="' + h(a.ID) + '" aria-label="Edit">' + ic('edit', 'sm') + '</button><button class="icon-btn sm ghost" data-act="del" data-id="' + h(a.ID) + '" aria-label="' + tr('Hapus', 'Delete') + '">' + ic('delete', 'sm') + '</button></div></td></tr>').join('') : '<tr><td colspan="8">' + UI.empty('search_off', tr('Tidak ada aset', 'No assets')) + '</td></tr>') + '</tbody></table></div>' +
      '<div class="pager"><span class="xs muted">' + tr('Menampilkan ', 'Showing ') + pg.length + tr(' dari ', ' of ') + rows.length + tr(' aset', ' assets') + '</span><div class="row gap-4">' + (max > 0 ? Array.from({ length: max + 1 }, (_, i) => '<button class="btn btn-xs ' + (i === this.hal ? 'btn-sage' : 'btn-ghost') + '" data-act="pg" data-p="' + i + '">' + (i + 1) + '</button>').join('') : '') + '</div></div>';
  },
  jenisDari(mime, nama) {
    if (/^audio\//.test(mime)) return /sfx|whoosh|swipe|pop|click/i.test(nama) ? 'SFX' : 'Musik';
    if (/font|ttf|otf|woff/i.test(mime + nama)) return 'Font';
    if (/png/.test(mime) && /sticker|stiker|badge/i.test(nama)) return 'Stiker';
    if (/^image\//.test(mime)) return /texture|tekstur|paper|grain/i.test(nama) ? 'Tekstur' : 'Visual';
    return 'Lainnya';
  },
  async upload() {
    const fs = await Files.pick('audio/*,image/*,.ttf,.otf,.woff,.woff2,video/mp4', false); const f = fs[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) return UI.toast(tr('Maksimal 10 MB per berkas.', 'Max 10 MB per file.'), 'warn');
    const jenis = this.jenisDari(f.type, f.name), nama = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    const m = UI.modal({ title: tr('Unggah ke Google Drive', 'Upload to Google Drive'), kicker: 'Asset Library', size: 'sm',
      body: '<form class="col gap-12" id="auf"><div class="inset small">' + ic('description', 'sm') + ' ' + h(f.name) + ' · ' + Fmt.bytes(f.size) + '</div><div class="field"><label>' + tr('Nama', 'Name') + '</label><input class="inp" name="Nama" value="' + h(nama) + '"></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Jenis', 'Type') + '</label><select class="sel" name="Jenis">' + opts(this.JENIS, jenis) + '</select></div><div class="field"><label>Kit</label><select class="sel" name="KitID">' + opts([{ v: '', l: tr('Semua kit', 'All kits') }].concat(App.kits().map((k) => ({ v: k.ID, l: k.Nama }))), '') + '</select></div></div><div class="field"><label>' + tr('Mood / tema', 'Mood / theme') + '</label><input class="inp" name="Tema" placeholder="lo-fi, tenang, carousel"></div><div class="grid g2" style="gap:10px"><div class="field"><label>Tag</label><input class="inp" name="Tag"></div><div class="field"><label>' + tr('Durasi', 'Duration') + '</label><input class="inp" name="Durasi" placeholder="2:30"></div></div><div class="field"><label>' + tr('Lisensi', 'License') + '</label><input class="inp" name="Lisensi" value="' + tr('Milik sendiri', 'Own work') + '"></div></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="auf-ok">' + ic('cloud_upload', 'sm') + tr('Unggah', 'Upload') + '</button>' });
    $('#auf-ok', m.el.parentNode).onclick = async (e) => {
      const v = formVals($('#auf', m.el)); UI.busy(e.currentTarget, true, tr('Mengunggah…', 'Uploading…'));
      try {
        const d = /^image\/(png|jpe?g|webp)$/.test(f.type) ? await Files.image(f, 2000, 0.9) : await Files.toB64(f);
        const r = await API.call('aset.upload', Object.assign(v, { base64: d.base64, mime: d.mime }));
        if (r.success) { m.close(); this.rows.push(r.data); this.paint(); }
      } catch (err) { UI.toast(err.message, 'err'); }
      UI.busy(e.currentTarget, false);
    };
  },
  form(a) {
    a = a || { Nama: '', Jenis: 'Musik', Sumber: '', URL: '', Lisensi: '', Tema: '', Tag: '', Durasi: '', KitID: '' };
    const m = UI.modal({ title: a.ID ? tr('Edit aset', 'Edit asset') : tr('Tambah aset dari tautan', 'Add asset from a link'), kicker: 'Asset Library', size: 'sm',
      body: '<form class="col gap-12" id="aff"><div class="field"><label>' + tr('Nama', 'Name') + '</label><input class="inp" name="Nama" value="' + h(a.Nama) + '"></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Jenis', 'Type') + '</label><select class="sel" name="Jenis">' + opts(this.JENIS.concat(['Ekspor']), a.Jenis) + '</select></div><div class="field"><label>' + tr('Sumber', 'Source') + '</label><input class="inp" name="Sumber" value="' + h(a.Sumber) + '" placeholder="Pixabay Music"></div></div>' +
        (a.DriveID ? '<input type="hidden" name="URL" value="' + h(a.URL) + '"><p class="xs muted">' + tr('Berkas tersimpan di Google Drive.', 'File stored in Google Drive.') + '</p>' : '<div class="field"><label>URL</label><input class="inp" name="URL" value="' + h(a.URL) + '" placeholder="https://"></div>') +
        '<div class="field"><label>' + tr('Mood / tema', 'Mood / theme') + '</label><input class="inp" name="Tema" value="' + h(a.Tema) + '"></div><div class="grid g2" style="gap:10px"><div class="field"><label>Tag</label><input class="inp" name="Tag" value="' + h(a.Tag) + '"></div><div class="field"><label>' + tr('Durasi', 'Duration') + '</label><input class="inp" name="Durasi" value="' + h(a.Durasi) + '"></div></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Lisensi', 'License') + '</label><input class="inp" name="Lisensi" value="' + h(a.Lisensi) + '"></div><div class="field"><label>Kit</label><select class="sel" name="KitID">' + opts([{ v: '', l: tr('Semua kit', 'All kits') }].concat(App.kits().map((k) => ({ v: k.ID, l: k.Nama }))), a.KitID) + '</select></div></div></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="aff-ok">' + tr('Simpan', 'Save') + '</button>' });
    $('#aff-ok', m.el.parentNode).onclick = async (e) => {
      const v = formVals($('#aff', m.el)); if (!v.Nama.trim()) return UI.toast(tr('Nama wajib diisi.', 'Name is required.'), 'warn');
      UI.busy(e.currentTarget, true); const r = await API.call('aset.save', Object.assign(v, { ID: a.ID || '' })); UI.busy(e.currentTarget, false);
      if (r.success) { m.close(); const i = this.rows.findIndex((x) => x.ID === r.data.ID); if (i > -1) this.rows[i] = r.data; else this.rows.push(r.data); this.paint(); }
    };
  },
  async hapus(id) {
    const a = this.get(id); if (!a) return;
    let hapusFile = false;
    if (a.DriveID) hapusFile = await UI.confirm(tr('Hapus juga berkasnya dari Google Drive (dipindah ke Sampah)? Pilih Batal untuk hanya menghapus dari registry.', 'Also delete the file from Google Drive (moved to Trash)? Choose Cancel to remove from the registry only.'), { ok: tr('Ya, hapus berkas', 'Yes, delete file'), danger: true });
    else if (!(await UI.confirm(tr('Hapus "' + a.Nama + '" dari registry?', 'Remove "' + a.Nama + '" from the registry?'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    const r = await API.call('aset.delete', { id, hapusFile });
    if (r.success) { this.rows = this.rows.filter((x) => x.ID !== id); this.paint(); }
  },
  drive() { const u = this.sys && this.sys.folderUrl; if (u) window.open(u, '_blank', 'noopener'); else UI.toast(tr('Folder Drive belum tersedia — jalankan setupAppEnvironment().', 'Drive folder not available — run setupAppEnvironment().'), 'warn'); },
  ekspor() { Export.xlsx((this.rows || []).map((a) => ({ ID: a.ID, Nama: a.Nama, Jenis: a.Jenis, Sumber: a.Sumber, URL: a.URL, DriveID: a.DriveID, Lisensi: a.Lisensi, Tema: a.Tema, Tag: a.Tag, Durasi: a.Durasi, Ukuran: a.Ukuran, KitID: a.KitID })), 'Asset-Library-' + Fmt.today(), 'Aset_Media'); }
});
