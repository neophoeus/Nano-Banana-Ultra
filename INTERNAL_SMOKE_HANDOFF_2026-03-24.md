# Internal Smoke Handoff - 2026-03-24

## Current State

- Internal smoke pass is complete.
- Queued batch invalid-name restore polling issue is fixed.
- SketchPad controlled/uncontrolled input warning is fixed.
- Queued-import restore fixtures no longer depend on external placeholder image URLs.
- Focused validation after the SketchPad fix passed: `46 passed (46)` files, `506 passed (506)` tests.
- Additional live validation now confirms all three restore action paths work end to end:
    - `Workspace Restored -> Open latest turn -> Open viewer -> Close`
    - `Workspace Restored -> Continue source`
    - `Workspace Restored -> Branch from restored turn`

## Files Touched

- `hooks/useQueuedBatchWorkflow.ts`
- `tests/useQueuedBatchWorkflow.test.tsx`
- `components/SketchPad.tsx`
- `tests/SketchPad.test.tsx`
- `INTERNAL_SMOKE_REPORT_2026-03-24.md`
- `e2e/workspace-restore.spec.ts`
- `tests/QueuedBatchJobsPanel.test.tsx`
- `output/workspace_snapshot.json`

## Remaining Non-Blockers

- Restore fixtures can still show fake queued jobs as failed historical items.

## Recommended Next Focus

1. Leave the queue invalid-name handling as terminal failure behavior.
2. Keep queued-import restore fixtures on inline/local assets so smoke remains network-independent.
3. Use the smoke report as the main validation artifact and this handoff note as a quick status snapshot.
