# MIVUBI Mosaic Plan

Perencana pixel mosaic MIVUBI berbasis SvelteKit yang mengubah ukuran fisik dan gambar sumber menjadi grid material presisi. Konversi dan ekspor berjalan di browser, sedangkan proyek cloud disimpan tanpa akun melalui Vercel, Neon PostgreSQL, Cloudflare R2, dan Durable Objects.

Identitas visual menggunakan logo resmi MIVUBI dan palet brand `#21302F`, `#005A2A`, `#FEFAEC`, `#FAF1CB`, `#F0CE61`, `#EBB734`, dan `#E4991C`.

## Fitur MVP

- Canvas fisik dalam cm dengan presisi 0,1 cm, disimpan sebagai integer mm.
- Validasi pembagian tanpa gap dan rekomendasi ukuran tile kompatibel.
- Editor canvas dengan zoom, pan, ruler, grid overlay, pencil, drag paint, bucket fill, eyedropper, eraser, selection, dan kontrol keyboard.
- Canvas dimulai kosong; palet dapat ditambah lewat HEX atau dibuat sebagai suggestion langsung dari gambar.
- Impor PNG/JPEG/WebP, visual crop drag/zoom, mode fit utuh, serta rekonstruksi Contour atau Photo di Web Worker.
- Sel kosong tanpa tile, palet lokal 0–32 warna, edit HEX realtime, dan recreate canvas dari source image.
- Autosave Neon dengan revision guard, draft IndexedDB, undo/redo berbasis patch, dan file proyek `.pixelgrid.json` berkompresi RLE.
- Identitas perangkat anonim, tautan proyek publik, satu editor aktif, presence WebSocket, permintaan edit, dan handoff editor.
- Gambar sumber private di R2 melalui presigned URL; SVG/PNG/PDF/CSV tetap dihasilkan lokal.
- Ekspor PDF A4 blueprint, PNG bersih, PNG grid, CSV material, dan CSV matriks.

Contoh utama `240 × 120 cm` dengan tile `5 cm` menghasilkan `48 × 24 = 1.152` sel.

## Repository development policy

Repository ini menyertakan governance development yang portable:

- [`AGENTS.md`](AGENTS.md) — task/agent routing dan proof boundary.
- [`GITHUB_RULES.md`](GITHUB_RULES.md) — disiplin GitHub, commit, transfer, retry, dan STOP.
- [`CONTEXT.md`](CONTEXT.md) — orientasi produk/arsitektur stabil.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — workflow developer.
- [`SECURITY.md`](SECURITY.md) — secrets, data, dan cloud boundary.
- [`docs/foundation/`](docs/foundation/) — kontrak produk/arsitektur durable.
- [`docs/knowledge/`](docs/knowledge/) — ownership, implementation map, validation, continuity.

**Branch architecture dan GitHub Rulesets sengaja tidak ditentukan oleh paket ini.** Gunakan branch/ref dan protection policy dari repository tujuan. Jangan mengimpor asumsi `develop`, `Local`, atau `main` dari repo lain secara otomatis.

Verifikasi repository:

```sh
npm run verify:repository
```

Verifikasi aplikasi deterministic:

```sh
npm run verify:application
```

`verify:application` menjalankan test, Svelte check, realtime TypeScript check, dan production build. Browser/cloud runtime tetap membutuhkan proof yang sesuai.

## Menjalankan lokal

Gunakan Node.js 22.12 atau lebih baru.

Salin template konfigurasi:

```sh
cp .env.example .env.local
```

Isi Neon/R2/realtime values yang diperlukan untuk environment lokal. Jangan commit `.env.local`.

Install dan siapkan database yang memang ditujukan untuk development:

```sh
npm install
npm run db:migrate
```

Jalankan realtime Worker dan aplikasi pada terminal terpisah:

```sh
npm run realtime:dev
npm run dev
```

Buka alamat yang ditampilkan Vite.

Untuk verifikasi deterministic:

```sh
npm run verify
```

Untuk smoke integration cloud:

```sh
npm run smoke:cloud
```

`smoke:cloud` membutuhkan kedua server aktif dan cloud environment yang memang diizinkan untuk temporary test state. Test membuat proyek/device/objek R2 temporer lalu mencoba membersihkannya.

Build memakai `@sveltejs/adapter-vercel`.

## Arsitektur cloud

- Vercel menjalankan frontend SvelteKit dan seluruh `/api/*`.
- Neon menyimpan device anonim, peserta, dokumen proyek, cells `BYTEA`, revision, lock editor, dan soft-delete tujuh hari.
- R2 bucket private menyimpan satu gambar sumber aktif per proyek. Browser melakukan upload langsung memakai presigned `PUT`.
- Worker/Durable Object di `realtime/` menangani presence dan live patch melalui WebSocket Hibernation; viewer idle tidak perlu polling Neon atau R2.
- ID dan secret perangkat tersimpan di `localStorage`. ID dapat dipakai untuk administrasi/support; secret adalah credential dan tidak boleh dibagikan.

API publik berada di `src/routes/api`. Migration berada di `db/migrations/`.

## Deployment / operasi

Production yang tercatat pada source saat ini:

- Aplikasi: `https://mivubi-pixel-mosaic.vercel.app`
- Realtime Worker: `https://mivubi-mosaic-realtime.mivubiteam.workers.dev`

Operasi berikut **bukan** bagian otomatis dari development verification:

```sh
npm run db:migrate
npm run db:reassign-owner -- <project-id> <device-id-baru>
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

Gunakan hanya pada environment yang memang dituju dan dengan authorization yang sesuai. Detail ada di [`docs/foundation/04-deployment-operations.md`](docs/foundation/04-deployment-operations.md).

## Kontrak dan batas

- Maksimum 250.000 sel, 2.000 sel per sisi, dan palette proyek 0–32 warna.
- Gambar maksimum 20 MB / 25 megapixel; format PNG, JPEG, atau WebP.
- File proyek memakai `schemaVersion: 3`; proyek schema v1/v2 dimigrasikan otomatis dan cells disimpan row-major dalam RLE.
- PDF adalah panduan pemasangan, bukan cetakan skala 1:1; halaman detail memuat maksimal 24 × 24 sel.
- PNG dibatasi berdasarkan sisi dan total area bitmap untuk menjaga penggunaan memori browser.

Kontrak durable image/grid berada di [`docs/foundation/02-image-grid-contract.md`](docs/foundation/02-image-grid-contract.md).

## Privasi dan pemulihan

Proyek dapat dilihat oleh siapa pun yang mengetahui URL UUID-nya sesuai model public-link saat ini. Hanya perangkat editor aktif yang boleh menyimpan. Tidak ada email, akun, atau recovery link; jika localStorage pemilik hilang, admin dapat memindahkan owner ke device ID baru melalui operasi administratif yang terkontrol.

Source image tetap private di R2. Secrets, production data, dan deployment credentials mengikuti [`SECURITY.md`](SECURITY.md).
