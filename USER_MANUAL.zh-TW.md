# Nano Banana Ultra 完整功能說明書與操作手冊

## 1. 這個 App 是做什麼的

Nano Banana Ultra 是一個給影像創作流程用的工作區。它不是只有一個輸入 prompt 的生圖頁，而是把下面這些事情放進同一個空間裡：

- 寫 prompt
- 放參考圖
- 一次生多張圖做比較
- 從其中一張圖繼續延伸
- 進入編輯模式做局部修改
- 查看歷史版本與分支
- 匯出、匯入、還原工作區
- 把分析結果或來源資訊回填到下一輪 prompt

白話來說，它比較像「影像創作工作台」，不是「一次性生圖按鈕」。

## 2. 適合誰用

- 想從一句 prompt 開始，慢慢修到接近目標的人
- 需要反覆比較版本的人
- 需要角色圖、物件圖、草圖、編輯結果一起管理的人
- 想保留創作脈絡，而不是每次都重新開始的人

## 3. 開始前要準備什麼

### 3.1 必要條件

- 已安裝 Node.js 與 npm
- 專案依賴已安裝
- 已在 `.env.local` 準備 Gemini API Key

範例格式如下：

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 3.2 啟動方式

在專案根目錄可直接使用這兩個批次檔：

- `run_install.bat`：安裝或更新套件
- `run_start_dev.bat`：啟動本機開發伺服器並自動開瀏覽器

如果你要用命令列，也可以：

```bash
npm install
npm run dev
```

預設會開在：

```text
http://127.0.0.1:22287/
```

### 3.3 第一次開啟常見情況

- 如果沒有 API Key，App 不能正常送出 Gemini 請求
- 如果 `node_modules` 不存在，`run_start_dev.bat` 會先提醒你安裝依賴
- 如果伺服器 30 秒內還沒起來，批次檔會提醒你手動打開網址

## 4. 介面總覽

整體可以把介面想成 6 個區域。

### 4.1 最上方 Header

這裡是全域控制區，主要會看到：

- 品牌標誌 NBU / Nano Banana Ultra
- 主題切換
- 語言切換
- 模型選擇
- 比例選擇
- 尺寸選擇
- 生成數量
- 目前已放多少參考圖
- 這個模型最多可放多少物件圖、角色圖

白話說，這一排是先決定「我要用哪種引擎、畫面多大、一次出幾張」。

### 4.2 Composer 設定面板

這是主要操作區，也是你最常待的地方。裡面包含：

- Prompt 輸入框
- Surprise Me 靈感功能
- Smart Rewrite 改寫 prompt
- Gallery
- Prompt History
- Templates
- Styles
- Export Workspace
- Import Workspace
- Advanced Settings 進階設定
- Generate / Queue Batch / Follow-up 這類執行按鈕

白話說，這裡就是「下指令」的地方。

### 4.3 工作區歷史與結果區

這裡會看到目前工作區內所有生成結果、時間順序、批次變體、分支關係。

你可以從歷史裡：

- 打開某張圖
- 從某張圖繼續生成
- 把某張圖當作新的來源
- 建立分支
- 回頭看舊版本

### 4.4 Response Rail

這是單張結果的細節區，會顯示：

- 圖片本身
- 模型回傳文字
- thoughts
- structured output
- grounding / provenance 資訊

白話說，這裡是「這一輪結果的說明頁」。

### 4.5 Insights Sidebar

這裡偏向工作流程資訊，常見內容有：

- 工作流事件
- 分支摘要
- session 延續狀態
- 歷史上的轉折點

白話說，它是幫你看懂這個工作區「怎麼一路走到現在」。

### 4.6 各種彈出工具層

像下面這些通常會用彈窗或覆蓋層打開：

- SketchPad
- Image Editor
- Branch Rename
- Workspace Import Review
- Restore Notice
- Session Replay
- 各種 Picker Sheet

## 5. 快速上手流程

如果你是第一次用，建議照這個順序。

### 5.1 最短上手版

1. 選模型
2. 輸入 prompt
3. 視需要放角色圖或物件圖
4. 選比例、尺寸、風格、數量
5. 按 Generate
6. 從結果中挑一張滿意的圖
7. 決定要繼續生成、開分支、還是進 Editor 細修

### 5.2 如果你想要更穩定的流程

1. 先用 Templates 或 Surprise Me 打底
2. 用 Smart Rewrite 把 prompt 修順
3. 放參考圖
4. 一次出 2 到 4 張做比較
5. 選出最接近的圖當 continuation source
6. 再做 follow-up、branch 或 editor 修圖

## 6. 模型功能差異

這個 App 目前支援 3 條模型路徑，不同模型看到的選項不一定一樣。

### 6.1 Nano Banana 2

- 模型 ID：`gemini-3.1-flash-image-preview`
- 預設主力模型
- 支援尺寸：512、1K、2K、4K
- 支援比例最多，包含極長與極高比例
- 可放最多 10 張物件參考圖
- 可放最多 4 張角色參考圖
- 支援 Google Search grounding
- 支援 Image Search grounding
- 支援 thinking level
- 支援 include thoughts
- 不支援 structured output

適合情境：

- 需要大範圍比例選擇
- 想搭配 grounding 找資料
- 想保留 thoughts
- 需要較完整控制項

### 6.2 Nano Banana Pro

- 模型 ID：`gemini-3-pro-image-preview`
- 偏高品質輸出
- 支援尺寸：1K、2K、4K
- 支援常用比例，但沒有最極端的長條比例
- 可放最多 6 張物件參考圖
- 可放最多 5 張角色參考圖
- 支援 Google Search grounding
- 不支援 Image Search grounding
- 不提供 thinking level 切換
- 支援 include thoughts
- 支援 structured output

適合情境：

- 想要更穩的高品質結果
- 需要 structured output 幫你整理資訊
- 需要比較正式、可控的工作流

### 6.3 Nano Banana

- 模型 ID：`gemini-2.5-flash-image`
- 較輕量、較快
- 沒有尺寸選擇器
- 支援常用比例
- 可放最多 3 張物件參考圖
- 不支援角色參考圖
- 不支援 grounding
- 不支援 include thoughts
- 支援 structured output

適合情境：

- 想快速試方向
- 需求比較單純
- 不需要 grounding 與角色參考功能

### 6.4 很重要的觀念

不是所有選項都會一直顯示。App 會依照模型能力，自動顯示或隱藏對應控制項。

白話說，如果你切了模型後某個選項不見，不一定是壞掉，通常是那個模型本來就不支援。

## 7. 主要功能逐一說明

## 7.1 Prompt 輸入

這是整個流程的起點。

你可以直接輸入：

- 場景描述
- 構圖需求
- 風格要求
- 光線要求
- 鏡頭角度
- 禁止事項

白話建議：

- 不要只寫一個名詞，例如「女孩」
- 盡量寫成「誰、在哪裡、做什麼、畫面要長什麼樣」
- 如果你有參考圖，文字就更該說明你要保留什麼、改變什麼

## 7.2 Surprise Me

這個功能會幫你隨機生一段靈感 prompt。

適合：

- 沒靈感時先找方向
- 想快速試風格
- 想知道這個模型能出什麼畫面

操作方式：

1. 點 `Surprise Me` 或靈感按鈕
2. 系統自動塞一段 prompt
3. 你可以直接生成，或先手動修改

## 7.3 Smart Rewrite

這個功能會幫你把現在的 prompt 改寫得更完整、更像可執行的影像指令。

白話理解：

- 不是幫你亂改意思
- 比較像幫你把話說清楚
- 讓 prompt 更像能被模型理解的版本

適合：

- 你腦中有畫面，但描述很零散
- prompt 太短
- 語句太口語

操作方式：

1. 先輸入原始 prompt
2. 點 `Smart Rewrite`
3. 系統改寫後回填文字框
4. 你再決定要不要手動微調

## 7.4 Prompt History

這裡會保留你曾經用過的 prompt。

特點：

- 最多可保存 9999 筆
- 畫面上通常顯示最近 30 筆
- 會去重，重複的 prompt 不會一直堆
- 會同步到本機儲存，必要時也會走後端儲存流程

適合：

- 重複試不同模型
- 回頭找某段以前用過的 prompt
- 建立自己的 prompt 素材庫

## 7.5 Templates

Templates 是預設 prompt 模板，適合快速起稿。

內建常見類型包含：

- Portrait
- Landscape
- Product
- Animal
- Food
- Interior
- Character
- Sci-Fi
- Abstract
- Architecture
- Underwater
- Poster

白話說，如果你不知道怎麼開頭，就先選一個最接近的模板，再改成自己的需求。

## 7.6 Styles

Styles 是風格快捷選單，會把對應風格關鍵字加進 prompt。

分類包含：

- Photo
- Classic
- Digital
- Stylized
- Craft
- Design

範例風格包含：

- Photorealistic
- Cinematic
- Watercolor
- Anime
- Cyberpunk
- Fantasy Art
- Claymation
- Blueprint

白話理解：

- 這不是硬性套濾鏡
- 比較像自動幫你補上該風格常見描述

## 7.7 參考圖系統

App 有兩種主要參考圖。

### 7.7.1 Object References

放物件、道具、場景元素用。

適合：

- 想保留某個道具
- 想參考服裝、配件、商品外觀
- 想讓生成結果更接近指定物件

### 7.7.2 Character References

放角色形象、臉、髮型、服裝一致性用。

適合：

- 同一角色多張延伸
- 想維持角色辨識度
- 要做連續角色創作

### 7.7.3 操作方式

1. 上傳圖片到對應區
2. 依需要拖曳調整順序
3. 搭配 prompt 說清楚保留與修改重點
4. 送出生成

### 7.7.4 要注意的事

- 不同模型可放的數量不同
- Editor 模式下可放的參考圖上限通常比一般生成更少
- Nano Banana 2.5 不支援角色參考圖

## 7.8 比例 Ratio

可選比例很多，包含：

- 正方形 1:1
- 常見橫式 16:9、3:2、4:3
- 常見直式 9:16、3:4、2:3、4:5
- 極端長條 1:8、8:1、1:4、4:1

白話建議：

- 人像海報常用 9:16、4:5
- 桌布或橫幅常用 16:9、21:9
- 商品圖與社群封面常用 1:1、4:5
- 全景測試可用 4:1、8:1，但只有部分模型支援

## 7.9 尺寸 Size

依模型不同，可能看到：

- 512
- 1K
- 2K
- 4K

白話建議：

- 想先試方向，用較小尺寸即可
- 想保留細節或正式產出，再用 2K 或 4K
- 如果切到 Nano Banana 2.5 看不到尺寸，是正常行為

## 7.10 Batch Size 與多張探索

你可以一次出多張圖，而不是每次只出一張。

適合：

- 比較構圖
- 比較光線
- 比較角色表情
- 找最值得繼續的版本

白話建議：

- 還在探索方向時，一次出 2 到 4 張通常最划算
- 已經很接近想要的結果時，單張或少量會比較好控

## 7.11 Output Format

常見有兩種：

- Images only
- Images and text

白話理解：

- `Images only` 就是偏純圖像結果
- `Images and text` 可能同時帶回文字內容，對需要補充說明或延續工作流的人比較有幫助

## 7.12 Structured Output

這是 Nano Banana Pro 與 Nano Banana 2.5 的重要功能。它會要求模型不要只回圖，還要用有欄位、有結構的方式整理資訊。

目前主要模式有：

- Off
- Scene Brief
- Prompt Kit
- Quality Check
- Shot Plan
- Delivery Brief
- Revision Brief
- Variation Compare

### 各模式白話解釋

#### Scene Brief

把這張圖的核心場景、主體、構圖重點濃縮整理。

適合：

- 想快速摘要這一輪畫面
- 想跟別人說明這張圖的重點

#### Prompt Kit

把可重用的 prompt 素材拆成幾個區塊，例如主體、風格、光線、負面提示。

適合：

- 想從結果反推下一輪 prompt
- 想累積可重用詞庫

#### Quality Check

幫你看目前結果好在哪裡、問題在哪裡、下一步該優先修什麼。

適合：

- 已經有接近成果
- 想更理性地決定下一步修哪裡

#### Shot Plan

把鏡頭、構圖、燈光整理成比較像拍攝或分鏡用語。

適合：

- 影像敘事
- 多輪鏡頭一致性
- 需要清楚描述 framing 的情境

#### Delivery Brief

把這輪成果整理成比較像交付說明。

適合：

- 跟團隊溝通
- 整理可交付版本

#### Revision Brief

把「下一步該改什麼」整理成修稿指令。

適合：

- 想做第二輪、第三輪修正
- 想避免每次都重新想怎麼下指令

#### Variation Compare

幫你比較不同版本的差異、取捨、與下一步測試方向。

適合：

- 一次出了多張圖
- 不知道該繼續哪一張

### Structured Output 怎麼用得最實際

建議流程：

1. 先生成一輪圖
2. 選 `Prompt Kit` 或 `Revision Brief`
3. 看它整理出的欄位
4. 用 append 或 replace 的方式回填到 prompt
5. 再生成下一輪

白話說，它最有價值的地方不是「看漂亮格式」，而是「幫你接下一步」。

## 7.13 Temperature

這是控制生成發散程度的設定。

白話理解：

- 低一點：比較穩、比較保守
- 高一點：比較活、比較容易跑出意外結果

建議：

- 找方向時可以稍高
- 要穩定延續角色或構圖時，可以保守一點

## 7.14 Thinking Level

這個只在 Nano Banana 2 有作用，通常是：

- Minimal
- High

白話理解：

- `Minimal` 比較精簡
- `High` 代表偏更深入的思考流程

如果切到別的模型沒看到這個選項，屬正常。

## 7.15 Include Thoughts

這個設定代表你是否希望結果裡包含 thoughts。

白話說，就是除了圖片和一般輸出外，還想不想一起看到模型的思路內容。

不是所有模型都支援。

## 7.16 Grounding

Grounding 是讓模型帶著搜尋或來源脈絡來工作，不只是憑內部知識自由生成。

目前常見模式：

- Off
- Google Search
- Image Search
- Google Search + Image Search

### 白話理解

- `Google Search`：拿網路搜尋結果當背景參考
- `Image Search`：拿圖像搜尋脈絡當參考
- `Google Search + Image Search`：兩種一起用

### 適合情境

- 想更貼近真實世界資訊
- 想做有參考依據的視覺方向
- 想回頭看來源是什麼

### 要注意的事

- Nano Banana 2 支援 Google 與 Image Search
- Nano Banana Pro 只支援 Google Search
- Nano Banana 2.5 不支援 grounding

## 7.17 Generate

這是最核心的按鈕，按下去就會送出目前設定。

送出的內容通常包含：

- prompt
- 模型
- 比例
- 尺寸
- 風格
- 參考圖
- output format
- structured output 設定
- temperature
- grounding 設定
- conversation context

白話說，Generate 就是「把你現在工作台上的所有設定，一次交給模型」。

## 7.18 Follow-up Generate

這是延續式生成。不是重新開始，而是從當前工作脈絡接下去。

適合：

- 已有一張接近目標的圖
- 想做微調而不是大改
- 想延續角色、構圖或世界觀

## 7.19 Start New Conversation

如果你不想再沿用目前延續脈絡，可以開一條新的 conversation。

白話說，就是不要讓下一輪再背著現在這條線走。

適合：

- 想完全重開
- 原本方向已經歪掉
- 想保留舊脈絡，但另開新線

## 7.20 Chat Continuation

App 支援多輪延續式生成，會追蹤：

- conversation ID
- branch origin
- active source history ID
- prior turns

白話理解：

它不是只記得最後一張圖，而是記得「你這條創作線之前做過什麼」。

這讓你可以更自然地做：

- 延續
- 回頭
- 分支
- 從舊節點重開

## 7.21 Branch 分支

Branch 是這個 App 很重要的觀念。

白話來說：

- `Continue` 是沿同一條線往下走
- `Branch` 是從某個節點分出另一條平行可能性

### 什麼時候該開 Branch

- 你有兩個方向都想保留
- 不想覆蓋原本風格
- 想測不同服裝、不同背景、不同情緒版本

### 分支好處

- 原本那條線還在
- 新方向可以獨立延續
- 之後回看更清楚，不會全部混成一鍋

## 7.22 Branch Rename

你可以替分支改名，不一定要看系統自動命名。

適合：

- 把 `Branch 2` 改成 `夜景版`
- 把 `Branch 3` 改成 `紅衣角色版`

白話好處：

工作區一大後，自己看得懂比什麼都重要。

## 7.23 歷史檢視與回看

歷史區會保留每一輪生成結果。

你可以拿它做幾件事：

- 打開舊圖
- 從舊圖繼續
- 從舊圖開分支
- 比較 sibling variants
- 決定哪張升格成目前的 continuation source

白話說，歷史不是圖庫而已，它是你的創作路線圖。

## 7.24 批次變體與升格

當你一次出多張圖時，這些圖會被視為同一輪的 siblings。

你可以：

- 比較它們的差異
- 選其中一張當下一輪來源
- 暫時保留候選，不急著升格

這樣的好處是，你不用在每次生成後立刻二選一，可以先看完再決定。

## 7.25 Queued Batch Jobs

這是把批次請求當成「排隊工作」來處理的模式。

白話理解：

- 不是馬上在前台等結果
- 而是先送進佇列
- 之後再查狀態、再匯入結果

常見狀態包含：

- Pending
- Running
- Succeeded
- Failed
- Cancelled
- Expired

### 操作方式

1. 設定好 prompt 與參數
2. 使用 Queue Batch 功能送出工作
3. 到 Queued Batch Jobs 面板查看狀態
4. 視需要手動 poll
5. 完成後把結果 import 回工作區

### 適合誰

- 要跑較多張
- 想把生成工作當任務排程管理
- 不想每次都盯著前台畫面等

## 7.26 SketchPad

SketchPad 是草圖工具，你可以先畫一點概念，再拿去當生成依據。

功能包含：

- 畫筆
- 橡皮擦
- 平移
- 縮放
- Undo / Redo
- 可依比例建立畫布

白話用法：

- 畫一個大概構圖
- 標出主體位置
- 畫輪廓、動勢或布局
- 再讓模型依這個草圖發展

適合：

- 構圖已經在腦中，但文字說不清楚
- 想快速給模型一個大方向

## 7.27 Image Editor

Image Editor 是你拿已生成圖片做局部修改的地方。

主要模式有：

- Inpaint
- Outpaint

### Inpaint

針對局部區域修改。

白話說，就是「這張圖大致可以，只改局部」。

適合：

- 換手勢
- 改臉部細節
- 補道具
- 修背景某一區

### Outpaint

向外延伸畫面。

白話說，就是「原圖不夠大，往外長出去」。

適合：

- 把半身變全身
- 增加左右背景
- 補足海報版面

### Editor 內可用功能

- 畫筆
- 橡皮擦
- 平移
- 縮放
- 參考圖輔助
- Undo / Redo

### Editor 使用流程

1. 從某張結果開啟 Editor
2. 選 Inpaint 或 Outpaint
3. 塗出要改的地方，或調整延伸區域
4. 視需要加入參考圖
5. 補一段針對這次修改的 prompt
6. 送出 follow-up

### Editor 限制

Editor 可用的參考圖上限比一般生成更小：

- Nano Banana 2：最多 3 物件 + 2 角色
- Nano Banana Pro：最多 3 物件 + 2 角色
- Nano Banana 2.5：最多 1 物件 + 0 角色

## 7.28 Grounding Provenance Panel

如果這一輪有 grounding，系統會顯示來源面板。

你可以看到：

- 來源清單
- 來源標題與網址
- 是 web、image、還是 context 類型
- 哪些段落對應哪些來源
- 哪些來源有被引用、哪些沒有

白話說，這面板是在回答：

- 這次生成參考了什麼
- 哪些資訊真的有進到結果裡
- 我要不要把某段來源回填到下一輪 prompt

## 7.29 Provenance Reuse

來源資訊不只是拿來看，也可以回用。

常見操作有：

- append 到 prompt
- replace prompt
- 取某段來源文字當下一輪提示

白話意義：

你不用手動複製整理參考資料，可以直接從 provenance 面板挑重點回灌。

## 7.30 Session Replay

Session Replay 可以重看工作區流程紀錄。

適合：

- 匯入舊工作區後快速看懂它做過什麼
- 回頭看每一輪怎麼變過來的
- 幫自己或別人接手工作區

白話說，這是「回放創作過程」。

## 7.31 Workspace Restore Notice

如果 App 偵測到先前有工作區狀態，會跳出 restore 提示。

常見可選路徑：

- 打開最新一輪
- 從還原鏈條繼續
- 從還原點開分支
- 只沿用設定但清掉舊鏈條

白話建議：

- 想接著做，就選 continue
- 想保留舊案但做新方向，就 branch
- 只想拿回設定，不想背著舊脈絡，就用 settings only 類選項

## 7.32 Workspace Export

你可以把目前工作區匯出成 JSON snapshot。

內容可能包含：

- 歷史圖像
- staged assets
- workflow logs
- queued jobs
- branch state
- conversation state
- composer state

適合：

- 備份
- 換機器
- 把工作區交給別人
- 保存某個創作階段

## 7.33 Workspace Import

你可以把之前匯出的 workspace snapshot 載回來。

匯入時系統會先做 review，幫你看：

- 這份檔案有多少 turns
- 有幾條 branches
- 有多少 staged assets
- 最新一輪是什麼

匯入策略通常有兩種：

- Merge
- Replace

### Merge

把匯入內容加進目前工作區。

適合：

- 想保留現在進度
- 只是補進另一份歷史

### Replace

直接用匯入檔覆蓋目前工作區。

適合：

- 你要完整打開另一個工作案
- 現在這個工作區本來就不重要

## 7.34 Gallery

Gallery 用來集中看圖與回頭挑結果。

白話說，它比歷史面板更偏「選圖」，不是只看流程。

適合：

- 已經出很多圖
- 想快速挑幾張重點圖出來

## 8. 實際操作情境範例

## 8.1 純文字生圖

1. 選模型
2. 輸入 prompt
3. 選比例、尺寸、風格
4. 按 Generate
5. 從結果中挑最喜歡的一張

## 8.2 用參考圖生圖

1. 上傳物件圖或角色圖
2. 在 prompt 補充「保留什麼、改什麼」
3. 選模型與比例
4. Generate
5. 視結果再做 follow-up

## 8.3 用草圖引導生成

1. 打開 SketchPad
2. 畫大概構圖
3. 套用草圖
4. 補 prompt
5. Generate

## 8.4 從舊圖延續

1. 在歷史中選一張圖
2. 設成目前來源或使用 continue
3. 修改 prompt
4. Follow-up Generate

## 8.5 局部修圖

1. 打開某張結果
2. 進 Image Editor
3. 選 Inpaint
4. 塗出要修改的區域
5. 寫修圖 prompt
6. 送出 follow-up

## 8.6 做兩個版本並行比較

1. 選一張中間成果
2. 建立 Branch A 與 Branch B
3. A 走寫實方向，B 走風格化方向
4. 各自延續
5. 之後再回頭比較兩條線

## 8.7 把分析結果接到下一輪

1. 用 Pro 或 2.5 開 structured output
2. 選 `Prompt Kit` 或 `Revision Brief`
3. 生成後查看欄位
4. 用 append / replace 回填 prompt
5. 再生成下一輪

## 8.8 使用 grounding 做有來源的創作

1. 選支援 grounding 的模型
2. 打開 Google Search 或 Image Search
3. Generate
4. 到 provenance panel 看來源
5. 取有價值的內容回填 prompt

## 8.9 匯出工作區備份

1. 點 `Export Workspace`
2. 存成 JSON snapshot
3. 之後可再用 `Import Workspace` 載回

## 8.10 載入舊工作區後接著做

1. 點 `Import Workspace`
2. 選 snapshot 檔
3. 看 Import Review
4. 選 Merge 或 Replace
5. 打開最新一輪或從特定 branch 接續

## 9. 常見操作策略

## 9.1 什麼時候用 Continue

用 Continue 的時機：

- 你覺得方向是對的
- 只想微調
- 想保留同一條創作脈絡

## 9.2 什麼時候用 Branch

用 Branch 的時機：

- 你想同時保留兩個方向
- 想大改，但不想毀掉原本版本
- 想做 A/B 比較

## 9.3 什麼時候用 Editor

用 Editor 的時機：

- 你只想改局部
- 主體差不多正確
- 不想讓整張圖重新洗牌

## 9.4 什麼時候用 Structured Output

用 Structured Output 的時機：

- 你卡在「下一步怎麼修」
- 你想把結果整理成明確欄位
- 你想把結果反過來變成下一輪 prompt 材料

## 9.5 什麼時候用 Grounding

用 Grounding 的時機：

- 你要參考真實世界資訊
- 你希望結果帶有來源脈絡
- 你要回頭檢查參考依據

## 10. 常見限制與注意事項

- 不同模型支援的功能不同
- 不是每個模型都有尺寸選擇
- 不是每個模型都支援 grounding
- 不是每個模型都支援 thoughts
- Structured Output 不是每個模型都有
- Editor 可用的參考圖數量上限通常更小
- 極端比例主要是 Nano Banana 2 才支援得最完整

## 11. 常見問題

## 11.1 為什麼某些設定突然不見了

通常是因為你切換了模型，而新模型不支援那些功能。

## 11.2 為什麼看不到尺寸選擇

Nano Banana 2.5 沒有尺寸選擇器，這是正常的。

## 11.3 為什麼角色參考圖不能放

如果你目前用的是 Nano Banana 2.5，就不支援角色參考圖。

## 11.4 為什麼 structured output 沒有出現

Nano Banana 2 不支援 structured output。請改用 Pro 或 2.5。

## 11.5 為什麼 grounding 選項不能用

可能原因：

- 目前模型不支援
- 你選到只支援 Google Search 的模型，卻想用 Image Search

## 11.6 為什麼工作區重新整理後還在

因為 App 會保存 workspace snapshot，重新整理後可以提示你還原。

## 11.7 匯入工作區時該選 Merge 還是 Replace

- 想保留目前內容，用 Merge
- 想完整打開另一份工作區，用 Replace

## 12. 最推薦的新手流程

如果你要一套最不容易亂掉的用法，建議這樣：

1. 先選 Nano Banana 2 或 Pro
2. 用 Template 起稿
3. 用 Smart Rewrite 修 prompt
4. 放 1 到 3 張參考圖
5. 一次出 2 到 4 張
6. 選出最好的一張做 Continue
7. 不同方向用 Branch 分開
8. 局部問題交給 Editor
9. 想理清下一步時，用 Structured Output
10. 重要階段隨時 Export Workspace 備份

## 13. 一句話總結每個核心功能

- Prompt：告訴模型你要什麼
- Surprise Me：幫你找靈感
- Smart Rewrite：幫你把 prompt 說清楚
- Templates：快速套常見起手式
- Styles：快速補風格關鍵字
- References：用圖片指定角色或物件
- Ratio：決定畫面比例
- Size：決定輸出尺寸
- Batch：一次出多張做比較
- Generate：正式送出生成
- Continue：沿原本方向接著做
- Branch：保留原線，同時開新線
- Editor：只修局部，不重洗整張圖
- SketchPad：先畫草圖再生成
- Structured Output：把結果整理成可用資料
- Grounding：讓結果帶來源脈絡
- Provenance：回頭看來源用了什麼
- Replay：重看工作流
- Export：備份工作區
- Import：載回工作區
- Restore：重新打開上次進度

## 14. 結論

Nano Banana Ultra 最強的地方，不是單次生成，而是把創作過程裡最常斷掉的幾件事接起來：

- 版本管理
- 分支管理
- 參考圖管理
- 編輯延續
- 結果重用
- 工作區保存與回復

如果你只是偶爾打一段 prompt 生一張圖，它已經能用。

但如果你想做的是「同一個視覺概念，來回修很多輪，還要保留脈絡」，這個 App 的價值就會非常明顯。
