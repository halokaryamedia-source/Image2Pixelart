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

frontend-reference-inventory.md
→ current UI/reference catalog + authority classification

original-ui-baseline.md
→ factual map of the original upstream UI at commit 7904ba38; stable UI IDs for future owner handoff

ui-audit.md
→ current Home/Editor UI audit and prioritized alignment gaps

ui-implementation-plan.md
→ current bounded UI implementation sequence; not automatic execution

decisions/
→ material durable decisions only
```

Current source outranks stale continuity. Git history owns ordinary historical detail.

`original-ui-baseline.md` is a special historical baseline: it intentionally describes the original upstream interface rather than claiming to describe the current fork. Future UI proposals should reference its stable UI IDs and remain separate from the factual baseline.

Do not create parallel roadmaps, review archives, status systems, duplicate owner maps, or separate UI-reference catalogs unless a distinct current responsibility is proven.