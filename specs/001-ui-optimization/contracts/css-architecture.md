# CSS 架構合約

**版本**: 1.0.0  
**建立日期**: 2025-10-22  
**功能**: SMART App 界面優化 CSS 規範

## BEM 命名規範

### 基本結構

```css
/* Block */
.smart-app { }

/* Element */
.smart-app__header { }
.smart-app__content { }
.smart-app__footer { }

/* Modifier */
.smart-app--loading { }
.smart-app--error { }
```

### 組件命名

#### 患者資訊組件

```css
/* 患者卡片 */
.patient-card { }
.patient-card__header { }
.patient-card__body { }
.patient-card__field { }
.patient-card__label { }
.patient-card__value { }

/* 修飾符 */
.patient-card--compact { }
.patient-card--highlighted { }
.patient-card__field--empty { }
```

#### 觀察值組件

```css
/* 觀察值群組 */
.observation-group { }
.observation-group__header { }
.observation-group__title { }
.observation-group__list { }

/* 觀察值項目 */
.observation-item { }
.observation-item__label { }
.observation-item__value { }
.observation-item__unit { }
.observation-item__badge { }

/* 修飾符 */
.observation-item--normal { }
.observation-item--abnormal { }
.observation-item--missing { }
```

#### 載入和錯誤狀態

```css
/* 載入狀態 */
.loading-spinner { }
.loading-spinner__dot { }
.loading-message { }

/* 錯誤狀態 */
.error-display { }
.error-display__icon { }
.error-display__message { }
.error-display__details { }
.error-display__actions { }
```

## CSS Custom Properties (CSS 變數)

### 色彩系統

```css
:root {
  /* 主要色彩 */
  --color-primary: #2563eb;
  --color-primary-light: #60a5fa;
  --color-primary-dark: #1d4ed8;
  
  /* 次要色彩 */
  --color-secondary: #10b981;
  --color-secondary-light: #34d399;
  --color-secondary-dark: #059669;
  
  /* 中性色彩 */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;
  
  /* 語義色彩 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* 醫療專用色彩 */
  --color-medical-blue: #0369a1;
  --color-medical-green: #166534;
  --color-medical-teal: #0f766e;
}
```

### 字體系統

```css
:root {
  /* 字體家族 */
  --font-family-base: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  
  /* 字體大小 */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  
  /* 字重 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* 行高 */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### 間距系統

```css
:root {
  /* 間距 */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  
  /* 邊框半徑 */
  --border-radius-sm: 0.125rem;  /* 2px */
  --border-radius-base: 0.25rem; /* 4px */
  --border-radius-md: 0.375rem;  /* 6px */
  --border-radius-lg: 0.5rem;    /* 8px */
  --border-radius-xl: 0.75rem;   /* 12px */
  --border-radius-full: 9999px;
  
  /* 陰影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

### 動畫系統

```css
:root {
  /* 動畫持續時間 */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* 緩動函數 */
  --easing-linear: linear;
  --easing-ease: ease;
  --easing-ease-in: ease-in;
  --easing-ease-out: ease-out;
  --easing-ease-in-out: ease-in-out;
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## 響應式設計斷點

```css
:root {
  /* 響應式斷點 */
  --breakpoint-mobile: 320px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1280px;
}

/* 媒體查詢混入 */
@media (min-width: 768px) {
  /* 平板和桌面樣式 */
}

@media (min-width: 1024px) {
  /* 桌面樣式 */
}
```

## Grid 系統

```css
/* 主要容器 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

/* Grid 系統 */
.grid {
  display: grid;
  gap: var(--spacing-4);
}

.grid--cols-1 { grid-template-columns: 1fr; }
.grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid--cols-3 { grid-template-columns: repeat(3, 1fr); }

/* 響應式 Grid */
.grid--responsive {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid--responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid--responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 組件樣式規範

### 卡片組件

```css
.card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--spacing-6);
  transition: box-shadow var(--duration-normal) var(--easing-ease);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card__header {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-neutral-200);
}

.card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
}
```

### 按鈕組件

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--secondary {
  background: var(--color-neutral-200);
  color: var(--color-neutral-700);
}
```

## 動畫類別

```css
/* 淡入動畫 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--duration-normal) var(--easing-ease);
}

/* 滑入動畫 */
@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-from-top {
  animation: slideInFromTop var(--duration-normal) var(--easing-ease);
}

/* 載入動畫 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse var(--duration-slow) var(--easing-ease) infinite;
}

/* 旋轉載入 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
```

## 工具類別

```css
/* 顯示/隱藏 */
.hidden { display: none !important; }
.invisible { visibility: hidden; }

/* 響應式顯示 */
.mobile-only { display: block; }
.tablet-up { display: none; }

@media (min-width: 768px) {
  .mobile-only { display: none; }
  .tablet-up { display: block; }
}

/* 文字對齊 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* 文字大小 */
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }

/* 文字重量 */
.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }
```

## 無障礙設計

```css
/* 焦點樣式 */
.focusable:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 螢幕閱讀器專用 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 高對比模式支援 */
@media (prefers-contrast: high) {
  .card {
    border: 1px solid var(--color-neutral-400);
  }
}

/* 偏好減少動畫 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```