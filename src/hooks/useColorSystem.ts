/**
 * React Hook for Color System
 * Provides easy access to standardized colors and utilities
 */

import { useTheme } from '@/components/ThemeProvider';
import { 
  getColor, 
  getBitcoinColor, 
  getAccentColor, 
  getNeutralColor,
  colorClasses,
  type ColorToken,
  type BitcoinShade,
  type AccentShade,
  type NeutralShade
} from '@/lib/theme/colors';

/**
 * Hook to access the color system
 */
export function useColorSystem() {
  const { theme } = useTheme();
  const currentTheme = theme as 'light' | 'dark';

  /**
   * Get a color value by token
   */
  const getThemeColor = (token: ColorToken) => {
    return getColor(token, currentTheme);
  };

  /**
   * Get CSS classes for common patterns
   */
  const getColorClasses = (variant: 'primary' | 'secondary' | 'muted' | 'card') => {
    return colorClasses[variant];
  };

  /**
   * Get button classes based on variant
   */
  const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' | 'outline' = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'bg-bitcoin text-white hover:bg-bitcoin-600 focus-visible:ring-bitcoin';
      case 'secondary':
        return 'bg-accent text-white hover:bg-accent-600 focus-visible:ring-accent';
      case 'ghost':
        return 'hover:bg-accent/10 hover:text-accent';
      case 'outline':
        return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      default:
        return 'bg-bitcoin text-white hover:bg-bitcoin-600';
    }
  };

  /**
   * Get text color classes with proper contrast
   */
  const getTextClasses = (variant: 'primary' | 'muted' | 'bitcoin' | 'accent' = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'text-gray-900 dark:text-gray-100';
      case 'muted':
        return 'text-gray-700 dark:text-gray-300';
      case 'bitcoin':
        return 'text-bitcoin dark:text-bitcoin';
      case 'accent':
        return 'text-accent dark:text-accent';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  /**
   * Get background color classes
   */
  const getBackgroundClasses = (variant: 'primary' | 'card' | 'muted' | 'bitcoin' | 'accent' = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'bg-white dark:bg-slate-900';
      case 'card':
        return 'bg-white dark:bg-slate-800';
      case 'muted':
        return 'bg-gray-50 dark:bg-slate-800';
      case 'bitcoin':
        return 'bg-bitcoin-50 dark:bg-bitcoin-900/20';
      case 'accent':
        return 'bg-accent-50 dark:bg-accent-900/20';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  /**
   * Get border color classes
   */
  const getBorderClasses = (variant: 'default' | 'bitcoin' | 'accent' | 'muted' = 'default') => {
    switch (variant) {
      case 'bitcoin':
        return 'border-bitcoin-200 dark:border-bitcoin-800';
      case 'accent':
        return 'border-accent-200 dark:border-accent-800';
      case 'muted':
        return 'border-gray-300 dark:border-gray-600';
      default:
        return 'border-gray-200 dark:border-slate-700';
    }
  };

  /**
   * Get semantic color classes
   */
  const getSemanticClasses = (type: 'success' | 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
        };
    }
  };

  return {
    // Current theme
    theme: currentTheme,
    
    // Color getters
    getThemeColor,
    getBitcoinColor,
    getAccentColor,
    getNeutralColor,
    
    // Class getters
    getColorClasses,
    getButtonClasses,
    getTextClasses,
    getBackgroundClasses,
    getBorderClasses,
    getSemanticClasses,
    
    // Preset class combinations
    classes: {
      primaryButton: getButtonClasses('primary'),
      secondaryButton: getButtonClasses('secondary'),
      primaryText: getTextClasses('primary'),
      mutedText: getTextClasses('muted'),
      bitcoinHighlight: 'text-bitcoin bg-bitcoin-50 dark:bg-bitcoin-900/20',
      card: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
    },
  };
}

export type UseColorSystemReturn = ReturnType<typeof useColorSystem>;