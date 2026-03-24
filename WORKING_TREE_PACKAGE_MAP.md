# Working Tree Package Map

This file translates the current `main` working tree into reviewable package slices that match the packaging plan in `IMPLEMENTATION_MASTER_SPEC.md`.

It is intentionally pragmatic rather than theoretical: the lists below reflect the files that are actually changed right now, plus a small set of seam files that should be carried with the package they primarily serve.

## Package A

Package A is the workspace shell extraction and top-level UI composition pass.

Primary files:

- `App.tsx`
- `components/BranchRenameDialog.tsx`
- `components/GlobalLogConsole.tsx`
- `components/HistoryPanel.tsx`
- `components/LanguageSelector.tsx`
- `components/PanelLoadingFallback.tsx`
- `components/RecentHistoryFilmstrip.tsx`
- `components/SessionReplayDialog.tsx`
- `components/SurfaceLoadingFallback.tsx`
- `components/SurfaceSharedControls.tsx`
- `components/WorkspaceImportReview.tsx`
- `components/WorkspaceInsightsSidebar.tsx`
- `components/WorkspaceOverlayStack.tsx`
- `components/WorkspacePickerSheet.tsx`
- `components/WorkspaceRestoreNotice.tsx`
- `components/WorkspaceTopHeader.tsx`
- `components/WorkspaceViewerOverlay.tsx`
- `hooks/useGeneratedImageStageProps.ts`
- `hooks/useRecentHistoryFilmstripProps.ts`
- `hooks/useWorkspaceInsightsSidebarProps.ts`
- `hooks/useWorkspaceOverlayAuxiliaryProps.ts`
- `hooks/useWorkspacePickerSheetProps.ts`
- `hooks/useWorkspaceShellViewModel.ts`
- `hooks/useWorkspaceTopHeaderProps.ts`
- `hooks/useWorkspaceViewer.ts`
- `hooks/useWorkspaceViewerOverlayProps.ts`

Files removed by this package:

- `components/Sidebar.tsx`
- `components/SystemStatusPanel.tsx`

Package A seam files that should usually travel with A unless a smaller neighbor package is being isolated first:

- `components/GeneratedImage.tsx`
- `components/ImageUploader.tsx`

### Package A approved follow-up: 2026-03-24 workspace shell reorg

If the next mainline slice picks up the approved workspace-shell reorg, keep it inside Package A as a bounded shell-ownership pass rather than scattering it across unrelated packages.

Status update:

1. The bounded shell-ownership pass is now landed.
2. The latest completion point includes the timeline/system-log merge into the main `Context Rail` card stack inside `WorkspaceInsightsSidebar.tsx`.
3. Follow-up work in this area should now default to wording, polish, regression coverage, and any remaining secondary-surface drift, not reopening a parallel lower timeline family.

Primary files for that follow-up slice:

- `App.tsx`
- `components/WorkspaceHistoryCanvas.tsx`
- `components/WorkspaceResponseRail.tsx`
- `components/WorkspaceInsightsSidebar.tsx`
- `components/WorkspaceSideToolPanel.tsx`
- `components/GroundingProvenancePanel.tsx`
- `components/GlobalLogConsole.tsx`

Common seam files for the same slice:

- `components/GeneratedImage.tsx`
- `components/RecentHistoryFilmstrip.tsx`
- `hooks/useWorkspaceInsightsSidebarProps.ts`
- `hooks/useWorkspaceEditorActions.ts`
- `tests/WorkspaceResponseRail.test.tsx`
- `tests/WorkspaceInsightsSidebar.test.tsx`
- `tests/WorkspaceSideToolPanel.test.tsx`

Scope rules for this follow-up slice:

1. Treat `Model Output`, `Context Rail`, `Stage Workspace`, and `Composer Dock` as the only four shell families.
2. Keep response text / structured output / thoughts inside one output family.
3. Keep provenance detail and workflow timeline detail under one context owner instead of parallel center/right/header families. The latest landed pass also removes the duplicate lower timeline wrapper so `Workflow Log` remains a first-class context card inside the main rail stack.
4. Reduce the side-tool family into a stage-adjacent actions bar without changing the underlying editor-base logic.
5. Do not mix this slice with unrelated queue/request-path changes unless the reviewer explicitly wants a broader package.
6. Include shell surface-token cleanup and the `Open Editor` to state-aware-CTA presentation change inside the same review slice, because both are part of the same ownership/hierarchy correction rather than independent polish.

## Package B

Package B is the state-domain extraction, continuation semantics, provenance ownership, persistence behavior, and shared workflow state model.

Primary files:

- `components/GroundingProvenancePanel.tsx`
- `components/SketchPad.tsx`
- `constants.ts`
- `hooks/useComposerState.ts`
- `hooks/useGroundingProvenancePanelProps.ts`
- `hooks/useGroundingProvenanceView.ts`
- `hooks/useHistoryPresentationHelpers.tsx`
- `hooks/useHistorySourceOrchestration.ts`
- `hooks/useImportedWorkspaceReview.ts`
- `hooks/useProvenanceContinuation.ts`
- `hooks/useSelectedResultState.ts`
- `hooks/useWorkspaceAppLifecycle.ts`
- `hooks/useWorkspaceAssets.ts`
- `hooks/useWorkspaceBranchPresentation.ts`
- `hooks/useWorkspaceCapabilityConstraints.ts`
- `hooks/useWorkspaceEditorActions.ts`
- `hooks/useWorkspaceGenerationActions.ts`
- `hooks/useWorkspaceLineageSelectors.ts`
- `hooks/useWorkspaceResetActions.ts`
- `hooks/useWorkspaceSessionState.ts`
- `hooks/useWorkspaceSnapshotActions.ts`
- `hooks/useWorkspaceSnapshotPersistence.ts`
- `hooks/useWorkspaceSurfaceState.ts`
- `types.ts`
- `utils/branchContinuation.ts`
- `utils/canvasWorkspace.ts`
- `utils/conversationState.ts`
- `utils/executionMode.ts`
- `utils/groundingMode.ts`
- `utils/groundingProvenance.ts`
- `utils/lineage.ts`
- `utils/stagedAssets.ts`
- `utils/workflowTimeline.ts`
- `utils/workspacePersistence.ts`
- `utils/workspaceSnapshotState.ts`

Package B seam files that should follow the dominant semantic change nearby:

- `components/GeneratedImage.tsx`
- `components/HistoryPanel.tsx`
- `components/WorkspaceImportReview.tsx`

## Package C

Package C is the queued-batch workflow, request-path support, backend route work, and composer surfaces that directly expose queued-batch behavior.

Primary files:

- `components/ComposerSettingsPanel.tsx`
- `components/ImageEditor.tsx`
- `components/QueuedBatchJobsPanel.tsx`
- `hooks/useComposerSettingsPanelProps.ts`
- `hooks/useQueuedBatchJobs.ts`
- `hooks/useQueuedBatchWorkflow.ts`
- `hooks/useWorkspaceEditorActions.ts`
- `package-lock.json`
- `package.json`
- `plugins/imageSavePlugin.ts`
- `services/geminiService.ts`
- `utils/imageSaveUtils.ts`

Package C seam files that may need to move with adjacent packages if you want cleaner review boundaries:

- `App.tsx`
- `types.ts`
- `constants.ts`

## Package D

Package D is localization completion and locale-safe restore/import/provenance coverage.

Primary files:

- `e2e/workspace-restore.spec.ts`
- `utils/translations.ts`

Package D seam files that should only join this package if the text change is inseparable from the UI rendering change:

- `components/GlobalLogConsole.tsx`
- `components/GroundingProvenancePanel.tsx`
- `components/HistoryPanel.tsx`
- `components/WorkspaceImportReview.tsx`
- `components/WorkspaceRestoreNotice.tsx`

## Package E

Package E is regression and verification scaffolding.

Primary files:

- `.vscode/extensions.json`
- `.vscode/settings.json`
- `.vscode/tasks.json`
- `playwright.config.ts`
- `tests/AppOfficialConversationFlow.test.tsx`
- `tests/GroundingProvenancePanel.test.tsx`
- `tests/QueuedBatchJobsPanel.test.tsx`
- `tests/branchContinuation.test.ts`
- `tests/canvasWorkspace.test.ts`
- `tests/capabilityTruth.test.ts`
- `tests/conversationState.test.ts`
- `tests/groundingProvenance.test.ts`
- `tests/officialConversationRequest.test.ts`
- `tests/pluginOfficialConversationIntegration.test.ts`
- `tests/usePerformGeneration.test.tsx`
- `tests/useQueuedBatchWorkflow.test.tsx`
- `tests/workspacePersistence.test.ts`
- `tests/workspaceSnapshotState.test.ts`
- `vite.config.ts`

Documentation and review-support files that are useful to carry after the code packages are stable:

- `PRODUCT_SHELL_DECISIONS.md`
- `IMPLEMENTATION_MASTER_SPEC.md`
- `README.md`
- `WORKING_TREE_PACKAGE_MAP.md`

## Cross-Package Seams

These files are real cross-package joins. Do not expect a perfect one-package-only cut around them.

- `App.tsx`: dominant owner is Package A, but it also wires Package B and Package C.
- `types.ts`: dominant owner is Package B, but it carries Package C request and Package E test contracts.
- `constants.ts`: dominant owner is Package B, but capability truth impacts Package C and Package E.
- `components/GeneratedImage.tsx`: usually Package A if the change is stage/viewer presentation, Package B if the change is provenance or continuation semantics.
- `components/HistoryPanel.tsx`: usually Package A if the change is shell layout, Package B if the change is branch/continue/source semantics, Package D if the change is purely text/localization.
- `components/ImageEditor.tsx`: usually Package C because queued-batch editing-input handoff is the risky part.
- `components/GlobalLogConsole.tsx`: usually Package A, but the locale polish and restore regression fix make it a valid A+D seam.
- `hooks/useWorkspaceEditorActions.ts`: default owner is Package B, but it may need to ride with Package C if the editing-input handoff is being reviewed as one queue-facing flow.

## Recommended Cut Order

Use this order unless a specific review asks for a different dependency chain.

1. Package B core utilities and state hooks.
2. Package A shell extraction and overlay/header/view-model assembly.
3. If the approved 2026-03-24 shell reorg is being implemented, keep that as the next Package A follow-up before moving on to unrelated product slices.
4. Package C queued-batch request path and composer/editor queue surfaces.
5. Package D translation and locale-safe restore coverage.
6. Package E tests, Playwright harness, and repo-backed editor config.
7. Documentation updates in `PRODUCT_SHELL_DECISIONS.md`, `IMPLEMENTATION_MASTER_SPEC.md`, `README.md`, and this file after the execution-proof pass is settled.

## Keep vs Exclude

Use this section as the practical staging boundary for the current working tree.

### Keep in code-review packages

These are real implementation assets and should stay in the packaging plan.

- `App.tsx`
- `README.md`
- `components/**` except legacy removals already called out above
- `constants.ts`
- `constants/**`
- `e2e/**`
- `hooks/**`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `plugins/**`
- `PRODUCT_SHELL_DECISIONS.md`
- `services/**`
- `tests/**`
- `types.ts`
- `utils/**`
- `vite.config.ts`
- `IMPLEMENTATION_MASTER_SPEC.md`
- `WORKING_TREE_PACKAGE_MAP.md`

### Exclude from the first main code package cut

These are useful locally, but they should not be mixed into the first implementation commit unless there is an explicit reason.

- `.vscode/settings.json`
- `.vscode/tasks.json`
- `test-results/.last-run.json`

Why:

- `.vscode/settings.json` is workstation-specific and is already ignored by repo policy.
- `.vscode/tasks.json` is workflow convenience, not product behavior.
- `test-results/.last-run.json` is transient Playwright state and should stay ignored.

### Usually keep, but only in the verification/config package

- `.vscode/extensions.json`

Reason:

- It is the only VS Code file intentionally unignored by repo policy and can be useful if the team wants recommended extensions checked in.
- It still should not ride with the first product-code package unless you explicitly want editor recommendations in the same review.

## Suggested Staging Order

If you want the current tree turned into sane commits, stage in this order.

1. Package B core state/hooks/utils.
2. Package A shell/UI assembly and component replacement.
3. Package C queued-batch and backend/service request path.
4. Package D localization and restore/import/replay polish.
5. Package E tests and harness updates.
6. Product/docs decisions (`PRODUCT_SHELL_DECISIONS.md`, `IMPLEMENTATION_MASTER_SPEC.md`, `README.md`, `WORKING_TREE_PACKAGE_MAP.md`) and optional editor recommendations.

## Immediate Cleanup Outcome

After the ignore update in this repo, `test-results/.last-run.json` should stop polluting the working tree.

The remaining non-package candidates to leave out by default are:

- `.vscode/settings.json`
- `.vscode/tasks.json`

Everything else currently visible in git status belongs to one of the package slices above and can be reviewed rather than discarded.

## UI/UX Continuation Audit

The current working tree already makes the next UI/UX direction visible.

The important point is that the remaining UI/UX work is no longer about inventing new surfaces. It is about reducing ambiguity across the rebuilt shell so the same workflow reads coherently in header, stage, sidebar, overlays, history, restore/import review, and queued-job surfaces.

### Direction 1: Shell consistency and information hierarchy

Strong signals already present in the tree:

- `WorkspaceTopHeader`, `WorkspaceInsightsSidebar`, `WorkspaceOverlayStack`, `WorkspacePickerSheet`, and `WorkspaceViewerOverlay` now define the primary shell instead of the legacy sidebar system.
- `WorkspaceModalFrame`, `useOverlayEscapeDismiss`, `useOverlayFocusTrap`, and `useOverlayScrollLock` show that overlay behavior is already being normalized into one interaction model.
- `WorkspaceRestoreNotice`, `WorkspaceImportReview`, and `SessionReplayDialog` are no longer side utilities; they are part of the main workflow shell.

What this means for the next pass:

- The shell should be treated as one product surface with one reading order.
- The main image stage should remain the dominant visual task area.
- The right rail should behave like context and continuation support, not like a second competing app.
- Overlay families should share dismissal rules, focus behavior, and visual hierarchy.

Main files to continue refining:

- `App.tsx`
- `components/WorkspaceTopHeader.tsx`
- `components/WorkspaceInsightsSidebar.tsx`
- `components/WorkspaceOverlayStack.tsx`
- `components/WorkspacePickerSheet.tsx`
- `components/WorkspaceViewerOverlay.tsx`
- `components/WorkspaceModalFrame.tsx`

### Direction 2: History, branch, continuation, and source clarity

Strong signals already present in the tree:

- `useHistorySourceOrchestration`, `useWorkspaceLineageSelectors`, `useWorkspaceBranchPresentation`, `conversationState`, and `branchContinuation` make branch semantics explicit rather than implicit.
- `HistoryPanel`, `WorkspaceRestoreNotice`, `WorkspaceImportReview`, and the insights sidebar all surface reopen, continue, branch, and source-active decisions.
- Existing tests already protect lineage and translation behavior across `HistoryPanel`, `branchContinuation`, `conversationState`, `workspaceSnapshotState`, and restore notice rendering.

What this means for the next pass:

- The user should always know whether they are reopening an old turn, continuing a branch, creating a new branch, or using the current active source.
- The same terminology must appear consistently in history cards, restore flows, import review, session replay, and conversation continuity areas.
- Current-stage-source and active-branch cues should stay visible without forcing the user to inspect multiple panels.

Main files to continue refining:

- `components/HistoryPanel.tsx`
- `components/WorkspaceRestoreNotice.tsx`
- `components/WorkspaceImportReview.tsx`
- `components/WorkspaceInsightsSidebar.tsx`
- `hooks/useHistorySourceOrchestration.ts`
- `hooks/useWorkspaceLineageSelectors.ts`
- `hooks/useWorkspaceBranchPresentation.ts`

### Direction 3: Provenance and insight density reduction

Strong signals already present in the tree:

- `GroundingProvenancePanel` has already moved beyond a raw metadata dump and now includes compact empty-state handling, source/support-bundle comparison, and composer reuse previews.
- `useGroundingProvenanceView` and `groundingProvenance` show a clear split between product summary and deeper inspection data.
- Existing tests already cover compact empty state, attribution overview, source status, uncited source display, and selected bundle/source drill-down behavior.

What this means for the next pass:

- Provenance should stay available, but the default read should be summary-first.
- Requested size, actual output, grounding status, and continuity state should be readable as a quick summary before drill-down.
- The sidebar and viewer should not force users to parse long technical sections when no grounding or provenance action is currently relevant.

Main files to continue refining:

- `components/GroundingProvenancePanel.tsx`
- `components/WorkspaceInsightsSidebar.tsx`
- `components/GeneratedImage.tsx`
- `hooks/useGroundingProvenanceView.ts`
- `hooks/useGroundingProvenancePanelProps.ts`

### Direction 4: Queued batch as a task workflow, not a debug console

Strong signals already present in the tree:

- `QueuedBatchJobsPanel`, `useQueuedBatchWorkflow`, `useQueuedBatchJobs`, backend batch routes, and queue tests already cover submit, poll, cancel, import, open-imported-result, and restart persistence.
- The queue surface already exposes state, timeline checkpoints, imported preview rails, and local lineage linkage.
- This means the risky execution path is largely in place; the remaining work is comprehension and task flow.

What this means for the next pass:

- The queue area should read like a job inbox with clear next actions.
- Import readiness, imported results, and failed jobs should be visually and behaviorally distinct.
- Queue actions should feel aligned with workspace history and continuation semantics rather than like a parallel developer-only system.

Main files to continue refining:

- `components/QueuedBatchJobsPanel.tsx`
- `components/ComposerSettingsPanel.tsx`
- `components/ImageEditor.tsx`
- `hooks/useQueuedBatchWorkflow.ts`
- `hooks/useWorkspaceEditorActions.ts`

### Direction 5: Localization and verification are the closure pass, not the starting point

Strong signals already present in the tree:

- The tree already contains broad translation coverage tests, replay/render-time localization support, restore notice tests, queue tests, provenance tests, and persistence tests.
- `playwright.config.ts` and `e2e/workspace-restore.spec.ts` indicate the repo is moving toward stronger browser-level verification.

What this means for the next pass:

- Text cleanup should follow stabilized interaction semantics, not substitute for them.
- Regression coverage should be added where a user-visible workflow becomes clear enough to freeze.
- Full browser-path checks are most valuable after shell hierarchy and task flow settle.

### Recommended next implementation order from a UI/UX perspective

1. Finish shell consistency and overlay behavior.
2. Tighten history, branch, continue, and current-source wording plus CTA hierarchy.
3. Compress provenance and insights into a faster summary-first read.
4. Reframe queued batch into a clearer task workflow.
5. Use localization and browser-level verification to lock the final behavior.

### Practical review heuristic

If a proposed change makes the shell prettier but does not improve one of these five directions, it is probably churn rather than useful UI/UX progress.

## UI Timing

Do not mix meaningful UI restructuring into Package B1.

The better timing is to split UI work into two separate passes.

### UI Pass 1: Layout and information hierarchy

Best time:

- After Package B1 is stable.
- During Package A, because Package A owns the shell, overlay stack, header, picker sheet, viewer shell, and insight/sidebar composition.

This pass should include:

- panel order and density
- desktop vs mobile layout behavior
- overlay layering and focus flow
- sidebar / history / viewer information hierarchy
- composer placement and shell spacing

This pass should avoid:

- deep queued-batch surface changes that are still moving with Package C
- large visual polish churn unrelated to hierarchy

Concrete A-pass targets:

- `App.tsx`: simplify the top-level screen composition so the shell reads as a small number of clear zones instead of one long assembly block.
- `components/WorkspaceTopHeader.tsx`: tighten the header into a high-signal control bar and keep secondary controls out of the first visual row.
- `components/WorkspaceInsightsSidebar.tsx`: reorganize insight density so branch/session/provenance context is readable without competing with the main stage.
- `components/WorkspaceOverlayStack.tsx`: normalize overlay layering, escape routes, and mobile-safe stacking order.
- `components/WorkspacePickerSheet.tsx`: make picker flows feel like one system rather than a set of unrelated panels.
- `components/WorkspaceViewerOverlay.tsx`: separate image viewing, result reading, and provenance inspection into clearer zones.
- `components/RecentHistoryFilmstrip.tsx`: keep recent-turn scanning fast and avoid letting the filmstrip overpower the main stage.
- `components/SurfaceSharedControls.tsx`: reduce floating-control sprawl and align surface controls with the active editing/sketching context.
- `components/GlobalLogConsole.tsx`: keep status visibility high without competing with primary workspace actions.

Suggested layout objectives for A-pass:

- Make the main stage visually dominant on desktop.
- Keep the composer reachable without letting it drown the viewer and context panels.
- Reduce the number of simultaneously loud surfaces.
- Make history, lineage, and provenance feel adjacent to the current turn rather than like separate apps.
- Improve mobile collapse rules so the shell still has one obvious primary task per viewport.

Suggested acceptance checks for A-pass:

- A first-time user can identify the primary action area within a few seconds.
- A returning user can find current turn, branch context, provenance context, and next action without opening multiple overlays.
- Desktop layout preserves a clear dominant reading order.
- Mobile layout does not trap core actions behind overlapping sheets.
- No Package C queue/editor-specific controls need to be redesigned twice because of the A-pass.

### Package A sub-cuts

If Package A needs to be reviewed incrementally, cut it in this order.

#### A1: Desktop shell layout

Primary scope:

- `App.tsx`
- `components/WorkspaceTopHeader.tsx`
- `components/WorkspaceInsightsSidebar.tsx`
- `components/RecentHistoryFilmstrip.tsx`
- `components/GlobalLogConsole.tsx`
- `hooks/useWorkspaceShellViewModel.ts`
- `hooks/useWorkspaceTopHeaderProps.ts`
- `hooks/useWorkspaceInsightsSidebarProps.ts`
- `hooks/useRecentHistoryFilmstripProps.ts`

Goal:

- establish the desktop reading order
- make the stage the dominant zone
- reduce shell noise before mobile and overlay work begin

#### A2: Mobile collapse and shared control flow

Primary scope:

- `components/SurfaceSharedControls.tsx`
- `components/WorkspacePickerSheet.tsx`
- `components/WorkspaceRestoreNotice.tsx`
- `components/WorkspaceImportReview.tsx`
- `hooks/useWorkspaceOverlayAuxiliaryProps.ts`
- `hooks/useWorkspacePickerSheetProps.ts`

Goal:

- define how controls collapse on narrow viewports
- keep one obvious primary action visible on mobile
- prevent sheet-to-sheet navigation from feeling fragmented

#### A3: Overlay and immersive viewing flow

Primary scope:

- `components/WorkspaceOverlayStack.tsx`
- `components/WorkspaceViewerOverlay.tsx`
- `components/SessionReplayDialog.tsx`
- `components/BranchRenameDialog.tsx`
- `components/PanelLoadingFallback.tsx`
- `components/SurfaceLoadingFallback.tsx`
- `hooks/useWorkspaceViewer.ts`
- `hooks/useWorkspaceViewerOverlayProps.ts`

Goal:

- make overlays feel like one coherent system
- clarify focus, escape routes, and z-order
- improve immersive viewing without breaking task continuity

### A-pass concrete layout proposal

Use this as the default direction unless product priorities change.

#### Desktop proposal

- keep a three-tier shell: top control bar, dominant stage row, lower action/support row
- make the center-left stage the largest visual mass on the screen
- keep the right rail as a context rail, not a second primary workspace
- move low-frequency diagnostics and activity into quieter containers
- keep composer full-width near the bottom so it remains reachable after viewing context

Target reading order:

1. top header for model/language/high-signal status
2. main generated-image stage
3. right-side context rail for insights, lineage, provenance, and session context
4. recent history filmstrip as quick recall
5. composer as the commit point for the next action

#### Mobile proposal

- collapse the right rail into sheets or stacked sections below the stage
- keep stage and primary generation actions above the fold
- reduce simultaneous visible panels to one primary task plus one secondary context block
- prefer bottom-sheet or full-height sheet patterns for pickers and history instead of squeezing side panels

Target mobile order:

1. compact top header
2. stage
3. primary action block or composer entry point
4. recent history strip
5. expandable context sections for provenance, lineage, and session detail

#### Overlay proposal

- viewer overlay should prioritize image first, then result text, then provenance detail
- picker sheet family should share one navigation model and one dismissal model
- restore/import/replay dialogs should feel task-specific but visually related
- global log expansion should remain available without stealing the primary interaction layer

### A-pass implementation hints

When the actual UI work starts, prefer these moves first:

- simplify `App.tsx` into clearer shell sections before changing visual styling
- tone down the density of `WorkspaceInsightsSidebar` before adding new blocks
- keep `RecentHistoryFilmstrip` compact and scan-friendly rather than turning it into a secondary gallery
- ensure `WorkspaceTopHeader` only carries controls that deserve persistent top-row presence
- treat `WorkspaceViewerOverlay` as an immersive reading surface, not a duplicate of the main page layout

### A-pass overlap reduction table

Use this table as the decision filter for A1 before any visual polish starts.

| Area                                                          | Main question it should answer                                                             | Current overlap                                                                                               | Keep strong                                                                                | Weaken or merge                                                                     | Default A-pass move                                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GeneratedImage` stage                                        | What is the current result right now?                                                      | overlaps with viewer actions and result-summary cards                                                         | current image, stage-local actions, immediate status                                       | long explanatory text, duplicate provenance summaries                               | keep the stage visually dominant and focused on the active result                                            |
| `WorkspaceViewerOverlay`                                      | When I inspect deeply, what are the result details and follow-up options?                  | overlaps with stage quick actions, sidebar context, result-summary cards                                      | immersive image reading, detailed prompt/result/provenance inspection, follow-up actions   | homepage-style repeated summaries that belong on the main shell                     | treat as deep-inspection mode, not a duplicate workspace                                                     |
| result text and provenance summary cards in `App.tsx`         | What is the shortest explanation of this result without opening anything else?             | overlaps with sidebar provenance blocks and viewer detail rail                                                | one short result summary, one short provenance summary                                     | dense multi-section interpretation that repeats sidebar content                     | compress into lightweight summaries adjacent to the stage                                                    |
| `WorkspaceInsightsSidebar`                                    | What context explains how this current turn came to exist?                                 | overlaps with summary cards, filmstrip badges, viewer detail rail                                             | branch, session, lineage, source, provenance context tied to the current turn              | repeated model settings, repeated long-form result reading, repeated action buttons | narrow the sidebar into a context rail, not a second workspace                                               |
| `RecentHistoryFilmstrip`                                      | What were the most recent turns, and where can I jump quickly?                             | overlaps with gallery/history sheets and lineage summaries in the sidebar                                     | quick visual recall, current-turn comparison, fast continue or open actions                | deep history explanation, secondary-gallery density, large metadata blocks          | keep compact and scan-first                                                                                  |
| gallery and history modes in `WorkspacePickerSheet`           | When I want to browse more than the recent strip, where do I explore history?              | overlaps with filmstrip and branch/lineage context panels                                                     | broader browsing, selection, recovery, batch-style recall                                  | competing with the filmstrip for same-screen prominence                             | reserve for expanded browsing, not always-visible navigation                                                 |
| `WorkspaceTopHeader` quick controls                           | What global settings or high-frequency controls must stay visible all the time?            | overlaps with composer tool row and picker-sheet entry points                                                 | model, language, theme, highest-signal generation controls                                 | low-frequency controls that can live in sheets or composer                          | keep only always-needed controls in the top row                                                              |
| `ComposerSettingsPanel`                                       | What am I doing next?                                                                      | overlaps with top quick settings, stage actions, viewer follow-up actions                                     | prompt entry, primary generate or follow-up decision, queue entry, advanced settings entry | status/context storytelling that belongs in sidebar or history surfaces             | make this the clear next-action commit point                                                                 |
| `WorkspacePickerSheet` settings modes                         | Where do secondary controls live when they do not deserve permanent placement?             | overlaps with top header chips and composer quick tools                                                       | secondary pickers for style, size, ratio, references, history, templates                   | duplicating primary actions that must remain directly reachable                     | unify as the secondary tool drawer system                                                                    |
| source and continuity blocks in `WorkspaceInsightsSidebar`    | Where did this result come from, and how does it connect to the current branch or session? | overlaps internally across stage source, session source, session continuity, official conversation continuity | one clear source story and one clear continuity story                                      | multiple cards that explain the same origin chain in slightly different words       | merge into fewer, stronger source-and-lineage sections                                                       |
| action buttons across stage, viewer, and composer             | What is the next sensible move from here?                                                  | overlaps across three surfaces with similar continue, edit, or generate actions                               | keep one primary next-action owner per mode                                                | repeated action clusters with the same verbs in multiple places                     | assign homepage next action to composer, inspection actions to viewer, stage actions to quick local controls |
| `GlobalLogConsole`, replay, and timeline-like status surfaces | What changed recently, and what system feedback matters?                                   | overlaps with filmstrip recency and continuity storytelling                                                   | diagnostics, restore/import feedback, replay access, system-level events                   | narrative explanations of branch meaning or result interpretation                   | keep logs diagnostic and historical, not explanatory                                                         |

Decision rule for A1:

- if two areas answer the same question, keep the answer in the area with the stronger user intent and reduce the other area to a summary or entry point
- if a block needs many badges, paragraphs, and actions to justify its existence, it is probably carrying information that belongs elsewhere
- if a user is deciding the next step, the composer should win; if a user is understanding the current result, the stage and short summaries should win; if a user is reconstructing origin, the sidebar should win; if a user is exploring deeply, the viewer should win

Practical A1 cleanup targets from this table:

- reduce `WorkspaceInsightsSidebar` sections until it reads as one contextual narrative instead of stacked mini-dashboards
- compress the result-summary area in `App.tsx` so it supports the stage rather than competing with the sidebar
- keep `RecentHistoryFilmstrip` visibly smaller than the stage and smaller in scope than the picker-sheet gallery/history views
- remove low-frequency controls from `WorkspaceTopHeader` unless they are truly global and high-urgency
- make `ComposerSettingsPanel` the most obvious place to start the next generation or follow-up action

### A1 first implementation wave

Do not try to redesign the whole desktop shell in one pass.

Use this first wave to remove the loudest overlap while keeping Package C queue/editor work untouched.

#### Wave 1 goal

- make the stage visually dominant
- make the next action obviously belong to the composer
- turn the sidebar into a context rail instead of a second dashboard
- keep history visible but quiet

#### Wave 1 exact targets

1. `App.tsx`
    - split the page into explicit desktop zones: header, stage-and-context row, support strip, composer row
    - keep `GeneratedImage` as the largest block in the main row
    - place summary cards next to the stage as short support cards, not a second reading column
    - keep `WorkspaceInsightsSidebar` in the same main row, but visually narrower than the stage
    - keep `RecentHistoryFilmstrip` below the main row as quick recall instead of equal-weight content

2. `components/WorkspaceInsightsSidebar.tsx`
    - merge source and continuity storytelling into fewer sections
    - remove repeated result-reading content that already exists in the stage summary or viewer
    - remove repeated action clusters that belong to the composer or viewer
    - keep only context that answers branch, lineage, provenance, and current-turn origin

3. `components/WorkspaceTopHeader.tsx`
    - keep only global or very high-frequency controls in the persistent header
    - move lower-frequency controls behind picker entry points instead of exposing every control directly
    - reduce visual density in the first row so the header stops competing with the stage

4. `components/RecentHistoryFilmstrip.tsx`
    - keep recent cards short and scan-first
    - avoid long metadata stacks and avoid turning the strip into a second history dashboard
    - keep open or continue actions lightweight and subordinate to the composer

5. `components/GlobalLogConsole.tsx`
    - demote the console visually so it behaves like support telemetry
    - keep it available, but do not let it read like a primary workflow panel

#### Wave 1 non-goals

- do not redesign queue-specific panels in `ComposerSettingsPanel.tsx`
- do not restructure overlay choreography in `WorkspaceOverlayStack.tsx`
- do not do final visual polish, animation, or typography direction here
- do not change Package B ownership semantics just to simplify layout

#### Wave 1 review checklist

- when the page opens, the eye lands on the stage first, not the sidebar or filmstrip
- a user can tell that the composer is the main place to take the next step
- the sidebar reads as context about the current turn, not as another full workspace
- the filmstrip helps recall recent turns without competing for main-screen attention
- nothing in the first wave forces queue/editor surfaces to be redesigned again in Package C

### A1 Wave 1 execution order

Use this order if the goal is to land the first shell cleanup with minimal rework.

1. `App.tsx` shell zoning
    - keep behavior unchanged
    - move to four explicit desktop bands: header, main stage row, history strip, composer row
    - inside the main row, make the stage column widest, put short summary cards beside it, keep sidebar as the narrowest rail
    - review output: screenshots should already show stage first, sidebar last

2. `App.tsx` summary-card demotion
    - keep result text and provenance cards short and support-only
    - do not let them become a second detail rail
    - review output: cards help read the current turn in seconds, but deep reading still belongs to viewer/sidebar

3. `WorkspaceInsightsSidebar.tsx` context-rail tightening
    - remove repeated result reading and repeated next-step actions
    - merge source/continuity storytelling where possible
    - review output: the sidebar answers where this turn came from, not what to click next

4. `RecentHistoryFilmstrip.tsx` quiet-strip pass
    - keep the strip visually lighter than the stage row
    - preserve quick open/continue/branch, but keep metadata dense only on hover or secondary states
    - review output: recent turns are easy to scan without feeling like a second workspace

5. `WorkspaceTopHeader.tsx` density reduction
    - remove or defer controls that are not truly global/high-frequency
    - keep the header readable in one glance
    - review output: the header no longer competes with the stage for attention

6. final A1 Wave 1 check
    - test desktop at the common breakpoints first
    - confirm Package C surfaces still fit naturally below without needing another layout rewrite
    - only after this, start A2 mobile collapse or A1 visual polish follow-ups

### A1 Wave 1 implementation status

This section tracks what has already landed so the document stays aligned with the working tree.

- completed: `App.tsx` shell zoning now reads as header, dominant stage row, recent-history strip, and composer row on desktop
- completed: result text and provenance summary cards were kept as short support cards beside the stage instead of a second reading rail
- completed: `WorkspaceInsightsSidebar.tsx` was reduced to source, branch, lineage, timeline, and session context instead of repeating result/settings content
- completed: `WorkspaceTopHeader.tsx` now separates primary global controls from quieter secondary controls so the header competes less with the stage
- completed: `RecentHistoryFilmstrip.tsx` was reduced into a lighter scan-first strip with smaller cards and less hover metadata
- completed: `components/GlobalLogConsole.tsx` was visually demoted into quieter telemetry so it stays available without reading like a primary workflow panel
- validation: production build succeeded after the shell, sidebar, header, and filmstrip changes

### A2 first implementation cut

Start A2 with shell order and context collapse before touching picker-sheet choreography.

1. `App.tsx` mobile order pass
    - keep desktop order unchanged
    - keep stage first on narrow viewports
    - move `ComposerSettingsPanel` above the recent-history strip on mobile so next action stays visible earlier
    - collapse `WorkspaceInsightsSidebar` into an expandable context block below recent history on mobile instead of keeping it permanently in the main row
    - review output: mobile reads as stage, next action, recent recall, then deeper context

2. later A2 follow-up
    - move more low-frequency controls behind sheets or compact entry points
    - keep sheet-to-sheet navigation coherent once picker and import/restore surfaces are revisited

### A2 implementation status

- completed: `App.tsx` now collapses the desktop right rail into an expandable context block below recent history on mobile
- completed: mobile shell order now promotes stage first, composer second, recent recall third, and deeper context last
- completed: `WorkspaceTopHeader.tsx` now hides low-frequency secondary controls behind a compact expandable block on narrow viewports instead of leaving all controls permanently visible
- completed: `WorkspaceRestoreNotice.tsx`, `WorkspaceImportReview.tsx`, and `WorkspacePickerSheet.tsx` now share the same secondary-surface jump language so gallery, prompt, history, and references no longer feel like isolated flows
- completed: picker, import review, and session replay now use a shared modal frame so secondary surfaces read more like one overlay family instead of separate chrome systems
- next follow-up: normalize the remaining non-modal restore banner and sketch-confirm surface against the shared overlay language where appropriate

### A3 implementation status

- completed: modal-style surfaces now share a more coherent overlay frame and close affordance across picker, import review, and session replay
- completed: `WorkspaceViewerOverlay.tsx` and `BranchRenameDialog.tsx` now support Escape dismissal so deep-inspection and rename flows use the same basic exit route as other overlays
- completed: sketch replace confirm now uses the same shared modal frame language instead of a one-off confirm box
- completed: workspace overlay z-index ordering now comes from a shared constant set instead of scattered literals across restore, import, picker, viewer, branch rename, and notifications
- completed: shared modal surfaces, viewer, and rename now restore focus on close and keep Tab navigation inside the active overlay instead of leaking back to the page behind
- completed: `WorkspaceRestoreNotice.tsx` now uses the shared modal frame as a top-aligned lightweight variant instead of a completely separate banner structure
- completed: overlay surfaces now lock page scrolling while active, prefer explicit initial-focus targets, and skip hidden elements when computing the focus trap loop
- completed: `WorkspaceRestoreNotice.tsx` now presents recovery stats and action groups in the same summary-plus-actions language as the rest of the overlay family instead of a loose button strip
- completed: shell-path support overlays now stop using ad hoc high z-index values for log console, history clear confirm, and surface loading fallback, reducing restore-notice overlap regressions
- completed: editor and sketch fixed-layer surfaces now read from shared z-index constants instead of scattered literals, reducing cross-surface stacking drift before future overlay work
- completed: shared overlay z-index classes are now safelisted in Tailwind so runtime-composed `z-[...]` values actually produce CSS, fixing restore-notice hit-testing and stacking regressions that looked correct in JSX but rendered as `z-index: auto`
- completed: overlay, surface, editor, and sketch stacking now use numeric z-index tokens plus inline styles instead of runtime-composed Tailwind z-index classes, removing the fragile dependency that caused restore-notice stacking to silently fall back to `auto`
- completed: `WorkspaceRestoreNotice.tsx` now reads as a centered recovery modal with stronger backdrop separation instead of a lightweight top-aligned banner-modal hybrid
- completed: `tailwind.config.js` no longer carries the temporary z-index safelist because the source tree no longer depends on runtime-composed overlay z-index classes
- validation: production build still succeeds after safelist removal, and browser verification confirms the centered restore modal keeps `z-index: 230`, wins hit-testing, and can open the shared Gallery picker without click interception
- completed: restore, import review, and session replay modals now share a closer visual language around backdrop depth, section grouping, and summary/action emphasis instead of mixing three noticeably different surface treatments
- validation: production build still succeeds after the modal polish pass, and browser verification confirms the restore modal still blocks background interaction until dismissed while the underlying log console remains reachable afterward
- completed: `BranchRenameDialog.tsx` now uses the shared modal frame instead of a bespoke overlay shell, bringing its focus/scroll/close behavior and visual depth into the same overlay family as restore, import review, and session replay
- completed: sketch replace confirm now uses the same strengthened backdrop, panel depth, and action-row separation as the rest of the secondary dialog family instead of reading like a leftover one-off confirm surface
- validation: production build still succeeds after the secondary-dialog convergence pass

### A-pass overlap table in plain Chinese

Use this as the plain-language reading of the table above.

#### 1. `GeneratedImage` stage

- 這一區最主要只該回答一個問題: 現在這張結果是什麼。
- 它要負責圖片本體、最即時的狀態、少量就地操作。
- 它不該再承擔太多長篇解說，不然會和右邊側欄、viewer 內容打架。

#### 2. `WorkspaceViewerOverlay`

- 這一區不是第二個首頁，而是「我想看更深」時才進去的沉浸模式。
- 它應該負責大圖檢視、完整 prompt、完整結果細節、完整 provenance。
- 它不需要再把首頁那套摘要重新演一遍。

#### 3. `App.tsx` 裡的 result text / provenance summary cards

- 這兩張卡只該做「短摘要」。
- 它的任務是讓人不開 viewer、不讀整個 sidebar，也能先快速懂現在這張圖大概是什麼。
- 如果這兩張卡越寫越長，就會開始和 sidebar 重疊。

#### 4. `WorkspaceInsightsSidebar`

- 這一區最該回答的是: 這張圖是怎麼來的。
- 所以它該留下 branch、lineage、source、session、provenance 這類脈絡資訊。
- 它不該再重複模型設定、長篇結果解讀、或一堆下一步按鈕，不然就變成第二個主工作區。

#### 5. `RecentHistoryFilmstrip`

- 這一區的角色是「快速回想最近幾步」，不是完整歷史中心。
- 它應該短、小、快掃，不要塞太多說明。
- 如果它變得像 gallery 或完整 lineage map，就會搶走主畫面的注意力。

#### 6. `WorkspacePickerSheet` 的 gallery / history

- 這一區才是「我要展開找更多歷史」的地方。
- 它可以比 filmstrip 更完整，但不需要常駐在主畫面上跟 filmstrip 搶工作。
- 換句話說，filmstrip 是快取，sheet 才是展開瀏覽。

#### 7. `WorkspaceTopHeader`

- 這一區只該留真的很常用、而且應該一直看得到的控制。
- 像 model、language、theme、極高頻狀態，可以留。
- 其他不是每秒都要碰的控制，應該退到 picker 或 composer，不然 header 會太吵。

#### 8. `ComposerSettingsPanel`

- 這一區最重要的角色是回答: 我下一步要做什麼。
- 所以 prompt、generate、follow-up、queue 這些應該以它為主。
- 它不需要再搶著講歷史、來源故事、狀態脈絡，那些不是它的工作。

#### 9. `WorkspacePickerSheet` 的設定類 sheet

- 它是二線工具抽屜。
- 任何不值得永久佔版面的控制，都可以收進來。
- 但主行為不要全塞進來，否則主畫面會失去明顯的操作入口。

#### 10. sidebar 裡的 source / continuity 區塊

- 這部分現在最容易自己和自己重複。
- stage source、session source、session continuity、official conversation continuity，其實都在講「這張圖從哪裡接過來」。
- A1 最值得做的事之一，就是把它們合併成比較少但更有力的幾段敘事。

#### 11. stage / viewer / composer 的 actions

- 現在三邊都在放 continue、edit、generate，很容易讓人不知道主按鈕到底在哪。
- 比較好的分工是: 首頁上的下一步由 composer 主導，viewer 裡的動作屬於 viewer，自帶的小操作才留在 stage。
- 這樣每個模式都有自己的主行為，不會互搶。

#### 12. `GlobalLogConsole`、replay、timeline 類區塊

- 這些區塊應該是診斷與回放用途，不是主敘事用途。
- 它們可以告訴你「剛剛發生了什麼」，但不應該負責解釋「這張圖的意義是什麼」。
- 否則它又會和 history、sidebar 的脈絡說明打架。

#### 中文版總結

- 主舞台要負責看現在。
- composer 要負責做下一步。
- sidebar 要負責講這一步怎麼來。
- viewer 要負責深看。
- history strip 要負責快找最近幾步。
- sheet 要負責收納二線功能。

如果 A1 有做到這個分工，版面就會先變清楚很多，之後再做視覺美化才不會只是把混亂畫得更漂亮。

### 依照最新 6 點意圖重整的新 shell 提案

這一段是把你最近那 6 個產品判斷，直接翻成可以實作的 shell 方案。

#### 六個產品判斷

1. 頂部不該只是舊按鈕容器，而要是一個真正的工作區頂欄。
2. model / size / qty 這排不該自成一個強視覺區，而應該收斂成「目前這一步的狀態摘要」。
3. references 不該混在主決策列裡，應該退成工具抽屜或工具面板的一部分。
4. 重複的 history 入口要減量，主畫面只保留一個快速回想層，其餘改成展開瀏覽層。
5. top system log 應該更像回覆與狀態敘事區，而不是只是 telemetry 小窗。
6. 全頁應該清楚分成: 上方看系統回覆與 thinking，下方做 prompt 與下一步，工具集中收納，provenance 壓成摘要後再展開。

#### 新 shell 結構

桌面版預設分成四段，不再讓 header、status、history、composer 互相搶角色。

1. top response rail
    - 放在最上方，但不是傳統 navbar。
    - 內容是目前 turn 的系統回覆、visible thinking、生成狀態、錯誤、restore/import/replay 類提醒入口。
    - `GlobalLogConsole` 在這裡升格成 response rail 的核心，而不是一個附屬小膠囊。
2. workspace command bar
    - 放產品名稱、model label、theme、language、少量真的高頻的全域入口。
    - 不再承載完整 size / qty / references / advanced settings 排列。
3. main workspace row
    - 左側是 stage 與短摘要。
    - 右側是 context rail，只講 branch / lineage / source / provenance 摘要。
    - tools 不直接分散在 header 與 sidebar，而是收進一致的 picker/tool drawer。
4. bottom action zone
    - composer 成為唯一明確的下一步入口。
    - prompt、generate、follow-up、queue 都集中在這裡。

#### 每個區塊負責什麼

1. top response rail 回答: 系統剛剛做了什麼，現在回了什麼，有沒有 visible thinking。
2. workspace command bar 回答: 我現在在哪個工作模式，用哪個模型，還有哪些全域切換。
3. main stage 回答: 現在這張結果是什麼。
4. context rail 回答: 這張結果怎麼來的。
5. history strip 回答: 最近幾步是什麼。
6. bottom composer 回答: 我下一步要做什麼。

#### A1 wave: desktop shell reallocation

目標不是先做漂亮，而是先把責任切乾淨。

1. 把 `GlobalLogConsole` 改造成 top response rail
    - 顯示最近一段 result text、visible thoughts、pending status、error/restore/import session feedback。
    - 不再只用一顆小 console 膠囊承載。
2. 把 `WorkspaceTopHeader` 收斂成 command bar
    - 保留產品名、model、theme、language、必要全域入口。
    - 移除 size、qty、references 這些次級設定的常駐高權重呈現。
3. 把 model / ratio / size / qty / references 拆成兩層
    - model 留在 command bar，但顯示成狀態標籤而不是控制列中心。
    - ratio / size / qty / references 退到 composer 上方的小型 status-and-tools row 或 picker drawer。
4. 把主畫面的 history 降成單一 quick strip
    - `RecentHistoryFilmstrip` 保留為唯一常駐 history 入口。
    - `WorkspacePickerSheet` 的 gallery/history 成為展開瀏覽，不再和 filmstrip 競爭同等存在感。
5. 把 provenance 壓縮成 stage 鄰近摘要 + right rail 展開脈絡
    - stage 旁只留一段很短的 provenance summary。
    - 詳細 provenance 仍留在 sidebar/viewer，不回到 top rail。
6. composer 成為唯一明確 next action owner
    - continue / edit / regenerate 的首頁主決策由 composer 主導。
    - stage 與 viewer 只留局部上下文操作。

#### A2 wave: response-first shell completion

這一波才真正把你要的「上面看回覆，下面做 prompt」完成。

1. top response rail 改為多狀態敘事區
    - idle: 顯示最近一次 result summary 或 restore summary。
    - generating: 顯示進度、thinking state、queued/imported job status。
    - completed: 顯示 result text、visible thought text、source summary。
2. bottom composer 固定成 conversation/action floor
    - 行動按鈕、prompt、follow-up、queue 集中在底部。
    - 手機版也維持 composer 比 history 更早出現。
3. tool drawer 正式整併
    - references、templates、ratio、size、batch、styles 都走一套工具抽屜模型。
    - 不再讓 references 在 header、sidebar、sheet 三處同時有主位。
4. provenance 變成摘要 -> 展開模型
    - top rail 只顯示一句 source/result summary。
    - stage 旁顯示短 provenance note。
    - 深入內容只在 sidebar 或 viewer 展開。
5. mobile shell 改成真正的 response-first order
    - top response rail
    - stage
    - composer
    - recent history
    - collapsible context

#### A1 / A2 的檔案落點

1. A1 主檔
    - `App.tsx`
    - `components/WorkspaceTopHeader.tsx`
    - `components/GlobalLogConsole.tsx`
    - `components/RecentHistoryFilmstrip.tsx`
    - `components/WorkspaceInsightsSidebar.tsx`
    - `components/ComposerSettingsPanel.tsx`
2. A2 主檔
    - `App.tsx`
    - `components/GlobalLogConsole.tsx`
    - `components/WorkspacePickerSheet.tsx`
    - `components/WorkspaceViewerOverlay.tsx`
    - `components/ComposerSettingsPanel.tsx`
    - `hooks/useWorkspaceTopHeaderProps.ts`
    - `hooks/useWorkspacePickerSheetProps.ts`

#### 這份提案和目前已落地部分的差異

已經做掉的，是 header 降噪、history strip 降噪、desktop/mobile shell 分帶、overlay family 統一。

還沒做掉的，是你這次點得最準的兩件事:

1. `GlobalLogConsole` 還沒有真正升格成 top response rail。
2. top command bar 和 bottom composer 之間，還沒有把 status / tools / references 的責任切到你要的那麼乾淨。

### UI Pass 2: Visual polish and motion

Best time:

- After Package C is stable enough that queue/editor/composer surfaces are not still being rearranged.
- Before Package D and Package E are finalized, so translation overflow and regression coverage can still catch polish regressions.

This pass should include:

- typography direction
- spacing rhythm
- color system and contrast cleanup
- shadows, borders, glass, gradients, and backgrounds
- animation and transition polish
- empty/loading/error visual consistency

This pass should avoid:

- changing semantic ownership or workflow behavior
- re-opening already-reviewed state or persistence logic

Concrete polish targets:

- establish a stronger typography voice than the current default utility-stack feel
- align cards, panels, and overlays to one visual depth system
- give loading, empty, and restore states a deliberate aesthetic instead of fallback-box styling
- add a small number of meaningful entrance and overlay transitions
- improve stage/background atmosphere without reducing readability

## UI Packaging Rule

If a change primarily alters where information sits, how panels compose, or how the shell flows, it belongs with Package A.

If a change primarily alters queued-batch/editor/composer workflow surfaces, it should wait for Package C.

If a change is only visual polish and does not materially change flow, keep it as a dedicated polish slice after A and C rather than mixing it into either review.

## First Concrete Cut: Package B1

If the goal is to produce the first reviewable slice now, do not try to land all of Package B at once.

Use a smaller B1 cut that isolates the state model and persistence contract first.

Include in B1:

- `hooks/useComposerState.ts`
- `hooks/useSelectedResultState.ts`
- `hooks/useWorkspaceAssets.ts`
- `hooks/useWorkspaceCapabilityConstraints.ts`
- `hooks/useWorkspaceLineageSelectors.ts`
- `hooks/useWorkspaceSessionState.ts`
- `hooks/useWorkspaceSnapshotPersistence.ts`
- `hooks/useWorkspaceSurfaceState.ts`
- `types.ts`
- `utils/branchContinuation.ts`
- `utils/canvasWorkspace.ts`
- `utils/conversationState.ts`
- `utils/executionMode.ts`
- `utils/groundingMode.ts`
- `utils/groundingProvenance.ts`
- `utils/lineage.ts`
- `utils/stagedAssets.ts`
- `utils/workflowTimeline.ts`
- `utils/workspacePersistence.ts`
- `utils/workspaceSnapshotState.ts`

Carry with B1 tests that validate those contracts directly:

- `tests/branchContinuation.test.ts`
- `tests/canvasWorkspace.test.ts`
- `tests/capabilityTruth.test.ts`
- `tests/conversationState.test.ts`
- `tests/groundingProvenance.test.ts`
- `tests/officialConversationRequest.test.ts`
- `tests/workspacePersistence.test.ts`
- `tests/workspaceSnapshotState.test.ts`

Defer from the first B1 cut even though they are still conceptually Package B:

- `components/GroundingProvenancePanel.tsx`
- `components/HistoryPanel.tsx`
- `components/WorkspaceImportReview.tsx`
- `components/SketchPad.tsx`
- `hooks/useGroundingProvenancePanelProps.ts`
- `hooks/useGroundingProvenanceView.ts`
- `hooks/useHistoryPresentationHelpers.tsx`
- `hooks/useHistorySourceOrchestration.ts`
- `hooks/useImportedWorkspaceReview.ts`
- `hooks/useProvenanceContinuation.ts`
- `hooks/useWorkspaceAppLifecycle.ts`
- `hooks/useWorkspaceBranchPresentation.ts`
- `hooks/useWorkspaceGenerationActions.ts`
- `hooks/useWorkspaceResetActions.ts`
- `hooks/useWorkspaceSnapshotActions.ts`

Reason for the defer list:

- They are semantic Package B files, but they cross heavily into Package A rendering or Package C editor/request orchestration.
- Landing them in B1 would make the first slice much noisier without improving the core persistence review.

## B1 Seam Handling

For the first concrete cut, treat these files as deferred seams instead of forcing them into B1:

- `App.tsx`: leave for Package A because it is the top-level assembly seam.
- `hooks/useWorkspaceEditorActions.ts`: leave for Package C unless the editor handoff is intentionally being reviewed together with state storage.
- `hooks/useWorkspaceSnapshotActions.ts`: keep deferred unless the review explicitly wants import/export UI behavior in the same slice as persistence internals.
- `components/GeneratedImage.tsx`: do not pull into B1 unless the change is specifically about provenance semantics rather than stage presentation.
- `components/HistoryPanel.tsx`: keep out of B1 unless the review is specifically about continue/branch/source labeling behavior.

## B1 Review Goal

The B1 review should answer a narrow question:

Can the workspace state, branch lineage, conversation restoration, provenance bookkeeping, queued-job persistence, and snapshot import/export contracts stand on their own before the shell and queue UI are reviewed?

If the answer is yes, then Package A and Package C become much easier to review as orchestration layers instead of mixed logic buckets.

## Practical Rule

If a file is hard to classify, prefer the package that owns the behavior being validated rather than the package that merely renders it.
