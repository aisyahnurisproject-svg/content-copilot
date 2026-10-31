/* ==========================================================================
   DIGITAL CONTENT COPILOT — Graphic Engine (kanvas, tanpa pustaka luar)
   Render slide carousel/story/feed dari konten + Branding Kit: warna, font,
   gaya latar, stiker, dan watermark otomatis. Dipakai Graphic Studio,
   Generator (inspector), Approval (mockup), Template Library (pratinjau).
   ========================================================================== */
'use strict';
const Engine = (() => {
  const FORMATS = { '4:5': [1080, 1350], '1:1': [1080, 1080], '9:16': [1080, 1920], '16:9': [1920, 1080] };
  const LAYOUTS = ['hook', 'masalah', 'poin', 'stat', 'kutipan', 'daftar', 'gambar', 'cta'];
  const logoCache = {};
  /* ---------- warna ---------- */
  const hex = (c) => { c = String(c || '#000000').replace('#', ''); if (c.length === 3) c = c.split('').map((x) => x + x).join(''); return [parseInt(c.slice(0, 2), 16) || 0, parseInt(c.slice(2, 4), 16) || 0, parseInt(c.slice(4, 6), 16) || 0]; };
  const rgb = (a, al) => 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + (al === undefined ? 1 : al) + ')';
  const mix = (c1, c2, t) => { const a = hex(c1), b = hex(c2); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const lum = (c) => { const a = hex(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
  const kontras = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const gelap = (c) => lum(c) < 0.3;
  function palet(kit) {
    kit = kit || {};
    const latar = kit.WarnaLatar || '#FAF7F2';
    let teks = kit.WarnaTeks || '#1E1B1B';
    if (kontras(teks, latar) < 4.5) teks = gelap(latar) ? '#F8F7FF' : '#1E1B1B';
    let prim = kit.WarnaPrimer || '#E57B95'; if (kontras(prim, latar) < 2.2) prim = gelap(latar) ? mix(prim, '#ffffff', 0.4) : mix(prim, '#000000', 0.35);
    const sek = kit.WarnaSekunder || '#2F4F3E', aks = kit.WarnaAksen || '#DCE7DF';
    return { latar, teks, prim, sek, aks, lembut: rgb(hex(teks), 0.72), garis: rgb(hex(teks), 0.12) };
  }
  /* ---------- teks ---------- */
  function wrap(ctx, text, maxW) {
    const out = [];
    String(text || '').split(/\n/).forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean); let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW) line = test;
        else { if (line) out.push(line); if (ctx.measureText(w).width > maxW) { let part = ''; for (const ch of w) { if (ctx.measureText(part + ch).width > maxW) { out.push(part); part = ch; } else part += ch; } line = part; } else line = w; }
      });
      if (line) out.push(line);
    });
    return out;
  }
  function fitText(ctx, text, fam, weight, maxW, maxH, start, minSize, lh, italic) {
    let size = start;
    for (; size >= minSize; size -= 2) {
      ctx.font = (italic ? 'italic ' : '') + weight + ' ' + size + 'px "' + fam + '", Georgia, serif';
      const lines = wrap(ctx, text, maxW);
      if (lines.length * size * lh <= maxH) return { size, lines };
    }
    ctx.font = (italic ? 'italic ' : '') + weight + ' ' + minSize + 'px "' + fam + '", Georgia, serif';
    const lines = wrap(ctx, text, maxW), maxL = Math.max(1, Math.floor(maxH / (minSize * lh)));
    if (lines.length > maxL) { lines.length = maxL; lines[maxL - 1] = lines[maxL - 1].replace(/\s*\S*$/, '') + '…'; }
    return { size: minSize, lines };
  }
  /** headline dengan sorotan italic warna primer pada bagian akhir (setelah ":" atau 3 kata terakhir) */
  function drawHeadline(ctx, P, text, x, y, maxW, maxH, o) {
    const fam = o.font || 'Playfair Display', lh = o.lh || 1.08, align = o.align || 'left';
    const f = fitText(ctx, text, fam, '700', maxW, maxH, o.size || 96, o.min || 40, lh);
    const words = String(text).split(/\s+/), nAkhir = o.sorot === false ? 0 : (String(text).indexOf(':') > -1 ? String(text).split(':').pop().trim().split(/\s+/).length : Math.min(3, Math.max(0, words.length - 3)));
    let idx = 0;
    const tot = f.lines.reduce((s, l) => s + l.split(' ').length, 0);
    ctx.textBaseline = 'alphabetic';
    f.lines.forEach((line, li) => {
      const ly = y + f.size * (li + 0.86) * lh / 1.0;
      const ws = line.split(' ');
      const segs = ws.map((w) => { const it = idx >= tot - nAkhir; idx++; return { w, it }; });
      const width = segs.reduce((s, sg, i) => { ctx.font = (sg.it ? 'italic 400 ' : '700 ') + f.size + 'px "' + fam + '", Georgia, serif'; return s + ctx.measureText(sg.w + (i < segs.length - 1 ? ' ' : '')).width; }, 0);
      let cx = align === 'center' ? x + (maxW - width) / 2 : align === 'right' ? x + maxW - width : x;
      segs.forEach((sg, i) => {
        ctx.font = (sg.it ? 'italic 400 ' : '700 ') + f.size + 'px "' + fam + '", Georgia, serif';
        ctx.fillStyle = sg.it ? P.prim : P.teks;
        const t = sg.w + (i < segs.length - 1 ? ' ' : '');
        ctx.fillText(t, cx, ly); cx += ctx.measureText(t).width;
      });
    });
    return f.lines.length * f.size * lh;
  }
  function drawBody(ctx, P, text, x, y, maxW, maxH, o) {
    const fam = o.font || 'DM Sans', size = o.size || 40, lh = o.lh || 1.45;
    ctx.font = (o.weight || '400') + ' ' + size + 'px "' + fam + '", system-ui, sans-serif';
    let lines = wrap(ctx, text, maxW); const maxL = Math.max(1, Math.floor(maxH / (size * lh)));
    if (lines.length > maxL) { lines = lines.slice(0, maxL); lines[maxL - 1] = lines[maxL - 1].replace(/\s*\S*$/, '') + '…'; }
    ctx.fillStyle = o.color || P.lembut; ctx.textBaseline = 'alphabetic';
    lines.forEach((l, i) => { const w = ctx.measureText(l).width, cx = o.align === 'center' ? x + (maxW - w) / 2 : o.align === 'right' ? x + maxW - w : x; ctx.fillText(l, cx, y + size * (i + 0.9) * lh); });
    return lines.length * size * lh;
  }
  function rrect(ctx, x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function pill(ctx, P, text, x, y, o) {
    o = o || {}; const size = o.size || 26;
    ctx.font = '600 ' + size + 'px "JetBrains Mono", ui-monospace, monospace';
    const t = String(text).toUpperCase(), w = ctx.measureText(t).width + size * 1.4, hh = size * 1.9;
    const bx = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    rrect(ctx, bx, y, w, hh, hh / 2); ctx.fillStyle = o.bg || P.aks; ctx.fill();
    if (o.stroke) { ctx.lineWidth = 2; ctx.strokeStyle = o.stroke; ctx.stroke(); }
    ctx.fillStyle = o.fg || (gelap(o.bg || P.aks) ? '#fff' : P.sek); ctx.textBaseline = 'middle'; ctx.fillText(t, bx + size * 0.7, y + hh / 2 + 1); ctx.textBaseline = 'alphabetic';
    return { w, h: hh };
  }
  /* ---------- latar ---------- */
  function background(ctx, W, H, P, gaya, img) {
    ctx.fillStyle = P.latar; ctx.fillRect(0, 0, W, H);
    if (img) {
      const s = Math.max(W / img.width, H / img.height), iw = img.width * s, ih = img.height * s;
      ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      const g = ctx.createLinearGradient(0, H * 0.25, 0, H);
      g.addColorStop(0, rgb(hex(P.latar), 0.15)); g.addColorStop(0.55, rgb(hex(P.latar), 0.82)); g.addColorStop(1, rgb(hex(P.latar), 0.96));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      return;
    }
    if (gaya === 'dot-grid') { ctx.fillStyle = rgb(hex(P.teks), 0.13); const st = Math.round(W / 30); for (let y = st / 2; y < H; y += st) for (let x = st / 2; x < W; x += st) { ctx.beginPath(); ctx.arc(x, y, W / 900, 0, 6.283); ctx.fill(); } }
    else if (gaya === 'linen') { ctx.strokeStyle = rgb(hex(P.teks), 0.035); ctx.lineWidth = 1; for (let i = -H; i < W; i += 7) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); } for (let i = 0; i < W + H; i += 11) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - H, H); ctx.stroke(); } }
    else if (gaya === 'dual-tone') { ctx.fillStyle = P.aks; ctx.fillRect(0, H * 0.62, W, H * 0.38); }
    else if (gaya === 'garis') { ctx.strokeStyle = rgb(hex(P.teks), 0.08); ctx.lineWidth = 2; for (let y = H * 0.12; y < H; y += W / 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.strokeStyle = rgb(hex(P.prim), 0.35); ctx.beginPath(); ctx.moveTo(W * 0.075, 0); ctx.lineTo(W * 0.075, H); ctx.stroke(); }
    else if (gaya === 'gradien') {
      const g1 = ctx.createRadialGradient(W * 0.15, H * 0.12, 10, W * 0.15, H * 0.12, W * 0.9); g1.addColorStop(0, rgb(hex(P.prim), 0.45)); g1.addColorStop(1, rgb(hex(P.prim), 0));
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(W * 0.9, H * 0.95, 10, W * 0.9, H * 0.95, W * 0.8); g2.addColorStop(0, rgb(hex(P.sek), 0.4)); g2.addColorStop(1, rgb(hex(P.sek), 0));
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    }
  }
  function sticker(ctx, emo, x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || -0.14);
    ctx.shadowColor = 'rgba(30,27,27,.18)'; ctx.shadowBlur = r * 0.5; ctx.shadowOffsetY = r * 0.12;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.font = Math.round(r * 1.05) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emo, 0, r * 0.06); ctx.restore(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }
  function bookmark(ctx, x, y, s, c) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s, y + s * 1.3); ctx.lineTo(x + s / 2, y + s * 0.95); ctx.lineTo(x, y + s * 1.3); ctx.closePath(); ctx.lineWidth = s * 0.12; ctx.strokeStyle = c; ctx.stroke(); }
  function watermark(ctx, W, H, P, o) {
    if (!o || o.aktif === false) return;
    const pos = o.posisi || 'kanan-bawah', op = Math.max(0.1, Math.min(1, Number(o.opasitas) || 0.85)), m = W * 0.06, sz = W * 0.024;
    ctx.save(); ctx.globalAlpha = op;
    ctx.font = '600 ' + sz + 'px "JetBrains Mono", ui-monospace, monospace';
    const teks = o.teks || 'plm. studio', tw = ctx.measureText(teks).width, logo = o.logo, ls = logo ? sz * 2.2 : 0, gap = logo ? sz * 0.6 : 0, w = tw + ls + gap;
    let x = pos.indexOf('kiri') > -1 ? m : pos.indexOf('tengah') > -1 ? (W - w) / 2 : W - m - w;
    const y = pos.indexOf('atas') > -1 ? m * 0.9 : H - m * 0.75 - Math.max(ls, sz);
    if (logo) { ctx.save(); ctx.beginPath(); ctx.arc(x + ls / 2, y + ls / 2, ls / 2, 0, 6.283); ctx.clip(); const s = Math.max(ls / logo.width, ls / logo.height); ctx.drawImage(logo, x + (ls - logo.width * s) / 2, y + (ls - logo.height * s) / 2, logo.width * s, logo.height * s); ctx.restore(); }
    ctx.fillStyle = P.teks; ctx.textBaseline = 'middle'; ctx.fillText(teks, x + ls + gap, y + Math.max(ls, sz) / 2);
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }
  function autoLayout(slide, i, total) {
    if (slide.layout && LAYOUTS.indexOf(slide.layout) > -1) return slide.layout;
    const t = (String(slide.judul || '') + ' ' + String(slide.isi || '')).toLowerCase();
    if (i === 0) return 'hook';
    if (i === total - 1 && total > 1) return 'cta';
    if (/\d{1,3}\s?%|\brp\s?\d|\$\d|\b\d{2,}[k]\b/.test(t)) return 'stat';
    if (/^["“]/.test(String(slide.isi || '')) || /kutipan|quote/.test(t)) return 'kutipan';
    if (/;|\n|•/.test(String(slide.isi || '')) && String(slide.isi || '').split(/;|\n|•/).filter((x) => x.trim()).length >= 3) return 'daftar';
    if (i === 1) return 'masalah';
    return 'poin';
  }
  /* ---------- render 1 slide ---------- */
  function render(canvas, slide, o) {
    o = o || {};
    const [W, H] = FORMATS[o.format || '4:5'] || FORMATS['4:5'], scale = o.scale || 1;
    canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const kit = o.kit || {}, P = palet(kit), L = o.layers || {}, T = o.type || {}, idx = o.index || 0, total = o.total || 1;
    const fJ = kit.FontJudul || 'Playfair Display', fI = kit.FontIsi || 'DM Sans';
    const layout = autoLayout(slide || {}, idx, total);
    const portrait = H > W, m = W * 0.075, inner = W - m * 2, hs = (T.scale || 1), lh = T.lh || 1.1, al = T.align || 'left';
    background(ctx, W, H, P, o.latar || kit.LatarGaya || 'dot-grid', L.image !== false && layout !== 'gambar' ? o.bgImg : null);
    // meta atas
    ctx.font = '500 ' + W * 0.021 + 'px "JetBrains Mono", ui-monospace, monospace'; ctx.fillStyle = P.lembut; ctx.textBaseline = 'alphabetic';
    const brand = (o.studio || kit.WatermarkTeks || 'plm. studio') + (o.seri ? '  •  ' + o.seri : '');
    ctx.fillText(brand.toUpperCase().slice(0, 48), m, m * 0.9 + W * 0.012);
    const cnt = ('0' + (idx + 1)).slice(-2) + ' / ' + ('0' + total).slice(-2);
    ctx.fillText(cnt, W - m - ctx.measureText(cnt).width, m * 0.9 + W * 0.012);
    ctx.fillStyle = P.garis; ctx.fillRect(m, m * 1.25, inner, 2);
    let y = m * 1.25 + W * 0.06;
    const judul = String((slide && slide.judul) || ''), isi = String((slide && slide.isi) || '');
    const emo = Array.from(String(kit.Emoji || '🍒✦🌸')).filter((c) => c.trim())[0] || '🍒';
    const bawahAman = H - m * 2.1;
    if (layout === 'hook') {
      if (o.kicker !== false) { pill(ctx, P, o.kickerTeks || (o.peran || 'Blueprint'), m, y, { size: W * 0.022 }); y += W * 0.09; }
      const hh = drawHeadline(ctx, P, judul, m, y, inner, (portrait ? H * 0.48 : H * 0.45), { font: fJ, size: W * 0.105 * hs, min: W * 0.05, lh, align: al });
      y += hh + W * 0.04;
      if (isi) drawBody(ctx, P, isi, m, y, inner * 0.9, H * 0.16, { font: fI, size: W * 0.034, align: al });
      if (L.stickers !== false) sticker(ctx, emo, W - m - W * 0.06, m * 1.25 + W * 0.11, W * 0.055, -0.18);
      if (total > 1) pill(ctx, P, (o.swipe || 'geser') + '  →', W - m, bawahAman - W * 0.02, { size: W * 0.02, align: 'right', bg: P.teks, fg: P.latar });
    } else if (layout === 'masalah' || layout === 'poin') {
      const nomor = layout === 'poin' ? ('0' + Math.max(1, idx - 1)).slice(-2) : '!';
      ctx.font = 'italic 400 ' + W * 0.2 + 'px "' + fJ + '", Georgia, serif'; ctx.fillStyle = rgb(hex(P.prim), 0.9);
      const nm = (String(judul).match(/^(\d{1,2})\s*[·.\-]/) || [])[1];
      ctx.fillText(nm ? ('0' + nm).slice(-2) : nomor, m - W * 0.01, y + W * 0.16);
      y += W * 0.22;
      const jd = judul.replace(/^\d{1,2}\s*[·.\-]\s*/, '');
      const hh = drawHeadline(ctx, P, jd, m, y, inner, H * 0.28, { font: fJ, size: W * 0.075 * hs, min: W * 0.045, lh, sorot: layout === 'masalah', align: al });
      y += hh + W * 0.035;
      ctx.fillStyle = P.prim; ctx.fillRect(m, y, W * 0.12, 6); y += W * 0.05;
      drawBody(ctx, P, isi, m, y, inner, bawahAman - y - W * 0.04, { font: fI, size: W * 0.037, align: al });
    } else if (layout === 'stat') {
      const angka = (judul + ' ' + isi).match(/(\d{1,3}(?:[.,]\d+)?\s?%|rp\s?[\d.,]+\s?(?:rb|jt|k)?|\$\s?[\d.,]+k?|\d{2,}[kx]?)/i);
      pill(ctx, P, o.peran || 'Data', m, y, { size: W * 0.022 }); y += W * 0.1;
      ctx.font = '800 ' + W * 0.24 * hs + 'px "' + fJ + '", Georgia, serif'; ctx.fillStyle = P.prim;
      ctx.fillText(angka ? angka[0].trim() : '✦', m, y + W * 0.2); y += W * 0.29;
      const hh = drawHeadline(ctx, P, judul, m, y, inner, H * 0.2, { font: fJ, size: W * 0.06, min: W * 0.04, lh, sorot: false, align: al });
      y += hh + W * 0.03;
      drawBody(ctx, P, isi, m, y, inner, bawahAman - y, { font: fI, size: W * 0.034, align: al });
    } else if (layout === 'kutipan') {
      ctx.font = '700 ' + W * 0.3 + 'px "' + fJ + '", Georgia, serif'; ctx.fillStyle = rgb(hex(P.prim), 0.85); ctx.fillText('“', m - W * 0.02, y + W * 0.22);
      y += W * 0.26;
      ctx.save();
      const q = isi || judul, f = fitText(ctx, q, fJ, '400', inner, H * 0.42, W * 0.07 * hs, W * 0.042, 1.25, true);
      ctx.fillStyle = P.teks; f.lines.forEach((l, i) => { ctx.font = 'italic 400 ' + f.size + 'px "' + fJ + '", Georgia, serif'; ctx.fillText(l, m, y + f.size * (i + 0.9) * 1.25); });
      y += f.lines.length * f.size * 1.25 + W * 0.05; ctx.restore();
      if (isi && judul) { ctx.font = '600 ' + W * 0.026 + 'px "JetBrains Mono", monospace'; ctx.fillStyle = P.lembut; ctx.fillText('— ' + judul.toUpperCase().slice(0, 40), m, y); }
    } else if (layout === 'daftar') {
      const hh = drawHeadline(ctx, P, judul, m, y, inner, H * 0.22, { font: fJ, size: W * 0.07 * hs, min: W * 0.045, lh, sorot: false, align: al });
      y += hh + W * 0.05;
      const items = isi.split(/;|\n|•/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
      items.forEach((it) => {
        if (y > bawahAman - W * 0.08) return;
        ctx.beginPath(); ctx.arc(m + W * 0.022, y + W * 0.024, W * 0.022, 0, 6.283); ctx.fillStyle = P.aks; ctx.fill();
        ctx.strokeStyle = P.sek; ctx.lineWidth = W * 0.005; ctx.beginPath(); ctx.moveTo(m + W * 0.012, y + W * 0.025); ctx.lineTo(m + W * 0.02, y + W * 0.033); ctx.lineTo(m + W * 0.034, y + W * 0.015); ctx.stroke();
        const used = drawBody(ctx, P, it, m + W * 0.07, y - W * 0.012, inner - W * 0.07, W * 0.1, { font: fI, size: W * 0.036, color: P.teks });
        y += Math.max(used, W * 0.06) + W * 0.025;
        ctx.fillStyle = P.garis; ctx.fillRect(m + W * 0.07, y - W * 0.012, inner - W * 0.07, 1.5);
      });
    } else if (layout === 'gambar') {
      const ih = portrait ? H * 0.42 : H * 0.5;
      rrect(ctx, m, y, inner, ih, W * 0.03); ctx.save(); ctx.clip();
      if (o.bgImg && L.image !== false) { const img = o.bgImg, s = Math.max(inner / img.width, ih / img.height); ctx.drawImage(img, m + (inner - img.width * s) / 2, y + (ih - img.height * s) / 2, img.width * s, img.height * s); }
      else { ctx.fillStyle = P.aks; ctx.fillRect(m, y, inner, ih); ctx.fillStyle = P.lembut; ctx.font = '500 ' + W * 0.024 + 'px "JetBrains Mono", monospace'; ctx.fillText('✦ ' + (o.noImg || 'tambahkan gambar latar'), m + W * 0.04, y + ih - W * 0.04); }
      ctx.restore(); y += ih + W * 0.05;
      const hh = drawHeadline(ctx, P, judul, m, y, inner, H * 0.2, { font: fJ, size: W * 0.065 * hs, min: W * 0.04, lh, align: al });
      y += hh + W * 0.02;
      drawBody(ctx, P, isi, m, y, inner, bawahAman - y, { font: fI, size: W * 0.032, align: al });
    } else if (layout === 'cta') {
      y += H * (portrait ? 0.08 : 0.02);
      bookmark(ctx, m, y, W * 0.06, P.prim); y += W * 0.13;
      const hh = drawHeadline(ctx, P, judul || 'Simpan ini', m, y, inner, H * 0.25, { font: fJ, size: W * 0.095 * hs, min: W * 0.05, lh, align: al });
      y += hh + W * 0.04;
      const used = drawBody(ctx, P, isi, m, y, inner * 0.92, H * 0.2, { font: fI, size: W * 0.036, align: al });
      y += used + W * 0.06;
      const btn = o.ctaBtn || (o.produk ? o.produk : 'Komentar "MAU"');
      ctx.font = '700 ' + W * 0.032 + 'px "' + fI + '", system-ui, sans-serif';
      const bw = Math.min(inner, ctx.measureText(btn).width + W * 0.12), bh = W * 0.1;
      rrect(ctx, m, Math.min(y, bawahAman - bh - W * 0.02), bw, bh, bh / 2); ctx.fillStyle = P.teks; ctx.fill();
      ctx.fillStyle = P.latar; ctx.textBaseline = 'middle'; ctx.fillText(btn + '  ✦', m + W * 0.05, Math.min(y, bawahAman - bh - W * 0.02) + bh / 2 + 1); ctx.textBaseline = 'alphabetic';
      if (L.stickers !== false) sticker(ctx, Array.from(String(kit.Emoji || '🍒✦🌸')).filter((c) => c.trim())[1] || '✦', W - m - W * 0.07, H * (portrait ? 0.3 : 0.25), W * 0.06, 0.2);
    }
    if (L.grid) { ctx.save(); ctx.strokeStyle = 'rgba(229,123,149,.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeRect(m, m, inner, H - m * 2); for (let c = 1; c < 4; c++) { ctx.beginPath(); ctx.moveTo(m + (inner * c) / 4, m); ctx.lineTo(m + (inner * c) / 4, H - m); ctx.stroke(); } ctx.restore(); }
    // kaki
    if (layout !== 'hook' && total > 1) { ctx.font = '500 ' + W * 0.02 + 'px "JetBrains Mono", monospace'; ctx.fillStyle = P.lembut; const s = idx === total - 1 ? (o.simpan || 'simpan ✦') : (o.swipe || 'geser') + ' →'; ctx.fillText(s, W - m - ctx.measureText(s).width, H - m * 0.7 - (o.watermark && o.watermark.posisi && o.watermark.posisi.indexOf('kanan-bawah') > -1 && o.watermark.aktif !== false ? W * 0.06 : 0)); }
    watermark(ctx, W, H, P, o.watermark);
    return { layout, W, H };
  }
  async function siapkanKit(kit) {
    if (!kit) return { logo: null };
    await Promise.all([Fonts.load(kit.FontJudul || 'Playfair Display'), Fonts.load(kit.FontIsi || 'DM Sans'), Fonts.load('JetBrains Mono')]);
    let logo = null;
    const id = kit.WatermarkID || kit.LogoID;
    if (id) {
      if (logoCache[id] === undefined) {
        logoCache[id] = null;
        try { const r = await API.read('aset.data', { driveId: id }); if (r.success) logoCache[id] = await Files.loadImg(r.data.dataUrl); } catch (e) { logoCache[id] = null; }
      }
      logo = logoCache[id];
    }
    return { logo };
  }
  function opsiDariKit(kit, extra) {
    kit = kit || {};
    return Object.assign({ kit, latar: kit.LatarGaya, studio: kit.WatermarkTeks, watermark: { aktif: true, posisi: kit.WatermarkPosisi || 'kanan-bawah', opasitas: kit.WatermarkOpasitas || 0.85, teks: kit.WatermarkTeks || 'plm. studio' },
      swipe: LANG === 'en' ? 'swipe' : 'geser', simpan: LANG === 'en' ? 'save ✦' : 'simpan ✦' }, extra || {});
  }
  function thumb(slide, o, w) {
    const c = document.createElement('canvas'), [W] = FORMATS[o.format || '4:5'] || FORMATS['4:5'];
    render(c, slide, Object.assign({}, o, { scale: (w || 270) / W }));
    return c;
  }
  /** Ubah data konten → daftar slide siap render */
  function slidesDariKonten(k) {
    let s = pj(k && k.Slides, []);
    if (!s.length) {
      const cap = String((k && (k.Caption || k.Copywriting)) || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
      s = [{ judul: (k && k.Judul) || 'Judul konten', isi: cap[1] || '' }];
      if (k && k.Jenis === 'Carousel') cap.slice(2, 6).forEach((c) => s.push({ judul: c.slice(0, 60), isi: '' }));
      if (k && k.CTA) s.push({ judul: LANG === 'en' ? 'Save this' : 'Simpan ini', isi: k.CTA });
    }
    return s.map((x) => ({ judul: x.judul || '', isi: x.isi || '', layout: x.layout || '', catatanVisual: x.catatanVisual || '' }));
  }
  function rasioDari(jenis, platform) {
    if (jenis === 'Video Pendek' || jenis === 'Story') return '9:16';
    if (platform === 'LinkedIn' || platform === 'X/Twitter' || platform === 'Threads') return '1:1';
    if (platform === 'YouTube') return '16:9';
    return '4:5';
  }
  return { FORMATS, LAYOUTS, render, thumb, siapkanKit, opsiDariKit, slidesDariKonten, rasioDari, palet, autoLayout, mix };
})();
