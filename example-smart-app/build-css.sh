#!/bin/bash

# CSS Build and Optimization Script
# This script concatenates and optimizes CSS files for production

echo "🚀 Building optimized CSS bundle..."

# Create build directory
mkdir -p ./src/css/build

# Define CSS files in order of priority
CSS_FILES=(
  "./src/css/modern-ui.css"
  "./src/css/responsive.css" 
  "./src/css/components.css"
  "./src/css/example-smart-app.css"
)

# Create concatenated CSS file
BUNDLE_FILE="./src/css/build/bundle.css"
echo "/* SMART on FHIR Tutorial - Optimized CSS Bundle */" > "$BUNDLE_FILE"
echo "/* Generated on: $(date) */" >> "$BUNDLE_FILE"
echo "" >> "$BUNDLE_FILE"

# Concatenate all CSS files
for css_file in "${CSS_FILES[@]}"; do
  if [ -f "$css_file" ]; then
    echo "📁 Adding: $css_file"
    echo "/* === $(basename "$css_file") === */" >> "$BUNDLE_FILE"
    cat "$css_file" >> "$BUNDLE_FILE"
    echo "" >> "$BUNDLE_FILE"
  else
    echo "⚠️  Warning: $css_file not found"
  fi
done

# Create development index.html with separate files
DEV_HTML="./index-dev.html"
cp "./index.html" "$DEV_HTML"

# Create production index.html with bundled CSS
PROD_HTML="./index-prod.html"
sed 's|<!-- 優化的 CSS 載入策略 -->.*<!-- 預載入關鍵字體|<!-- Production CSS Bundle -->\n    <link rel='\''stylesheet'\'' type='\''text/css'\'' href='\''./src/css/build/bundle.css'\'' media='\''all'\''>\n    \n    <!-- 預載入關鍵字體|' "$DEV_HTML" > "$PROD_HTML"

echo "✅ CSS bundle created: $BUNDLE_FILE"
echo "📝 Development version: $DEV_HTML" 
echo "🏭 Production version: $PROD_HTML"
echo ""
echo "📊 Bundle size:"
wc -c < "$BUNDLE_FILE" | awk '{printf "%.1f KB\n", $1/1024}'
echo ""
echo "💡 To use:"
echo "   Development: Use index-dev.html (separate CSS files)"
echo "   Production:  Use index-prod.html (bundled CSS)"
echo ""
echo "🎯 Next steps:"
echo "   1. Test both versions"
echo "   2. Consider CSS minification for production"
echo "   3. Set up proper caching headers"