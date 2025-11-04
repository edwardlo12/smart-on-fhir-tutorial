/**
 * Data Visualization - 資料視覺化與分組邏輯
 * 
 * 此檔案包含：
 * - 觀察值資料分類和分組邏輯
 * - 醫療資料的語義化組織
 * - 資料篩選和搜尋功能
 * - 時間順序和優先順序排序
 */

/* ===========================================
   資料分組類別定義
   =========================================== */

/**
 * 觀察值類別配置
 * 基於 FHIR 觀察值類別和 LOINC 編碼系統
 */
const OBSERVATION_CATEGORIES = {
  'vital-signs': {
    id: 'vital-signs',
    name: '生命徵象',
    icon: '💓',
    color: 'var(--color-vital)',
    priority: 1,
    codes: [
      '8302-2',  // 身高
      '29463-7', // 體重
      '39156-5', // BMI
      '8480-6',  // 收縮壓
      '8462-4',  // 舒張壓
      '55284-4', // 血壓
      '8867-4',  // 心率
      '9279-1',  // 呼吸率
      '8310-5',  // 體溫
      '85354-9', // 血壓（收縮壓/舒張壓）
      '35200-5', // 膽固醇比例
      '8478-0'   // 平均動脈壓
    ]
  },
  'laboratory': {
    id: 'laboratory',
    name: '實驗室檢查',
    icon: '🧪',
    color: 'var(--color-lab)',
    priority: 2,
    codes: [
      '2085-9',  // HDL 膽固醇
      '2089-1',  // LDL 膽固醇
      '14647-2', // 膽固醇總量
      '17861-6', // 鈣
      '6768-6',  // 鹼性磷酸酶
      '1975-2',  // 膽紅素
      '33747-0', // 血紅蛋白 A1c
      '2339-0',  // 葡萄糖
      '718-7',   // 血紅蛋白
      '4548-4',  // 血紅蛋白 A1c（百分比）
      '17856-6', // 血紅蛋白 A1c（mmol/mol）
      '2093-3',  // 膽固醇總量/HDL 比例
      '9830-1',  // 膽固醇非 HDL
      '2571-8',  // 三酸甘油脂
      '6690-2',  // 白血球計數
      '789-8',   // 紅血球計數
      '777-3',   // 血小板計數
      '4544-3',  // 血球容積比
      '20570-8', // 血紅蛋白濃度
      '786-4',   // 平均紅血球容積
      '787-2',   // 平均紅血球血紅蛋白含量
      '785-6'    // 平均紅血球血紅蛋白濃度
    ]
  },
  'imaging': {
    id: 'imaging',
    name: '影像檢查',
    icon: '📷',
    color: 'var(--color-imaging)',
    priority: 3,
    codes: [
      '24627-2', // 胸部 X 光
      '30954-2', // CT 掃描
      '24655-3', // MRI 檢查
      '69910-1', // 超音波檢查
      '42274-1'  // 心臟超音波
    ]
  },
  'social-history': {
    id: 'social-history',
    name: '社會史',
    icon: '👥',
    color: 'var(--color-social)',
    priority: 4,
    codes: [
      '72166-2', // 抽菸狀況
      '11331-6', // 職業史
      '76689-9', // 性行為史
      '72133-2', // 飲酒狀況
      '89247-1', // 物質使用史
      '87510-4', // 個人醫療史
      '10157-6', // 家族病史
      '29762-2', // 社會史
      '67504-6'  // 生活方式
    ]
  },
  'survey': {
    id: 'survey',
    name: '問卷調查',
    icon: '📋',
    color: 'var(--color-survey)',
    priority: 5,
    codes: [
      '72133-2', // 問卷回應
      '67504-6', // 健康問卷
      '72166-2', // 篩檢問卷
      '89247-1', // 評估量表
      '44261-6'  // 患者報告結果
    ]
  },
  'clinical-findings': {
    id: 'clinical-findings',
    name: '臨床發現',
    icon: '🏥',
    color: 'var(--color-clinical)',
    priority: 6,
    codes: [
      '8716-3',  // 生命徵象面板
      '33747-0', // 糖化血色素
      '2947-0',  // 鈉
      '2823-3',  // 鉀
      '2075-0',  // 氯
      '3094-0',  // 尿素氮
      '2160-0',  // 肌酸酐
      '45066-8', // 腎絲球過濾率
      '1742-6',  // 丙氨酸轉氨酶
      '1920-8',  // 天門冬氨酸轉氨酶
      '1975-2'   // 膽紅素
    ]
  },
  'other': {
    id: 'other',
    name: '其他',
    icon: '📄',
    color: 'var(--color-secondary)',
    priority: 99,
    codes: []
  }
};

/* ===========================================
   資料分組管理器
   =========================================== */

/**
 * 觀察值資料分組管理器
 */
class ObservationDataGrouper {
  constructor() {
    this.categories = OBSERVATION_CATEGORIES;
    this.groupedData = new Map();
    this.filters = {
      category: null,
      dateRange: null,
      searchTerm: '',
      showEmpty: true
    };
  }

  /**
   * 將觀察值陣列分組到類別中
   * @param {Array} observations - FHIR 觀察值陣列
   * @returns {Map} 按類別分組的觀察值
   */
  groupObservations(observations) {
    this.groupedData.clear();
    
    // 初始化所有類別
    Object.keys(this.categories).forEach(categoryId => {
      this.groupedData.set(categoryId, {
        category: this.categories[categoryId],
        observations: [],
        summary: {
          count: 0,
          latestDate: null,
          hasAbnormal: false
        }
      });
    });

    // 將觀察值分配到適當的類別
    observations.forEach(observation => {
      const categoryId = this.categorizeObservation(observation);
      const group = this.groupedData.get(categoryId);
      
      if (group) {
        group.observations.push(observation);
        this.updateGroupSummary(group, observation);
      }
    });

    // 排序每個群組內的觀察值
    this.groupedData.forEach(group => {
      group.observations.sort(this.sortObservations.bind(this));
    });

    return this.groupedData;
  }

  /**
   * 根據觀察值確定其類別
   * @param {Object} observation - FHIR 觀察值
   * @returns {string} 類別 ID
   */
  categorizeObservation(observation) {
    if (!observation || !observation.code) {
      return 'other';
    }

    // 優先根據 FHIR category 分類
    if (observation.category && observation.category.length > 0) {
      const fhirCategory = observation.category[0];
      if (fhirCategory.coding && fhirCategory.coding.length > 0) {
        const categoryCode = fhirCategory.coding[0].code;
        if (this.categories[categoryCode]) {
          return categoryCode;
        }
      }
    }

    // 根據 LOINC 代碼分類
    const codes = this.extractObservationCodes(observation);
    for (const categoryId in this.categories) {
      const category = this.categories[categoryId];
      if (category.codes.some(code => codes.includes(code))) {
        return categoryId;
      }
    }

    return 'other';
  }

  /**
   * 從觀察值中提取所有相關代碼
   * @param {Object} observation - FHIR 觀察值
   * @returns {Array} 代碼陣列
   */
  extractObservationCodes(observation) {
    const codes = [];
    
    if (observation.code && observation.code.coding) {
      observation.code.coding.forEach(coding => {
        if (coding.code) {
          codes.push(coding.code);
        }
      });
    }

    return codes;
  }

  /**
   * 更新群組摘要統計
   * @param {Object} group - 群組物件
   * @param {Object} observation - 觀察值
   */
  updateGroupSummary(group, observation) {
    group.summary.count++;
    
    // 更新最新日期
    if (observation.effectiveDateTime) {
      const observationDate = new Date(observation.effectiveDateTime);
      if (!group.summary.latestDate || observationDate > group.summary.latestDate) {
        group.summary.latestDate = observationDate;
      }
    }

    // 檢查是否有異常值（基於 interpretation 欄位）
    if (observation.interpretation) {
      const hasAbnormal = observation.interpretation.some(interp => 
        interp.coding && interp.coding.some(coding => 
          ['H', 'L', 'A', 'AA', 'HH', 'LL'].includes(coding.code)
        )
      );
      if (hasAbnormal) {
        group.summary.hasAbnormal = true;
      }
    }
  }

  /**
   * 觀察值排序比較函數
   * @param {Object} a - 觀察值 A
   * @param {Object} b - 觀察值 B
   * @returns {number} 排序結果
   */
  sortObservations(a, b) {
    // 優先按日期排序（最新的在前）
    const dateA = a.effectiveDateTime ? new Date(a.effectiveDateTime) : new Date(0);
    const dateB = b.effectiveDateTime ? new Date(b.effectiveDateTime) : new Date(0);
    
    if (dateA !== dateB) {
      return dateB - dateA; // 降序
    }

    // 次要按代碼排序
    const codeA = this.getObservationDisplayCode(a);
    const codeB = this.getObservationDisplayCode(b);
    
    return codeA.localeCompare(codeB);
  }

  /**
   * 獲取觀察值的顯示代碼
   * @param {Object} observation - 觀察值
   * @returns {string} 顯示代碼
   */
  getObservationDisplayCode(observation) {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      return observation.code.coding[0].code || '';
    }
    return '';
  }

  /**
   * 獲取觀察值的顯示名稱
   * @param {Object} observation - 觀察值
   * @returns {string} 顯示名稱
   */
  getObservationDisplayName(observation) {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      return observation.code.coding[0].display || observation.code.coding[0].code || '未知觀察值';
    }
    return '未知觀察值';
  }

  /**
   * 獲取觀察值的數值和單位
   * @param {Object} observation - 觀察值
   * @returns {string} 格式化的數值
   */
  getObservationValue(observation) {
    if (observation.valueQuantity) {
      const value = observation.valueQuantity.value || '';
      const unit = observation.valueQuantity.unit || '';
      
      // 格式化數值到小數點後2位
      const formattedValue = typeof value === 'number' 
        ? value.toFixed(2)
        : (isNaN(parseFloat(value)) ? value : parseFloat(value).toFixed(2));
      
      return `${formattedValue} ${unit}`.trim();
    }
    
    if (observation.valueString) {
      return observation.valueString;
    }
    
    if (observation.valueCodeableConcept) {
      if (observation.valueCodeableConcept.coding && observation.valueCodeableConcept.coding.length > 0) {
        return observation.valueCodeableConcept.coding[0].display || '';
      }
    }
    
    return '';
  }

  /**
   * 清除所有過濾器
   */
  clearFilters() {
    this.filters = {
      category: null,
      dateRange: null,
      searchTerm: '',
      showEmpty: true
    };
  }

  /**
   * 獲取類別統計摘要
   * @returns {Object} 類別統計
   */
  getCategorySummary() {
    const summary = {};
    
    this.groupedData.forEach((group, categoryId) => {
      summary[categoryId] = {
        name: group.category.name,
        icon: group.category.icon,
        count: group.summary.count,
        hasAbnormal: group.summary.hasAbnormal,
        latestDate: group.summary.latestDate
      };
    });

    return summary;
  }
}

/* ===========================================
   搜尋和過濾工具
   =========================================== */

/**
 * 觀察值搜尋引擎
 */
class ObservationSearchEngine {
  constructor(dataGrouper) {
    this.dataGrouper = dataGrouper;
    this.searchHistory = [];
    this.maxHistoryLength = 10;
  }

  /**
   * 執行智慧搜尋
   * @param {string} query - 搜尋查詢
   * @returns {Array} 搜尋結果
   */
  smartSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return [];
    }

    // 記錄搜尋歷史
    this.addToSearchHistory(searchTerm);

    const results = [];
    
    this.dataGrouper.groupedData.forEach((group, categoryId) => {
      group.observations.forEach(observation => {
        const score = this.calculateRelevanceScore(observation, searchTerm);
        if (score > 0) {
          results.push({
            observation,
            category: group.category,
            relevanceScore: score,
            matchedFields: this.getMatchedFields(observation, searchTerm)
          });
        }
      });
    });

    // 按相關性排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.slice(0, 20); // 限制結果數量
  }

  /**
   * 計算觀察值與搜尋詞的相關性分數
   * @param {Object} observation - 觀察值
   * @param {string} searchTerm - 搜尋詞
   * @returns {number} 相關性分數 (0-100)
   */
  calculateRelevanceScore(observation, searchTerm) {
    let score = 0;
    
    const name = this.dataGrouper.getObservationDisplayName(observation).toLowerCase();
    const value = this.dataGrouper.getObservationValue(observation).toLowerCase();
    const code = this.dataGrouper.getObservationDisplayCode(observation).toLowerCase();

    // 完全匹配權重最高
    if (name === searchTerm) score += 100;
    if (code === searchTerm) score += 90;
    if (value === searchTerm) score += 80;

    // 開頭匹配
    if (name.startsWith(searchTerm)) score += 70;
    if (code.startsWith(searchTerm)) score += 60;
    if (value.startsWith(searchTerm)) score += 50;

    // 包含匹配
    if (name.includes(searchTerm)) score += 30;
    if (code.includes(searchTerm)) score += 20;
    if (value.includes(searchTerm)) score += 10;

    return Math.min(score, 100); // 最高分數限制
  }

  /**
   * 獲取匹配的欄位
   * @param {Object} observation - 觀察值
   * @param {string} searchTerm - 搜尋詞
   * @returns {Array} 匹配的欄位陣列
   */
  getMatchedFields(observation, searchTerm) {
    const matched = [];
    
    const name = this.dataGrouper.getObservationDisplayName(observation).toLowerCase();
    const value = this.dataGrouper.getObservationValue(observation).toLowerCase();
    const code = this.dataGrouper.getObservationDisplayCode(observation).toLowerCase();

    if (name.includes(searchTerm)) matched.push('name');
    if (value.includes(searchTerm)) matched.push('value');
    if (code.includes(searchTerm)) matched.push('code');

    return matched;
  }

  /**
   * 添加到搜尋歷史
   * @param {string} searchTerm - 搜尋詞
   */
  addToSearchHistory(searchTerm) {
    // 移除重複項
    this.searchHistory = this.searchHistory.filter(term => term !== searchTerm);
    
    // 添加到開頭
    this.searchHistory.unshift(searchTerm);
    
    // 限制歷史長度
    if (this.searchHistory.length > this.maxHistoryLength) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistoryLength);
    }
  }

  /**
   * 清除搜尋歷史
   */
  clearSearchHistory() {
    this.searchHistory = [];
  }
}

/* ===========================================
   全域匯出
   =========================================== */

// 將類別暴露到全域命名空間
if (typeof window !== 'undefined') {
  window.ObservationDataGrouper = ObservationDataGrouper;
  window.ObservationSearchEngine = ObservationSearchEngine;
  window.OBSERVATION_CATEGORIES = OBSERVATION_CATEGORIES;
  
  console.log('Data visualization components loaded successfully');
}

// 模組匯出（如果支援）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ObservationDataGrouper,
    ObservationSearchEngine,
    OBSERVATION_CATEGORIES
  };
}