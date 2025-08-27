/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
  plugins: [
    require('@tailwindcss/forms'), // Install with: npm install @tailwindcss/forms
  ],
}
