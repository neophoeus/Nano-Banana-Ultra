內部 smoke 目前可視為通過，App-Nano_Banana_Ultra 已修掉 queued batch invalid-name 持續 auto-poll 與 SketchPad zoom warning 兩個實際問題，focused tests 也已通過 46 passed / 506 passed。

最新 live 驗證除既有的 restore notice 與 SketchPad 外，另外確認 `Workspace Restored -> Open latest turn -> Open viewer -> Close`、`Workspace Restored -> Continue source`、`Workspace Restored -> Branch from restored turn` 都可正常完成，且 provenance、stage source、follow-up source 會同步切成 `History · Reopen`、`History · Continue`、`History · Branch`。

目前 queued-import 還原快照也已改成 inline data URL，不再依賴外部 placeholder 圖，因此剩下的主要只剩 fixture 顯示層級的非阻塞噪音，不是功能 blocker。
