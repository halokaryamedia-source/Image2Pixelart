# Product Boundaries

Status: current durable contract

## Purpose

MIVUBI Image2Pixelart helps users create and edit an exact Pixel Art Grid from a blank Canvas or source image while retaining physical Canvas dimensions when needed for production/installation planning.

The canonical authored unit is a **Grid cell**. In ordinary Indonesian UI, use **`sel`** for an individual Grid cell. Physical-production/export contexts may still refer to material quantities where relevant, but `tile` is not the general ordinary-user UI term.

## Core outcomes

A valid project can:

- store exact physical width, height, and cell size;
- produce compatible rows × columns without silent rounding;
- start blank or reconstruct from an imported image;
- maintain a bounded project palette and explicit empty cells;
- be edited interactively;
- be serialized/imported;
- produce Grid/material/blueprint exports;
- be stored through the current anonymous cloud model;
- use current single-active-editor/revision/realtime integrity infrastructure;
- snapshot the active Website Canvas configuration when new work is created.

## Access model

The application uses **one UI language and one MIVUBI visual identity with two user-facing access levels** while project-persistence authorization remains separate.

### Akses Umum

Akses Umum is the ordinary Home + Editor surface.

Akses Umum can:

- create/open/edit Pixel Art;
- start from a source image or blank Canvas;
- use crop, palette, drawing, selection, view, save, and export features;
- read the Canvas physical size and Grid size stored in the file.

Akses Umum cannot:

- choose the website-wide Canvas configuration;
- resize an existing file's structural Canvas values;
- become Website Admin by owning a project/device identity or becoming active editor.

### Admin Website

Admin Website is application-level authority for website configuration. It is **not** the project owner, `ownerDeviceId`, current active editor, or an ordinary device identity.

Admin Website:

- authenticates through a dedicated password + server-side Admin session;
- determines active global Canvas width, height, and cell size;
- receives derived Grid size and total-cell information;
- affects newly created work only.

A newly created work snapshots the active Canvas configuration into its project state. Later Admin changes do **not** mutate existing files.

### Project ownership / active editor

Project ownership, anonymous device authentication, active-editor authorization, revision guards, source-image storage, and realtime state remain separate project/cloud concepts.

Examples:

```text
project owner
→ may matter for project-specific actions such as delete/recovery
→ does not grant Website Admin access

active editor
→ may persist project edits when revision/realtime guards pass
→ does not grant Website Admin access
```

## Canvas authority

Current structural lifecycle:

```text
Website Admin sets active width / height / cell size
→ Grid is derived
→ ordinary user creates new work
→ project stores a snapshot
→ existing project keeps that snapshot permanently
```

Server boundaries must enforce this model:

- project creation must match current Website Canvas settings;
- existing project saves must reject changes to `widthMm`, `heightMm`, `cellMm`, `columns`, or `rows`;
- client-side hiding is not sufficient authorization.

## Current route exposure

```text
/
→ Akses Umum Home

/project/[id]
→ Akses Umum Editor

/admin/login
→ Website Admin login

/admin
→ Website Admin dashboard

/admin/settings
→ Website settings

/admin/settings/canvas
→ global Canvas settings for new work
```

## Collaboration presentation boundary

The project/realtime backend still contains single-active-editor, presence, revision, and related authorization infrastructure.

The **ordinary collaboration roster/request/handoff presentation is retired from the current Editor UI**. Do not reintroduce that presentation merely because supporting project/realtime endpoints still exist.

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

- maximum project Grid: 250,000 cells;
- maximum 2,000 cells on either side;
- project palette: 0–32 colors;
- source image: PNG/JPEG/WebP;
- source image size: maximum 20 MB;
- source image resolution: maximum 25 megapixels;
- PDF detail pages are blueprint/install guides, not physical 1:1 print sheets.

If source changes these limits intentionally, update this owner and matching tests/docs in the same logical delivery.

## Proof boundary

This contract describes intended/current source authority. It does not prove that:

- Website Admin secrets are configured in a target environment;
- `002_site_settings.sql` has been applied to a target database;
- Admin login/settings work in a browser;
- the latest handoff HEAD passes local Svelte/build checks;
- a deployed target contains the current branch state.

Use `docs/knowledge/current-validation.md` for proof levels.

## Authority

```text
current explicit user decision
→ this Foundation contract
→ other affected Foundation owners
→ current source/tests
→ approved UI decision/knowledge owners
→ design/reference artifacts
→ history/chat as supporting evidence only
```

Reference images, historical commits, and generated UI concepts do not silently redefine current product behavior.
