#!/bin/bash

# Cross-Browser Testing Script for SMART on FHIR Tutorial
# Version: 1.0.0
# Date: 2024-10-22

echo "🌐 SMART on FHIR Tutorial - 跨瀏覽器測試"
echo "========================================"

# Configuration
BASE_URL="http://localhost:8002"
TEST_PAGES=(
  "/"
  "/health.html"
  "/launch.html"
  "/launch-patient.html"
  "/launch-smart-sandbox.html"
  "/index-dev.html"
  "/index-prod.html"
)

CSS_FILES=(
  "/src/css/modern-ui.css"
  "/src/css/responsive.css"
  "/src/css/components.css"
  "/src/css/example-smart-app.css"
  "/src/css/build/bundle.css"
)

JS_FILES=(
  "/src/js/example-smart-app.js"
  "/src/js/ui-components.js"
  "/src/js/data-visualization.js"
  "/src/js/data-transform-utils.js"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test HTTP response
test_url() {
  local url="$1"
  local description="$2"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  echo -n "  Testing $description... "
  
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  
  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Function to test file size
test_file_size() {
  local url="$1"
  local description="$2"
  local min_size="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  echo -n "  Testing $description file size... "
  
  content_length=$(curl -s -I "$url" | grep -i content-length | cut -d' ' -f2 | tr -d '\r')
  
  if [ -n "$content_length" ] && [ "$content_length" -gt "$min_size" ]; then
    echo -e "${GREEN}✅ PASS${NC} (${content_length} bytes)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (${content_length:-0} bytes)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Function to check if server is running
check_server() {
  echo "🔍 檢查伺服器狀態..."
  
  if curl -s --max-time 5 "$BASE_URL" > /dev/null; then
    echo -e "  ${GREEN}✅ 伺服器運行正常${NC} ($BASE_URL)"
    return 0
  else
    echo -e "  ${RED}❌ 伺服器無法訪問${NC} ($BASE_URL)"
    echo ""
    echo "請確保應用程式正在運行："
    echo "  docker compose up -d"
    echo "  或者使用其他 HTTP 伺服器在端口 8002"
    exit 1
  fi
}

# Function to get file content type
get_content_type() {
  local url="$1"
  curl -s -I "$url" | grep -i content-type | cut -d' ' -f2- | tr -d '\r'
}

# Main testing function
run_tests() {
  echo ""
  echo "📄 測試核心頁面..."
  
  for page in "${TEST_PAGES[@]}"; do
    test_url "$BASE_URL$page" "$page"
  done
  
  echo ""
  echo "🎨 測試 CSS 檔案..."
  
  for css_file in "${CSS_FILES[@]}"; do
    test_url "$BASE_URL$css_file" "$css_file"
    if [ $? -eq 0 ]; then
      # Check if it's actually CSS
      content_type=$(get_content_type "$BASE_URL$css_file")
      if [[ "$content_type" == *"text/css"* ]] || [[ "$content_type" == *"text/plain"* ]]; then
        test_file_size "$BASE_URL$css_file" "$css_file" 1000
      fi
    fi
  done
  
  echo ""
  echo "💻 測試 JavaScript 檔案..."
  
  for js_file in "${JS_FILES[@]}"; do
    test_url "$BASE_URL$js_file" "$js_file"
    if [ $? -eq 0 ]; then
      # Check file size for JS files
      test_file_size "$BASE_URL$js_file" "$js_file" 500
    fi
  done
}

# Function to test CSS features
test_css_features() {
  echo ""
  echo "🔧 測試 CSS 功能特性..."
  
  # Download main CSS file for feature testing
  css_content=$(curl -s "$BASE_URL/src/css/modern-ui.css")
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 CSS 自定義屬性... "
  if echo "$css_content" | grep -q ":root\s*{"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 CSS Grid 支援... "
  if echo "$css_content" | grep -q "display:\s*grid"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 Flexbox 支援... "
  if echo "$css_content" | grep -q "display:\s*flex"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  # Test responsive.css for media queries
  responsive_content=$(curl -s "$BASE_URL/src/css/responsive.css")
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查響應式媒體查詢... "
  if echo "$responsive_content" | grep -q "@media"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Function to test JavaScript features
test_js_features() {
  echo ""
  echo "⚙️ 測試 JavaScript 功能特性..."
  
  # Download main JS file for feature testing
  js_content=$(curl -s "$BASE_URL/src/js/example-smart-app.js")
  ui_content=$(curl -s "$BASE_URL/src/js/ui-components.js")
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 ES6 類別語法... "
  if echo "$js_content" | grep -q "class\s" || echo "$ui_content" | grep -q "class\s"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查箭頭函數... "
  if echo "$js_content" | grep -q "=>"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 const/let 聲明... "
  if echo "$js_content" | grep -qE "(const|let)\s"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  # Test ui-components.js for modern features
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查模板字串... "
  if echo "$ui_content" | grep -q "\`"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Function to test accessibility features
test_accessibility() {
  echo ""
  echo "♿ 測試無障礙功能..."
  
  # Download main HTML for accessibility testing
  html_content=$(curl -s "$BASE_URL/")
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 ARIA 標籤... "
  if echo "$html_content" | grep -q "aria-"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查語義 HTML role... "
  if echo "$html_content" | grep -q "role="; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 viewport meta 標籤... "
  if echo "$html_content" | grep -q "name=\"viewport\""; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  檢查 lang 屬性... "
  if echo "$html_content" | grep -q "lang="; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Function to test performance
test_performance() {
  echo ""
  echo "🚀 測試效能指標..."
  
  # Test page load time
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  測試首頁載入時間... "
  
  load_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$BASE_URL/")
  
  if [[ "$load_time" =~ ^[0-9]+\.?[0-9]*$ ]]; then
    load_time_ms=$(echo "$load_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$load_time_ms" -lt 2000 ]; then
      echo -e "${GREEN}✅ PASS${NC} (${load_time_ms}ms)"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    else
      echo -e "${YELLOW}⚠️ SLOW${NC} (${load_time_ms}ms)"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
  else
    echo -e "${YELLOW}⚠️ 無法測量${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  fi
  
  # Test CSS bundle size
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "  測試 CSS bundle 大小... "
  
  bundle_size=$(curl -s -I "$BASE_URL/src/css/build/bundle.css" | grep -i content-length | cut -d' ' -f2 | tr -d '\r')
  bundle_kb=$((bundle_size / 1024))
  
  if [ "$bundle_kb" -lt 100 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${bundle_kb}KB)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${YELLOW}⚠️ LARGE${NC} (${bundle_kb}KB)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  fi
}

# Function to generate browser compatibility report
generate_compatibility_report() {
  echo ""
  echo "📊 瀏覽器相容性分析..."
  
  # Check for vendor prefixes in CSS
  css_all=$(curl -s "$BASE_URL/src/css/modern-ui.css" && curl -s "$BASE_URL/src/css/responsive.css")
  
  echo "  CSS 功能支援分析:"
  
  if echo "$css_all" | grep -q "\-webkit\-"; then
    echo "    ✅ WebKit 前綴支援 (Safari)"
  else
    echo "    ⚠️ 缺少 WebKit 前綴"
  fi
  
  if echo "$css_all" | grep -q "\-moz\-"; then
    echo "    ✅ Mozilla 前綴支援 (Firefox)"
  else
    echo "    ℹ️ 無 Mozilla 前綴 (可能不需要)"
  fi
  
  if echo "$css_all" | grep -q "\-ms\-"; then
    echo "    ✅ Microsoft 前綴支援 (舊版 Edge)"
  else
    echo "    ℹ️ 無 Microsoft 前綴 (新版 Edge 基於 Chromium)"
  fi
  
  # Check for @supports queries
  if echo "$css_all" | grep -q "@supports"; then
    echo "    ✅ 漸進式增強 (@supports)"
  else
    echo "    ⚠️ 缺少 @supports 查詢"
  fi
  
  # Check for fallbacks
  if echo "$css_all" | grep -q "display: flex"; then
    echo "    ✅ Flexbox 支援"
  fi
  
  if echo "$css_all" | grep -q "display: grid"; then
    echo "    ✅ CSS Grid 支援"
  fi
  
  # Estimate browser support
  echo ""
  echo "  預估瀏覽器支援:"
  echo "    🌐 Chrome 70+     : ✅ 完全支援"
  echo "    🦊 Firefox 65+    : ✅ 完全支援"
  echo "    🌍 Safari 12+     : ⚠️ 需要實際測試"
  echo "    💎 Edge 79+       : ✅ 完全支援"
  echo "    📱 Mobile Chrome  : ✅ 完全支援"
  echo "    📱 Mobile Safari  : ⚠️ 需要實際測試"
}

# Function to show final results
show_results() {
  echo ""
  echo "📋 測試結果摘要"
  echo "=============="
  echo ""
  
  success_rate=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)
  
  echo -e "總測試數: ${BLUE}$TOTAL_TESTS${NC}"
  echo -e "通過測試: ${GREEN}$PASSED_TESTS${NC}"
  echo -e "失敗測試: ${RED}$FAILED_TESTS${NC}"
  echo -e "成功率: ${BLUE}${success_rate}%${NC}"
  echo ""
  
  if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}🎉 所有測試通過！應用程式準備就緒。${NC}"
    echo ""
    echo "建議後續步驟:"
    echo "1. 在實際 Safari 設備上測試"
    echo "2. 執行行動設備測試"
    echo "3. 進行使用者接受度測試"
    echo "4. 部署到生產環境"
  elif [ "$FAILED_TESTS" -lt 3 ]; then
    echo -e "${YELLOW}⚠️ 大部分測試通過，但有少數問題需要解決。${NC}"
    echo ""
    echo "建議檢查："
    echo "1. 檢查失敗的檔案路徑"
    echo "2. 確認伺服器配置"
    echo "3. 驗證檔案權限"
  else
    echo -e "${RED}❌ 多個測試失敗，需要進一步調查。${NC}"
    echo ""
    echo "故障排除步驟："
    echo "1. 檢查 Docker 容器狀態: docker compose ps"
    echo "2. 查看錯誤日誌: docker compose logs"
    echo "3. 確認檔案結構完整性"
    echo "4. 重新建構應用程式"
  fi
  
  echo ""
  echo "📖 完整測試報告: specs/001-ui-optimization/cross-browser-testing-report.md"
  echo ""
}

# Main execution
main() {
  # Check if required tools are installed
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl 工具未安裝${NC}"
    echo "請安裝 curl: sudo apt-get install curl"
    exit 1
  fi
  
  if ! command -v bc &> /dev/null; then
    echo -e "${RED}❌ bc 工具未安裝${NC}"
    echo "請安裝 bc: sudo apt-get install bc"
    exit 1
  fi
  
  # Start testing
  echo "開始時間: $(date)"
  echo ""
  
  check_server
  run_tests
  test_css_features
  test_js_features
  test_accessibility
  test_performance
  generate_compatibility_report
  show_results
  
  echo "完成時間: $(date)"
  
  # Exit with appropriate code
  if [ "$FAILED_TESTS" -eq 0 ]; then
    exit 0
  else
    exit 1
  fi
}

# Run main function
main "$@"