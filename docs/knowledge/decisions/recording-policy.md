# Decision Recording Policy

Create a durable decision record only when all are materially true:

1. the choice affects architecture, security, persistence, public/project format, collaboration semantics, deployment topology, or another long-lived boundary;
2. multiple plausible choices existed;
3. the reason will matter to future work;
4. the decision cannot be represented clearly enough in the affected Foundation owner alone.

Good candidates:

- changing single-editor collaboration semantics;
- changing project schema compatibility policy;
- moving durable project data between Neon/R2/another store;
- changing source-image privacy/publicity;
- adopting a new authentication model;
- changing deployment/runtime topology.

Usually not decision records:

- bug fixes;
- implementation detail within an existing contract;
- dependency patch update;
- CSS spacing;
- one-time migration execution;
- CI wording;
- temporary incident state.

When a record is justified, include:

```text
Title
Status
Context
Decision
Consequences
Supersedes / Superseded by (only when applicable)
```

Do not create a chronological decision diary.
