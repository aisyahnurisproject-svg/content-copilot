# Digital Content Copilot · v1.0.0

AI Social Media Manager & Content Studio untuk kreator solo dan pemilik produk digital — strategi, konten, copywriting, desain, kalender, approval, dan analitik dalam satu alur kerja.

- **Frontend**: HTML/CSS/JavaScript murni (tanpa framework, tanpa build step) — di-hosting di GitHub Pages.
- **Backend**: Google Apps Script sebagai REST API JSON (`doGet`/`doPost`), database Google Sheets, aset di Google Drive.
- **AI**: Mode Template gratis tanpa API (bawaan) atau Gemini / OpenAI / Claude dengan API key sendiri.
- **Notifikasi**: WhatsApp (Fonnte) + Email (Gmail) lewat antrean, blast per batch 10/20/50, CRM kontak.

📘 Langkah pemasangan lengkap: **[PANDUAN-INSTALASI.md](PANDUAN-INSTALASI.md)**

## Struktur folder (root repository)

```
index.html            aplikasi (SPA, router hash #/modul)
lead.html             form lead magnet publik (tanpa login)
css/style.css         design system Pastel Editorial (Playfair Display · DM Sans · JetBrains Mono)
js/config.js          ← satu-satunya konfigurasi: URL /exec Apps Script (bukan rahasia)
js/core.js            utilitas, API client (cache SWR, dedupe, batch, antrean drain), UI kit, chart SVG
js/app.js             shell, login, navigasi, state boot
js/ui/engine.js       mesin kanvas Graphic Studio (Branding Kit, watermark, layout slide)
js/pages/*.js         19 modul halaman — dimuat saat dibuka, diprefetch saat browser menganggur
```

## Modul

| # | Modul | # | Modul |
|---|---|---|---|
| 01 | Dashboard | 11 | Tugas Harian (Anti-Mager) |
| 02 | Onboarding & Profil (Brand DNA, multi Branding Kit, produk) | 12 | Bilingual & Lokal (ID ⇄ EN) |
| 03 | AI Strategy (rencana bulanan, pilar, KPI) | 13 | Asset Library (musik, SFX, font, visual) |
| 04 | Content Generator (carousel, video, story, artikel, batch 7 hari) | 14 | Learning Center (playbook + kuis) |
| 05 | Copy Studio (hook matrix, caption, framework) | 15 | AI Orchestration (provider, model, kuota, prompt berversi) |
| 06 | Graphic Studio (kanvas, ekspor PNG/PDF/ZIP ke Drive) | 16 | Settings & Workspace (keamanan, infrastruktur, backup, migrasi) |
| 07 | Repurposing (1 ide → 5 platform) | R1 | Laporan Performa (Excel/PDF) |
| 08 | Kalender & Planner (drag & drop, Google Calendar) | R2 | CRM Kontak (Nama · Email · WhatsApp) |
| 09 | Preview & Approval (mockup ponsel, quality gate) | R3 | WA & Notifikasi (blast, antrean, matriks) |

## Keamanan singkat

- Tidak ada API key, token, atau sandi di repository ini. Semua rahasia ada di **Script Properties** proyek Apps Script.
- Token sesi bertanda tangan HMAC dikirim di body POST; sandi pemilik disimpan sebagai hash + salt.
- `js/config.js` hanya berisi URL `/exec` — URL ini memang publik; akses data dijaga token di server.

## Update

```bash
git add .
git commit -m "Update"
git push
```

Lalu tekan Ctrl+Shift+R di browser. Detail update backend ada di panduan, Bagian 9.
