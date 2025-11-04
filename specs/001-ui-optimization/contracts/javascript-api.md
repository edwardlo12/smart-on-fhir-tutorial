# JavaScript API 合約

**版本**: 1.0.0  
**建立日期**: 2025-10-22  
**功能**: SMART App 界面優化

## UI 組件 API

### PatientDisplayManager

患者資料顯示管理器

```javascript
class PatientDisplayManager {
  /**
   * 初始化患者顯示組件
   * @param {Element} container - 容器 DOM 元素
   * @param {Object} options - 顯示選項
   */
  constructor(container, options = {})

  /**
   * 渲染患者資料
   * @param {Object} patientData - FHIR 患者資源
   * @returns {Promise<void>}
   */
  async render(patientData)

  /**
   * 更新患者資料
   * @param {Object} updatedData - 更新的患者資料
   */
  update(updatedData)

  /**
   * 清除顯示內容
   */
  clear()

  /**
   * 銷毀組件
   */
  destroy()
}
```

### ObservationDisplayManager

觀察值資料顯示管理器

```javascript
class ObservationDisplayManager {
  /**
   * 初始化觀察值顯示組件
   * @param {Element} container - 容器 DOM 元素
   * @param {Object} options - 顯示選項
   */
  constructor(container, options = {})

  /**
   * 渲染觀察值資料
   * @param {Array} observations - FHIR 觀察值資源陣列
   * @returns {Promise<void>}
   */
  async render(observations)

  /**
   * 按類別分組顯示
   * @param {Array} observations - 觀察值陣列
   * @param {Object} groupingConfig - 分組設定
   */
  renderGrouped(observations, groupingConfig)

  /**
   * 添加新的觀察值
   * @param {Object} observation - 新的觀察值
   */
  addObservation(observation)

  /**
   * 移除觀察值
   * @param {string} observationId - 觀察值 ID
   */
  removeObservation(observationId)
}
```

### LoadingStateManager

載入狀態管理器

```javascript
class LoadingStateManager {
  /**
   * 顯示載入狀態
   * @param {Element} container - 容器元素
   * @param {string} message - 載入訊息
   */
  static show(container, message = '載入中...')

  /**
   * 隱藏載入狀態
   * @param {Element} container - 容器元素
   */
  static hide(container)

  /**
   * 更新載入進度
   * @param {Element} container - 容器元素
   * @param {number} progress - 進度百分比 (0-100)
   */
  static updateProgress(container, progress)
}
```

### ErrorDisplayManager

錯誤顯示管理器

```javascript
class ErrorDisplayManager {
  /**
   * 顯示錯誤訊息
   * @param {Element} container - 容器元素
   * @param {Object} error - 錯誤物件
   * @param {Object} options - 顯示選項
   */
  static show(container, error, options = {})

  /**
   * 清除錯誤顯示
   * @param {Element} container - 容器元素
   */
  static clear(container)

  /**
   * 顯示可恢復錯誤
   * @param {Element} container - 容器元素
   * @param {Object} error - 錯誤物件
   * @param {Function} retryCallback - 重試回調函數
   */
  static showRecoverable(container, error, retryCallback)
}
```

## 事件 API

### 自訂事件

```javascript
// 患者資料載入完成事件
const patientLoadedEvent = new CustomEvent('patient:loaded', {
  detail: { patient: patientData }
});

// 觀察值資料載入完成事件
const observationsLoadedEvent = new CustomEvent('observations:loaded', {
  detail: { observations: observationsArray }
});

// UI 主題變更事件
const themeChangedEvent = new CustomEvent('ui:theme-changed', {
  detail: { theme: 'dark' | 'light' }
});

// 載入狀態變更事件
const loadingStateEvent = new CustomEvent('ui:loading-state', {
  detail: { isLoading: boolean, message: string }
});

// 錯誤事件
const errorEvent = new CustomEvent('app:error', {
  detail: { error: errorObject }
});
```

### 事件監聽器範例

```javascript
// 監聽患者資料載入
document.addEventListener('patient:loaded', (event) => {
  const patientData = event.detail.patient;
  // 處理患者資料載入完成
});

// 監聽錯誤事件
document.addEventListener('app:error', (event) => {
  const error = event.detail.error;
  // 處理錯誤顯示
});
```

## 工具函數 API

### DataTransformUtils

資料轉換工具

```javascript
class DataTransformUtils {
  /**
   * 轉換 FHIR 患者資源為顯示格式
   * @param {Object} fhirPatient - FHIR 患者資源
   * @returns {Object} 轉換後的患者資料
   */
  static transformPatient(fhirPatient)

  /**
   * 轉換 FHIR 觀察值資源為顯示格式
   * @param {Array} fhirObservations - FHIR 觀察值資源陣列
   * @returns {Array} 轉換後的觀察值資料
   */
  static transformObservations(fhirObservations)

  /**
   * 按類別分組觀察值
   * @param {Array} observations - 觀察值陣列
   * @returns {Object} 分組後的觀察值
   */
  static groupObservationsByCategory(observations)

  /**
   * 計算患者年齡
   * @param {string} birthDate - 出生日期 (ISO 格式)
   * @returns {number} 年齡
   */
  static calculateAge(birthDate)
}
```

### UIUtils

UI 工具函數

```javascript
class UIUtils {
  /**
   * 創建 DOM 元素並設定屬性
   * @param {string} tagName - 標籤名稱
   * @param {Object} attributes - 屬性物件
   * @param {string} textContent - 文字內容
   * @returns {Element} 創建的 DOM 元素
   */
  static createElement(tagName, attributes = {}, textContent = '')

  /**
   * 添加 CSS 類別
   * @param {Element} element - 目標元素
   * @param {...string} classNames - 類別名稱
   */
  static addClass(element, ...classNames)

  /**
   * 移除 CSS 類別
   * @param {Element} element - 目標元素
   * @param {...string} classNames - 類別名稱
   */
  static removeClass(element, ...classNames)

  /**
   * 切換 CSS 類別
   * @param {Element} element - 目標元素
   * @param {string} className - 類別名稱
   */
  static toggleClass(element, className)

  /**
   * 檢查元素是否在視窗內
   * @param {Element} element - 目標元素
   * @returns {boolean} 是否在視窗內
   */
  static isElementInViewport(element)
}
```

### AnimationUtils

動畫工具函數

```javascript
class AnimationUtils {
  /**
   * 淡入動畫
   * @param {Element} element - 目標元素
   * @param {number} duration - 持續時間（毫秒）
   * @returns {Promise<void>}
   */
  static fadeIn(element, duration = 300)

  /**
   * 淡出動畫
   * @param {Element} element - 目標元素
   * @param {number} duration - 持續時間（毫秒）
   * @returns {Promise<void>}
   */
  static fadeOut(element, duration = 300)

  /**
   * 滑入動畫
   * @param {Element} element - 目標元素
   * @param {string} direction - 方向 ('top', 'bottom', 'left', 'right')
   * @param {number} duration - 持續時間（毫秒）
   * @returns {Promise<void>}
   */
  static slideIn(element, direction = 'top', duration = 300)

  /**
   * 脈動動畫（用於載入狀態）
   * @param {Element} element - 目標元素
   * @param {number} duration - 持續時間（毫秒）
   */
  static pulse(element, duration = 1000)
}
```

## 回調函數規範

### 錯誤處理回調

```javascript
/**
 * 錯誤處理回調函數
 * @callback ErrorCallback
 * @param {Error} error - 錯誤物件
 * @param {string} context - 錯誤發生的上下文
 */

/**
 * 成功回調函數
 * @callback SuccessCallback
 * @param {*} result - 操作結果
 */

/**
 * 進度回調函數
 * @callback ProgressCallback
 * @param {number} progress - 進度百分比 (0-100)
 * @param {string} message - 進度訊息
 */
```

## 配置物件規範

### 顯示配置

```javascript
const displayConfig = {
  theme: 'light' | 'dark',
  compactMode: boolean,
  showEmptyFields: boolean,
  animationsEnabled: boolean,
  language: 'zh-TW' | 'en',
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
};
```

### 分組配置

```javascript
const groupingConfig = {
  categories: {
    'vital-signs': { 
      label: '生理指標', 
      order: 1,
      codes: ['8302-2', '8462-4', '8480-6'] 
    },
    'laboratory': { 
      label: '實驗室檢查', 
      order: 2,
      codes: ['2085-9', '2089-1'] 
    }
  },
  defaultCategory: 'other'
};
```