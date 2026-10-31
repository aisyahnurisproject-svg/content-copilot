/* WA & Notifikasi (R3): Blast WA per batch (Fonnte), antrean & riwayat, konfigurasi saklar + matriks event × kanal */
'use strict';
Pages.def('notif', {
  TABS: [['blast', 'campaign', 'Blast WhatsApp', 'WhatsApp blast'], ['antrean', 'queue', 'Antrean & riwayat', 'Queue & history'], ['config', 'tune', 'Konfigurasi', 'Configuration']],
  marquee() { return ['Growth R3 // WhatsApp & Notifications', 'Fonnte gateway · Gmail', 'Queue-based — buttons stay instant', 'Batch 10/20/50 · anti-ban delay · opt-out respected']; },
  render(el, params) {
    this.el = el; this.tab = params.tab || Store.get('nt-tab', 'blast'); this.aud = null; this.hanyaWA = true; this.src = 'crm'; this.ids = params.dari === 'crm' ? Store.sget('blast-ids', null) : null; this.qf = { status: '', kanal: '' };
    bindActs(el, {
      tab: (b) => { this.tab = b.dataset.v; Store.set('nt-tab', this.tab); this.paint(); }, src: (b) => { this.src = b.dataset.v; this.paintBlast(); }, aud: (b) => this.audience(b), cek: (b) => this.cekWA(b), hwa: (b) => { this.hanyaWA = b.checked; this.paintAud(); },
      ins: (b) => this.sisip(b.dataset.v), buat: (b) => this.buat(b), proc: (b) => this.proses(b), stop: (b) => this.stop(b), noIds: () => { this.ids = null; Store.sdel('blast-ids'); this.paintBlast(); },
      qf: (b) => { this.qf[b.dataset.k] = b.dataset.v; this.muatQ(); }, retry: (b) => this.retry(b), now: (b) => this.sekarang(b), qref: (b) => this.muatQ(b),
      simpan: (b) => this.simpanCfg(b), dev: (b) => this.device(b), test: (b) => this.testWA(b), tokDel: (b) => this.hapusToken(b), rst: (b) => this.resetTpl(b.dataset.k), tpl: (b) => { const g = $('[data-evg="' + b.dataset.k + '"]', el); g.hidden = !g.hidden; if (innerWidth < 1000) g.style.gridTemplateColumns = 'minmax(0,1fr)'; }
    });
    el.innerHTML = App.hero({ word: 'R-03', pills: '<span class="pill mono p-sage">' + ic('chat', 'xs') + 'Fonnte · Gmail</span><span class="pill mono p-line" id="nt-st"></span>',
      title: tr('pesan yang sampai. <span class="it">tanpa terasa spam.</span>', 'messages that land. <span class="it">never spammy.</span>'),
      sub: tr('Kirim pengingat jadwal, ringkasan harian, sambutan lead, dan blast WhatsApp per batch dengan jeda aman. Semua lewat antrean — tombol tetap instan, pengiriman berjalan di latar.', 'Send schedule reminders, daily summaries, lead welcomes and batched WhatsApp blasts with safe delays. Everything goes through a queue — buttons stay instant, delivery runs in the background.') }) +
      '<div class="seg mt-24" id="nt-tabs"></div><div id="nt-body" class="mt-16"></div>';
    API.swr('notif.config', {}, { maxAge: 20000, onData: (c) => { this.cfg = c; this.paintSt(); if (this.tab === 'config') this.paintCfg(); if (this.tab === 'blast' && !this.aud) this.paintBlast(); } });
    this.paint();
    App.every(() => { if (this.tab === 'blast' && this.berjalan && Activity.due('blast', 8000, 30000)) this.muatBlast(); }, 2000);
  },
  paintSt() { const c = this.cfg; $('#nt-st', this.el).textContent = 'WA ' + (c.waAktif ? 'ON' : 'OFF') + ' · Email ' + (c.emailAktif ? 'ON' : 'OFF') + ' · ' + tr('kuota email ', 'email quota ') + c.sisaEmail; },
  paint() {
    $('#nt-tabs', this.el).innerHTML = this.TABS.map((t) => '<button class="' + (this.tab === t[0] ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '">' + ic(t[1], 'sm') + ' ' + h(tr(t[2], t[3])) + '</button>').join('');
    $('#nt-body', this.el).innerHTML = '<div class="grid g2">' + UI.sk(2) + '</div>';
    if (this.tab === 'blast') this.paintBlast(); else if (this.tab === 'antrean') this.paintQ(); else if (this.cfg) this.paintCfg();
  },
  /* ================= BLAST ================= */
  paintBlast() {
    const c = this.cfg || {}, b = $('#nt-body', this.el);
    const warn = c.tokenAda === false ? '<div class="card butter row between wrap gap-12 mb-16"><span class="small">' + ic('warning', 'sm') + ' ' + tr('Token Fonnte belum diisi — blast belum bisa dikirim.', 'Fonnte token not set — blasts cannot be sent yet.') + '</span><button class="btn btn-ink btn-sm" data-act="tab" data-v="config">' + tr('Isi di Konfigurasi', 'Set in Configuration') + '</button></div>' : '';
    b.innerHTML = warn + '<div class="grid" id="bl-g" style="grid-template-columns:minmax(0,5fr) minmax(0,4fr);align-items:start"><div class="col gap-16" style="gap:16px">' +
      '<section class="card col gap-12"><div class="row between wrap gap-8"><div class="label">01 // ' + tr('Penerima', 'Audience') + '</div><div class="seg"><button class="' + (this.src === 'crm' ? 'on' : '') + '" data-act="src" data-v="crm">CRM</button><button class="' + (this.src === 'manual' ? 'on' : '') + '" data-act="src" data-v="manual">Manual</button></div></div>' +
        (this.src === 'crm' ? (this.ids ? '<div class="inset row between small"><span>' + ic('checklist', 'sm') + ' ' + this.ids.length + tr(' kontak dipilih dari CRM', ' contacts selected in CRM') + '</span><button class="btn btn-text btn-xs" data-act="noIds">' + tr('Pakai filter', 'Use filters') + '</button></div>' : '<div class="grid g3" style="gap:10px"><div class="field"><label>' + tr('Segmen', 'Segment') + '</label><select class="sel sm" id="au-seg">' + opts([{ v: '', l: tr('Semua', 'All') }, 'Lead', 'Pembeli', 'Member', 'Kolaborator', 'Klien', 'Lainnya']) + '</select></div><div class="field"><label>Tag</label><input class="inp sm" id="au-tag" placeholder="vip"></div><div class="field"><label>Status WA</label><select class="sel sm" id="au-wa">' + opts([{ v: '', l: tr('Semua', 'All') }, 'Terdaftar', 'Tidak Terdaftar']) + '</select></div></div>')
          : '<div class="field"><label>' + tr('Satu nomor per baris: 0812…|Nama', 'One number per line: 0812…|Name') + '</label><textarea class="ta mono" id="au-man" rows="5" placeholder="081234567890|Rina\n085712345678|Budi"></textarea></div>') +
        '<button class="btn btn-ink btn-sm" data-act="aud">' + ic('group', 'sm') + tr('Muat penerima', 'Load recipients') + '</button><div id="au-res"></div></section>' +
      '<section class="card col gap-12"><div class="label">02 // ' + tr('Pesan', 'Message') + '</div><div class="field"><label>' + tr('Judul blast (internal)', 'Blast title (internal)') + '</label><input class="inp sm" id="bm-j" placeholder="' + tr('mis. Promo template akhir bulan', 'e.g. End-of-month template promo') + '"></div><div class="field"><label>' + tr('Isi pesan', 'Message body') + ' <span class="opt" id="bm-n">0</span></label><textarea class="ta" id="bm-p" rows="7" placeholder="' + tr('Hai {nama} 👋 …', 'Hi {nama} 👋 …') + '"></textarea></div><div class="row wrap gap-6">' + ['{nama}', '{studio}', '{link}', '*tebal*', '_miring_', '🍒', '✨', '👇'].map((v) => '<button class="chip" data-act="ins" data-v="' + h(v) + '">' + h(v) + '</button>').join('') + '</div>' +
        '<div class="grid g2" style="gap:10px"><div class="field"><label>' + tr('Ukuran batch', 'Batch size') + '</label><div class="seg" id="bm-b">' + [10, 20, 50].map((n) => '<button class="' + ((c.batchDefault || 20) === n ? 'on' : '') + '" data-b="' + n + '">' + n + '</button>').join('') + '</div></div><div class="field"><label>' + tr('Jeda antarpesan (detik)', 'Delay between messages (s)') + '</label><input class="inp sm" id="bm-d" value="' + h(c.jeda || '5') + '" placeholder="5 / 3-8"></div></div>' +
        '<p class="xs muted">' + tr('Anti-banned: kirim bertahap, jeda acak (mis. 3-8), sapa dengan nama, dan beri opsi berhenti (balas STOP). Kontak opt-out otomatis dilewati.', 'Anti-ban: send in batches, use a random delay (e.g. 3-8), greet by name, and offer a way out (reply STOP). Opt-out contacts are skipped automatically.') + '</p><button class="btn btn-blush shine" data-act="buat">' + ic('send', 'sm') + tr('Buat blast & masukkan antrean', 'Create blast & queue it') + '</button></section></div>' +
      '<div class="col gap-16" style="gap:16px"><section class="card col gap-10"><div class="label">' + tr('Pratinjau WhatsApp', 'WhatsApp preview') + '</div><div class="wa-wall"><div class="wa-bubble" id="bm-prev">' + tr('Pesan akan tampil di sini…', 'Your message appears here…') + '</div></div></section><section class="card col gap-10"><div class="row between"><div class="label">' + tr('Blast terbaru', 'Recent blasts') + '</div><button class="btn btn-text btn-xs" data-act="qref">' + ic('refresh', 'xs') + '</button></div><div id="bl-list">' + UI.sk(2, 'sk-line') + '</div></section></div></div>';
    if (innerWidth < 1000) $('#bl-g', b).style.gridTemplateColumns = 'minmax(0,1fr)';
    $('#bm-b', b).onclick = (e) => { const x = e.target.closest('[data-b]'); if (!x) return; $$('#bm-b button', b).forEach((y) => y.classList.toggle('on', y === x)); };
    $('#bm-p', b).addEventListener('input', () => this.prev());
    this.prev(); this.muatBlast(); if (this.aud) this.paintAud();
  },
  prev() {
    const p = $('#bm-p', this.el); if (!p) return;
    $('#bm-n', this.el).textContent = p.value.length + ' ' + tr('karakter', 'chars');
    const nama = this.aud && this.aud.rows.find((r) => r.valid) ? this.aud.rows.find((r) => r.valid).nama : 'Rina';
    const t = h(p.value || tr('Pesan akan tampil di sini…', 'Your message appears here…')).replace(/\{nama\}/g, h(nama)).replace(/\{studio\}/g, h(App.set('NAMA_STUDIO', 'plm. studio'))).replace(/\{link\}/g, h(App.set('APP_URL', 'https://…'))).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/_([^_\n]+)_/g, '<i>$1</i>');
    $('#bm-prev', this.el).innerHTML = t + '<div class="xs tr" style="opacity:.55;margin-top:4px">' + new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date()) + ' ✓✓</div>';
  },
  sisip(v) { const p = $('#bm-p', this.el), s = p.selectionStart || p.value.length; p.value = p.value.slice(0, s) + v + p.value.slice(p.selectionEnd || s); p.focus(); this.prev(); },
  async audience(btn) {
    const d = { sumber: this.src };
    if (this.src === 'manual') d.manual = $('#au-man', this.el).value;
    else if (this.ids) d.ids = this.ids;
    else { d.segmen = $('#au-seg', this.el).value; d.tag = $('#au-tag', this.el).value.trim(); d.statusWA = $('#au-wa', this.el).value; }
    UI.busy(btn, true); const r = await API.read('wa.audience', d); UI.busy(btn, false);
    if (!r.success) return UI.toast(r.message, 'err');
    this.aud = r.data; this.paintAud(); this.prev();
  },
  kirimKe() { return (this.aud ? this.aud.rows : []).filter((r) => r.valid && !r.ganda && !r.optOut && (!this.hanyaWA || r.statusWA !== 'Tidak Terdaftar')); },
  paintAud() {
    const box = $('#au-res', this.el); if (!box || !this.aud) return;
    const s = this.aud.ringkas, k = this.kirimKe(), belum = this.aud.rows.filter((r) => r.valid && !r.statusWA).length;
    box.innerHTML = '<div class="grid g3 mt-4" style="gap:8px">' + [[tr('Total', 'Total'), s.total, ''], [tr('Nomor valid', 'Valid'), s.valid, 'p-ok'], [tr('Tidak valid', 'Invalid'), s.tidakValid, 'p-danger'], [tr('Ganda', 'Duplicates'), s.ganda, 'p-warn'], [tr('Terdaftar WA', 'On WA'), s.terdaftarWA, 'p-sage'], ['Opt-out', s.optOut, 'p-line']].map((x) => '<div class="mini"><div class="label" style="font-size:9.5px">' + x[0] + '</div><div class="h3">' + x[1] + '</div></div>').join('') + '</div>' +
      '<label class="row between small mt-8"><span>' + tr('Lewati nomor yang tidak terdaftar WhatsApp', 'Skip numbers not on WhatsApp') + '</span><span class="sw"><input type="checkbox" data-act="hwa"' + (this.hanyaWA ? ' checked' : '') + '><i></i></span></label>' +
      (belum ? '<button class="btn btn-ghost btn-sm" data-act="cek">' + ic('verified', 'sm') + tr('Cek ' + belum + ' nomor di WhatsApp', 'Check ' + belum + ' numbers on WhatsApp') + '</button>' : '') +
      '<div class="inset small"><b>' + k.length + '</b> ' + tr('penerima akan dikirimi', 'recipients will be messaged') + ' · ' + Math.ceil(k.length / this.batch()) + ' batch</div>' +
      '<div class="col gap-4" style="max-height:200px;overflow:auto">' + this.aud.rows.slice(0, 60).map((r) => '<div class="row between xs" style="padding:4px 0;border-bottom:1px dotted var(--line)"><span>' + h(r.nama) + ' · <span class="mono">' + h(r.hp || '—') + '</span></span><span>' + (!r.valid ? '<span class="wa-badge tidak">' + tr('tidak valid', 'invalid') + '</span>' : r.optOut ? '<span class="wa-badge belum">opt-out</span>' : r.ganda ? '<span class="wa-badge belum">' + tr('ganda', 'dup') + '</span>' : r.statusWA === 'Terdaftar' ? '<span class="wa-badge ya">WA ✓</span>' : r.statusWA === 'Tidak Terdaftar' ? '<span class="wa-badge tidak">WA ✕</span>' : '<span class="wa-badge belum">?</span>') + '</span></div>').join('') + (this.aud.rows.length > 60 ? '<div class="xs tert">+' + (this.aud.rows.length - 60) + tr(' lainnya', ' more') + '</div>' : '') + '</div>';
  },
  batch() { const b = $('#bm-b button.on', this.el); return b ? +b.dataset.b : (this.cfg && this.cfg.batchDefault) || 20; },
  async cekWA(btn) {
    const nomor = this.aud.rows.filter((r) => r.valid && !r.statusWA).map((r) => r.hp); let peta = {};
    for (let i = 0; i < nomor.length; i += 50) {
      UI.busy(btn, true, tr('Mengecek ', 'Checking ') + Math.min(nomor.length, i + 50) + '/' + nomor.length);
      const r = await API.call('wa.validate', { nomor: nomor.slice(i, i + 50) }, { noBootRefresh: true, toast: false });
      if (!r.success) { UI.busy(btn, false); return UI.toast(r.message, 'err'); }
      peta = Object.assign(peta, r.data.hasil);
    }
    UI.busy(btn, false);
    this.aud.rows.forEach((r) => { if (peta[r.hp]) r.statusWA = peta[r.hp]; });
    this.aud.ringkas.terdaftarWA = this.aud.rows.filter((r) => r.statusWA === 'Terdaftar').length;
    this.paintAud(); UI.toast(Object.keys(peta).length + tr(' nomor dicek & disimpan ke CRM.', ' numbers checked & saved to CRM.'), 'ok');
  },
  async buat(btn) {
    const pesan = $('#bm-p', this.el).value.trim(), jeda = $('#bm-d', this.el).value.trim(), k = this.kirimKe();
    if (!this.aud) return UI.toast(tr('Muat penerima dulu.', 'Load recipients first.'), 'warn');
    if (!pesan) { $('#bm-p', this.el).focus(); return UI.toast(tr('Tulis pesannya.', 'Write the message.'), 'warn'); }
    if (!k.length) return UI.toast(tr('Tidak ada penerima yang bisa dikirimi.', 'No sendable recipients.'), 'warn');
    if (!/\{nama\}/.test(pesan) && !(await UI.confirm(tr('Pesan tanpa {nama} lebih mirip spam. Tetap lanjut?', 'Messages without {nama} look more like spam. Continue anyway?')))) return;
    if (!(await UI.confirm(tr('Kirim ke ', 'Send to ') + k.length + tr(' nomor dalam ', ' numbers in ') + Math.ceil(k.length / this.batch()) + tr(' batch (', ' batches (') + this.batch() + tr('/batch, jeda ', '/batch, delay ') + jeda + tr(' dtk)?', 's)?')))) return;
    UI.busy(btn, true);
    const r = await API.call('wa.blastCreate', { judul: $('#bm-j', this.el).value.trim(), pesan, ukuranBatch: this.batch(), jeda, hanyaWA: this.hanyaWA, sasaran: this.src === 'manual' ? 'Manual' : this.ids ? 'CRM terpilih' : 'CRM', penerima: k.map((x) => ({ nama: x.nama, hp: x.hp, statusWA: x.statusWA })) }, { noBootRefresh: true });
    UI.busy(btn, false);
    if (r.success) { Store.sdel('blast-ids'); this.ids = null; this.muatBlast(); }
  },
  muatBlast() {
    API.read('wa.blastList', {}).then((r) => {
      const box = $('#bl-list', this.el); if (!r.success || !box) return;
      this.berjalan = r.data.some((b) => b.Status === 'Berjalan');
      box.innerHTML = r.data.length ? r.data.slice(0, 8).map((b) => '<div class="inset col gap-6"><div class="row between gap-8"><span class="sb small clamp-1">' + h(b.Judul) + '</span>' + stPill(b.Status) + '</div><div class="bar thin"><i style="width:' + b.persen + '%"></i></div><div class="row between xs muted"><span>' + Fmt.n(b.Terkirim) + ' ' + tr('terkirim', 'sent') + ' · ' + Fmt.n(b.Gagal) + ' ' + tr('gagal', 'failed') + ' · ' + tr('sisa ', 'left ') + Fmt.n(b.sisa) + '</span><span class="mono">' + b.persen + '%</span></div>' + (b.Status === 'Berjalan' ? '<div class="row gap-6"><button class="btn btn-ink btn-xs" data-act="proc" data-id="' + h(b.BlastID) + '">' + tr('Kirim batch berikutnya', 'Send next batch') + ' (' + h(b.UkuranBatch) + ')</button><button class="btn btn-text btn-xs" data-act="stop" data-id="' + h(b.BlastID) + '" style="color:var(--danger)">' + tr('Hentikan', 'Stop') + '</button></div>' : '') + '</div>').join('') : '<p class="xs muted">' + tr('Belum ada blast.', 'No blasts yet.') + '</p>';
    });
  },
  async proses(btn) { UI.busy(btn, true, tr('Mengirim…', 'Sending…')); const r = await API.call('wa.blastProcess', { blastId: btn.dataset.id }, { noBootRefresh: true, toast: false }); UI.busy(btn, false); if (r.success) { UI.toast(tr('Batch diproses: ', 'Batch processed: ') + r.data.persen + '%', 'ok'); this.muatBlast(); } },
  async stop(btn) { if (!(await UI.confirm(tr('Hentikan blast ini? Pesan yang belum terkirim dibatalkan.', 'Stop this blast? Unsent messages are cancelled.'), { danger: true }))) return; UI.busy(btn, true); await API.call('wa.blastStop', { blastId: btn.dataset.id }, { noBootRefresh: true }); UI.busy(btn, false); this.muatBlast(); },
  /* ================= ANTREAN ================= */
  paintQ() {
    $('#nt-body', this.el).innerHTML = '<section class="card lg"><div class="row between wrap gap-12 mb-16"><div class="row wrap gap-8" id="q-f"></div><div class="row gap-8"><button class="btn btn-ghost btn-sm" data-act="qref">' + ic('refresh', 'sm') + tr('Segarkan', 'Refresh') + '</button><button class="btn btn-ghost btn-sm" data-act="retry">' + ic('replay', 'sm') + tr('Ulang yang gagal', 'Retry failed') + '</button><button class="btn btn-ink btn-sm" data-act="now">' + ic('bolt', 'sm') + tr('Proses sekarang', 'Process now') + '</button></div></div><div id="q-tbl">' + UI.sk(4, 'sk-line') + '</div><p class="xs muted mt-8">' + tr('Antrean diproses otomatis tiap 1 menit oleh trigger tickMenit. Gagal 3× → status Gagal.', 'The queue is processed automatically every minute by the tickMenit trigger. 3 failures → Failed.') + '</p></section>';
    this.muatQ();
  },
  muatQ(btn) {
    if (this.tab !== 'antrean') return this.muatBlast();
    if (btn) UI.busy(btn, true);
    API.read('notif.queue', this.qf).then((r) => {
      if (btn) UI.busy(btn, false); if (!r.success || !$('#q-tbl', this.el)) return;
      const s = r.data.ringkas;
      $('#q-f', this.el).innerHTML = [['', tr('Semua', 'All')], ['Antri', 'Antri'], ['Terkirim', tr('Terkirim', 'Sent')], ['Gagal', tr('Gagal', 'Failed')], ['Batal', tr('Batal', 'Cancelled')]].map((x) => '<button class="chip' + (this.qf.status === x[0] ? ' on' : '') + '" data-act="qf" data-k="status" data-v="' + x[0] + '">' + h(x[1]) + (x[0] ? ' <span class="n">' + (s[x[0]] || 0) + '</span>' : '') + '</button>').join('') + '<span class="vsep"></span>' + [['', tr('Semua kanal', 'All channels')], ['WA', 'WhatsApp'], ['EMAIL', 'Email']].map((x) => '<button class="chip' + (this.qf.kanal === x[0] ? ' on blush' : '') + '" data-act="qf" data-k="kanal" data-v="' + x[0] + '">' + x[1] + '</button>').join('');
      $('#q-tbl', this.el).innerHTML = r.data.rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + tr('Dibuat', 'Created') + '</th><th>' + tr('Kanal', 'Channel') + '</th><th>' + tr('Tujuan', 'To') + '</th><th>Event</th><th>' + tr('Pesan', 'Message') + '</th><th>Status</th><th>' + tr('Respon', 'Response') + '</th></tr></thead><tbody>' +
        r.data.rows.map((q) => '<tr><td class="mono xs">' + h(Fmt.dt(q.DibuatPada)) + '</td><td><span class="pill sm mono ' + (q.Kanal === 'WA' ? 'p-sage' : 'p-lav') + '">' + h(q.Kanal) + '</span></td><td class="small"><div>' + h(q.NamaPenerima) + '</div><div class="mono xs tert">' + h(q.Tujuan) + '</div></td><td class="mono xs">' + h(q.Event) + '</td><td class="xs muted"><div class="clamp-2" style="max-width:320px">' + h(q.Pesan) + '</div></td><td>' + stPill(q.Status) + (Number(q.Percobaan) ? '<div class="xs tert">' + q.Percobaan + '×</div>' : '') + '</td><td class="xs muted"><div class="clamp-2" style="max-width:200px">' + h(q.Respon) + '</div></td></tr>').join('') + '</tbody></table></div>'
        : UI.empty('inbox', tr('Antrean kosong', 'Queue is empty'));
    });
  },
  async retry(btn) { UI.busy(btn, true); await API.call('notif.retry', {}, { noBootRefresh: true }); UI.busy(btn, false); this.muatQ(); },
  async sekarang(btn) { UI.busy(btn, true, tr('Memproses…', 'Processing…')); await API.call('notif.processNow', {}, { noBootRefresh: true }); UI.busy(btn, false); this.muatQ(); },
  /* ================= KONFIGURASI ================= */
  paintCfg() {
    const c = this.cfg, m = c.matriks, b = $('#nt-body', this.el); if (!b) return;
    const sw = (id, on, dis) => '<span class="sw"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '><i></i></span>';
    b.innerHTML = '<div class="grid g3" style="align-items:start"><section class="card col gap-12"><div class="label">' + tr('Saklar utama', 'Master switches') + '</div><label class="row between"><span><b>WhatsApp</b> <span class="xs muted">(Fonnte)</span></span>' + sw('c-wa', c.waAktif) + '</label><label class="row between"><span><b>Email</b> <span class="xs muted">(Gmail · ' + tr('sisa ', 'left ') + c.sisaEmail + ')</span></span>' + sw('c-em', c.emailAktif) + '</label><label class="row between small"><span>' + tr('Deteksi otomatis nomor WA kontak baru', 'Auto-detect WA for new contacts') + '</span>' + sw('c-det', c.deteksiOtomatis) + '</label>' +
        '<div class="inset xs">' + (c.trigger ? '✓ ' + tr('Trigger tickMenit aktif — antrean diproses tiap menit.', 'tickMenit trigger active — queue processed every minute.') : '⚠ ' + tr('Trigger belum terpasang. Jalankan setupAppEnvironment() di editor Apps Script.', 'Trigger not installed. Run setupAppEnvironment() in the Apps Script editor.')) + '</div></section>' +
      '<section class="card col gap-12"><div class="label">Fonnte</div><div class="field"><label>Token ' + (c.tokenAda ? '<span class="opt mono">' + h(c.tokenSamar) + '</span>' : '') + '</label><input class="inp sm" type="password" autocomplete="off" id="c-tok" placeholder="' + (c.tokenAda ? tr('isi untuk mengganti', 'type to replace') : tr('tempel token dari fonnte.com', 'paste token from fonnte.com')) + '"><span class="hint">' + tr('Disimpan di Script Properties, tidak pernah tampil utuh.', 'Stored in Script Properties, never shown in full.') + '</span></div><div class="row wrap gap-6"><button class="btn btn-ghost btn-sm" data-act="dev">' + ic('smartphone', 'sm') + tr('Cek device', 'Check device') + '</button>' + (c.tokenAda ? '<button class="btn btn-text btn-sm" data-act="tokDel" style="color:var(--danger)">' + tr('Hapus token', 'Remove token') + '</button>' : '') + '</div><div id="c-dev"></div><div class="row gap-6"><input class="inp sm" id="c-tn" inputmode="tel" placeholder="' + tr('Nomor tes (kosong = WA pemilik)', 'Test number (empty = owner WA)') + '"><button class="btn btn-ghost btn-sm" data-act="test">' + tr('Kirim tes', 'Send test') + '</button></div></section>' +
      '<section class="card col gap-12"><div class="label">' + tr('Default pengiriman', 'Delivery defaults') + '</div><div class="grid g2" style="gap:10px"><div class="field"><label>Batch</label><select class="sel sm" id="c-b">' + opts(['10', '20', '50'], String(c.batchDefault)) + '</select></div><div class="field"><label>' + tr('Jeda (dtk)', 'Delay (s)') + '</label><input class="inp sm" id="c-j" value="' + h(c.jeda) + '"></div></div><div class="field"><label>' + tr('Nama pengirim email', 'Email sender name') + '</label><input class="inp sm" id="c-np" value="' + h(c.namaPengirim) + '"></div><div class="field"><label>APP_URL <span class="opt">{link}</span></label><div class="row gap-6"><input class="inp sm" id="c-url" value="' + h(c.appUrl) + '" placeholder="https://username.github.io/repo/"><button class="icon-btn sm" id="c-url-auto" title="' + tr('Pakai alamat ini', 'Use this address') + '" aria-label="auto">' + ic('my_location', 'sm') + '</button></div></div></section></div>' +
      '<section class="card lg mt-16"><div class="row between wrap gap-8 mb-12"><div><div class="label">' + tr('Matriks notifikasi', 'Notification matrix') + '</div><h2 class="h2 mt-4">' + tr('Kejadian × kanal', 'Events × channels') + '</h2><p class="xs muted mt-4">' + tr('Placeholder umum: {nama} {studio} {link} + variabel tiap kejadian. Kosongkan template untuk kembali ke default.', 'Common placeholders: {nama} {studio} {link} + per-event variables. Reset a template to return to default.') + '</p></div></div><div class="col gap-8">' +
        Object.keys(m).map((k) => { const e = m[k]; return '<div class="inset" data-ev="' + k + '"><div class="row between wrap gap-12"><div><div class="sb small">' + h(e.label) + '</div><div class="mono xs tert">' + k + '</div></div><div class="row gap-16"><label class="row gap-6 xs">WA <span class="sw"><input type="checkbox" data-mw="' + k + '"' + (e.wa ? ' checked' : '') + '><i></i></span></label><label class="row gap-6 xs">Email <span class="sw"><input type="checkbox" data-me="' + k + '"' + (e.email ? ' checked' : '') + '><i></i></span></label><button class="btn btn-ghost btn-xs" data-act="tpl" data-k="' + k + '">' + ic('edit', 'xs') + 'Template</button></div></div>' +
          '<div class="grid mt-12" style="grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:12px" data-evg="' + k + '" hidden><div class="col gap-8"><div class="field"><label>' + tr('Subjek email', 'Email subject') + '</label><input class="inp sm" data-ms="' + k + '" value="' + h(e.subjek) + '"></div><div class="field"><label>' + tr('Pesan', 'Message') + '</label><textarea class="ta sm" rows="6" data-mp="' + k + '">' + h(e.pesan) + '</textarea></div><button class="btn btn-text btn-xs" data-act="rst" data-k="' + k + '" style="align-self:flex-start">' + ic('restart_alt', 'xs') + tr('Kembalikan default', 'Reset to default') + '</button></div><div class="wa-wall"><div class="wa-bubble small">' + h(e.pesan).replace(/\*([^*\n]+)\*/g, '<b>$1</b>') + '</div></div></div></div>'; }).join('') + '</div></section>' +
      '<div class="qbar"><span class="grow small">' + ic('info', 'sm') + ' ' + tr('Semua pesan lewat antrean; aksi di aplikasi tidak menunggu pengiriman.', 'All messages go through the queue; app actions never wait for delivery.') + '</span><button class="btn btn-blush btn-sm" data-act="simpan">' + ic('save', 'sm') + tr('Simpan konfigurasi', 'Save configuration') + '</button></div>';
    $('#c-url-auto', b).onclick = () => { $('#c-url', b).value = location.origin + location.pathname.replace(/index\.html$/, ''); };
  },
  resetTpl(k) { const e = this.cfg.matriks[k]; $('[data-ms="' + k + '"]', this.el).value = e.subjekDefault; $('[data-mp="' + k + '"]', this.el).value = e.pesanDefault; },
  async simpanCfg(btn) {
    const b = $('#nt-body', this.el), mat = {};
    Object.keys(this.cfg.matriks).forEach((k) => { mat[k] = { wa: $('[data-mw="' + k + '"]', b).checked, email: $('[data-me="' + k + '"]', b).checked, subjek: $('[data-ms="' + k + '"]', b).value, pesan: $('[data-mp="' + k + '"]', b).value }; });
    const d = { waAktif: $('#c-wa', b).checked, emailAktif: $('#c-em', b).checked, deteksiOtomatis: $('#c-det', b).checked, batchDefault: +$('#c-b', b).value, jeda: $('#c-j', b).value.trim(), namaPengirim: $('#c-np', b).value.trim(), appUrl: $('#c-url', b).value.trim(), matriks: mat };
    const tok = $('#c-tok', b).value.trim(); if (tok) d.token = tok;
    UI.busy(btn, true); const r = await API.call('notif.configSave', d, { noBootRefresh: true }); UI.busy(btn, false);
    if (r.success) { this.cfg = r.data; API.remember('notif.config', {}, r.data); this.paintSt(); this.paintCfg(); }
  },
  async hapusToken() {
    if (!(await UI.confirm(tr('Hapus token Fonnte? WhatsApp otomatis nonaktif.', 'Remove the Fonnte token? WhatsApp will be switched off.'), { danger: true }))) return;
    const r = await API.call('notif.configSave', { token: '__HAPUS__', waAktif: false }, { noBootRefresh: true });
    if (r.success) { this.cfg = r.data; this.paintSt(); this.paintCfg(); }
  },
  async device(btn) {
    UI.busy(btn, true); const r = await API.read('wa.device', {}); UI.busy(btn, false);
    $('#c-dev', this.el).innerHTML = r.success ? '<div class="inset xs">' + ['device', 'device_status', 'package', 'quota', 'expired'].filter((k) => r.data[k] !== undefined).map((k) => '<div><span class="tert">' + k + ':</span> <b>' + h(r.data[k]) + '</b></div>').join('') + '</div>' : '<div class="inset xs" style="color:var(--danger)">' + h(r.message) + '</div>';
  },
  async testWA(btn) { UI.busy(btn, true); await API.call('wa.test', { nomor: $('#c-tn', this.el).value.trim() }, { noBootRefresh: true }); UI.busy(btn, false); }
});
