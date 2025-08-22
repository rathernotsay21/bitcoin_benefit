'use client';

import Script from 'next/script';

// Your Clarity Project ID
const CLARITY_PROJECT_ID = 'svem84nwfy';

export function ClarityScriptSimple() {
  // Always load Clarity if we have the ID
  if (!CLARITY_PROJECT_ID) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            console.log('Clarity initialized with ID:', i);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `,
      }}
    />
  );
}
