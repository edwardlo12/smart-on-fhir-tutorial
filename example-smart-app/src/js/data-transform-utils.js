/**
 * Data Transformation Utils - 資料轉換工具函數
 * 
 * 此檔案包含：
 * - FHIR 資源轉換為 UI 顯示格式的工具函數
 * - 資料驗證和清理功能
 * - 計算和格式化功能
 * - 分組和排序邏輯
 */

/**
 * 資料轉換工具類別
 */
class DataTransformUtils {
  
  /**
   * 轉換 FHIR 患者資源為顯示格式
   * @param {Object} fhirPatient - FHIR 患者資源
   * @returns {Object} 轉換後的患者資料
   */
  static transformPatient(fhirPatient) {
    if (!fhirPatient) {
      return null;
    }

    // 提取姓名
    let firstName = '';
    let lastName = '';
    
    if (fhirPatient.name && fhirPatient.name.length > 0) {
      const name = fhirPatient.name[0];
      firstName = (name.given || []).join(' ');
      lastName = name.family || '';
    }

    // 計算年齡
    const age = fhirPatient.birthDate ? 
                this.calculateAge(fhirPatient.birthDate) : 
                null;

    return {
      id: fhirPatient.id,
      firstName,
      lastName,
      gender: fhirPatient.gender || 'unknown',
      birthDate: fhirPatient.birthDate,
      age,
      // 保持向後相容性
      fname: firstName,
      lname: lastName,
      birthdate: fhirPatient.birthDate
    };
  }

  /**
   * 轉換 FHIR 觀察值資源為顯示格式
   * @param {Array} fhirObservations - FHIR 觀察值資源陣列
   * @returns {Array} 轉換後的觀察值資料
   */
  static transformObservations(fhirObservations) {
    if (!Array.isArray(fhirObservations)) {
      return [];
    }

    return fhirObservations.map(obs => this.transformObservation(obs)).filter(Boolean);
  }

  /**
   * 轉換單一 FHIR 觀察值
   * @param {Object} fhirObservation - FHIR 觀察值資源
   * @returns {Object} 轉換後的觀察值
   */
  static transformObservation(fhirObservation) {
    if (!fhirObservation) {
      return null;
    }

    // 獲取顯示名稱
    const display = this.getObservationDisplay(fhirObservation);
    
    // 獲取值和單位
    const { value, unit } = this.getObservationValue(fhirObservation);
    
    // 獲取代碼
    const code = this.getObservationCode(fhirObservation);
    
    // 確定分類
    const category = this.getObservationCategory(fhirObservation);

    return {
      id: fhirObservation.id,
      code,
      display,
      value,
      unit,
      category,
      effectiveDateTime: fhirObservation.effectiveDateTime,
      status: fhirObservation.status,
      normalRange: this.getNormalRange(fhirObservation)
    };
  }

  /**
   * 獲取觀察值顯示名稱
   * @param {Object} observation - FHIR 觀察值
   * @returns {string} 顯示名稱
   */
  static getObservationDisplay(observation) {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      const coding = observation.code.coding[0];
      return coding.display || observation.code.text || coding.code || '未知觀察值';
    }
    return observation.code?.text || '未知觀察值';
  }

  /**
   * 獲取觀察值的數值和單位
   * @param {Object} observation - FHIR 觀察值
   * @returns {Object} {value, unit}
   */
  static getObservationValue(observation) {
    // 處理數量值
    if (observation.valueQuantity) {
      return {
        value: observation.valueQuantity.value,
        unit: observation.valueQuantity.unit || observation.valueQuantity.code
      };
    }
    
    // 處理字串值
    if (observation.valueString) {
      return {
        value: observation.valueString,
        unit: null
      };
    }
    
    // 處理布林值
    if (typeof observation.valueBoolean !== 'undefined') {
      return {
        value: observation.valueBoolean ? '是' : '否',
        unit: null
      };
    }
    
    // 處理代碼值
    if (observation.valueCodeableConcept) {
      const display = observation.valueCodeableConcept.coding?.[0]?.display || 
                     observation.valueCodeableConcept.text;
      return {
        value: display,
        unit: null
      };
    }

    return {
      value: null,
      unit: null
    };
  }

  /**
   * 獲取觀察值代碼
   * @param {Object} observation - FHIR 觀察值
   * @returns {string} 代碼
   */
  static getObservationCode(observation) {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      return observation.code.coding[0].code;
    }
    return null;
  }

  /**
   * 獲取觀察值分類
   * @param {Object} observation - FHIR 觀察值
   * @returns {string} 分類
   */
  static getObservationCategory(observation) {
    // 根據 LOINC 代碼判斷分類
    const code = this.getObservationCode(observation);
    
    const vitalSignsCodes = ['8302-2', '8462-4', '8480-6', '55284-4'];
    const laboratoryCodes = ['2085-9', '2089-1'];
    
    if (vitalSignsCodes.includes(code)) {
      return 'vital-signs';
    }
    
    if (laboratoryCodes.includes(code)) {
      return 'laboratory';
    }
    
    // 檢查 FHIR 分類
    if (observation.category && observation.category.length > 0) {
      const category = observation.category[0];
      if (category.coding && category.coding.length > 0) {
        const categoryCode = category.coding[0].code;
        return categoryCode;
      }
    }
    
    return 'other';
  }

  /**
   * 獲取正常範圍
   * @param {Object} observation - FHIR 觀察值
   * @returns {string|null} 正常範圍文字
   */
  static getNormalRange(observation) {
    if (observation.referenceRange && observation.referenceRange.length > 0) {
      const range = observation.referenceRange[0];
      let rangeText = '';
      
      if (range.low) {
        rangeText += range.low.value + (range.low.unit || '');
      }
      
      if (range.high) {
        if (rangeText) rangeText += ' - ';
        rangeText += range.high.value + (range.high.unit || '');
      }
      
      if (range.text) {
        return range.text;
      }
      
      return rangeText || null;
    }
    
    return null;
  }

  /**
   * 按類別分組觀察值
   * @param {Array} observations - 觀察值陣列
   * @returns {Object} 分組後的觀察值
   */
  static groupObservationsByCategory(observations) {
    if (!Array.isArray(observations)) {
      return {};
    }

    const grouped = {};

    observations.forEach(obs => {
      const category = obs.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(obs);
    });

    // 按類別排序
    const sortedGrouped = {};
    const categoryOrder = ['vital-signs', 'laboratory', 'survey', 'exam', 'other'];
    
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        sortedGrouped[category] = grouped[category];
      }
    });

    // 添加其他未定義的分類
    Object.keys(grouped).forEach(category => {
      if (!categoryOrder.includes(category)) {
        sortedGrouped[category] = grouped[category];
      }
    });

    return sortedGrouped;
  }

  /**
   * 計算患者年齡
   * @param {string} birthDate - 出生日期 (ISO 格式)
   * @returns {number} 年齡
   */
  static calculateAge(birthDate) {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * 格式化日期
   * @param {string|Date} date - 日期
   * @param {string} format - 格式 (default: 'YYYY-MM-DD')
   * @returns {string} 格式化後的日期
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '無效日期';
    
    switch (format) {
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('zh-TW');
      case 'MM/DD/YYYY':
        return dateObj.toLocaleDateString('en-US');
      default:
        return dateObj.toLocaleDateString('zh-TW');
    }
  }

  /**
   * 驗證 FHIR 資源
   * @param {Object} resource - FHIR 資源
   * @param {string} resourceType - 期望的資源類型
   * @returns {boolean} 是否有效
   */
  static validateFHIRResource(resource, resourceType) {
    if (!resource || typeof resource !== 'object') {
      return false;
    }
    
    if (resourceType && resource.resourceType !== resourceType) {
      return false;
    }
    
    return true;
  }

  /**
   * 清理和正規化患者姓名
   * @param {Object} nameObject - FHIR 姓名物件
   * @returns {Object} 清理後的姓名
   */
  static normalizePatientName(nameObject) {
    if (!nameObject) {
      return { given: '', family: '' };
    }

    const given = Array.isArray(nameObject.given) ? 
                  nameObject.given.join(' ').trim() : 
                  (nameObject.given || '').trim();
                  
    const family = (nameObject.family || '').trim();

    return { given, family };
  }

  /**
   * 排序觀察值
   * @param {Array} observations - 觀察值陣列
   * @param {string} sortBy - 排序欄位 ('date', 'name', 'value')
   * @param {string} order - 排序順序 ('asc', 'desc')
   * @returns {Array} 排序後的觀察值
   */
  static sortObservations(observations, sortBy = 'date', order = 'desc') {
    if (!Array.isArray(observations)) {
      return [];
    }

    return [...observations].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.effectiveDateTime || 0);
          const dateB = new Date(b.effectiveDateTime || 0);
          comparison = dateA - dateB;
          break;
          
        case 'name':
          comparison = (a.display || '').localeCompare(b.display || '');
          break;
          
        case 'value':
          const valueA = parseFloat(a.value) || 0;
          const valueB = parseFloat(b.value) || 0;
          comparison = valueA - valueB;
          break;
          
        default:
          comparison = 0;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }
}

// 將工具類別添加到全域範圍
window.DataTransformUtils = DataTransformUtils;