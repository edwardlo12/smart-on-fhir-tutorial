# 快速入門指南：SMART App 界面優化

**版本**: 1.0.0  
**更新日期**: 2025-10-22  
**適用對象**: 開發者、學習者

## 概述

本指南將幫助您快速設定並開始使用優化後的 SMART on FHIR 應用程式界面。界面優化包含現代化的視覺設計、響應式布局，以及改進的使用者體驗。

## 前置需求

### 系統要求

- **現代瀏覽器**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Docker** (可選): 用於本地開發環境
- **Git**: 用於版本控制

### 技術知識

- 基本的 HTML、CSS、JavaScript 知識
- 對 SMART on FHIR 概念的基本理解
- 瞭解 FHIR 資源結構

## 安裝與設定

### 方法一：使用 Docker (推薦)

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd smart-on-fhir-tutorial
   ```

2. **切換到優化分支**
   ```bash
   git checkout 001-ui-optimization
   ```

3. **啟動 Docker 容器**
   ```bash
   # 使用新版 Docker Compose 命令
   docker compose up -d
   ```

4. **存取應用程式**
   - 開啟瀏覽器，訪問 `http://localhost:8002` (注意：端口為 8002，非 8080)
   - 應用程式將自動載入優化後的界面

### 方法二：直接開發

1. **複製專案並切換分支**
   ```bash
   git clone <repository-url>
   cd smart-on-fhir-tutorial
   git checkout 001-ui-optimization
   ```

2. **使用 Live Server 或類似工具**
   - 使用 VS Code Live Server 擴充套件
   - 或使用 Python: `python -m http.server 8080`
   - 或使用 Node.js: `npx serve .`

3. **存取應用程式**
   - 瀏覽 `http://localhost:8080/example-smart-app/`

## 檔案結構

```
example-smart-app/
├── index.html                      # 主要應用程式頁面
├── launch.html                     # SMART 啟動頁面
├── launch-patient.html             # 患者獨立啟動
├── launch-smart-sandbox.html       # SMART Health IT 沙盒啟動
├── health.html                     # 健康檢查頁面
├── src/
│   ├── css/
│   │   ├── modern-ui.css          # 🆕 現代化 UI 樣式
│   │   ├── responsive.css         # 🆕 響應式設計
│   │   ├── components.css         # 🆕 組件樣式
│   │   └── example-smart-app.css  # 📝 原有樣式（已優化）
│   ├── js/
│   │   ├── example-smart-app.js   # 📝 主要邏輯（移除 jQuery）
│   │   ├── ui-components.js       # 🆕 UI 組件邏輯
│   │   └── data-visualization.js  # 🆕 資料視覺化
│   └── images/
└── lib/                           # 現有程式庫（不變）
```

**圖例**: 🆕 新增檔案 | 📝 修改檔案

## 快速啟動步驟

### 1. 本地測試

```bash
# 1. 啟動本地服務器
docker compose up -d

# 2. 開啟瀏覽器訪問
open http://localhost:8002/

# 3. 檢查健康狀態
open http://localhost:8002/health.html

# 4. 檢查各種啟動方式
open http://localhost:8002/launch.html              # SMART 啟動
open http://localhost:8002/launch-patient.html      # 患者啟動
open http://localhost:8002/launch-smart-sandbox.html # 沙盒啟動
```

### 2. SMART 沙盒測試

#### Cerner 沙盒

1. 訪問 [Cerner Code Console](https://code-console.cerner.com/)
2. 建立新的應用程式註冊
3. 使用以下設定：
   - **SMART Launch URI**: `http://localhost:8002/launch.html`
   - **Redirect URI**: `http://localhost:8002/`
   - **App Type**: Provider
   - **Scopes**: `patient/Patient.read patient/Observation.read launch online_access openid profile`

#### SMART Health IT 沙盒

1. 訪問 [SMART App Launcher](https://launch.smarthealthit.org/)
2. 設定以下參數：
   - **App Launch URL**: `http://localhost:8002/launch-smart-sandbox.html`
   - **FHIR Version**: R2 (DSTU2)
   - 選擇測試患者和提供者

### 3. GitHub Pages 部署

1. **推送變更到 GitHub**
   ```bash
   git add .
   git commit -m "feat: 界面優化完成"
   git push origin 001-ui-optimization
   ```

2. **合併到 gh-pages 分支**
   ```bash
   git checkout gh-pages
   git merge 001-ui-optimization
   git push origin gh-pages
   ```

3. **更新線上註冊**
   - 將沙盒中的 URI 更改為：`https://your-username.github.io/smart-on-fhir-tutorial/example-smart-app/`

## 功能導覽

### 主要改進

1. **現代化視覺設計**
   - 清晰的卡片式布局
   - 醫療友善的色彩主題
   - 優雅的陰影和邊框

2. **響應式設計**
   - 支援 320px 到 1920px 螢幕寬度
   - 自動調整布局適應不同裝置
   - 觸控友善的操作界面

3. **改進的資料展示**
   - 邏輯性的資料分組
   - 清楚的視覺層次
   - 空值和錯誤的優雅處理

4. **增強的載入體驗**
   - 流暢的載入動畫
   - 明確的進度指示
   - 友善的錯誤訊息

### 測試不同螢幕尺寸

1. **桌面檢視** (1024px+)
   - 三欄布局
   - 並排顯示患者和觀察值資料
   - 最佳的資訊密度

2. **平板檢視** (768px-1023px)
   - 兩欄布局
   - 適度的資訊密度
   - 觸控友善的間距

3. **手機檢視** (320px-767px)
   - 單欄布局
   - 堆疊式卡片設計
   - 最佳化的觸控體驗

## 常見問題排除

### 問題：應用程式無法載入

**解決方案**:
```bash
# 檢查 Docker 容器狀態
docker compose ps

# 重新啟動容器
docker compose restart

# 檢查端口是否被佔用 (注意：使用端口 8002)
lsof -i :8002

# 檢查應用程式響應
curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/health.html
```

### 問題：SMART 授權失敗

**解決方案**:
1. 確認 client_id 設定正確
2. 檢查 redirect URI 是否完全匹配
3. 驗證沙盒環境狀態

### 問題：響應式設計異常

**解決方案**:
1. 開啟瀏覽器開發者工具
2. 檢查 CSS 是否正確載入
3. 驗證 viewport meta 標籤

## 開發指南

### 修改樣式

1. **編輯 CSS 檔案**
   ```css
   /* 在 src/css/modern-ui.css 中修改主要樣式 */
   :root {
     --color-primary: #your-color;
   }
   ```

2. **測試變更**
   - 儲存檔案後重新整理瀏覽器
   - 使用開發者工具即時調試

### 修改 JavaScript

1. **編輯邏輯檔案**
   ```javascript
   // 在 src/js/example-smart-app.js 中修改主要邏輯
   // 注意：已移除 jQuery 依賴，使用原生 JavaScript
   ```

2. **添加新功能**
   ```javascript
   // 在 src/js/ui-components.js 中添加新的 UI 組件
   // 在 src/js/data-visualization.js 中添加資料視覺化功能
   ```

## 進階設定

### 自訂主題

1. **修改 CSS 變數**
   ```css
   :root {
     --color-primary: #your-primary-color;
     --color-secondary: #your-secondary-color;
     --font-family-base: 'Your Font', sans-serif;
   }
   ```

2. **添加暗色主題**
   ```css
   [data-theme="dark"] {
     --color-background: #1a1a1a;
     --color-text: #ffffff;
   }
   ```

### 效能最佳化

1. **CSS 最佳化**
   ```bash
   # 生成優化的 CSS 捆綁檔案
   cd example-smart-app
   ./build-css.sh
   
   # 檢查生成的檔案
   ls -la src/css/build/bundle.css
   ls -la index-prod.html
   ```
   
   - 移除未使用的樣式
   - 合併和壓縮 CSS 檔案
   - 生產版本使用捆綁的 CSS (77.2 KB)

2. **JavaScript 最佳化**
   - 實施延遲載入
   - 最小化 DOM 操作
   - 全域錯誤邊界處理
   - 虛擬捲動支援

3. **版本對比**
   - **開發版本**: `http://localhost:8002/index-dev.html` (分別載入 CSS 檔案)
   - **生產版本**: `http://localhost:8002/index-prod.html` (使用捆綁 CSS)

## 下一步

1. **學習 FHIR 資源**
   - 探索其他 FHIR 資源類型
   - 理解 FHIR 資料關係

2. **擴展功能**
   - 添加更多資料視覺化
   - 實施資料篩選和搜尋

3. **部署到生產環境**
   - 設定 HTTPS
   - 實施安全性最佳實務

## 支援與資源

- **SMART on FHIR 文件**: [http://docs.smarthealthit.org/](http://docs.smarthealthit.org/)
- **FHIR 規範**: [https://www.hl7.org/fhir/](https://www.hl7.org/fhir/)
- **專案 GitHub**: [專案連結]

如有問題，請參考 [故障排除指南] 或在 GitHub 上建立 issue。