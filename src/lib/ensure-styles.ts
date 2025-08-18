// Force style reload script - add to the top of your page components
export function ensureStyles() {
  if (typeof window !== 'undefined') {
    // Force Tailwind to recompile the classes
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/_next/static/css/app/layout.css?v=' + Date.now();
    document.head.appendChild(link);
    
    // Also ensure the global CSS is loaded
    const globalLink = document.createElement('link');
    globalLink.rel = 'stylesheet'; 
    globalLink.href = '/globals.css?v=' + Date.now();
    document.head.appendChild(globalLink);
  }
}

// Use in components:
// useEffect(() => { ensureStyles(); }, []);