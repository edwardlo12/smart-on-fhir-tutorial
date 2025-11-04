<!--
Version change: initial → 1.0.0
List of modified principles: 新增核心原則 (FHIR 標準遵循, 漸進式增強, 教學導向, 互操作性, 程式碼品質)
Added sections: 開發約束, 品質管控
Templates requiring updates: ✅ updated / ⚠ pending with file paths
Follow-up TODOs: none
-->

# SMART on FHIR 教學專案 Constitution

## 核心原則

### I. FHIR 標準遵循
SMART on FHIR 標準為專案核心；應用程式必須遵循 FHIR 規範與 SMART 授權流程；確保與符合 FHIR 標準的 EHR 系統互操作性；所有 FHIR 資源操作必須符合標準 API 規範。

### II. 漸進式增強（非協商性原則）
採用漸進式增強開發策略，針對現有系統進行迭代改進；每次更新都必須向後相容；新功能必須能在現有基礎上獨立運作；避免破壞性變更，確保既有功能穩定性。

### III. 教學導向
程式碼必須具有教學價值，清晰展示 SMART on FHIR 概念；提供完整的範例與說明文件；程式碼結構簡潔易懂，適合學習者理解；包含詳細的步驟指導與最佳實務示範。

### IV. 互操作性驗證
應用程式必須能與多個 FHIR 提供者互操作；必須在 Cerner 和 SMART Health IT 沙盒環境中測試通過；支援不同授權流程（EHR launch、standalone）；確保跨平台相容性。

### V. 程式碼品質與可測試性
所有功能必須可測試且具備完整錯誤處理機制；JavaScript 程式碼必須遵循最佳實務；使用標準化的程式庫（如 fhir-client.js）；確保程式碼的可維護性與擴展性。

## 開發約束

### 技術棧要求
- 前端技術：HTML5、CSS3、JavaScript（ES5+）
- FHIR 版本：優先使用 R4，向下相容 DSTU2
- 必要程式庫：fhir-client.js、jQuery（教學目的）
- 部署平台：GitHub Pages（靜態託管）
- 相容性：支援現代瀏覽器，包含 IE Edge 模式

### 安全性與合規性
- 遵循 OAuth 2.0 授權流程
- 實施 SMART 安全性最佳實務
- 防護 Clickjacking 攻擊（使用 XFC 程式庫）
- 妥善處理敏感醫療資訊

## 品質管控

### 測試要求
- 功能測試：所有 SMART 授權流程必須測試通過
- 互操作性測試：在多個 FHIR 提供者環境中驗證
- 使用者體驗測試：確保教學流程順暢
- 相容性測試：驗證跨瀏覽器與跨平台相容性

### 文件標準
- 所有程式碼都必須包含繁體中文註解
- 提供完整的設定與部署指南
- 維護最新的教學文件與範例
- 包含故障排除與常見問題解答

### 發布流程
- 所有變更必須在沙盒環境測試通過
- 必須驗證教學流程的完整性
- 需要進行回歸測試確保既有功能正常
- 發布前必須更新相關文件

## Governance

本憲章優先於所有其他開發實務；任何修訂都需要完整的文件記錄、核准流程與遷移計畫；所有 PR 與審查都必須驗證是否符合憲章規範；複雜度增加必須有充分的理由說明。

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22
