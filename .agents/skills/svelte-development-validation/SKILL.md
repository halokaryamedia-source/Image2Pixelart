---
name: svelte-development-validation
description: Support skill for creating, editing, reviewing, or debugging Image2Pixelart Svelte 5 / SvelteKit source. Use the declared versions and current official Svelte guidance, prefer runes-native patterns, review materially changed components with official Svelte analysis/autofix tooling when available, run project check/build only when the claim requires them, and escalate to browser proof for rendered or interaction behavior.
---

# Svelte Development Validation

Use when work materially creates, edits, reviews, or diagnoses:

- `.svelte` components;
- Svelte reactive modules;
- SvelteKit routes/layout/server modules whose correctness depends on framework conventions;
- Svelte-specific state, props, events, snippets, lifecycle, context, transitions, or SSR/browser boundaries.

This skill validates Svelte implementation quality. It does not choose product requirements, visual direction, cloud architecture, dependencies, branch policy, or deployment policy.

## Authority

```text
current product requirement / Foundation
→ current source + package.json/package-lock.json + vite.config.ts
→ official Svelte/SvelteKit documentation for the relevant declared version
→ official Svelte analysis/autofix tooling when available
→ model memory last
```

Current project configuration forces runes mode for project source in `vite.config.ts`. Pin the actual declared Svelte/SvelteKit versions before relying on version-sensitive behavior.

## Modern Svelte baseline

For new runes-mode code:

- use `$state` only for values that genuinely need reactive state;
- prefer `$derived` / `$derived.by` for computed values;
- treat `$effect` as an escape hatch for real side effects, not general React-style synchronization;
- use `$props` rather than legacy prop patterns in new runes-mode components;
- use current event-attribute syntax rather than legacy event directives in new code;
- use stable keyed identity when list item identity matters; never use an index as fake stable identity;
- keep browser-only APIs out of server execution paths;
- scope shared/reactive state so SSR requests cannot leak state across users;
- use context only when a genuine ownership boundary requires it;
- do not enable experimental framework features merely because documentation mentions them.

Do not mechanically modernize unrelated existing code during a bounded task.

## Image2Pixelart-specific guards

- `EditorView.svelte` is large; size alone is not permission for a speculative refactor. Split only when a concrete current responsibility deserves an owner.
- Canvas pointer/render behavior belongs with `MosaicCanvas.svelte`; do not reproduce it in unrelated components to solve local UI issues.
- Project/palette/cell data must remain plain canonical project state; do not create duplicate reactive shadow models merely for presentation convenience.
- Keep Web Worker boundaries intact when image/PDF work is deliberately off-main-thread.
- Do not turn cloud/realtime state into local optimistic truth when server revision/editor authority says otherwise.
- Preserve explicit viewer/read-only semantics instead of allowing UI state to become the authorization owner.

## Workflow

### 1. Pin the actual versions and mode

Inspect `package.json`, lockfile when dependency resolution matters, and `vite.config.ts` when compiler/adapter behavior matters.

### 2. Resolve current documentation when material

Consult current official Svelte/SvelteKit documentation for APIs/conventions whose behavior is version-sensitive. Do not implement framework behavior from stale model memory when current documentation can change correctness.

### 3. Use official Svelte tooling when available

The Svelte project provides agent/development tooling through `@sveltejs/mcp`. When the environment supports it, useful commands include:

```bash
npx @sveltejs/mcp list-sections
npx @sveltejs/mcp get-documentation "<relevant-section>"
npx @sveltejs/mcp svelte-autofixer <component> --svelte-version 5
```

For materially changed `.svelte` components, use the official analyzer/autofixer when available before finalizing. Treat its output as review evidence, not an instruction to apply every suggestion blindly.

Do not add `@sveltejs/mcp` to application dependencies merely to satisfy this development workflow.

### 4. Implement the smallest Svelte-native solution

Keep data ownership and product semantics where they already belong. Avoid introducing stores, contexts, wrapper components, or utility abstractions unless a real recurring responsibility exists.

### 5. Prove only what matters

Use the cheapest matching proof:

```text
Svelte syntax/type/reactivity claim
→ npm run check

SSR/routing/adapter/build compatibility claim
→ npm run check + npm run build when materially affected

rendered/layout/hydration/pointer/keyboard/navigation claim
→ browser-runtime-validation
```

Automatic CI is currently deferred; these commands are local proof tools, not mandatory ceremony for every edit.

## Common error guards

Do not:

- translate React-style synchronization into `$effect` by reflex;
- store derived values in separate mutable state without a real reason;
- add a global store before local props/state/context ownership proves insufficient;
- use browser globals at module/server evaluation time;
- create component abstraction only because markup repeats once or twice;
- use a Svelte documentation example as permission to add its optional dependency;
- claim runtime/browser correctness from static source inspection;
- change product behavior while describing the change as Svelte cleanup;
- run full build/tests repeatedly when a smaller check can falsify the current claim.

## UI coordination

For material visual work:

```text
web-ui-design-development
→ visual acceptance / hierarchy / states

svelte-development-validation
→ framework correctness / implementation quality

web-accessibility-validation
→ semantic + keyboard/focus/operability acceptance when applicable

browser-runtime-validation
→ actual rendered/runtime evidence
```

These skills validate different layers. Do not let one silently take over another's authority.

## Completion

Return a compact handoff when materially useful:

```text
FINDING
AUTHORITY
ACTION
PROOF
BLOCKER (only when material)
```

Svelte validation is complete when the implementation matches the current declared framework contract, relevant static/build proof was obtained when needed, browser proof was used for browser claims, and no unrelated modernization or architecture change was introduced. Then return control to the active development owner and STOP.
