# Next Action

## Current Status

The UI direction has been revised to a **Player-first experience with the current MIVUBI visual style preserved**. Automatic CI, branch lifecycle, and GitHub rulesets remain intentionally deferred.

Safe source-level simplifications already applied:

- Home infrastructure wording cleanup;
- Editor opens canvas-first with side panels closed and quick palette visible;
- collaboration UI is contextual and no longer exposes revision/device-ID details to ordinary users.

## Active Boundary

Player must not choose canvas width, height, tile size, or resulting grid. Those are Admin configuration responsibilities.

The repository currently has `owner / editor / viewer` collaboration roles but no explicit `admin` role. Do **not** infer `owner === admin` without explicit product authorization.

Keep the current MIVUBI visual language. Future work changes hierarchy, placement, wording, default state, and progressive disclosure—not the product aesthetic.

Do not deploy, migrate cloud state, activate CI, or invent branch/ruleset work as part of this UI effort.

## Next Step

Define the real **Admin capability boundary** that will own canvas width/height/tile/grid configuration. Once that authority exists, remove those editable controls from the Player path and convert Player Home into a project launcher with read-only project dimensions plus `Upload image / Continue` actions.
