# 內部 Smoke 短版交接 - 2026-03-24

## 目前狀態

- 內部 smoke 已完成。
- queued batch invalid batch name 還原輪詢問題已修復。
- SketchPad 的 React controlled/uncontrolled warning 已修復。
- 修復後 focused 測試通過：`46 passed (46)` files，`506 passed (506)` tests。

## 剛完成的 live 驗證

- dev server 已啟動並確認 `/api/health` 正常。
- app 可正常進入。
- restore notice 可正常攔截並關閉。
- SketchPad 可正常開啟。
- zoom slider 在 live app 中維持穩定數值，未再出現先前 warning。

## 仍存在但非阻塞的項目

- restore fixture 內的假 queued job 仍會以失敗項目顯示在 queue panel。
- 部分 fixture / snapshot 仍可能引用外部假資源，瀏覽器可能出現載入噪音。

## 結論

- 目前可繼續內部開發與內部 smoke 使用。
- 若要做更乾淨的 demo，下一步優先處理 fixture 資源本地化，而不是功能層修 bug。
