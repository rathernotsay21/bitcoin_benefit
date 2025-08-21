# Bitcoin Benefit Style Fix Guide

## Issue
The styles are not loading properly, causing white backgrounds instead of the intended color scheme.

## Quick Fix Steps

### 1. Stop your development server
Press `Ctrl+C` (or `Cmd+C` on Mac) in the terminal where the server is running

### 2. Clear Next.js cache
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### 3. Rebuild the application
```bash
npm run build
```

### 4. Start the development server
```bash
npm run dev
```

### 5. Hard refresh your browser
- **Chrome/Edge**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- **Safari**: `Cmd+Option+E` then `Cmd+R`
- **Firefox**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

## Verify the Fix

After following these steps, you should see:

✅ **Light Grey Background** (#F4F6F8) - Not white  
✅ **Off-White Cards** (#FAFAFA) - Not pure white  
✅ **Deep Slate Blue Text** (#1E2A3A)  
✅ **Bitcoin Orange Accents** (#F7931A)  
✅ **Consistent styling** across all pages  

## Color Palette Reference

- **Primary/Accent**: `#F7931A` (Bitcoin Orange)
- **Text & Dark Elements**: `#1E2A3A` (Deep Slate Blue)  
- **Site Background**: `#F4F6F8` (Light Grey)
- **Card Backgrounds**: `#FAFAFA` (Off-White)
- **Buttons/Links**: `#F7931A` (Bitcoin Orange)

## Files Updated

All necessary files have been updated with the new color scheme:
- `tailwind.config.js` - Color definitions
- `src/app/globals.css` - Global styles
- `src/app/layout.tsx` - Critical CSS
- All component files - Color classes

## Troubleshooting

If styles still don't load:

1. **Check Node/npm installation**:
   ```bash
   node --version
   npm --version
   ```

2. **Reinstall dependencies**:
   ```bash
   npm install
   ```

3. **Check for build errors**:
   ```bash
   npm run build
   ```
   Look for any error messages in the output

4. **Verify Tailwind is processing**:
   Check that the `.next/static/css` folder contains CSS files after building

5. **Use production build locally**:
   ```bash
   npm run build
   npm run start
   ```
   This will run the production build locally to verify styles work

## Alternative: Force Reload in Browser

If the above doesn't work:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Refresh the page

## Contact Support

If issues persist after trying all steps, the problem may be with the local development environment.
