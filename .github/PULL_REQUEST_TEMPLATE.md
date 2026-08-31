## Purpose

Describe the one logical outcome this pull request delivers.

## Repository / ref boundary

**Base / destination policy:**

**Source branch/ref:**

Branch lifecycle and merge method are owned by the destination repository. This template intentionally does not prescribe `develop`, `Local`, `main`, or a release topology.

## Scope

**Changed owners:**

**Intentionally not changed:**

## Verification

Check only what is relevant.

- [ ] `npm run verify:repository`
- [ ] Targeted unit test(s)
- [ ] `npm test`
- [ ] `npm run check`
- [ ] `npm run check:realtime`
- [ ] `npm run build`
- [ ] Browser/runtime proof when the claim requires it
- [ ] Cloud integration proof when the claim requires it

Evidence / relevant result:

## Security / data

- [ ] No credentials, private keys, device secrets, production `.env`, or protected cloud values were added
- [ ] No private project/client/source data was added without explicit approval
- [ ] No `PUBLIC_*` variable exposes secret material
- [ ] No cloud/deployment mutation was performed merely to make verification pass

## Repository hygiene

- [ ] One logical delivery; no unrelated cleanup/refactor bundled
- [ ] No placeholder/transfer-only helper or temporary workflow/branch was added
- [ ] Generated/reference artifacts were not promoted to canonical source accidentally
- [ ] Applied/shared migration history was preserved where relevant

## Runtime boundaries

If applicable, state explicitly:

**Browser proof target/state:**

**Cloud environment tested:**

**External operations intentionally performed:**

**External operations intentionally not performed:**
