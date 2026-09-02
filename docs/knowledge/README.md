# Knowledge

`docs/knowledge/` contains compact current development memory. It should remain useful across sessions without becoming a chronological diary.

Owners:

```text
next-action.md
→ current status/boundary + exactly one next meaningful action

ownership.md
→ canonical responsibility map

implementation-map.md
→ hot paths / source routing

current-validation.md
→ durable proof interpretation and proof ceilings

editor-ui-decisions.md
→ approved ordinary Editor UI decisions; do not reinterpret them as permission for unrelated redesign

frontend-reference-inventory.md
→ current UI/reference catalog + authority classification

original-ui-baseline.md
→ factual map of the original upstream UI at commit 7904ba38; stable UI IDs for future owner handoff

ui-preservation-contract.md
→ mandatory visual-preservation rules for icons, assets, fonts, colors, component styling, states, spacing character, and accessibility during UI planning/regeneration

ui-language-contract.md
→ agreed UI language policy: Indonesian where natural, familiar English where translation feels forced, English tool names, and terminology consistency

ui-audit.md
→ current source/static UI audit after the implemented simplification pass

ui-implementation-plan.md
→ implemented UI slice + explicit do-not-redesign boundary + remaining proof work

decisions/
→ material durable decisions only
```

## Current handoff reading order

For a developer continuing the current Website Admin + Editor work, read in this order:

1. `../foundation/00-product-boundaries.md` — product/access boundary;
2. `../foundation/05-ui-design-system.md` — durable UI authority;
3. `editor-ui-decisions.md` — approved ordinary Editor wording/behavior decisions;
4. `implementation-map.md` — current source routing and retired paths;
5. `next-action.md` — current handoff status, proof level, and one next step;
6. `current-validation.md` — what each verification level can actually prove.

Current source outranks stale continuity. Git history owns ordinary historical detail.

`original-ui-baseline.md` is a special historical baseline: it intentionally describes the original upstream interface rather than claiming to describe the current fork. Future UI proposals should reference its stable UI IDs and remain separate from the factual baseline.

`ui-preservation-contract.md` is mandatory for future UI proposals and regeneration. Simplification, movement, grouping, hiding, or copy changes do not authorize visual substitution. Unaffected icons, assets, fonts, colors, component treatment, interaction states, and accessibility behavior must remain the same as the original source unless a visual change is explicitly approved.

`ui-language-contract.md` governs terminology cleanup. The UI should use Indonesian where it reads naturally and retain familiar English software/creative terms when an Indonesian translation would feel forced. Tool labels are English; visual/icon preservation remains governed separately by `ui-preservation-contract.md`.

Do not create a parallel handoff diary, roadmap, status system, duplicate owner map, or separate UI-reference catalog. Update the owners above instead.
