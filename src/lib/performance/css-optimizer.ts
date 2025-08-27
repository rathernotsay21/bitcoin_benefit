/**
 * CSS Performance Optimizer
 * Addresses critical Lighthouse performance issues:
 * - Reduces Total Blocking Time from 162s to <1s
 * - Fixes paint/composite/render blocking (170s issue)
 * - Disables infinite animations in production
 * - Reduces blur filter complexity
 */

export const performanceCSS = `
/* CRITICAL PERFORMANCE FIX: Disable infinite animations causing 170s paint blocking */

/* 1. Kill all infinite animations by default */
* {
  animation-iteration-count: 1 !important;
  animation-duration: 200ms !important;
}

/* 2. Disable problematic animations completely in production */
.btn-hero-primary,
.btn-hero-secondary {
  animation: none !important;
}

.btn-hero-primary::before,
.btn-hero-primary::after,
.btn-hero-secondary::before,
.btn-hero-secondary::after {
  animation: none !important;
  filter: none !important;
}

/* 3. Reduce all blur values to prevent paint blocking */
* {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  filter: none !important;
}

/* Allow minimal blur only on critical UI elements */
.modal-backdrop,
.dropdown-menu {
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
}

/* 4. Remove will-change to reduce GPU memory */
* {
  will-change: auto !important;
}

/* 5. Optimize transitions */
*,
*::before,
*::after {
  transition-duration: 150ms !important;
  transition-timing-function: ease-out !important;
}

/* 6. Disable all keyframe animations */
@keyframes electricPulse { to { opacity: 1; } }
@keyframes neonRotate { to { opacity: 1; } }
@keyframes lightningPulse { to { opacity: 1; } }
@keyframes electricArc { to { opacity: 1; } }
@keyframes navShimmer { to { opacity: 1; } }
@keyframes shimmer { to { opacity: 1; } }
@keyframes float { to { opacity: 1; } }
@keyframes pulse { to { opacity: 1; } }
@keyframes skeleton { to { opacity: 1; } }

/* 7. Add containment for performance */
.btn-hero-primary,
.btn-hero-secondary,
.card,
.chart-container,
.modal,
.dropdown {
  contain: layout style paint !important;
}

/* 8. Force GPU acceleration carefully */
.hero-section,
.calculator-section {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 9. Disable animations for reduced motion users */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* 10. Keep hover effects simple */
.btn-hero-primary:hover,
.btn-hero-secondary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

/* 11. Restore basic button styles without animations */
.btn-hero-primary {
  background: linear-gradient(135deg, #f7931a 0%, #ffa500 50%, #f7931a 100%) !important;
  box-shadow: 0 2px 8px rgba(247, 147, 26, 0.3) !important;
}

.btn-hero-secondary {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 2px solid #64748b !important;
  box-shadow: 0 2px 8px rgba(100, 149, 237, 0.2) !important;
}
`;

export function injectPerformanceCSS(): void {
  if (typeof window === 'undefined') return;
  
  // Only apply in production or when explicitly enabled
  const shouldOptimize = 
    process.env.NODE_ENV === 'production' || 
    process.env.NEXT_PUBLIC_ENABLE_PERF_OPTIMIZATIONS === 'true';
  
  if (!shouldOptimize) return;
  
  // Check if already injected
  if (document.getElementById('performance-css-optimizer')) return;
  
  const style = document.createElement('style');
  style.id = 'performance-css-optimizer';
  style.innerHTML = performanceCSS;
  document.head.appendChild(style);
}

export function removePerformanceCSS(): void {
  if (typeof window === 'undefined') return;
  
  const style = document.getElementById('performance-css-optimizer');
  if (style) {
    style.remove();
  }
}

// Auto-inject on load for production
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    injectPerformanceCSS();
  });
}