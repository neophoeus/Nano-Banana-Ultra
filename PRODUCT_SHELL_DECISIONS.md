8. `Current Stage Source` 這組 open / continue / branch 直接動作已完成 secondary-surface 收斂；`WorkspaceInsightsSidebar`、`SessionReplayDialog`、`GlobalLogConsole` 現在都只保留 badge / narrative / owner-route，後續若還有相關工作，重點會是 wording 或 history-owner polish，而不是平行執行按鈕收尾。
   | `Current Stage Source` open / continue / branch | `WorkspaceInsightsSidebar` timeline row, `SessionReplayDialog`, `GlobalLogConsole` | Done | canonical owner 已確認回到 center history canvas；三個 secondary surfaces 都已移除 parallel continue / branch，只保留回到 history owner 的單一路由與敘事狀態 | 後續僅保留 wording / route naming / history-owner polish，不再回退成平行 triplet |

# Nano Banana Ultra Product Shell Decisions

## Purpose

這份文件記錄目前已確認的產品版面決議與設計構想。

它不是單純的工程待辦清單，而是用來回答下面幾個問題：

1. 這次為什麼要重整 shell。
2. 版面的中心思想是什麼。
3. 哪些功能要保留，哪些只是重新收斂呈現。
4. 每一類能力之後應該由哪一個畫面區域負責。
5. 後續實作時，什麼可以調整，什麼不應再漂移。

從這次整理開始，這份文件也同時承接產品層級的完成度總表。

如果要決定 code-review package 邊界、commit 切法、或 docs cleanup wave 的攜帶順序，請改看 `WORKING_TREE_PACKAGE_MAP.md`；這份文件只負責產品決議、完成度判讀、以及不可回退的 shell 方向。

如果只是要快速回答下面這些問題，應優先看這份，而不是分別去翻 spec、README、repo memory：

1. 目前哪些功能已經算完成或接近完成。
2. 哪些仍然沒做完。
3. 哪些是已定方向但尚未落地的 shell 決議。
4. 下一個 session 應該把哪些前提視為不可回退。

## Current Product Status Snapshot

這一段是目前產品層級的統整判讀，不是逐條 commit 紀錄。

### What is effectively done or baseline-stable

1. 官方 chat-based continuation correctness 已完成，剩下主要是 UX refinement，不是 continuation correctness 本身。
2. 官方 queued batch workflow 的核心流程已完成，包含 submit、poll、cancel、resume/recovery、result import；剩下主要是 UX 深化，不是執行正確性缺口。
3. restore / import / replay 核心流程已完成，且近期 restore Playwright 全套、相關 shell/restore Vitest coverage、以及 production build 都已回到綠燈。
4. restore / import / replay 這條 browser-path locale 驗證已明確補齊到全部 9 個支援語言：`en`、`zh_TW`、`zh_CN`、`ja`、`ko`、`es`、`fr`、`de`、`ru`。
5. history / branch / continuation / source-active 這套語意已經建立起來，不是未開始的功能。
6. provenance 核心能力已具備 drill-down、compare、composer reuse 等深度，不是從零開始的狀態。
7. SketchPad、ImageEditor、staged assets、viewer、gallery、workspace snapshot 這些核心 workspace 能力都已在基線中。
8. top response rail 已落地成為主要的 model response / thoughts / workflow summary 區域，不再只是 header 附屬狀態帶。
9. `Recent Turns` 已正式吃進 center history canvas，成為 recent lane，而不是底部獨立 strip。
10. side tool panel 已成為 references / upload-base / SketchPad / ImageEditor 的 canonical owner surface。
11. 右側大型 context panels 已壓成 summary-first / collapsible 結構；current stage source、active branch、continuity 維持高可見，其餘 session stack、lineage map、timeline history、session hints 改為收合展開。
12. composer 與 top header 對 references / editor 的重複直接動作已完成第一波去重，canonical action button 規則已開始真正落地，而不是只停留在文件。
13. provenance detail 內層也已進入同一套 summary-first 基線：citation detail、provenance source、composer reuse、source / bundle status cards、compare lists、selected bundle segment text 都改為先顯示摘要，再展開次級 attribution 細節；compare/detail rows 也已收斂成卡片或 summary 的單一路徑，不再重複放 Inspect Source / Bundle 按鈕。
14. top response rail、import review、restore notice、branch rename、recent-history filmstrip、side tool panel、viewer overlay、picker references、picker gallery、composer guidance、shared controls 的次級說明與 fallback 路徑也已進入 summary-first 基線；使用者先看到 thoughts preview、branch / replace 摘要、restore 主要路徑、branch rename 的 automatic-label 摘要、recent turns filmstrip 的導覽摘要、viewer inspect 摘要、picker / composer / shared-controls 的關鍵摘要與 shared-state 概況，再決定是否展開細節，而 import / restore modal、insights sidebar、recent-history filmstrip header、以及 picker gallery 也不再平行暴露重複的 continue / branch 或 gallery、prompt history、references 這類應回到 owner surface 的直接捷徑。
15. queued batch panel 的 imported-result previews 與 header guidance 也已改為摘要優先；先顯示 active cue、計數與 sibling 切換，以及 queue workflow 的摘要提示，再按需展開完整 preview rail、prompt/result 細節與 conversation notice。

### What is still not done

1. capability truth 還沒有完全對齊，主規格仍把這列為 open gap。
2. search request semantics 還沒有完整拆成目標中的三種明確模式。
3. root shell 的 state / orchestration ownership 仍然偏重，`App.tsx` 周邊重整尚未真正收尾。
4. shell-wide i18n parity 仍未全面完成，目前是局部完成、不是全域完成。
5. provenance 仍有 locale-safe polish 與後續 advanced-path polish 空間。
6. shell 新架構雖然已經落下主要骨架，但 canonical-action 去重還沒有全部收尾；gallery picker 這類明顯 secondary history surface 已完成 open-plus-rename 收斂，後續剩下的風險主要在 viewer 與其他尚未再確認的 secondary surfaces。
7. import / restore / queue / viewer 等次級 surface 雖然已完成一輪 summary-first 收斂，但跨 surface 的 wording、CTA hierarchy、與 canonical-owner 導流仍有再收尾空間。
8. `Current Stage Source` 這組 open / continue / branch 直接動作已完成 secondary-surface 收斂；後續若仍需調整，應視為 history-owner wording / route polish，而不是再回到 timeline、replay、或 global log 補 parallel action buttons。
9. 2026-03-24 已完成這一輪 bounded shell closure：上方 `WorkspaceResponseRail` 現在以單一 `Model Output` family 為主，workflow 只保留 slim summary 層，不再是與 response / structured output / thoughts 等權的平行大卡家族。
10. 右側 `WorkspaceInsightsSidebar`、中央 provenance support surface、以及 header/global-log 家族的主要 owner 關係也已完成第一輪收斂：目前的 baseline 是單一 `Context Rail`，由 workflow summary、current source、session and branch、provenance、workflow timeline 組成分層系統，而不是平行大面板。
11. `WorkspaceSideToolPanel` 也已完成這輪 owner re-scaling：它現在應被理解成 stage-adjacent `Stage Actions Bar`，而 `Open Editor` 固定文案已改成 state-aware CTA。後續若再調整，應屬 wording / polish，而不是回退 owner hierarchy。

### Bottom-line assessment

目前不能說「所有功能都做完了」。

更準確的說法是：

1. execution-heavy 核心功能大多已完成並有相當程度驗證。
2. 產品層整合、shell ownership 收斂、功能入口去重，現在已進入 closure 階段而不是概念階段；新版空間結構的主要骨架已落地，但 owner-surface cleanup 還沒完全結束。
3. 現在的主工作不再是把核心能力從零做出來，而是把既有能力整理成更清楚、更乾淨、不可重複的產品外形。

## Why This Change Exists

目前的問題不是功能不夠，而是同一個功能或同一段語意，出現在太多地方。

實際症狀如下：

1. 使用者同時看到 top header、stage、sidebar、filmstrip、picker、composer 都在說明狀態，重複感很重。
2. `Source Trail`、`Session & Lineage`、`Workflow Log` 等區塊雖然有資料，但只要仍以大面積 dashboard 方式出現，就會搶走主流程注意力。
3. 主舞台目前太偏向「單張圖片展示」，但產品實際上早就已經是 conversation、history、branch、continuation 為主的工作流。
4. 圖像工具、設定、引用來源、生成動作分散在不同地方，使用者需要來回掃描與比對，心智負擔偏高。

這次重整的目標不是砍功能，而是把能力重新排到比較清楚、只出現一次的空間結構裡。

## Core Product Concept

新的 shell 採用一個更明確的心智模型：

Top = model speaks  
Center = image history workspace  
Side = image tools  
Bottom = user speaks

這代表產品的閱讀順序會變成：

1. 先看模型現在在回什麼、想什麼、目前狀態如何。
2. 再看這條工作脈絡裡已經產生了哪些圖，以及目前選中哪一張。
3. 如果要加圖像工具或素材，從側邊工具區操作。
4. 如果要發下一輪指令，由底部 composer 完成。

## Confirmed Decisions

### 1. Keep all capabilities, but give each capability one owner surface

這次不刪除既有核心能力，也不回退已完成的 continuation、restore、import、queue、provenance 語意。

真正要做的是把同一能力從多處重複出現，收斂成一個主要擁有者。

### 1A. One capability, one canonical action button

除了 owner surface 只能有一個之外，每一個功能也只能有一個 canonical action button。

這代表：

1. 同一個功能不應在不同區域各放一顆可直接執行的按鈕。
2. 如果其他區域需要提示這個功能存在，只能顯示狀態、摘要，或導向 canonical owner 的入口。
3. 不允許 top、center、side、bottom 同時各自放一顆能做同一件事的按鈕。

實作判準：

1. 一個功能只能有一個主要按鈕真正執行該功能。
2. 其他地方若出現相似控制，只能是 `Open`、`Manage`、`View details` 這類導流按鈕，不能是第二顆獨立執行按鈕。
3. 如果某個功能需要被多處看見，應優先讓多處共享同一個 owner surface，而不是複製按鈕。

這條規則直接套用到本次改版，例如：

1. `Generate` 只能由 bottom composer 的主要按鈕執行。
2. `Queue Batch Job` 只能由 bottom composer 的次要按鈕發起。
3. queue 的其他區域只能顯示摘要或導向 queue 管理面，不能再出現第二顆發起 queue 的按鈕。
4. `Recent Turns` 被吃進 center history canvas 後，open / continue / branch 應由中心 history 結構提供，不應再在別的平行區塊複製一組相同按鈕。

### 1B. Resolved decision for `Current Stage Source` direct actions

`Current Stage Source` 是這輪 canonical-action cleanup 最後一個明確需要產品決策的 action family。

已確認決策如下：

1. `Current Stage Source` 的直接 open / continue / branch 動作，canonical owner 應回到 center history canvas 的 history structure，而不是留在右側 timeline、session replay、或 global log。
2. `WorkspaceInsightsSidebar`、`SessionReplayDialog`、`GlobalLogConsole` 仍可保留 `Current Stage Source` 的 badge、狀態、timeline 訊息、以及 replay/log 敘事內容，但不應各自再維持完整的三顆直接 action 按鈕。
3. 這些次級 surfaces 若仍需要可操作入口，應收斂成單一導流動作，例如 `Open in history` 或等價的 owner-surface route，而不是第二套 open / continue / branch 執行點。
4. `SessionReplayDialog` 與 `GlobalLogConsole` 的定位是流程回放與敘事追蹤，不是 history-turn mutation 的 canonical owner；因此它們應偏向 inspection / routing，而不是直接承擔 source-action execution。
5. 這個決策已在 2026-03-20 完成 coordinated implementation：timeline / replay / global-log / insights-sidebar secondary surfaces 都已收斂成單一路由回 history owner，後續若仍需調整，焦點只剩 route naming、CTA wording、與 history-owner polish，而不是恢復平行執行按鈕。

### 2. The top area becomes the response rail

最上方區域是模型的 thinking、response、status 空間。

它的角色是：

1. 顯示模型文字回覆與 thought summary。
2. 顯示目前 generation 或 workflow 的即時狀態。
3. 成為文字型模型輸出的唯一主要位置。

它不應再只是品牌 header 上面附一個小 console，也不應把回覆資訊分散到 support cards 與 context rail。

### 2A. Approved 2026-03-24 follow-up: the top area becomes an `Output Strip`, not three peer cards

目前 top rail 已經正確成為模型輸出的主要區域，但它還不是這輪 closure 的終點型態。

下一輪已確認的收斂方向如下：

1. response text、structured output、thoughts 應視為同一個 `Model Output` family，而不是三個彼此競爭主視覺權重的平行 card。
2. `Structured Output` 應被視為 answer 的一種呈現格式，不是獨立產品區塊。
3. `Thoughts` 應降級為 `Model Output` 裡的次級內容，預設應採 disclosure、tab、或其他 summary-first 呈現，而不是單獨主卡。
4. workflow 在 top area 只應保留摘要層，回答「現在系統在做什麼」，不再承擔 provenance、session、timeline 等完整脈絡責任。
5. 這代表 top area 的長期名稱與責任更接近 `Output Strip`，不是延續目前三卡等權語意的 `response rail`。

這個 follow-up 會明確取代「response、thoughts、workflow 三卡並列」的暫時結構，但不回退 top rail 作為 model-speech owner 的核心決策。

### 2B. Approved 2026-03-24 follow-up: workflow belongs to one unified context system

workflow 與 source/provenance/session/lineage 雖然不是完全同一件事，但它們屬於同一個 context family，而不是兩個平行大區塊。

已確認的下一輪方向如下：

1. `Workflow Status` 可以在 top area 保留 slim summary，但不應再和 `Context Rail` 形成兩套完整資訊家族。
2. 完整的 current source、session and branch、provenance、workflow timeline 應整併到單一 `Context Rail`。
3. 這個 `Context Rail` 的正確層級是：最上層 current-state summary，下層可展開的 source / session / provenance / timeline detail。
4. 若之後做更激進的版型收斂，`Workflow Status` 甚至可以完全收回 `Context Rail` 的頂部摘要列；但第一輪建議保守版，先保留 slim summary 卡，避免即時狀態可見性下降。
5. 不接受的版本是：top rail 繼續保留完整 workflow 家族，而右側又保留完整 workflow log / provenance / lineage 家族。那只是換位置重複，不是收斂。

這個方向已在 2026-03-24 的後續 bounded pass 落地到更完整的完成態：

1. `Workflow Log` 現在是 `Context Rail` 主卡堆疊內的一級 card，不再是下方獨立家族。
2. 舊的 `Live Timeline` 重複眉標與下層 standalone timeline wrapper 已移除。
3. 目前的 right-side baseline 應讀作一個統一的 `Context Rail`，其中 workflow timeline/system-log detail 與 current source、session and branch、provenance 同屬一個 owner hierarchy。

### 2C. Approved 2026-03-24 follow-up: stop mixing bright/dark surface families

目前 UI 的主問題不只在資訊重複，也在於表面語言不一致。

已確認的下一輪方向如下：

1. 目前 shell 已有自己的 panel/well/chip token，但實作上仍混用許多局部亮色、暗色、透明白底、透明黑底與一次性背景色，造成視覺層級不穩定。
2. 下一輪 shell reorg 必須同時包含 color-system cleanup，而不是只做版面移位。
3. 原則上應由共享 shell token 決定 header、output strip、stage hero、context rail、composer dock 的 surface hierarchy，不再讓各元件自行拼接彼此風格不一致的 light/dark 背景。
4. `theme toggle still works` 只是最低限度；真正的完成條件是亮色與暗色主題都能讀出一致的 owner hierarchy，而不是出現「某些卡像亮色、某些卡像暗色、某些卡像臨時玻璃層」的混雜感。
5. 這個 cleanup 不應拖到很後面，它和 `Model Output` / `Context Rail` / `Stage Actions Bar` 的新 hierarchy 是同一輪 closure work。

### 3. The center becomes history-first, not single-image-first

主舞台不再預設是一張放大的單圖。

新的中心區是 image history workspace，優先回答這些問題：

1. 這條工作脈絡目前有哪些圖。
2. 最近產生了哪些結果。
3. 哪一張目前被選中。
4. 各張圖之間的 turn、branch、continuation 關係是什麼。

單張圖的大圖檢視仍然保留，但它應該是 focus mode，而不是首頁預設主角。

### 3A. What `Recent Turns` is now, and where it goes next

目前底部的 `Recent Turns`，本質上是 `RecentHistoryFilmstrip`。

它現在的角色不是完整 history workspace，而是快速回看 recent turns 的 scan strip，主要用途是：

1. 快速掃視最近幾個結果。
2. 直接 open 某個 recent turn。
3. 從某個 recent turn 直接 continue 或 branch。
4. 快速看目前 stage source、branch、queued-batch sibling 這類輕量狀態。

所以它目前比較像「recent history 快捷列」，不是完整 gallery，也不是主舞台本身。

改版後，它不應再作為獨立的底部常駐 strip 繼續存在。

正確去向是：

1. 併入 center history canvas，成為中心 history workspace 的其中一個區段或預設首屏層。
2. 它的 quick recall、open、continue、branch 作用保留，但成為中心 history 結構的一部分。
3. 如果改版過渡期暫時還保留 strip 形式，它也應只是中心 history canvas 的附屬入口，而不是一個與 center canvas 平行的第二個 history 區。

簡單說：

1. 現在的 `Recent Turns` 是獨立的 recent-history 快捷列。
2. 改版後它會被吃進 center history canvas。
3. 它保留功能，但不再保留獨立版位地位。

### 3B. Confirmed placement for `Recent Turns`

`Recent Turns` 的正式去向已確認：

1. 採用 center history canvas 最上方的 `recent lane` 形式。
2. 它不再是底部獨立 strip，也不是與完整 history workspace 平行的第二個 history 模式。
3. 它是中心 history canvas 的第一層快速掃視區，下面再接完整的 history canvas 內容。

選這個方案的原因：

1. 最符合 `Recent Turns` 原本的 quick recall 性質，不會錯誤升格成完整 workspace。
2. 能保留 open、continue、branch、快速比較 recent turns 的效率。
3. 不會像獨立 tab 一樣多做一層模式切換，也不會像左側窄欄那樣和其他 context/tool 結構搶位。

這代表改版後的中心區建議閱讀順序是：

1. 先看最上方的 `Recent Turns lane`。
2. 再往下進入完整 history canvas。
3. 點選某張結果後在中心進入 focus state，必要時再開 viewer overlay。

### 4. Single-image view becomes focus mode

當使用者在 history canvas 中點選某張圖時，該圖可以進入較大的 focus state，或交給 viewer overlay 深入查看。

`GeneratedImage` 應該被重新定位為「選中結果的 renderer」，而不是整個首頁中心的預設 owner。

### 5. The separate top settings strip should be removed

目前 header 下方那條 model、ratio、size、batch、references 設定帶，不應繼續作為一整條常駐主結構。

後續方向是：

1. 只保留靠近 selected image 或 focus state 的 settings summary。
2. 詳細設定改成 open-on-demand。
3. references 不再屬於這條摘要設定，而是移到 side tool panel。

### 6. References, uploads, SketchPad, editor belong to one side tool panel

所有圖像相關工具應整合到同一側工具區，不再散落在 header、stage 快捷、composer、不同 drawers 裡。

這個區域的責任包括：

1. references
2. uploads
3. SketchPad
4. ImageEditor
5. 其他圖像輸入與圖像處理工具

如果中心 history canvas 保留任何快捷入口，那也應該只是導向同一個工具區，而不是再創造第二套管理面。

### 6A. Approved 2026-03-24 follow-up: the side tool panel should collapse into a stage-adjacent actions bar

`WorkspaceSideToolPanel` 已完成第一輪 owner consolidation，但它不應被當成新版 shell 的最終重型家族。

下一輪已確認的方向如下：

1. tools 的 canonical ownership 不變，references、uploads、SketchPad、editor 仍屬同一個工具家族。
2. 版面地位應調降：它更像 `Stage Actions Bar`，是緊貼目前舞台的操作層，而不是與 top rail、history canvas、context rail 等權的大卡面板。
3. `Open Editor` 不應再以固定文案永遠可見；應改為 state-aware CTA，依序對應：
    - 有 current stage image 時：`Edit current image`
    - 沒有 current stage image 但已有 editor base 時：`Continue editing`
    - 兩者都沒有時：`Upload base to edit`
4. editor 實際 fallback 邏輯仍可沿用現有 `useWorkspaceEditorActions.ts`，但 UI 文案與入口 owner 必須改成狀態感知，而不是讓使用者自行猜測按下 `Open Editor` 後會發生什麼。
5. 這個 follow-up 的目標不是把工具分散回 header 或 composer，而是把工具保留在同一個 owner family 內，同時縮成更接近舞台操作的 UI 形態。

### 7. The bottom composer is the only conversation floor

底部 composer 是唯一對話區，也是主要的下一步操作區。

已確認要屬於 bottom composer 的項目：

1. `prompt`
2. `Inspiration`
3. `AI Enhance`
4. `Prompt History`
5. `Templates`
6. `Styles`
7. `Advanced Settings`
8. primary `Generate`

已確認 `Queue Batch Job` 仍保留在 bottom composer 內，但只作為 secondary action，不應與 `Generate` 等權競爭。

建議位置：

1. 放在 `Generate` 旁邊但視覺權重更低。
2. 或放在同一 composer 區域裡的可展開 action group。

它不應移到 top response rail、center history canvas、或 side tool panel，因為它本質上仍然是 generation action，不是回覆區、瀏覽區、或圖像工具區的主責任。

### 7A. Queue progress is summary-up-top, ownership-down-below

`Queue Batch Job` 的進度狀態不是整塊放在 top response rail。

正確分工如下：

1. top response rail 可以顯示目前活躍 queue workflow 的摘要狀態，例如 `Submitted`、`Running`、`Ready to import`、`Failed`。
2. 真正的 queue job 管理、job 列表、詳細進度、取消、匯入、恢復、結果 reopen，仍然屬於 queue 專屬 surface。
3. 因為 queue job 是從 bottom composer 發起，所以這個 queue surface 在產品結構上仍是 bottom composer 這條生成路徑的延伸，而不是 top rail 的主責任。

換句話說：

1. 上方可以告訴使用者「現在有 batch job 在跑」。
2. 但上方不應變成完整的 batch jobs panel。
3. 要管理 queue job，仍然應該進入 queue 的專屬管理面。

### 8. Large context panels should become compact summaries

`Source Trail`、`Session & Lineage`、`Workflow Log` 這類 context surface 不該再以大面積 dashboard 形式存在。

後續應改成：

1. 小型摘要
2. 明確標題
3. 可收合
4. 需要時再展開

它們的角色是支援主流程，而不是和中心 history canvas 爭奪主視覺權重。

## Capability Ownership Map

後續實作請以這份 owner map 為準。

| Capability                               | Canonical owner                             |
| ---------------------------------------- | ------------------------------------------- |
| Model response text                      | Top response rail                           |
| Thought summary / model thinking         | Top response rail                           |
| Runtime status / workflow state          | Top response rail                           |
| Visual history browsing                  | Center history canvas                       |
| Selected image focus view                | Center focus state or viewer overlay        |
| Prompt and next-turn actions             | Bottom composer                             |
| Queue Batch Job trigger                  | Bottom composer                             |
| Active queued-job summary status         | Top response rail                           |
| Queue job detailed progress and controls | Queue surface tied to the composer workflow |
| References and uploads                   | Side tool panel                             |
| SketchPad / ImageEditor                  | Side tool panel                             |
| Source origin summary                    | Compact context summary                     |
| Session / branch summary                 | Compact context summary                     |
| Expandable workflow timeline             | Compact context summary                     |
| Detailed settings changes                | Open-on-demand settings surface             |

## Included And Excluded

### Included

1. 保留既有能力，但重新安排空間責任。
2. 讓產品更像 conversation plus history workspace，而不是單張結果 viewer。
3. 讓使用者一眼看懂「模型說了什麼、目前有哪些圖、我下一步在哪裡操作」。
4. 把重複的功能入口收斂成單一主入口。

### Excluded

1. 不刪除 execution modes。
2. 不刪除 queue、continuation、restore/import、provenance 等核心能力。
3. 不把 batch job 偽裝成一般 generate。
4. 不犧牲已驗證的 official conversation、restore、import、replay semantics。

## Open Question

目前仍保留一個設計問題，實作時要再確認：

1. 使用者點選 history item 後，預設應該先在 history canvas 內放大成 inline focus state。
2. 或者應該直接開啟 `WorkspaceViewerOverlay` 作為主要 focus 行為。

這個問題會影響 `GeneratedImage`、`HistoryPanel`、`RecentHistoryFilmstrip`、`WorkspaceViewerOverlay` 的收斂方式，但不影響上面的總體版面決議。

## Implementation Direction

建議的落地順序如下：

1. 先把 top response rail 做成真正的單一回覆區。已落地。
2. 再把中心改成 history-first canvas，建立新的視覺重心。已落地，`Recent Turns` 已併入 recent lane。
3. 接著把 bottom composer 收斂成唯一對話區。主體已落地，但仍需持續檢查是否有 secondary surface 重新長出重複 generation-adjacent actions。
4. 再整併 side tool panel。已落地，references / upload-base / SketchPad / editor 已集中到 side tool owner surface。
5. 最後壓縮 Source Trail、Session & Lineage、Workflow Log 等 context surfaces。這一步已從第一個 closure slice 擴張到多個次級入口：insights sidebar、top-rail thoughts、import review、restore notice、side tool panel 次級說明，以及 queued imported previews 都已改成 summary-first / collapsible 呈現；其中 timeline/system-log detail 也已正式收回 `Context Rail` 主卡堆疊，不再保留額外的 `Live Timeline` 家族框架。
6. 下一步應該轉向剩餘 secondary surface 的 CTA wording 對齊、owner-route naming、locale-safe polish，以及只在真的還有 drift 證據時才做下一批 canonical-action cleanup，而不是再做新一輪大型 shell 位移。
7. 2026-03-19 的 audit 結論仍然有效：已沒有另一批和 modal-header shortcuts 同級的低風險直接移除項。`Current Stage Source` action family 的 coordinated implementation 已於 2026-03-20 完成，而 picker gallery 也已在 2026-03-21 收斂成 open-plus-rename；因此後續 closure work 應偏向 wording、history-owner naming、viewer/provenance polish、與 locale-safe 驗證，而不是重跑同一批 source-action consolidation。
8. 2026-03-24 起，這份文件新增一個更上層但仍 bounded 的 shell-reorg target：把 top rail、context surfaces、side tools 的「家族邊界」再收斂一次，而不是回退已完成的 capability ownership。第一輪建議採保守版：保留 slim workflow summary 於 top area，同時把 source / provenance / session / timeline detail 整併為單一 `Context Rail`，並把 side tool panel 收斂為 stage-adjacent actions bar。
9. 同一輪應一起完成 theme/color-token cleanup 與 state-aware editor CTA cleanup；這兩者都屬於 shell hierarchy 的一部分，而不是後續可有可無的小 polish。

原因是新的中心重力要先建立起來，其他區塊才知道自己是配角而不是主角。

## Guardrails

後續實作不得違反下列前提：

1. continue、branch、queued batch、interactive batch variants 仍然要保持不同語意。
2. restore / import / replay / official conversation 的既有正確性不能被 shell 重整破壞。
3. capability gating 仍要依模型真實能力嚴格限制。
4. 如果某個功能看似需要在兩個地方都出現，應優先檢查是不是 owner 定義不清，而不是直接接受重複。

## Verification Standard

當這份決議開始進入實作後，至少要驗證：

1. 桌面版能一眼辨識四個區域：top response rail、center history canvas、side tool panel、bottom composer。
2. 首頁預設不是單張放大圖，而是可掃視的 image history workspace。
3. 選圖後能進入 focus mode，但 focus mode 不會重新霸佔整個首頁結構。
4. 底部 composer 的功能邊界清楚，且 `Queue Batch Job` 是 secondary action。
5. `Source Trail`、`Session & Lineage`、`Workflow Log` 預設是摘要或收合狀態，且不應再各自自我介紹成另一個平行 dashboard family。
6. restore/import/continuation/queue 相關測試與實際互動仍維持正確。

## Canonical Feature Map

這個表是後續 UI 去重時的直接對照表。

原則：

1. `Canonical owner surface` 是唯一主要歸屬。
2. `Canonical action button` 是唯一直接執行該功能的主按鈕。
3. `Allowed elsewhere` 只允許摘要、狀態、或導流入口。
4. `Do not duplicate as` 是實作時應直接刪除或避免新增的重複形式。

| Capability                   | Canonical owner surface | Canonical action button                           | Allowed elsewhere                                                       | Do not duplicate as                                                                      |
| ---------------------------- | ----------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Generate                     | Bottom composer         | Main `Generate` button                            | status summary, result summary, response text                           | second generate button in header, stage, side panel, or history area                     |
| Queue Batch Job              | Bottom composer         | Secondary `Queue Batch Job` button                | top-rail status summary, queue-management entry                         | another direct queue-submit button outside composer                                      |
| Queue job management         | Dedicated queue surface | `Open queue` or equivalent management entry       | top-rail active job summary                                             | inline full queue panel in top rail or duplicated queue controls across multiple regions |
| Prompt editing               | Bottom composer         | prompt textarea and its direct actions            | prompt preview summaries only                                           | second editable prompt surface elsewhere                                                 |
| Inspiration                  | Bottom composer         | `Inspiration` button                              | none beyond summary mention                                             | extra inspiration buttons in header, stage, side panel                                   |
| AI Enhance                   | Bottom composer         | `AI Enhance` button                               | none beyond summary mention                                             | extra AI-enhance buttons in parallel surfaces                                            |
| Prompt History               | Bottom composer         | `Prompt History` button                           | summary chip or open-state indicator                                    | another prompt-history launcher elsewhere                                                |
| Templates                    | Bottom composer         | `Templates` button                                | summary chip or open-state indicator                                    | another templates launcher elsewhere                                                     |
| Styles                       | Bottom composer         | `Styles` button                                   | selected-style summary near result/settings                             | separate styles picker entry in other primary zones                                      |
| Advanced Settings            | Bottom composer         | `Advanced Settings` button                        | compact current-settings summary near selected result                   | permanent second settings strip or duplicated settings button groups                     |
| References                   | Side tool panel         | single references entry / manage button           | reference count summary near selected result                            | second reference-management button in top strip or composer                              |
| Upload image                 | Side tool panel         | upload entry in side tool panel                   | asset presence summary only                                             | extra upload button in header, stage, composer                                           |
| SketchPad                    | Side tool panel         | single SketchPad entry                            | tool-active summary only                                                | second SketchPad launcher elsewhere                                                      |
| ImageEditor                  | Side tool panel         | single ImageEditor entry                          | tool-active summary only                                                | second editor launcher elsewhere                                                         |
| Recent turn open             | Center history canvas   | open action from history structure                | selected-result summary only                                            | duplicated open buttons in detached filmstrip or side summaries                          |
| Continue from turn           | Center history canvas   | single continue action from history structure     | branch/source status summaries only                                     | same continue action repeated across parallel history-like blocks                        |
| Branch from turn             | Center history canvas   | single branch action from history structure       | branch status summaries only                                            | same branch action repeated across parallel history-like blocks                          |
| Current stage source actions | Center history canvas   | direct open / continue / branch from history item | source-active badge, log/replay narrative, one route into history owner | full open / continue / branch triplet repeated in timeline, replay dialog, or global log |
| Single-image deep inspect    | Viewer overlay          | viewer open action from selected history item     | selected-image preview in center focus state                            | second deep-inspect owner outside viewer flow                                            |
| Source Trail inspection      | Compact context summary | single `Open` or `View details` path into details | provenance summary in response/stage surfaces                           | repeated provenance drill-down buttons in multiple panels                                |
| Session / lineage inspection | Compact context summary | single `Open` or `View details` path              | summary badges only                                                     | duplicate lineage-management buttons across header, sidebar, and stage                   |
| Workflow timeline inspection | Compact context summary | single `Open timeline` or `View details` path     | top-rail status summary                                                 | second always-open timeline panel competing with main shell                              |

## Canonical-Action Audit Snapshot (2026-03-19)

這次 audit 的目的是把「仍能繼續安全刪」和「其實已經進入產品決策層」分開，避免後續 session 把 owner-surface 入口誤判成單純 drift。

| Family                                             | Current surfaces                                                                   | Classification       | Why                                                                                                                                                                                                                      | Next move                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `Current Stage Source` open / continue / branch    | `WorkspaceInsightsSidebar` timeline row, `SessionReplayDialog`, `GlobalLogConsole` | Done                 | canonical owner 已確認回到 center history canvas；`GlobalLogConsole`、`SessionReplayDialog`、與 `WorkspaceInsightsSidebar` 都已移除 parallel continue / branch，只保留回到 history owner 的單一路由與 source-active 敘事 | 後續只做 wording / route naming / history-owner polish，不再恢復 secondary-surface triplet  |
| Composer quick tools (`Gallery`, `Prompt History`) | `ComposerSettingsPanel`                                                            | Should remain        | 這些按鈕屬於 bottom composer owner surface 內部的已確認主入口，不是跨 surface duplication；先前移除的是 insights / import / restore / filmstrip header 的平行 shortcuts，不是 composer 內部主入口                        | 保留，除非 bottom composer 本身重新定義 owner map                                           |
| Picker gallery history actions                     | `WorkspacePickerSheet` gallery tab                                                 | Done                 | gallery picker 已收斂成 secondary history surface 的 open-plus-rename contract；continue / branch 已移回 canonical history canvas / filmstrip owner surfaces                                                             | 後續只做 wording / route naming / locale-safe polish，不再恢復 picker-local continue/branch |
| Side-tool references entry                         | `WorkspaceSideToolPanel`                                                           | Should remain        | references owner surface 已明確收斂到 side tool panel；這裡是 canonical entry，不是重複捷徑                                                                                                                              | 保留，僅持續做 wording / summary polish                                                     |
| Queue imported-result open paths                   | `QueuedBatchJobsPanel` imported-result preview rail                                | Should remain        | 這些 reopen / sibling-switch controls 屬於 queue 管理 surface 內部操作，對應 queue owner surface，不是平行複製到別的 shell 區域的第二顆按鈕                                                                              | 保留，除非之後 queue owner map 改變                                                         |
| Remaining low-risk canonical-action removals       | N/A                                                                                | No obvious candidate | 經過 import / restore header、insights header、filmstrip header、provenance compare/detail rows 這一輪後，剩餘案例不是 owner-surface 入口，就是已被 e2e / translation coverage 視為正式行為                              | 轉入 product-decision audit 或更高層 ownership cleanup，不再做盲目的局部刪按鈕              |

## Canonical Summary

若只記三件事，應記這三件：

1. 核心能力大多已經存在，現在主要缺的是產品整合，而不是基礎功能發明。
2. 新 shell 決議已鎖定：Top = model speaks、Center = image history workspace、Side = image tools、Bottom = user speaks。
3. 後續整合必須遵守兩條硬規則：一個功能只有一個 owner surface；一個功能只有一個 canonical action button。
