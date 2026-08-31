# MIVUBI Mosaic Plan

Perencana pixel mosaic MIVUBI berbasis SvelteKit yang mengubah ukuran fisik dan gambar sumber menjadi grid material presisi. Konversi dan ekspor berjalan di browser, sedangkan proyek cloud disimpan tanpa akun melalui Vercel, Neon PostgreSQL, Cloudflare R2, dan Durable Objects.

Identitas visual menggunakan logo resmi MIVUBI dan palet brand `#21302F`, `#005A2A`, `#FEFAEC`, `#FAF1CB`, `#F0CE61`, `#EBB734`, dan `#E4991C`.

## Fitur MVP

- Canvas fisik dalam cm dengan presisi 0,1 cm, disimpan sebagai integer mm.
- Validasi pembagian tanpa gap dan rekomendasi ukuran tile kompatibel.
- Editor canvas dengan zoom, pan, ruler, grid overlay, pencil, drag paint, bucket fill, eyedropper, eraser, dan kontrol keyboard.
- Canvas dimulai kosong; palet dapat ditambah lewat HEX atau dibuat sebagai suggestion langsung dari gambar.
- Impor PNG/JPEG/WebP, visual crop drag/zoom, mode fit utuh, serta rekonstruksi Contour atau Photo di Web Worker.
- Sel kosong tanpa tile, palet lokal 0–32 warna, edit HEX realtime, dan recreate canvas dari source image.
- Autosave Neon dengan revision guard, draft IndexedDB, undo/redo berbasis patch, dan file proyek `.pixelgrid.json` berkompresi RLE.
- Identitas perangkat anonim, tautan proyek publik, satu editor aktif, presence WebSocket, permintaan edit, dan handoff editor.
- Gambar sumber private di R2 melalui presigned URL; SVG/PNG/PDF/CSV tetap dihasilkan lokal.
- Ekspor PDF A4 blueprint, PNG bersih, PNG grid, CSV material, dan CSV matriks.

Contoh utama `240 × 120 cm` dengan tile `5 cm` menghasilkan `48 × 24 = 1.152` sel.

## Menjalankan lokal

Gunakan Node.js 22.12 atau lebih baru.

```sh
npm install
npm run db:migrate
npm run realtime:dev
npm run dev
```

Salin `.env.example` menjadi `.env.local`, isi Neon/R2 dan secret internal, lalu jalankan realtime dan aplikasi pada terminal terpisah. Buka alamat yang ditampilkan Vite. Untuk verifikasi lengkap:

```sh
npm test
npm run check
npm run build
npm run smoke:cloud
```

`smoke:cloud` membutuhkan kedua server lokal aktif; test membuat proyek dan objek R2 temporer lalu membersihkannya. Build memakai `@sveltejs/adapter-vercel`.

## Arsitektur cloud

- Vercel menjalankan frontend SvelteKit dan seluruh `/api/*`.
- Neon menyimpan device anonim, peserta, dokumen proyek, cells `BYTEA`, revision, lock editor, dan soft-delete tujuh hari.
- R2 bucket private menyimpan satu gambar sumber aktif per proyek. Browser melakukan upload langsung memakai presigned `PUT` lima menit.
- Worker/Durable Object di `realtime/` menangani presence dan live patch melalui WebSocket Hibernation; viewer idle tidak melakukan polling Neon atau R2.
- ID dan secret perangkat tersimpan di `localStorage`. ID boleh dibagikan kepada admin; secret tidak boleh dibagikan.

API publik berada di `src/routes/api`. Migration idempotent berada di `db/migrations/001_cloud_projects.sql`.

## Deployment

Production aktif:

- Aplikasi: `https://mivubi-pixel-mosaic.vercel.app`
- Realtime Worker: `https://mivubi-mosaic-realtime.mivubiteam.workers.dev`

1. Jalankan migration Neon dengan `npm run db:migrate`.
2. Isi environment Vercel dari `.env.example`; jangan menaruh secret dalam variable `PUBLIC_*`.
3. Buat secret Worker dengan `wrangler secret put REALTIME_TOKEN_SECRET` dan `wrangler secret put REALTIME_INTERNAL_SECRET`, lalu samakan nilainya dengan Vercel.
4. Tambahkan origin produksi ke `ALLOWED_ORIGINS` pada `realtime/wrangler.jsonc`, kemudian jalankan `npm run realtime:deploy`.
5. Atur `REALTIME_HTTP_URL` Vercel ke URL Worker `https://…workers.dev`.
6. Tambahkan origin produksi ke `R2_ALLOWED_ORIGINS`, lalu jalankan `npm run r2:configure-cors` dengan credential yang memiliki izin konfigurasi bucket.
7. Deploy aplikasi ke Vercel. Cron harian `/api/maintenance/purge` menggunakan `CRON_SECRET` untuk menghapus proyek yang melewati masa soft-delete.

Credential R2 object-only dapat mengunggah file tetapi tidak dapat mengubah CORS atau men-deploy Worker. Gunakan token deployment terpisah dengan izin minimum yang sesuai. Pemindahan owner secara manual dilakukan dengan:

```sh
npm run db:reassign-owner -- <project-id> <device-id-baru>
```

## Kontrak dan batas

- Maksimum 250.000 sel, 2.000 sel per sisi, dan palette proyek 0–32 warna.
- Gambar maksimum 20 MB / 25 megapixel; format PNG, JPEG, atau WebP.
- File proyek memakai `schemaVersion: 3`; proyek schema v1/v2 dimigrasikan otomatis dan cells disimpan row-major dalam RLE.
- PDF adalah panduan pemasangan, bukan cetakan skala 1:1; halaman detail memuat maksimal 24 × 24 sel.
- PNG dibatasi berdasarkan sisi dan total area bitmap untuk menjaga penggunaan memori browser.

## Privasi dan pemulihan

Proyek dapat dilihat oleh siapa pun yang mengetahui URL UUID-nya. Hanya perangkat editor aktif yang boleh menyimpan. Tidak ada email, akun, atau recovery link; jika localStorage pemilik hilang, admin harus memindahkan owner ke device ID baru. Proyek lokal versi lama tidak diunggah atau dihapus dan tidak ditampilkan pada dashboard cloud.
