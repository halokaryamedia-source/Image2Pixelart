# Improved architectural pixel-art set

Semua SVG di folder ini merupakan regenerasi manual dari tiga referensi di `docs/building/`. File generasi sebelumnya tetap disimpan di folder induk dan tidak ditimpa.

## Versi

- `v1-48x24-8-color/`: panel 240 × 120 cm, modul 5 × 5 cm, grid 48 × 24, tepat 8 warna.
- `v2-60x30-12-color/`: panel 240 × 120 cm, modul 4 × 4 cm, grid 60 × 30, tepat 12 warna.

Setiap versi memiliki tiga objek dan tiga colorway dengan geometri identik:

- `reference`: warna yang paling dekat dengan karakter sumber.
- `architecture`: warna arsitektur default MIVUBI beserta shade tambahannya pada V2.
- `contrast`: warna berkontras tinggi untuk membaca struktur dan lingkungan dari jarak jauh.

Sel transparan sengaja dipertahankan untuk membentuk ruang negatif di sekitar menara, di dalam kanopi, di antara batang dan cabang, di antara kapal, serta pada rangka bawah platform.

## PNG

Hasil raster tersedia di `png/` untuk seluruh 18 SVG:

- `native/`: ukuran grid asli 48 × 24 atau 60 × 30 piksel; satu piksel PNG sama dengan satu modul fisik.
- `preview-40x/`: pembesaran nearest-neighbor 40× menjadi 1920 × 960 atau 2400 × 1200 piksel.

Kedua keluaran memakai latar transparan dan mempertahankan tepat 8 atau 12 warna sumber tanpa interpolasi warna tambahan.
