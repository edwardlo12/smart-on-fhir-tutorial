/**
 * Example SMART App - 現代化 JavaScript 實作
 * 
 * 此檔案包含：
 * - SMART on FHIR 客戶端整合
 * - 移除 jQuery 依賴，使用原生 JavaScript
 * - 現代化的 Promise/async-await 模式
 * - 資料提取和視覺化功能
 */

(function(window){
  
  // 確保全域狀態可用，如果尚未載入則創建基本版本
  if (typeof window.appState === 'undefined') {
    window.appState = {
      setLoading: function(isLoading, message) {
        console.log('Loading state:', isLoading, message);
      },
      setError: function(error) {
        console.error('App error:', error);
      },
      setPatient: function(patient) {
        console.log('Patient set:', patient);
      },
      setObservations: function(observations) {
        console.log('Observations set:', observations);
      }
    };
  }
  
  /**
   * 提取 SMART on FHIR 資料
   * @returns {Promise} 返回包含患者和觀察值資料的 Promise
   */
  window.extractData = function() {
    return new Promise(async (resolve, reject) => {
      
      function onError(error) {
        console.error('Loading error:', error);
        if (window.appState && window.appState.setError) {
          window.appState.setError(error);
        }
        reject(error);
      }

      async function onReady(smart) {
        try {
          console.log('SMART client ready:', smart);
          if (window.appState && window.appState.setLoading) {
            window.appState.setLoading(true, '載入患者資料...');
          }
          
          if (!smart.hasOwnProperty('patient')) {
            throw new Error('No patient context available');
          }

          const patient = smart.patient;
          const pt = await patient.read();
          
          if (window.appState && window.appState.setLoading) {
            window.appState.setLoading(true, '載入觀察值資料...');
          }
          
          // 使用 LOINC 代碼查詢觀察值 - 擴展查詢範圍
          const codesArr = [
            // 生命徵象
            'http://loinc.org|8302-2',  // 身高
            'http://loinc.org|29463-7', // 體重
            'http://loinc.org|39156-5', // BMI
            'http://loinc.org|8480-6',  // 收縮壓
            'http://loinc.org|8462-4',  // 舒張壓  
            'http://loinc.org|55284-4', // 血壓
            'http://loinc.org|8867-4',  // 心率
            'http://loinc.org|9279-1',  // 呼吸率
            'http://loinc.org|8310-5',  // 體溫
            
            // 實驗室檢查 - 膽固醇相關
            'http://loinc.org|2085-9',  // HDL 膽固醇
            'http://loinc.org|2089-1',  // LDL 膽固醇
            'http://loinc.org|14647-2', // 膽固醇總量
            'http://loinc.org|2571-8',  // 三酸甘油脂
            
            // 血糖相關
            'http://loinc.org|2339-0',  // 葡萄糖
            'http://loinc.org|33747-0', // 血紅蛋白 A1c
            'http://loinc.org|4548-4',  // 血紅蛋白 A1c（百分比）
            
            // 血液學檢查
            'http://loinc.org|718-7',   // 血紅蛋白
            'http://loinc.org|6690-2',  // 白血球計數
            'http://loinc.org|789-8',   // 紅血球計數
            'http://loinc.org|777-3',   // 血小板計數
            'http://loinc.org|4544-3',  // 血球容積比
            
            // 生化檢查
            'http://loinc.org|2947-0',  // 鈉
            'http://loinc.org|2823-3',  // 鉀
            'http://loinc.org|2075-0',  // 氯
            'http://loinc.org|3094-0',  // 尿素氮
            'http://loinc.org|2160-0',  // 肌酸酐
            'http://loinc.org|1742-6',  // 丙氨酸轉氨酶 (ALT)
            'http://loinc.org|1920-8',  // 天門冬氨酸轉氨酶 (AST)
            'http://loinc.org|1975-2',  // 膽紅素
            'http://loinc.org|17861-6', // 鈣
            'http://loinc.org|6768-6'   // 鹼性磷酸酶
          ];
          
          const codesParam = codesArr.join(',');
          
          // 查詢特定代碼的觀察值
          const specificObservations = await smart.patient.request({
            url: 'Observation?code=' + encodeURIComponent(codesParam)
          }, { flat: true });
          
          // 同時查詢所有觀察值（限制數量以避免過載）
          const allObservations = await smart.patient.request({
            url: 'Observation?_count=100&_sort=-date'
          }, { flat: true });
          
          // 合併觀察值，去除重複項
          const combinedObservations = [...specificObservations];
          allObservations.forEach(obs => {
            if (!combinedObservations.find(existing => existing.id === obs.id)) {
              combinedObservations.push(obs);
            }
          });
          
          console.log(`載入了 ${combinedObservations.length} 個觀察值 (特定查詢: ${specificObservations.length}, 全部: ${allObservations.length})`);

          // 處理資料
          const processedData = processPatientData(pt, combinedObservations, smart);
          
          if (window.appState) {
            if (window.appState.setLoading) window.appState.setLoading(false);
            if (window.appState.setPatient) window.appState.setPatient(pt);
            if (window.appState.setObservations) window.appState.setObservations(combinedObservations);
          }
          
          resolve(processedData);
          
        } catch (error) {
          onError(error);
        }
      }

      try {
        await FHIR.oauth2.ready().then(onReady).catch(onError);
      } catch (error) {
        onError(error);
      }
    });
  };

  /**
   * 處理患者資料
   * @param {Object} patient - FHIR 患者資源
   * @param {Array} observations - FHIR 觀察值資源陣列
   * @param {Object} smart - SMART 客戶端
   * @returns {Object} 處理後的患者資料
   */
  function processPatientData(patient, observations, smart) {
    const byCodes = smart.byCodes(observations || [], 'code');
    
    // 提取患者基本資訊
    const gender = patient.gender || '';
    let fname = '';
    let lname = '';

    if (patient && patient.name && patient.name.length > 0 && patient.name[0]) {
      fname = (patient.name[0].given || []).join(' ');
      lname = patient.name[0].family || '';
    }

    // 提取觀察值
    const height = byCodes('8302-2') || [];
    const bpList = byCodes('55284-4') || [];
    const systolicbp = getBloodPressureValue(bpList, '8480-6');
    const diastolicbp = getBloodPressureValue(bpList, '8462-4');
    const hdl = byCodes('2085-9') || [];
    const ldl = byCodes('2089-1') || [];

    // 創建結構化患者資料
    const processedPatient = {
      id: patient.id,
      birthdate: patient.birthDate,
      gender: gender,
      fname: fname,
      lname: lname,
      height: (height && height.length) ? getQuantityValueAndUnit(height[0]) : undefined,
      systolicbp: systolicbp,
      diastolicbp: diastolicbp,
      hdl: (hdl && hdl.length) ? getQuantityValueAndUnit(hdl[0]) : undefined,
      ldl: (ldl && ldl.length) ? getQuantityValueAndUnit(ldl[0]) : undefined,
      // 保存所有原始觀察值以供分組顯示使用
      allObservations: observations || []
    };

    return processedPatient;
  }

  /**
   * 預設患者資料結構
   * @returns {Object} 預設患者物件
   */
  function defaultPatient() {
    return {
      fname: { value: '' },
      lname: { value: '' },
      gender: { value: '' },
      birthdate: { value: '' },
      height: { value: '' },
      systolicbp: { value: '' },
      diastolicbp: { value: '' },
      ldl: { value: '' },
      hdl: { value: '' },
    };
  }

  /**
   * 從血壓觀察值中提取特定類型的血壓值
   * @param {Array} BPObservations - 血壓觀察值陣列
   * @param {string} typeOfPressure - 壓力類型代碼
   * @returns {string|undefined} 格式化的血壓值
   */
  function getBloodPressureValue(BPObservations, typeOfPressure) {
    const formattedBPObservations = [];
    
    BPObservations.forEach(function(observation) {
      const BP = observation.component && observation.component.find(function(component) {
        return component.code.coding.find(function(coding) {
          return coding.code === typeOfPressure;
        });
      });
      
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return formattedBPObservations.length > 0 ? 
           getQuantityValueAndUnit(formattedBPObservations[0]) : 
           undefined;
  }

  /**
   * 從觀察值中提取數量值和單位
   * @param {Object} observation - 觀察值物件
   * @returns {string|undefined} 格式化的數量值和單位
   */
  function getQuantityValueAndUnit(observation) {
    if (observation && 
        observation.valueQuantity && 
        typeof observation.valueQuantity.value !== 'undefined' &&
        typeof observation.valueQuantity.unit !== 'undefined') {
      // 格式化數值到小數點後2位
      const formattedValue = typeof observation.valueQuantity.value === 'number' 
        ? observation.valueQuantity.value.toFixed(2)
        : parseFloat(observation.valueQuantity.value).toFixed(2);
      return formattedValue + ' ' + observation.valueQuantity.unit;
    }
    return undefined;
  }

  /**
   * 使用現代 UI 組件繪製視覺化
   * @param {Object} patientData - 患者資料
   */
  window.drawVisualization = function(patientData) {
    try {
      // 隱藏載入狀態
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }

      // 顯示主要內容
      const holderElement = document.getElementById('holder');
      if (holderElement) {
        holderElement.style.display = 'block';
      }

      // 使用現代化的 DOM 操作更新內容
      updateElementContent('fname', patientData.fname);
      updateElementContent('lname', patientData.lname);
      updateElementContent('gender', patientData.gender);
      updateElementContent('birthdate', patientData.birthdate);
      updateElementContent('height', patientData.height);
      updateElementContent('systolicbp', patientData.systolicbp);
      updateElementContent('diastolicbp', patientData.diastolicbp);
      updateElementContent('ldl', patientData.ldl);
      updateElementContent('hdl', patientData.hdl);

      // 初始化分組觀察值顯示（Phase 4 新功能）
      if (window.ObservationGroupManager && patientData.allObservations) {
        const groupedContainer = document.getElementById('grouped-observations');
        if (groupedContainer) {
          const groupManager = new window.ObservationGroupManager(groupedContainer, {
            enableSearch: true,
            enableFilters: true,
            collapsible: true,
            showEmpty: false,
            layout: 'list'
          });
          
          // 使用所有原始觀察值進行渲染
          console.log(`正在渲染 ${patientData.allObservations.length} 個觀察值`);
          groupManager.render(patientData.allObservations);
        }
      }

      // 如果有新的 UI 組件管理器，則使用它們
      if (window.PatientDisplayManager) {
        const patientContainer = document.querySelector('[data-patient-display]');
        if (patientContainer) {
          const patientManager = new window.PatientDisplayManager(patientContainer);
          patientManager.render(patientData);
        }
      }

      if (window.ObservationDisplayManager) {
        const observationContainer = document.querySelector('[data-observation-display]');
        if (observationContainer) {
          const observationManager = new window.ObservationDisplayManager(observationContainer);
          // 將患者資料轉換為觀察值格式
          const observations = convertPatientDataToObservations(patientData);
          observationManager.render(observations);
        }
      }

      // 觸發資料載入完成事件
      const event = new CustomEvent('patient:data-loaded', {
        detail: { patient: patientData }
      });
      document.dispatchEvent(event);

    } catch (error) {
      console.error('Error drawing visualization:', error);
      showError('無法顯示患者資料');
    }
  };

  /**
   * 更新 DOM 元素內容（取代 jQuery）
   * @param {string} elementId - 元素 ID
   * @param {*} content - 內容
   */
  function updateElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content || '無資料';
    }
  }

  /**
   * 將患者資料轉換為觀察值格式
   * @param {Object} patientData - 患者資料
   * @returns {Array} 觀察值陣列
   */
  function convertPatientDataToObservations(patientData) {
    const observations = [];

    if (patientData.height) {
      observations.push({
        id: 'height',
        display: '身高',
        value: patientData.height,
        category: 'vital-signs'
      });
    }

    if (patientData.systolicbp) {
      observations.push({
        id: 'systolic-bp',
        display: '收縮壓',
        value: patientData.systolicbp,
        category: 'vital-signs'
      });
    }

    if (patientData.diastolicbp) {
      observations.push({
        id: 'diastolic-bp',
        display: '舒張壓',
        value: patientData.diastolicbp,
        category: 'vital-signs'
      });
    }

    if (patientData.hdl) {
      observations.push({
        id: 'hdl',
        display: 'HDL 膽固醇',
        value: patientData.hdl,
        category: 'laboratory'
      });
    }

    if (patientData.ldl) {
      observations.push({
        id: 'ldl',
        display: 'LDL 膽固醇',
        value: patientData.ldl,
        category: 'laboratory'
      });
    }

    return observations;
  }

  /**
   * 將患者資料轉換為完整的 FHIR 觀察值格式（用於分組顯示）
   * @param {Object} patientData - 患者資料
   * @returns {Array} 完整的 FHIR 觀察值陣列
   */
  function convertPatientDataToFullObservations(patientData) {
    const observations = [];
    const now = new Date().toISOString();

    if (patientData.height) {
      const [value, unit] = (patientData.height || '').split(' ');
      observations.push({
        id: 'height-1',
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8302-2',
            display: '身高'
          }]
        },
        valueQuantity: {
          value: parseFloat(value) || 0,
          unit: unit || 'cm',
          system: 'http://unitsofmeasure.org'
        },
        effectiveDateTime: now
      });
    }

    if (patientData.systolicbp) {
      const [value, unit] = (patientData.systolicbp || '').split(' ');
      observations.push({
        id: 'systolic-bp-1',
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8480-6',
            display: '收縮壓'
          }]
        },
        valueQuantity: {
          value: parseFloat(value) || 0,
          unit: unit || 'mmHg',
          system: 'http://unitsofmeasure.org'
        },
        effectiveDateTime: now,
        interpretation: patientData.systolicbp && parseFloat(value) > 140 ? [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'H',
            display: 'High'
          }]
        }] : undefined
      });
    }

    if (patientData.diastolicbp) {
      const [value, unit] = (patientData.diastolicbp || '').split(' ');
      observations.push({
        id: 'diastolic-bp-1',
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8462-4',
            display: '舒張壓'
          }]
        },
        valueQuantity: {
          value: parseFloat(value) || 0,
          unit: unit || 'mmHg',
          system: 'http://unitsofmeasure.org'
        },
        effectiveDateTime: now,
        interpretation: patientData.diastolicbp && parseFloat(value) > 90 ? [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'H',
            display: 'High'
          }]
        }] : undefined
      });
    }

    if (patientData.hdl) {
      const [value, unit] = (patientData.hdl || '').split(' ');
      observations.push({
        id: 'hdl-1',
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '2085-9',
            display: 'HDL 膽固醇'
          }]
        },
        valueQuantity: {
          value: parseFloat(value) || 0,
          unit: unit || 'mg/dL',
          system: 'http://unitsofmeasure.org'
        },
        effectiveDateTime: now,
        interpretation: patientData.hdl && parseFloat(value) < 40 ? [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'L',
            display: 'Low'
          }]
        }] : undefined
      });
    }

    if (patientData.ldl) {
      const [value, unit] = (patientData.ldl || '').split(' ');
      observations.push({
        id: 'ldl-1',
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '2089-1',
            display: 'LDL 膽固醇'
          }]
        },
        valueQuantity: {
          value: parseFloat(value) || 0,
          unit: unit || 'mg/dL',
          system: 'http://unitsofmeasure.org'
        },
        effectiveDateTime: now,
        interpretation: patientData.ldl && parseFloat(value) > 130 ? [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'H',
            display: 'High'
          }]
        }] : undefined
      });
    }

    return observations;
  }  /**
   * 顯示錯誤訊息
   * @param {string} message - 錯誤訊息
   */
  function showError(message) {
    const errorContainer = document.getElementById('errors') || 
                          document.querySelector('.error-display') ||
                          document.body;
    
    if (window.ErrorDisplayManager) {
      window.ErrorDisplayManager.show(errorContainer, message);
    } else {
      // 備用錯誤顯示
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.innerHTML = `
        <div class="error__content">
          <div class="error__title">錯誤</div>
          <div class="error__message">${message}</div>
        </div>
      `;
      errorContainer.appendChild(errorDiv);
    }
  }

  /**
   * 初始化應用程式
   */
  function initializeApp() {
    // 設置全域錯誤處理
    window.addEventListener('error', function(event) {
      console.error('Global error:', event.error);
      showError('應用程式發生錯誤，請重新載入頁面');
    });

    // 設置未處理的 Promise 拒絕處理
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled promise rejection:', event.reason);
      showError('載入資料時發生錯誤');
    });

    // 監聽網路狀態
    window.addEventListener('online', function() {
      console.log('Network connection restored');
      const offlineMessage = document.querySelector('.offline-message');
      if (offlineMessage) {
        offlineMessage.remove();
      }
    });

    window.addEventListener('offline', function() {
      console.log('Network connection lost');
      showOfflineMessage();
    });

    console.log('SMART App initialized');
  }

  /**
   * 顯示離線訊息
   */
  function showOfflineMessage() {
    // 移除現有的離線訊息
    const existing = document.querySelector('.offline-message');
    if (existing) {
      existing.remove();
    }

    const offlineDiv = document.createElement('div');
    offlineDiv.className = 'offline-message';
    offlineDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      font-family: var(--font-family-primary, 'Segoe UI', sans-serif);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    offlineDiv.innerHTML = `
      <strong>⚠️ 網路連接中斷</strong>
      <span style="margin-left: 12px;">部分功能可能無法正常使用</span>
    `;

    document.body.appendChild(offlineDiv);
  }

  /**
   * 增強的載入狀態管理
   */
  window.showAppLoading = function(message = '載入中...') {
    if (window.ObservationGroupManager && 
        window.observationGroupManager && 
        typeof window.observationGroupManager.showLoading === 'function') {
      window.observationGroupManager.showLoading(message);
    } else {
      // 備用載入顯示
      let loader = document.getElementById('app-loader');
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: var(--font-family-primary, 'Segoe UI', sans-serif);
        `;
        document.body.appendChild(loader);
      }
      loader.innerHTML = `
        <div style="text-align: center;">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007acc;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          <div style="color: #333; font-size: 16px;">${message}</div>
        </div>
      `;
      
      // 添加旋轉動畫
      if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  };

  window.hideAppLoading = function() {
    if (window.ObservationGroupManager && 
        window.observationGroupManager && 
        typeof window.observationGroupManager.hideLoading === 'function') {
      window.observationGroupManager.hideLoading();
    } else {
      const loader = document.getElementById('app-loader');
      if (loader) {
        loader.remove();
      }
    }
  };

  /**
   * 增強的錯誤處理
   */
  window.showAppError = function(error, context = '') {
    if (window.ObservationGroupManager && 
        window.observationGroupManager && 
        typeof window.observationGroupManager.handleError === 'function') {
      window.observationGroupManager.handleError(error, context);
    } else {
      showError(error.message || error);
    }
  };

  // 當 DOM 載入完成時初始化應用程式
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

})(window);
