# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript ES5+, HTML5, CSS3  
**Primary Dependencies**: fhir-client.js, jQuery, Babel polyfill, XFC (Cross-Frame-Container)  
**Storage**: 瀏覽器 sessionStorage (OAuth tokens), GitHub Pages (靜態檔案)  
**Testing**: 沙盒環境測試 (Cerner, SMART Health IT), 跨瀏覽器測試  
**Target Platform**: 現代網頁瀏覽器, GitHub Pages 託管, EHR 內嵌  
**Project Type**: web - SMART on FHIR 應用程式  
**Performance Goals**: <2 秒應用程式載入, 流暢的授權流程  
**Constraints**: FHIR 標準合規, OAuth 2.0 安全性, 教學易讀性  
**Scale/Scope**: 教學導向單一應用程式, 多沙盒環境支援

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **FHIR 標準遵循**: 確認功能遵循 SMART on FHIR 規範與標準 API
- [ ] **漸進式增強**: 驗證新功能向後相容且不破壞現有系統
- [ ] **教學導向**: 確保程式碼具教學價值，包含清晰文件與範例
- [ ] **互操作性驗證**: 計畫在多個 FHIR 提供者環境中測試
- [ ] **程式碼品質**: 確認可測試性、錯誤處理與標準化程式庫使用

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
