# Data Model: SMART App 界面優化

**Created**: 2025-10-22  
**Feature**: 001-ui-optimization  
**Purpose**: 定義界面組件和資料結構

## UI 組件模型

### PatientDisplayComponent

顯示患者基本資訊的組件

**Fields**:
- `firstName: string` - 患者名字
- `lastName: string` - 患者姓氏  
- `gender: string` - 性別（male/female/other）
- `birthDate: Date` - 出生日期
- `age: number` - 計算年齡

**Validation Rules**:
- firstName 和 lastName 不可為空字串時顯示
- birthDate 必須是有效日期格式
- age 自動從 birthDate 計算
- 資料缺失時顯示適當的佔位符

**State Transitions**:
- `loading` → `loaded` → `displayed`
- `error` 狀態處理資料載入失敗

### ObservationDisplayComponent

顯示 FHIR 觀察值資料的組件

**Fields**:
- `height: ObservationValue` - 身高資料
- `systolicBP: ObservationValue` - 收縮壓
- `diastolicBP: ObservationValue` - 舒張壓
- `hdl: ObservationValue` - 高密度膽固醇
- `ldl: ObservationValue` - 低密度膽固醇
- `observationGroups: Array<ObservationGroup>` - 分組觀察值

**Validation Rules**:
- 每個觀察值包含數值和單位
- 支援空值和不完整資料的優雅處理
- 數值範圍驗證（正常/異常指標）

### ObservationValue

單一觀察值的資料結構

**Fields**:
- `value: number | null` - 數值
- `unit: string` - 單位
- `code: string` - LOINC 代碼
- `display: string` - 顯示名稱
- `normalRange: Range | null` - 正常範圍（如果有）

### ObservationGroup

觀察值分組結構

**Fields**:
- `category: string` - 分類名稱（如：生理指標、實驗室檢查）
- `observations: Array<ObservationValue>` - 該分類下的觀察值
- `displayOrder: number` - 顯示順序

## UI 狀態模型

### AppState

應用程式整體狀態

**Fields**:
- `isLoading: boolean` - 載入狀態
- `hasError: boolean` - 錯誤狀態
- `errorMessage: string | null` - 錯誤訊息
- `patient: PatientData | null` - 患者資料
- `observations: Array<ObservationValue>` - 觀察值陣列
- `uiSettings: UISettings` - 界面設定

### UISettings

界面設定和偏好

**Fields**:
- `theme: 'light' | 'dark'` - 主題模式
- `compactMode: boolean` - 緊湊模式
- `language: 'zh-TW' | 'en'` - 顯示語言
- `showEmptyFields: boolean` - 是否顯示空欄位

## 響應式設計模型

### Breakpoint

響應式斷點定義

**Fields**:
- `mobile: '320px-767px'` - 手機螢幕
- `tablet: '768px-1023px'` - 平板螢幕  
- `desktop: '1024px+'` - 桌面螢幕

### LayoutConfiguration

不同螢幕尺寸的布局設定

**Fields**:
- `breakpoint: Breakpoint` - 對應的斷點
- `columns: number` - 欄位數量
- `cardLayout: 'stacked' | 'side-by-side'` - 卡片布局方式
- `navigationStyle: 'horizontal' | 'vertical'` - 導航樣式

## 錯誤處理模型

### ErrorState

錯誤狀態定義

**Fields**:
- `type: 'network' | 'auth' | 'data' | 'ui'` - 錯誤類型
- `message: string` - 錯誤訊息
- `details: string | null` - 詳細資訊
- `recoverable: boolean` - 是否可恢復
- `timestamp: Date` - 發生時間

### ErrorRecoveryAction

錯誤恢復操作

**Fields**:
- `label: string` - 操作標籤
- `action: () => void` - 恢復操作函數
- `primary: boolean` - 是否為主要操作

## 動畫與過渡模型

### TransitionConfig

過渡動畫設定

**Fields**:
- `duration: number` - 持續時間（毫秒）
- `easing: string` - 緩動函數
- `delay: number` - 延遲時間
- `property: string` - 動畫屬性

## 資料流關係

```
FHIR API Response
    ↓
Raw FHIR Resources (Patient, Observation)
    ↓
Data Transformation Layer
    ↓
UI Component Models (PatientDisplayComponent, ObservationDisplayComponent)
    ↓
View Rendering Layer
    ↓
DOM Elements with Enhanced Styling
```

## 狀態管理

使用簡單的狀態管理模式：

1. **單一資料來源**：AppState 集中管理狀態
2. **事件驅動更新**：使用 CustomEvent 進行組件通訊
3. **不可變更新**：確保狀態變更的可預測性
4. **局部狀態**：組件內部 UI 狀態獨立管理