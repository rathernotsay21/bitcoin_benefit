# Security Runbook

This runbook provides step-by-step procedures for managing security updates and incidents in the Bitcoin Benefit platform.

## Daily Security Operations

### 1. Morning Security Check

Run the comprehensive security check:

```bash
npm run security:check
```

This command will:
- Check for outdated dependencies
- Run npm audit for vulnerabilities
- Display a summary of security status

### 2. Weekly Security Review

Every Monday, perform a full security review:

```bash
# Full security scan
npm run security:full-scan

# Generate fresh SBOM
npm run security:sbom

# Check licenses
npm run security:licenses

# Validate lockfile
npm run security:lockfile-lint
```

## Handling Security Updates

### 1. Automated Dependabot Updates

When Dependabot creates a PR:

1. **Review the PR description** for breaking changes
2. **Check the changelog** of the updated package
3. **Run tests locally**:
   ```bash
   npm ci
   npm test
   npm run build
   ```
4. **Review security impact** if it's a security update
5. **Merge if all checks pass**

### 2. Manual Security Updates

For urgent security updates:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm run security:fix

# For issues requiring manual intervention
npm run security:fix-force

# Verify the fix
npm audit
npm test
```

### 3. Major Version Updates

For major version updates requiring manual review:

1. **Create a feature branch**:
   ```bash
   git checkout -b security/update-package-name
   ```

2. **Update the dependency**:
   ```bash
   npm install package-name@latest
   ```

3. **Test thoroughly**:
   ```bash
   npm test
   npm run build
   npm run type-check
   ```

4. **Check for breaking changes** in documentation
5. **Update code** if necessary
6. **Create PR** with detailed description

## Security Incident Response

### 1. Immediate Response (0-1 hours)

1. **Assess the threat**:
   - Is it affecting production?
   - What's the potential impact?
   - Is user data at risk?

2. **Contain the issue**:
   ```bash
   # If it's a dependency issue, temporarily pin the version
   npm install package-name@safe-version --save-exact
   
   # Deploy the fix immediately
   npm run build:safe
   npm run deploy
   ```

3. **Document the incident**:
   - Create an incident report
   - Track all actions taken
   - Note timeline of events

### 2. Investigation Phase (1-4 hours)

1. **Analyze the vulnerability**:
   ```bash
   # Check what's affected
   npm audit --json > incident-audit.json
   
   # Generate SBOM for analysis
   npm run security:sbom
   ```

2. **Determine scope**:
   - Which parts of the application are affected?
   - Are there any data breaches?
   - What user actions might be compromised?

3. **Develop mitigation strategy**:
   - Immediate fixes
   - Long-term solutions
   - Communication plan

### 3. Resolution Phase (4-24 hours)

1. **Implement fixes**:
   ```bash
   # Update to secure versions
   npm run security:update-deps
   
   # Test extensively
   npm test
   npm run test:performance
   
   # Build and deploy
   npm run build:safe
   npm run deploy
   ```

2. **Verify the fix**:
   ```bash
   # Ensure no vulnerabilities remain
   npm audit
   
   # Run full security scan
   npm run security:full-scan
   ```

3. **Update monitoring**:
   - Add new security checks if needed
   - Update alerting rules
   - Document lessons learned

## Security Monitoring

### 1. Automated Monitoring

The following automated systems monitor security:

- **GitHub Dependabot**: Dependency updates
- **GitHub Security Advisories**: Vulnerability alerts
- **Snyk**: Continuous monitoring
- **npm audit**: Daily checks via CI/CD

### 2. Manual Monitoring

Weekly tasks:

```bash
# Check for new security advisories
npm audit

# Review Snyk dashboard (if configured)
# Check GitHub security tab

# Review dependency licenses
npm run security:licenses

# Validate all security tools are working
npm run security:full-scan
```

## Security Configuration Management

### 1. Updating Security Tools

Keep security tools up to date:

```bash
# Update npm to latest version
npm install -g npm@latest

# Update security scanning tools
npm update @cyclonedx/cyclonedx-npm
npm update license-checker
npm update lockfile-lint
```

### 2. Security Configuration Files

Key files to maintain:

- `.npmrc`: npm security settings
- `.snyk`: Snyk configuration
- `.github/dependabot.yml`: Dependabot settings
- `.github/workflows/security.yml`: Security CI/CD
- `security/SECURITY.md`: Security policy

### 3. Environment Security

Production environment security:

```bash
# Ensure production builds don't include dev dependencies
NODE_ENV=production npm ci --omit=dev

# Verify build security
npm run build
node scripts/verify-css-build.js
```

## Emergency Contacts and Escalation

### 1. Internal Escalation

1. **Developer Team**: First line of defense
2. **Security Team**: For critical vulnerabilities
3. **Management**: For business impact assessment

### 2. External Resources

- **npm Security Team**: security@npmjs.com
- **GitHub Security**: security@github.com
- **Snyk Support**: support@snyk.io

### 3. Communication Templates

#### Security Advisory Template

```markdown
# Security Advisory: [CVE-ID or Internal ID]

## Summary
Brief description of the vulnerability.

## Impact
What systems/users are affected.

## Timeline
- Discovery: [Date/Time]
- Initial Response: [Date/Time]
- Fix Deployed: [Date/Time]
- All Clear: [Date/Time]

## Actions Taken
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Lessons Learned
What we learned and how we're improving.
```

## Security Metrics and KPIs

Track these security metrics:

1. **Time to patch vulnerabilities**
2. **Number of vulnerabilities detected**
3. **Dependency update frequency**
4. **Security test coverage**
5. **False positive rate**

Generate monthly security reports:

```bash
# Generate security metrics
npm run security:full-scan > security-report-$(date +%Y-%m).txt
```

## Recovery Procedures

### 1. Rollback Procedures

If a security update breaks functionality:

```bash
# Rollback to previous version
git revert [commit-hash]

# Redeploy
npm run build:safe
npm run deploy

# Verify functionality
npm test
```

### 2. Data Recovery

If security incident affects data:

1. **Stop all operations**
2. **Assess data integrity**
3. **Restore from clean backup**
4. **Verify restoration**
5. **Resume operations**

---

*This runbook should be reviewed and updated quarterly. Last updated: 2025-01-22*