# Nano Banana Ultra Implementation Master Spec

## Purpose

This document is the execution-ready implementation guide for App-Nano_Banana_Ultra.

This file is the project-level source of truth for:

1. Product rules that must not drift between UI, request assembly, validation, and documentation.
2. Execution modes and the boundaries between them.
3. Required implementation order.
4. Verification gates for declaring a phase complete.
5. Deferred scope that must not be mixed into the current wave without updating this document first.

For the latest product-level status summary, shell-layout decisions, and the response-first history-workspace concept, see `PRODUCT_SHELL_DECISIONS.md`. That file is now the single consolidated product-facing summary for current completion status, spatial ownership model, included/excluded scope, and the latest confirmed UI decisions beyond execution-only tasks.

## Current Baseline

The current build already provides a substantial rebuilt shell and must be treated as the baseline rather than reworked from scratch.

Implemented baseline:

1. Center-stage shell replacing the legacy sidebar-driven layout.
2. Capability-aware advanced settings and richer request/response contracts.
3. History-first workspace with viewer, gallery, lineage, branch actions, and workflow timeline.
4. Unified staged-asset intake across references, sketch output, editor base images, reopened history, and stage-source semantics.
5. Workspace snapshot restore, export, import, merge, replace, and replay flows.
6. Restore/import/replay workflow logs now support render-time localization through semantic log encoding with backward-compatible fallback for legacy plain-English snapshot logs, so replay, insights timeline, and global log surfaces follow the active UI language without breaking older saved workspaces.
7. Session continuity and initial provenance continuity, including inherited/live provenance indicators.
8. Shared canvas primitives for SketchPad and ImageEditor.
9. The main shell closure baseline now includes a true top response rail, a center history canvas with `Recent Turns` absorbed as a recent lane, a side-owned image tool panel, and compact summary-first insights/context surfaces rather than a large always-open right-rail dashboard.
10. The canonical-action cleanup baseline now includes side-tool ownership for references and editor entry points, with duplicate direct actions already removed from the composer and downgraded to summary-only treatment in the top header.

Known major gaps still open:

1. Recent shell cleanup extracted the remaining mixed state/effect clusters out of `App.tsx`; the root shell still owns dense orchestration and panel-prop composition, but the remaining load is now closer to a practical composition stop point than to another clearly separable state owner.
2. Newly extracted workspace shell surfaces are more consistently wired into the translation layer than before, including top-level panel eyebrow chrome, shared surface controls, stage-viewer affordances, and selector fallback labels. The restore/import/replay browser-path stream is now explicitly validated across all 9 supported UI languages (`en`, `zh_TW`, `zh_CN`, `ja`, `ko`, `es`, `fr`, `de`, `ru`), but broader shell-wide parity outside that verified stream still remains an open closure item.
3. Provenance drill-down, compare, and composer-reuse depth is now implemented on top of the continuity data model; the remaining open work is locale-safe polish and any later advanced-path extensions rather than missing core provenance mechanics.
4. Official chat-based multi-turn image editing is implemented through request path, persistence, restore/import recovery, backend chat reconstruction, and regression-backed resume flows; the remaining open work is deeper UX refinement rather than continuation correctness.
5. Official queued Batch API workflow is now implemented as a local-first persisted job flow with submit, poll, cancel, restart recovery, result import, auto-refresh, queue summaries, per-job timeline display, staged/editor editing-input support, and localized queue surface messaging; remaining open work is optional UX depth rather than execution correctness.
6. Shell closure work is no longer about moving major regions into place; the remaining shell risk is duplicate direct actions or owner-surface drift on viewer and other secondary surfaces that can silently violate the canonical-action rule.
7. The 2026-03-24 bounded shell-ownership slice is now implemented: the top rail now behaves as one `Model Output` family, workflow summary now belongs to the unified right-side context system, the old center provenance support card is gone, and the side-tool owner now reads as a lighter stage-adjacent actions bar.
8. A further 2026-03-24 follow-up is also now implemented inside that same shell model: workflow timeline/system-log detail is a first-class `Context Rail` card rather than a lower standalone family, and the duplicate `Live Timeline` eyebrow/frame has been removed.
9. The active post-cleanup mainline is no longer to land that shell slice itself, but to keep its ownership model stable while tightening viewer/secondary-surface wording, broader shell parity, and regression coverage around the new `test:e2e:restore:mainline-smoke` and `test:e2e:restore:regression` entrypoints.

### Workflow Log Localization Rules

The following workflow-log rules are mandatory unless this file is updated first.

1. User-facing workflow logs must be stored as semantic messages when emitted by current code paths.
   Do not persist newly generated replay/import/history-source messages as already-rendered locale text when a translation-key-based message can be stored instead.
2. Workflow log bodies must be localized at render time.
   Replay dialogs, workflow timelines, and global log surfaces must resolve the active UI language when displaying stored workflow log entries.
3. Legacy plain-string logs remain supported.
   Imported or restored snapshots that still contain historical English workflow strings must continue to classify and display correctly through compatibility decoding rather than hard failure or silent omission.
4. Current-stage-source detection must not depend on one frozen rendered locale.
   Source-turn matching logic must inspect semantic message payloads or localized render output so replay/source actions stay available after language switches.

## Product Rules

The following rules are mandatory unless this file is updated first.

1. The product is local-first.
   The app may call Gemini cloud APIs, but the product must not assume an always-on custom backend.
2. This document is the implementation source of truth.
   If code, UI, README, and this file disagree, the implementation must be aligned back to this file.
3. Capability truth must be corrected before larger workflow expansion.
   No new mode or UI layer should be built on an incorrect capability matrix.
4. The rebuilt shell must remain intact.
   Do not reintroduce a legacy sidebar architecture to add new workflows.
5. The product must not default all image generation into chat-based multi-turn semantics.
   Exploration, variant search, continuation editing, and queued large jobs are different user intents and must remain separate.
6. A conversation branch may have only one active continuation source image at a time.
7. Interactive batch variants and queued batch jobs are separate execution modes.
   One must not be presented as a disguised version of the other.
8. Model-specific capabilities must be strictly gated.
   Do not expose advanced controls for unsupported models.

## Capability Rules

### Model defaults

1. Default image model: `gemini-3.1-flash-image-preview`.
2. High-quality alternative: `gemini-3-pro-image-preview`.
3. Legacy lower-latency path: `gemini-2.5-flash-image`.

### Must-match capability rules

1. `Output format` is shown only when the selected model supports multiple response modalities.
2. `Temperature` is shown only in advanced settings and defaults to `1.0`.
3. `Thinking level` is shown only for `gemini-3.1-flash-image-preview`.
4. `Grounding with Google Search` is shown only for models that support standard Google Search grounding.
5. `Image search` is shown only for models that support grounded image search, currently `gemini-3.1-flash-image-preview`.
6. Controls hidden due to model capability must reset to safe defaults.
7. `gemini-3-pro-image-preview` must be treated as supporting standard Google Search grounding.
8. `Output format` must expose both `images-and-text` and `images-only` for all three image models.
9. `Return thoughts` is not a manual toggle for Gemini 3 image models; if the model supports thought summaries, the app forces them on.
10. `gemini-3.1-flash-image-preview` image search must not be hard-coupled to web search in the product layer.

### Runtime-validated notes

The following capability expectations are the product truth and should be preserved:

1. `gemini-3.1-flash-image-preview`, `gemini-3-pro-image-preview`, and `gemini-2.5-flash-image` accept `images-and-text`.
2. Only `gemini-3.1-flash-image-preview` exposes configurable `thinkingLevel` in the current product path.
3. `gemini-3.1-flash-image-preview` accepts `thinkingLevel: minimal` and `thinkingLevel: high` through the current request path.
4. `includeThoughts: true` is accepted and preserved in metadata and session hints for supported Gemini 3 image models.
5. `thinkingLevel: minimal` may return a hidden thought signature without visible thought text, so the UI must tolerate an empty visible-thinking block.
6. `thinkingLevel: high` is the mode that may return visible thought text together with a thought signature.
7. `gemini-3-pro-image-preview` may still preserve thought-summary metadata via `includeThoughts`, but it does not expose user-selectable `thinkingLevel` in the current product path.
8. Standard Google Search grounding returns usable source and query metadata through the current app path.
9. Google Image Search grounding returns image-search queries, grounding metadata, compliant search entry point content, and image-source chunks.
10. Image-search attribution in the UI must link to the containing page; preview thumbnails must not bypass that requirement.
11. `images-and-text` does not guarantee visible text output and the UI must tolerate image-only responses.
12. `gemini-3.1-flash-image-preview` may return lower actual image dimensions when Image Search grounding is enabled even if the app preserves `imageSize`. Live validation showed `2K` and `4K` requests returning `1024x1024` under `Image Search` and `Google Search + Image Search`, while `Google Search` only preserved `2048x2048` and `4096x4096`; `gemini-3-pro-image-preview` with standard Google Search also preserved requested `2K` and `4K`.
13. The product must expose requested size and actual output separately rather than assuming client-side downscaling. User-facing status surfaces should use product-size labels such as `1K`, `2K`, and `4K`, while provenance/debug surfaces should preserve exact dimensions such as `1024x1024`, `2048x2048`, and `4096x4096`.

## Execution Modes

The product must use the following execution modes.

### Single-turn Generate

Intent:
One request that does not establish conversation continuity.

Must:

1. Support standard text-to-image and image-conditioned generation.
2. Record the operation in history.
3. Avoid creating a conversation session id by default.

Must not:

1. Implicitly create chat continuation state.
2. Rebrand ordinary one-shot generation as conversation editing.

### Interactive Batch Variants

Intent:
Generate multiple candidate results from the same prompt or settings for exploration.

Must:

1. Preserve one operation id or equivalent grouping id for sibling variants.
2. Present results as candidates rather than as continuation state.
3. Allow the user to promote exactly one result into continuation later.

Must not:

1. Automatically mark all sibling outputs as active continuation sources.
2. Be represented as queued Batch API execution.

### Chat-Based Continue Editing

Intent:
Continue editing from a single, explicitly chosen continuation source using official conversation-native semantics.

Must:

1. Start only after the user selects `Promote Variant`, `Set as Continuation Source`, or an equivalent explicit action.
2. Preserve conversation identity, history linkage, and thought context.
3. Enforce one active continuation source image per branch.
4. Allow branching into multiple child conversations when the user wants multiple edit directions.

Must not:

1. Start automatically for every generated image.
2. Let one conversation branch simultaneously hold multiple active continuation images.

### Queued Batch Job

Intent:
Run large, non-immediate generation workloads through official Batch API semantics.

Must:

1. Persist job id and job metadata locally.
2. Support submit, poll, resume, cancel, and import-result flows.
3. Survive app close and reopen.
4. Remain parallel to, not a replacement for, interactive batch variants.

Must not:

1. Assume a continuously connected custom backend.
2. Replace interactive batch exploration for small immediate jobs.

## Required Implementation Order

The implementation order below is mandatory unless this file is updated first.

### Phase 1: Correct capability truth

Status:

Completed in the current workspace build.

Must:

1. Align frontend capability matrix, backend validation, and this spec.
2. Correct `gemini-3-pro-image-preview` standard Google Search support.
3. Preserve model-specific gating for unsupported output formats and advanced settings.

Done when:

1. UI visibility, request validation, and documentation agree for the current supported models.

Completion note:

1. The current workspace build centralizes capability truth in `utils/modelCapabilities.ts`, with frontend constants and backend plugin validation both consuming the shared definitions.
2. Focused regression coverage now protects the shared capability matrix, output-format truth, Google Search support for `gemini-3-pro-image-preview`, thought-summary gating, and explicit grounding-mode derivation.

### Phase 2: Split search modes into explicit request semantics

Status:

Completed in the current workspace build.

Must:

1. Support `Web only`, `Image only`, and `Web + Image` as distinct request modes.
2. Stop hard-bundling image search under web search in product semantics.
3. Align labels, metadata, and session hints with the chosen search mode.

Done when:

1. Request assembly, response metadata, and UI labels clearly distinguish the three modes.

Completion note:

1. The current workspace build exposes `off`, `google-search`, `image-search`, and `google-search-plus-image-search` as explicit product modes, derives boolean request flags from that mode model, and preserves those semantics through request assembly, metadata, session hints, restore/import state, and provenance presentation.
2. Backend tool assembly now keeps `Image only` separate from `Web only` rather than silently bundling image search under web search semantics.

### Phase 3: Lock execution mode boundaries

Status:

Completed in the current workspace build.

Must:

1. Introduce explicit execution mode state and labels.
2. Prevent accidental drift where all generation becomes chat-based by default.
3. Separate interactive variants from queued jobs and continuation flows.

Done when:

1. The UI has clear entry points for all four execution modes.
2. History and persistence can identify which mode produced each result.

Completion note:

1. The current workspace build persists and presents `single-turn`, `interactive-batch-variants`, `chat-continuation`, and `queued-batch-job` as distinct execution modes across request assembly, history items, restore/import behavior, queue flows, and focused regression coverage.
2. Variant promotion, official conversation continuation, and queued Batch API results now keep separate semantics instead of collapsing into one generic follow-up path.

### Phase 4: Reconcile UI naming and entry points

Must:

1. Keep the current expanded functionality structure.
2. Simplify naming and grouping instead of removing capability entry points.
3. Ensure each entry point maps to one user intent rather than multiple mixed intents.

Status:

In progress.

Current just-completed bounded mainline slice:

1. The top response rail now presents one `Model Output` family rather than separate response/workflow peer cards.
2. Workflow summary ownership now lives in the same right-side context system that already owns source, branch, session, lineage, and timeline context.
3. Workflow timeline/system-log detail now also lives as one first-class context card inside that same rail, so the old lower standalone timeline family and `Live Timeline` eyebrow are gone.
4. The side-tool owner now behaves as a lighter stage-adjacent actions bar while preserving the same tool capabilities.
5. The editor-entry CTA is now state-aware so it reflects whether the user is editing the current stage image, resuming from an editor base, or needs to upload a base image first.

Completion note:

1. The ownership slice above is now backed by component tests, live browser smoke, `test:e2e:restore:mainline-smoke`, and the aggregated `test:e2e:restore:regression` entrypoint.
2. The `Context Rail` baseline is now stricter than the first landing target: `Workflow Log` owns its detail once, inside the main context-card stack, with no duplicate lower timeline frame.
3. The remaining Phase 4 work is follow-up wording, hierarchy, and secondary-surface cleanup rather than the original shell-region move itself.

Done when:

1. Composer and picker terminology are plain-language and no longer ambiguous.

### Phase 5: Finish state ownership restructuring

Status:

In progress in the current workspace build.

Must:

1. Reduce `App.tsx` to orchestration shell responsibilities.
2. Separate generation state, asset state, workspace session/provenance state, conversation session state, and queued job state.

Current implemented slice:

1. History/source orchestration has been extracted into `useHistorySourceOrchestration`, including the mount-order guard needed to avoid reading lineage maps before initialization.
2. Lineage selectors, history presentation helpers, picker-sheet state, provenance continuation promotion/inheritance, viewer state, imported workspace review derivation, surface open/close state, and branch presentation/rename flow have been moved out of `App.tsx` into dedicated hooks/components.
3. Overlay rendering for restore/import/replay/editor/picker/viewer surfaces is centralized in `WorkspaceOverlayStack`, so `App.tsx` now primarily wires data and handlers instead of owning the auxiliary surface tree directly.
4. The latest shell pass moved display-only derivation into `useWorkspaceShellViewModel`, including `viewSettings`, workflow timeline annotation, active sheet title, surface prompt preview, reference counts, z-index classes, and shared-controls auto-close behavior.
5. A follow-up shell pass moved provenance-panel rendering glue and the shared surface/panel loading fallbacks out of `App.tsx`, using `useGroundingProvenancePanelProps`, `SurfaceLoadingFallback`, and `PanelLoadingFallback` to keep render-only assembly out of the shell.
6. Another follow-up shell pass moved the auxiliary `WorkspaceOverlayStack` prop assembly for shared controls, restore/import review, branch rename, and session replay into `useWorkspaceOverlayAuxiliaryProps`, removing a large nested overlay wiring block from `App.tsx`.
7. Another follow-up shell pass moved the `WorkspaceInsightsSidebar` prop assembly into `useWorkspaceInsightsSidebarProps`, reducing sidebar-specific wiring noise in `App.tsx` without changing insights or provenance behavior.
8. Another follow-up shell pass moved the `WorkspacePickerSheet` prop assembly into `useWorkspacePickerSheetProps`, reducing picker-surface wiring noise in `App.tsx` without changing picker behavior.
9. Another follow-up shell pass moved the `ComposerSettingsPanel` prop assembly into `useComposerSettingsPanelProps`, reducing composer-specific wiring noise in `App.tsx` without changing composer, grounding, or generation behavior.
10. Another follow-up shell pass moved the `WorkspaceTopHeader` prop assembly into `useWorkspaceTopHeaderProps`, reducing header and activity-console wiring noise in `App.tsx` without changing header behavior.
11. Another follow-up shell pass moved the `WorkspaceViewerOverlay` prop assembly into `useWorkspaceViewerOverlayProps`, reducing viewer-overlay wiring noise in `App.tsx` without changing viewer behavior.
12. Another follow-up shell pass moved the `GeneratedImage` and `RecentHistoryFilmstrip` prop assembly into `useGeneratedImageStageProps` and `useRecentHistoryFilmstripProps`, reducing main-stage and history-filmstrip wiring noise in `App.tsx` without changing stage or history behavior.
13. Another follow-up shell pass moved queued batch submit/poll/cancel/import plus auto-refresh orchestration into `useQueuedBatchWorkflow`, so `App.tsx` now wires queued-batch behavior instead of owning that lifecycle directly.
14. Another follow-up shell pass moved queued-batch rendering into `QueuedBatchJobsPanel`, keeping queue summary badges, refresh/import actions, and compact job timelines out of the root shell.
15. Another follow-up shell pass upgraded `useComposerSettingsPanelProps`, `useWorkspaceTopHeaderProps`, and `useWorkspaceViewerOverlayProps` from pass-through wrappers into real prop-assembly hooks, further reducing inline object wiring inside `App.tsx`.
16. Another follow-up Phase 5 pass moved cross-domain stage/history reset orchestration into `useWorkspaceResetActions`, so `App.tsx` no longer owns the gallery-clear and stage-clear coordination across history, branch, workspace-session, and picker-surface state.
17. The same reset pass also aligned gallery/history clearing with selected-result ownership, so clearing history now clears stale selected result artifacts instead of leaving sidebar/result panels bound to orphaned selection state.
18. Another follow-up Phase 5 pass moved editor-base, reference-asset, sketchpad, upload-for-edit, and editor-launch orchestration into `useWorkspaceEditorActions`, so `App.tsx` no longer owns that mixed asset/editor/surface action block directly.
19. Another follow-up Phase 5 pass moved capability-constraint normalization and model-driven reference trimming into `useWorkspaceCapabilityConstraints`, so `App.tsx` no longer owns that model-alignment effect directly and the trim notices now flow through the translation layer.
20. Another follow-up Phase 5 pass moved root generation, follow-up generation, and cancel-generation handlers into `useWorkspaceGenerationActions`, so `App.tsx` no longer owns that generation action cluster directly.
21. Another follow-up Phase 5 pass moved workspace snapshot composition and autosave persistence into `useWorkspaceSnapshotPersistence`, so `App.tsx` no longer owns that cross-domain persistence assembly across history, staged assets, queue state, branch state, session state, view state, composer state, and conversation state.
22. Another follow-up Phase 5 pass moved app bootstrap, unload-guard, initial composer/log hydration, and first-reference auto-ratio lifecycle into `useWorkspaceAppLifecycle`, so `App.tsx` no longer owns that startup/lifecycle effect cluster directly.
23. Another follow-up Phase 5 pass moved generation lineage derivation and official conversation request-context assembly into `useWorkspaceGenerationContext`, so `App.tsx` no longer owns that mixed stage/history/conversation request-assembly block directly.
24. Another follow-up Phase 5 pass moved queued-batch mode summary, conversation notice, imported-result grouping, and filmstrip position-label derivation into `useQueuedBatchPresentation`, so `App.tsx` no longer owns that queue-specific presentation logic across composer, queued-job review, and recent-history surfaces.
25. Another follow-up Phase 5 pass moved generated-image selection, viewer navigation, active-viewer derivation, and stage/viewer prop assembly into `useWorkspaceStageViewer`, so `App.tsx` no longer owns that stage/viewer coordination block or the thin wrapper hooks that previously split it across multiple files.
26. Another follow-up Phase 5 pass moved notification state, notification timeout control, API-key connect refresh handling, and enter-to-submit preference persistence into `useWorkspaceShellUtilities`, so `App.tsx` no longer owns that shell-utility block directly and the notification timer now resets cleanly on rapid successive messages.
27. Another follow-up Phase 5 pass moved transient grounding-selection reset, linked-focus cleanup, editor-context snapshot reset, and editor initial-state fallback derivation into `useWorkspaceTransientUiState`, so `App.tsx` no longer owns that local UI-coordination effect cluster directly.
28. Another follow-up Phase 5 pass upgraded `usePromptTools` so it now owns current-language label resolution plus prompt/setter-bound rewrite and inspiration handlers, which removes the remaining prompt-tool wrapper wiring from `App.tsx`.
29. A follow-up audit after the latest prompt-tools extraction confirmed that the remaining `App.tsx` weight is mostly orchestration and panel-prop composition; the next justified work here is only a new extraction when a real shared behavior or cross-surface synchronization owner appears, not further cosmetic shell splitting.
30. The current validated workspace build has reduced `App.tsx` to a thinner orchestration shell, and the current Phase 5 stop point should be treated as practical rather than provisional busywork.
31. A follow-up shell i18n pass moved remaining hard-coded top-level chrome into the translation layer for `App.tsx`, `SurfaceSharedControls`, `GeneratedImage`, and selector fallback labels, with focused regression coverage for the new `en` and `zh_TW` keys while other languages still rely on English fallback for that newest slice.

Done when:

1. Core state boundaries are explicit and cross-surface synchronization no longer depends on one oversized shell component.

### Phase 5A: UI/UX refinement gates for the rebuilt shell

Status:

In progress in the current workspace build.

Purpose:

This phase exists to stop the rebuilt workspace from becoming technically correct but cognitively heavy. The main remaining risks are ambiguity, density, and inconsistent task framing across shell surfaces rather than missing core execution correctness.

Must:

1. Treat the rebuilt shell as one product surface.
   Header, stage, composer, right rail, picker sheets, immersive viewer, restore/import review, replay, and queue surfaces must read as one workflow rather than adjacent subsystems.
2. Keep the main stage visually dominant.
   Context, lineage, provenance, and queue state must support the current turn instead of competing with it.
3. Make continuation semantics obvious.
   Reopen, continue, branch, current source, promoted variant, and restored/imported continuation state must remain visibly distinct.
4. Keep provenance summary-first.
   The first read should expose current grounding/provenance status, requested versus actual output, and current continuity state before deeper attribution drill-down.
5. Reframe queued batch as a task workflow.
   Submit, refresh, import-ready, imported, failed, and open-result actions must read like a job workflow, not a developer diagnostics panel.
6. Keep localization and verification as closure work.
   Wording and browser-level regression coverage should lock already-stabilized behavior rather than substitute for unresolved interaction design.

Verified foundation already present for this phase:

1. Overlay interaction primitives are already centralized through `WorkspaceModalFrame`, `useOverlayEscapeDismiss`, `useOverlayFocusTrap`, and `useOverlayScrollLock`.
2. Branch, continuation, and conversation semantics already have state-layer coverage through lineage, branch continuation, workspace snapshot, and conversation tests.
3. Provenance empty-state and attribution detail rendering already have targeted component and hook tests.
4. Queued batch submit/poll/cancel/import and imported-result preview flows already have targeted hook and panel tests.
5. Restore/import/replay localization and snapshot recovery already have regression coverage and a Playwright entry point.
6. The top response rail is now the real owner surface for response text, thought summary, and top-level workflow/queue summary rather than an aspirational shell note.
7. The center history canvas now owns `Recent Turns` through the recent lane, so recent-turn open / continue / branch no longer live in a detached bottom strip.
8. The side tool panel now owns references, upload-base, SketchPad, and editor launch; duplicate reference/editor buttons have already been removed from the composer and top header.
9. The insights sidebar now follows a summary-first compact model: stage source, active branch, and continuity stay visible while session stack, lineage map, workflow history, and session hints collapse behind disclosures.
10. `GroundingProvenancePanel` now applies the same summary-first rule inside the citation-detail drill-down itself: provenance source, citation shell, reuse preview, source/bundle status cards, compare lists, and selected-bundle segment text all collapse behind disclosures while preserving the existing action/test hooks used by restore and provenance regression coverage.
11. A follow-up shell-polish pass extended that same summary-first rule across secondary entry surfaces: top-rail thoughts, import-review branch and direct-replace previews, restore-notice fallback recovery copy, branch-rename automatic-label restore guidance, recent-history filmstrip guidance, side-tool explanatory blocks, viewer-overlay thoughts/session hints plus top-level inspect guidance, picker-sheet reference helper cards, composer guidance cards, shared-controls prompt preview, and queued imported-result plus queue-header guidance now keep their primary actions visible while moving lower-priority narrative and preview detail behind disclosures.

Current implemented slice:

1. The top rail, center history canvas, bottom composer, and side tool panel now read as four explicit shell regions instead of one large blended stage-plus-sidebar surface.
2. Canonical-action cleanup is already partially enforced: references and editor launch now have one owner surface, with secondary surfaces reduced to summaries rather than second execution buttons.
3. Large context surfaces have already completed one closure pass into compact summaries and collapsible details, which reduced dashboard-style visual competition against the center workspace.
4. The current remaining Phase 5A focus is secondary-surface cleanup and polish, not another foundational layout rewrite.
5. The current provenance-detail cleanup baseline is no longer a single always-open metadata block; it is a stack of compact disclosures that expose the active citation summary first and only expand into compare/reuse/source inspection when the user asks for it.

Approved next closure target, not yet implemented:

1. Reframe the top response family as a true `Model Output` surface where response text, structured output, and thoughts belong to one owner, with thoughts demoted to a secondary disclosure instead of a peer card.
2. Treat workflow as part of one broader context family rather than a second parallel dashboard: keep only a slim workflow summary in the top strip on the first pass, and move full workflow/source/provenance/session detail under one `Context Rail` owner.
3. Remove the center provenance support card from the main stage composition once the new `Context Rail` is in place.
4. Keep the center as the dominant `Stage Workspace` with the recent lane and selected-result focus state, rather than letting provenance/detail panels keep reclaiming stage-adjacent area.
5. Keep tool ownership intact but reduce the side-tool surface into a stage-adjacent actions bar with state-aware editor-entry wording rather than a permanently heavy parallel panel.
6. Update the project docs and smoke checklist in the same handoff wave as the code so the old split-shell description does not survive as a second source of truth.
7. Include a shell-level theme/color-token cleanup in the same slice: the current mixed bright/dark surface language should be normalized through shared shell tokens so header, output strip, stage, context rail, and composer read as one coherent hierarchy in both themes.
8. Treat the current `Open Editor` label as a UX bug, not just copy drift: preserve the existing fallback logic in `useWorkspaceEditorActions.ts`, but change the visible CTA family to state-aware labels that distinguish editing the current image, continuing from an existing editor base, and uploading a base image to start editing.

Done when:

1. A user can identify current stage, active branch, current continuation source, and next primary action without opening multiple overlays.
2. Restore/import/history/replay surfaces use the same continuation vocabulary and CTA hierarchy.
3. Provenance and insights default to a fast summary read while preserving deeper inspection paths.
4. Queued jobs clearly expose which jobs are active, which are ready to import, which have already been imported, and what action should happen next.
5. Remaining localization and browser-path tests validate stabilized flows rather than still-moving UI structure.

### Phase 6: Implement variant promotion rules

Status:

Completed in the current workspace build.

Must:

1. Add explicit `Promote Variant` or `Set as Continuation Source` behavior.
2. Keep sibling variants as exploration outputs until one is promoted.
3. Create child branches for divergent continuation paths.

Done when:

1. Variants, promoted sources, and child conversations have distinct persistent semantics.
2. Restore, import review, history, and sidebar surfaces all expose the same promotion-aware labels and badges.
3. Regression coverage proves variants are not auto-promoted and each branch keeps exactly one active source.

### Phase 7: Implement true chat-based continuation

Status:

Completed in the current workspace build.

Must:

1. Use official conversation-native request semantics.
2. Preserve conversation context rather than only local lineage labels.
3. Keep one active continuation source per branch.

Current implemented slice:

1. Official chat-continuation request assembly is wired through the frontend and plugin path.
2. Branch-scoped conversation identity, turn linkage, and active source metadata are persisted in workspace snapshots and restored session state.
3. The insights sidebar exposes official conversation identity, branch linkage, active source, and turn count.
4. Focused regression coverage exists for conversation utilities, persistence, snapshot restore behavior, and restored-conversation request payload reuse.
5. Backend integration coverage proves restored official conversation requests are reconstructed into official chat history and dispatched through the plugin chat route.
6. Targeted Playwright coverage proves imported official conversation state can be rehydrated into the sidebar continuity UI and reused through both direct import-review continuation and restore-notice continuation actions.
7. Full Playwright validation now covers restore, reopen, import, provenance/source surfaces, and history-driven continuation flows without regressing Phase 6 promotion semantics; the full `e2e/workspace-restore.spec.ts` suite is green again after stabilizing duplicate-locator assertions and shared overlay interactions.
8. Restore-notice `Open latest turn` behavior must dismiss the restore notice immediately after selecting the latest restorable turn, matching the other restore actions so later timeline/global-log/source interactions are never blocked by a stale modal overlay.
9. Restored conversation records now normalize missing active-source turn ids during snapshot sanitization and later turn recording, preventing stale snapshots from dropping the seeded continuation turn when the next official chat turn succeeds.
10. Hook-level request coverage now also proves a continuation request leaves `usePerformGeneration` with `executionMode: chat-continuation`, the expected `conversationContext`, and persisted returned conversation metadata on the newly created history turn.
11. App-level jsdom integration coverage now proves the real restored-workspace flow can continue from the restore notice, send the official conversation payload through `/api/images/generate`, and persist the next conversation turn back into local snapshot state.
12. The current focused execution proof for official conversation continuity is green across targeted Vitest, targeted Playwright, and live browser validation of the import-review `Replace + Continue latest turn` path, so the remaining work is UX/documentation polish rather than execution-path uncertainty.
13. Browser-level Playwright coverage now also captures the actual `/api/images/generate` request body after both import-review continuation and restore-notice continuation, proving those UI entry points dispatch `executionMode: chat-continuation` with the expected restored `conversationContext` rather than only rehydrating continuity chrome.
14. The restore/import Playwright helper now neutralizes shared-backup rehydration when a test needs a genuinely blank workspace, provenance/variant assertions are aligned with the current compact sidebar/panel UI, and the full `e2e/workspace-restore.spec.ts` suite is green at 70 passed.

Done when:

1. Continuation turns can be resumed as true conversations rather than only staged follow-up requests.
2. Restore, reopen, import, and history-driven continuation flows consistently rehydrate and reuse official conversation state.
3. Regression coverage proves official conversation continuity survives those resume paths without regressing Phase 6 promotion semantics.

Completion note:

1. The current workspace build satisfies the Phase 7 done criteria with focused request/persistence/backend/App integration tests, stale-snapshot normalization coverage, targeted official-conversation Playwright validation, and a previously revalidated green full restore/import Playwright suite.

### Phase 8: Implement official queued Batch API workflow

Must:

1. Persist jobs locally.
2. Recover jobs after app restart.
3. Import completed results into the existing workspace/history model.

Done when:

1. Submit, poll, resume, cancel, and import are all supported in the local-first product.

Completion note:

1. The current workspace build satisfies the Phase 8 core requirements with persisted queued job state, official backend batch submit/get/cancel/import routes, a dedicated composer entry point, restart-safe local recovery, and focused plugin/persistence regression coverage.
2. Follow-up polish already landed for auto-refresh of pending/running jobs, `Refresh all`, `Import ready`, queue summary badges, per-job event timelines, and dedicated queue UI/workflow extraction out of `App.tsx`.
3. Queued batch submission now supports staged follow-up and editor-based image-conditioned requests by carrying a distinct editing input alongside regular object/character references while still keeping official conversation-native continuation out of the Batch API path.
4. Queue helper text, queued job badges/actions/timelines, queue state labels, and shared lineage/stage-origin labels are now localized across the supported language set, and queued job lineage display now uses human-readable labels instead of raw internal keys.
5. Branch rename dialog, restore notice, top header control labels, `WorkspacePickerSheet`, `WorkspaceImportReview`, `SessionReplayDialog`, snapshot import/export notifications, history-source toasts/logs, provenance continuity messaging, and the remaining stage-source badges/actions are now routed through the translation layer; the restore Playwright spec also uses locale-aware helpers for these surfaces.
6. A follow-up localization pass now routes the visible `ComposerSettingsPanel` toolbar and advanced-settings copy through the translation layer for `en`, `zh_TW`, and `zh_CN`, removing one of the largest remaining English-only shell surfaces while keeping fallback behavior intact for the other supported locales.
7. A later composer-shell localization follow-up now also routes the action-card eyebrow/title/description and the advanced-settings eyebrow through the translation layer across all supported locales, and the generating-state cancel CTA reuses the shared localized cancel label instead of a hardcoded English literal.
8. Another localization pass now routes the `RecentHistoryFilmstrip` title, description, summary badge, empty state, and action/badge fallbacks through the translation layer for `en`, `zh_TW`, and `zh_CN`, removing another high-visibility English-only shell surface without altering history behavior.
9. Another Package D pass cleans up the `zh_TW` and `zh_CN` copy for filmstrip, insights, provenance, import-review, session-replay, and viewer surfaces and adds locale-safe Playwright assertions for filmstrip stage-source flows plus restore/import/replay/viewer chrome, with focused `zh_TW` and `zh_CN` validation reducing remaining mixed-language regressions on these secondary shell panels.
10. A follow-up Package D polish pass fixes remaining mixed-language provenance/support-bundle copy in `en`, `zh_TW`, and `zh_CN`, so the provenance panel no longer falls back to English or mismatched Chinese phrasing on support-bundle and reuse-preview surfaces.
11. A follow-up provenance polish pass routes workspace session-continuity chips through the translation layer instead of emitting hard-coded English from `useGroundingProvenanceView`, fills the new continuity-signal keys across every supported language, and adds focused Vitest coverage for both the derived chip labels and translation completeness.
12. A follow-up provenance CTA polish pass removes duplicated `Inspect source` and `Inspect bundle` buttons from the compare/detail rows in `GroundingProvenancePanel`, keeping a single canonical inspect action per related item while preserving the existing restore-based provenance smoke path through updated selectors.
13. A follow-up provenance summary-first polish pass now surfaces grounding status, grounding-support status, and search-entry-point status directly in the panel's top-level summary paths, including compact source-only and empty-summary states, so users do not need to enter detail drill-down just to confirm the current grounding outcome; the restore-based live provenance Playwright smoke now also asserts those summary rows in the browser UI.
14. The expanded global log console now renders through a fixed portal instead of a header-local absolute layer, eliminating a real restore-flow regression where the main stage image intercepted pointer events and blocked the global-log current-source continue/branch actions in Playwright and real usage.
15. The current working tree should now be treated as a multi-package refactor wave rather than a single review unit; the active packaging plan is documented in `Current Working Tree Packaging Plan` below and must be consulted before staging or committing this wave.
16. Queue-panel regression coverage now includes stable `QueuedBatchJobsPanel` selectors, focused SSR coverage for queue counts/states/timelines/actions, and a restore-based localized Playwright smoke that validates the queue surface in `en`, `zh_TW`, and `zh_CN`.
17. Queue workflow regression coverage now also protects the `useQueuedBatchWorkflow` import path in focused jsdom-backed Vitest, covering single-job import and aggregate `Import ready` behavior so completed Batch API jobs keep flowing back into workspace history.
18. The restore-based Playwright suite no longer carries the known shared-controls wording drift: the editor/sketch shared-controls expectations now match the product labels `Ultra Editor` and `Sketch Pad`, and `e2e/workspace-restore.spec.ts` runs green end-to-end again.
19. Queue workflow regression coverage now also protects `poll` and `cancel` transitions in focused jsdom-backed Vitest, covering silent auto-refresh promotion into `ready to import` state, cancellation feedback, manual poll/cancel failure handling, and the `Refresh all` no-running edge so queued job lifecycle updates remain localized and state-correct across both success and failure branches.
20. Imported queued jobs now expose a direct `Open` action on the queue panel that reselects the first matching imported history result by queued job lineage, closing the UX gap between `Imported` status and actually getting back to the landed workspace result; the restore-based queue Playwright smoke now exercises that browser path through stage selection and viewer prompt verification.
21. Imported queued results are now labeled as queued batch outputs across history-related surfaces instead of being misclassified as generic `Candidate` variants, preserving the boundary between interactive batch exploration and official queued Batch API results in the visible UX.
22. Prettier is now formalized as repo-backed formatting policy: the project commits `prettier.config.mjs` and `.prettierignore`, VS Code project settings bind TS/TSX and related files to `esbenp.prettier-vscode`, `Projects.code-workspace` provides workspace-level fallback defaults for `javascript` and `jsonc`, and `package.json` exposes `format` plus `format:check` so formatting rules are no longer treated as workspace-only preference.
23. Formatter-prompt cleanup is now part of the verified editor baseline: `App-Nano_Banana_Ultra/.vscode/settings.json` was repaired from two concatenated JSON objects into one valid settings object, which removed the recent VS Code default-formatter ambiguity prompts for project-backed JavaScript and JSON-with-comments files.
24. Current formatting debt must be handled as staged cleanup work, not a one-shot repo-wide rewrite: the latest `format:check` surfaced broad pre-existing drift across the working tree, so follow-up formatting should be batched by ownership boundary and validated per batch to avoid burying product changes inside noise.
25. The restore-based queue Playwright fixture now stubs `/api/batches/get` for its seeded fake queued jobs, keeping auto-refresh coverage intact while eliminating expected startup noise from invalid fixture job ids.
26. Imported queued results from the same queued batch now surface sibling position cues like `#1/2` across stage-source/history/filmstrip presentation, making it clearer when the user is looking at one member of a larger imported batch rather than a standalone turn.
27. The restore-based queued batch Playwright smoke now verifies those queued-batch sibling cues and non-`Candidate` semantics across the reopened stage source, recent-history filmstrip, and full gallery surfaces instead of only checking the stage-source card.
28. Imported queued jobs in the queue panel now show a compact imported-result count cue such as `2x`, using existing queued-job lineage to reflect how many history results were actually imported for that official batch before the user opens it.
29. Imported queued jobs with multiple restored results now split their queue-panel actions into an explicit first-result `Open #1/2` path and a latest-result `Open latest #2/2` path, so the user can jump directly to either edge of the imported batch without opening the gallery first.
30. Imported queued jobs now also render clickable preview thumbnails for each imported sibling result inside the queue panel itself, so users can preview the batch composition and reopen a specific imported sibling directly from the queue surface without switching to the gallery/history sheet.
31. Those queue-panel imported-result previews now visually mark the active stage-source sibling and surface a short prompt/result cue under each thumbnail, making it easier to distinguish siblings directly inside the queue panel before reopening them.
32. Those imported-result previews now also default to a compact disclosure shell that keeps the imported count, active cue, and sibling-switch controls visible in the summary row, while the full preview rail and prompt/result detail expand only on demand.
33. Queue-panel imported-result previews now support inline previous/next sibling controls plus full-cue hover metadata, so users can cycle the active imported sibling from the queue surface itself and still inspect the full prompt/result cue even when the visible preview text is truncated.
34. The queue-panel preview rail now degrades into a horizontal snap-scrolling strip on narrow widths, and the active imported-preview detail block is split into localized Result Text and Prompt sections so the currently selected sibling exposes both cues without sending the user into the viewer.
35. The restore/import/replay Playwright hardening pass now treats duplicated shared surfaces as expected UI topology rather than test uniqueness guarantees: restore assertions scope duplicated cards/actions with stable selectors, branch-rename modal actions bypass backdrop interception safely, filmstrip assertions match the current visible action set, and the full restore spec is green at 70 passed.
36. The latest shell-polish wave now also keeps viewer secondary inspect copy, picker-sheet references helper cards, composer grounding/queue guidance cards, and shared-controls prompt preview summary-first, extending the same closure rule deeper into secondary surfaces without changing primary action ownership.
37. The next summary-first cleanup pass now also keeps BranchRenameDialog automatic-label restore guidance and the picker-sheet character helper copy behind disclosure shells, so those secondary reset / intake hints no longer stay always open while the rename field, references counts, and owner actions remain directly visible.
38. The latest secondary-surface cleanup pass now also keeps queued-batch header guidance, recent-history filmstrip guidance, and WorkspaceViewerOverlay top-level inspect guidance behind disclosure shells, extending the same summary-first rule to more header-level helper copy without changing queue, filmstrip, or viewer action ownership.
39. SurfaceSharedControls now also keeps its panel-level shared-state guidance behind a disclosure shell, so the active workspace label stays scannable in the summary row while the longer state explanation expands only on demand and the sheet entry points, prompt preview, and owner controls remain directly visible.
40. WorkspaceImportReview and WorkspaceRestoreNotice no longer expose gallery, prompt-history, or references shortcut pills in their modal headers, keeping those restore/import surfaces focused on continuity decisions while returning launcher ownership to the composer and side-tool surfaces.
41. WorkspaceInsightsSidebar now keeps its live-timeline header focused on session replay instead of also exposing gallery and prompt-history launcher buttons, reducing another secondary-surface ownership drift while leaving the timeline, continuity, and branch/source actions intact.
42. RecentHistoryFilmstrip no longer exposes a gallery launcher button in its header, keeping the recent lane focused on recent-turn scan/open/continue/branch behavior while returning gallery launching to its existing owner surfaces.
43. GroundingProvenancePanel now collapses duplicate `Inspect source` and `Inspect bundle` buttons back into the existing card/summary selection path, so provenance compare/detail rows keep a single inspect action per item while the restore-based selectors now target the surviving summary/card hooks instead of duplicate CTA buttons.
44. A formal canonical-action audit now records that the remaining `Current Stage Source` open / continue / branch family is no longer an equivalent low-risk cleanup slice: timeline, session replay, and global log all still expose those actions, and Playwright explicitly treats them as supported interaction paths. The current product decision is to pause direct removals there, keep composer and side-tool owner-surface entries intact, and treat any further source-action consolidation as a coordinated product + e2e change rather than another local CTA-pruning patch.
45. The `Current Stage Source` product-decision draft now locks center history canvas as the canonical owner for direct source open / continue / branch execution. `WorkspaceInsightsSidebar`, `SessionReplayDialog`, and `GlobalLogConsole` are now treated as secondary narrative surfaces that should eventually keep source-active badges, replay/log context, and at most one route back into history ownership instead of preserving a full parallel action triplet. No runtime change is landed yet; this item records the target state for the next coordinated UI + Playwright consolidation slice.
46. The first runtime implementation slice for that `Current Stage Source` owner-convergence plan now lands in `GlobalLogConsole`: the global log keeps the source-active badge and source-entry narrative, but drops its parallel `continue` and `branch` buttons so it only retains a single route back into history ownership. `App.tsx` no longer wires branch/continue handlers into `GlobalLogConsole`, and the restore Playwright coverage now expects only the surviving global-log source-open route while timeline and session replay continue to carry the richer direct actions for now.
47. The second runtime slice now lands in `SessionReplayDialog`: replay keeps the source-active badge, timeline navigation, and the single source-open route back into history ownership, but no longer exposes replay-local `continue` or `branch` execution. `useWorkspaceOverlayAuxiliaryProps.ts` no longer passes those extra handlers into replay, the focused translation snapshot now only depends on the surviving open-route chrome, and restore Playwright coverage now expects replay to mirror global-log ownership rather than preserving a parallel action triplet.
48. The third runtime slice now lands in `WorkspaceInsightsSidebar`: both the live-timeline current-stage-source row and the current-stage-source detail card keep their source-active badges, summary context, and owner-route `open` affordance, but no longer expose sidebar-local `continue` or `branch` execution. `useHistoryPresentationHelpers.tsx` now supports explicit `null` opt-outs so secondary surfaces can suppress inherited continue/branch defaults without changing other history-owner consumers, sidebar SSR coverage now locks out the removed test hooks, and restore Playwright coverage now expects timeline plus stage-source cards to mirror replay/global-log ownership while variant-promotion assertions route through the surviving branch-summary control instead of the removed sidebar source button.
49. A fourth closure slice now narrows the `WorkspaceInsightsSidebar` continuity cards into pure routing summaries: official-conversation and session-continuity cards keep their badges, continuity narrative, and single `open` route, but no longer expose sidebar-local `continue` or `branch` execution. Focused SSR coverage now locks out those duplicate continuity hooks, and restore Playwright coverage now treats the cards as owner-route surfaces while the canonical continuation and branch actions remain on history-owner, restore-notice, import-review, and branch-summary controls.
50. A fifth closure slice now narrows the sidebar lineage map into inspection-first routing: lineage rows still support selecting or opening the underlying turn, but no longer expose sidebar-local `continue` or `branch` execution from each lineage summary card. Focused SSR coverage now locks out the removed lineage-map hooks, and restore Playwright coverage now expects the lineage map to mirror the rest of the compact context rail while canonical continuation and branch execution stay with history-owner surfaces.
51. A sixth closure slice now narrows the sidebar active-branch summary into latest-turn ownership only: the compact branch card still keeps `open latest`, contextual `continue latest`, and rename, but no longer exposes origin-level `open` or `branch` mutation buttons that duplicated center-history routes for the same branch context.
52. A seventh closure slice now aligns history-owner route copy across secondary current-stage-source surfaces: the route-only CTA on replay, global log, and sidebar source/continuity summaries now uses a shared `Open in history` wording instead of mixing source-turn and chat-source phrasing after those surfaces had already converged to single-route ownership.
53. The latest closure cleanup also removes obsolete `workspaceInsights*ChatSource` translation keys that were only used before the continuity cards were narrowed to a single history-owner route. This keeps the translation table aligned with the shipped sidebar surface so future wording work does not inherit dead chat-source CTA variants.
54. A follow-up provenance-owner cleanup now narrows `GroundingProvenancePanel`'s `Provenance Source` card into the same inspection-first contract used by other compact context surfaces: the card keeps the source-active badge, prompt summary, and single history-owner route, but no longer exposes provenance-local `continue` or `branch` execution. Focused SSR coverage now locks out the removed source-action hooks, and restore Playwright coverage now treats the provenance source card as a route-only summary instead of a second mutation surface competing with center history ownership.
55. A follow-up sidebar-owner cleanup now narrows `WorkspaceInsightsSidebar`'s collapsed `sessionTurnStack` cards into the same route-only contract already used by the sidebar's other compact context cards: each stack card keeps the snapshot summary, badges, rename path, and single history-owner route, but no longer exposes sidebar-local `continue` or `branch` execution. Variant-promotion coverage now reflects the surviving owner surfaces directly: the initial promotion stays on the active-branch latest-turn control, while the cross-turn re-promotion step routes through the filmstrip continue control after the sidebar-local session-stack actions were removed. Restore Playwright coverage now locks the session stack to open-only routing instead of keeping a second continuation/branch surface inside the sidebar.
56. A follow-up picker-owner cleanup now narrows `WorkspacePickerSheet`'s gallery tab into the same owner-route contract used by the shell's other secondary history surfaces: the modal gallery still supports selecting a turn and renaming its branch label, but no longer exposes picker-local `continue` or `branch` execution that duplicated the canonical history canvas and filmstrip owner surfaces. Focused SSR coverage now locks the gallery sheet to open-plus-rename actions instead of preserving a second continuation/branch mutation block inside the picker.
57. A final restore-closure pass now removes the remaining locale-fragile restore assertions on shared-controls, restore-notice, export/import error, summary-count, and official-conversation continue paths in `e2e/workspace-restore.spec.ts`, replacing visible-label coupling with translation-backed expectations or stable test ids where appropriate. The same pass also consolidates duplicated shared-controls prompt fixture strings and stabilizes the active-branch quick-switch path by expanding the branch-switch disclosure and scoping the switch target to the active-branch card instead of relying on an unscoped `Main · 1` text match. Validation is now closed across the whole slice: focused shared-controls and active-branch subsets are green, the full restore Playwright spec is green at 53 passed, focused shell/restore Vitest coverage is green, the full Vitest suite is green at 118 passed, and the production build succeeds.
58. A follow-up shell i18n cleanup now localizes the remaining provenance/continuity chip labels that were still falling back to English on non-English locales for the latest insights continuity slice. `zh_TW`, `zh_CN`, `ja`, `ko`, `es`, `fr`, and `ru` now provide explicit values for the live-provenance, thought-signature, grounding-metadata, and grounding-support labels instead of inheriting the English strings, and `tests/workspaceFlowTranslations.test.tsx` now locks that behavior with a non-English no-fallback regression assertion. Focused translation coverage and the full Vitest suite are green after the update.
59. A second bounded shell i18n cleanup now localizes the remaining mixed-language continuity chip text in `utils/translations.ts` for the latest insights slice, covering the source-turn, follow-up, chat-turn-count, inherited-provenance, and grounding-support label family that still mixed English terms into non-English locales. `tests/workspaceFlowTranslations.test.tsx` now extends the non-English no-fallback regression coverage to those continuity chip labels as well, and validation remains green through clean diagnostics, focused translation coverage, and the full Vitest suite at 120 passed.
60. A follow-up bounded shell i18n cleanup now fills the previously missing `groundingProvenance*` summary and inspect labels for non-English locales in `utils/translations.ts`, covering the active-session-turn empty state, output/temperature/thinking/grounding insight labels, summary metadata labels, and the provenance-selection empty-state message that had still been falling back to English outside `en`, `zh_TW`, and `zh_CN`. `tests/workspaceFlowTranslations.test.tsx` now locks both completeness and a fallback-sensitive non-English regression set for those grounding provenance keys, and validation is green through clean diagnostics, focused translation coverage, and the full Vitest suite at 122 passed.
61. A follow-up provenance-translation regression fix now restores the English `groundingProvenanceInsightTemperature` baseline in `utils/translations.ts` after a locale-polish value drifted into the `en` dictionary, while keeping the French locale on the more explicit `Temperature de sortie` wording. `tests/workspaceFlowTranslations.test.tsx` now also locks the full English grounding-provenance summary baseline so future locale cleanups cannot silently overwrite the canonical `en` copy again, and validation remains green through clean diagnostics, focused translation coverage, and the full Vitest suite at 123 passed.
62. A further bounded zh provenance wording cleanup now removes the most obvious mixed-English terms still visible in the `zh_TW` and `zh_CN` grounding-provenance surface, specifically the active-session-turn empty state, `Return thoughts`, `Source turn`, provenance empty-selection helper, and `Follow-up source` labels. `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baseline values for that small set so later locale passes can keep polishing other strings without silently reintroducing these English fragments, and validation remains green through clean diagnostics, focused translation coverage, and the full Vitest suite at 125 passed.
63. A further bounded zh provenance wording pass now removes the remaining mixed-English longform sentence copy still visible in the `zh_TW` and `zh_CN` grounding-provenance surface, including the `thoughts`, `grounding`, support-metadata, session/turn continuity, and provenance-carry-forward strings. `utils/translations.ts` now uses fully Chinese wording for those sentence-level provenance states, and `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` longform baselines for that slice so future locale cleanup cannot silently reintroduce embedded English. Validation remains green through clean diagnostics and the full Vitest suite at 127 passed.
64. A further bounded zh shell wording pass now removes the next adjacent mixed-English slice still visible in `zh_TW` and `zh_CN`, covering workspace snapshot import/export notices, history-source restore wording, current-stage-source empty-state copy, replay-session wording, and grounding-attribution type/query labels. `utils/translations.ts` now replaces residual `snapshot`, `turn`, `stage`, `composer`, `session`, `web`, and `image` fragments in that shell slice with Chinese wording, and `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for those strings. Validation remains green through clean diagnostics and the full Vitest suite at 129 passed.
65. A further bounded zh shell wording pass now removes the next visible mixed-English replay/provenance reuse slice in `zh_TW` and `zh_CN`, covering the replay empty-state `workflow` wording plus the grounding-provenance reuse notices that still referred to the `composer`. `utils/translations.ts` now uses Chinese wording for those replay/provenance strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that small set, and validation remains green through clean diagnostics and the full Vitest suite at 131 passed.
66. A further bounded zh shell wording pass now removes the next visible mixed-English grounding-panel slice in `zh_TW` and `zh_CN`, covering the uncited-source helper, provenance-source label, and grounding-panel empty-state helper that still embedded `grounding metadata`, `support bundle`, `Provenance`, `attribution`, and `composer`. `utils/translations.ts` now uses Chinese wording for those grounding-panel strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 133 passed.
67. A further bounded zh shell wording pass now removes the next visible mixed-English history/stage slice in `zh_TW` and `zh_CN`, covering the history continuation CTA plus the follow-up and editor-base notices that still embedded `turn` and `stage`. `utils/translations.ts` now uses Chinese wording for those history/stage strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 135 passed.
68. A further bounded zh shell wording pass now removes the next visible mixed-English composer-controls slice in `zh_TW` and `zh_CN`, covering the Enter-to-send labels plus the queue-batch action that still embedded `Enter` and `Batch`. `utils/translations.ts` now uses Chinese wording for those composer-control strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 137 passed.
69. A further bounded zh shell wording pass now removes the next visible mixed-English composer-advanced slice in `zh_TW` and `zh_CN`, covering the generation-section helper, default temperature label, and return-thoughts helper that still embedded `thought`, `temp`, `thought summaries`, `provenance`, and `reasoning`. `utils/translations.ts` now uses Chinese wording for those composer-advanced strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 139 passed.
70. A further bounded zh shell wording pass now removes the next visible mixed-English grounding/runtime label slice in `zh_TW` and `zh_CN`, covering the grounding section title, grounding mode label, runtime guide title, and grounded-result status that still embedded `Grounding`, `Runtime`, and `Grounded`. `utils/translations.ts` now uses Chinese wording for those labels, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 141 passed.
71. A further bounded zh shell wording pass now removes the next visible mixed-English grounding-description slice in `zh_TW` and `zh_CN`, covering the grounding section helper, grounding mode helper, image-search warning, runtime guide helper, and image-search upgrade notice that still embedded `request contract`, `grounded`, `grounding`, `image search`, `Images & text`, and `attribution`. `utils/translations.ts` now uses Chinese wording for those grounding-description strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 143 passed.
72. A further bounded zh shell wording pass now removes the next visible mixed-English grounding-guide sentence slice in `zh_TW` and `zh_CN`, covering the three guide sentences that still embedded `Google Search` and `Image Search` labels. `utils/translations.ts` now uses Chinese wording for those guide sentences, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 145 passed.
73. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch explainer slice in `zh_TW` and `zh_CN`, covering the four queue-batch mode descriptions plus the queued-batch conversation notice that still embedded `Queue Batch Job`, `stage`, `follow-up`, `batch`, `queued batch jobs`, `lineage`, and `chat continuation`. `utils/translations.ts` now uses Chinese wording for those queued-batch explainer strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 147 passed.
74. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch description slice in `zh_TW` and `zh_CN`, covering the queued-batch panel description that still embedded `Gemini Batch API`, `pending`, and `running`. `utils/translations.ts` now uses Chinese wording for that queued-batch description string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 149 passed.
75. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch notice slice in `zh_TW` and `zh_CN`, covering the queued-batch conversation notice that still embedded the `Generate` action label. `utils/translations.ts` now uses Chinese wording for that queued-batch notice action reference, the existing `tests/workspaceFlowTranslations.test.tsx` queued-batch wording baselines now lock the updated exact `zh_TW` and `zh_CN` notice copy, and validation remains green through clean diagnostics and the full Vitest suite at 149 passed.
76. A further bounded zh shell wording pass now removes the next visible mixed-English lineage-description slice in `zh_TW` and `zh_CN`, covering the six lineage action descriptions that still embedded `stage`, `branch`, `follow-up`, `composer`, `lineage`, and `turn`. `utils/translations.ts` now uses Chinese wording for those lineage description strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 151 passed.
77. A further bounded zh shell wording pass now removes the next visible mixed-English branch-and-restore slice in `zh_TW` and `zh_CN`, covering the branch-rename title and description plus the workspace-restore summary and turn count that still embedded `lineage`, `turn`, `stage`, `session`, and `composer`. `utils/translations.ts` now uses Chinese wording for those branch/restore strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 153 passed.
78. A further bounded zh shell wording pass now removes the next visible mixed-English workspace-restore action slice in `zh_TW` and `zh_CN`, covering the restore actions hint plus the open-latest, continue, and branch labels that still embedded `turn` and `composer`. `utils/translations.ts` now uses Chinese wording for those restore-action strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and `tests/WorkspaceRestoreNotice.test.tsx` has been aligned with the updated fallback continue label so validation remains green through clean diagnostics and the full Vitest suite at 155 passed.
79. A further bounded zh shell wording pass now removes the next visible mixed-English workspace-picker support slice in `zh_TW` and `zh_CN`, covering the two workspace-picker capability labels that still embedded `grounded image search` and `Google Search grounding`. `utils/translations.ts` now uses Chinese wording for those picker support labels, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 157 passed.
80. A further bounded zh shell wording pass now removes the next visible mixed-English workspace-picker stage-source slice in `zh_TW` and `zh_CN`, covering the editor-base hint, stage-source label, stage-source hint, and use-current-stage action that still embedded `stage`, `follow-up`, and `editor`. `utils/translations.ts` now uses Chinese wording for those picker stage-source strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 159 passed.
81. A further bounded zh shell wording pass now removes the next visible mixed-English workspace-picker helper slice in `zh_TW` and `zh_CN`, covering the shared-prompt placeholder, character-hint helper, and picker loading label that still embedded `composer`, `staged intake`, and `picker`. `utils/translations.ts` now uses Chinese wording for those picker helper strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 161 passed.
82. A further bounded zh shell wording pass now removes the next visible mixed-English grounding prompt-reuse slice in `zh_TW` and `zh_CN`, covering the added-cue label plus the append/replace impact copy that still embedded `grounding` and `composer`. `utils/translations.ts` now uses Chinese wording for those grounding reuse strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 163 passed.
83. A further bounded zh shell wording pass now removes the next visible mixed-English stage-surface slice in `zh_TW` and `zh_CN`, covering the stage loading label and the reserved response-text hint that still embedded `stage` and `Images & text`. `utils/translations.ts` now uses Chinese wording for those stage-surface strings, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that set, and validation remains green through clean diagnostics and the full Vitest suite at 165 passed.
84. A further bounded zh shell wording pass now removes the next visible mixed-English grounding bundle-state slice in `zh_TW` and `zh_CN`, covering the selected-bundle coverage state that still embedded the residual English noun `bundle`. `utils/translations.ts` now uses fully Chinese wording for that grounding-panel state string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 167 passed.
85. A further bounded zh shell wording pass now removes the next visible mixed-English viewer session-hint slice in `zh_TW` and `zh_CN`, covering the empty session-hint helper text that still embedded the residual English term `grounding`. `utils/translations.ts` now uses Chinese wording for that viewer helper string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 169 passed.
86. A further bounded zh shell wording pass now removes the next visible mixed-English import-review description slice in `zh_TW` and `zh_CN`, covering the workspace import-review helper text that still embedded the residual English terms `stage` and `composer`. `utils/translations.ts` now uses Chinese wording for that import-review description string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 171 passed.
87. A further bounded zh shell wording pass now removes the next visible mixed-English viewer description slice in `zh_TW` and `zh_CN`, covering the viewer summary copy that still embedded the residual English term `stage`. `utils/translations.ts` now uses Chinese wording for that viewer description string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 173 passed.
88. A further bounded zh shell wording pass now removes the next visible mixed-English viewer result-text empty slice in `zh_TW`, covering the viewer helper copy that still embedded the residual English phrase `images-plus-text`, while locking the existing `zh_CN` counterpart for parity. `utils/translations.ts` now uses Chinese wording for that viewer helper string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 175 passed.
89. A further bounded zh shell wording pass now removes the next visible mixed-English insights continuity slice in `zh_TW` and `zh_CN`, covering the empty continuity-state helper text that still embedded the residual English term `continuity`. `utils/translations.ts` now uses Chinese wording for that insights helper string, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 177 passed.
90. A further bounded zh shell wording pass now removes the next visible mixed-English insights session-source slice in `zh_TW` and `zh_CN`, covering the section label that still embedded the residual English term `Session`. `utils/translations.ts` now uses Chinese wording for that insights label, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 179 passed.
91. A further bounded zh shell wording pass now removes the next visible mixed-English insights eyebrow slice in `zh_TW` and `zh_CN`, covering the compact section label that still embedded the residual English terms `Session` and `Lineage`. `utils/translations.ts` now uses Chinese wording for that insights eyebrow label, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 181 passed.
92. A further bounded zh shell wording pass now removes the next visible mixed-English insights session-state hint slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English terms `stage`, `session`, `branch lineage`, and `workflow context`. `utils/translations.ts` now uses Chinese wording for that insights helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 183 passed.
93. A further bounded zh shell wording pass now removes the next visible mixed-English insights timeline-title slice in `zh_TW` and `zh_CN`, covering the compact section label that still used the residual English phrase `Workflow Log`. `utils/translations.ts` now uses Chinese wording for that insights timeline label, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 185 passed.
94. A further bounded zh shell wording pass now removes the next visible mixed-English insights timeline-description slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English terms `request`, `output`, `history`, and `error`. `utils/translations.ts` now uses Chinese wording for that insights timeline helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 187 passed.
95. A further bounded zh shell wording pass now removes the next visible mixed-English insights session-turn-stack empty slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English term `turn`. `utils/translations.ts` now uses Chinese wording for that insights empty-state helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 189 passed.
96. A further bounded zh shell wording pass now removes the next visible mixed-English insights latest-result-text empty slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English term `stage`. `utils/translations.ts` now uses Chinese wording for that insights empty-state helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 191 passed.
97. A further bounded zh shell wording pass now removes the next visible mixed-English insights stage-source empty slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English term `stage`. `utils/translations.ts` now uses Chinese wording for that insights empty-state helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 193 passed.
98. A further bounded zh shell wording pass now removes the next visible mixed-English history filmstrip title slice in `zh_TW` and `zh_CN`, covering the compact label that still embedded the residual English term `Turn`. `utils/translations.ts` now uses Chinese wording for that filmstrip title, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 195 passed.
99. A further bounded zh shell wording pass now removes the next visible mixed-English insights session-hints empty slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English term `grounded`. `utils/translations.ts` now uses Chinese wording for that insights helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 197 passed.
100. A further bounded zh shell wording pass now removes the next visible mixed-English history filmstrip description slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English terms `stage` and `turn`. `utils/translations.ts` now uses Chinese wording for that filmstrip helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 199 passed.
101. A further bounded zh shell wording pass now removes the next visible mixed-English history filmstrip empty slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English phrase `turn strip`. `utils/translations.ts` now uses Chinese wording for that filmstrip empty-state helper text, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 201 passed.
102. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch refresh-empty slice in `zh_TW` and `zh_CN`, covering the notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the existing Chinese queued-batch terminology already established in the same locale blocks, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 203 passed.
103. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch no-importable-results slice in `zh_TW` and `zh_CN`, covering the notice that still embedded the residual English term `batch`. `utils/translations.ts` now uses Chinese batch-job wording for that import-empty notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 205 passed.
104. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch refreshed-log slice in `zh_TW` and `zh_CN`, covering the log line that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that refresh-count log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 207 passed.
105. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch cancelled-log slice in `zh_TW` and `zh_CN`, covering the log line that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that cancellation log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 209 passed.
106. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch cancel-requested slice in `zh_TW` and `zh_CN`, covering the notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that cancellation-request notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 211 passed.
107. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch import-waiting slice in `zh_TW` and `zh_CN`, covering the notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that import-waiting notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 213 passed.
108. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch imported-log slice in `zh_TW` and `zh_CN`, covering the result log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that import result log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 217 passed.
109. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch imported-notice slice in `zh_TW` and `zh_CN`, covering the result notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that import result notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 217 passed.
110. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch import-all-log slice in `zh_TW` and `zh_CN`, covering the aggregate import log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that aggregate import log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 221 passed.
111. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch import-all-notice slice in `zh_TW` and `zh_CN`, covering the aggregate import notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that aggregate import notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 221 passed.
112. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch poll-failed slice in `zh_TW` and `zh_CN`, covering the error log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that polling failure log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 229 passed.
113. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch cancel-failed slice in `zh_TW` and `zh_CN`, covering the error log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that cancellation failure log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 229 passed.
114. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch import-failed slice in `zh_TW` and `zh_CN`, covering the error log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that import failure log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 229 passed.
115. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch import-all-none slice in `zh_TW` and `zh_CN`, covering the empty-state notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that aggregate import empty-state notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 229 passed.
116. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch submitted-notice slice in `zh_TW` and `zh_CN`, covering the notice that still embedded the residual English phrase `queued batch` while preserving the product-facing `Batch API` name. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that submission notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 241 passed.
117. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch submitted-log slice in `zh_TW` and `zh_CN`, covering the creation log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that submission log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 241 passed.
118. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch submission-failed slice in `zh_TW` and `zh_CN`, covering the error log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that submission failure log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 241 passed.
119. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch polled slice in `zh_TW` and `zh_CN`, covering the polling log that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that polling log, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 241 passed.
120. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch ready-to-import slice in `zh_TW` and `zh_CN`, covering the notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that ready-to-import notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 241 passed.
121. A further bounded zh shell wording pass now removes the next visible mixed-English queued-batch finished-state slice in `zh_TW` and `zh_CN`, covering the state notice that still embedded the residual English phrase `queued batch`. `utils/translations.ts` now uses the locale block's established Chinese queued-batch terminology for that completion-state notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 241 passed.
122. A further bounded zh shell wording pass now removes the next visible mixed-English grounding-panel no-queries slice in `zh_TW` and `zh_CN`, covering the helper sentence that still embedded the residual English term `grounding`. `utils/translations.ts` now uses the existing Chinese grounding terminology already established in the same locale blocks, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 243 passed.
123. A further bounded zh shell wording pass now removes the next visible mixed-English composer Enter-send hint slice in `zh_TW` and `zh_CN`, covering the keyboard helper label that still embedded the residual English key name `Enter`. `utils/translations.ts` now uses fully localized keyboard wording for that composer send hint, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 245 passed.
124. A further bounded zh shell wording pass now removes the next visible mixed-English composer Enter-newline hint slice in `zh_TW` and `zh_CN`, covering the keyboard helper label that still embedded the residual English key name `Enter`. `utils/translations.ts` now uses fully localized keyboard wording for that composer newline hint, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 245 passed.
125. A further bounded zh shell wording pass now removes the next visible mixed-English Shift+Enter hint slice in `zh_TW` and `zh_CN`, covering the keyboard helper label that still embedded the residual English key name `Enter`. `utils/translations.ts` now uses fully localized keyboard wording for that Shift+Enter hint, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 247 passed.
126. A further bounded zh shell wording pass now removes the next visible mixed-English Enter-to-send hint slice in `zh_TW` and `zh_CN`, covering the compact keyboard helper label that still embedded the residual English key name `Enter`. `utils/translations.ts` now uses fully localized keyboard wording for that helper hint, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 249 passed.
127. A further bounded zh shell wording pass now removes the next visible mixed-English import-review continue-latest slice in `zh_TW` and `zh_CN`, covering the action label that still embedded the residual English word `turn`. `utils/translations.ts` now uses fully localized wording for that restore/import continuation action, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 251 passed.
128. A further bounded zh shell wording pass now removes the next visible mixed-English Ultra Editor loading slice in `zh_TW` and `zh_CN`, covering the loading label that still embedded the residual English word `Editor` even though the corresponding product title was already localized in the same locale blocks. `utils/translations.ts` now keeps that loading copy aligned with the existing localized Ultra Editor naming, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for that state, and validation remains green through clean diagnostics and the full Vitest suite at 253 passed.
129. A user-selected bounded zh shell wording pass now localizes the remaining `SketchPad` and `Batch API` candidate slice in `zh_TW` and `zh_CN`, covering the workspace picker action, the loading label, and the queued-batch submitted notice that the manual review explicitly approved for change. `utils/translations.ts` now uses the locale blocks' existing Chinese sketch-pad naming plus localized `批次 API` / `批处理 API` wording for that notice, `tests/workspaceFlowTranslations.test.tsx` now locks exact `zh_TW` and `zh_CN` baselines for those states, and validation remains green through clean diagnostics and the full Vitest suite at 255 passed.
130. A bounded non-Chinese wording pass now localizes the remaining English import-review execution-type labels across `ja`, `ko`, `es`, `fr`, `de`, and `ru`, covering `Batch Variants`, `Chat Continuation`, `Queued Batch Job`, and `Single-turn`. `utils/translations.ts` now gives those execution labels locale-specific wording instead of leaving them in English, `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for all six languages, and validation remains green through clean diagnostics and the full Vitest suite at 261 passed.
131. A broader non-Chinese workspace-flow wording pass now restores the English import-review execution labels and supplements `ja`, `ko`, `es`, `fr`, `de`, and `ru` for the next shared snapshot/history/provenance slice. `utils/translations.ts` now fixes the accidental English regression, adds the missing snapshot/history notice keys for those six languages, localizes the most visible mixed-English snapshot and history log wording, and cleans the remaining provenance or grounding shell terms in the affected locale blocks. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for the repaired English execution labels plus the new snapshot/history/provenance wording across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 268 passed.
132. A further bounded non-Chinese workspace-flow wording pass now localizes the next repeated session-replay and import-review shell slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`, while also cleaning the remaining continuity `turn` wording in `ko`, `de`, and `ru`. `utils/translations.ts` now replaces the most visible mixed-English `restore`, `branch`, `merge`, `workspace`, `workflow`, `stage`, and `turn` shell nouns in those locale blocks' replay/import-review copy, and the accidentally corrupted early `en` header region introduced during patching has been restored without changing its intended English behavior. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that replay/import-review slice in all six locales and updates the localized Russian replay rendering assertion, and validation remains green through clean diagnostics and the full Vitest suite at 274 passed.
133. A further bounded non-Chinese import-review wording pass now localizes the next repeated summary and preview label slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now replaces the remaining mixed-English `turn`, `branch`, `snapshot`, `viewer`, `session`, and `provenance` shell nouns in the import-review metadata labels, latest-turn labels, and branch-lineage preview strings for those locale blocks, while preserving the already-validated replay and execution wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that import-review summary slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 280 passed.
134. A further bounded non-Chinese import-review wording pass now localizes the next shared longform slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`, covering the import-review title and description copy. `utils/translations.ts` now removes the remaining mixed-English `workspace`, `snapshot`, `staged`, `restore`, `chain`, `continuation source`, `stage`, `session`, `composer`, and `turn` shell nouns from that longform import-review guidance in those locale blocks, while leaving already-validated shorter labels unchanged. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for the updated title or description slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 286 passed.
135. A further bounded non-Chinese lineage and workspace-restore wording pass now localizes the next repeated shell slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now removes the remaining mixed-English `stage`, `turn`, `branch`, `session`, `composer`, `chain`, `follow-up`, and `viewer` shell nouns from the lineage action descriptions and workspace-restore recovery or action copy in those locale blocks, while preserving the already-validated import-review and replay wording. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that lineage or restore slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 292 passed.
136. A further bounded non-Chinese picker and viewer completion pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `workspacePickerSharedPrompt*`, `workspacePickerEditorBase*`, and core `workspaceViewer*` labels that had still been falling back to English in those locale blocks, while preserving the already-validated import-review, replay, and restore wording. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that picker or viewer slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 298 passed.
137. A further bounded non-Chinese queued-batch wording pass now localizes the next repeated queue guidance slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now removes the remaining mixed-English `Queue Batch Job`, `queued batch jobs`, `pending`, `running`, `chat continuation`, `editor base`, `stage`, `follow-up`, and `lineage` shell nouns from the queued-batch mode descriptions and persisted-job guidance in those locale blocks, while preserving the already-validated queue status labels and surrounding shell copy. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that queued-batch guidance slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 304 passed.
138. A further bounded non-Chinese picker helper, sheet-title, and surface wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `workspacePickerInspiration`, prompt-history or gallery helper copy, sketch or stage-source hints, `workspaceSheetTitle*`, and `workspaceSurface*` labels that had still been falling back to English in those locale blocks, while preserving the already-validated picker, viewer, import-review, and queued-batch wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that picker-helper or sheet-surface slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 310 passed.
139. A further bounded non-Chinese viewer metadata and action wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `workspaceViewerClose`, prompt or metadata labels, provenance copy, and secondary viewer actions such as new-conversation, regenerate, follow-up edit, and add-to-references that had still been falling back to English in those locale blocks, while preserving the already-validated viewer summary, import-review, and queued-batch wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now locks exact baselines for that viewer metadata or action slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 316 passed.
140. A further bounded non-Chinese workspace snapshot failure-copy pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific snapshot export/import failure messages that had still been falling back to English in those locale blocks, while preserving the already-validated snapshot notices, history-source wording, insights continuity labels, and viewer or import-review copy from prior slices. `tests/workspaceFlowTranslations.test.tsx` now extends the existing snapshot or provenance exact baselines to lock that failure-message slice across all six locales, and validation remains green through clean diagnostics and the full Vitest suite at 316 passed.
141. A further bounded non-Chinese grounding provenance continuity, mode, and selection wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `groundingProvenanceContinuity*`, `groundingProvenanceMode*`, `groundingProvenanceNone`, and grounding selection labels that had still been falling back to English in those locale blocks, while preserving the already-validated grounding summaries, snapshot wording, and viewer or import-review copy from prior slices. `tests/workspaceFlowTranslations.test.tsx` now extends the grounding provenance key coverage and locks exact baselines for that continuity or selection slice across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 322 passed.
142. A further bounded non-Chinese grounding provenance detail and reuse wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific requested-size, actual-output, cited-detail, source-reference, reuse, and composer append or replace labels that had still been falling back to English in those locale blocks, while preserving the already-validated grounding summaries, continuity wording, and surrounding snapshot or viewer copy from prior slices. `tests/workspaceFlowTranslations.test.tsx` now extends the grounding provenance key coverage and locks exact baselines for that detail or reuse slice across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 328 passed.
143. A further bounded non-Chinese grounding provenance longform thought, grounding, and support wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific visible-thought, hidden-signature, grounding-source, grounding-metadata, and support-bundle longform status copy that had still been falling back to English in those locale blocks, while preserving the already-validated grounding summary, continuity, and detail or reuse wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now extends the grounding provenance key coverage and locks exact baselines for that longform slice across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 334 passed.
144. A further bounded non-Chinese grounding panel provenance, attribution, and composer-reuse wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific provenance carry-forward logging, continuity and attribution summary labels, uncited-source and citation-detail guidance, source-state or bundle-state labels, and grounding reuse preview or impact copy that had still been falling back to English in those locale blocks, while preserving the already-validated grounding provenance summary, continuity, detail or reuse, and longform wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now extends grounding panel key coverage, adds non-fallback assertions for the localized panel slice, and locks exact baselines for that panel or provenance slice across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 342 passed.
145. A further bounded non-Chinese grounding panel compare, bundle-inspection, and linked-source wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific cited-segment, bundle-inspection, source-citation-count, linked-source comparison, selected-bundle metadata, and empty-state guidance copy that had still been falling back to English in those locale blocks, while preserving the already-validated grounding panel provenance, attribution, and composer-reuse wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now extends grounding panel key coverage, extends non-fallback assertions for the compare or bundle slice, and locks exact baselines for that linked-source comparison panel wording across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 342 passed.
146. A further bounded non-Chinese workspace panel narration and trim-constraint wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific response-narration availability copy and model-constraint trim notices for object and character reference images that had still been falling back to English, while also completing the adjacent `workspacePanelResultTextReady` and `workspacePanelResultTextReserved` strings that were missing in those locale blocks. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated workspace-panel key coverage, extends non-fallback assertions for that narration-and-trim slice, and locks exact baselines for those four strings across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 350 passed.
147. A further bounded non-Chinese workspace panel status wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `workspacePanelStatusEnabled`, `workspacePanelStatusPrepared`, and `workspacePanelStatusReserved` labels that had still been falling back to English in those locale blocks, while preserving the already-validated workspace panel narration and trim-constraint wording from the previous slice. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated workspace-panel status key coverage, extends non-fallback assertions for that three-key status slice, and locks exact baselines for those labels across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 358 passed.
148. A further bounded non-Chinese history-branch label wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `historyBranchAuto`, `historyBranchRoot`, `historyBranchTurns`, `historyBranchUpdated`, `historyBranchOrigin`, and `historyBranchLatest` labels that had still been falling back to English in those locale blocks, while preserving the already-validated `historyBranchMain` and `historyBranchNumber` wording already present there. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated history-branch key coverage, narrows non-fallback assertions to the keys that must differ from English, and locks exact baselines for the full six-key slice across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 366 passed.
149. A further bounded non-Chinese source-lineage and replay-session wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `composerFollowUpSource`, `workspaceSourceBadge`, `historyBranchContinuationSource`, `workspaceCurrentStageSourceNoLinkedHistory`, and `workspaceInsightsReplaySession` strings that had still been falling back to English in those locale blocks, while preserving the already-validated provenance, history-branch, and workspace-panel wording from prior slices. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated source-lineage key coverage, narrows non-fallback assertions to the labels that must differ from English, and locks exact baselines for that five-key slice across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 374 passed.
150. A further bounded non-Chinese branch-rename dialog wording pass now fills the next missing shared-shell key slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `branchRenameEyebrow`, `branchRenameTitle`, `branchRenameDesc`, `branchRenameClose`, `branchRenameAutomaticLabel`, `branchRenameDisplayName`, `branchRenameRestoreHint`, `branchRenameUseAutomatic`, `branchRenameSave`, `branchRenameResetNotice`, and `branchRenameSavedNotice` strings that had still been falling back to English in those locale blocks, while preserving the already-validated branch-rename log wording already present there. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated branch-rename dialog key coverage, non-fallback assertions for that dialog slice, and exact baselines for all eleven strings across all six locales, and validation remains green through clean diagnostics and the focused Vitest run at 382 passed.
151. A further bounded non-Chinese history-continue action wording pass now fills the next key-aligned shared-shell slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `historyContinueFromTurn`, `historyContinuePromoteVariant`, and `historyContinueSourceActive` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, while preserving the already-validated follow-up edit and editor-stage wording that sits in the same history-stage neighborhood. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated history-continue key coverage, non-fallback assertions for that three-key slice, extends the exact `zh_TW` and `zh_CN` history-stage baselines to cover the full trio, and locks exact baselines for all three strings across all six non-Chinese locales.
152. A further bounded non-Chinese history action and badge wording pass now fills the next key-aligned shared-shell slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `historyActionOpen`, `historyActionBranch`, `historyActionRename`, `historyActionOpenLatest`, `historyActionOpenOrigin`, `historyActionBranchFromOrigin`, `historyModeImage`, `historyBadgeParent`, `historyBadgeCandidate`, and `historyBadgeActive` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, while preserving the already-localized `historyActionOpenInHistory` wording in those locale blocks. `tests/workspaceFlowTranslations.test.tsx` now adds dedicated history-action key coverage, narrows non-fallback assertions to the labels that must differ from English, and locks exact baselines for that ten-key slice across all six non-Chinese locales.
153. A further bounded non-Chinese history filmstrip wording pass now fills the next key-aligned recent-turns slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `historyFilmstripTitle`, `historyFilmstripDesc`, `historyFilmstripSummary`, and `historyFilmstripEmpty` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated history-filmstrip key coverage, keeps those labels non-English outside the English baseline, and locks exact baselines for that four-key slice across all six non-Chinese locales.
154. A further bounded non-Chinese workspace insights sidebar label pass now fills the next key-aligned session-and-lineage slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `workspaceInsightsEyebrow`, `workspaceInsightsModelSettingsTitle`, `workspaceInsightsPhaseLabel`, `workspaceInsightsCurrentModel`, `workspaceInsightsCurrentSettings`, `workspaceInsightsReferences`, `workspaceInsightsObjects`, `workspaceInsightsCharacters`, `workspaceInsightsRenameBranch`, `workspaceInsightsActiveBranch`, `workspaceInsightsBranchesCount`, `workspaceInsightsSessionContinuity`, `workspaceInsightsLatestResultText`, `workspaceInsightsLatestThoughts`, and `workspaceInsightsProvenance` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated workspace-insights sidebar key coverage, keeps those labels non-English outside the English baseline, and locks exact baselines for that fifteen-key slice across all six non-Chinese locales.
155. A further bounded non-Chinese workspace insights structural wording pass now fills the next key-aligned continuity, lineage-map, and timeline slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `workspaceInsightsBranchesEmpty`, `workspaceInsightsNoContinuitySignals`, `workspaceInsightsOfficialConversation`, `workspaceInsightsConversationBranchActiveSource`, `workspaceInsightsSessionSource`, `workspaceInsightsSessionStateHint`, `workspaceInsightsTitle`, `workspaceInsightsStageSourceEmpty`, `workspaceInsightsLatestResultTextEmpty`, `workspaceInsightsSessionTurnStack`, `workspaceInsightsTurnsCount`, `workspaceInsightsSessionTurnStackEmpty`, `workspaceInsightsLineageMap`, `workspaceInsightsRootsCount`, `workspaceInsightsRoot`, `workspaceInsightsLineageEmpty`, `workspaceInsightsTimelineTitle`, `workspaceInsightsTimelineDesc`, `workspaceInsightsTimelineEmpty`, `workspaceInsightsOpenGallery`, `workspaceInsightsOpenPromptHistory`, `workspaceInsightsItemsCount`, and `workspaceInsightsSessionHintsEmpty` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated workspace-insights structural key coverage, keeps those labels non-English outside the English baseline, and locks exact baselines for that twenty-three-key slice across all six non-Chinese locales.
156. Translation-table modularization is now an explicit post-convergence task rather than in-slice scope. Continue the current bounded localization campaign in `utils/translations.ts` until the remaining supported-language gaps are closed first; only after the translation dictionary is considered converged should the table be split into ownership-bounded translation modules behind the same exported `translations` object and `getTranslation` API, with equivalence checks so the refactor does not change runtime wording or fallback behavior.
157. A further bounded non-Chinese loading-state wording pass now fills the next smallest shared-shell slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `loadingActivityConsole`, `loadingPrepareSketchPad`, `loadingPrepareUltraEditor`, and `loadingStageSurface` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated loading-state key coverage, keeps those labels non-English outside the English baseline, and locks exact baselines for that four-key slice across all six non-Chinese locales. Validation is green at 430/430.
158. A further bounded non-Chinese stage-grounding wording pass now fills the next smallest stage-summary slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `stageGroundingResultStatus` and `stageGroundingResultSummary` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, `tests/workspaceFlowTranslations.test.tsx` now adds dedicated stage-grounding key coverage plus exact baselines for all six non-Chinese locales, and the existing `zh_TW` and `zh_CN` grounding runtime baselines now also lock the stage summary wording. Validation is green at 438/438.
159. A further bounded non-Chinese history-stage notice wording pass now fills the next smallest stage-action slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `followUpEditRequiresStageImage` and `editorBaseStageNotice` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated history-stage notice key coverage plus exact baselines for all six non-Chinese locales while preserving the already-validated `zh_TW` and `zh_CN` history-stage baselines. Validation is green at 446/446.
160. A further bounded non-Chinese composer control chrome wording pass now fills the next compact composer slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `composerToolbarExportWorkspace`, `composerToolbarImportWorkspace`, `composerToolbarAdvancedSettings`, `composerEnterSends`, `composerEnterNewline`, `composerVisibilityVisible`, and `composerVisibilityHidden` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated composer-control key coverage plus exact baselines for all six non-Chinese locales while keeping fallback-sensitive assertions limited to the labels that must differ from English. Validation is green at 454/454.
161. A further bounded non-Chinese composer queue-action wording pass now fills the next smallest single-key composer slice across `ja`, `ko`, `es`, `fr`, `de`, and `ru`. `utils/translations.ts` now adds locale-specific `composerQueueBatchJob` strings that had still been present only in `en`, `zh_TW`, and `zh_CN`, and `tests/workspaceFlowTranslations.test.tsx` now adds dedicated key coverage, non-fallback assertions, and exact baselines for that one-key slice across all six non-Chinese locales. Validation is green at 462/462.
162. A full-table structural translation audit now rechecks `utils/translations.ts` using criteria beyond missing-key counts. The audit compared placeholder and token markers against the English baseline, found drift in `groundingProvenanceSelectionBundle` and `groundingProvenanceSelectionSource` across `ja`, `ko`, `es`, `fr`, `de`, and `ru`, corrected those locale strings to preserve `{0}` interpolation semantics, localized the lingering Japanese `catDesign` label, and added a generic token-consistency regression in `tests/workspaceFlowTranslations.test.tsx` so future placeholder loss is caught automatically. Validation is green at 463/463, and the post-fix audit reports no remaining token mismatches or suspicious ASCII-only English carryovers in the non-Latin locale set.
163. Translation-table modularization is now implemented behind the existing public API instead of staying as a deferred follow-up. `utils/translations.ts` no longer owns a monolithic in-file locale table; it now remains the stable entrypoint that exports the unchanged `Language`, `SUPPORTED_LANGUAGES`, `translations`, and `getTranslation` surface while composing nine internal locale modules from `utils/translations/`. The extracted `en.ts`, `zh_TW.ts`, `zh_CN.ts`, `ja.ts`, `ko.ts`, `es.ts`, `fr.ts`, `de.ts`, and `ru.ts` files preserve the existing wording exactly, so all runtime callers keep the same import path and fallback behavior while translation ownership is now split into file-bounded locale units. Validation is green on `npm run build` and `npm test -- tests/workspaceFlowTranslations.test.tsx` at 463/463.
164. Translation convergence is now past structural completeness and into bounded polish passes on the modularized locale files. After the locale key-set parity repair and the first high-frequency wording polish across `es`, `fr`, `ko`, and `ru`, a second compact polish pass further tightened German, Japanese, and Russian shell wording in `utils/translations/{de,ja,ru}.ts`, including branch-rename grammar, session-continuity terminology, stage-source reopen phrasing, and short editor-stage prompts. `tests/workspaceFlowTranslations.test.tsx` was updated only where exact wording baselines intentionally changed, and validation is green on `npm test -- tests/workspaceFlowTranslations.test.tsx` at 464/464 with locale parity still clean.
165. A third translation polish pass now narrows from multi-locale sweeps to single-locale micro-refinement. `utils/translations/ja.ts` further cleans a small residual mixed-English and compressed-label slice by replacing the remaining `prompt` carryover in `workspaceImportReviewNoPromptSaved` and tightening the picker wording for linked history and current-stage editor-base reuse. `tests/workspaceFlowTranslations.test.tsx` updates only the affected Japanese picker baselines, and validation remains green on `npm test -- tests/workspaceFlowTranslations.test.tsx` at 464/464.

### Formatting Cleanup Rules

The following formatting-cleanup rules are mandatory unless this file is updated first.

1. Do not run repo-wide write-formatting as part of unrelated product work.
   The current formatting debt spans a large working-tree surface, so `npm run format` across the whole repo is its own cleanup wave and must not be mixed into feature or regression fixes casually.
2. Format in ownership-bounded batches.
   Group cleanup by one coherent surface at a time, such as queue files, provenance files, shared shell controls, or tests tied to a single product area.
3. Rebaseline each formatting batch with targeted validation.
   Each cleanup batch must finish with at least the directly relevant tests or build checks for that ownership area before another batch starts.
4. Prefer reviewable batches over maximum throughput.
   A smaller, behavior-safe formatting wave is better than a faster batch that obscures real semantic changes.
5. Keep formatter-policy documentation and editor settings aligned.
   If formatter bindings or workspace defaults change again, update README, workspace/editor settings, and repo memory together so VS Code behavior stays predictable.

### Phase 9: Deepen provenance UX and advanced paths

Status:

Started in the current workspace build.

Must:

1. Expand citation inspection, comparison, and source reuse flows.
2. Keep model-specific advanced paths gated.

Current implemented slice:

1. The provenance panel now includes an attribution overview derived from existing grounding metadata, summarizing coverage, source mix, query mix, and search entry-point state without adding a new request path.
2. The same panel now distinguishes retrieved-but-uncited sources from directly cited sources, including source-level cited versus retrieved-only badges, per-source bundle-count cues, compact compare summaries for selected source and selected bundle detail states, direct inspect actions from uncited-source cards into the shared detail flow, and selected-bundle compare rows for other retrieved sources outside the active bundle.
3. Focused Vitest coverage now protects the provenance attribution derivation for overview rows, entry-point status messaging, and uncited-source detection.
4. Focused Playwright coverage now verifies the attribution overview and uncited-source UI in the real app, including locale-safe validation for `en`, `zh_TW`, and `zh_CN`.
5. A follow-up compare-cue pass now adds explicit source inspect buttons plus `In bundle` / `Outside bundle` state chips on bundle comparison rows, and the previously flaky source-detail inspect path is now covered by the focused provenance Playwright smoke in `en`, `zh_TW`, and `zh_CN`.
6. A follow-up source-reuse pass now surfaces a composer reuse preview for both selected sources and selected bundles, reusing the existing grounding reuse snippet/label model rather than introducing new prompt-state logic; focused Vitest and the locale-safe provenance smoke in `en`, `zh_TW`, and `zh_CN` cover both detail paths.
7. The reuse preview now distinguishes the actual append result from the replace result, so the detail pane mirrors the current composer actions instead of showing a single generic snippet; focused Vitest and the same locale-safe provenance smoke in `en`, `zh_TW`, and `zh_CN` cover both preview variants.
8. The append-result preview is now prompt-aware and shares the same derived string as the actual append action, so the detail pane shows the full resulting composer text rather than only the appended cue; focused Vitest and the locale-safe provenance smoke in `en`, `zh_TW`, and `zh_CN` verify this alignment.
9. The reuse preview now also explains the behavioral impact of each action, explicitly calling out that append preserves the current composer prompt while replace overwrites it; focused Vitest and the same locale-safe provenance smoke in `en`, `zh_TW`, and `zh_CN` cover these impact summaries.
10. The append-result preview now breaks the preserved composer prompt and the newly added grounding cue into separate visual blocks, making it easier to scan what is retained versus what will be appended; focused Vitest and the same locale-safe provenance smoke in `en`, `zh_TW`, and `zh_CN` cover this segmented compare view.
11. A follow-up locale-polish pass cleans up the remaining mixed-language provenance/support-bundle strings in `en`, `zh_TW`, and `zh_CN`, so the attribution and composer-reuse surfaces stay language-consistent during real restore/replay flows.
12. The restore/global-log current-source continue and branch flows are now revalidated against the real shell after moving the expanded global log into a fixed portal, eliminating the pointer-interception regression that previously caused the restore Playwright spec to fail while the buttons were visibly rendered.

Deferred until after phases 1 through 5 are stable.

## UI Naming And Entry Rules

1. Keep the current expanded functionality structure rather than reverting to the earliest simplified handoff.
2. Simplification must happen through clearer names and grouping, not by removing already-useful capability entry points.
3. The user should be able to distinguish these intents before seeing lower-level settings:
   `Single-turn Generate`, `Batch Variants`, `Continue Editing`, `Queued Batch Job`.
4. A single visible entry point must not silently mix multiple execution intents.
5. If a control changes the execution mode, the UI must make that mode shift explicit.
6. Picker taxonomy and composer labels must be aligned to this spec before additional surface growth.

## State Ownership Boundaries

The implementation must maintain separate ownership boundaries for the following state domains.

1. Generation state.
   Prompt, model, ratio, size, batch size, style, output format, temperature, thinking level, search flags, execution mode.
2. Asset state.
   Object references, character references, sketch assets, editor base image, staged images, and reusable source assets.
3. Workspace session and provenance state.
   Active result, history selection, lineage metadata, session hints, grounding continuity, support bundles, workflow logs.
4. Conversation session state.
   Conversation session id, active continuation source image id, branch linkage, continuation-specific metadata, thought context.
5. Queued job state.
   Job id, job status, submission metadata, result import status, and polling lifecycle state.

`App.tsx` should orchestrate these domains, not own most of their internal state directly.

## Request Path Rules

### Search modes

1. `Web only` must assemble a standard web search request without image-search payload.
2. `Image only` must assemble image-search payload without silently forcing web search semantics.
3. `Web + Image` must assemble both modes explicitly.

### Continuation requests

1. Continuation requests must begin from an explicitly promoted source image.
2. Continuation requests must preserve conversation identity and relevant continuation context.
3. Continuation requests must not reuse ordinary one-shot semantics while labeling the result as conversation-native editing.

### Queued batch requests

1. Queued batch submission must be independent from the interactive fan-out code path.
2. Job submission and polling metadata must be persistable locally.
3. Imported queued results must re-enter the main workspace/history model rather than a separate orphan store.

## Persistence Rules

Workspace persistence must preserve enough metadata to restore execution intent and continuity semantics.

Snapshot data must include at least:

1. Execution mode.
2. Variant grouping metadata for sibling outputs.
3. Promoted continuation source marker.
4. Conversation session id and branch linkage when continuation mode exists.
5. Queued job metadata for active or completed local job tracking.
6. Session hints, continuity state, and provenance continuity markers.
7. Workflow log entries needed for replay and imported-session inspection.

Restore behavior must:

1. Preserve current mode meaning instead of flattening all restored data into generic history.
2. Recover queued jobs after app restart.
3. Keep promoted continuation source semantics intact.
4. Avoid turning every restored branch into an active continuation simultaneously.
5. Normalize restored conversation records so any seeded active source is preserved even when older snapshots omitted it from `turnIds`.

## Verification Gates

Work must not be considered complete until the following gates are satisfied for the relevant phase.

1. `gemini-3-pro-image-preview` shows and accepts standard Google Search grounding where intended.
2. Search request modes work as three distinct paths: `Web only`, `Image only`, `Web + Image`.
3. The product exposes distinct entry points for `Single-turn Generate`, `Interactive Batch Variants`, `Chat-Based Continue Editing`, and `Queued Batch Job`.
4. Variants do not automatically become active continuation sources.
5. Only an explicitly promoted result can start continuation editing.
6. A branch cannot hold multiple active continuation images at the same time.
7. Build and tests pass after capability and mode refactors.
8. Restored snapshots preserve execution mode and continuity semantics.
9. Queued batch jobs can survive app restart and later import results into the existing workspace.
10. Conversation-native continuation preserves real continuation context rather than only local UI labels.

## Deferred Scope

The following items are deferred and must not be mixed into the same delivery wave unless this file is updated first.

1. Reworking the rebuilt shell into a different navigation architecture.
2. Treating all generation as conversation-native chat.
3. Replacing interactive batch variants with official Batch API.
4. Exposing advanced capabilities as if all image models support the same controls.
5. Deep provenance expansion before capability truth, search semantics, and mode boundaries are stable.
6. Any broader server architecture that assumes an always-on custom backend for the local app.

## Live Workflow Baseline

The following behaviors are already validated in the live app and should be preserved while refactoring:

1. Interactive batch variants persist as `Candidate` results until the user explicitly promotes one.
2. The promoted variant is shown as `Source` / `Source Active`, and sibling variants in the same branch stay candidates.
3. Workspace restore and import review reuse the same promotion-aware semantics instead of flattening variants into generic continue actions.
4. Targeted browser regression covers import-review labeling and single-active-source enforcement for restored variant branches.

5. Portable workspace import includes review before merge or replacement.
6. Imported latest-turn and branch-latest replace flows can land directly on the intended branch context.
7. Merge flows can preserve current composer and active stage while importing turns and branch labels.
8. Replace flows can restore imported history, staged assets, composer state, and restore notices.
9. Restored workflows can continue, branch, or clear chain while retaining settings as designed.
10. Workspace snapshots persist workflow logs for lightweight in-app replay.
11. The production build and test suite currently pass with the existing shell.
12. Restored official conversation state survives stale-snapshot normalization and still rebuilds the correct backend chat history on the next continuation turn.

## Current Next Focus

1. The mainline priority should now move to Phase 9 provenance UX depth rather than more continuation correctness work.
2. Further Phase 5 extraction should happen only when a real ownership boundary or cross-surface synchronization pressure appears.
3. Follow-up work must preserve the current `Candidate`, `Promote Variant`, `Source Active`, child-branch, and official conversation-native continuation semantics.
4. The first Phase 9 slice should build on the existing continuity data model with provenance drill-down, attribution clarity, and source reuse/comparison flows instead of introducing a parallel request path.
5. Official chat-continuation request assembly and conversation-state persistence/restore are already part of the validated baseline; they should not be tracked as pending implementation work unless this file is explicitly revised.

## Current Working Tree Packaging Plan

The current working tree contains a broad but mostly coherent refactor wave. It should not be treated as one undifferentiated submit. The preferred packaging order is:

### Package A: Workspace shell extraction

Scope:

1. `App.tsx` shell thinning and the extracted surface/view-model glue.
2. New shell-oriented components such as `WorkspaceOverlayStack`, `WorkspacePickerSheet`, `WorkspaceRestoreNotice`, `WorkspaceTopHeader`, and `WorkspaceViewerOverlay`.
3. Hook-level prop assembly and shell composition helpers such as `useWorkspaceShellViewModel`, `useWorkspaceOverlayAuxiliaryProps`, `useWorkspacePickerSheetProps`, `useWorkspaceTopHeaderProps`, `useWorkspaceViewer`, `useWorkspaceViewerOverlayProps`, `useGeneratedImageStageProps`, and `useRecentHistoryFilmstripProps`.

Must preserve:

1. No behavior change beyond ownership cleanup and already-validated localization wiring.
2. A thinner `App.tsx` that remains orchestration-first rather than becoming a second indirection layer.

### Package B: State domain extraction and persistence semantics

Scope:

1. Conversation, lineage, provenance, asset, composer, queued-job, and snapshot state helpers.
2. Hooks and utilities such as `useComposerState`, `useSelectedResultState`, `useWorkspaceAssets`, `useWorkspaceSessionState`, `useWorkspaceSnapshotActions`, `useHistorySourceOrchestration`, `useProvenanceContinuation`, `useImportedWorkspaceReview`, `useWorkspaceLineageSelectors`, `branchContinuation`, `conversationState`, `lineage`, `stagedAssets`, `workflowTimeline`, `workspacePersistence`, and `workspaceSnapshotState`.

Must preserve:

1. One active continuation source per branch.
2. Restored/imported conversation state normalization.
3. Local-first snapshot and queued-job persistence semantics.

### Package C: Queued batch workflow and backend path

Scope:

1. `plugins/imageSavePlugin.ts`, `services/geminiService.ts`, `hooks/useQueuedBatchJobs.ts`, `hooks/useQueuedBatchWorkflow.ts`, and related UI surfaces such as `QueuedBatchJobsPanel` and `ComposerSettingsPanel`.
2. Request-path support for submit, poll, cancel, import, restart recovery, timeline display, and staged/editor editing-input handoff.

Must preserve:

1. Queued batch remains distinct from interactive batch variants.
2. Local persistence remains authoritative for job recovery and import status.

### Package D: Localization completion and locale-safe regression coverage

Scope:

1. Translation-table growth in `utils/translations.ts`.
2. Remaining shell/runtime localization touch points across history-source actions, restore/import/replay surfaces, queued-batch messaging, and stage-origin/continuation labels, plus any residual hardcoded or mixed-language copy still embedded in secondary shell panels.
3. Locale-safe Playwright assertions in `e2e/workspace-restore.spec.ts`.

Must preserve:

1. No new English-only assertions in restore/import/provenance coverage.
2. Shared continuation labels stay driven by translation-aware helpers rather than duplicated literals.

### Package E: Regression and verification scaffolding

Scope:

1. Unit and integration tests under `tests/`.
2. Playwright harness and config under `e2e/` and `playwright.config.ts`.
3. Supporting repo config changes such as `package.json`, `package-lock.json`, and project-backed editor settings.

Must preserve:

1. Focused regression coverage for continuation semantics, workspace persistence, official conversation reuse, plugin integration, and restore/import flows.
2. Validation commands stay practical for this repo: `npm run build`, targeted `vitest`, and targeted Playwright.

### Packaging Guidance

1. Package A and Package B are tightly related, but should still be reviewed as separate concerns when practical: shell extraction versus state-model ownership.
2. Package C should remain separate from Package A unless a small glue change is inseparable.
3. Package D should remain separate from pure refactor commits when possible so locale regressions are easy to isolate.
4. Package E may be split across the other packages if a test is the only safe proof for that package, but the logical linkage must stay obvious.
5. Until these packages are explicitly cut, treat the current working tree as a staging area rather than a review-ready single changeset.

## Change Control

1. If a new model capability is introduced, this document must be updated before the UI and request path diverge.
2. If a new execution mode is introduced, its intent, boundaries, persistence rules, and verification gates must be added here first.
3. If implementation reality drifts from this file, align the implementation back to the file or update the file before further expansion.
