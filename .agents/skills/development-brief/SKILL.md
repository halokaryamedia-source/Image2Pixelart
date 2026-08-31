---
name: development-brief
description: Front door for non-trivial Image2Pixelart repository Development. Ground the actual requirement in current product/source authority, identify the first wrong owner, define minimal scope and 2–5 falsifiable acceptance criteria, choose only necessary Svelte/UI/accessibility/browser/cloud support, preserve branch-policy portability, then stop at matching proof.
---

# Development Brief

Use before non-trivial feature, architecture, cross-owner, substantial UI, project-format, persistence, collaboration, or cloud behavior changes.

Read-only `amati / inspect / understand` does not enter Development.

## Continuity

Use only what can change the task:

```text
AGENTS.md
→ GITHUB_RULES.md Core Rules for material GitHub work
→ CONTEXT.md
→ docs/knowledge/next-action.md when continuation matters
→ affected Foundation/source owner
```

Branch architecture is external/deferred. Never invent a branch topology inside a development brief.

## Internal contract

Establish only material fields:

```text
Goal
Actual requirement
Current first owner
Expected output
In scope
Out of scope
Acceptance criteria: 2–5
Proof required
Execution context / proof ceiling when material
Open high-impact decision, if any
STOP condition
```

Do not create a per-task brief file.

## Procedure

1. **Ground the goal**
   - Separate explicit requirement from suggested implementation method.
   - Use current Foundation/source/tests as authority.
   - Treat UI mockups/reference images within their recorded authority only.

2. **Check whether development is necessary**
   - Inspect current behavior first.
   - `No change required` is valid.
   - Historical TODOs and adjacent cleanup are not scope.

3. **Identify first wrong owner**
   - Product invariant → Foundation.
   - Implementation defect → exact implementation owner.
   - Stale test → test.
   - CI/repository drift → verifier/workflow.
   - Browser/cloud proof gap → evidence/capability boundary, not speculative source edits.

4. **Choose support**
   - Svelte/SvelteKit source → `svelte-development-validation`.
   - Visual craft → `web-ui-design-development`.
   - Semantics/keyboard/focus/forms/status → `web-accessibility-validation`.
   - Browser claim → `browser-runtime-validation`.
   - DB/R2/API/realtime/deployment-sensitive change → `cloud-development-validation`.
   - Use only the support layers materially needed.

5. **Set proof**
   - Prefer targeted tests during iteration.
   - Use full deterministic application gate when cross-cutting executable contracts can be affected.
   - Browser/cloud claims require matching actual runtime proof.

6. **Implement**
   - Make the smallest complete change.
   - Preserve valid behavior outside scope.
   - Do not add compatibility/fallback/service/framework/state layers without current evidence.

7. **Final gate**
   - Re-check goal, out-of-scope, acceptance criteria, actual proof, and STOP condition.
   - Update `next-action.md` only when active continuation materially changes.
   - Do not deploy/migrate/configure cloud state unless that operation was explicitly in scope.

## User-facing brief

When useful:

```text
Tujuan:
Owner:
Batas:
Bukti:
Tidak diubah:
```

Keep internal scratch reasoning private.

## Completion

Return to the active task owner and STOP when the scoped result and matching proof are satisfied.
