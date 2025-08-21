/**
 * Comprehensive component type definitions for type safety
 */

import type { ReactNode, ComponentType, HTMLAttributes, RefObject } from 'react';
import type { 
  VestingScheme, 
  VestingCalculationResult, 
  HistoricalCalculationResult, 
  VestingTimelinePoint,
  HistoricalTimelinePoint,
  CostBasisMethod 
} from './vesting';
import type { 
  ToolId, 
  ToolError, 
  BitcoinTxId,
  BitcoinAddress 
} from './bitcoin-tools';

// =============================================================================
// BASE COMPONENT TYPES
// =============================================================================

// Base props that all components should have
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Props for components that can be disabled
export interface DisableableProps {
  disabled?: boolean;
}

// Props for components with loading states
export interface LoadableProps {
  loading?: boolean;
  loadingText?: string;
}

// Props for components with error states
export interface ErrorableProps {
  error?: string | ToolError | null;
  onErrorRetry?: () => void;
}

// Combined interactive component props
export interface InteractiveComponentProps 
  extends BaseComponentProps, DisableableProps, LoadableProps, ErrorableProps {}

// =============================================================================
// CHART COMPONENT TYPES
// =============================================================================

// Base chart props
export interface BaseChartProps extends BaseComponentProps {
  width?: number;
  height?: number;
  responsive?: boolean;
  animate?: boolean;
}

// Vesting Timeline Chart Props
export interface VestingTimelineChartProps extends BaseChartProps {
  data: VestingTimelinePoint[];
  currentBitcoinPrice: number;
  projectedGrowthRate: number;
  showTooltips?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  colorScheme?: 'default' | 'colorblind' | 'dark';
  onDataPointClick?: (point: VestingTimelinePoint, index: number) => void;
}

// Historical Timeline Chart Props
export interface HistoricalTimelineChartProps extends BaseChartProps {
  data: HistoricalTimelinePoint[];
  costBasisMethod: CostBasisMethod;
  currentBitcoinPrice: number;
  showTooltips?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  colorScheme?: 'default' | 'colorblind' | 'dark';
  onDataPointClick?: (point: HistoricalTimelinePoint, index: number) => void;
}

// Chart skeleton/loading state props
export interface ChartSkeletonProps extends BaseComponentProps {
  height: number;
  showLegend?: boolean;
  showDetails?: boolean;
  pulseSpeed?: 'slow' | 'normal' | 'fast';
}

// =============================================================================
// FORM COMPONENT TYPES
// =============================================================================

// Base form field props
export interface BaseFieldProps extends InteractiveComponentProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  name: string;
}

// Input field props
export interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  value: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Select field props
export interface SelectFieldProps<T = string> extends BaseFieldProps {
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  onChange: (value: T | T[]) => void;
}

// Checkbox/Toggle props
export interface ToggleFieldProps extends BaseFieldProps {
  checked: boolean;
  variant?: 'checkbox' | 'toggle' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  onChange: (checked: boolean) => void;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Form props
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  validation?: FormValidationResult;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  submitDisabled?: boolean;
}

// =============================================================================
// CALCULATOR COMPONENT TYPES
// =============================================================================

// Scheme selector props
export interface SchemeSelectorProps extends InteractiveComponentProps {
  schemes: VestingScheme[];
  selectedScheme: VestingScheme | null;
  onSchemeSelect: (scheme: VestingScheme) => void;
  layout?: 'grid' | 'list' | 'compact';
  showDetails?: boolean;
}

// Input controls props
export interface CalculatorInputsProps extends InteractiveComponentProps {
  currentBitcoinPrice: number;
  projectedGrowthRate: number;
  onBitcoinPriceChange?: (price: number) => void;
  onGrowthRateChange: (rate: number) => void;
  showAdvanced?: boolean;
  onAdvancedToggle?: () => void;
}

// Historical inputs props
export interface HistoricalInputsProps extends InteractiveComponentProps {
  startingYear: number;
  costBasisMethod: CostBasisMethod;
  onStartingYearChange: (year: number) => void;
  onCostBasisMethodChange: (method: CostBasisMethod) => void;
  minYear?: number;
  maxYear?: number;
}

// Results display props
export interface ResultsDisplayProps extends InteractiveComponentProps {
  results: VestingCalculationResult | HistoricalCalculationResult | null;
  type: 'future' | 'historical';
  showCharts?: boolean;
  showTables?: boolean;
  showSummary?: boolean;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

// =============================================================================
// BITCOIN TOOLS COMPONENT TYPES
// =============================================================================

// Base tool props
export interface BaseToolProps<T = unknown> extends InteractiveComponentProps {
  toolId: ToolId;
  initialData?: T;
  onResult?: (result: T) => void;
  onError?: (error: ToolError) => void;
}

// Transaction lookup props
export interface TransactionLookupProps extends BaseToolProps {
  initialTxid?: BitcoinTxId;
  onTransactionFound?: (transaction: unknown) => void;
}

// Address explorer props
export interface AddressExplorerProps extends BaseToolProps {
  initialAddress?: BitcoinAddress;
  onAddressAnalyzed?: (analysis: unknown) => void;
}

// Fee calculator props
export interface FeeCalculatorProps extends BaseToolProps {
  initialTxSize?: number;
  onFeesCalculated?: (fees: unknown) => void;
}

// Network status props
export interface NetworkStatusProps extends BaseToolProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onNetworkUpdate?: (status: unknown) => void;
}

// Document timestamping props
export interface DocumentTimestampProps extends BaseToolProps {
  onTimestampCreated?: (timestamp: unknown) => void;
}

// Tool container props
export interface ToolContainerProps extends InteractiveComponentProps {
  tools: ToolId[];
  activeTool?: ToolId;
  onToolChange: (toolId: ToolId) => void;
  layout?: 'tabs' | 'accordion' | 'sidebar';
}

// =============================================================================
// TRACKING COMPONENT TYPES
// =============================================================================

// Address input props
export interface AddressInputProps extends BaseFieldProps {
  address: string;
  onAddressChange: (address: string) => void;
  onAddressValidate?: (address: string) => Promise<boolean>;
  showValidation?: boolean;
}

// Vesting parameters props
export interface VestingParametersProps extends InteractiveComponentProps {
  startDate: string;
  annualGrant: number;
  totalGrants: number;
  onStartDateChange: (date: string) => void;
  onAnnualGrantChange: (amount: number) => void;
  onTotalGrantsChange: (count: number) => void;
}

// Transaction analysis props
export interface TransactionAnalysisProps extends InteractiveComponentProps {
  transactions: unknown[];
  expectedGrants: unknown[];
  onTransactionAnnotate?: (txid: string, annotation: string) => void;
  onGrantMatch?: (txid: string, grantYear: number) => void;
}

// =============================================================================
// LAYOUT COMPONENT TYPES
// =============================================================================

// Navigation props
export interface NavigationProps extends BaseComponentProps {
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon?: ComponentType<{ className?: string }>;
    active?: boolean;
    disabled?: boolean;
    badge?: string;
  }>;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  variant?: 'horizontal' | 'vertical' | 'mobile';
}

// Page layout props
export interface PageLayoutProps extends BaseComponentProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  fullWidth?: boolean;
}

// Modal props
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: ReactNode;
  loading?: boolean;
}

// =============================================================================
// PERFORMANCE AND OPTIMIZATION TYPES
// =============================================================================

// Virtualized list props
export interface VirtualizedListProps<T> extends BaseComponentProps {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  scrollToIndex?: number;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
}

// Lazy component props
export interface LazyComponentProps extends BaseComponentProps {
  fallback?: ReactNode;
  retryCount?: number;
  onRetry?: () => void;
  errorBoundary?: ComponentType<{ error: Error; retry: () => void }>;
}

// Performance monitor props
export interface PerformanceMonitorProps extends BaseComponentProps {
  componentName: string;
  trackRender?: boolean;
  trackInteraction?: boolean;
  onMetricsUpdate?: (metrics: {
    renderTime: number;
    interactionTime?: number;
    memoryUsage?: number;
  }) => void;
}

// =============================================================================
// ERROR BOUNDARY TYPES
// =============================================================================

// Error boundary props
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ComponentType<{ error: Error; retry: () => void }> | ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  resetKeys?: unknown[];
  resetOnPropsChange?: boolean;
}

// Error display props
export interface ErrorDisplayProps extends BaseComponentProps {
  error: Error | string | null;
  title?: string;
  showDetails?: boolean;
  showStack?: boolean;
  onRetry?: () => void;
  onReport?: (error: Error | string) => void;
}

// =============================================================================
// ACCESSIBILITY TYPES
// =============================================================================

// Accessible component props
export interface AccessibleComponentProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Screen reader props
export interface ScreenReaderProps extends BaseComponentProps {
  srOnly?: boolean;
  announce?: boolean;
  priority?: 'polite' | 'assertive';
}

// =============================================================================
// TYPE UTILITIES
// =============================================================================

// Extract props from component type
export type PropsOf<T> = T extends ComponentType<infer P> ? P : never;

// Make certain props required
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make certain props optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Component with ref
export type ComponentWithRef<T, R = HTMLElement> = T & {
  ref?: RefObject<R> | ((instance: R | null) => void);
};

// HTML element props
export type HTMLElementProps<T extends keyof JSX.IntrinsicElements> = 
  JSX.IntrinsicElements[T];

// Polymorphic component props
export type PolymorphicComponentProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export commonly used React types
  ReactNode,
  ComponentType,
  HTMLAttributes,
  RefObject,
};
