# Product Boundaries

Status: current durable contract

## Purpose

MIVUBI Mosaic Plan helps turn a physical mosaic size and optional source image into an exact, editable tile grid and installation/export plan.

The unit of authored output is a **grid cell/tile**, not an arbitrary-resolution raster pixel.

## Core outcomes

A valid project can:

- define physical width, height, and tile/cell size;
- produce an exact compatible rows × columns grid;
- start blank or reconstruct from an imported image;
- maintain a bounded project palette and explicit empty cells;
- be edited interactively;
- be serialized/imported;
- produce material/grid/blueprint exports;
- be stored and collaboratively viewed/edited through the current anonymous cloud model.

## Non-goals unless explicitly changed

The product is not automatically:

- a full Photoshop/general raster editor;
- a print-at-1:1-scale tiling system;
- an email/password account platform;
- a public asset CDN;
- a multi-writer conflict-free collaborative editor;
- an automatic deployment/migration agent;
- a license/rights management system.

Changing one of these boundaries is product/architecture work, not a local implementation convenience.

## Current limits

Durable current limits include:

- maximum project grid: 250,000 cells;
- maximum 2,000 cells on either side;
- project palette: 0–32 colors;
- source image: PNG/JPEG/WebP;
- source image size: maximum 20 MB;
- source image resolution: maximum 25 megapixels;
- PDF detail pages are blueprint/install guides, not physical 1:1 print sheets.

If source changes these limits intentionally, update this owner and matching tests/docs in the same logical delivery.

## Authority

```text
current explicit user decision
→ this Foundation contract
→ current source/tests
→ design/reference artifacts
→ history/chat as supporting evidence only
```

Reference images and generated UI concepts do not silently redefine product behavior.
