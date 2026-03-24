# Nano Banana Ultra Internal Smoke Checklist

This checklist is for internal use after feature work, wording cleanup, restore/import continuity changes, or before handing the app back for ongoing development.

It is not a release-certification document. Its purpose is to catch obvious regressions in the current product shell and the highest-risk continuity flows.

## Scope

Use this checklist when you need confidence that the current app state is good enough for:

- continued development
- internal demos
- internal daily use
- pre-release sanity verification

This checklist intentionally focuses on the current rebuilt shell:

- top response rail
- model-output surface / output strip behavior inside the top rail family
- center history canvas
- side tool panel or stage-adjacent actions bar
- bottom composer
- viewer
- restore/import/replay overlays
- queue surfaces
- grounding/provenance/structured-output result surfaces

## Prerequisites

- Node.js 18+
- dependencies installed with `npm install`
- a valid `.env.local` containing `GEMINI_API_KEY`
- local write access to the `output/` folder

## Recommended Preflight

1. Start the app with `npm run dev`.
2. Open `http://127.0.0.1:22287/api/health` and confirm:
    - `ok: true`
    - `hasApiKey: true`
3. Confirm the main app loads without a blank screen or fatal overlay.
4. Confirm the selected language renders without raw translation keys.
5. Confirm browser console does not show obvious fatal runtime errors.

## Automation Baseline Before Manual Smoke

Run these before or alongside the manual pass when practical:

1. `npm run test -- workspaceFlowTranslations`
2. `npm run test -- SurfaceSharedControls WorkspaceImportReview WorkspaceViewerOverlay WorkspaceSideToolPanel WorkspaceResponseRail`
3. `npm run test:e2e:restore:owner-paths`
4. `npm run test:e2e:restore:provenance`
5. `npm run test:e2e:restore:replay`
6. `npm run test:e2e:restore:queued-batch`
7. `npm run test:e2e:restore:shell-owners`
8. `npm run test:e2e:restore:viewer-owners`
9. `npm run test:e2e:restore:prompt-reuse`
10. `npm run test:e2e:restore:mainline-smoke`
11. `npm run test:e2e:restore:provenance-reuse`
12. `npm run test:e2e:restore:regression`

If time is limited, prioritize steps 1, 3, 4, and 12.

## Fast Internal Pass

This is the minimum recommended smoke pass for continued development and internal use.

### 1. Startup And Health

- [ ] App loads from the dev server.
- [ ] Health endpoint returns `ok: true` and `hasApiKey: true`.
- [ ] No startup crash, infinite spinner, or broken layout appears.
- [ ] Theme toggle still works.
- [ ] Language switch still works.

### 2. Basic Generation Path

- [ ] Enter a simple prompt and trigger image generation.
- [ ] A result lands in the main shell without the UI freezing.
- [ ] The top response rail updates with current workflow state.
- [ ] The center history canvas shows the new turn.
- [ ] The side tool panel reflects the current stage source.
- [ ] The bottom composer remains usable after generation completes.

Expected result:

- At least one successful image result appears.
- The app does not lose the current prompt, selected model, or current stage state unexpectedly.

### 3. Viewer Path

- [ ] Open the viewer from the generated stage result.
- [ ] Confirm the viewer shows the image.
- [ ] Confirm prompt text, ratio, size, and model metadata render.
- [ ] Confirm closing the viewer returns to the main shell cleanly.
- [ ] Confirm reopening the viewer still targets the same current stage result.

### 4. History And Continuation

- [ ] Select an earlier turn from the history canvas or recent history filmstrip.
- [ ] Use a continuation action from a history-like surface.
- [ ] Confirm the reopened or continued turn becomes the active working context.
- [ ] Confirm history labels do not collapse into obviously wrong generic actions.

### 5. Restore Notice Path

- [ ] Reload the app after a result exists.
- [ ] If a restore notice appears, confirm it renders localized, readable actions.
- [ ] Use `Open latest` or the equivalent current-language primary reopen action.
- [ ] Confirm the latest turn reopens correctly.
- [ ] Dismiss the restore notice and confirm the shell remains usable.

### 6. Import Review Path

- [ ] Export a workspace snapshot if needed.
- [ ] Import the snapshot.
- [ ] Confirm the import review modal appears.
- [ ] Confirm counts, latest turn summary, and viewer-image counts render.
- [ ] Confirm merge and replace actions are both visible and understandable.
- [ ] Complete one import path and confirm the resulting workspace state is usable.

### 7. Provenance And Insights

- [ ] Open a result with provenance or grounding metadata.
- [ ] Confirm the provenance panel shows a readable summary first.
- [ ] Expand one source or bundle detail.
- [ ] Confirm inspect paths open the correct detail target.
- [ ] Confirm clearing or changing selection resets detail focus cleanly.
- [ ] Use one provenance append action and one provenance replace action, then confirm the composer reflects the selected detail with the expected reference-cue formatting.

### 8. Structured Output Reuse

- [ ] Use a structured-output preset that returns reusable result text.
- [ ] Confirm the structured-output surface renders.
- [ ] Confirm copy / append / replace actions appear where expected.
- [ ] Perform one reuse action and verify the composer updates correctly.
- [ ] Open the viewer from the same result and confirm the top rail stays in compact structured-output mode while the viewer expands into the full structured-output layout.
- [ ] Use one append action and one replace action from structured output and confirm the composer reflects the expected text, including the preserved blank-line spacing for append.

### 9. Queue Surface

- [ ] Trigger a queued or batch-capable workflow if available.
- [ ] Open the queued jobs panel.
- [ ] Confirm job counts, states, and actions render.
- [ ] Reopen an imported or restored queued result when available.
- [ ] Confirm the reopened job leads back to the expected workspace result.

### 10. Theme And Overlay Pass

- [ ] Toggle light mode and dark mode at least once after the shell is already populated.
- [ ] Confirm the main shell does not leave bright panels behind in dark mode.
- [ ] Confirm the response rail, workflow rail, and composer action area all switch surfaces consistently.
- [ ] Open the restore notice if available and confirm both panel and backdrop are readable in light and dark.
- [ ] Open the import review modal and confirm summary cards, action groups, and footer buttons remain readable in light and dark.
- [ ] Open the session replay dialog and confirm timeline chips, focus card, and navigation buttons remain readable in light and dark.
- [ ] Open the reference tray and confirm dialog chrome, tabs, staged-asset cards, and backdrop remain readable in light and dark.
- [ ] Open the system panel and confirm it does not leave a light-only island in dark mode.
- [ ] After toggling dark mode, confirm the top model-output card, the right-side provenance family, and the context workflow summary still read as one coherent shell without a light-only island.

Expected result:

- No panel keeps a light-only gradient or white island when dark mode is active.
- Neutral action buttons use the same tokenized surface language across overlays.

### 10A. Output And Context Ownership Pass

- [ ] Confirm the top rail reads as one model-output owner surface rather than separate competing response/workflow cards.
- [ ] Confirm workflow summary is visible from the right-side context system instead of competing with model output for primary top-rail space.
- [ ] Confirm thoughts remain reachable but visually secondary to the primary result text or structured output.
- [ ] Confirm the stage-adjacent actions owner remains easy to reach without visually outweighing the center history workspace.
- [ ] Open `Reference Tray` from the stage-adjacent actions owner and confirm the sheet shows the capability hint plus references, editor-base, and stage-source summaries.
- [ ] Open `SketchPad` from the stage-adjacent actions owner and confirm it can close cleanly without leaving the shell in a blocked state.
- [ ] Open `Advanced Settings` from the composer workspace tools and confirm the capability-aware controls render without overlapping the shell owners.
- [ ] Expand `Workflow Log` from the right-side context system and confirm imported or restored workflow entries remain readable from that rail, without a second lower `Live Timeline` family or duplicate timeline framing appearing elsewhere.

### 11. Narrow Viewport Overlay Pass

- [ ] Run one pass at a narrow viewport using real browser device emulation or responsive mode.
- [ ] Confirm the reference tray stays inside the viewport and remains scrollable.
- [ ] Confirm close buttons remain visible without horizontal overflow.
- [ ] Confirm footer action groups in restore/import/replay dialogs wrap cleanly instead of clipping.
- [ ] Confirm no overlay traps the primary action behind another fixed layer.

## Expanded Internal Pass

Run this fuller pass before handing the app to teammates after larger shell or continuity changes.

### 12. Model Capability Sanity

- [ ] Switch among the main supported image models.
- [ ] Confirm unsupported controls lock or hide correctly.
- [ ] Confirm ratio, size, and reference-image limits update correctly.
- [ ] Confirm the app does not preserve impossible settings across model changes.

### 13. References, Sketch, And Editor Base

- [ ] Add at least one object reference.
- [ ] Add at least one character reference.
- [ ] Reorder references if the current flow supports it.
- [ ] Open the sketch pad path and confirm it still launches.
- [ ] Set or reuse an editor base and confirm the side tool panel updates.

### 14. Variant Promotion And Branching

- [ ] Generate multiple outputs if the current model supports variants or batch count > 1.
- [ ] Confirm results remain candidates until explicitly promoted.
- [ ] Promote one variant.
- [ ] Confirm the promoted result becomes the continuation source.
- [ ] Create or continue a branch from the promoted source.

### 15. Replay And Workflow Log Path

- [ ] Open a result with a replayable workflow log.
- [ ] Enter the replay path.
- [ ] Confirm the replay UI opens with readable localized chrome.
- [ ] Confirm returning from replay preserves the current workspace state.

### 16. Shared Controls And Shell Cohesion

- [ ] Open the shared controls surface.
- [ ] Confirm the current prompt, quantity, references, and active sheet summary render.
- [ ] Confirm the side tool panel, response rail, and shared controls agree on the current state.
- [ ] Confirm no secondary panel duplicates owner actions in an obviously confusing way.

### 17. Official Conversation Path

- [ ] Trigger one request through the official conversation flow if the current environment supports it.
- [ ] Confirm the new turn metadata persists.
- [ ] Reload and confirm the restored official conversation can continue.

### 18. Localization Sanity

At minimum, spot-check:

- [ ] `en`
- [ ] `zh_TW`
- [ ] `zh_CN`
- [ ] one of `ja`, `ko`, `es`, `fr`, `de`, or `ru`

For each checked locale, confirm:

- [ ] restore notice labels are readable
- [ ] import review labels are readable
- [ ] history-related action wording is not obviously wrong
- [ ] viewer labels are localized and consistent
- [ ] no raw translation keys appear in the shell

## Exit Criteria For Internal Use

The app is in a good internal-use state when all of the following are true:

1. The preflight passes.
2. The fast internal pass is clean.
3. No blocker or data-loss bug is discovered.
4. No major shell region is visually broken.
5. Restore/import/continue/replay paths remain usable.

## Failure Severity Guide

Treat these as blockers for internal use:

- app does not boot
- health endpoint is broken
- generation cannot complete at all
- restore or import loses usable state
- viewer cannot open a current result
- continuation selects the wrong turn or wrong source
- replay or provenance UI crashes the shell
- raw translation keys appear in primary surfaces

Treat these as non-blocking but worth logging:

- minor wording drift
- low-priority spacing or layout issues
- awkward but understandable localized phrasing
- duplicated secondary helper copy that does not block task completion

## Suggested Bug Report Template

When this smoke pass finds an issue, record:

1. build or branch name
2. locale
3. selected model
4. exact surface where the issue appears
5. reproduction steps
6. expected result
7. actual result
8. screenshot if UI-related
9. whether the issue blocks internal use

## Recommended Execution Order

If you only have 15 to 20 minutes:

1. Preflight
2. Basic generation path
3. Viewer path
4. History and continuation
5. Restore notice path
6. Import review path

If you have 30 to 45 minutes:

1. Run the full fast internal pass
2. Add provenance, structured-output reuse, and queue checks

## Post-Reorg Delta Notes

Apply these wording and expectation deltas after the approved workspace shell reorg lands. Until then, the checklist above still describes the current shipped shell.

### Surface naming deltas

1. `top response rail` becomes `Output Strip`, with one `Model Output` surface plus either a slim workflow summary card or an embedded workflow summary row.
2. `side tool panel` becomes `Stage Actions Bar` or equivalent stage-adjacent tool surface.
3. `Provenance And Insights` plus `Replay And Workflow Log Path` should be interpreted through one `Context Rail` family rather than separate major dashboard surfaces.

### Smoke expectation deltas

1. In `Basic Generation Path`, replace `The top response rail updates with current workflow state` with `The Output Strip updates its model output and workflow summary without duplicating detailed context`.
2. In `Basic Generation Path`, replace `The side tool panel reflects the current stage source` with `The stage-adjacent actions/tool surface reflects the current editable source and editor-base state`.
3. In `Provenance And Insights`, expect one unified Context Rail where current source, session and branch, provenance, and workflow timeline share a summary-first hierarchy.
4. In `Replay And Workflow Log Path`, confirm replay still works, but also confirm the workflow timeline detail now lives under the Context Rail instead of a competing parallel panel family.
5. In that same replay/workflow pass, confirm the `Workflow Log` detail reads as a first-class context card and that no separate `Live Timeline` eyebrow or lower duplicate wrapper remains.
6. In `Shared Controls And Shell Cohesion`, compare `Output Strip`, `Context Rail`, `Stage Actions Bar`, and shared controls for state agreement instead of comparing the older `side tool panel` and split context surfaces.
7. Add an explicit theme pass: in both light and dark themes, confirm the major shell families read as one coherent hierarchy rather than a mixture of unrelated bright/dark cards, overlays, and wells.
8. Add an explicit editor-entry pass: confirm the old always-visible `Open Editor` wording is gone and the stage-adjacent CTA changes correctly with state (`Edit current image`, `Continue editing`, or `Upload base to edit`, or their localized equivalents).

## 中文版

這份 checklist 用於內部驗證，適合在功能開發、文案調整、restore/import 延續性變更之後，或在把 app 交還給團隊持續開發之前使用。

它不是正式發版認證文件。它的目的，是在目前產品 shell 與高風險延續流程上，盡快抓出明顯回歸。

### 適用範圍

當你需要確認目前 app 狀態足以支撐下列用途時，請使用這份 checklist：

- 持續開發
- 內部 demo
- 內部日常使用
- 發版前 sanity verification

這份 checklist 刻意聚焦在目前重建後的 shell：

- 上方 response rail
- 中央 history canvas
- 側邊 side tool panel
- 底部 composer
- viewer
- restore/import/replay overlays
- queue surfaces
- grounding/provenance/structured-output result surfaces

### 前置條件

- Node.js 18+
- 已執行 `npm install`
- `.env.local` 中含有效 `GEMINI_API_KEY`
- `output/` 目錄可正常寫入

### 建議 Preflight

1. 以 `npm run dev` 啟動 app。
2. 開啟 `http://127.0.0.1:22287/api/health` 並確認：
    - `ok: true`
    - `hasApiKey: true`
3. 確認主 app 載入時沒有白畫面或致命錯誤遮罩。
4. 確認目前語系不會出現原始 translation key。
5. 確認瀏覽器 console 沒有明顯致命 runtime error。

### 手動 Smoke 前的自動化基線

可行時，在手動檢查前或同時執行下列項目：

1. `npm run test -- workspaceFlowTranslations`
2. `npm run test -- SurfaceSharedControls WorkspaceImportReview WorkspaceViewerOverlay WorkspaceSideToolPanel WorkspaceResponseRail`
3. `npm run test:e2e:restore:owner-paths`
4. `npm run test:e2e:restore:provenance`
5. `npm run test:e2e:restore:replay`
6. `npm run test:e2e:restore:queued-batch`

如果時間有限，優先跑第 1、3、4 項。

### 快速內部檢查

這是目前建議的最低 smoke pass，適合持續開發與內部使用。

#### 1. 啟動與健康檢查

- [ ] app 可由 dev server 正常載入。
- [ ] health endpoint 回傳 `ok: true` 與 `hasApiKey: true`。
- [ ] 沒有啟動即 crash、無限 spinner 或版面破損。
- [ ] theme toggle 仍可切換。
- [ ] language switch 仍可切換。

#### 2. 基本生成路徑

- [ ] 輸入簡單 prompt 並觸發圖片生成。
- [ ] 結果可落入主 shell，且 UI 不會卡死。
- [ ] 上方 response rail 會更新目前 workflow state。
- [ ] 中央 history canvas 會出現新 turn。
- [ ] 側邊 side tool panel 會反映目前 stage source。
- [ ] 生成完成後，底部 composer 仍可正常使用。

預期結果：

- 至少出現一個成功圖片結果。
- app 不應意外遺失目前 prompt、所選 model 或 current stage state。

#### 3. Viewer 路徑

- [ ] 從目前 stage result 打開 viewer。
- [ ] 確認 viewer 能顯示圖片。
- [ ] 確認 prompt 文字、ratio、size、model metadata 正常渲染。
- [ ] 關閉 viewer 後能乾淨返回主 shell。
- [ ] 再次開啟 viewer 時，仍指向同一個 current stage result。

#### 4. 歷史與延續

- [ ] 從 history canvas 或 recent history filmstrip 選擇較早的 turn。
- [ ] 從 history 類 surface 觸發一次 continuation action。
- [ ] 確認重新打開或延續後的 turn 成為目前 active working context。
- [ ] 確認 history labels 不會退化成明顯錯誤的泛用文案。

#### 5. Restore Notice 路徑

- [ ] 在已有結果後重新整理 app。
- [ ] 若出現 restore notice，確認其文案已本地化且可讀。
- [ ] 使用 `Open latest` 或目前語系下的主要 reopen action。
- [ ] 確認最新 turn 能正確重新開啟。
- [ ] 關閉 restore notice 後，shell 仍保持可用。

#### 6. Import Review 路徑

- [ ] 必要時先匯出一份 workspace snapshot。
- [ ] 導入該 snapshot。
- [ ] 確認 import review modal 出現。
- [ ] 確認 counts、latest turn summary、viewer-image counts 正常顯示。
- [ ] 確認 merge 與 replace 兩條 action 都可見且易懂。
- [ ] 完成其中一條 import 路徑，並確認結果 workspace state 可用。

#### 7. Provenance 與 Insights

- [ ] 打開一個帶 provenance 或 grounding metadata 的結果。
- [ ] 確認 provenance panel 先顯示可讀的 summary。
- [ ] 展開至少一個 source 或 bundle detail。
- [ ] 確認 inspect path 會打開正確的 detail target。
- [ ] 確認清除或切換 selection 後，detail focus 會正常重設。

#### 8. Structured Output 重用

- [ ] 使用一個會回傳可重用結果文字的 structured-output preset。
- [ ] 確認 structured-output surface 有正常渲染。
- [ ] 確認 copy / append / replace actions 出現在預期位置。
- [ ] 實際執行其中一個 reuse action，確認 composer 正確更新。

#### 9. Queue Surface

- [ ] 若環境可用，觸發一個 queued 或 batch-capable workflow。
- [ ] 打開 queued jobs panel。
- [ ] 確認 job counts、states、actions 正常顯示。
- [ ] 在可行時重新打開一個 imported 或 restored queued result。
- [ ] 確認重新打開的 job 能回到預期 workspace result。

### 擴充內部檢查

在較大規模的 shell 或延續性變更後，把 app 交給其他團隊成員前，建議加跑這一輪。

#### 10. Model Capability 基本檢查

- [ ] 在主要支援的 image models 間切換。
- [ ] 確認不支援的 controls 會正確鎖定或隱藏。
- [ ] 確認 ratio、size、reference-image limits 會正確更新。
- [ ] 確認切換 model 後不會殘留不可能成立的設定。

#### 11. References、Sketch 與 Editor Base

- [ ] 加入至少一張 object reference。
- [ ] 加入至少一張 character reference。
- [ ] 若目前流程支援，測試一次 reference reorder。
- [ ] 打開 sketch pad 路徑並確認仍可啟動。
- [ ] 設定或重用一個 editor base，並確認 side tool panel 有更新。

#### 12. Variant Promotion 與 Branching

- [ ] 若模型支援 variants 或 batch count > 1，產出多個結果。
- [ ] 確認結果在明確提升前仍保持 candidate 狀態。
- [ ] 提升其中一個 variant。
- [ ] 確認提升後的結果成為 continuation source。
- [ ] 從該 promoted source 建立或延續一個 branch。

#### 13. Replay 與 Workflow Log 路徑

- [ ] 打開一個帶 replayable workflow log 的結果。
- [ ] 進入 replay path。
- [ ] 確認 replay UI 可以打開，且 chrome 已本地化且可讀。
- [ ] 確認從 replay 返回後，current workspace state 仍被保留。

#### 14. Shared Controls 與 Shell 一致性

- [ ] 打開 shared controls surface。
- [ ] 確認 current prompt、quantity、references、active sheet summary 正常渲染。
- [ ] 確認 side tool panel、response rail、shared controls 對目前狀態描述一致。
- [ ] 確認沒有次要面板以明顯混淆的方式重複 owner actions。

#### 15. Official Conversation 路徑

- [ ] 若環境支援，透過 official conversation flow 觸發一次 request。
- [ ] 確認新 turn metadata 有持久化。
- [ ] 重新整理後，確認 restored official conversation 仍可繼續。

#### 16. Localization 基本檢查

至少抽查：

- [ ] `en`
- [ ] `zh_TW`
- [ ] `zh_CN`
- [ ] `ja`、`ko`、`es`、`fr`、`de`、`ru` 任一語系

對每個抽查語系，確認：

- [ ] restore notice labels 可讀
- [ ] import review labels 可讀
- [ ] history 相關 action wording 沒有明顯語意錯誤
- [ ] viewer labels 已本地化且一致
- [ ] shell 中沒有原始 translation key

### 內部使用通過條件

當下列條件全部成立時，可視為目前 app 達到良好的 internal-use 狀態：

1. preflight 通過。
2. 快速內部檢查通過。
3. 沒發現 blocker 或 data-loss bug。
4. 沒有主要 shell 區域出現視覺破損。
5. restore/import/continue/replay 路徑仍可使用。

### 問題嚴重度指引

下列情況應視為內部使用 blocker：

- app 無法啟動
- health endpoint 損壞
- 完全無法完成生成
- restore 或 import 造成可用狀態遺失
- viewer 無法打開目前結果
- continuation 選錯 turn 或錯誤 source
- replay 或 provenance UI 讓 shell crash
- 主要 surface 出現 raw translation keys

下列問題可先記錄，但不一定阻擋內部使用：

- 輕微文案漂移
- 低優先級 spacing 或 layout 問題
- 文意略彆扭但仍可理解的本地化措辭
- 雖重複但不妨礙完成任務的次要輔助文案

### 建議 Bug Report 模板

當這份 smoke pass 發現問題時，請記錄：

1. build 或 branch 名稱
2. locale
3. selected model
4. 問題出現的精確 surface
5. 重現步驟
6. 預期結果
7. 實際結果
8. 若與 UI 有關，附上 screenshot
9. 該問題是否阻擋內部使用

### 建議執行順序

如果你只有 15 到 20 分鐘：

1. Preflight
2. Basic generation path
3. Viewer path
4. History and continuation
5. Restore notice path
6. Import review path

如果你有 30 到 45 分鐘：

1. 跑完整個快速內部檢查
2. 再加跑 provenance、structured-output reuse 與 queue 檢查

## 改版後增量備註

當核准的 workspace shell reorg 落地後，請套用下列名稱與預期更新；在那之前，上面的 checklist 仍描述目前已交付的 shell。

### Surface 名稱更新

1. `top response rail` 應改讀為 `Output Strip`，其中包含一個 `Model Output` surface，以及一個 slim workflow summary card 或嵌入式 workflow summary row。
2. `side tool panel` 應改讀為 `Stage Actions Bar` 或等價的舞台鄰接工具 surface。
3. `Provenance 與 Insights` 加上 `Replay 與 Workflow Log 路徑`，應以單一 `Context Rail` family 理解，而不是多個平行大型 dashboard surface。

### Smoke 預期更新

1. 在 `基本生成路徑` 中，把 `上方 response rail 會更新目前 workflow state` 改成 `Output Strip 會更新 model output 與 workflow summary，且不重複顯示完整 context detail`。
2. 在 `基本生成路徑` 中，把 `側邊 side tool panel 會反映目前 stage source` 改成 `舞台鄰接的 actions/tool surface 會反映目前可編輯 source 與 editor-base state`。
3. 在 `Provenance 與 Insights` 中，預期單一 `Context Rail` 以 summary-first hierarchy 收納 current source、session and branch、provenance、workflow timeline。
4. 在 `Replay 與 Workflow Log 路徑` 中，除了確認 replay 仍可用，也要確認 workflow timeline detail 已收進 `Context Rail`，不再作為平行大面板家族存在。
5. 在同一個 replay/workflow pass 中，確認 `Workflow Log` detail 是 `Context Rail` 內的一級卡片，且不再有獨立的 `Live Timeline` 眉標或下層重複 wrapper。
6. 在 `Shared Controls 與 Shell 一致性` 中，改為對照 `Output Strip`、`Context Rail`、`Stage Actions Bar`、以及 shared controls 的狀態一致性，而不是沿用舊的 `side tool panel` 與拆散的 context surfaces。
7. 加上一條明確的 theme 檢查：在亮色與暗色主題下，都要確認主要 shell family 呈現一致 hierarchy，而不是混出彼此無關的亮暗卡片、overlay 與 wells。
8. 加上一條明確的 editor-entry 檢查：確認舊的固定 `Open Editor` 文案已移除，並改為會隨狀態變化的 CTA，例如 `Edit current image`、`Continue editing`、或 `Upload base to edit`，或各語系下的等價文案。
9. Spot-check at least two locales

If you are close to release:

1. Run the automation baseline
2. Run the full expanded internal pass
3. Record failures using the bug report template
