# 內部 Smoke 最終中文總結 - 2026-03-24

## 結論

- `App-Nano_Banana_Ultra` 本輪內部 smoke 已完成，當前可繼續作為內部開發與內部 smoke 使用。
- 這輪找到並修掉兩個真實問題：
    - restored fake queued jobs 的 invalid batch name 會反覆 auto-poll
    - SketchPad 初始 auto-fit 後的 React controlled/uncontrolled warning
- 目前剩下的主要項目只剩 fixture 顯示層級的非阻塞噪音，不是產品 blocker。

## 已完成修復

- 佇列批次 invalid-name 問題已改為本地 terminal failure 行為，不再無限重試輪詢。
- SketchPad viewport 狀態已從錯誤混用的 `scale` / `zoom` 統一為 `zoom`，相關 warning 已消失。
- queued-import restore fixtures 與 shared workspace snapshot 已改成 inline data URL，不再依賴 `example.com` 假圖。

## 驗證結果

- focused 測試通過：`46 passed (46)` files，`506 passed (506)` tests。
- live app 驗證通過：dev server 正常、`/api/health` 正常。
- restore 流程三條主要分支都已實測通過：
    - `Workspace Restored -> Open latest turn -> Open viewer -> Close`
    - `Workspace Restored -> Continue source`
    - `Workspace Restored -> Branch from restored turn`
- 驗證過程中確認 stage source / follow-up source 會正確切換為：
    - `History · Reopen`
    - `History · Continue`
    - `History · Branch`

## 剩餘非阻塞項

- restore fixture 的假 queued jobs 仍會在 queue panel 顯示為歷史失敗項。
- 這些項目屬於 fixture 呈現問題，不是新的產品功能回歸。

## 建議

- 若要做更乾淨的 demo，下一步應優先整理 fixture 呈現與歷史假失敗項，而不是再追產品層 bug。
- 若只需要對內同步狀態，這份文件可直接當成單檔最終中文摘要使用。
