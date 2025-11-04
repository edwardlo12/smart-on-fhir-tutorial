# SMART on FHIR Tutorial UI Style Guide

## Overview

This style guide documents the design system and conventions used in the SMART on FHIR Tutorial UI optimization project. It serves as a reference for maintaining consistency across all UI components and ensuring maintainable, accessible code.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout & Spacing](#layout--spacing)
5. [Components](#components)
6. [CSS Architecture](#css-architecture)
7. [JavaScript Patterns](#javascript-patterns)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Browser Support](#browser-support)
10. [Performance Guidelines](#performance-guidelines)

## Design Principles

### 1. Medical Data First
- Prioritize clarity and readability of medical information
- Use consistent visual hierarchy for data categorization
- Ensure all medical data is scannable and actionable

### 2. Accessibility by Default
- Follow WCAG 2.1 AA standards
- Provide keyboard navigation for all interactive elements
- Include proper ARIA labels and semantic markup

### 3. Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with modern browser features
- Graceful degradation for older browsers

### 4. Performance Focused
- Minimize layout thrashing with optimized animations
- Use efficient CSS selectors
- Implement lazy loading for large datasets

## Color System

### Primary Colors
```css
:root {
  --primary-blue: #0066cc;
  --primary-blue-dark: #004499;
  --primary-blue-light: #3388dd;
}
```

### Semantic Colors
```css
:root {
  /* Status Colors */
  --success-green: #28a745;
  --warning-yellow: #ffc107;
  --danger-red: #dc3545;
  --info-blue: #17a2b8;
  
  /* Neutral Colors */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  --background-primary: #ffffff;
  --background-secondary: #f8f9fa;
  --border-color: #dee2e6;
}
```

### Medical Category Colors
```css
:root {
  --vital-signs: #e74c3c;      /* Red - Critical vitals */
  --laboratory: #3498db;       /* Blue - Lab results */
  --imaging: #9b59b6;          /* Purple - Imaging studies */
  --medications: #f39c12;      /* Orange - Medications */
  --allergies: #e67e22;        /* Dark orange - Allergies */
  --procedures: #27ae60;       /* Green - Procedures */
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --background-primary: #ffffff;
    --border-color: #000000;
  }
}
```

## Typography

### Font Stack
```css
:root {
  --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                         'Helvetica Neue', Arial, sans-serif;
  --font-family-monospace: 'SFMono-Regular', Consolas, 'Liberation Mono', 
                           Menlo, Courier, monospace;
}
```

### Type Scale
```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
}
```

### Font Weights
```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Line Heights
```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

## Layout & Spacing

### Spacing Scale
```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
}
```

### Grid System
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.grid {
  display: grid;
  gap: var(--space-lg);
}

.grid--2-cols { grid-template-columns: repeat(2, 1fr); }
.grid--3-cols { grid-template-columns: repeat(3, 1fr); }
.grid--4-cols { grid-template-columns: repeat(4, 1fr); }
```

### Responsive Breakpoints
```css
:root {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}
```

## Components

### Button Component
```css
.btn {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid transparent;
  border-radius: 4px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  /* Focus styles */
  &:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
  }
}

.btn--primary {
  background-color: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
  
  &:hover {
    background-color: var(--primary-blue-dark);
    border-color: var(--primary-blue-dark);
  }
}
```

### Card Component
```css
.card {
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--space-lg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.card__header {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}

.card__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}
```

### Medical Data Components
```css
.observation-item {
  padding: var(--space-md);
  border-left: 4px solid var(--border-color);
  background: var(--background-secondary);
  margin-bottom: var(--space-sm);
}

.observation-item--vital-signs {
  border-left-color: var(--vital-signs);
}

.observation-item--laboratory {
  border-left-color: var(--laboratory);
}

.observation-value {
  font-family: var(--font-family-monospace);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.observation-unit {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-left: var(--space-xs);
}
```

## CSS Architecture

### BEM Methodology
We use BEM (Block Element Modifier) naming convention:

```css
/* Block */
.patient-summary { }

/* Element */
.patient-summary__header { }
.patient-summary__content { }

/* Modifier */
.patient-summary--expanded { }
.patient-summary__header--highlighted { }
```

### File Organization
```
src/css/
├── base/
│   ├── reset.css         # CSS reset/normalize
│   ├── typography.css    # Font and text styles
│   └── variables.css     # CSS custom properties
├── components/
│   ├── buttons.css       # Button components
│   ├── cards.css         # Card components
│   ├── forms.css         # Form components
│   └── navigation.css    # Navigation components
├── layout/
│   ├── grid.css          # Grid system
│   ├── header.css        # Header layout
│   └── sidebar.css       # Sidebar layout
├── pages/
│   ├── home.css          # Home page styles
│   └── patient.css       # Patient page styles
└── utilities/
    ├── accessibility.css # A11y utilities
    ├── spacing.css       # Spacing utilities
    └── responsive.css    # Responsive utilities
```

### CSS Custom Properties Usage
```css
/* Define in :root */
:root {
  --component-padding: var(--space-md);
  --component-border-radius: 4px;
}

/* Use in components */
.component {
  padding: var(--component-padding);
  border-radius: var(--component-border-radius);
}

/* Override in contexts */
.component--large {
  --component-padding: var(--space-lg);
}
```

## JavaScript Patterns

### ES6+ Class Structure
```javascript
class MedicalDataComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaultOptions, ...options };
    this.init();
  }
  
  get defaultOptions() {
    return {
      autoUpdate: true,
      animationDuration: 300
    };
  }
  
  init() {
    this.bindEvents();
    this.render();
  }
  
  bindEvents() {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    // Handle click with proper error boundaries
  }
  
  render() {
    // Render component with proper accessibility
  }
  
  destroy() {
    // Clean up event listeners and references
  }
}
```

### Error Handling Pattern
```javascript
class ErrorBoundary {
  static handle(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    this.showErrorMessage(`Unable to load ${context}. Please try again.`);
    
    // Track error for analytics (if implemented)
    this.trackError(error, context);
  }
  
  static showErrorMessage(message) {
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    }
  }
}
```

### Async Data Loading Pattern
```javascript
class DataLoader {
  static async loadPatientData(patientId) {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      ErrorBoundary.handle(error, 'Patient Data Loading');
      return null;
    }
  }
}
```

## Accessibility Guidelines

### Semantic HTML
```html
<!-- Use proper heading hierarchy -->
<main>
  <h1>Patient Dashboard</h1>
  <section aria-labelledby="vitals-heading">
    <h2 id="vitals-heading">Vital Signs</h2>
    <!-- content -->
  </section>
</main>

<!-- Use proper list markup for data -->
<ul class="observation-list" role="list">
  <li class="observation-item" role="listitem">
    <span class="observation-name">Blood Pressure</span>
    <span class="observation-value">120/80 mmHg</span>
  </li>
</ul>
```

### ARIA Labels and Roles
```html
<!-- Interactive elements -->
<button 
  aria-label="Expand vital signs section"
  aria-expanded="false"
  aria-controls="vitals-content">
  Vital Signs
</button>

<div id="vitals-content" aria-hidden="true">
  <!-- content -->
</div>

<!-- Data tables -->
<table role="table" aria-label="Patient observations">
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col">Date</th>
      <th role="columnheader" scope="col">Type</th>
      <th role="columnheader" scope="col">Value</th>
    </tr>
  </thead>
</table>
```

### Keyboard Navigation
```css
/* Focus indicators */
*:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  
  &:focus {
    top: 6px;
  }
}
```

### Screen Reader Support
```javascript
// Announce dynamic content changes
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

## Browser Support

### Target Browsers
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Progressive Enhancement Strategy
```css
/* Base styles (all browsers) */
.component {
  display: block;
  padding: 16px;
}

/* Enhanced styles (modern browsers) */
@supports (display: grid) {
  .component {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
  }
}

/* Fallbacks for older browsers */
.component {
  /* Flexbox fallback */
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
}
```

### Vendor Prefixes
```css
.component {
  /* Webkit browsers */
  -webkit-transform: translateY(0);
  -webkit-transition: transform 0.3s ease;
  
  /* Standard */
  transform: translateY(0);
  transition: transform 0.3s ease;
}
```

## Performance Guidelines

### CSS Performance
```css
/* Efficient selectors */
.good-selector { }
.component__element { }

/* Avoid expensive selectors */
.avoid * { }
.avoid > * > * { }
.avoid [attribute="value"] { }

/* Optimize animations */
.animated-element {
  /* Use transform and opacity for smooth animations */
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Remove will-change after animation */
.animated-element.animation-complete {
  will-change: auto;
}
```

### JavaScript Performance
```javascript
// Debounce expensive operations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Use event delegation
document.addEventListener('click', (event) => {
  if (event.target.matches('.observation-item')) {
    handleObservationClick(event);
  }
});

// Virtual scrolling for large datasets
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
  }
  
  render(data, scrollTop) {
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleItems, data.length);
    
    // Only render visible items
    return data.slice(startIndex, endIndex).map(this.renderItem);
  }
}
```

### Image Optimization
```html
<!-- Responsive images -->
<img src="patient-photo-320w.jpg"
     srcset="patient-photo-320w.jpg 320w,
             patient-photo-640w.jpg 640w,
             patient-photo-1280w.jpg 1280w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 560px,
            800px"
     alt="Patient photo"
     loading="lazy">

<!-- WebP with fallback -->
<picture>
  <source srcset="patient-photo.webp" type="image/webp">
  <img src="patient-photo.jpg" alt="Patient photo">
</picture>
```

## Code Review Checklist

### CSS Checklist
- [ ] Uses BEM naming convention
- [ ] Implements mobile-first responsive design
- [ ] Includes proper browser fallbacks
- [ ] Uses CSS custom properties consistently
- [ ] Optimizes animations with transform/opacity
- [ ] Includes accessibility features (focus states, high contrast)
- [ ] Follows established spacing and typography scales

### JavaScript Checklist
- [ ] Uses ES6+ features appropriately
- [ ] Implements proper error boundaries
- [ ] Includes keyboard navigation support
- [ ] Uses semantic HTML with ARIA labels
- [ ] Optimizes performance (debouncing, event delegation)
- [ ] Properly handles async operations
- [ ] Includes JSDoc comments for complex functions

### Accessibility Checklist
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy
- [ ] ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast compliance (WCAG AA)
- [ ] Focus management for dynamic content

### Performance Checklist
- [ ] Optimized CSS selectors
- [ ] Efficient JavaScript patterns
- [ ] Image optimization
- [ ] Lazy loading implementation
- [ ] Virtual scrolling for large datasets
- [ ] Proper will-change usage
- [ ] Minimize layout thrashing

---

## Maintenance Notes

This style guide should be updated whenever:
- New components are added
- Design system changes are made
- Browser support requirements change
- Performance optimizations are implemented
- Accessibility standards are updated

Last updated: 2024-10-22
Version: 1.0.0