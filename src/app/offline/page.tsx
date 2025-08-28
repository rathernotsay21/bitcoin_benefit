import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - Bitcoin Benefit',
  description: 'Bitcoin Benefit offline mode with cached functionality',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  // This page redirects to the static offline.html for better performance
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Loading Offline Mode...</h1>
        <p className="text-slate-300">Redirecting to offline experience...</p>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          // Redirect to static offline.html for better caching
          if (typeof window !== 'undefined') {
            window.location.replace('/offline.html');
          }
        `
      }} />
    </div>
  );
}