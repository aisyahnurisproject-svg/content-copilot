/* CRM Kontak (R2): Nama · Email · WhatsApp — segmen, tag, status WA, opt-out, duplikat, timeline interaksi, import/ekspor */
'use strict';
Pages.def('crm', {
  SEG: ['Lead', 'Pembeli', 'Member', 'Kolaborator', 'Klien', 'Pemilik', 'Lainnya'],
  KANAL: ['Catatan', 'WA Manual', 'Email Manual', 'Telepon', 'DM', 'Kunjungan'],
  marquee() { return ['Growth R2 // CRM Contacts', 'Name · Email · WhatsApp', 'Synced with Google Sheets [CRM_KONTAK · CRM_INTERAKSI]', 'Opt-out respected in every blast']; },
  render(el, params) {
    this.el = el; this.f = { cari: '', segmen: params.segmen || '', statusWA: '', sumber: '', tag: '', optOut: '', duplikat: false, masalah: false }; this.hal = 1; this.per = 25; this.sel = new Set(); this.d = null;
    bindActs(el, {
      seg: (b) => { this.f.segmen = b.dataset.v; this.hal = 1; this.muat(); }, tog: (b) => { const k = b.dataset.k; this.f[k] = k === 'optOut' ? (this.f.optOut ? '' : 'YA') : !this.f[k]; this.hal = 1; this.muat(); }, pg: (b) => { this.hal = +b.dataset.p; this.muat(); },
      chk: (b) => { b.checked ? this.sel.add(b.dataset.id) : this.sel.delete(b.dataset.id); this.paintBulk(); }, all: (b) => { $$('[data-act=chk]', el).forEach((c) => { c.checked = b.checked; b.checked ? this.sel.add(c.dataset.id) : this.sel.delete(c.dataset.id); }); this.paintBulk(); },
      detail: (b) => this.detail(b.dataset.id), baru: () => this.form(), sync: (b) => this.sync(b), imp: () => this.impor(), exp: (b) => this.ekspor(b), dup: () => this.duplikat(),
      bulk: (b) => this.bulk(b.dataset.a, b), cekwa: (b) => this.cekWA(b), blast: () => this.keBlast(), clr: () => { this.sel.clear(); this.paintTbl(); this.paintBulk(); }
    });
    el.innerHTML = App.hero({ word: 'R-02', pills: '<span class="pill mono p-blush">' + ic('contacts', 'xs') + 'CRM · Nama · Email · WA</span><span class="pill mono p-line" id="cr-sync"></span>',
      title: tr('setiap kontak. <span class="it">satu cerita.</span>', 'every contact. <span class="it">one story.</span>'),
      sub: tr('Semua lead dari form, pembeli, kolaborator, dan kontak impor berkumpul di satu tempat — lengkap dengan status WhatsApp, opt-out, tag, dan riwayat interaksi. Siap untuk blast yang sopan.', 'Every lead from your form, buyers, collaborators and imported contacts in one place — with WhatsApp status, opt-out, tags and interaction history. Ready for polite blasts.'),
      side: '<button class="btn btn-ink shine" data-act="baru">' + ic('person_add', 'sm') + tr('Kontak baru', 'New contact') + '</button><div class="row gap-8 wrap" style="justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-act="imp">' + ic('upload_file', 'sm') + 'Import</button><button class="btn btn-ghost btn-sm" data-act="exp">' + ic('download', 'sm') + 'Export</button><button class="btn btn-ghost btn-sm" data-act="sync">' + ic('sync', 'sm') + 'Sync</button></div><a class="link-mono xs" href="lead.html" target="_blank" rel="noopener">' + tr('Buka form lead publik ↗', 'Open public lead form ↗') + '</a>' }) +
      '<div class="grid mt-24" id="cr-kpi" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:12px">' + UI.sk(6) + '</div>' +
      '<section class="card tight mt-24 col gap-12"><div class="row wrap gap-10" style="gap:10px"><input class="inp sm grow" id="cr-q" style="max-width:320px" placeholder="' + tr('Cari nama, email, atau 08…', 'Search name, email or 08…') + '"><select class="sel sm" id="cr-wa" style="max-width:190px"></select><select class="sel sm" id="cr-src" style="max-width:170px"></select><input class="inp sm" id="cr-tag" style="max-width:160px" placeholder="tag"><div class="row gap-6 wrap" id="cr-tog"></div></div><div class="chips nowrap" id="cr-seg"></div></section>' +
      '<section class="card lg mt-16"><div id="cr-tbl">' + UI.sk(5, 'sk-line') + '</div></section><div id="cr-bulk"></div>';
    if (innerWidth < 1200) $('#cr-kpi', el).style.gridTemplateColumns = innerWidth < 700 ? 'repeat(2,minmax(0,1fr))' : 'repeat(3,minmax(0,1fr))';
    $('#cr-q', el).addEventListener('input', debounce(() => { this.f.cari = $('#cr-q', el).value.trim(); this.hal = 1; this.muat(); }, 300));
    $('#cr-tag', el).addEventListener('input', debounce(() => { this.f.tag = $('#cr-tag', el).value.trim(); this.hal = 1; this.muat(); }, 400));
    $('#cr-wa', el).onchange = (e) => { this.f.statusWA = e.target.value; this.hal = 1; this.muat(); };
    $('#cr-src', el).onchange = (e) => { this.f.sumber = e.target.value; this.hal = 1; this.muat(); };
    this.muat(); this.stats();
    if (params.id) this.detail(params.id);
  },
  q() { const o = { halaman: this.hal, per: this.per }; Object.keys(this.f).forEach((k) => { if (this.f[k]) o[k] = this.f[k]; }); return o; },
  muat() { API.swr('crm.list', this.q(), { maxAge: 15000, onData: (d) => { this.d = d; this.paint(); } }); },
  stats() { API.swr('crm.stats', {}, { maxAge: 20000, onData: (s) => { this.s = s; this.paintKpi(); } }); },
  segar() { this.stats(); API.read('crm.list', this.q()).then((r) => { if (r.success) { this.d = r.data; this.paint(); } }); },
  paintKpi() {
    const s = this.s, k = (cls, l, v, sub, act) => '<div class="card ' + cls + ' kpi' + (act ? '" style="cursor:pointer" ' + act : '"') + '><div class="label">' + l + '</div><div class="v mt-8" style="font-size:34px">' + v + '</div><div class="xs muted mt-4">' + sub + '</div></div>';
    $('#cr-kpi', this.el).innerHTML = k('', tr('Total kontak', 'Total contacts'), Fmt.n(s.total), '+' + s.baru7 + tr(' dalam 7 hari', ' in 7 days')) + k('sage', tr('WA terdaftar', 'WA registered'), Fmt.n(s.terdaftarWA), s.waValid + tr(' nomor valid · ', ' valid numbers · ') + s.belumCekWA + tr(' belum dicek', ' unchecked')) + k('lav', tr('Email valid', 'Valid email'), Fmt.n(s.emailValid), s.total ? Math.round(100 * s.emailValid / s.total) + '% ' + tr('dari total', 'of total') : '—') +
      k('blush', tr('Lead baru (7h)', 'New leads (7d)'), Fmt.n(s.lead7), tr('dari form lead magnet', 'from the lead magnet form')) + k('butter', tr('Duplikat', 'Duplicates'), Fmt.n(s.duplikat), tr('klik untuk gabungkan', 'click to merge'), 'data-act="dup"') + k('paper', 'Opt-out', Fmt.n(s.optOut), s.tidakBisa + tr(' tanpa WA & email valid', ' without valid WA & email'));
  },
  paint() {
    const d = this.d, fc = d.facet;
    $('#cr-sync', this.el).textContent = 'Sync: ' + (d.syncTerakhir ? Fmt.rel(new Date(d.syncTerakhir).toISOString()) : '—');
    $('#cr-seg', this.el).innerHTML = '<button class="chip' + (!this.f.segmen ? ' on' : '') + '" data-act="seg" data-v="">' + tr('Semua segmen', 'All segments') + ' <span class="n">' + Object.values(fc.segmen).reduce((a, b) => a + b, 0) + '</span></button>' + Object.keys(fc.segmen).map((s) => '<button class="chip' + (this.f.segmen === s ? ' on' : '') + '" data-act="seg" data-v="' + h(s) + '">' + h(s) + ' <span class="n">' + fc.segmen[s] + '</span></button>').join('');
    $('#cr-wa', this.el).innerHTML = opts([{ v: '', l: tr('Status WA: semua', 'WA status: all') }].concat(Object.keys(fc.statusWA).map((x) => ({ v: x, l: x + ' (' + fc.statusWA[x] + ')' }))), this.f.statusWA);
    $('#cr-src', this.el).innerHTML = opts([{ v: '', l: tr('Sumber: semua', 'Source: all') }].concat(Object.keys(fc.sumber).map((x) => ({ v: x, l: x + ' (' + fc.sumber[x] + ')' }))), this.f.sumber);
    $('#cr-tog', this.el).innerHTML = [['duplikat', tr('Duplikat', 'Duplicates')], ['masalah', tr('Bermasalah', 'Problems')], ['optOut', 'Opt-out']].map((x) => '<button class="chip' + (this.f[x[0]] ? ' on blush' : '') + '" data-act="tog" data-k="' + x[0] + '">' + h(x[1]) + '</button>').join('');
    this.paintTbl(); this.paintBulk();
  },
  waBadge(k) { const s = k.StatusWA; return s === 'Terdaftar' ? '<span class="wa-badge ya">● WA</span>' : s === 'Tidak Terdaftar' ? '<span class="wa-badge tidak">✕ WA</span>' : k.NoWA ? '<span class="wa-badge belum">? ' + tr('belum dicek', 'unchecked') + '</span>' : ''; },
  paintTbl() {
    const d = this.d, rows = d.rows, maxH = Math.max(1, Math.ceil(d.total / d.per)), pill = { Lead: 'p-blush', Pembeli: 'p-sage', Member: 'p-lav', Kolaborator: 'p-butter', Klien: 'p-sky', Pemilik: 'p-ink', Lainnya: 'p-line' };
    const semua = rows.length && rows.every((k) => this.sel.has(k.KontakID));
    $('#cr-tbl', this.el).innerHTML = (rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:36px"><label class="check sq"><input type="checkbox" data-act="all"' + (semua ? ' checked' : '') + ' aria-label="' + tr('Pilih semua', 'Select all') + '"></label></th><th>' + tr('Kontak', 'Contact') + '</th><th>WhatsApp</th><th>Email</th><th>Tag</th><th class="tr">' + tr('Pesan', 'Msgs') + '</th><th>' + tr('Terakhir dihubungi', 'Last contacted') + '</th><th></th></tr></thead><tbody>' +
      rows.map((k) => '<tr' + (k.OptOut === 'YA' ? ' style="opacity:.6"' : '') + '><td><label class="check sq"><input type="checkbox" data-act="chk" data-id="' + h(k.KontakID) + '"' + (this.sel.has(k.KontakID) ? ' checked' : '') + ' aria-label="' + tr('Pilih', 'Select') + '"></label></td><td><div class="row gap-10"><span class="avatar sm ini" style="font-size:11px">' + h(String(k.Nama || '?').trim().slice(0, 2).toUpperCase()) + '</span><div style="min-width:0"><div class="sb small clamp-1">' + h(k.Nama) + '</div><div class="row gap-4 mt-4 wrap"><span class="pill sm ' + (pill[k.Segmen] || 'p-line') + '">' + h(k.Segmen) + '</span><span class="mono xs tert">' + h(k.Sumber) + '</span>' + (k._dup ? '<span class="pill sm p-warn">' + tr('duplikat', 'duplicate') + '</span>' : '') + (k.OptOut === 'YA' ? '<span class="pill sm p-line">opt-out</span>' : '') + '</div></div></div></td>' +
        '<td class="nowrap"><div class="mono small">' + h(k.NoWA || '—') + '</div><div class="mt-4">' + this.waBadge(k) + '</div></td><td class="small"><div class="clamp-1" style="max-width:220px">' + h(k.Email || '—') + '</div>' + (k.Email ? '<span class="xs ' + (k.EmailValid === 'YA' ? 'tert' : '') + '" style="' + (k.EmailValid === 'YA' ? '' : 'color:var(--danger)') + '">' + (k.EmailValid === 'YA' ? '✓ valid' : '✕ ' + tr('tidak valid', 'invalid')) + '</span>' : '') + '</td>' +
        '<td><div class="row gap-4 wrap" style="max-width:200px">' + String(k.Tag || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t) => '<span class="pill sm p-line">#' + h(t) + '</span>').join('') + '</div></td><td class="tr num small">' + Fmt.n(k.JumlahPesan) + '</td><td class="xs muted nowrap">' + (k.TerakhirDihubungi ? h(Fmt.rel(k.TerakhirDihubungi)) : '—') + '</td>' +
        '<td><div class="row gap-4" style="justify-content:flex-end;flex-wrap:nowrap">' + (k.NoWA ? '<a class="icon-btn sm ghost" href="https://wa.me/62' + h(String(k.NoWA).replace(/^0/, '')) + '" target="_blank" rel="noopener" aria-label="WhatsApp" title="' + tr('Chat manual di WhatsApp', 'Manual WhatsApp chat') + '">' + ic('chat', 'sm') + '</a>' : '') + '<button class="btn btn-ghost btn-xs" data-act="detail" data-id="' + h(k.KontakID) + '">' + tr('Detail', 'Detail') + '</button></div></td></tr>').join('') + '</tbody></table></div>'
      : UI.empty('person_search', tr('Tidak ada kontak', 'No contacts'), tr('Tambah manual, import CSV, atau bagikan form lead publik.', 'Add manually, import a CSV, or share the public lead form.'))) +
      '<div class="pager"><span class="xs muted">' + Fmt.n(d.total) + tr(' kontak · halaman ', ' contacts · page ') + d.halaman + '/' + maxH + '</span><div class="row gap-4">' + (d.halaman > 1 ? '<button class="btn btn-ghost btn-xs" data-act="pg" data-p="' + (d.halaman - 1) + '">‹ ' + tr('Sebelumnya', 'Prev') + '</button>' : '') + (d.halaman < maxH ? '<button class="btn btn-ghost btn-xs" data-act="pg" data-p="' + (d.halaman + 1) + '">' + tr('Berikutnya', 'Next') + ' ›</button>' : '') + '</div></div>';
  },
  paintBulk() {
    const n = this.sel.size, box = $('#cr-bulk', this.el);
    box.innerHTML = n ? '<div class="qbar" style="bottom:20px"><b>' + n + tr(' dipilih', ' selected') + '</b><button class="btn btn-soft btn-xs" data-act="bulk" data-a="tag">+ tag</button><button class="btn btn-soft btn-xs" data-act="bulk" data-a="untag">− tag</button><button class="btn btn-soft btn-xs" data-act="bulk" data-a="segmen">' + tr('Segmen', 'Segment') + '</button><button class="btn btn-soft btn-xs" data-act="cekwa">' + ic('verified', 'xs') + tr('Cek WA', 'Check WA') + '</button><button class="btn btn-soft btn-xs" data-act="bulk" data-a="optout">Opt-out</button><button class="btn btn-soft btn-xs" data-act="bulk" data-a="optin">Opt-in</button><button class="btn btn-blush btn-xs" data-act="blast">' + ic('campaign', 'xs') + 'Blast WA</button><span class="grow"></span><button class="btn btn-soft btn-xs" data-act="bulk" data-a="hapus" style="color:#ffb4c2">' + tr('Hapus', 'Delete') + '</button><button class="btn btn-text btn-xs" data-act="clr" style="color:#fff">✕</button></div>' : '';
  },
  async bulk(a, btn) {
    const ids = Array.from(this.sel); let nilai = '';
    if (a === 'tag' || a === 'untag') { nilai = await UI.prompt(a === 'tag' ? tr('Tag yang ditambahkan', 'Tag to add') : tr('Tag yang dihapus', 'Tag to remove'), { placeholder: 'vip' }); if (!nilai) return; }
    if (a === 'segmen') { nilai = await UI.prompt(tr('Segmen baru (', 'New segment (') + this.SEG.join(' / ') + ')', { value: 'Pembeli' }); if (!nilai) return; }
    if (a === 'hapus' && !(await UI.confirm(tr('Hapus ' + ids.length + ' kontak? Kontak pemilik tidak ikut terhapus.', 'Delete ' + ids.length + ' contacts? The owner contact is kept.'), { danger: true, ok: tr('Hapus', 'Delete') }))) return;
    UI.busy(btn, true); const r = await API.call('crm.bulk', { ids, aksi: a, nilai }, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) { if (a === 'hapus') this.sel.clear(); this.segar(); }
  },
  async cekWA(btn) {
    const nomor = (this.d.rows || []).filter((k) => this.sel.has(k.KontakID) && k.NoWA).map((k) => k.NoWA);
    if (!nomor.length) return UI.toast(tr('Kontak terpilih tidak punya nomor WA.', 'Selected contacts have no WA number.'), 'warn');
    let tot = 0;
    for (let i = 0; i < nomor.length; i += 50) {
      UI.busy(btn, true, tr('Mengecek ', 'Checking ') + Math.min(nomor.length, i + 50) + '/' + nomor.length);
      const r = await API.call('wa.validate', { nomor: nomor.slice(i, i + 50) }, { noBootRefresh: true, toast: false });
      if (!r.success) break; tot += r.data.dicek;
    }
    UI.busy(btn, false); if (tot) { UI.toast(tot + tr(' nomor dicek.', ' numbers checked.'), 'ok'); this.segar(); }
  },
  keBlast() { Store.sset('blast-ids', Array.from(this.sel)); Router.go('notif', { tab: 'blast', dari: 'crm' }); },
  async detail(id) {
    const dr = UI.drawer({ kicker: 'CRM', title: tr('Memuat…', 'Loading…'), body: UI.sk(4, 'sk-line') });
    const r = await API.read('crm.detail', { kontakId: id }); if (!r.success) { dr.close(); return UI.toast(r.message, 'err'); }
    const k = r.data.kontak, info = r.data.info || {}, tl = r.data.timeline || [];
    $('.drawer-h .h3', dr.root).textContent = k.Nama;
    dr.el.innerHTML = '<div class="row wrap gap-6"><span class="pill p-sage">' + h(k.Segmen) + '</span><span class="pill p-line mono">' + h(k.Sumber) + '</span>' + this.waBadge(k) + (k.OptOut === 'YA' ? '<span class="pill p-line">opt-out</span>' : '') + '</div>' +
      (Object.keys(info).length ? '<div class="inset small mt-12">' + Object.keys(info).map((x) => '<div><span class="tert">' + h(x) + ':</span> ' + h(info[x]) + '</div>').join('') + '</div>' : '') +
      '<form class="col gap-10 mt-16" id="cd"><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Nama', 'Name') + '</label><input class="inp sm" name="Nama" value="' + h(k.Nama) + '"></div><div class="field"><label>WhatsApp</label><input class="inp sm" name="NoWA" inputmode="tel" value="' + h(k.NoWA) + '" placeholder="08…"></div></div><div class="field"><label>Email</label><input class="inp sm" type="email" name="Email" value="' + h(k.Email) + '"></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Segmen', 'Segment') + '</label><select class="sel sm" name="Segmen">' + opts(this.SEG, k.Segmen) + '</select></div><div class="field"><label>Tag <span class="opt">' + tr('pisahkan koma', 'comma separated') + '</span></label><input class="inp sm" name="Tag" value="' + h(k.Tag) + '"></div></div><div class="field"><label>' + tr('Catatan', 'Notes') + '</label><textarea class="ta" name="Catatan" rows="2">' + h(k.Catatan) + '</textarea></div><label class="row between small"><span>' + tr('Opt-out (tidak menerima blast)', 'Opt-out (no blasts)') + '</span><span class="sw"><input type="checkbox" name="OptOut"' + (k.OptOut === 'YA' ? ' checked' : '') + '><i></i></span></label><button type="button" class="btn btn-ink btn-sm" id="cd-ok">' + ic('save', 'sm') + tr('Simpan kontak', 'Save contact') + '</button></form>' +
      '<div class="divider mt-16"></div><div class="label mt-16">' + tr('Catat interaksi', 'Log interaction') + '</div><div class="row gap-6 mt-8"><select class="sel sm" id="ci-k" style="width:140px">' + opts(this.KANAL) + '</select><select class="sel sm" id="ci-a" style="width:110px">' + opts([{ v: 'Keluar', l: tr('Keluar', 'Outbound') }, { v: 'Masuk', l: tr('Masuk', 'Inbound') }]) + '</select></div><textarea class="ta mt-8" id="ci-r" rows="2" placeholder="' + tr('mis. Tanya bundle template, follow-up Jumat', 'e.g. Asked about the template bundle, follow up Friday') + '"></textarea><button class="btn btn-ghost btn-sm mt-8" id="ci-ok">' + ic('add_comment', 'sm') + tr('Tambah ke timeline', 'Add to timeline') + '</button>' +
      '<div class="label mt-24">Timeline</div><div class="timeline mt-12" id="cd-tl">' + (tl.length ? tl.map((t) => '<div class="tl-item' + (t.tipe === 'pesan' ? ' soft' : '') + '"><div class="row between gap-8"><span class="sb small">' + ic(t.tipe === 'pesan' ? (t.kanal === 'EMAIL' ? 'mail' : 'chat') : 'sticky_note_2', 'xs') + ' ' + h(t.kanal) + ' · ' + h(t.arah) + (t.status ? ' · <span class="pill sm mono ' + (t.status === 'Terkirim' ? 'p-ok' : t.status === 'Gagal' ? 'p-danger' : 'p-butter') + '">' + h(t.status) + '</span>' : '') + '</span><span class="mono xs tert">' + h(Fmt.dt(t.tanggal)) + '</span></div><div class="xs muted mt-4">' + h(t.ringkasan) + '</div></div>').join('') : '<p class="xs muted">' + tr('Belum ada interaksi atau pesan.', 'No interactions or messages yet.') + '</p>') + '</div>';
    $('#cd-ok', dr.el).onclick = async (e) => {
      const f = $('#cd', dr.el), v = formVals(f); v.OptOut = $('[name=OptOut]', f).checked ? 'YA' : 'TIDAK'; v.KontakID = k.KontakID;
      UI.busy(e.currentTarget, true); const x = await API.call('crm.save', v, { noBootRefresh: true }); UI.busy(e.currentTarget, false); if (x.success) this.segar();
    };
    $('#ci-ok', dr.el).onclick = async (e) => {
      const rg = $('#ci-r', dr.el).value.trim(); if (!rg) return UI.toast(tr('Tulis ringkasan interaksi.', 'Write an interaction summary.'), 'warn');
      UI.busy(e.currentTarget, true); const x = await API.call('crm.interaksi', { kontakId: k.KontakID, kanal: $('#ci-k', dr.el).value, arah: $('#ci-a', dr.el).value, ringkasan: rg }, { noBootRefresh: true }); UI.busy(e.currentTarget, false);
      if (x.success) { dr.close(); this.detail(k.KontakID); this.segar(); }
    };
  },
  form() {
    const m = UI.modal({ title: tr('Kontak baru', 'New contact'), kicker: 'CRM', size: 'sm', body: '<form class="col gap-12" id="cn"><div class="field"><label>' + tr('Nama', 'Name') + '</label><input class="inp" name="Nama"></div><div class="field"><label>WhatsApp</label><input class="inp" name="NoWA" inputmode="tel" placeholder="0812xxxxxxx"></div><div class="field"><label>Email</label><input class="inp" type="email" name="Email"></div><div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Segmen', 'Segment') + '</label><select class="sel" name="Segmen">' + opts(this.SEG, 'Lead') + '</select></div><div class="field"><label>Tag</label><input class="inp" name="Tag"></div></div></form>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Batal', 'Cancel') + '</button><button class="btn btn-ink" id="cn-ok">' + tr('Simpan', 'Save') + '</button>' });
    $('#cn-ok', m.el.parentNode).onclick = async (e) => { UI.busy(e.currentTarget, true); const r = await API.call('crm.save', formVals($('#cn', m.el)), { noBootRefresh: true }); UI.busy(e.currentTarget, false); if (r.success) { m.close(); this.segar(); } };
  },
  async sync(btn) { UI.busy(btn, true); const r = await API.call('crm.sync', {}, { noBootRefresh: true }); UI.busy(btn, false); if (r.success) this.segar(); },
  impor() {
    const m = UI.modal({ title: tr('Import kontak dari CSV', 'Import contacts from CSV'), kicker: 'CRM', size: 'sm',
      body: '<p class="small muted">' + tr('Kolom yang dikenali: <b>nama, email, wa, segmen, tag, catatan</b>. Nomor WA dinormalisasi ke 08…; kontak dengan WA/email yang sama digabung (tag ditambahkan), bukan dobel.', 'Recognised columns: <b>nama, email, wa, segmen, tag, catatan</b>. WA numbers are normalised to 08…; contacts with the same WA/email are merged (tags added), never duplicated.') + '</p><div class="row gap-8 mt-12"><button class="btn btn-ghost btn-sm" id="ci-tpl">' + ic('download', 'sm') + tr('Unduh template', 'Download template') + '</button></div><div id="ci-res" class="mt-12"></div>',
      foot: '<button class="btn btn-ghost" data-x>' + tr('Tutup', 'Close') + '</button><button class="btn btn-ink" id="ci-pick">' + ic('upload_file', 'sm') + tr('Pilih file CSV', 'Choose CSV file') + '</button>' });
    $('#ci-tpl', m.el).onclick = () => Files.download('template-kontak.csv', '﻿nama,email,wa,segmen,tag,catatan\nRina Kreator,rina@example.com,081234567890,Lead,webinar;ebook,Dari webinar Oktober\n', 'text/csv');
    $('#ci-pick', m.el.parentNode).onclick = async (e) => {
      const fs = await Files.pick('.csv,text/csv'); if (!fs[0]) return;
      const rows = Files.csv(await fs[0].text()); if (!rows.length) return UI.toast(tr('CSV kosong.', 'Empty CSV.'), 'warn');
      UI.busy(e.currentTarget, true); const r = await API.call('crm.import', { rows }, { noBootRefresh: true }); UI.busy(e.currentTarget, false);
      if (r.success) { $('#ci-res', m.el).innerHTML = '<div class="inset small">' + ic('check_circle', 'sm') + ' ' + h(r.message) + (r.data.dilewati.length ? '<div class="xs muted mt-4">' + tr('Baris dilewati: ', 'Skipped rows: ') + r.data.dilewati.slice(0, 20).join(', ') + '</div>' : '') + '</div>'; this.segar(); }
    };
  },
  async ekspor(btn) {
    UI.busy(btn, true); const r = await API.call('crm.export', { segmen: this.f.segmen }, { noBootRefresh: true, toast: false }); UI.busy(btn, false);
    if (r.success) Export.xlsx(r.data, 'CRM-Kontak-' + Fmt.today(), 'Kontak');
  },
  async duplikat() {
    const r = await API.read('crm.duplikat', {}); if (!r.success) return UI.toast(r.message, 'err');
    const g = r.data;
    const m = UI.modal({ title: tr('Gabungkan kontak duplikat', 'Merge duplicate contacts'), kicker: 'CRM', size: 'wide',
      body: g.length ? '<p class="small muted mb-12">' + tr('Pilih kontak utama di tiap grup; tag, catatan, dan jumlah pesan digabung ke kontak utama. Kontak lain ditandai “merged→”.', 'Pick the primary contact in each group; tags, notes and message counts merge into it. Others are tagged “merged→”.') + '</p><div class="col gap-12">' + g.map((x, i) => '<div class="inset col gap-6" data-g="' + i + '"><div class="row between"><span class="mono xs sb">' + h(x.kunci) + '</span><button class="btn btn-ink btn-xs" data-merge="' + i + '">' + tr('Gabungkan', 'Merge') + '</button></div>' + x.kontak.map((k, j) => '<label class="check small"><input type="radio" name="g' + i + '" value="' + h(k.KontakID) + '"' + (j === 0 ? ' checked' : '') + '> <b>' + h(k.Nama) + '</b> <span class="tert">· ' + h(k.Sumber) + ' · ' + h(k.Email || '') + ' · ' + h(k.NoWA || '') + '</span></label>').join('') + '</div>').join('') + '</div>' : UI.empty('task_alt', tr('Tidak ada duplikat', 'No duplicates'), tr('Database kontak Anda bersih.', 'Your contact database is clean.')),
      foot: '<button class="btn btn-ghost" data-x>' + tr('Tutup', 'Close') + '</button>' });
    m.el.onclick = async (e) => {
      const b = e.target.closest('[data-merge]'); if (!b) return;
      const i = +b.dataset.merge, grp = g[i], utama = $('input[name=g' + i + ']:checked', m.el).value;
      UI.busy(b, true); const x = await API.call('crm.merge', { utama, gabung: grp.kontak.map((k) => k.KontakID).filter((id) => id !== utama) }, { noBootRefresh: true }); UI.busy(b, false);
      if (x.success) { $('[data-g="' + i + '"]', m.el).remove(); this.segar(); }
    };
  }
});
