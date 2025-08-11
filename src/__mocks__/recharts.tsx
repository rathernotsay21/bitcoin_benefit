/**
 * Centralized Recharts mock for consistent testing
 * Provides standardized mock components with proper test IDs and interaction handlers
 * 
 * Usage in test files:
 * ```typescript
 * import { vi } from 'vitest';
 * 
 * // Use centralized Recharts mock
 * vi.mock('recharts', async () => {
 *   const rechartsMock = await import('../../__mocks__/recharts');
 *   return rechartsMock.default;
 * });
 * ```
 * 
 * This mock provides:
 * - Consistent test IDs for all chart components (e.g., 'composed-chart', 'line-{dataKey}')
 * - Proper interaction handlers (onMouseMove, onMouseLeave, etc.)
 * - Data attributes for testing component props
 * - Support for custom content functions in Tooltip and Legend components
 */

import React from 'react';

// Mock all Recharts components with consistent test IDs
export const ComposedChart = ({ children, onMouseMove, onMouseLeave, throttleDelay, ...props }: any) => (
  <div 
    data-testid="composed-chart" 
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    data-throttle-delay={throttleDelay}
    {...props}
  >
    {children}
  </div>
);

export const LineChart = ({ children, onMouseMove, onMouseLeave, ...props }: any) => (
  <div 
    data-testid="line-chart" 
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    {...props}
  >
    {children}
  </div>
);

export const AreaChart = ({ children, onMouseMove, onMouseLeave, ...props }: any) => (
  <div 
    data-testid="area-chart" 
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    {...props}
  >
    {children}
  </div>
);

export const BarChart = ({ children, onMouseMove, onMouseLeave, ...props }: any) => (
  <div 
    data-testid="bar-chart" 
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    {...props}
  >
    {children}
  </div>
);

export const ScatterChart = ({ children, onMouseMove, onMouseLeave, ...props }: any) => (
  <div 
    data-testid="scatter-chart" 
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    {...props}
  >
    {children}
  </div>
);

export const Line = ({ dataKey, stroke, strokeWidth, dot, isAnimationActive, animationDuration, yAxisId, ...props }: any) => (
  <div 
    data-testid={`line-${dataKey}`} 
    data-stroke={stroke}
    data-stroke-width={strokeWidth}
    data-dot={dot}
    data-is-animation-active={isAnimationActive}
    data-animation-duration={animationDuration}
    data-y-axis-id={yAxisId}
    {...props} 
  />
);

export const Area = ({ dataKey, fill, stroke, ...props }: any) => (
  <div 
    data-testid={`area-${dataKey}`} 
    data-fill={fill}
    data-stroke={stroke}
    {...props} 
  />
);

export const Bar = ({ dataKey, fill, ...props }: any) => (
  <div 
    data-testid={`bar-${dataKey}`} 
    data-fill={fill}
    {...props} 
  />
);

export const Scatter = ({ dataKey, fill, ...props }: any) => (
  <div 
    data-testid={`scatter-${dataKey}`} 
    data-fill={fill}
    {...props} 
  />
);

export const XAxis = ({ dataKey, tickFormatter, domain, axisLine, tickLine, ...props }: any) => (
  <div 
    data-testid="x-axis" 
    data-key={dataKey}
    data-tick-formatter={tickFormatter?.name}
    data-domain={JSON.stringify(domain)}
    data-axis-line={axisLine}
    data-tick-line={tickLine}
    {...props} 
  />
);

export const YAxis = ({ yAxisId, orientation, tickFormatter, domain, ...props }: any) => (
  <div 
    data-testid={`y-axis${yAxisId ? `-${yAxisId}` : ''}`}
    data-orientation={orientation}
    data-tick-formatter={tickFormatter?.name}
    data-domain={JSON.stringify(domain)}
    {...props} 
  />
);

export const CartesianGrid = ({ strokeDasharray, vertical, horizontal, ...props }: any) => (
  <div 
    data-testid="cartesian-grid" 
    data-stroke-dasharray={strokeDasharray}
    data-vertical={vertical}
    data-horizontal={horizontal}
    {...props} 
  />
);

export const Tooltip = ({ content, formatter, labelFormatter, ...props }: any) => {
  // If custom content is provided, render it
  if (content && typeof content === 'function') {
    return (
      <div data-testid="tooltip" {...props}>
        {content({ active: true, payload: [], label: 'test' })}
      </div>
    );
  }
  
  return (
    <div 
      data-testid="tooltip" 
      data-formatter={formatter?.name}
      data-label-formatter={labelFormatter?.name}
      {...props} 
    />
  );
};

export const Legend = ({ content, verticalAlign, iconType, wrapperStyle, ...props }: any) => {
  // If custom content is provided, render it
  if (content && typeof content === 'function') {
    return (
      <div 
        data-testid="legend" 
        data-vertical-align={verticalAlign}
        data-icon-type={iconType}
        data-wrapper-style={JSON.stringify(wrapperStyle)}
        {...props}
      >
        {content({ payload: [] })}
      </div>
    );
  }
  
  return (
    <div 
      data-testid="legend" 
      data-vertical-align={verticalAlign}
      data-icon-type={iconType}
      data-wrapper-style={JSON.stringify(wrapperStyle)}
      {...props} 
    />
  );
};

export const ResponsiveContainer = ({ children, width, height, ...props }: any) => (
  <div 
    data-testid="responsive-container" 
    data-width={width}
    data-height={height}
    style={{ width: width || '100%', height: height || 400 }}
    {...props}
  >
    {children}
  </div>
);

export const ReferenceLine = ({ x, y, stroke, strokeDasharray, label, yAxisId, ...props }: any) => (
  <div 
    data-testid="reference-line" 
    data-x={x}
    data-y={y}
    data-stroke={stroke}
    data-stroke-dasharray={strokeDasharray}
    data-label={label}
    data-y-axis-id={yAxisId}
    {...props} 
  />
);

export const ReferenceArea = ({ x1, x2, y1, y2, fill, ...props }: any) => (
  <div 
    data-testid="reference-area" 
    data-x1={x1}
    data-x2={x2}
    data-y1={y1}
    data-y2={y2}
    data-fill={fill}
    {...props} 
  />
);

export const Brush = ({ dataKey, height, ...props }: any) => (
  <div 
    data-testid="brush" 
    data-key={dataKey}
    data-height={height}
    {...props} 
  />
);

export const Cell = ({ fill, ...props }: any) => (
  <div 
    data-testid="cell" 
    data-fill={fill}
    {...props} 
  />
);

// Export default object for compatibility
const RechartsTestMock = {
  ComposedChart,
  LineChart,
  AreaChart,
  BarChart,
  ScatterChart,
  Line,
  Area,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  Cell,
};

export default RechartsTestMock;