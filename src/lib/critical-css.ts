/**
 * Critical CSS for above-the-fold content
 * This CSS is inlined in the HTML to improve First Contentful Paint
 */

export const criticalCSS = `
  /* Reset and base styles */
  *, ::before, ::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: #e5e7eb;
  }
  
  html {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -moz-tab-size: 4;
    tab-size: 4;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  }
  
  body {
    margin: 0;
    line-height: inherit;
    min-height: 100vh;
  }
  
  /* Dark mode base */
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
    }
    body {
      background-color: rgb(17 24 39);
      color: rgb(243 244 246);
    }
  }
  
  /* Light mode base */
  @media (prefers-color-scheme: light) {
    :root {
      color-scheme: light;
    }
    body {
      background-color: rgb(255 255 255);
      color: rgb(17 24 39);
    }
  }
  
  /* Critical layout classes */
  .container {
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    padding-right: 1rem;
    padding-left: 1rem;
  }
  
  @media (min-width: 640px) {
    .container {
      max-width: 640px;
    }
  }
  
  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
    }
  }
  
  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }
  
  /* Critical typography */
  h1 {
    font-size: 2.25rem;
    line-height: 2.5rem;
    font-weight: 700;
    margin: 0;
  }
  
  h2 {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  h3 {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 600;
    margin: 0;
  }
  
  p {
    margin: 0;
  }
  
  /* Critical utilities */
  .hidden {
    display: none;
  }
  
  .flex {
    display: flex;
  }
  
  .grid {
    display: grid;
  }
  
  .min-h-screen {
    min-height: 100vh;
  }
  
  .items-center {
    align-items: center;
  }
  
  .justify-center {
    justify-content: center;
  }
  
  .text-center {
    text-align: center;
  }
  
  /* Loading states */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Skeleton loader */
  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  /* Critical button styles */
  button {
    font-family: inherit;
    font-size: 100%;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
    margin: 0;
    padding: 0;
    background-color: transparent;
    background-image: none;
    cursor: pointer;
  }
  
  /* Critical input styles */
  input, select, textarea {
    font-family: inherit;
    font-size: 100%;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
    margin: 0;
    padding: 0;
  }
  
  /* Prevent layout shift from scrollbar */
  html {
    overflow-y: scroll;
  }
  
  /* Critical responsive utilities */
  @media (min-width: 768px) {
    .md\\:flex {
      display: flex;
    }
    .md\\:hidden {
      display: none;
    }
    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .lg\\:flex {
      display: flex;
    }
    .lg\\:hidden {
      display: none;
    }
    .lg\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

/**
 * Get critical CSS for specific pages
 */
export function getCriticalCSS(pathname: string): string {
  // Add page-specific critical CSS if needed
  if (pathname === '/') {
    return criticalCSS + `
      /* Homepage critical styles */
      .hero-section {
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
  }
  
  if (pathname.startsWith('/calculator')) {
    return criticalCSS + `
      /* Calculator critical styles */
      .calculator-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
    `;
  }
  
  return criticalCSS;
}

/**
 * Preload critical fonts
 */
export const fontPreloads = [
  {
    href: '/fonts/inter-var.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous'
  }
];

/**
 * Preconnect to critical domains
 */
export const preconnectDomains = [
  'https://api.coingecko.com',
  'https://mempool.space'
];