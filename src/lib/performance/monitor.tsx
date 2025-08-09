/**
 * Performance monitoring utility for tracking the impact of useCallback optimizations
 */

import React from 'react';

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  avgRenderTime: number;
  handlerRecreations: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, RenderMetrics> = new Map();
  private handlerReferences: Map<string, WeakMap<Function, number>> = new Map();

  /**
   * Track component render
   */
  trackRender(componentName: string, startTime: number = performance.now()) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    const existing = this.metrics.get(componentName) || {
      componentName,
      renderCount: 0,
      avgRenderTime: 0,
      handlerRecreations: 0,
      timestamp: Date.now()
    };

    const newAvgTime = 
      (existing.avgRenderTime * existing.renderCount + renderTime) / 
      (existing.renderCount + 1);

    this.metrics.set(componentName, {
      ...existing,
      renderCount: existing.renderCount + 1,
      avgRenderTime: newAvgTime
    });
  }

  /**
   * Track handler stability (for useCallback optimization verification)
   */
  trackHandler(componentName: string, handlerName: string, handler: Function): boolean {
    const key = `${componentName}:${handlerName}`;
    
    if (!this.handlerReferences.has(key)) {
      this.handlerReferences.set(key, new WeakMap());
    }

    const handlerMap = this.handlerReferences.get(key)!;
    const wasRecreated = !handlerMap.has(handler);

    if (wasRecreated) {
      handlerMap.set(handler, Date.now());
      
      const metrics = this.metrics.get(componentName);
      if (metrics) {
        metrics.handlerRecreations++;
      }
    }

    return !wasRecreated; // Returns true if handler was stable
  }

  /**
   * Get performance report
   */
  getReport(): {
    summary: {
      totalRenders: number;
      avgRenderTime: number;
      totalHandlerRecreations: number;
      optimizationScore: number;
    };
    components: RenderMetrics[];
  } {
    const components = Array.from(this.metrics.values());
    
    const totalRenders = components.reduce((sum, c) => sum + c.renderCount, 0);
    const totalRenderTime = components.reduce((sum, c) => sum + (c.avgRenderTime * c.renderCount), 0);
    const avgRenderTime = totalRenders > 0 ? totalRenderTime / totalRenders : 0;
    const totalHandlerRecreations = components.reduce((sum, c) => sum + c.handlerRecreations, 0);

    // Calculate optimization score (0-100)
    // Lower handler recreations and render times = higher score
    const handlerScore = Math.max(0, 100 - (totalHandlerRecreations * 5));
    const renderTimeScore = Math.max(0, 100 - (avgRenderTime * 10));
    const optimizationScore = (handlerScore + renderTimeScore) / 2;

    return {
      summary: {
        totalRenders,
        avgRenderTime,
        totalHandlerRecreations,
        optimizationScore: Math.round(optimizationScore)
      },
      components: components.sort((a, b) => b.renderCount - a.renderCount)
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.clear();
    this.handlerReferences.clear();
  }

  /**
   * Log performance warnings
   */
  logWarnings() {
    const report = this.getReport();
    
    // Warn about components with high render counts
    report.components.forEach(component => {
      if (component.renderCount > 50) {
        console.warn(
          `⚠️ High render count for ${component.componentName}: ${component.renderCount} renders`
        );
      }
      
      if (component.handlerRecreations > 10) {
        console.warn(
          `⚠️ Excessive handler recreations for ${component.componentName}: ${component.handlerRecreations} recreations`
        );
      }
      
      if (component.avgRenderTime > 16) { // 60fps threshold
        console.warn(
          `⚠️ Slow renders for ${component.componentName}: ${component.avgRenderTime.toFixed(2)}ms average`
        );
      }
    });
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();
  
  // Track render on mount and updates
  performanceMonitor.trackRender(componentName, startTime);

  return {
    trackHandler: (handlerName: string, handler: Function) => {
      return performanceMonitor.trackHandler(componentName, handlerName, handler);
    }
  };
}

/**
 * HOC for automatic performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Unknown';

  return React.forwardRef<any, P>((props, ref) => {
    usePerformanceMonitor(displayName);
    return <Component {...props} ref={ref} />;
  });
}

/**
 * Development-only performance overlay
 */
export function PerformanceOverlay() {
  const [visible, setVisible] = React.useState(false);
  const [report, setReport] = React.useState(performanceMonitor.getReport());

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      setReport(performanceMonitor.getReport());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          padding: '5px 10px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          fontSize: 12,
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        📊 Perf
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        width: 300,
        maxHeight: 400,
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: 15,
        borderRadius: 10,
        fontSize: 12,
        fontFamily: 'monospace',
        overflowY: 'auto',
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Performance Monitor</h3>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: 15 }}>
        <div>Score: {report.summary.optimizationScore}/100</div>
        <div>Total Renders: {report.summary.totalRenders}</div>
        <div>Avg Render Time: {report.summary.avgRenderTime.toFixed(2)}ms</div>
        <div>Handler Recreations: {report.summary.totalHandlerRecreations}</div>
      </div>

      <div style={{ borderTop: '1px solid #444', paddingTop: 10 }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Components</h4>
        {report.components.slice(0, 10).map(component => (
          <div
            key={component.componentName}
            style={{
              marginBottom: 8,
              padding: 5,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{component.componentName}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>
              Renders: {component.renderCount} | 
              Avg: {component.avgRenderTime.toFixed(2)}ms | 
              Handlers: {component.handlerRecreations}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 5 }}>
        <button
          onClick={() => {
            performanceMonitor.reset();
            setReport(performanceMonitor.getReport());
          }}
          style={{
            flex: 1,
            padding: '5px 10px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <button
          onClick={() => performanceMonitor.logWarnings()}
          style={{
            flex: 1,
            padding: '5px 10px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          Log Warnings
        </button>
      </div>
    </div>
  );
}
