# Changelog

This changelog is compiled from the repository's local git tags plus the published GitHub Releases and Tags pages for `neophoeus/App-Nano_Banana_Ultra`.

## Unreleased

- No unreleased changes recorded after `v3.0.0` yet.

## v3.0.0 - 2026-03-26

- Commit: `e50e91a`
- Release title: Nano Banana Ultra 3.0.0 - Continuity Workspace Release
- Tag subject: `v3.0.0: continuity workspace, structured outputs, queued batch, and restore hardening`
- Release notes summary:
    - rebuilt the product around a clearer workspace shell: top `Model Output`, center history canvas, right-side context and tools, and bottom composer
    - added dedicated shell surfaces such as `WorkspaceResponseRail`, `WorkspaceHistoryCanvas`, `WorkspaceInsightsSidebar`, `WorkspaceSideToolPanel`, `WorkspaceViewerOverlay`, `WorkspacePickerSheet`, `WorkspaceImportReview`, `WorkspaceRestoreNotice`, `SessionReplayDialog`, and `BranchRenameDialog`
    - removed older duplicated shell families so secondary surfaces route back to history ownership instead of exposing competing direct actions
    - made official conversation continuity first-class across generation, history, sidebar, replay, restore, and snapshot persistence
    - expanded branch and source-state workflows with clearer `open`, `open latest`, `continue latest`, source-active, branch rename, and lineage routing semantics
    - added a formal session replay path and strengthened import, restore, reopen, and active-source continuity behavior across the app
    - introduced preset-based structured outputs as a shipped product feature instead of an ad hoc response path
    - shipped the initial structured-output presets `scene-brief`, `shot-plan`, `prompt-kit`, `quality-check`, `delivery-brief`, `variation-compare`, and `revision-brief`
    - added structured-output rendering in both the response rail and viewer overlay, with copy JSON, copy text, and export actions plus richer preset-specific presentation ordering
    - turned structured outputs into reusable workflow artifacts by adding prompt-draft assembly, append/replace actions, and clearer guide-card onboarding in advanced settings
    - added an official queued-batch workflow with submit, refresh, cancel, import, import-ready summaries, grouped monitor/results actions, and per-job event timelines
    - persisted queued batch jobs through workspace snapshots and restore flows, including imported queued results entering normal history with lineage-aware labels
    - improved queued-batch support for staged follow-up and editor-based image-conditioned requests while keeping batch behavior aligned with official API constraints
    - substantially upgraded grounding and provenance UX with summary-first detail surfaces, compare flows, linked-source inspection, bundle/source drill-down, and composer reuse guidance
    - strengthened result and stage semantics so grounding status, workflow state, thoughts, session hints, and provenance context read consistently across stage, rail, sidebar, and viewer
    - hardened local workspace persistence by compacting inline snapshot payloads, favoring file-backed image restore when `savedFilename` is available, and failing soft on storage quota pressure
    - carried `savedFilename` and related asset metadata through stage assets, history assets, restore flows, and snapshot migration so restored workspaces can recover images more safely
    - centralized capability truth and model constraints, improving shared handling of model support, request assembly, and backend/frontend consistency
    - modularized the translation system into per-locale files and completed a broad 9-language shell wording convergence pass across restore, replay, provenance, queue, viewer, history, and composer surfaces
    - normalized owner-route and continuity wording across the product so compact secondary surfaces read as guided routes back into history rather than parallel execution surfaces
    - introduced a more deliberate visual system with shared shell surface tokens, overlay tokens, summary-first disclosure patterns, and theme-safe modal behavior including local theme toggles on blocking overlays
    - moved Advanced settings into a dedicated modal workflow and exposed the same entry path from the composer, shared controls, editor, and SketchPad
    - extracted substantial orchestration out of `App.tsx` into focused hooks for queue workflow, stage/viewer behavior, transient UI state, shell utilities, generation context, snapshot actions, and related view-model assembly
    - added or expanded major supporting docs for shell decisions, implementation structure, package ownership, and internal smoke verification to match the shipped 3.x workspace architecture
    - greatly expanded automated coverage with new and updated Vitest suites for structured outputs, official conversation flows, queued-batch workflow, persistence, provenance, lineage, restore/import UI, and shell surfaces
    - expanded Playwright restore coverage into focused entrypoints and broader locale-aware regression coverage for restore, replay, provenance, queued-batch, and owner-route workflows
- 繁中發版摘要:
    - 3.0.0 是自 `v2.5.1` 之後的第一次大型正式改版，核心方向是把 Nano Banana Ultra 從單次生圖介面升級成可延續、多輪操作、可還原的影像工作區
    - 介面重新整併為更清楚的工作區殼層，讓輸出、歷史、右側脈絡、工具與底部 composer 各自有明確責任，不再讓多個次要面板重複提供同一類直接操作
    - 正式把 official conversation continuity、branch/source 延續、session replay、restore/import/reopen 等多輪工作流做成產品主幹，而不只是零散功能
    - 正式加入 structured outputs 工作流，包含多種 preset、結果檢視、JSON 或文字匯出、以及把結果直接 append 或 replace 回下一輪 prompt 的重用能力
    - 正式加入 queued batch job 工作流，支援提交、刷新、取消、匯入、批次結果回收、時間線顯示，並能在工作區快照還原後接續追蹤
    - 大幅強化 grounding 與 provenance 體驗，讓摘要、比較、來源檢視、bundle/source drill-down 與 prompt 重用都能在同一套語意下工作
    - 工作區快照與本地還原機制同步強化，支援更安全的檔案型影像回復、較小的 snapshot 負載，以及更穩定的 restore 行為
    - 九種語言的 shell 文案、queue、viewer、provenance、restore、replay、history、composer 等主要表面做了大範圍收斂，降低英文殘留與語意不一致
    - 視覺上建立了新的 shell token、overlay token、summary-first disclosure 模式與 modal theme-safe 行為，整體 UI 比 2.5.1 更像完整工作區產品而不是功能堆疊
    - 測試與驗證範圍也顯著擴大，Vitest 與 Playwright 都補上了針對 continuity、queued batch、structured outputs、restore、provenance 與多語系路徑的回歸覆蓋

## v2.5.1 - 2026-03-11

- Commit: `244a32e`
- Release title: Dev Server Port Optimization
- Tag subject: `v2.5.1: Port optimization and startup script refinement`
- Release notes summary:
    - fixed port collision issues
    - refined startup scripts

## v2.5.0 - 2026-03-10

- Commit: `fcc5837`
- Release title: System Status Monitor & Secure API Integration
- Tag subject: `v2.5.0: System Status Monitor & Secure API Integration`
- Release notes summary:
    - added a real-time system status monitor for Local API and Gemini key state
    - added multi-language support across 9 languages for the status surface
    - moved API key handling to backend health checks so keys are not exposed in the browser bundle
    - updated Gemini model naming to official versions
    - added health-check, preview, and security documentation
    - added structured error logging, locale normalization, z-index cleanup, and refactoring work

## v2.4.1 - 2026-03-05

- Commit: `019c26c`
- Release title: Enhanced UI consistency & Global Settings Sync
- Tag subject: `v2.4.1: Enhanced UI consistency, tooltips, global settings sync, and removed lock features`
- Release notes summary:
    - added consistent tooltips across SketchPad and ImageEditor controls in all supported languages
    - synchronized global theme and language settings across the app, including SketchPad
    - improved UI layering so global controls stay above modals and the log console hides during SketchPad sessions
    - removed the manual parameter lock feature for a simpler workflow
    - fixed duplicate translation-key issues and updated labels such as `Reference Images`

## v2.4.0 - 2026-03-05

- Commit: `979bc38`
- Release title: Editor Layout Refinements & Fine-tuned Model Limits
- Tag subject: `v2.4.0: Editor Layout Fixes & Official Model Input Limits`
- Release notes summary:
    - refined the Interactive Image Editor sidebar layout and compact spacing
    - implemented official reference-image limits for generate mode versus editor mode
    - fixed the fullscreen editor sidebar overlay prominence issue

## v2.3.0 - 2026-03-04

- Commit: `f763213`
- Release title: UI Refinements & Global i18n
- Tag subject: `docs: Reorder README to place English section before Traditional Chinese`
- Release notes summary:
    - added a custom model selector with short and full model names
    - corrected sidebar layout issues for resolution and quantity controls
    - expanded prompt templates and translations across 9 languages
    - replaced native browser select inputs with custom UI components

## v2.2.0 - 2026-03-04

- Commit: `d3d92df`
- Release title: 9999 Prompt History Limit & Smart Rendering
- Tag subject: `Release v2.2.0 - Expanded Local History to 9999 items with optimized UI rendering`
- Release notes summary:
    - expanded local prompt history capacity to 9,999 records
    - limited dropdown rendering to the newest items to avoid UI lag with large histories

## v2.1.0 - 2026-03-02

- Commit: `46e5ff3`
- Release title: Sidebar Fix & Local History
- Tag subject: `Release v2.1.0 - Full Mobile Sidebar Fix & Permanent Local Prompt History`
- Release notes summary:
    - moved prompt history persistence to local disk instead of browser cache
    - fixed mobile and tablet z-index issues around sidebar and modal rendering

## v2.0 - 2026-03-01

- Commit: `1e40672`
- Release title: Release v2.0
- Tag subject: `feat: implement dual reference trays with drag and drop`
- Release notes summary:
    - added support for all Gemini image model paths used by the project at that time
    - introduced dual reference trays with drag-and-drop handling

## v1.3 - 2026-02-25

- Commit: `503ce40`
- Release title: Release v1.3
- Tag subject: `feat: 專案大幅改版更新`
- Release notes summary:
    - major project refresh and rebuild wave

## v1.2.3 - 2025-12-25

- Commit: `55373eb`
- Release title: Nano-Banana-Ultra-v1.2.3
- Release channel: pre-release
- Release notes summary:
    - hot fix of v1.2.2

## v1.2.2 - 2025-12-25

- Commit: `754f5b4`
- Release title: Nano-Banana-Ultra-v1.2.2
- Release channel: pre-release
- Release notes summary:
    - improvements and fixes in editor mode

## v1.2.1 - 2025-12-20

- Commit: `057554a`
- Release title: Nano-Banana-Ultra-v1.2.1
- Release channel: pre-release
- Release notes summary:
    - enhanced the ImageEditor prompt column UI

## v1.2.0 - 2025-12-20

- Commit: `75f9b7f`
- Release title: Nano-Banana-Ultra-v1.2.0
- Release channel: pre-release
- Release notes summary:
    - added the doodle editing feature
    - improved translations
    - enhanced overall UI

## v1.1.3 - 2025-12-19

- Commit: `730e6ef`
- Release title: Nano-Banana-Ultra-v1.1.3
- Release channel: pre-release
- Release notes summary:
    - early image-generation capability release captured on GitHub Releases

## Notes

- `v1.2.3`, `v1.2.2`, `v1.2.1`, `v1.2.0`, and `v1.1.3` appear on the published GitHub Releases and Tags pages, but they are not present in the current local `git tag --list` output.
- `v2.3.0` local tag subject comes from the tagged commit message, while the published GitHub Release title provides the product-facing version name.
