# Image and Grid Contract

Status: current durable product/data contract

## Physical Grid

Physical sizes are represented in millimeters in project state.

A valid Grid requires the physical width/height and cell size to produce exact compatible row/column counts according to the current Grid validator.

Do not silently round an incompatible physical design into a different Grid.

## Cells

Project cells are row-major `Uint16Array` values.

- a dedicated empty-cell sentinel represents an unassigned/empty cell;
- palette slot indices represent project colors;
- a cell may not refer to an unavailable palette slot;
- reconstruction/import must preserve internal row/column/cell-count consistency;
- ordinary project editing does not structurally resize an existing file's Canvas/Grid.

In ordinary Indonesian UI, an individual Grid cell is `sel`. Do not reintroduce `tile` as the general user-facing term.

## Palette

- project palette is bounded to 0–32 colors;
- palette slot order is part of cell interpretation;
- reordering/removing colors must remap cells intentionally;
- color names/lock state are project metadata;
- color matching uses the current color implementation;
- global palettes are reusable palette definitions, not implicit project mutation.

## Image import

Supported source formats:

```text
PNG
JPEG
WebP
```

Current limits:

```text
maximum file size: 20 MB
maximum source resolution: 25 megapixels
```

Placement modes:

```text
crop
fit
```

Render modes:

```text
contour
photo
```

Current analysis uses an oversampled cell raster and OKLab-based color distance. Contour and Photo modes intentionally use different cell-sampling behavior.

Changing sampling scale, alpha thresholds, palette-generation behavior, or color-distance semantics can materially change generated Pixel Art and requires focused regression evidence.

## Normal image → Pixel Art behavior

The ordinary UI intentionally exposes a simple flow:

```text
Gaya Pixel Art
Jumlah warna
→ Perbarui Pixel Art dari Gambar
```

The user is not required to manually run separate `Buat Saran Warna` / `Gunakan Saran Warna` steps before normal reconstruction.

Current project-level conversion may automatically generate/apply an image-derived palette when cell generation requires it, for example when:

- the project palette is empty; or
- the requested color count no longer matches the available suggestion state.

If an existing manually managed palette remains valid for the requested conversion path, the implementation may preserve that palette rather than replacing it automatically.

`Saran Warna` remains an advanced Library Palet capability. It is not removed from the data model merely because the ordinary panel no longer exposes it as a mandatory workflow step.

Primary owner:

```text
src/lib/image-project.ts
```

## Project schema

Current serialized project schema version is 3.

Supported earlier schemas are migrated into the current in-memory model by canonical project parsing code.

Serialized cells use RLE. Import/deserialization must validate dimensions, palette references, source-image metadata, and cell count before accepting a project.

Do not patch generated/serialized output to hide a canonical project-model defect.

## Canvas snapshot invariant

A newly created project snapshots the active Website Canvas configuration into:

```text
widthMm
heightMm
cellMm
columns
rows
```

Existing project saves must preserve those structural values.

Website Admin may change the global Canvas configuration for future work, but that does not rewrite existing project data.

## Exports

Exports are projections of canonical project state.

Current product surfaces include:

- project JSON / File Kerja;
- clean/transparent PNG;
- Grid PNG;
- material CSV;
- matrix CSV;
- PDF Blueprint.

Material counts, dimensions, palette mapping, and matrix positions must derive from the same canonical project state.

PDF detail pages are an installation blueprint and are not guaranteed 1:1 physical print scale.

## Proof

Core deterministic owners have targeted tests across Grid, color, image analysis, crop, palette, RLE, project serialization/migration, CSV, PDF, history, storage, and cloud codecs.

The newer Website Admin/Canvas-snapshot and automatic project-level image-palette behavior still require the latest handoff's intended local regression/static proof before claiming completion beyond source/static review.

When changing one of these contracts:

```text
targeted unit tests during iteration
→ npm test for deterministic regression
→ npm run check when Svelte/SvelteKit typing is affected
→ browser proof when user interaction/rendering is part of the claim
```
