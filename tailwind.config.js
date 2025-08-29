/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1200px',  // Custom breakpoint for navigation collapse
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Refined color palette for consistency
        bitcoin: {
          DEFAULT: '#f2a900',     // Bitcoin Industry Standard Orange
          50: '#FFF9E6',          // Lightest - recalculated for #f2a900
          100: '#FFF0B3',
          200: '#FFE580',
          300: '#FFD94D',
          400: '#FFCB1A',
          500: '#f2a900',         // Main Bitcoin Orange - Industry Standard
          600: '#D99500',         // Slightly Darker Orange
          700: '#B37E00',
          800: '#8C6300',
          900: '#664700',
        },
        deepSlate: {
          DEFAULT: '#1E2A3A',     // Deep Slate Blue for text
        },
        lightGrey: {
          DEFAULT: '#F4F6F8',     // Light Grey for site background  
        },
        offWhite: {
          DEFAULT: '#FAFAFA',      // Off-White for cards/buttons
        },
        slate: {
          DEFAULT: '#2D3748',     // Dark Slate
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',         // Main Dark Slate
          800: '#1A202C',         // Darker Slate
          900: '#171923',
        },
        accent: {
          DEFAULT: '#3b82f6',     // Consistent Blue for Secondary Actions
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3b82f6',         // Main Secondary Action Blue
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        neutral: {
          DEFAULT: '#FAFAFA',     // Off-White
          50: '#FAFAFA',          // Off-White for cards
          100: '#F4F6F8',         // Light Grey background
          200: '#F1F3F5',
          300: '#E9ECEF',
          400: '#DEE2E6',
          500: '#CED4DA',
          600: '#ADB5BD',
          700: '#868E96',
          800: '#495057',
          900: '#212529',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "0.125rem",  // 2px - keeping all consistent with sm
        md: "0.125rem",  // 2px - keeping all consistent with sm  
        sm: "0.125rem",  // 2px - standard Tailwind sm value
      },
      backgroundColor: {
        'dark-primary': '#0F172A', // Dark slate for dark mode background
        'dark-card': '#1E293B',    // Slightly lighter slate for cards
        'dark-button': '#f2a900',  // Bitcoin orange for buttons - industry standard
      },
      textColor: {
        'dark-primary': '#F8FAFC', // Light slate for dark mode text
      },
      borderColor: {
        'dark-primary': '#334155', // Medium slate for borders
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
        display: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        'bitcoin-symbols': ['Bitcoin Symbols', 'Inter Variable', 'Inter', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'sans-serif'],
      },
      fontSize: {
        // Modular Scale Typography (1.333 ratio) with Fluid Sizing
        'caption': ['var(--font-size-caption)', {
          lineHeight: 'var(--line-height-normal)',
          letterSpacing: '0',
        }],
        'body': ['var(--font-size-body)', {
          lineHeight: 'var(--line-height-relaxed)',
          letterSpacing: '0.01em',
        }],
        'base': ['var(--font-size-base)', {
          lineHeight: 'var(--line-height-normal)',
          letterSpacing: '0',
        }],
        'lead': ['var(--font-size-lead)', {
          lineHeight: 'var(--line-height-relaxed)',
          letterSpacing: '0',
        }],
        'lg': ['var(--font-size-lg)', {
          lineHeight: 'var(--line-height-normal)',
          letterSpacing: '0',
        }],
        'xl': ['var(--font-size-xl)', {
          lineHeight: 'var(--line-height-snug)',
          letterSpacing: '-0.01em',
        }],
        '2xl': ['var(--font-size-2xl)', {
          lineHeight: 'var(--line-height-snug)',
          letterSpacing: '-0.015em',
        }],
        '3xl': ['var(--font-size-3xl)', {
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: '-0.02em',
        }],
        '4xl': ['var(--font-size-4xl)', {
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: '-0.025em',
        }],
        '5xl': ['var(--font-size-5xl)', {
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: '-0.025em',
        }],
        '6xl': ['var(--font-size-6xl)', {
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: '-0.025em',
        }],
        'display': ['var(--font-size-display)', {
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: '-0.025em',
          fontWeight: '700',
        }],
        // Legacy sizes for backward compatibility
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      },
      fontWeight: {
        thin: 'var(--font-weight-thin)',
        extralight: 'var(--font-weight-extralight)',
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
        black: 'var(--font-weight-black)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        snug: 'var(--line-height-snug)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
        loose: 'var(--line-height-loose)',
      },
      letterSpacing: {
        tighter: 'var(--letter-spacing-tighter)',
        tight: 'var(--letter-spacing-tight)',
        normal: 'var(--letter-spacing-normal)',
        wide: 'var(--letter-spacing-wide)',
        wider: 'var(--letter-spacing-wider)',
        widest: 'var(--letter-spacing-widest)',
      },
      textColor: {
        // Theme-aware text colors
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        subtle: 'var(--text-subtle)',
        inverse: 'var(--text-inverse)',
        // Brand colors
        bitcoin: 'var(--text-bitcoin)',
        'bitcoin-dark': 'var(--text-bitcoin-dark)',
        accent: 'var(--text-accent)',
        success: 'var(--text-success)',
        warning: 'var(--text-warning)',
        error: 'var(--text-error)',
        // Legacy colors
        'dark-primary': '#F8FAFC',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  safelist: [
    // Typography heading classes
    'heading-display',
    'heading-1',
    'heading-2', 
    'heading-3',
    'heading-4',
    'heading-5',
    'heading-6',
    // Body text classes
    'body-large',
    'body-normal',
    'body-small',
    // Special text classes
    'label',
    'caption',
    'overline',
    // Color classes
    'text-primary',
    'text-secondary',
    'text-muted',
    'text-subtle',
    'text-inverse',
    'text-bitcoin',
    'text-bitcoin-dark',
    'text-accent',
    'text-success',
    'text-warning',
    'text-error',
  ],
  plugins: [
    require('@tailwindcss/forms'), // Install with: npm install @tailwindcss/forms
    require('@tailwindcss/container-queries'), // Container query support
    // Typography plugin with custom configuration
    function({ addUtilities, addComponents, theme }) {
      // Add fluid typography utilities
      addUtilities({
        '.text-fluid-sm': {
          fontSize: 'clamp(0.875rem, 0.8125rem + 0.3125vw, 1rem)',
          lineHeight: 'var(--line-height-normal)',
        },
        '.text-fluid-base': {
          fontSize: 'clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)',
          lineHeight: 'var(--line-height-normal)',
        },
        '.text-fluid-lg': {
          fontSize: 'clamp(1.125rem, 1.0625rem + 0.3125vw, 1.25rem)',
          lineHeight: 'var(--line-height-snug)',
        },
        '.text-fluid-xl': {
          fontSize: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.625rem)',
          lineHeight: 'var(--line-height-snug)',
        },
        '.text-fluid-2xl': {
          fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)',
          lineHeight: 'var(--line-height-tight)',
        },
        '.text-fluid-3xl': {
          fontSize: 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
          lineHeight: 'var(--line-height-tight)',
        },
        '.text-fluid-4xl': {
          fontSize: 'clamp(2.25rem, 1.875rem + 1.875vw, 3.75rem)',
          lineHeight: 'var(--line-height-tight)',
        },
        '.text-fluid-display': {
          fontSize: 'clamp(3rem, 2rem + 5vw, 6rem)',
          lineHeight: 'var(--line-height-tight)',
          fontWeight: 'var(--font-weight-bold)',
        },
      });
      
      // Add typography component classes
      addComponents({
        '.typography-container': {
          containerType: 'inline-size',
        },
        '.heading-display': {
          fontSize: 'var(--font-size-display)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--text-primary)',
        },
        '.heading-section': {
          fontSize: 'var(--font-size-4xl)',
          fontWeight: 'var(--font-weight-semibold)',
          lineHeight: 'var(--line-height-snug)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--text-primary)',
        },
        '.body-large': {
          fontSize: 'var(--font-size-lead)',
          lineHeight: 'var(--line-height-relaxed)',
          color: 'var(--text-secondary)',
        },
        '.body-normal': {
          fontSize: 'var(--font-size-base)',
          lineHeight: 'var(--line-height-relaxed)',
          color: 'var(--text-secondary)',
        },
        '.caption-text': {
          fontSize: 'var(--font-size-caption)',
          lineHeight: 'var(--line-height-normal)',
          color: 'var(--text-muted)',
          fontWeight: 'var(--font-weight-medium)',
        },
        '.bitcoin-amount': {
          fontFamily: 'var(--font-family-sans)',
          fontVariantNumeric: 'tabular-nums slashed-zero',
          fontFeatureSettings: '"tnum" on, "zero" on',
          letterSpacing: '0.025em',
        },
        '.bitcoin-symbol': {
          fontFamily: 'var(--font-family-sans)',
          fontFeatureSettings: '"liga" on, "kern" on',
          fontVariantLigatures: 'common-ligatures',
        },
      });
    },
  ],
};
