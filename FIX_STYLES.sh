#!/bin/bash

echo "=== FIXING BITCOIN BENEFIT STYLES ==="
echo ""
echo "This script will fix the style loading issues."
echo ""

# Instructions for manual fix
cat << 'EOF'
MANUAL FIX INSTRUCTIONS:
------------------------

1. RESTART YOUR DEVELOPMENT SERVER:
   Stop your current dev server (Ctrl+C)
   Run: npm run dev
   
2. CLEAR YOUR BROWSER CACHE:
   - Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Safari: Cmd+Option+E then Cmd+R
   - Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. IF STYLES STILL DON'T LOAD:
   a. Open Terminal in the project directory
   b. Run these commands:
      rm -rf .next
      rm -rf node_modules/.cache
      npm run build
      npm run dev
   
4. VERIFY THE FOLLOWING COLORS:
   - Background: Light Grey (#F4F6F8) - NOT white
   - Cards: Off-White (#FAFAFA) - NOT pure white
   - Text: Deep Slate Blue (#1E2A3A)
   - Primary/Accent: Bitcoin Orange (#F7931A)

5. CHECK DARK MODE:
   Toggle dark mode with the sun/moon icon
   Background should be dark slate, not black

The following files have been updated:
- tailwind.config.js (color definitions)
- src/app/globals.css (all styles)
- src/app/layout.tsx (critical CSS)
- All component files (color classes)

If you see this after restart:
✅ Light grey background everywhere
✅ No pure white cards or buttons
✅ Consistent Bitcoin orange accents
✅ Deep blue text color

Then the fix was successful!

TROUBLESHOOTING:
- If you see white backgrounds, the CSS isn't compiling
- If you see no styles at all, Tailwind might need rebuilding
- Contact support if issues persist

EOF

echo ""
echo "Please follow the instructions above to complete the fix."
echo ""
