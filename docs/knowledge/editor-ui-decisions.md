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

---

## Scope boundary

These are approved UI-planning decisions. Source implementation should only be changed when explicitly requested. Do not use this document as authorization for unrelated refactors, visual redesign, icon replacement, or removal of internal data that remains necessary for the application.
