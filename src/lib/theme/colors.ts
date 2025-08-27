/**
 * Centralized Color Management System
 * Provides TypeScript interfaces and utilities for consistent color usage
 */

/**
 * Bitcoin color scale based on industry standard #f2a900
 */
export const bitcoinColors = {
  DEFAULT: '#f2a900',
  50: '#FFF9E6',
  100: '#FFF0B3',
  200: '#FFE580',
  300: '#FFD94D',
  400: '#FFCB1A',
  500: '#f2a900', // Industry Standard
  600: '#D99500',
  700: '#B37E00',
  800: '#8C6300',
  900: '#664700',
} as const;

/**
 * Secondary/Accent colors for actions
 */
export const accentColors = {
  DEFAULT: '#3b82f6',
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3b82f6', // Primary Blue
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
} as const;

/**
 * Neutral colors for text and backgrounds
 */
export const neutralColors = {
  50: '#FAFAFA',
  100: '#F4F6F8',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

/**
 * Semantic color mappings
 */
export const semanticColors = {
  success: {
    light: '#10B981',
    dark: '#34D399',
  },
  warning: {
    light: '#F59E0B',
    dark: '#FBB041',
  },
  error: {
    light: '#EF4444',
    dark: '#F87171',
  },
  info: {
    light: '#3B82F6',
    dark: '#60A5FA',
  },
} as const;

/**
 * Theme color tokens
 */
export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  bitcoin: string;
  bitcoinHover: string;
  accent: string;
  accentHover: string;
}

/**
 * Light theme colors
 */
export const lightTheme: ThemeColors = {
  primary: bitcoinColors.DEFAULT,
  primaryHover: bitcoinColors[600],
  secondary: accentColors.DEFAULT,
  secondaryHover: accentColors[600],
  background: '#FFFFFF',
  card: '#FAFAFA',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  bitcoin: bitcoinColors.DEFAULT,
  bitcoinHover: bitcoinColors[600],
  accent: accentColors.DEFAULT,
  accentHover: accentColors[600],
};

/**
 * Dark theme colors
 */
export const darkTheme: ThemeColors = {
  primary: bitcoinColors.DEFAULT,
  primaryHover: bitcoinColors[600],
  secondary: accentColors.DEFAULT,
  secondaryHover: accentColors[600],
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#9CA3AF',
  border: '#334155',
  bitcoin: bitcoinColors.DEFAULT,
  bitcoinHover: bitcoinColors[600],
  accent: accentColors.DEFAULT,
  accentHover: accentColors[600],
};

/**
 * Color usage guidelines
 */
export const colorGuidelines = {
  primary: 'Use for primary CTAs, important buttons, and key brand elements',
  secondary: 'Use for secondary actions, less prominent buttons',
  text: 'Use for main body text and headings',
  textMuted: 'Use for secondary text, descriptions, and help text',
  bitcoin: 'Use specifically for Bitcoin-related elements and highlights',
  accent: 'Use for interactive elements and secondary actions',
  success: 'Use for success states and positive actions',
  warning: 'Use for warning states and caution messages',
  error: 'Use for error states and destructive actions',
} as const;

/**
 * Get color value by token name
 */
export function getColor(
  token: keyof ThemeColors,
  theme: 'light' | 'dark' = 'light'
): string {
  return theme === 'dark' ? darkTheme[token] : lightTheme[token];
}

/**
 * Get Bitcoin color by shade
 */
export function getBitcoinColor(shade: keyof typeof bitcoinColors): string {
  return bitcoinColors[shade];
}

/**
 * Get accent color by shade
 */
export function getAccentColor(shade: keyof typeof accentColors): string {
  return accentColors[shade];
}

/**
 * Get neutral color by shade
 */
export function getNeutralColor(shade: keyof typeof neutralColors): string {
  return neutralColors[shade];
}

/**
 * Color class mappings for Tailwind
 */
export const colorClasses = {
  primary: {
    bg: 'bg-bitcoin',
    hover: 'hover:bg-bitcoin-600',
    text: 'text-bitcoin',
    border: 'border-bitcoin',
  },
  secondary: {
    bg: 'bg-accent',
    hover: 'hover:bg-accent-600',
    text: 'text-accent',
    border: 'border-accent',
  },
  muted: {
    text: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-800',
  },
  card: {
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-gray-200 dark:border-slate-700',
  },
} as const;

/**
 * Export all color constants for use in components
 */
export const colors = {
  bitcoin: bitcoinColors,
  accent: accentColors,
  neutral: neutralColors,
  semantic: semanticColors,
  light: lightTheme,
  dark: darkTheme,
  guidelines: colorGuidelines,
  classes: colorClasses,
} as const;

export type ColorToken = keyof ThemeColors;
export type BitcoinShade = keyof typeof bitcoinColors;
export type AccentShade = keyof typeof accentColors;
export type NeutralShade = keyof typeof neutralColors;