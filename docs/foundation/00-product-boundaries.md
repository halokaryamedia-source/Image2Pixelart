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

## Access model

The application uses **one UI language and one MIVUBI visual identity with two access levels**:

- **Akses Umum** is the simplified ordinary-user surface. Canvas physical size and Grid size may be shown as information, but ordinary users are not given controls to change the website Canvas configuration.
- **Admin Website** is an application-level authority for website configuration. It is **not** the project owner, `ownerDeviceId`, current active editor, or an ordinary device identity.
- Admin Website uses separate password authentication and a server-side Admin session. This does not introduce an email/password account system for ordinary users.
- Admin Website determines the active global Canvas configuration: physical width, physical height, and cell size. Grid dimensions and total cells are derived from those values.
- A newly created artwork snapshots the active Canvas configuration into its own project data at creation time.
- Later Admin changes apply to **new artworks only**. Existing artworks retain the Canvas configuration stored when they were created.
- Project ownership, active-editor authorization, revision guards, source-image storage, and other project/cloud permissions remain separate from Website Admin authority.
- Hiding an advanced setting from Akses Umum does not remove the underlying website-level capability required by Admin Website.
- The retired collaboration roster/request/handoff UI is not reintroduced by Website Admin access.

Current route exposure:

```text
/project/[id]
→ Akses Umum Editor

/admin/login
→ Admin Website login

/admin
→ Admin dashboard

/admin/settings
→ Pengaturan Website

/admin/settings/canvas
→ global Pengaturan Canvas for new artworks
```

## Non-goals unless explicitly changed

The product is not automatically:

- a full Photoshop/general raster editor;
- a print-at-1:1-scale tiling system;
- an email/password account platform for ordinary users;
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
