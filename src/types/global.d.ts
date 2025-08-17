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