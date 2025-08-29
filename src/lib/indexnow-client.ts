/**
 * Client-side IndexNow submission utility
 * Works with both Next.js API routes and Netlify Functions
 */

interface IndexNowResponse {
  success: boolean;
  results: Array<{
    endpoint: string;
    status: number | string;
    ok?: boolean;
    statusText?: string;
    error?: string;
  }>;
  submittedUrls: string[];
  timestamp: string;
}

export class IndexNowClient {
  private apiEndpoint: string;

  constructor() {
    // Detect environment and use appropriate endpoint
    this.apiEndpoint = this.detectEndpoint();
  }

  private detectEndpoint(): string {
    // Check if we're on Netlify (static deployment)
    if (typeof window !== 'undefined' && window.location.hostname.includes('netlify')) {
      return '/.netlify/functions/indexnow';
    }
    // Default to Next.js API route
    return '/api/indexnow';
  }

  /**
   * Submit URLs to IndexNow
   */
  async submitUrls(urls: string[]): Promise<IndexNowResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('IndexNow submission failed:', error);
      throw error;
    }
  }

  /**
   * Submit current page URL
   */
  async submitCurrentPage(): Promise<IndexNowResponse> {
    if (typeof window === 'undefined') {
      throw new Error('This method can only be called in the browser');
    }
    
    const currentUrl = window.location.href;
    return this.submitUrls([currentUrl]);
  }

  /**
   * Submit all pages from sitemap
   */
  async submitSitemap(): Promise<IndexNowResponse> {
    try {
      // Fetch and parse sitemap
      const sitemapResponse = await fetch('/sitemap.xml');
      const sitemapText = await sitemapResponse.text();
      
      // Extract URLs from sitemap
      const urls = this.extractUrlsFromSitemap(sitemapText);
      
      // Filter for primary domain only
      const primaryUrls = urls.filter(url => 
        url.includes('bitcoinbenefits.me') && 
        !url.includes('www.') &&
        !url.includes('netlify')
      );
      
      return this.submitUrls(primaryUrls);
    } catch (error) {
      console.error('Failed to submit sitemap:', error);
      throw error;
    }
  }

  /**
   * Extract URLs from sitemap XML
   */
  private extractUrlsFromSitemap(xml: string): string[] {
    const urls: string[] = [];
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    
    while ((match = locRegex.exec(xml)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  }

  /**
   * Submit URLs when content is updated
   * Useful for dynamic content updates
   */
  async submitOnContentUpdate(urls?: string[]): Promise<IndexNowResponse> {
    const urlsToSubmit = urls || [window.location.href];
    
    // Add a small delay to ensure content is fully rendered
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.submitUrls(urlsToSubmit);
  }
}

// Export singleton instance
export const indexNow = new IndexNowClient();

// Also export for use in scripts
if (typeof window !== 'undefined') {
  (window as any).IndexNowClient = IndexNowClient;
  (window as any).indexNow = indexNow;
}