// Global type declarations for the application

// Ensure react-dom types are available as a fallback
declare module 'react-dom' {
  export function createPortal(
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string
  ): React.ReactPortal;
  
  export * from 'react-dom/index';
}

// Google Analytics gtag types
interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}

interface GtagConfigParams {
  page_title?: string;
  page_location?: string;
  [key: string]: unknown;
}

// Performance API extension interface
interface PerformanceEntryWithProcessing extends PerformanceEntry {
  readonly processingStart: DOMHighResTimeStamp;
  readonly processingEnd?: DOMHighResTimeStamp;
}

// Extend global interfaces
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: GtagConfigParams | GtagEventParams
    ) => void;
  }
  
  interface PerformanceEntry {
    readonly processingStart?: DOMHighResTimeStamp;
    readonly processingEnd?: DOMHighResTimeStamp;
  }

  // Navigation Timing API Level 2
  interface PerformanceNavigationTiming extends PerformanceResourceTiming {
    readonly domComplete: DOMHighResTimeStamp;
    readonly domContentLoadedEventEnd: DOMHighResTimeStamp;
    readonly domContentLoadedEventStart: DOMHighResTimeStamp;
    readonly domInteractive: DOMHighResTimeStamp;
    readonly loadEventEnd: DOMHighResTimeStamp;
    readonly loadEventStart: DOMHighResTimeStamp;
    readonly redirectCount: number;
    readonly type: NavigationType;
    readonly unloadEventEnd: DOMHighResTimeStamp;
    readonly unloadEventStart: DOMHighResTimeStamp;
  }
}

// Extend process env for type safety
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_SITE_URL: string;
    readonly NEXT_PUBLIC_BITCOIN_API_URL?: string;
    readonly NEXT_PUBLIC_MEMPOOL_API_URL?: string;
  }
}

// Export the interfaces to ensure they're available
export type { GtagEventParams, GtagConfigParams, PerformanceEntryWithProcessing };