# Editor UI Decision Log

Status: approved planning decisions for the MIVUBI Editor UI. This document records decisions only and does **not** authorize unrelated redesign or implementation changes.

Source baseline: original Editor UI from upstream pinned source. Preserve the original visual identity, icons, glyphs, layout character, states, and behavior unless a decision below explicitly changes a specific item.

## Core rule

Functional UI copy must be direct and immediately understandable. Avoid wording that makes the user guess what an action, status, or option means.

Canvas physical size and Grid size are **fixed information for the ordinary user flow**. They may be displayed as reference, but **the user must not be given a control to change Canvas size**.

---

## Approved Editor decisions

### 41 — Editor brand

Keep:

```text
MIVUBI
EDITOR
```

### 42 — Back button

Use:

```text
Kembali ke File Tersimpan
```

Keep the exact original `←` icon and behavior.

### 43 — Artwork name

Use:

```text
Nama Karya
```

The name remains editable from the Editor header.

### 44 — Header size information

Use the pattern:

```text
240 × 120 cm · Grid 48 × 24
```

Values remain dynamic per file. Do not use `sel` as the visible Grid unit here.

### 45 — Collaboration removed

Remove the collaborative co-editing feature from the final user UI.

Do not show or use ordinary collaboration UI such as:

- connected-user counts such as `2 aktif`;
- `Kamu editor`;
- `Editor: User-02`;
- `Minta edit`;
- collaboration participant lists;
- `Pemilik`, `Editor`, or `Viewer` collaboration-role previews;
- collaboration `Salin link`;
- collaboration revision information;
- edit-control handoff between users.

`User-01`, `User-02`, etc. and Device ID are separate device/user identification concepts and are not removed by this decision.

### 46 — Panel button

Keep:

```text
▦ Panel⌄
```

Keep the exact original icon/glyph and control treatment.

### 47 — Save status

Use only:

```text
Menyimpan…
Tersimpan
Gagal disimpan
```

Do not distinguish `cloud` versus `lokal` in the visible header save status.

### 48 — Help button

Keep the original:

```text
?
```

Tooltip/help name:

```text
Keyboard Shortcuts
```

### 49–54 — Export format labels

Use:

```text
PDF Blueprint
PNG Transparan
PNG + Grid
CSV Material
CSV Matriks
File Kerja
```

Do not expose the internal `.pixelgrid.json` extension in the ordinary export label.

### 55 — Export button

Keep:

```text
Ekspor ↓
```

### 56 — Export processing status

Use:

```text
Menyiapkan file…
```

### 57 — Left-panel title

Keep:

```text
Referensi gambar
```

### 58–60 — Left-panel tabs

Use:

```text
Gambar
Hasil Pixel Art
Properti
```

`Hasil Pixel Art` replaces `Rekonstruksi` as the user-facing term.

### 61 — Empty source-image instruction

Use:

```text
Klik untuk memilih gambar
```

### 62 — Source-image select action

Use:

```text
Pilih Gambar
```

### 63 — Source-image replace action

Use:

```text
Ganti Gambar
```

### 64 — Source-image processing

Use:

```text
Memproses gambar…
```

### 65–66 — Image placement modes

Keep:

```text
Isi bingkai
Tampilkan utuh
```

### 67 — Pending-change status

Use:

```text
Perubahan belum diterapkan
```

### 68 — Pending-change explanation

Use:

```text
Pixel Art masih menggunakan hasil sebelumnya.
```

### 69 — Apply changed settings

Use:

```text
Terapkan Perubahan
```

### 70 — Result summary title

Use:

```text
Hasil Pixel Art
```

### 71 — Style label

Keep:

```text
Gaya:
```

### 72 — Color-count summary

Keep the pattern:

```text
Jumlah warna: 8
```

Use the actual current color count.

### 73 — Open result settings

Use:

```text
Buka Hasil Pixel Art
```

### 74 — Result-settings title

Use:

```text
Hasil Pixel Art
```

### 75 — Style setting label

Use:

```text
Gaya Pixel Art
```

### 76 — Color-count setting

Keep:

```text
Jumlah warna
```

### 77 — Palette-change helper

Current approved direction:

```text
Perubahan palet hanya mengubah warna. Jika gambar, crop, ukuran, atau gaya diubah, proses ulang Pixel Art untuk memperbarui hasil.
```

Note: the UI language rule still requires direct wording. If this helper is revisited, avoid adding more technical terminology.

### 78–79 — Pixel Art style choices

Use:

```text
Contour · Warna Tanpa Gradasi
Photo · Gradasi Halus
```

### 80 — Result-outdated message

Use:

```text
Gambar atau pengaturannya telah berubah. Perbarui Pixel Art untuk melihat hasil terbaru.
```

### 81 — Color-suggestion action

Use:

```text
Memproses…
Buat Saran Warna
```

### 82 — Apply color suggestion

Use:

```text
Gunakan Saran Warna
```

### 83 — Refresh artwork from image

Use:

```text
Perbarui Pixel Art dari Gambar
```

This replaces technical wording such as `Raster ulang` or unclear wording such as `Proses Ulang Pixel Art`.

### 84 — Properties title

Use:

```text
Properti Canvas
```

### 85 — Physical-size label

Use:

```text
Ukuran Fisik
```

This is informational only.

### 86 — Grid-size label

Use:

```text
Ukuran Grid
```

This is informational only.

### 87 — Tile information

Remove the visible ordinary-user property:

```text
Tile · 5 cm
```

Tile is not a general-user information concept.

### 88 — Total-cell information

Remove the visible ordinary-user property:

```text
Total · 1.152
```

The value is redundant with the Grid dimensions.

### 89 — Colored-pixel count

Use:

```text
Pixel Berwarna · {count}
```

### 90 — Empty-pixel count

Use:

```text
Pixel Kosong · {count}
```

### 91 — Canvas size is not editable

**The user must not be able to change Canvas size.**

Therefore:

- remove the ordinary-user `Atur ukuran canvas` / `Ubah Ukuran Canvas` action;
- do not expose editable width, height, or cell-size controls for Canvas sizing;
- do not expose an Apply/Submit action that changes Canvas dimensions;
- `Ukuran Fisik` and `Ukuran Grid` remain visible as information only;
- internal dimension data may continue to exist for rendering, storage, export, or compatibility.

This decision overrides any older proposal that allowed the ordinary user to resize the Canvas.

### 92 — Selection count

Keep `sel` as the Grid-unit term in selection context. Use the pattern:

```text
12 sel dipilih
```

The number remains dynamic.

### 93 — Fill selected cells

Use:

```text
Isi Warna
```

### 94 — Clear selection

Use:

```text
Kosongkan Pilihan
```

### 95 — Cancel selection

Use:

```text
Batalkan Pilihan
```

### 96 — Pipet instruction

Use:

```text
Klik sel untuk memilih warnanya
```

### 97 — Pan instruction

Use:

```text
Drag Canvas untuk menggeser tampilan
```

### 98 — Select instruction

Keep:

```text
Drag untuk memilih sel
```

### 99 — Active-color status

Keep:

```text
Warna aktif
```

### 100–101 — History controls

Keep:

```text
Undo
Redo
```

### 102–106 — Drawing tool labels

Use the exact original icons with these labels:

```text
⌖ Pipet
✎ Pencil
◩ Fill
◇ Eraser
⬚ Select
```

`Pipet` is the approved exception to the otherwise-English drawing-tool naming direction. Preserve all existing shortcuts and behavior.

### 107 — Pan tool

Use:

```text
✣ Pan
```

Preserve the exact original icon and temporary `Space` pan behavior.

### 108 — Grid visibility

Keep:

```text
Grid
```

### 109–110 — Zoom controls

Use:

```text
Zoom Out (-)
Zoom In (+)
```

Preserve the existing `-` and `+` shortcuts.

### 111 — Fit view

Use:

```text
Fit Canvas
```

Preserve the existing `0` shortcut.

### 112 — Cell coordinates

Keep the coordinate pattern:

```text
X 21 · Y 8
```

Coordinates remain dynamic.

### 113 — Quick-palette active color

Use:

```text
Warna Aktif
```

### 114 — Empty quick-palette action

Use:

```text
+ Tambah Warna
```

### 115 — Right-panel palette heading

Keep the pattern:

```text
Palet · 8 warna
```

Use the actual palette count.

### 116 — Palette tab

Keep:

```text
Palet
```

### 117 — Detail tab

Keep:

```text
Detail
```

### 118 — Empty-palette message

Use:

```text
Belum ada warna. Tambah warna atau gunakan Saran Warna.
```

Do not append `dari gambar`; the shorter wording is sufficient.

### 119 — New-color input label

Use:

```text
HEX Warna Baru
```

### 120 — Add-color action

Use:

```text
+ Tambah Warna
```

### 121 — Palette-library action

Use:

```text
Buka Library Palet
```

### 122 — Selected-color heading

Keep the pattern:

```text
WARNA {slot}
```

### 123 — Cell usage count

Replace Tile terminology with the Grid-unit term:

```text
{count} sel
```

### 124 — HEX label

Keep:

```text
HEX
```

### 125 — Optional color-name label

Use:

```text
Nama Warna (opsional)
```

### 126 — Empty color-name placeholder

Keep:

```text
Tanpa nama
```

### 127 — Color lock action

Keep the direct lock/unlock wording:

```text
Kunci warna
Buka kunci warna
```

### 128 — Native color picker

Use:

```text
Pilih Warna
```

### 129 — Color more-menu trigger

Keep the exact original trigger:

```text
•••
```

### 130 — Save palette action

Use:

```text
Simpan ke Library Palet
```

### 131 — Delete color action

Use:

```text
Hapus Warna
```

### 132–134 — Panel picker labels

Use:

```text
Referensi Gambar
Palet
Palet Cepat
```

These labels apply only inside the existing `Panel` picker. Preserve the existing panel structure and behavior.

### 135 — Crop positioning instruction

Use:

```text
Geser gambar untuk mengatur area crop
```

### 136 — Transparent-area information

Keep:

```text
Ruang transparan akan menjadi sel kosong
```

### 137 — Crop zoom label

Use:

```text
Zoom
```

### 138 — Crop reset action

Keep:

```text
Reset
```

### 139 — Crop zoom helper

Use:

```text
Turunkan Zoom di bawah 100% untuk mengecilkan gambar.
```

Do not append the previous explanation about adding empty space.

### 140 — Filled-cell hover information

Keep the original pattern:

```text
■ C{column} / R{row} #HEX
```

### 141 — Empty-cell hover information

Keep:

```text
C{column} / R{row}
SEL KOSONG
```

### 142 — Keyboard-focus indicator

Use:

```text
Fokus Keyboard
```

### 143 — Palette-library eyebrow

Use:

```text
LIBRARY PALET
```

### 144 — Palette-library choose title

Use:

```text
Pilih Palet
```

### 145 — Palette-library save title

Use:

```text
Simpan Palet
```

### 146 — Palette-library helper

Use:

```text
Mengganti palet akan menyesuaikan warna pada Grid tanpa mengubah susunan sel.
```

Do not expose raster/remap terminology here.

### 147 — Current-palette label

Use:

```text
Palet Saat Ini
```

### 148 — Current-palette status

Use:

```text
AKTIF · {count} warna
✓ Sedang Digunakan
```

### 149 — Suggested-palette label

Use:

```text
Saran Warna
```

### 150 — Suggested-palette status

Use:

```text
SARAN WARNA · {count} warna
```

### 151 — Suggested-palette action/status

Use:

```text
✓ Sama dengan Palet Saat Ini
Gunakan Palet
```

Show the appropriate state according to whether the suggested palette already matches the active palette.

### 152 — Create custom palette

Use:

```text
+ Buat Palet Sendiri
```

### 153 — Palette-name label

Use:

```text
Nama Palet
```

### 154 — Color-name field in palette form

Use:

```text
Nama Warna (opsional)
```

### 155 — Add color in palette form

Use:

```text
+ Tambah Warna
```

### 156 — Return from palette form

Keep:

```text
Kembali
```

### 157 — Save custom palette

Use:

```text
Simpan Palet
```

### 158 — Keyboard-shortcut modal title

Use:

```text
EDITOR
Keyboard Shortcuts
```

### 159 — Keyboard-shortcut helper

Use:

```text
Shortcut tidak aktif saat kamu sedang mengetik.
```

### 160 — Tool shortcuts

Use the existing shortcut keys with the approved tool terminology:

```text
P       Pencil
F       Fill
E       Eraser
I       Pipet
S       Select
Space   Tahan untuk Pan
```

### 161 — General project shortcuts

Keep the existing behavior and use consistent UI capitalization for:

```text
Ctrl/Cmd Z       Undo
Ctrl/Cmd ⇧ Z     Redo
Ctrl/Cmd S       Simpan Sekarang
Ctrl/Cmd E       Ekspor Format Terpilih
Esc              Tutup atau Batalkan
```

---

## Scope boundary

These are approved UI-planning decisions. Source implementation should only be changed when explicitly requested. Do not use this document as authorization for unrelated refactors, visual redesign, icon replacement, or removal of internal data that remains necessary for the application.
