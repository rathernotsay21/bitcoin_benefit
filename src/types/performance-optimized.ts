// Performance-optimized type definitions for Bitcoin Benefit platform
// These types are designed to minimize TypeScript compilation overhead

// Utility types optimized for performance
export type Primitive = string | number | boolean | null | undefined;
export type DeepReadonly<T> = T extends Primitive ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Optimized conditional types using distributive pattern
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// High-performance union types for common data structures
export type NumericValue = number;
export type StringValue = string;
export type BooleanValue = boolean;

// Optimized branded types using declare const for zero runtime cost
declare const __brand: unique symbol;
export type Branded<T, K> = T & { readonly [__brand]: K };

// Fast array operations types
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
export type ArrayLength<T extends readonly unknown[]> = T['length'];

// Performance-optimized object types
export interface FastLookup<T = unknown> {
  readonly [key: string]: T;
}

export type ReadonlyRecord<K extends string | number | symbol, V> = {
  readonly [P in K]: V;
}

// Optimized function types to reduce call overhead
export type FastFunction<Args extends readonly unknown[] = [], Return = void> = 
  (...args: Args) => Return;

export type AsyncFastFunction<Args extends readonly unknown[] = [], Return = void> = 
  (...args: Args) => Promise<Return>;

// Optimized event handler types
export type EventHandler<T = Event> = FastFunction<[T], void>;
export type AsyncEventHandler<T = Event> = AsyncFastFunction<[T], void>;

// High-performance selector types for Zustand stores
export type StoreSelector<Store, Selected> = (state: Store) => Selected;
export type EqualityFunction<T> = (a: T, b: T) => boolean;

// Optimized API response types
export interface APIResponse<T = unknown> {
  readonly data: T;
  readonly status: number;
  readonly success: boolean;
  readonly timestamp: number;
}

export interface APIError {
  readonly message: string;
  readonly code: string | number;
  readonly status: number;
  readonly timestamp: number;
}

// Performance-optimized calculator types
export interface CalculationResult {
  readonly value: NumericValue;
  readonly timestamp: number;
  readonly inputHash: StringValue;
}

export interface TimelinePoint {
  readonly month: NumericValue;
  readonly value: NumericValue;
  readonly timestamp: number;
}

// Optimized chart data types
export interface ChartDataPoint {
  readonly x: NumericValue;
  readonly y: NumericValue;
  readonly label?: StringValue;
}

export type ChartData = readonly ChartDataPoint[];

// Fast validation types
export interface ValidationResult {
  readonly isValid: BooleanValue;
  readonly errors: readonly StringValue[];
}

export type Validator<T> = FastFunction<[T], ValidationResult>;

// Performance utilities for data processing
export interface DataProcessor<Input, Output> {
  readonly process: FastFunction<[Input], Output>;
  readonly batchProcess: FastFunction<[readonly Input[]], readonly Output[]>;
}

// Optimized store action types
export interface StoreAction<Args extends readonly unknown[] = []> {
  readonly type: StringValue;
  readonly execute: FastFunction<Args, void>;
}

export interface AsyncStoreAction<Args extends readonly unknown[] = []> {
  readonly type: StringValue;
  readonly execute: AsyncFastFunction<Args, void>;
}

// High-performance memoization types
export interface MemoizedFunction<Args extends readonly unknown[], Return> {
  readonly fn: FastFunction<Args, Return>;
  readonly cache: FastLookup<Return>;
  readonly clear: FastFunction<[], void>;
}

// Optimized component props types
export interface BaseComponentProps {
  readonly className?: StringValue;
  readonly id?: StringValue;
  readonly testId?: StringValue;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  readonly onClick?: EventHandler<MouseEvent>;
  readonly onKeyDown?: EventHandler<KeyboardEvent>;
  readonly disabled?: BooleanValue;
}

// Performance monitoring types
export interface PerformanceMetrics {
  readonly renderTime: NumericValue;
  readonly bundleSize: NumericValue;
  readonly memoryUsage: NumericValue;
  readonly timestamp: number;
}

export interface PerformanceThreshold {
  readonly renderTime: NumericValue; // ms
  readonly bundleSize: NumericValue; // bytes
  readonly memoryUsage: NumericValue; // MB
}

// Type guards optimized for performance
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is object => 
  value !== null && typeof value === 'object';
export const isArray = Array.isArray;

// Fast deep equality check for simple objects
export const shallowEqual = <T>(a: T, b: T): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if ((a as any)[key] !== (b as any)[key]) return false;
  }
  
  return true;
};

// Export performance constants
export const PERFORMANCE_THRESHOLDS: PerformanceThreshold = {
  renderTime: 16, // 60 FPS target
  bundleSize: 500 * 1024, // 500KB
  memoryUsage: 50, // 50MB
} as const;

// Export type utilities
export type InferArgs<T> = T extends FastFunction<infer Args, any> ? Args : never;
export type InferReturn<T> = T extends FastFunction<any, infer Return> ? Return : never;