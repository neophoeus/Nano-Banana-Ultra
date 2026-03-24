# Internal Smoke Report - 2026-03-24

## Scope

- Repo: `App-Nano_Banana_Ultra`
- Reference checklist: `INTERNAL_SMOKE_CHECKLIST.md`
- Run type: internal smoke for active development readiness
- App URL: `http://127.0.0.1:22287/`

## Environment

- Local dev server launched successfully with explicit app prefix.
- Health endpoint returned `ok: true` and `hasApiKey: true`.
- Gemini API key was available during the live pass.

## Commands Run

```powershell
npm run test -- useQueuedBatchWorkflow
npm run test:e2e:restore:queued-batch
npm --prefix d:\OneDrive\7_AI@neo.genymt.gmail\Projects\App-Nano_Banana_Ultra run dev -- --host 127.0.0.1 --port 22287
```

## Fix Implemented During Smoke

### Queued batch invalid-name polling loop

Observed issue:

- Restored seeded queued jobs with fake names such as `batches/job-pending` were still being auto-polled by the frontend.
- The backend correctly returned `Could not parse the batch name`, but the frontend kept treating the job as refreshable.

Implemented fix:

- Updated `hooks/useQueuedBatchWorkflow.ts` so deterministic invalid-name poll failures are converted into local terminal failures.
- The affected queued job is now marked `JOB_STATE_FAILED` with `updatedAt`, `completedAt`, `lastPolledAt`, and the returned error message.
- Added regression coverage in `tests/useQueuedBatchWorkflow.test.tsx`.

Validation:

- Focused Vitest run passed: `45 passed (45)` files, `505 passed (505)` tests.
- Focused Playwright restore queued-batch smoke passed: `1 passed`.
- Live UI verification confirmed the invalid restored job moved to `Failed` and stopped repeat auto-refresh noise.

## Smoke Results

### Verified

- App booted and served normally.
- `/api/health` responded successfully.
- Restore notice rendered and remained usable.
- Workspace import review opened for `output/workspace_snapshot.json`.
- Import review showed expected counts:
    - turns: 2
    - branches: 2
    - staged assets: 1
    - viewer images: 1
- `Merge Turns Only` completed successfully.
- Workspace remained usable after merge.
- History summary updated to 4 turns and 4 branches after merge.
- Major shell localization surfaces rendered correctly in `zh_TW`.
- Major shell localization surfaces rendered correctly in Japanese without raw translation keys.
- SketchPad entry opened successfully.
- Sketch surface initialized successfully and exposed active controls:
    - undo/redo
    - tool mode buttons
    - color palette
    - zoom slider
    - clear action
- Queue panel after fix showed the previously problematic restored job as terminal `Failed` instead of refreshable.
- Queue summary in live UI stabilized at:
    - 0 active
    - 1 import ready
    - 2 closed with issues
- Restore notice `Open latest turn` path reopened the latest recovered turn as the current history-backed stage source.
- The reopened stage reflected `History · Reopen` lineage in stage source, provenance, workflow log, and follow-up source surfaces.
- Viewer open/close completed successfully after the restore reopen path.
- Restore notice `Continue source` path aligned the stage as the active continuation source and updated follow-up surfaces to `History · Continue`.
- Restore notice `Branch from restored turn` path staged the turn as a branch source while preserving composer settings and updated follow-up surfaces to `History · Branch`.
- Shared queued-import fixtures now load from inline data URLs instead of external placeholder URLs.

### Noted Residual Issues

1. Fixture-driven queue failures still appear as historical failed items

- The restored fake queued job now closes correctly instead of re-polling forever.
- The failure remains visible in the queue panel, which is acceptable for internal restore fixtures but should not be mistaken for a live backend regression.

## Verdict

- Suitable for continued internal development and internal smoke usage.
- The queued batch invalid-name issue discovered during smoke is fixed at the frontend lifecycle level and validated in unit tests, Playwright, and the live app.
- The previously observed SketchPad controlled/uncontrolled warning has been fixed and revalidated.

## Recommended Follow-up

1. Keep using terminal-state conversion for invalid restored queued jobs; do not revert to infinite poll retry behavior.
2. If a broader internal handoff is needed, attach this report together with the bilingual checklist.
3. If restore-fixture demo quality matters, replace fake/external snapshot assets with local test assets.

## Post-Report Follow-up

Completed after the initial smoke report:

- Fixed the SketchPad viewport state mismatch in `components/SketchPad.tsx`.
- Root cause: the component stored viewport zoom as `scale`, while `fitWorkspaceToViewport()` and `screenPointToWorkspacePoint()` both use `zoom`.
- This caused the zoom slider input to become uncontrolled after the initial auto-fit pass and also made viewport math internally inconsistent.

Additional validation:

- Added `tests/SketchPad.test.tsx` to guard the initial auto-fit path.
- Focused validation passed: `46 passed (46)` files, `506 passed (506)` tests.
- Live verification after reopening SketchPad showed a stable zoom slider value and no recurrence of the previously observed controlled/uncontrolled warning in the page event stream.
- Replaced queued-import restore fixtures and the shared workspace snapshot from `example.com` placeholder URLs to inline data URLs so restore/viewer smoke no longer depends on external assets.
- Focused validation after the fixture update remained green: `46 passed (46)` files, `506 passed (506)` tests.
- Live verification confirmed the end-to-end restore flow `Workspace Restored -> Open latest turn -> Open viewer -> Close` completed successfully on the same page.
- Additional live verification confirmed the other restore action branches also completed successfully:
    - `Workspace Restored -> Continue source`
    - `Workspace Restored -> Branch from restored turn`

Updated status:

- The previously noted SketchPad controlled/uncontrolled warning is now considered fixed.
- The previous fake/external asset fetch noise is now removed for the queued-import restore path.
- Remaining residual concerns are limited to fixture-driven restore noise in the queue panel.

## 中文摘要

- 這輪內部 smoke 已完成，佇列批次 invalid batch name 問題與 SketchPad 的 React controlled/uncontrolled warning 都已處理。
- 佇列修復方式是讓無法解析名稱的還原假批次工作直接進入本地終止狀態，不再反覆 auto-poll。
- SketchPad 問題根因是元件內部把 viewport 狀態命名成 `scale`，但共用 viewport helper 使用的是 `zoom`，導致初始 auto-fit 後 zoom slider 變成 uncontrolled。
- 已補回歸測試，並重新通過 focused 測試驗證。
- live app 重新驗證後，SketchPad 可正常開啟，toolbar 與 zoom slider 正常，沒有再看到同一條 warning。
- 目前判定：可繼續作為內部開發與內部 smoke 使用。
- 另外已補做完整的 restore notice -> Open latest turn -> Open viewer -> Close live 驗證，整條路徑可正常完成。
- restore notice 的另外兩條分支 `Continue source` 與 `Branch from restored turn` 也已實際驗過，stage source 與 follow-up source 會分別正確切成 `History · Continue` 與 `History · Branch`。
- 目前 queued-import 還原快照也已改成使用內嵌 data URL，不再依賴 `example.com` 假圖，因此先前的外部載入噪音已從這條 smoke 路徑移除。
- 目前仍需注意的剩餘風險只剩 restore fixture 造成的假批次失敗項目仍會顯示在 queue panel；這不是新的產品阻塞問題。
