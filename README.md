# Laporan Bulanan: Presentasi Vite + Vue

Situs presentasi interaktif untuk laporan bulanan berbasis Vite + Vue 3 dengan animasi GSAP dan visualisasi Chart.js. Data diambil langsung dari Google Sheets.

Demo lokal: jalankan dev server dan navigasi antara Overview, Trends, Categories.

## Fitur
- Integrasi Google Sheets (CSV terlebih dahulu dengan fallback GViz/JSON).
- Halaman: Overview, Trends (Moving Average & MoM), Categories (Pie + Bar + Tabel).
- Komponen reusable: MetricCard dan ChartCard.
- Animasi halus dengan GSAP untuk transisi dan reveal elemen.
- Desain modern, responsif, dan siap presentasi.

## Struktur
- src/services/sheets.js: layanan data untuk fetch dan normalisasi [fetchSheetData()](src/services/sheets.js:1)
- src/router/index.js: router halaman
- src/views/Overview.vue: ringkasan dan grafik utama
- src/views/Trends.vue: tren bulanan, MA, dan pertumbuhan MoM
- src/views/Categories.vue: distribusi kategori dan tabel
- src/components/MetricCard.vue: kartu metrik ringkas
- src/components/ChartCard.vue: wrapper chart terstylisasi
- src/App.vue: shell aplikasi dan transisi halaman

## Persiapan
Pastikan Node.js (v18+) terpasang.

Install dependencies:

npm install

Jalankan pengembangan:

npm run dev

Akses di http://localhost:5173

## Konfigurasi Google Sheets
Spreadsheet default:
https://docs.google.com/spreadsheets/d/1ILpXCrKUqAqquoR_kJei8stZ8d8yGUJxwu5kC3ZQaHI/edit?gid=1632724274#gid=1632724274

Layanan data berada di src/services/sheets.js. Untuk mengganti sumber:
- Edit konstanta SHEET_ID dan SHEET_GID
- Atau panggil fetchSheetData({ sheetId, gid }) dari view
- Atau gunakan parseSheetsUrl(url) untuk mengekstrak sheetId/gid dari URL

Kolom yang diharapkan (heuristik):
- Tanggal/Date/Tgl (format umum dd/mm/yyyy atau yyyy-mm-dd)
- Kategori/Category/Ktg
- Jumlah/Amount/Total/Nilai

Tips: Jika PapaParse menampilkan “Duplicate headers found and renamed”, pastikan setiap header kolom unik.
Pastikan Spreadsheet di-share “Anyone with the link” untuk dapat diakses pembaca CSV/JSON.

## Navigasi
- Overview: ringkasan metrik dan dua grafik (trend bulanan, distribusi kategori)
- Trends: total per bulan + Moving Average (kontrol smoothing); bar pertumbuhan MoM
- Categories: pie persentase top N + bar total; tabel rincian

## Desain & Animasi
- Desain global di src/style.css dengan token warna di src/App.vue
- Transisi halaman menggunakan RouterView slot + transition "fade"
- Reveal elemen menggunakan GSAP; timing diperbaiki dengan nextTick

## Build untuk presentasi

npm run build

Preview hasil build:

npm run preview

## Troubleshooting
- Data tidak muncul: cek share spreadsheet, cek kolom dan format tanggal/angka.
- CORS error: akses melalui CSV export (prefer: 'csv'), atau pastikan izin akses publik.
- Animasi tidak jalan: pastikan elemen ada (kami sudah await nextTick).

## Lisensi
MIT
