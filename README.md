# Mosaic Plan

Perencana pixel mosaic berbasis SvelteKit yang mengubah ukuran fisik dan gambar sumber menjadi grid material presisi. Seluruh proses berjalan di browser; proyek dan katalog disimpan lokal di IndexedDB tanpa akun atau backend.

## Fitur MVP

- Canvas fisik dalam cm dengan presisi 0,1 cm, disimpan sebagai integer mm.
- Validasi pembagian tanpa gap dan rekomendasi ukuran tile kompatibel.
- Editor canvas dengan zoom, pan, ruler, grid overlay, pencil, drag paint, bucket fill, eyedropper, eraser, dan kontrol keyboard.
- Impor PNG/JPEG/WebP, mode cover atau contain, crop position, transparansi ke warna latar, konversi OKLab di Web Worker, serta palette katalog/pinned.
- Katalog lokal dengan delapan warna awal, CRUD, dan impor/ekspor CSV.
- Autosave IndexedDB, undo/redo berbasis patch, dan file proyek `.pixelgrid.json` berkompresi RLE.
- Ekspor PDF A4 blueprint, PNG bersih, PNG grid, CSV material, dan CSV matriks.

Contoh utama `120 × 240 cm` dengan tile `5 cm` menghasilkan `24 × 48 = 1.152` sel.

## Menjalankan lokal

Gunakan Node.js 22.12 atau lebih baru.

```sh
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite. Untuk verifikasi lengkap:

```sh
npm test
npm run check
npm run build
npm run preview
```

Hasil static build berada di `build/` dan memakai fallback `200.html`.

## Format katalog CSV

Header wajib: `name` dan `hex`. `code` serta `active` opsional.

```csv
name,code,hex,active
Warm White,MP-01,#F1EFE6,true
Cyan Blue,MP-08,#45A8B5,true
```

Kode produk harus unik tanpa membedakan huruf besar/kecil. Nilai teks yang tampak seperti formula spreadsheet dinetralkan saat ekspor.

## Kontrak dan batas

- Maksimum 250.000 sel, 2.000 sel per sisi, dan palette proyek 1–32 warna.
- Gambar maksimum 20 MB / 25 megapixel; format PNG, JPEG, atau WebP.
- File proyek memakai `schemaVersion: 1`; warna katalog disimpan sebagai snapshot proyek dan cells disimpan row-major dalam RLE.
- PDF adalah panduan pemasangan, bukan cetakan skala 1:1; halaman detail memuat maksimal 24 × 24 sel.
- PNG dibatasi berdasarkan sisi dan total area bitmap untuk menjaga penggunaan memori browser.

## Privasi

Tidak ada sinkronisasi cloud. Gambar sumber, katalog, dan proyek berada di penyimpanan browser pada perangkat yang digunakan. Ekspor file proyek bila membutuhkan backup atau pemindahan perangkat.
