# Image and Grid Contract

Status: current durable product/data contract

## Physical grid

Physical sizes are represented in millimeters in project state.

A valid grid requires the physical width/height and cell size to produce exact compatible row/column counts according to the current grid validator.

Do not silently round an incompatible physical design into a different material plan.

## Cells

Project cells are row-major `Uint16Array` values.

- A dedicated empty-cell sentinel represents no tile.
- Palette slot indices represent project colors.
- A cell may not refer to an unavailable palette slot.
- Resizing/reconstruction/import must preserve internal row/column/cell-count consistency.

## Palette

- Project palette is bounded to 0–32 colors.
- Palette slot order is part of cell interpretation.
- Reordering/removing colors must remap cells intentionally.
- Color names/lock state are project metadata; color matching uses the current color implementation.
- Global palettes are reusable browser-side palette definitions, not implicit project mutation.

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

Current analysis uses an oversampled cell raster and OKLab-based color distance. Contour and photo modes intentionally use different cell-sampling behavior. Changing sampling scale, alpha thresholds, palette suggestion behavior, or color-distance semantics can materially change generated mosaics and requires focused regression evidence.

## Project schema

Current serialized project schema version is 3.

Supported earlier schemas are migrated into the current in-memory model by canonical project parsing code.

Serialized cells use RLE. Import/deserialization must validate dimensions, palette references, source image metadata, and cell count before accepting a project.

Do not patch generated/serialized output to hide a canonical project-model defect.

## Exports

Exports are projections of canonical project state.

Current product surfaces include:

- project JSON;
- clean PNG;
- grid PNG;
- material CSV;
- matrix CSV;
- PDF blueprint.

Material counts, dimensions, palette mapping, and matrix positions must derive from the same canonical project state.

PDF detail pages are an installation blueprint and are not guaranteed 1:1 physical print scale.

## Proof

Core deterministic owners already have targeted tests across grid, color, image analysis, crop, palette, RLE, project serialization/migration, CSV, PDF, history, storage, and cloud codecs.

When changing one of these contracts:

```text
targeted unit tests during iteration
→ npm test for final deterministic regression
→ browser proof only when user interaction/rendering is part of the claim
```
