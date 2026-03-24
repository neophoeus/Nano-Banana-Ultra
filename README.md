# Nano Banana Ultra 🚀

[English](#english) | [繁體中文](#繁體中文)

> v3.0 is currently in progress. This README has been updated to stay aligned with the current codebase and verified Phase 1 rebuild state, but some planned features and product polish are still incomplete.

> v3.0 版本目前仍在開發中。此 README 已先依照目前實際程式碼與已驗證的 Phase 1 重構狀態更新，但部分規劃中的功能與產品細節仍未完成。

> The current working tree also contains a large multi-package refactor wave. See `IMPLEMENTATION_MASTER_SPEC.md` for the active packaging plan before reviewing or committing the refactor as a single changeset.

> 目前工作樹另外還包含一波大型多主題重構。若要 review 或切 commit，請先參考 `IMPLEMENTATION_MASTER_SPEC.md` 內的 working-tree packaging plan，不要把整批變更視為單一 changeset。

<details open>
<summary><b>🇧 English version</b></summary>

<a id="english"></a>

<br>

This repository is currently moving toward v3.0. The product description below is intentionally aligned to the current rebuilt codebase rather than older UI assumptions, and some planned areas are still under active development.

Current UI/UX refinement focus in the working tree:

- the just-landed shell ownership slice: the top rail now reads as one model-output family, workflow summary now belongs to the unified context rail, and the side tool owner now behaves as a lighter stage-adjacent actions bar instead of a parallel heavyweight panel
- clearer history / branch / continue / source-active semantics across all continuity-related entry points
- structured-output reuse closure so prompt-kit drafts and variation-compare test prompts can drive the next pass directly instead of forcing manual copy-and-rebuild steps
- owner-route naming, CTA wording alignment, and remaining secondary-surface closure polish after the latest canonical-action cleanup wave
- summary-first provenance and insight presentation before deep citation drill-down
- contextual action wording on history-style surfaces so generic `Continue` only appears where the action is truly generic
- provenance empty-state compression so restore-derived results do not expand into multiple low-signal empty sections
- queued batch task framing that reads like a job workflow rather than a debug surface
- localization and browser-path verification as the closure pass after interaction structure stabilizes

The current shipped foundation is the rebuilt v2.5-era Nano Banana Ultra image generation application. Built on the React ecosystem, it uses a local Vite server route to call the Google Gemini API so your API key stays out of the browser bundle.

## ✨ Features

- **Text-to-Image**: Generate beautiful images quickly by entering text prompts.
- **Image-to-Image & Style Transfer**: Upload reference images and combine them with prompts or built-in styles to create entirely new artworks.
- **Advanced Model Selection**: Switch freely between the latest Gemini image models (Gemini 3.1 Flash Image, Gemini 3 Pro Image, Gemini 2.5 Flash Image). The UI adapts and locks unsupported features based on your selection (for example ratio limits, image sizes, and reference-image counts).
- **Response Rail & Runtime Health**: The top response rail combines model text output, thought summaries, workflow state, queue summary, and local API / Gemini key health into one owner surface instead of scattering status across multiple support panels.
- **Grounded Results & Insight Panels**: Supported Gemini 3.1 flows can return images, text, thoughts, grounding sources, support bundles, image-search attribution, and session hints in one result workspace.
- **Structured Output Reuse Flow**: Structured-output presets now go beyond display-only summaries. Prompt-kit can assemble a reusable `Prompt draft`, and variation-compare can surface direct next-pass candidate prompts, each with copy / append / replace actions from the result surfaces.
- **Global Theme & Language Sync**: SketchPad and ImageEditor now feature synchronized global theme and language controls for a seamless experience. Added consistent hover tooltips across all interactive UI elements.
- **Interactive Image Editor**: Built-in powerful canvas editor supporting Inpainting and Outpainting! Zoom, pan, and mask specific areas of an image using the brush tool for precise modification. Features a dedicated UI layout and optimized reference image limits specialized for editing tasks.
- **Dual Reference Trays**: Independently configure Characters and Objects schemas, equipped with native HTML5 Drag and Drop ordering for prompt structure matching.
- **Smart File Naming**: Auto-saving now embeds the generating model's name directly into the filename (e.g., `gemini-3-pro-image-preview-gen_...png`) for easy sorting and management.
- **Sketch Pad**: Draw rough sketches directly on the canvas to use as a structural reference for image generation.
- **Smart Prompt Tools**: Includes "Smart Rewrite" and "Surprise Me" features to automatically optimize your drawing prompts using AI.
- **Permanent Prompt History**: Your prompt history is now automatically saved securely to your local disk, supporting a massive **9,999** record capacity with smart UI rendering to prevent lag.
- **Batch Generation**: Generate multiple images simultaneously to save waiting time.
- **Variant Promotion Workflow**: Batch outputs remain explicit exploration candidates until you promote exactly one result into the active continuation source for that branch.
- **Workspace Restore / Import Continuity**: Restore notices, import review, history cards, and branch surfaces now preserve the same Candidate / Promote Variant / Source Active semantics instead of flattening everything into generic continue actions, and the restore/import modals no longer duplicate gallery, prompt-history, or references launcher shortcuts that belong to their owner surfaces.
- **Summary-First Continuity Entry Points**: Import-review branch previews, direct-replace latest-turn review, and restore-notice secondary recovery paths now open as compact summaries first, so the primary continuation actions stay visible without forcing secondary narrative blocks to remain expanded.
- **Contextual History Actions**: History cards, the recent-history filmstrip, and lineage-style side panels now prefer `Continue from turn` style wording for plain reopenable turns, while promoted/source surfaces keep their stronger `Promote + continue` and `Continue source` semantics.
- **Compressed Provenance Empty States**: When a restored or imported result has continuity metadata but no returned sources, bundles, or queries, Provenance stays summary-first instead of expanding into several redundant empty sections.
- **Summary-First Provenance Detail Shells**: Citation detail, provenance source, reuse preview, source/bundle status cards, compare lists, and selected-bundle segment text now default to compact disclosure summaries before expanding into full attribution drill-down, and compare/detail rows now use a single inspect path instead of repeating extra inspect buttons.
- **Compact Secondary Shells**: Top-rail thoughts, viewer thoughts/session hints and inspect guidance, branch-rename restore guidance, recent-history filmstrip guidance, side-tool explanatory copy, picker-sheet reference helper cards, composer guidance cards, shared-controls prompt preview plus shared-state guidance, and queued imported-result plus queue-header guidance now default to compact previews and disclosures, keeping primary owner actions visible while reducing always-open secondary detail.
- **Rich Style Library**: Comes with over 40 built-in image styles (e.g., Cyberpunk, Watercolor, Pixel Art, 3D Render, etc.).
- **I18n & Dark Mode**: Supports multiple interface languages and allows toggling between Light and Dark themes based on your preference.
- **History-First Workspace Shell**: The main app now uses a four-region shell: top response rail, center history canvas, side tool panel, and bottom composer. `Recent Turns` now lives inside the center canvas as a recent lane, while large right-side context regions have been compacted into summary-first collapsible insights and neither the insights timeline header nor the recent-turn filmstrip header duplicates gallery or prompt-history launcher buttons.

## 🛠️ Run Locally

**Prerequisites:** Node.js (v18+ recommended)

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Environment Setup:**
    - Copy the `.env.example` file and rename it to `.env.local`
    - Fill in your Gemini API key in the newly created `.env.local` file:

        ```env
        GEMINI_API_KEY=your_api_key_here
        ```

    _(Note: `.env.local` is intentionally ignored by Git to keep your API key secure)._

3. **Run the app in Development Mode:**

    ```bash
    npm run dev
    ```

4. **Check local API health:**

    Open this URL in your browser after the dev server starts:

    ```text
    http://127.0.0.1:22287/api/health
    ```

    A healthy response looks like this:

    ```json
    { "ok": true, "hasApiKey": true, "outputDir": "...", "timestamp": "..." }
    ```

5. **Run the production-like local preview:**

    ```bash
    npm run build
    npm run preview
    ```

    Then verify:

    ```text
    http://127.0.0.1:4173/api/health
    ```

6. **Build for Production:**

    ```bash
    npm run build
    ```

    The generated static files do not contain your Gemini key. To use image generation outside dev mode, serve the app with a Node process that exposes the same API routes, such as `vite preview` or a small Express server.</details>

## Editor Tooling

- Treat TypeScript as the primary authoritative editor signal for this repo. The project ships with [tsconfig.json](tsconfig.json) and uses the workspace TypeScript version from `node_modules/typescript`.
- Treat Tailwind CSS IntelliSense as project-backed because [tailwind.config.js](tailwind.config.js) and [postcss.config.js](postcss.config.js) are committed and active.
- Treat Playwright tooling as project-backed because [playwright.config.ts](playwright.config.ts) and the `test:e2e` script in [package.json](package.json) are wired to the repo.
- Use `npm run test:e2e:restore:owner-paths` when you need the focused restore owner-path subset without hand-writing a fragile long `--grep` expression in PowerShell.
- Use `npm run test:e2e:restore:branch-rename` for the focused restore rename flow, and `npm run test:e2e:restore:provenance` for the restore provenance summary/detail subset, instead of ad hoc long `--grep` commands.
- Use `npm run test:e2e:restore:replay` for the restore replay family and `npm run test:e2e:restore:queued-batch` for the queued-batch restore panel path when validating those surfaces in isolation.
- Use `npm run test:e2e:restore:mainline-smoke` for the fastest browser-path proof that the current shell-owner and prompt-reuse mainline still holds after UI changes.
- Use `npm run test:e2e:restore:regression` when you want one aggregated restore/import/replay continuity entrypoint instead of manually chaining multiple focused Playwright subsets.
- Treat Prettier as an authoritative formatter for this repo. The project now commits [prettier.config.mjs](prettier.config.mjs), [.prettierignore](.prettierignore), and `format` / `format:check` scripts in [package.json](package.json).
- Project-level VS Code recommendations live under [.vscode/extensions.json](.vscode/extensions.json) and [.vscode/settings.json](.vscode/settings.json). This repo now also binds project-backed JS/TS/TSX and related text formats to the Prettier VS Code formatter, while [../Projects.code-workspace](../Projects.code-workspace) provides workspace-level fallback defaults for `javascript` and `jsonc`.

### Current Prettier Policy

Prettier is now part of repo policy rather than a workspace-only editor preference. Use the committed config as the formatting source of truth, prefer the project scripts for explicit formatting runs, and treat the VS Code formatter binding as an editor convenience layered on top of that repo-backed rule set. ESLint is still not adopted as repo policy.

The current working tree still carries broad historical formatting debt. Treat `npm run format:check` as the inventory source, and clean up formatting in narrow, reviewable batches instead of running a whole-repo write pass during unrelated product work.

---

<details>
<summary><b>🇹🇼 繁體中文 (Traditional Chinese)</b></summary>

<a id="繁體中文"></a>

# Nano Banana Ultra 🚀

<br>

此專案目前正往 v3.0 推進。以下內容刻意以目前已重構完成的程式碼為準，不再沿用舊版 UI 假設；但也因為仍在開發中，部分規劃中的區塊與細節尚未完成。

目前 working tree 的 UI/UX 收尾重點如下：

- 已落地的 shell ownership slice：top rail 現在收斂成單一 model output family、workflow summary 已回到統一 context rail，side tool owner 也已縮成較輕的 stage-adjacent actions bar，而不是平行的重型主面板
- 在所有延續相關入口上，讓 history / branch / continue / source active 語意更清楚
- 收斂 structured output 的結果重用流程，讓 prompt-kit 草稿與 variation-compare 的 test prompts 都能直接驅動下一輪，而不是還要手動複製再重組
- 在最新 canonical-action cleanup wave 之後，繼續收尾 owner-route 命名、CTA 文案對齊，以及殘餘 secondary surface 的 closure polish
- 讓 provenance 與 insights 先以摘要可讀，再提供深層 citation drill-down
- 讓 history 類 surface 用情境化動作文案，只有真的泛用時才顯示一般 `Continue`
- 讓 provenance 在沒有 sources / bundles / queries 時收斂空狀態，不再展開多塊低訊號空面板
- 讓 queued batch 更像工作任務流程，而不是工程除錯面板
- 等互動結構穩定後，再用多語系與瀏覽器路徑驗證把行為鎖定

目前可運作的基礎，是重構後的 v2.5 階段 Nano Banana Ultra 影像生成應用程式。此專案基於前端 React 生態系建立，並透過本機 Vite 伺服器路由呼叫 Google Gemini API，避免把 API 金鑰打包進瀏覽器端。

## ✨ 核心功能 (Features)

- **文字生圖 (Text-to-Image)**：輸入提示詞 (Prompt)，快速生成精美圖片。
- **圖生圖 / 風格轉換 (Image-to-Image & Style Transfer)**：上傳參考圖片，結合提示詞或內建風格，生成全新面貌的作品。
- **進階模型選擇 (Advanced Model Selection)**：支援最新 Gemini 影像模型 (包含 Gemini 3.1 Flash Image、Gemini 3 Pro Image、Gemini 2.5 Flash Image 等)，並會根據所選模型動態開關介面功能 (例如各模型支援的尺寸、比例與參考圖數量上限)。
- **回覆主軌與執行健康狀態 (Response Rail & Runtime Health)**：頂部 response rail 會集中顯示模型文字回覆、thought summary、workflow / queue 摘要，以及本機 API / Gemini 金鑰健康狀態，不再把狀態分散在多個 support panel。
- **Grounded 結果與洞察面板 (Grounded Results & Insight Panels)**：在支援的 Gemini 3.1 流程中，可於同一個結果工作區檢視圖片、文字、thoughts、grounding sources、support bundles、image-search attribution 與 session hints。
- **Structured Output 結果重用流程**：structured-output presets 不再只是展示摘要。prompt-kit 現在能組出可直接重用的 `Prompt draft`，variation-compare 也能把 test prompts 直接作為下一輪候選 prompt，並在結果面板中直接提供 copy / append / replace 動作。
- **全域佈景切換與語系同步**：手繪板 (SketchPad) 與編輯器 (ImageEditor) 現已與首頁完全同步色彩模式與語系設定。所有互動按鈕與滑桿皆已全面補齊懸停提示 (Tooltips)。
- **專業影像編輯器 (Interactive Image Editor)**：內建強大的畫布編輯器，支援局部修改 (Inpainting) 與畫面外擴 (Outpainting)！您可以在畫布上自由縮放原圖、使用筆刷塗抹遮罩，精準替換或擴充指定區域的細節。擁有專屬的最佳化操作介面與精準的參考圖數量控制設計。
- **雙軌參考圖架構 (Dual Reference Trays)**：支援人物與物品獨立配置，並支援 HTML5 原生拖放 (Drag & Drop) 排序功能讓您輕鬆更動提示詞陣列。
- **智慧檔名系統 (Smart File Naming)**：產生的圖片在存檔時，會自動擷取生成該圖片的 AI 模型名稱作為檔名標籤 (例如：`gemini-3-pro-image-preview-gen_...png`)，便於後續管理與分類。
- **手繪塗鴉板 (Sketch Pad)**：直接在畫布上勾勒草圖，作為生成的參考依據。
- **智慧提示詞 (Smart Prompt Tools)**：包含「幫我寫 (Smart Rewrite)」與「驚喜一下 (Surprise Me)」功能，自動優化繪圖提示詞。
- **永久歷史紀錄 (Permanent Prompt History)**：您的提示詞歷史將自動儲存在本機硬碟中，最高支援 **9,999** 筆超大容量，並採用智慧 UI 渲染，確保流暢不卡頓！
- **批次生成 (Batch Generation)**：一次生成多張圖片，節省等待時間。
- **Variant 升格流程 (Variant Promotion Workflow)**：批次輸出的結果會先保持為探索候選，只有在您明確升格其中一張後，才會成為該 branch 的 active continuation source。
- **工作區還原 / 匯入延續語意 (Workspace Restore / Import Continuity)**：restore notice、import review、history cards 與 branch surfaces 現在都會保留一致的 Candidate / Promote Variant / Source Active 語意，不再把所有流程壓平成一般 continue 動作；restore / import modal 也不再平行複製 gallery、prompt history、references 這些應由 owner surface 提供的 launcher shortcuts。
- **summary-first 的延續入口 (Summary-First Continuity Entry Points)**：import review 的 branch previews、direct replace latest turn 檢視，以及 restore notice 的次級 recovery 路徑，現在都會先以精簡摘要顯示，讓主要延續動作保持可見，而不是被次級敘述區塊長期撐開。
- **情境化 History 動作文案 (Contextual History Actions)**：history cards、recent-history filmstrip 與 lineage 類側欄，對一般可延續 turn 會優先顯示 `從這個 turn 延續` 這類情境化文案；對已升格 variant 與 active source 則維持 `提升並延續` / `延續來源` 的強語意。
- **收斂的 Provenance 空狀態 (Compressed Provenance Empty States)**：當還原或匯入的結果只有 continuity metadata、但沒有 sources / bundles / queries 時，Provenance 會維持 summary-first，而不是展開多塊重複的空狀態區塊。
- **收斂的次級 shell (Compact Secondary Shells)**：top-rail thoughts、viewer 的 thoughts / session hints 與 inspect guidance、branch rename 的 restore guidance、recent-history filmstrip 的導覽說明、side tool panel 的補充說明、picker references 的輔助卡、composer 的 guidance cards、shared-controls 的 prompt preview 與 shared-state guidance、provenance compare/detail rows 的單一路徑 inspect，以及 queued imported-result previews 與 queue header guidance 現在都預設以摘要或 disclosure 顯示，保留主要 owner actions，同時降低常駐次級細節的密度。
- **豐富風格庫 (Rich Style Library)**：內建超過 40 種以上的影像風格 (如：賽博龐克、水彩、像素風、3D渲染等)。
- **多國語系與深色模式 (I18n & Dark Mode)**：支援多語言介面切換，並可依喜好切換深/淺色主題。
- **history-first 工作區 shell**：主畫面現已改為四區結構：top response rail、center history canvas、side tool panel、bottom composer。`Recent Turns` 已併入中心畫布的 recent lane，右側大型 context 區塊也已壓成 summary-first、可展開的 insights 結構，且不再在 timeline header 或 recent-turn filmstrip header 平行複製 gallery 或 prompt history 的 launcher。

## 🛠️ 本機執行 (Run Locally)

**環境要求：** Node.js (建議 v18 以上版本)

1. **安裝依賴套件 (Install dependencies)：**

    ```bash
    npm install
    ```

2. **環境變數設定 (Environment Setup)：**
    - 複製專案內的 `.env.example` 檔案，並將其重新命名為 `.env.local`
    - 將您的 Gemini API 金鑰填入剛建立的 `.env.local` 檔案中：

        ```env
        GEMINI_API_KEY=您的_API_KEY_填寫於此
        ```

    _(註：`.env.local` 已被 Git 忽略，因此直接填寫您的金鑰是安全的，不會被上傳到公開庫)_。

3. **啟動開發伺服器 (Run the app - Development Mode):**

    ```bash
    npm run dev
    ```

4. **檢查本機 API 狀態 (Check local API health):**

    開啟下列網址確認後端路由與金鑰狀態：

    ```text
    http://127.0.0.1:22287/api/health
    ```

    正常回應範例：

    ```json
    { "ok": true, "hasApiKey": true, "outputDir": "...", "timestamp": "..." }
    ```

5. **用接近正式環境的本機模式驗證 (Run local preview):**

    ```bash
    npm run build
    npm run preview
    ```

    啟動後可再檢查：

    ```text
    http://127.0.0.1:4173/api/health
    ```

6. **打包正式環境版本 (Build for Production):**

    ```bash
    npm run build
    ```

    打包後的靜態檔不會包含 Gemini 金鑰。若要在非開發模式下繼續使用生成功能，仍需透過 `vite preview` 或自建 Node/Express 伺服器提供相同 API 路由。</details>

## 編輯器工具政策 (Editor Tooling)

- 這個 repo 目前最權威的 editor 訊號是 TypeScript。專案已提交 [tsconfig.json](tsconfig.json)，並使用 `node_modules/typescript` 內的 workspace TypeScript 版本。
- Tailwind CSS IntelliSense 屬於 project-backed 工具，因為 [tailwind.config.js](tailwind.config.js) 與 [postcss.config.js](postcss.config.js) 都已提交並實際參與專案。
- Playwright 屬於 project-backed 工具，因為 [playwright.config.ts](playwright.config.ts) 與 [package.json](package.json) 內的 `test:e2e` script 已接上本 repo。
- 如果要只跑 restore owner-path 的聚焦子集，直接用 `npm run test:e2e:restore:owner-paths`，避免在 PowerShell 手打很長的 `--grep` 參數而誤跑整份 suite。
- 如果要只跑 restore rename 流程或 provenance summary/detail 子集，直接用 `npm run test:e2e:restore:branch-rename` 與 `npm run test:e2e:restore:provenance`，不要再臨時手打冗長的 `--grep` 組合。
- 如果要單獨驗證 restore replay 家族或 queued-batch restore panel，直接用 `npm run test:e2e:restore:replay` 與 `npm run test:e2e:restore:queued-batch`，避免每次手拼 grep 條件。
- Prettier 現在已是這個 repo 的正式 formatter 規範。專案已提交 [prettier.config.mjs](prettier.config.mjs)、[.prettierignore](.prettierignore)，並在 [package.json](package.json) 提供 `format` 與 `format:check` scripts。
- 專案層級的 VS Code 建議位於 [.vscode/extensions.json](.vscode/extensions.json) 與 [.vscode/settings.json](.vscode/settings.json)。目前這些設定也把本專案的 JS/TS/TSX 與相關文字格式綁到 Prettier formatter，作為 repo 規則的 editor 對應；而 [../Projects.code-workspace](../Projects.code-workspace) 也補上 `javascript` 與 `jsonc` 的 workspace-level fallback default formatter。

### 目前的 Prettier 政策

Prettier 現在已不是單純的 workspace 偏好，而是 repo-backed 規則。格式化時應以專案提交的設定為準，明確執行時優先使用 repo scripts；VS Code 的 formatter 綁定只是把同一套規則落到編輯器中。ESLint 目前仍未被採用為 repo policy。

目前 working tree 仍有一批歷史格式債。`npm run format:check` 應視為盤點來源，後續格式整理要用小批、可 review 的 wave 進行，不要在無關功能修改時直接做全 repo write-format。

---

_Built with React, Vite, and TailwindCSS. Powered by Google Gemini._
