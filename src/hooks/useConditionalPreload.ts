import { useEffect } from 'react';

interface PreloadOptions {
    href: string;
    as: 'fetch' | 'script' | 'style' | 'image';
    crossorigin?: 'anonymous' | 'use-credentials';
    condition: boolean;
}

/**
 * Hook to conditionally preload resources only when needed
 * This prevents "preload not used" warnings by only preloading when the resource will actually be used
 */
export function useConditionalPreload(options: PreloadOptions) {
    useEffect(() => {
        if (!options.condition) return;

        // Check if preload link already exists
        const existingLink = document.querySelector(`link[href="${options.href}"][rel="preload"]`);
        if (existingLink) return;

        // Create preload link
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = options.href;
        link.as = options.as;

        if (options.crossorigin) {
            link.crossOrigin = options.crossorigin;
        }

        // Add to document head
        document.head.appendChild(link);

        // Cleanup function to remove the preload link
        return () => {
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, [options.condition, options.href, options.as, options.crossorigin]);
}

/**
 * Hook specifically for preloading bitcoin price data when tracking is about to start
 */
export function useBitcoinDataPreload(shouldPreload: boolean) {
    useConditionalPreload({
        href: '/data/bitcoin-price.json',
        as: 'fetch',
        condition: shouldPreload
    });
}