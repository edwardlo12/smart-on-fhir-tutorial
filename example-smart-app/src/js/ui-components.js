/**
 * UI Components - JavaScript 組件管理
 * 
 * 此檔案包含：
 * - 患者資料顯示管理器 (PatientDisplayManager)
 * - 觀察值資料顯示管理器 (ObservationDisplayManager)
 * - 載入狀態管理器 (LoadingStateManager)
 * - 錯誤顯示管理器 (ErrorDisplayManager)
 * - 應用程式狀態管理 (AppState)
 * - 工具函數和輔助功能
 */

/* ===========================================
   應用程式狀態管理
   =========================================== */

/**
 * 應用程式全域狀態管理器
 */
class AppState {
  constructor() {
    this.state = {
      isLoading: false,
      hasError: false,
      errorMessage: null,
      patient: null,
      observations: [],
      uiSettings: {
        theme: 'light',
        compactMode: false,
        language: 'zh-TW',
        showEmptyFields: true
      }
    };
    
    this.listeners = new Map();
  }

  /**
   * 獲取當前狀態
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 更新狀態
   * @param {Object} updates - 要更新的狀態
   */
  setState(updates) {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // 通知所有監聽器
    this.notifyListeners(previousState, this.state);
  }

  /**
   * 訂閱狀態變更
   * @param {string} key - 監聽器鍵
   * @param {Function} callback - 回調函數
   */
  subscribe(key, callback) {
    this.listeners.set(key, callback);
  }

  /**
   * 取消訂閱
   * @param {string} key - 監聽器鍵
   */
  unsubscribe(key) {
    this.listeners.delete(key);
  }

  /**
   * 通知所有監聽器
   * @param {Object} previousState - 之前的狀態
   * @param {Object} currentState - 當前狀態
   */
  notifyListeners(previousState, currentState) {
    this.listeners.forEach(callback => {
      try {
        callback(previousState, currentState);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }

  /**
   * 設置載入狀態
   * @param {boolean} isLoading - 是否載入中
   * @param {string} message - 載入訊息
   */
  setLoading(isLoading, message = '') {
    this.setState({
      isLoading,
      loadingMessage: message,
      hasError: false,
      errorMessage: null
    });
  }

  /**
   * 設置錯誤狀態
   * @param {Error|string} error - 錯誤物件或訊息
   */
  setError(error) {
    const errorMessage = error instanceof Error ? error.message : error;
    this.setState({
      hasError: true,
      errorMessage,
      isLoading: false
    });
  }

  /**
   * 清除錯誤狀態
   */
  clearError() {
    this.setState({
      hasError: false,
      errorMessage: null
    });
  }

  /**
   * 設置患者資料
   * @param {Object} patient - 患者資料
   */
  setPatient(patient) {
    this.setState({ patient });
  }

  /**
   * 設置觀察值資料
   * @param {Array} observations - 觀察值陣列
   */
  setObservations(observations) {
    this.setState({ observations });
  }
}

// 創建全域狀態實例
const appState = new AppState();

/* ===========================================
   患者資料顯示管理器
   =========================================== */

/**
 * 患者資料顯示管理器
 */
class PatientDisplayManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      showAge: true,
      showGender: true,
      showId: false,
      dateFormat: 'YYYY-MM-DD',
      ...options
    };
    
    this.patient = null;
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * 初始化組件
   */
  init() {
    if (!this.container) {
      throw new Error('Container element is required');
    }
    
    this.container.classList.add('patient-display');
    this.isInitialized = true;
  }

  /**
   * 渲染患者資料
   * @param {Object} patientData - FHIR 患者資源
   */
  async render(patientData) {
    if (!this.isInitialized) {
      throw new Error('PatientDisplayManager not initialized');
    }

    try {
      this.patient = DataTransformUtils.transformPatient(patientData);
      this.container.innerHTML = this.generatePatientHTML();
      
      // 觸發渲染完成事件
      this.dispatchEvent('patient:rendered', { patient: this.patient });
      
    } catch (error) {
      console.error('Error rendering patient data:', error);
      this.showError('無法顯示患者資料');
    }
  }

  /**
   * 生成患者 HTML
   */
  generatePatientHTML() {
    if (!this.patient) {
      return '<div class="patient-display__empty">無患者資料</div>';
    }

    return `
      <div class="card patient-display__card">
        <div class="card__header">
          <h2 class="card__title patient-display__name">
            ${this.patient.firstName} ${this.patient.lastName}
          </h2>
          ${this.options.showId ? `<div class="card__subtitle">ID: ${this.patient.id}</div>` : ''}
        </div>
        <div class="card__body">
          <div class="patient-display__details">
            ${this.options.showGender ? `
              <div class="patient-display__detail">
                <span class="patient-display__label">性別:</span>
                <span class="patient-display__value">${this.getGenderText(this.patient.gender)}</span>
              </div>
            ` : ''}
            
            ${this.patient.birthDate ? `
              <div class="patient-display__detail">
                <span class="patient-display__label">出生日期:</span>
                <span class="patient-display__value">${this.formatDate(this.patient.birthDate)}</span>
              </div>
            ` : ''}
            
            ${this.options.showAge && this.patient.age ? `
              <div class="patient-display__detail">
                <span class="patient-display__label">年齡:</span>
                <span class="patient-display__value">${this.patient.age} 歲</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 獲取性別文字
   * @param {string} gender - 性別代碼
   */
  getGenderText(gender) {
    const genderMap = {
      'male': '男性',
      'female': '女性',
      'other': '其他',
      'unknown': '未知'
    };
    return genderMap[gender] || '未指定';
  }

  /**
   * 格式化日期
   * @param {string|Date} date - 日期
   */
  formatDate(date) {
    if (!date) return '未提供';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '無效日期';
    
    return dateObj.toLocaleDateString('zh-TW');
  }

  /**
   * 顯示錯誤
   * @param {string} message - 錯誤訊息
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error">
        <div class="error__content">
          <div class="error__title">錯誤</div>
          <div class="error__message">${message}</div>
        </div>
      </div>
    `;
  }

  /**
   * 更新患者資料
   * @param {Object} updatedData - 更新的患者資料
   */
  update(updatedData) {
    this.render(updatedData);
  }

  /**
   * 清除顯示內容
   */
  clear() {
    this.container.innerHTML = '';
    this.patient = null;
  }

  /**
   * 觸發自訂事件
   * @param {string} eventName - 事件名稱
   * @param {Object} detail - 事件詳情
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    this.container.dispatchEvent(event);
  }

  /**
   * 銷毀組件
   */
  destroy() {
    this.clear();
    this.container.classList.remove('patient-display');
    this.isInitialized = false;
  }
}

/* ===========================================
   觀察值資料顯示管理器
   =========================================== */

/**
 * 觀察值資料顯示管理器
 */
class ObservationDisplayManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      groupByCategory: true,
      showUnits: true,
      showNormalRanges: false,
      sortByDate: true,
      ...options
    };
    
    this.observations = [];
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * 初始化組件
   */
  init() {
    if (!this.container) {
      throw new Error('Container element is required');
    }
    
    this.container.classList.add('observation-display');
    this.isInitialized = true;
  }

  /**
   * 渲染觀察值資料
   * @param {Array} observations - FHIR 觀察值資源陣列
   */
  async render(observations) {    
    if (!this.isInitialized) {
      throw new Error('ObservationDisplayManager not initialized');
    }

    try {
      this.observations = DataTransformUtils.transformObservations(observations);
      
      if (this.options.groupByCategory) {
        this.renderGrouped();
      } else {
        this.renderList();
      }
      
      // 觸發渲染完成事件
      this.dispatchEvent('observations:rendered', { observations: this.observations });
      
    } catch (error) {
      console.error('Error rendering observations:', error);
      this.showError('無法顯示觀察值資料');
    }
  }

  /**
   * 分組渲染觀察值
   */
  renderGrouped() {
    const grouped = DataTransformUtils.groupObservationsByCategory(this.observations);
    
    let html = '<div class="observations-layout">';
    
    Object.entries(grouped).forEach(([category, categoryObservations]) => {
      html += `
        <div class="card observation-group">
          <div class="card__header">
            <h3 class="card__title">${this.getCategoryTitle(category)}</h3>
          </div>
          <div class="card__body">
            ${this.generateObservationsList(categoryObservations)}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    this.container.innerHTML = html;
  }

  /**
   * 列表渲染觀察值
   */
  renderList() {
    const html = `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">觀察值資料</h3>
        </div>
        <div class="card__body">
          ${this.generateObservationsList(this.observations)}
        </div>
      </div>
    `;
    this.container.innerHTML = html;
  }

  /**
   * 生成觀察值列表 HTML
   * @param {Array} observations - 觀察值陣列
   */
  generateObservationsList(observations) {
    if (!observations || observations.length === 0) {
      return '<div class="observation-display__empty">無觀察值資料</div>';
    }

    return observations.map(obs => `
      <div class="observation-item">
        <div class="observation-item__name">${obs.display}</div>
        <div class="observation-item__value">
          ${obs.value !== null ? obs.value : '無資料'}
          ${this.options.showUnits && obs.unit ? ` ${obs.unit}` : ''}
        </div>
        ${this.options.showNormalRanges && obs.normalRange ? `
          <div class="observation-item__range">
            正常範圍: ${obs.normalRange}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  /**
   * 獲取分類標題
   * @param {string} category - 分類代碼
   */
  getCategoryTitle(category) {
    const categoryMap = {
      'vital-signs': '生理指標',
      'laboratory': '實驗室檢查',
      'survey': '問卷調查',
      'exam': '身體檢查',
      'other': '其他'
    };
    return categoryMap[category] || category;
  }

  /**
   * 顯示錯誤
   * @param {string} message - 錯誤訊息
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error">
        <div class="error__content">
          <div class="error__title">錯誤</div>
          <div class="error__message">${message}</div>
        </div>
      </div>
    `;
  }

  /**
   * 添加新的觀察值
   * @param {Object} observation - 新的觀察值
   */
  addObservation(observation) {
    this.observations.push(DataTransformUtils.transformObservation(observation));
    this.render(this.observations);
  }

  /**
   * 移除觀察值
   * @param {string} observationId - 觀察值 ID
   */
  removeObservation(observationId) {
    this.observations = this.observations.filter(obs => obs.id !== observationId);
    this.render(this.observations);
  }

  /**
   * 觸發自訂事件
   * @param {string} eventName - 事件名稱
   * @param {Object} detail - 事件詳情
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    this.container.dispatchEvent(event);
  }

  /**
   * 清除顯示內容
   */
  clear() {
    this.container.innerHTML = '';
    this.observations = [];
  }

  /**
   * 銷毀組件
   */
  destroy() {
    this.clear();
    this.container.classList.remove('observation-display');
    this.isInitialized = false;
  }
}

/* ===========================================
   載入狀態管理器
   =========================================== */

/**
 * 載入狀態管理器
 */
class LoadingStateManager {
  /**
   * 顯示載入狀態
   * @param {Element} container - 容器元素
   * @param {string} message - 載入訊息
   */
  static show(container, message = '載入中...') {
    if (!container) return;
    
    const loadingHTML = `
      <div class="loading" data-loading="true">
        <div class="loading__spinner"></div>
        <div class="loading__text">${message}</div>
      </div>
    `;
    
    container.innerHTML = loadingHTML;
  }

  /**
   * 隱藏載入狀態
   * @param {Element} container - 容器元素
   */
  static hide(container) {
    if (!container) return;
    
    const loadingElement = container.querySelector('[data-loading="true"]');
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  /**
   * 更新載入進度
   * @param {Element} container - 容器元素
   * @param {number} progress - 進度百分比 (0-100)
   */
  static updateProgress(container, progress) {
    if (!container) return;
    
    const loadingText = container.querySelector('.loading__text');
    if (loadingText) {
      loadingText.textContent = `載入中... ${Math.round(progress)}%`;
    }
  }
}

/* ===========================================
   錯誤顯示管理器
   =========================================== */

/**
 * 錯誤顯示管理器
 */
class ErrorDisplayManager {
  /**
   * 顯示錯誤訊息
   * @param {Element} container - 容器元素
   * @param {Object|string} error - 錯誤物件或訊息
   * @param {Object} options - 顯示選項
   */
  static show(container, error, options = {}) {
    if (!container) return;
    
    const errorMessage = error instanceof Error ? error.message : error;
    const errorType = options.type || 'error';
    
    const errorHTML = `
      <div class="error error--${errorType}" data-error="true">
        <div class="error__content">
          <div class="error__title">${options.title || '錯誤'}</div>
          <div class="error__message">${errorMessage}</div>
          ${options.details ? `<div class="error__details">${options.details}</div>` : ''}
          ${options.retryCallback ? `
            <div class="error__actions">
              <button class="btn btn--primary" onclick="(${options.retryCallback})()">重試</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    container.innerHTML = errorHTML;
  }

  /**
   * 清除錯誤顯示
   * @param {Element} container - 容器元素
   */
  static clear(container) {
    if (!container) return;
    
    const errorElement = container.querySelector('[data-error="true"]');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * 顯示可恢復錯誤
   * @param {Element} container - 容器元素
   * @param {Object|string} error - 錯誤物件或訊息
   * @param {Function} retryCallback - 重試回調函數
   */
  static showRecoverable(container, error, retryCallback) {
    this.show(container, error, {
      retryCallback,
      title: '操作失敗'
    });
  }
}

/* ===========================================
   觀察值分組管理器 (ObservationGroupManager)
   =========================================== */

/**
 * 觀察值分組顯示管理器
 * 整合資料分組邏輯與 UI 顯示
 */
class ObservationGroupManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableSearch: true,
      enableFilters: true,
      collapsible: true,
      showEmpty: false,
      layout: 'list', // 'list' 或 'grid'
      virtualScrolling: true, // 虛擬捲動
      itemsPerPage: 50, // 每頁項目數
      cacheEnabled: true, // 快取啟用
      debounceDelay: 300, // 搜尋防抖延遲
      ...options
    };
    
    this.dataGrouper = null;
    this.searchEngine = null;
    this.currentFilters = {
      category: null,
      search: '',
      dateRange: null
    };
    
    // 性能優化相關
    this.cache = new Map(); // 渲染快取
    this.searchCache = new Map(); // 搜尋快取
    this.debounceTimers = new Map(); // 防抖計時器
    this.virtualScrollState = {
      scrollTop: 0,
      itemHeight: 80, // 預估項目高度
      visibleRange: { start: 0, end: 0 },
      renderBuffer: 5 // 緩衝區項目數
    };
    this.performanceMetrics = {
      renderTime: 0,
      searchTime: 0,
      filterTime: 0,
      lastRenderStart: 0
    };
    
    this.initialize();
  }

  /**
   * 初始化組件
   */
  initialize() {
    if (!this.container) {
      console.error('ObservationGroupManager: Container not found');
      return;
    }

    try {
      // 建立基本結構
      this.createStructure();
      this.bindEvents();
      
      // 載入用戶偏好設定
      this.loadUserPreferences();
      
      // 設置性能監控快捷鍵
      this.setupPerformanceShortcuts();
      
      // 初始化鍵盤導航
      this.initKeyboardNavigation();
      
      // 初始化連接狀態監控
      this.initConnectionMonitor();
      
      // 延遲初始化資料組件，確保所有 JavaScript 檔案都已載入
      this.initializeDataComponents();
    } catch (error) {
      this.handleError(error, 'initialization');
    }
  }

  /**
   * 載入用戶偏好設定
   */
  loadUserPreferences() {
    try {
      const preferences = localStorage.getItem('observationGroupPreferences');
      if (preferences) {
        this.userPreferences = JSON.parse(preferences);
        // 將陣列轉換回 Set
        this.userPreferences.collapsedGroups = new Set(this.userPreferences.collapsedGroups || []);
      } else {
        this.userPreferences = {
          collapsedGroups: new Set(),
          defaultCollapsed: false,
          layout: this.options.layout || 'list'
        };
      }
    } catch (error) {
      console.warn('無法載入用戶偏好設定:', error);
      this.userPreferences = {
        collapsedGroups: new Set(),
        defaultCollapsed: false,
        layout: this.options.layout || 'list'
      };
    }
  }

  /**
   * 儲存用戶偏好設定
   */
  saveUserPreferences() {
    try {
      const preferences = {
        ...this.userPreferences,
        collapsedGroups: Array.from(this.userPreferences.collapsedGroups)
      };
      localStorage.setItem('observationGroupPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('無法儲存用戶偏好設定:', error);
    }
  }

  /**
   * 初始化資料組件
   */
  initializeDataComponents() {
    // 初始化資料分組器
    if (window.ObservationDataGrouper) {
      this.dataGrouper = new window.ObservationDataGrouper();
      console.log('ObservationDataGrouper initialized successfully');
    } else {
      console.warn('ObservationDataGrouper not available, retrying in 100ms...');
      // 如果還沒載入，延遲重試
      setTimeout(() => {
        this.initializeDataComponents();
      }, 100);
      return;
    }

    // 初始化搜尋引擎
    if (window.ObservationSearchEngine && this.dataGrouper) {
      this.searchEngine = new window.ObservationSearchEngine(this.dataGrouper);
      console.log('ObservationSearchEngine initialized successfully');
    } else {
      console.warn('ObservationSearchEngine not available');
    }
  }

  /**
   * 建立 HTML 結構
   */
  createStructure() {
    this.container.className = 'observation-groups-container';
    
    let html = '';

    // 搜尋區域
    if (this.options.enableSearch) {
      html += `
        <div class="group-filters">
          <div class="search-box">
            <span class="search-box__icon">🔍</span>
            <input type="text" 
                   class="search-box__input" 
                   placeholder="搜尋觀察值..." 
                   id="obs-search-input">
            <button class="search-box__clear" style="display: none;" id="obs-search-clear">✕</button>
          </div>
        </div>
      `;
    }

    // 過濾器按鈕區域 (獨立容器)
    if (this.options.enableFilters) {
      html += '<div class="filter-buttons" id="category-filters"></div>';
    }

    // 資料群組容器
    const layoutClass = this.options.layout === 'grid' ? 'data-groups--grid' : '';
    html += `<div class="data-groups ${layoutClass}" id="observation-groups"></div>`;

    // 空狀態
    html += `
      <div class="empty-state" id="empty-state" style="display: none;">
        <div class="empty-state__icon">📄</div>
        <div class="empty-state__title">沒有觀察值資料</div>
        <div class="empty-state__message">目前沒有符合條件的觀察值資料可顯示</div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * 綁定事件監聽器
   */
  bindEvents() {
    // 搜尋功能
    if (this.options.enableSearch) {
      const searchInput = this.container.querySelector('#obs-search-input');
      const searchClear = this.container.querySelector('#obs-search-clear');

      if (searchInput) {
        searchInput.addEventListener('input', this.handleSearch.bind(this));
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.clearSearch();
          }
        });
      }

      if (searchClear) {
        searchClear.addEventListener('click', this.clearSearch.bind(this));
      }
    }

    // 委託事件 - 分組展開/摺疊
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.group-card__toggle')) {
        this.toggleGroup(e.target.closest('.group-card'));
      }
      
      // 類別過濾器點擊
      if (e.target.closest('.filter-button')) {
        const categoryId = e.target.closest('.filter-button').dataset.category;
        this.filterByCategory(categoryId);
      }
    });
  }

  /**
   * 渲染觀察值分組
   * @param {Array} observations - 觀察值陣列
   */
  render(observations = []) {
    if (!this.dataGrouper) {
      console.error('ObservationGroupManager: DataGrouper not available');
      // 嘗試重新初始化
      this.initializeDataComponents();
      
      // 如果還是不可用，顯示錯誤狀態
      if (!this.dataGrouper) {
        this.showError('資料分組功能載入中，請稍後...');
        return;
      }
    }

    // 分組資料
    const groupedData = this.dataGrouper.groupObservations(observations);
    
    // 儲存當前觀察值以供後續更新使用
    this.currentObservations = observations;
    this.lastUpdateTime = Date.now();
    
    // 渲染過濾器
    if (this.options.enableFilters) {
      this.renderFilters(groupedData);
    }

    // 渲染分組（使用優化版本）
    this.renderGroupsOptimized(groupedData);
  }

  /**
   * 更新觀察值資料（智慧更新）
   * @param {Array} newObservations - 新的觀察值陣列
   */
  updateObservations(newObservations = []) {
    if (!this.dataGrouper) {
      console.warn('ObservationGroupManager: DataGrouper not available for update');
      return;
    }

    // 比較是否有新資料
    const hasNewData = this.hasNewData(newObservations);
    if (!hasNewData) {
      console.log('ObservationGroupManager: No new data to update');
      return;
    }

    console.log(`ObservationGroupManager: Updating with ${newObservations.length} observations`);
    
    // 標記更新開始
    this.showUpdateIndicator();
    
    // 使用動畫過渡更新
    setTimeout(() => {
      this.render(newObservations);
      this.hideUpdateIndicator();
      this.showUpdateNotification();
    }, 300);
  }

  /**
   * 檢查是否有新資料
   * @param {Array} newObservations - 新觀察值
   * @returns {boolean} 是否有新資料
   */
  hasNewData(newObservations) {
    if (!this.currentObservations) return true;
    
    // 簡單比較：數量或最新 ID 不同
    if (newObservations.length !== this.currentObservations.length) {
      return true;
    }
    
    // 比較最新觀察值的 ID
    const newLatestId = newObservations[0]?.id;
    const currentLatestId = this.currentObservations[0]?.id;
    
    return newLatestId !== currentLatestId;
  }

  /**
   * 顯示更新指示器
   */
  showUpdateIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'update-indicator';
    indicator.innerHTML = `
      <div class="update-indicator__spinner"></div>
      <span>更新中...</span>
    `;
    indicator.id = 'observation-update-indicator';
    
    this.container.appendChild(indicator);
  }

  /**
   * 隱藏更新指示器
   */
  hideUpdateIndicator() {
    const indicator = this.container.querySelector('#observation-update-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * 顯示更新完成通知
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <span class="update-notification__icon">✅</span>
      <span>資料已更新</span>
    `;
    
    this.container.appendChild(notification);
    
    // 3秒後自動移除通知
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  /**
   * 渲染類別過濾器
   * @param {Map} groupedData - 分組資料
   */
  renderFilters(groupedData) {
    const filterContainer = this.container.querySelector('#category-filters');
    if (!filterContainer) return;

    let html = `
      <button class="filter-button ${!this.currentFilters.category ? 'filter-button--active' : ''}" 
              data-category="">
        <span class="filter-button__icon">📂</span>
        <span>全部</span>
        <span class="filter-button__count">${this.getTotalCount(groupedData)}</span>
      </button>
    `;

    groupedData.forEach((group, categoryId) => {
      const isActive = this.currentFilters.category === categoryId;
      const count = group.summary.count;
      
      if (count > 0 || this.options.showEmpty) {
        html += `
          <button class="filter-button ${isActive ? 'filter-button--active' : ''}" 
                  data-category="${categoryId}">
            <span class="filter-button__icon">${group.category.icon}</span>
            <span>${group.category.name}</span>
            <span class="filter-button__count">${count}</span>
          </button>
        `;
      }
    });

    filterContainer.innerHTML = html;
  }

  /**
   * 渲染分組卡片
   * @param {Map} groupedData - 分組資料
   */
  renderGroups(groupedData) {
    const groupsContainer = this.container.querySelector('#observation-groups');
    const emptyState = this.container.querySelector('#empty-state');
    
    if (!groupsContainer) return;

    // 應用過濾器
    const filteredData = this.applyFilters(groupedData);
    
    // 檢查是否有資料
    const hasData = Array.from(filteredData.values()).some(group => group.observations.length > 0);
    
    if (!hasData) {
      groupsContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    groupsContainer.style.display = 'flex';

    let html = '';
    
    // 按優先順序排序類別
    const sortedCategories = Array.from(filteredData.entries())
      .filter(([_, group]) => group.observations.length > 0 || this.options.showEmpty)
      .sort(([aId, a], [bId, b]) => a.category.priority - b.category.priority);

    sortedCategories.forEach(([categoryId, group]) => {
      html += this.renderGroupCard(categoryId, group);
    });

    groupsContainer.innerHTML = html;
    
    // 應用已儲存的摺疊狀態
    this.applyCollapsedStates();
  }

  /**
   * 優化版本的群組渲染（支援虛擬捲動和快取）
   */
  renderGroupsOptimized(groupedData) {
    const startTime = performance.now();
    this.performanceMetrics.lastRenderStart = startTime;
    
    const groupsContainer = this.container.querySelector('#observation-groups');
    const emptyState = this.container.querySelector('#empty-state');
    
    if (!groupsContainer) return;

    // 檢查渲染快取
    const cacheKey = this.generateCacheKey(groupedData);
    if (this.options.cacheEnabled && this.cache.has(cacheKey)) {
      console.log(`渲染快取命中: ${cacheKey.substring(0, 20)}...`);
      groupsContainer.innerHTML = this.cache.get(cacheKey);
      this.applyCollapsedStates();
      
      this.performanceMetrics.renderTime = performance.now() - startTime;
      return;
    }

    // 檢查是否有資料
    const hasData = Array.from(groupedData.values()).some(group => group.observations.length > 0);
    
    if (!hasData) {
      groupsContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    groupsContainer.style.display = 'flex';

    // 虛擬捲動處理
    const sortedCategories = this.prepareCategoriesForRendering(groupedData);
    const html = this.renderWithVirtualScrolling(sortedCategories);

    groupsContainer.innerHTML = html;
    
    // 快取渲染結果
    if (this.options.cacheEnabled) {
      this.cache.set(cacheKey, html);
      this.limitCacheSize();
    }
    
    // 設置虛擬捲動監聽器
    this.setupVirtualScrolling(groupsContainer);
    
    // 應用已儲存的摺疊狀態
    this.applyCollapsedStates();
    
    this.performanceMetrics.renderTime = performance.now() - startTime;
    console.log(`渲染完成: ${this.performanceMetrics.renderTime.toFixed(2)}ms`);
  }

  /**
   * 從快取渲染群組
   */
  renderGroupsFromCache(cachedData) {
    const groupsContainer = this.container.querySelector('#observation-groups');
    if (!groupsContainer) return;

    const html = this.renderWithVirtualScrolling(
      this.prepareCategoriesForRendering(cachedData)
    );
    
    groupsContainer.innerHTML = html;
    this.applyCollapsedStates();
  }

  /**
   * 生成快取鍵
   */
  generateCacheKey(groupedData) {
    const dataSignature = Array.from(groupedData.entries())
      .map(([categoryId, group]) => `${categoryId}:${group.observations.length}`)
      .join('|');
    
    const filterSignature = `${this.currentFilters.category || 'all'}_${this.currentFilters.search}_${this.currentFilters.dateRange || 'all'}`;
    
    return `render_${filterSignature}_${dataSignature}`;
  }

  /**
   * 限制快取大小
   */
  limitCacheSize() {
    const maxCacheSize = 20;
    if (this.cache.size > maxCacheSize) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, this.cache.size - maxCacheSize);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  /**
   * 準備類別資料以供渲染
   */
  prepareCategoriesForRendering(groupedData) {
    return Array.from(groupedData.entries())
      .filter(([_, group]) => group.observations.length > 0 || this.options.showEmpty)
      .sort(([aId, a], [bId, b]) => a.category.priority - b.category.priority);
  }

  /**
   * 虛擬捲動渲染
   */
  renderWithVirtualScrolling(sortedCategories) {
    if (!this.options.virtualScrolling || sortedCategories.length <= 10) {
      // 對小數據集不使用虛擬捲動
      return sortedCategories.map(([categoryId, group]) => 
        this.renderGroupCard(categoryId, group)
      ).join('');
    }

    // 虛擬捲動實作
    let html = '<div class="virtual-scroll-container">';
    
    sortedCategories.forEach(([categoryId, group], index) => {
      const shouldRender = this.shouldRenderItem(index, group.observations.length);
      
      if (shouldRender) {
        html += this.renderGroupCard(categoryId, group);
      } else {
        // 渲染佔位符
        html += this.renderPlaceholderCard(categoryId, group);
      }
    });
    
    html += '</div>';
    return html;
  }

  /**
   * 判斷項目是否應該渲染
   */
  shouldRenderItem(index, itemCount) {
    // 簡化的可見性檢查
    const { start, end } = this.virtualScrollState.visibleRange;
    const buffer = this.virtualScrollState.renderBuffer;
    
    return index >= (start - buffer) && index <= (end + buffer);
  }

  /**
   * 渲染佔位符卡片
   */
  renderPlaceholderCard(categoryId, group) {
    return `
      <div class="group-card group-card--placeholder" 
           data-category="${categoryId}"
           style="height: ${this.virtualScrollState.itemHeight}px;">
        <div class="group-card__placeholder">
          <span>${group.category.icon}</span>
          <span>${group.category.name}</span>
          <span class="loading-dots">載入中...</span>
        </div>
      </div>
    `;
  }

  /**
   * 設置虛擬捲動監聽器
   */
  setupVirtualScrolling(container) {
    if (!this.options.virtualScrolling) return;

    // 移除舊的監聽器
    if (this.scrollListener) {
      container.removeEventListener('scroll', this.scrollListener);
    }

    // 添加新的監聽器
    this.scrollListener = this.throttle(() => {
      this.updateVisibleRange(container);
    }, 16); // 60fps

    container.addEventListener('scroll', this.scrollListener);
  }

  /**
   * 更新可見範圍
   */
  updateVisibleRange(container) {
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemHeight = this.virtualScrollState.itemHeight;

    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);

    this.virtualScrollState.visibleRange = { start, end };
    this.virtualScrollState.scrollTop = scrollTop;
  }

  /**
   * 節流函數
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  /**
   * 渲染單個分組卡片
   * @param {string} categoryId - 類別 ID
   * @param {Object} group - 分組資料
   * @returns {string} HTML 字串
   */
  renderGroupCard(categoryId, group) {
    const { category, observations, summary } = group;
    const isCollapsible = this.options.collapsible && observations.length > 0;
    const isEmpty = observations.length === 0;
    const groupStatus = this.getGroupStatus(summary);
    
    let html = `
      <div class="group-card group-card--${categoryId} ${isCollapsible ? 'group-card--collapsible' : ''}" 
           data-category="${categoryId}">
        <div class="group-card__header">
          <div class="group-card__title">
            <span class="group-card__icon">${category.icon}</span>
            <span>${category.name}</span>
            <div class="group-card__indicators">
              <span class="group-card__count" title="觀察值數量">${summary.count}</span>
              ${summary.hasAbnormal ? '<span class="group-card__alert" title="有異常值">⚠️</span>' : ''}
              ${groupStatus === 'recent' ? `<span class="group-card__recent" title="7天內有新資料">🆕</span>` : ''}
            </div>
          </div>
          <div class="group-card__actions">
            <span class="group-card__status-badge group-card__status-badge--${groupStatus}">${this.getGroupStatusText(summary)}</span>
            ${isCollapsible ? '<button class="group-card__toggle" title="展開/摺疊">▼</button>' : ''}
          </div>
        </div>
        <div class="group-card__body ${isEmpty ? 'group-card__body--empty' : ''}">
    `;

    if (isEmpty) {
      html += '<p>此類別目前沒有觀察值資料</p>';
    } else {
      // 分組摘要
      if (summary.latestDate || summary.hasAbnormal) {
        html += '<div class="group-summary">';
        
        if (summary.latestDate) {
          html += `
            <div class="group-summary__item">
              <span class="group-summary__icon">📅</span>
              <span>最新：</span>
              <span class="group-summary__value">${this.formatDate(summary.latestDate)}</span>
            </div>
          `;
        }

        if (summary.hasAbnormal) {
          html += `
            <div class="group-summary__item group-summary__item--abnormal">
              <span class="group-summary__icon">⚠️</span>
              <span>有異常值</span>
            </div>
          `;
        }

        html += '</div>';
      }

      // 觀察值列表
      html += '<div class="observation-list">';
      observations.forEach(observation => {
        html += this.renderObservationItem(observation);
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  /**
   * 獲取群組狀態
   * @param {Object} summary - 群組摘要
   * @returns {string} 狀態類別
   */
  getGroupStatus(summary) {
    if (summary.count === 0) return 'empty';
    if (summary.hasAbnormal) return 'warning';
    
    // 檢查資料新鮮度（7天內為新）
    if (summary.latestDate) {
      const daysSinceUpdate = (Date.now() - summary.latestDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate <= 7) return 'recent';
      if (daysSinceUpdate <= 30) return 'normal';
      return 'old';
    }
    
    return 'normal';
  }

  /**
   * 獲取群組狀態文字
   * @param {Object} summary - 群組摘要
   * @returns {string} 狀態文字
   */
  getGroupStatusText(summary) {
    const status = this.getGroupStatus(summary);
    switch (status) {
      case 'empty': return '無資料';
      case 'warning': return '有異常';
      case 'recent': return '最新';
      case 'old': return '過期';
      case 'normal':
      default: return '正常';
    }
  }

  /**
   * 渲染單個觀察值項目
   * @param {Object} observation - 觀察值
   * @returns {string} HTML 字串
   */
  renderObservationItem(observation) {
    const name = this.getObservationName(observation);
    const value = this.getObservationValue(observation);
    const code = this.getObservationCode(observation);
    const date = this.getObservationDate(observation);
    const status = this.getObservationStatus(observation);

    return `
      <div class="observation-item" data-observation-id="${observation.id || ''}">
        <div class="observation-item__info">
          <div class="observation-item__name">${name}</div>
          <div class="observation-item__meta">
            ${code ? `<span class="observation-item__code">${code}</span>` : ''}
            ${date ? `<span class="observation-item__date">${date}</span>` : ''}
          </div>
        </div>
        <div class="observation-item__value">
          <span class="observation-item__status observation-item__status--${status}"></span>
          <span>${value || '無資料'}</span>
        </div>
      </div>
    `;
  }

  /**
   * 處理搜尋
   * @param {Event} e - 輸入事件
   */
  /**
   * 處理搜尋輸入（帶防抖和快取）
   */
  handleSearch(e) {
    const searchTerm = e.target.value.trim();
    
    // 清除之前的防抖計時器
    if (this.debounceTimers.has('search')) {
      clearTimeout(this.debounceTimers.get('search'));
    }
    
    // 顯示/隱藏清除按鈕
    const clearButton = this.container.querySelector('#obs-search-clear');
    if (clearButton) {
      clearButton.style.display = searchTerm ? 'block' : 'none';
    }
    
    // 設置防抖延遲執行搜尋
    const debounceTimer = setTimeout(() => {
      this.performSearch(searchTerm);
    }, this.options.debounceDelay);
    
    this.debounceTimers.set('search', debounceTimer);
  }

  /**
   * 執行搜尋（帶快取）
   */
  performSearch(searchTerm) {
    const startTime = performance.now();
    
    this.currentFilters.search = searchTerm;
    
    // 檢查搜尋快取
    const cacheKey = `search_${searchTerm}_${this.currentFilters.category || 'all'}`;
    if (this.options.cacheEnabled && this.searchCache.has(cacheKey)) {
      console.log(`搜尋快取命中: ${cacheKey}`);
      const cachedResult = this.searchCache.get(cacheKey);
      this.renderGroupsFromCache(cachedResult);
      
      this.performanceMetrics.searchTime = performance.now() - startTime;
      return;
    }
    
    // 執行搜尋並快取結果
    if (this.dataGrouper && this.dataGrouper.groupedData.size > 0) {
      const filteredData = this.applyFilters(this.dataGrouper.groupedData);
      
      // 快取搜尋結果
      if (this.options.cacheEnabled) {
        this.searchCache.set(cacheKey, filteredData);
        
        // 限制快取大小
        if (this.searchCache.size > 50) {
          const firstKey = this.searchCache.keys().next().value;
          this.searchCache.delete(firstKey);
        }
      }
      
      this.renderGroupsOptimized(filteredData);
    }
    
    this.performanceMetrics.searchTime = performance.now() - startTime;
    console.log(`搜尋完成: ${this.performanceMetrics.searchTime.toFixed(2)}ms`);
  }

  /**
   * 清除搜尋
   */
  clearSearch() {
    const searchInput = this.container.querySelector('#obs-search-input');
    const clearButton = this.container.querySelector('#obs-search-clear');
    
    if (searchInput) searchInput.value = '';
    if (clearButton) clearButton.style.display = 'none';
    
    this.currentFilters.search = '';
    
    // 清除搜尋快取
    this.searchCache.clear();
    
    if (this.dataGrouper && this.dataGrouper.groupedData.size > 0) {
      this.renderGroupsOptimized(this.dataGrouper.groupedData);
    }
  }

  /**
   * 按類別過濾
   * @param {string} categoryId - 類別 ID（空字串表示顯示全部）
   */
  filterByCategory(categoryId) {
    this.currentFilters.category = categoryId || null;
    
    // 更新過濾器按鈕狀態
    this.container.querySelectorAll('.filter-button').forEach(btn => {
      const btnCategory = btn.dataset.category;
      btn.classList.toggle('filter-button--active', btnCategory === (categoryId || ''));
    });

    // 重新渲染
    if (this.dataGrouper && this.dataGrouper.groupedData.size > 0) {
      this.renderGroups(this.dataGrouper.groupedData);
    }
  }

  /**
   * 切換分組展開/摺疊狀態
   * @param {Element} groupCard - 分組卡片元素
   */
  toggleGroup(groupCard) {
    if (!groupCard || !this.options.collapsible) return;
    
    const categoryId = groupCard.dataset.category;
    const isCurrentlyCollapsed = groupCard.classList.contains('group-card--collapsed');
    
    groupCard.classList.toggle('group-card--collapsed');
    
    const toggleBtn = groupCard.querySelector('.group-card__toggle');
    if (toggleBtn) {
      const newCollapsedState = groupCard.classList.contains('group-card--collapsed');
      toggleBtn.textContent = newCollapsedState ? '▶' : '▼';
      toggleBtn.title = newCollapsedState ? '展開' : '摺疊';
    }
    
    // 更新用戶偏好
    if (this.userPreferences) {
      if (groupCard.classList.contains('group-card--collapsed')) {
        this.userPreferences.collapsedGroups.add(categoryId);
      } else {
        this.userPreferences.collapsedGroups.delete(categoryId);
      }
      this.saveUserPreferences();
    }
    
    // 添加視覺反饋
    groupCard.style.transition = 'all 0.3s ease';
  }

  /**
   * 應用已儲存的摺疊狀態到群組卡片
   */
  applyCollapsedStates() {
    if (!this.userPreferences) return;
    
    const groupCards = this.container.querySelectorAll('.group-card');
    groupCards.forEach(groupCard => {
      const categoryId = groupCard.dataset.category;
      const shouldBeCollapsed = this.userPreferences.collapsedGroups.has(categoryId) || 
                               this.userPreferences.defaultCollapsed;
      
      if (shouldBeCollapsed && !groupCard.classList.contains('group-card--collapsed')) {
        groupCard.classList.add('group-card--collapsed');
        
        const toggleBtn = groupCard.querySelector('.group-card__toggle');
        if (toggleBtn) {
          toggleBtn.textContent = '▶';
          toggleBtn.title = '展開';
        }
      }
    });
  }

  /**
   * 應用當前過濾器
   * @param {Map} groupedData - 原始分組資料
   * @returns {Map} 過濾後的資料
   */
  applyFilters(groupedData) {
    const filtered = new Map();

    groupedData.forEach((group, categoryId) => {
      // 類別過濾
      if (this.currentFilters.category && this.currentFilters.category !== categoryId) {
        return;
      }

      // 搜尋過濾
      let observations = group.observations;
      if (this.currentFilters.search) {
        observations = observations.filter(obs => 
          this.matchesSearch(obs, this.currentFilters.search)
        );
      }

      // 建立過濾後的分組
      const filteredGroup = {
        category: group.category,
        observations,
        summary: {
          ...group.summary,
          count: observations.length
        }
      };

      filtered.set(categoryId, filteredGroup);
    });

    return filtered;
  }

  /**
   * 檢查觀察值是否符合搜尋條件
   * @param {Object} observation - 觀察值
   * @param {string} searchTerm - 搜尋詞
   * @returns {boolean} 是否符合
   */
  matchesSearch(observation, searchTerm) {
    const term = searchTerm.toLowerCase();
    const searchFields = [
      this.getObservationName(observation),
      this.getObservationValue(observation),
      this.getObservationCode(observation)
    ].join(' ').toLowerCase();

    return searchFields.includes(term);
  }

  // 工具方法
  getObservationName(observation) {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      return observation.code.coding[0].display || observation.code.coding[0].code || '未知觀察值';
    }
    return '未知觀察值';
  }

  getObservationValue(observation) {
    if (observation.valueQuantity) {
      const value = observation.valueQuantity.value || '';
      const unit = observation.valueQuantity.unit || '';
      return `${value} ${unit}`.trim();
    }
    
    if (observation.valueString) return observation.valueString;
    if (observation.valueCodeableConcept && observation.valueCodeableConcept.coding) {
      return observation.valueCodeableConcept.coding[0]?.display || '';
    }
    
    return '';
  }

  getObservationCode(observation) {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      return observation.code.coding[0].code || '';
    }
    return '';
  }

  getObservationDate(observation) {
    if (observation.effectiveDateTime) {
      return this.formatDate(new Date(observation.effectiveDateTime));
    }
    return '';
  }

  getObservationStatus(observation) {
    if (observation.interpretation) {
      const hasAbnormal = observation.interpretation.some(interp => 
        interp.coding && interp.coding.some(coding => 
          ['H', 'L', 'A', 'AA', 'HH', 'LL'].includes(coding.code)
        )
      );
      if (hasAbnormal) return 'abnormal';
    }
    return 'normal';
  }

  formatDate(date) {
    if (!date) return '';
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getTotalCount(groupedData) {
    let total = 0;
    groupedData.forEach(group => {
      total += group.summary.count;
    });
    return total;
  }

  /**
   * 顯示錯誤或載入狀態
   * @param {string} message - 錯誤訊息
   */
  showError(message) {
    const groupsContainer = this.container.querySelector('#observation-groups');
    const emptyState = this.container.querySelector('#empty-state');
    
    if (groupsContainer) {
      groupsContainer.style.display = 'none';
    }
    
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="empty-state__icon">⏳</div>
        <div class="empty-state__title">載入中</div>
        <div class="empty-state__message">${message}</div>
      `;
    }
  }

  /**
   * 銷毀組件
   */
  destroy() {
    // 移除事件監聽器
    if (this.scrollListener) {
      const groupsContainer = this.container.querySelector('#observation-groups');
      if (groupsContainer) {
        groupsContainer.removeEventListener('scroll', this.scrollListener);
      }
    }
    
    // 清除計時器
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // 清除快取
    this.cache.clear();
    this.searchCache.clear();
    
    // 清除DOM
    this.container.innerHTML = '';
    
    // 清除引用
    this.dataGrouper = null;
    this.searchEngine = null;
  }

  /**
   * 顯示性能監控器
   */
  showPerformanceMonitor() {
    // 移除現有的監控器
    const existing = document.querySelector('.performance-monitor');
    if (existing) existing.remove();

    const monitor = document.createElement('div');
    monitor.className = 'performance-monitor';
    monitor.innerHTML = `
      <div class="performance-monitor__item">
        <span>渲染時間:</span>
        <span class="performance-monitor__value">${this.performanceMetrics.renderTime.toFixed(1)}ms</span>
      </div>
      <div class="performance-monitor__item">
        <span>搜尋時間:</span>
        <span class="performance-monitor__value">${this.performanceMetrics.searchTime.toFixed(1)}ms</span>
      </div>
      <div class="performance-monitor__item">
        <span>快取項目:</span>
        <span class="performance-monitor__value">${this.cache.size}</span>
      </div>
      <div class="performance-monitor__item">
        <span>搜尋快取:</span>
        <span class="performance-monitor__value">${this.searchCache.size}</span>
      </div>
    `;

    document.body.appendChild(monitor);

    // 5秒後自動隱藏
    setTimeout(() => {
      if (monitor.parentNode) {
        monitor.remove();
      }
    }, 5000);
  }

  /**
   * 清除所有快取
   */
  clearAllCaches() {
    this.cache.clear();
    this.searchCache.clear();
    console.log('所有快取已清除');
  }

  /**
   * 設置性能監控快捷鍵
   */
  setupPerformanceShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+P 顯示性能監控
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.showPerformanceMonitor();
      }
      
      // Ctrl+Shift+C 清除快取
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.clearAllCaches();
        this.showUpdateNotification();
      }
    });
  }

  // 增強的錯誤處理
  handleError(error, context = '') {
    console.error(`ObservationGroupManager Error${context ? ` in ${context}` : ''}:`, error);
    
    // 建立錯誤訊息容器
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.setAttribute('role', 'alert');
    errorContainer.setAttribute('aria-live', 'assertive');
    
    const title = document.createElement('div');
    title.className = 'error-container__title';
    title.textContent = '發生錯誤';
    
    const message = document.createElement('div');
    message.className = 'error-container__message';
    message.textContent = this.getErrorMessage(error, context);
    
    const actions = document.createElement('div');
    actions.className = 'error-container__actions';
    
    const retryButton = document.createElement('button');
    retryButton.className = 'error-container__button';
    retryButton.textContent = '重試';
    retryButton.onclick = () => {
      document.body.removeChild(errorContainer);
      this.init();
    };
    
    const dismissButton = document.createElement('button');
    dismissButton.className = 'error-container__button';
    dismissButton.textContent = '關閉';
    dismissButton.onclick = () => {
      document.body.removeChild(errorContainer);
    };
    
    actions.appendChild(retryButton);
    actions.appendChild(dismissButton);
    
    errorContainer.appendChild(title);
    errorContainer.appendChild(message);
    errorContainer.appendChild(actions);
    
    document.body.appendChild(errorContainer);
    
    // 5秒後自動移除
    setTimeout(() => {
      if (document.body.contains(errorContainer)) {
        document.body.removeChild(errorContainer);
      }
    }, 5000);
  }

  getErrorMessage(error, context) {
    if (context === 'data-loading') {
      return '無法載入醫療數據，請檢查網路連接或稍後再試。';
    } else if (context === 'rendering') {
      return '介面顯示出現問題，正在嘗試恢復。';
    } else if (error.message?.includes('fetch')) {
      return '網路連接問題，請檢查您的網路設定。';
    } else {
      return '系統發生未預期的錯誤，請重試或聯絡技術支援。';
    }
  }

  // 載入狀態管理
  showLoading(text = '載入中...') {
    // 移除既有的載入畫面
    this.hideLoading();
    
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-live', 'polite');
    loading.id = 'loading-screen';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading__spinner';
    spinner.setAttribute('aria-hidden', 'true');
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading__text';
    loadingText.textContent = text;
    
    const progress = document.createElement('div');
    progress.className = 'loading__progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', '載入進度');
    
    const progressBar = document.createElement('div');
    progressBar.className = 'loading__progress-bar';
    progress.appendChild(progressBar);
    
    loading.appendChild(spinner);
    loading.appendChild(loadingText);
    loading.appendChild(progress);
    
    document.body.appendChild(loading);
  }

  hideLoading() {
    const existing = document.getElementById('loading-screen');
    if (existing) {
      document.body.removeChild(existing);
    }
  }

  // 鍵盤導航支援
  initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.shiftKey) {
        switch (e.key) {
          case 'S':
            e.preventDefault();
            const searchInput = document.querySelector('.search-box__input');
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'F':
            e.preventDefault();
            const firstFilter = document.querySelector('.filter-toggle');
            if (firstFilter) {
              firstFilter.focus();
            }
            break;
          case 'R':
            e.preventDefault();
            this.init();
            break;
          case 'P':
            e.preventDefault();
            this.togglePerformanceMonitor();
            break;
        }
      }
    });
  }

  // 連接狀態監控
  initConnectionMonitor() {
    const createStatusIndicator = () => {
      const status = document.createElement('div');
      status.className = 'connection-status';
      status.id = 'connection-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      
      const indicator = document.createElement('div');
      indicator.className = 'connection-status__indicator';
      indicator.setAttribute('aria-hidden', 'true');
      
      const text = document.createElement('span');
      text.textContent = navigator.onLine ? '已連線' : '離線';
      
      status.appendChild(indicator);
      status.appendChild(text);
      
      return status;
    };

    // 建立狀態指示器
    const statusIndicator = createStatusIndicator();
    document.body.appendChild(statusIndicator);

    // 監聽連接狀態變化
    window.addEventListener('online', () => {
      const status = document.getElementById('connection-status');
      if (status) {
        status.className = 'connection-status';
        status.querySelector('span').textContent = '已連線';
      }
    });

    window.addEventListener('offline', () => {
      const status = document.getElementById('connection-status');
      if (status) {
        status.className = 'connection-status connection-status--offline';
        status.querySelector('span').textContent = '離線';
      }
    });
  }
}

/* ===========================================
   匯出模組
   =========================================== */

// 將所有類別添加到全域範圍
window.AppState = AppState;
window.PatientDisplayManager = PatientDisplayManager;
window.ObservationDisplayManager = ObservationDisplayManager;
window.ObservationGroupManager = ObservationGroupManager;
window.LoadingStateManager = LoadingStateManager;
window.ErrorDisplayManager = ErrorDisplayManager;
window.appState = appState;

/* ===========================================
   全域錯誤邊界處理系統
   =========================================== */

/**
 * 全域錯誤邊界處理器
 * 捕獲未處理的錯誤並提供用戶友好的回應
 */
class GlobalErrorBoundary {
  constructor() {
    this.errors = new Map(); // 錯誤記錄
    this.retryAttempts = new Map(); // 重試次數記錄
    this.maxRetries = 3; // 最大重試次數
    this.errorQueue = []; // 錯誤佇列
    this.isProcessingQueue = false; // 是否正在處理佇列
    
    this.init();
  }

  /**
   * 初始化全域錯誤處理
   */
  init() {
    // 捕獲同步 JavaScript 錯誤
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 捕獲 Promise 拒絕錯誤
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        reason: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 捕獲資源載入錯誤
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: 'resource',
          message: `Failed to load resource: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          url: event.target.src || event.target.href,
          timestamp: new Date().toISOString()
        });
      }
    }, true);

    // 網路連接錯誤監控
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NETWORK_ERROR') {
          this.handleNetworkError(event.data);
        }
      });
    }

    // 設置全域錯誤報告函數
    window.reportError = (error, context) => {
      this.handleError({
        type: 'manual',
        message: error.message || error,
        context,
        error,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
    };

    console.log('✅ Global Error Boundary initialized');
  }

  /**
   * 處理錯誤
   * @param {Object} errorInfo 錯誤資訊
   */
  handleError(errorInfo) {
    // 生成錯誤 ID
    const errorId = this.generateErrorId(errorInfo);
    
    // 檢查是否是重複錯誤
    if (this.errors.has(errorId)) {
      const existingError = this.errors.get(errorId);
      existingError.count++;
      existingError.lastOccurrence = errorInfo.timestamp;
      return; // 避免重複顯示相同錯誤
    }

    // 記錄錯誤
    this.errors.set(errorId, {
      ...errorInfo,
      id: errorId,
      count: 1,
      firstOccurrence: errorInfo.timestamp,
      lastOccurrence: errorInfo.timestamp
    });

    // 將錯誤加入處理佇列
    this.errorQueue.push(errorInfo);
    
    // 處理錯誤佇列
    if (!this.isProcessingQueue) {
      this.processErrorQueue();
    }

    // 記錄到控制台
    console.error(`[GlobalErrorBoundary] ${errorInfo.type}:`, errorInfo);
  }

  /**
   * 處理錯誤佇列
   */
  async processErrorQueue() {
    this.isProcessingQueue = true;

    while (this.errorQueue.length > 0) {
      const errorInfo = this.errorQueue.shift();
      
      try {
        await this.displayError(errorInfo);
        
        // 等待一段時間再處理下一個錯誤，避免錯誤訊息重疊
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (displayError) {
        console.error('Error displaying error message:', displayError);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * 顯示錯誤訊息
   * @param {Object} errorInfo 錯誤資訊
   */
  async displayError(errorInfo) {
    // 根據錯誤類型決定顯示方式
    switch (errorInfo.type) {
      case 'javascript':
        this.showJavaScriptError(errorInfo);
        break;
      case 'promise_rejection':
        this.showPromiseRejectionError(errorInfo);
        break;
      case 'resource':
        this.showResourceError(errorInfo);
        break;
      case 'network':
        this.showNetworkError(errorInfo);
        break;
      case 'manual':
        this.showManualError(errorInfo);
        break;
      default:
        this.showGenericError(errorInfo);
    }
  }

  /**
   * 顯示 JavaScript 錯誤
   */
  showJavaScriptError(errorInfo) {
    this.createErrorNotification({
      title: 'JavaScript 錯誤',
      message: this.getSafeErrorMessage(errorInfo.message),
      type: 'error',
      actions: this.getDefaultActions(errorInfo),
      details: errorInfo.stack ? this.formatStackTrace(errorInfo.stack) : null
    });
  }

  /**
   * 顯示 Promise 拒絕錯誤
   */
  showPromiseRejectionError(errorInfo) {
    this.createErrorNotification({
      title: '非同步操作失敗',
      message: '資料載入過程中發生錯誤，請稍後再試',
      type: 'warning',
      actions: this.getDefaultActions(errorInfo),
      details: errorInfo.stack ? this.formatStackTrace(errorInfo.stack) : null
    });
  }

  /**
   * 顯示資源載入錯誤
   */
  showResourceError(errorInfo) {
    this.createErrorNotification({
      title: '資源載入失敗',
      message: `無法載入 ${errorInfo.element}: ${this.getResourceName(errorInfo.url)}`,
      type: 'warning',
      actions: [{
        text: '重新載入頁面',
        action: () => window.location.reload(),
        style: 'primary'
      }]
    });
  }

  /**
   * 顯示網路錯誤
   */
  showNetworkError(errorInfo) {
    this.createErrorNotification({
      title: '網路連線問題',
      message: '無法連接到伺服器，請檢查網路連線',
      type: 'error',
      persistent: true,
      actions: [
        {
          text: '重試',
          action: () => this.retryNetworkOperation(errorInfo),
          style: 'primary'
        },
        {
          text: '離線模式',
          action: () => this.enableOfflineMode(),
          style: 'secondary'
        }
      ]
    });
  }

  /**
   * 顯示手動報告的錯誤
   */
  showManualError(errorInfo) {
    this.createErrorNotification({
      title: errorInfo.context || '操作失敗',
      message: this.getSafeErrorMessage(errorInfo.message),
      type: 'error',
      actions: this.getDefaultActions(errorInfo)
    });
  }

  /**
   * 顯示通用錯誤
   */
  showGenericError(errorInfo) {
    this.createErrorNotification({
      title: '未知錯誤',
      message: '發生了未預期的錯誤，請嘗試重新載入頁面',
      type: 'error',
      actions: this.getDefaultActions(errorInfo)
    });
  }

  /**
   * 建立錯誤通知
   */
  createErrorNotification({ title, message, type, actions, details, persistent = false }) {
    // 檢查是否已有錯誤通知容器
    let container = document.getElementById('error-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'error-notifications';
      container.className = 'error-notifications';
      container.setAttribute('aria-live', 'assertive');
      container.setAttribute('role', 'alert');
      document.body.appendChild(container);
    }

    // 建立錯誤通知元素
    const notification = document.createElement('div');
    notification.className = `error-notification error-notification--${type}`;
    
    const notificationHTML = `
      <div class="error-notification__content">
        <div class="error-notification__header">
          <h3 class="error-notification__title">${title}</h3>
          ${!persistent ? '<button class="error-notification__close" aria-label="關閉錯誤訊息">&times;</button>' : ''}
        </div>
        <div class="error-notification__message">${message}</div>
        ${details ? `
          <details class="error-notification__details">
            <summary>技術詳情</summary>
            <pre class="error-notification__stack">${details}</pre>
          </details>
        ` : ''}
        ${actions && actions.length > 0 ? `
          <div class="error-notification__actions">
            ${actions.map(action => `
              <button class="btn btn--${action.style || 'secondary'}" data-action="${action.text}">
                ${action.text}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    notification.innerHTML = notificationHTML;

    // 綁定事件
    if (!persistent) {
      const closeBtn = notification.querySelector('.error-notification__close');
      closeBtn?.addEventListener('click', () => {
        this.removeNotification(notification);
      });
    }

    // 綁定動作按鈕
    actions?.forEach(action => {
      const btn = notification.querySelector(`[data-action="${action.text}"]`);
      btn?.addEventListener('click', () => {
        action.action();
        if (!persistent) {
          this.removeNotification(notification);
        }
      });
    });

    // 添加到容器
    container.appendChild(notification);

    // 自動移除（非持久性錯誤）
    if (!persistent) {
      setTimeout(() => {
        if (notification.parentNode) {
          this.removeNotification(notification);
        }
      }, 10000); // 10秒後自動移除
    }

    // 添加淡入動畫
    requestAnimationFrame(() => {
      notification.classList.add('error-notification--visible');
    });
  }

  /**
   * 移除錯誤通知
   */
  removeNotification(notification) {
    notification.classList.add('error-notification--removing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * 獲取預設動作
   */
  getDefaultActions(errorInfo) {
    return [
      {
        text: '重新載入',
        action: () => window.location.reload(),
        style: 'primary'
      },
      {
        text: '忽略',
        action: () => {},
        style: 'secondary'
      }
    ];
  }

  /**
   * 生成錯誤 ID
   */
  generateErrorId(errorInfo) {
    const key = `${errorInfo.type}_${errorInfo.message}_${errorInfo.filename || ''}_${errorInfo.lineno || ''}`;
    return btoa(key).slice(0, 16); // 使用 base64 編碼並截取前16字符
  }

  /**
   * 獲取安全的錯誤訊息
   */
  getSafeErrorMessage(message) {
    if (!message) return '發生了未知錯誤';
    
    // 過濾敏感資訊
    return message
      .replace(/https?:\/\/[^\s]+/g, '[URL]') // 移除 URL
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // 移除郵箱
      .slice(0, 200); // 限制長度
  }

  /**
   * 格式化堆疊追蹤
   */
  formatStackTrace(stack) {
    if (!stack) return '';
    
    return stack
      .split('\n')
      .slice(0, 10) // 只顯示前10行
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');
  }

  /**
   * 獲取資源名稱
   */
  getResourceName(url) {
    if (!url) return 'Unknown Resource';
    
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname.split('/').pop() || urlObj.pathname;
    } catch {
      return url.split('/').pop() || url;
    }
  }

  /**
   * 重試網路操作
   */
  async retryNetworkOperation(errorInfo) {
    // 實作網路重試邏輯
    try {
      // 這裡可以根據具體的應用需求實作重試邏輯
      window.location.reload();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }

  /**
   * 啟用離線模式
   */
  enableOfflineMode() {
    // 實作離線模式
    console.log('Offline mode enabled');
    
    // 顯示離線狀態
    const offlineBar = document.createElement('div');
    offlineBar.className = 'offline-bar';
    offlineBar.innerHTML = `
      <div class="offline-bar__content">
        <span class="offline-bar__icon">📱</span>
        <span class="offline-bar__text">離線模式：某些功能可能無法使用</span>
      </div>
    `;
    document.body.insertBefore(offlineBar, document.body.firstChild);
  }

  /**
   * 獲取錯誤統計
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errors.size,
      errorTypes: {},
      recentErrors: []
    };

    for (const [id, error] of this.errors) {
      // 統計錯誤類型
      if (!stats.errorTypes[error.type]) {
        stats.errorTypes[error.type] = 0;
      }
      stats.errorTypes[error.type] += error.count;

      // 收集最近的錯誤
      stats.recentErrors.push({
        id,
        type: error.type,
        message: error.message,
        count: error.count,
        lastOccurrence: error.lastOccurrence
      });
    }

    // 按最後發生時間排序
    stats.recentErrors.sort((a, b) => 
      new Date(b.lastOccurrence) - new Date(a.lastOccurrence)
    );

    return stats;
  }

  /**
   * 清除錯誤記錄
   */
  clearErrorHistory() {
    this.errors.clear();
    this.retryAttempts.clear();
    this.errorQueue.length = 0;
    
    // 移除所有錯誤通知
    const container = document.getElementById('error-notifications');
    if (container) {
      container.innerHTML = '';
    }
  }
}

// 初始化全域錯誤邊界
const globalErrorBoundary = new GlobalErrorBoundary();

// 將錯誤邊界添加到全域範圍
window.GlobalErrorBoundary = GlobalErrorBoundary;
window.globalErrorBoundary = globalErrorBoundary;