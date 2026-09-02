# Next Action

## Current Status

The approved UI review covering decisions **1–170** and the Website Admin configuration path are implemented at source/static level on the selected `Local` branch while preserving the original MIVUBI visual identity.

Implemented direction:

- Akses Umum keeps the approved simplified Home and Editor language/visual system;
- ordinary users can see Canvas/Grid information but cannot change the website Canvas configuration;
- Website Admin is separate from `User-01`, Device ID, project owner, and active-editor authorization;
- `/admin/login` provides dedicated Website Admin password login with a server-side Admin session;
- `/admin`, `/admin/settings`, and `/admin/settings/canvas` provide Website Admin configuration surfaces using the same approved UI terminology;
- Website Admin determines global Canvas width, height, and cell size; Grid size and total cells are derived automatically;
- new artworks snapshot the current website Canvas configuration at creation time;
- later Admin changes do not mutate existing artworks;
- the project-creation API rejects a new project whose Canvas dimensions do not match the current Website Admin configuration, preventing ordinary UI bypass;
- project ownership, active-editor authorization, revision guards, and collaboration/cloud persistence remain separate from Website Admin authority;
- the earlier owner-as-Admin project path is removed from current source authority;
- migration `002_site_settings.sql` defines persistent website settings, but it has **not** been applied from this execution context;
- Admin secrets are configured through `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`; no real credentials belong in source.

Automatic CI, branch architecture, deployment, database migration, and external cloud mutations remain intentionally out of scope.

## Active Boundary

Do not redesign the application while validating this implementation.

Preserve one UI language and one MIVUBI visual identity across Akses Umum and Admin Website. Do not reintroduce ordinary-user Canvas configuration controls, retired collaboration UI, raw revision/provider wording, or project-owner-based Admin authority.

Website Admin authentication is a website configuration boundary, not an ordinary-user account system. Existing project permissions remain authoritative for project persistence/editing.

Current proof level is **SOURCE/STATIC ONLY** in this execution context. No claim is made yet that the database migration is applied, Admin environment secrets are configured, rendered login/settings flows work in a browser, or a deployed runtime is updated.

## Next Step

In an explicitly intended configured environment:

1. generate the Admin password hash with `npm run admin:hash-password` and configure `ADMIN_PASSWORD_HASH` plus a strong `ADMIN_SESSION_SECRET` outside source;
2. apply `npm run db:migrate` only with explicit Operations authorization for the intended database;
3. run `npm run verify:repository` and `npm run check`; use the smallest relevant tests/build proof for concrete failures;
4. inspect `/admin/login`, `/admin`, `/admin/settings`, and `/admin/settings/canvas` in a real browser;
5. verify invalid login, valid login, session persistence, logout, direct-route protection, and Canvas-setting validation;
6. verify Home reflects the active Canvas setting and a newly created artwork snapshots it;
7. change the Admin Canvas setting and confirm an existing artwork remains unchanged while the next new artwork uses the new setting;
8. verify a direct project-create request with non-matching Canvas dimensions is rejected;
9. fix only concrete issues found by that proof; do not restart a redesign.
