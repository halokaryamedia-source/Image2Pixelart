---
name: svelte-development-validation
description: Support skill for creating, editing, reviewing, or debugging Image2Pixelart Svelte 5 / SvelteKit source. Use the declared project versions and current official Svelte guidance, prefer modern runes patterns, run Svelte static checks/build as appropriate, and escalate to browser proof for actual rendered/interaction claims.
---

# Svelte Development Validation

Use when work materially creates, edits, reviews, or diagnoses:

- `.svelte` components;
- Svelte reactive modules;
- SvelteKit routes/layout/server modules whose correctness depends on Svelte/SvelteKit conventions;
- Svelte-specific state, props, events, snippets, lifecycle, or SSR behavior.

This skill validates implementation quality. It does not choose product requirements, visual direction, cloud architecture, dependencies, or branch policy.

## Authority

```text
current product requirement / Foundation
→ current source + package.json/package-lock.json
→ official Svelte/SvelteKit docs for relevant version
→ official Svelte tooling/autofixer when available
→ model memory last
```

Current project baseline is Svelte 5 / SvelteKit 2 as declared in `package.json`. Pin the actual current version before relying on version-sensitive behavior.

## Modern baseline

For new runes-mode code:

- use `$state` for state that genuinely needs reactivity;
- prefer `$derived` / `$derived.by` for computed values;
- use `$effect` for real side effects, not general React-style synchronization;
- use `$props` for modern component props;
- use modern event attributes in new code;
- preserve stable keyed identity when lists require identity;
- scope server/browser state correctly;
- do not enable experimental framework features merely because documentation mentions them.

Do not mechanically modernize unrelated existing source.

## Workflow

1. inspect current component/route and declared versions;
2. resolve current official docs when API/convention is version-sensitive;
3. implement the smallest Svelte-native solution;
4. use official Svelte analysis/autofix tooling when available for materially changed components;
5. run `npm run check`;
6. run `npm run build` when SSR/routing/public build compatibility can be affected;
7. use `browser-runtime-validation` when the claim depends on actual rendering, hydration, pointer/keyboard behavior, navigation, browser network, or console state.

## Guards

Do not:

- translate React patterns into `$effect` synchronization by reflex;
- add global stores/state layers before local/props/context ownership proves insufficient;
- put browser-only APIs into server execution paths;
- adopt dependencies because documentation provides an example;
- claim browser correctness from source/type/build proof;
- silently change editor/product behavior while "fixing Svelte style".

## Completion

Return:

```text
FINDING
AUTHORITY
ACTION
PROOF
BLOCKER (only when material)
```

Then return control to the active development owner.
