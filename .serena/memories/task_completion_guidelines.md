# Bitcoin Benefit - Task Completion Guidelines

## Required Commands After Code Changes

### 1. Type Checking
```bash
npm run type-check
```
- **Always run** after TypeScript changes
- Ensures no type errors before committing
- Uses strict TypeScript configuration

### 2. Linting
```bash
npm run lint
```
- **Always run** after code changes
- Follows Next.js core web vitals standards
- Catches React hooks violations and other issues

### 3. Testing
```bash
# Run all tests
npm test

# Run specific test suites if changed
npm run test:performance      # For performance-critical changes
npm run benchmark            # For calculation engine changes
```

### 4. Build Verification
```bash
npm run build
```
- **Always run** for significant changes
- Verifies production build works
- Catches build-time errors

## Pre-Commit Checklist
1. ✅ Type check passes (`npm run type-check`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ Tests pass (`npm test`)
4. ✅ Build succeeds (`npm run build`)
5. ✅ Performance tests pass (if applicable)

## Specific Workflows

### Calculator Changes
- Run `npm run benchmark` to verify calculation performance
- Test with different vesting schemes
- Verify chart rendering with new data

### Component Changes
- Run visual regression tests
- Check responsive design
- Verify accessibility compliance

### Data/API Changes
- Update Bitcoin data if needed (`npm run update-bitcoin-data`)
- Test API endpoints
- Verify caching behavior

### Performance Changes
- Run `npm run validate:optimizations`
- Check bundle size with `npm run build:analyze`
- Monitor Core Web Vitals

## Deployment Preparation
```bash
# Final verification before deployment
npm run type-check && npm run lint && npm test && npm run build
```

## Git Workflow
1. Create feature branch
2. Make changes
3. Run completion checklist
4. Commit changes
5. Push and create PR
6. Verify Netlify preview build