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
          DEFAULT: '#F7931A',     // Primary Bitcoin Orange
          50: '#FFF4E0',          // Lightest
          100: '#FFE8C2',
          200: '#FFD485',
          300: '#FFC047',
          400: '#FFAA1A',
          500: '#F7931A',         // Main Bitcoin Orange
          600: '#DE8417',         // Slightly Darker Orange (for dark mode cards)
          700: '#C47014',
          800: '#A05C11',
          900: '#7D480E',
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
          DEFAULT: '#1A7EF7',     // Bright Blue (complementary)
          50: '#E8F2FF',
          100: '#D1E6FF',
          200: '#A3CDFF',
          300: '#75B4FF',
          400: '#479BFF',
          500: '#1A7EF7',         // Main Accent Blue
          600: '#0066DE',
          700: '#0052B3',
          800: '#003D87',
          900: '#00295C',
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundColor: {
        'dark-primary': '#0F172A', // Dark slate for dark mode background
        'dark-card': '#1E293B',    // Slightly lighter slate for cards
        'dark-button': '#F7931A',  // Bitcoin orange for buttons
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
