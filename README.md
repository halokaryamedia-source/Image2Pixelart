# Mosaic Plan

Perencana pixel mosaic berbasis SvelteKit yang mengubah ukuran fisik dan gambar sumber menjadi grid material presisi. Seluruh proses berjalan di browser dan proyek disimpan lokal di IndexedDB tanpa akun atau backend.

## Fitur MVP

- Canvas fisik dalam cm dengan presisi 0,1 cm, disimpan sebagai integer mm.
- Validasi pembagian tanpa gap dan rekomendasi ukuran tile kompatibel.
- Editor canvas dengan zoom, pan, ruler, grid overlay, pencil, drag paint, bucket fill, eyedropper, eraser, dan kontrol keyboard.
- Canvas dimulai kosong; palet dapat ditambah lewat HEX atau dibuat sebagai suggestion langsung dari gambar.
- Impor PNG/JPEG/WebP, visual crop drag/zoom, mode fit utuh, serta rekonstruksi Contour atau Photo di Web Worker.
- Sel kosong tanpa tile, palet lokal 0–32 warna, edit HEX realtime, dan recreate canvas dari source image.
- Autosave IndexedDB, undo/redo berbasis patch, dan file proyek `.pixelgrid.json` berkompresi RLE.
- Ekspor PDF A4 blueprint, PNG bersih, PNG grid, CSV material, dan CSV matriks.

Contoh utama `240 × 120 cm` dengan tile `5 cm` menghasilkan `48 × 24 = 1.152` sel.

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

## Kontrak dan batas

- Maksimum 250.000 sel, 2.000 sel per sisi, dan palette proyek 0–32 warna.
- Gambar maksimum 20 MB / 25 megapixel; format PNG, JPEG, atau WebP.
- File proyek memakai `schemaVersion: 2`; proyek schema v1 dimigrasikan otomatis dan cells disimpan row-major dalam RLE.
- PDF adalah panduan pemasangan, bukan cetakan skala 1:1; halaman detail memuat maksimal 24 × 24 sel.
- PNG dibatasi berdasarkan sisi dan total area bitmap untuk menjaga penggunaan memori browser.

## Privasi

Tidak ada sinkronisasi cloud. Gambar sumber dan proyek berada di penyimpanan browser pada perangkat yang digunakan. Ekspor file proyek bila membutuhkan backup atau pemindahan perangkat.
