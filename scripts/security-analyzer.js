#!/usr/bin/env node

/**
 * Security Analysis Script for Bitcoin Benefit
 * 
 * This script analyzes the codebase for potential security issues:
 * - Unsafe TypeScript patterns
 * - Potential XSS vulnerabilities
 * - Insecure dependency usage
 * - Missing input validation
 * - Hardcoded secrets or credentials
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAnalyzer {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.info = [];
  }

  log(level, message, file = null, line = null) {
    const entry = { level, message, file, line, timestamp: new Date().toISOString() };
    
    switch (level) {
      case 'error':
        this.issues.push(entry);
        break;
      case 'warning':
        this.warnings.push(entry);
        break;
      case 'info':
        this.info.push(entry);
        break;
    }
    
    console.log(`[${level.toUpperCase()}] ${message}${file ? ` (${file}${line ? `:${line}` : ''})` : ''}`);
  }

  async analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const ext = path.extname(filePath);

    // Skip non-source files
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      return;
    }

    // Check for unsafe TypeScript patterns
    this.checkUnsafeTypeScriptPatterns(content, lines, filePath);
    
    // Check for potential XSS issues
    this.checkXSSVulnerabilities(content, lines, filePath);
    
    // Check for hardcoded secrets
    this.checkHardcodedSecrets(content, lines, filePath);
    
    // Check for insecure API usage
    this.checkInsecureAPIUsage(content, lines, filePath);
    
    // Check for missing input validation
    this.checkInputValidation(content, lines, filePath);
  }

  checkUnsafeTypeScriptPatterns(content, lines, filePath) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for explicit 'any' usage
      if (line.includes(': any') || line.includes('<any>') || line.includes('as any')) {
        this.log('warning', 'Explicit any type usage detected', filePath, lineNum);
      }
      
      // Check for non-null assertion operator misuse
      if (line.includes('!') && (line.includes('?.') || line.includes('!'))) {
        const nonNullAssertions = (line.match(/!/g) || []).length;
        if (nonNullAssertions > 1) {
          this.log('warning', 'Multiple non-null assertions on same line', filePath, lineNum);
        }
      }
      
      // Check for eval usage
      if (line.includes('eval(') || line.includes('Function(')) {
        this.log('error', 'Dangerous eval or Function constructor usage', filePath, lineNum);
      }
      
      // Check for setTimeout/setInterval with string
      if (/setTimeout\s*\(\s*["'`]/.test(line) || /setInterval\s*\(\s*["'`]/.test(line)) {
        this.log('error', 'setTimeout/setInterval with string argument (potential code injection)', filePath, lineNum);
      }
    });
  }

  checkXSSVulnerabilities(content, lines, filePath) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for dangerouslySetInnerHTML
      if (line.includes('dangerouslySetInnerHTML')) {
        this.log('warning', 'dangerouslySetInnerHTML usage detected - ensure content is sanitized', filePath, lineNum);
      }
      
      // Check for direct DOM manipulation
      if (line.includes('innerHTML') || line.includes('outerHTML')) {
        this.log('warning', 'Direct DOM innerHTML manipulation - potential XSS risk', filePath, lineNum);
      }
      
      // Check for unsanitized user input in URLs
      if (line.includes('window.location') && line.includes('+')) {
        this.log('warning', 'URL construction with concatenation - potential injection risk', filePath, lineNum);
      }
    });
  }

  checkHardcodedSecrets(content, lines, filePath) {
    const secretPatterns = [
      /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{10,}/i,
      /secret[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{10,}/i,
      /password["\s]*[:=]["\s]*[a-zA-Z0-9]{5,}/i,
      /token["\s]*[:=]["\s]*[a-zA-Z0-9]{10,}/i,
      /private[_-]?key["\s]*[:=]/i,
      /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
    ];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      secretPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.log('error', 'Potential hardcoded secret or credential detected', filePath, lineNum);
        }
      });
      
      // Check for Bitcoin private keys (simplified check)
      if (/[L|K|5][1-9A-HJ-NP-Za-km-z]{50,51}/.test(line)) {
        this.log('error', 'Potential Bitcoin private key detected', filePath, lineNum);
      }
    });
  }

  checkInsecureAPIUsage(content, lines, filePath) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for HTTP URLs in production code
      if (line.includes('http://') && !line.includes('localhost') && !line.includes('127.0.0.1')) {
        this.log('warning', 'HTTP URL detected - should use HTTPS in production', filePath, lineNum);
      }
      
      // Check for crypto usage without proper random
      if (line.includes('Math.random()') && filePath.includes('crypto')) {
        this.log('error', 'Math.random() used in crypto context - use crypto.getRandomValues()', filePath, lineNum);
      }
      
      // Check for localStorage usage with sensitive data
      if (line.includes('localStorage') && (line.includes('password') || line.includes('key') || line.includes('token'))) {
        this.log('warning', 'Sensitive data stored in localStorage - consider more secure storage', filePath, lineNum);
      }
    });
  }

  checkInputValidation(content, lines, filePath) {
    // Check for API routes without validation
    if (filePath.includes('/api/') || filePath.includes('api.')) {
      let hasValidation = false;
      
      if (content.includes('zod') || content.includes('.parse(') || content.includes('.safeParse(')) {
        hasValidation = true;
      }
      
      if (content.includes('export') && (content.includes('POST') || content.includes('PUT') || content.includes('PATCH'))) {
        if (!hasValidation) {
          this.log('warning', 'API route with mutation operations missing input validation', filePath);
        }
      }
    }
    
    // Check for form inputs without validation
    if (content.includes('useForm') || content.includes('react-hook-form')) {
      if (!content.includes('zodResolver') && !content.includes('yupResolver')) {
        this.log('warning', 'Form without schema validation detected', filePath);
      }
    }
  }

  async analyzeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, .next, etc.
        if (!['node_modules', '.git', '.next', 'out', 'dist', 'build'].includes(item)) {
          await this.analyzeDirectory(fullPath);
        }
      } else {
        await this.analyzeFile(fullPath);
      }
    }
  }

  async analyzeDependencies() {
    try {
      console.log('\\n=== Analyzing Dependencies ===');
      
      // Run npm audit
      try {
        execSync('npm audit --json', { stdio: 'pipe' });
        this.log('info', 'No npm audit vulnerabilities found');
      } catch (error) {
        const output = error.stdout?.toString();
        if (output) {
          try {
            const auditResult = JSON.parse(output);
            if (auditResult.vulnerabilities) {
              Object.entries(auditResult.vulnerabilities).forEach(([pkg, vuln]) => {
                this.log('error', `Dependency vulnerability: ${pkg} - ${vuln.title}`, 'package.json');
              });
            }
          } catch (parseError) {
            this.log('warning', 'Could not parse npm audit output');
          }
        }
      }
      
      // Check for outdated dependencies
      try {
        const outdated = execSync('npm outdated --json', { stdio: 'pipe' }).toString();
        const outdatedPkgs = JSON.parse(outdated);
        
        Object.entries(outdatedPkgs).forEach(([pkg, info]) => {
          const majorUpdate = info.wanted !== info.latest;
          if (majorUpdate) {
            this.log('warning', `Major version update available: ${pkg} ${info.current} -> ${info.latest}`, 'package.json');
          }
        });
      } catch (error) {
        // npm outdated returns non-zero exit code when there are outdated packages
        // This is expected behavior
      }
      
    } catch (error) {
      this.log('warning', `Dependency analysis failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\\n=== Security Analysis Report ===\\n');
    
    console.log(`📊 Summary:`);
    console.log(`   🔴 Issues: ${this.issues.length}`);
    console.log(`   🟡 Warnings: ${this.warnings.length}`);
    console.log(`   🔵 Info: ${this.info.length}`);
    
    if (this.issues.length > 0) {
      console.log('\\n🔴 Critical Issues:');
      this.issues.forEach(issue => {
        console.log(`   • ${issue.message}${issue.file ? ` (${issue.file}${issue.line ? `:${issue.line}` : ''})` : ''}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\\n🟡 Warnings:');
      this.warnings.forEach(warning => {
        console.log(`   • ${warning.message}${warning.file ? ` (${warning.file}${warning.line ? `:${warning.line}` : ''})` : ''}`);
      });
    }
    
    // Security recommendations
    console.log('\\n📋 Security Recommendations:');
    console.log('   1. Run security scan regularly: npm run security:check');
    console.log('   2. Keep dependencies updated: npm run security:update-deps');
    console.log('   3. Review and fix any critical issues above');
    console.log('   4. Implement proper input validation for all user inputs');
    console.log('   5. Use environment variables for sensitive configuration');
    console.log('   6. Enable all TypeScript strict mode options');
    console.log('   7. Regular security audits of the entire codebase');
    
    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        issues: this.issues.length,
        warnings: this.warnings.length,
        info: this.info.length
      },
      issues: this.issues,
      warnings: this.warnings,
      info: this.info
    };
    
    fs.writeFileSync('security/security-analysis-report.json', JSON.stringify(report, null, 2));
    console.log('\\n📄 Detailed report saved to: security/security-analysis-report.json');
    
    return this.issues.length === 0;
  }

  async run() {
    console.log('🔒 Starting Security Analysis for Bitcoin Benefit...');
    
    // Analyze source code
    console.log('\\n=== Analyzing Source Code ===');
    await this.analyzeDirectory('./src');
    
    // Analyze scripts
    console.log('\\n=== Analyzing Scripts ===');
    await this.analyzeDirectory('./scripts');
    
    // Analyze dependencies
    await this.analyzeDependencies();
    
    // Generate report
    const success = this.generateReport();
    
    if (!success) {
      console.log('\\n❌ Security analysis found critical issues that need attention.');
      process.exit(1);
    } else {
      console.log('\\n✅ Security analysis completed successfully.');
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new SecurityAnalyzer();
  analyzer.run().catch(error => {
    console.error('Security analysis failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityAnalyzer;