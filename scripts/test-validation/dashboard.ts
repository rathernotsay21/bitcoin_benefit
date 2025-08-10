#!/usr/bin/env node

/**
 * Test Infrastructure Health Dashboard
 * 
 * Comprehensive monitoring and reporting system that combines:
 * - Test file validation results
 * - Test health metrics and trends
 * - Performance monitoring
 * - Configuration status
 * - Actionable recommendations
 */

import { TestFileValidator, ValidationResult } from './test-file-validator';
import { TestHealthMonitor, TestHealthMetrics } from './test-health-monitor';
import { PreCommitHookSetup } from './pre-commit-setup';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface DashboardReport {
  timestamp: number;
  overall: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    summary: string;
  };
  validation: ValidationResult;
  health: TestHealthMetrics;
  infrastructure: {
    preCommitHooksInstalled: boolean;
    testRunnerConfigured: boolean;
    coverageEnabled: boolean;
    performanceTestsSetup: boolean;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    action: string;
  }[];
}

export class TestInfrastructureDashboard {
  private projectRoot: string;
  private validator: TestFileValidator;
  private healthMonitor: TestHealthMonitor;
  private hookSetup: PreCommitHookSetup;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.validator = new TestFileValidator(projectRoot);
    this.healthMonitor = new TestHealthMonitor(projectRoot);
    this.hookSetup = new PreCommitHookSetup(projectRoot);
  }

  async generateReport(): Promise<DashboardReport> {
    console.log('📊 Generating test infrastructure health report...');
    console.log('This may take a few minutes...\n');

    const timestamp = Date.now();

    // Run validation
    console.log('🔍 Step 1/4: Validating test files...');
    const validation = await this.validator.validateAllTestFiles();

    // Run health check
    console.log('🏥 Step 2/4: Analyzing test health...');
    const health = await this.healthMonitor.runHealthCheck();

    // Check infrastructure
    console.log('🔧 Step 3/4: Checking infrastructure...');
    const infrastructure = await this.checkInfrastructure();

    // Generate recommendations
    console.log('💡 Step 4/4: Generating recommendations...');
    const recommendations = this.generateRecommendations(validation, health, infrastructure);

    // Calculate overall status
    const overall = this.calculateOverallStatus(validation, health, infrastructure);

    return {
      timestamp,
      overall,
      validation,
      health,
      infrastructure,
      recommendations
    };
  }

  private async checkInfrastructure(): Promise<DashboardReport['infrastructure']> {
    const preCommitHookPath = join(this.projectRoot, '.git', 'hooks', 'pre-commit');
    const vitestConfigPath = join(this.projectRoot, 'vitest.config.ts');
    const packageJsonPath = join(this.projectRoot, 'package.json');

    let coverageEnabled = false;
    let performanceTestsSetup = false;

    try {
      const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf-8'));
      coverageEnabled = !!packageJson.scripts['test:coverage'];
      performanceTestsSetup = !!packageJson.scripts['test:performance'];
    } catch (error) {
      // Package.json not found or malformed
    }

    return {
      preCommitHooksInstalled: existsSync(preCommitHookPath),
      testRunnerConfigured: existsSync(vitestConfigPath),
      coverageEnabled,
      performanceTestsSetup
    };
  }

  private generateRecommendations(
    validation: ValidationResult,
    health: TestHealthMetrics,
    infrastructure: DashboardReport['infrastructure']
  ): DashboardReport['recommendations'] {
    const recommendations: DashboardReport['recommendations'] = [];

    // High priority: Critical errors
    if (validation.summary.filesWithErrors > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Validation',
        message: `${validation.summary.filesWithErrors} test files have critical errors`,
        action: 'Run "npm run test:validate" to see details and fix syntax errors'
      });
    }

    if (health.reliability.consistentlyFailing.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Reliability',
        message: `${health.reliability.consistentlyFailing.length} tests consistently failing`,
        action: 'Fix failing tests before they affect team productivity'
      });
    }

    if (health.overallHealth < 50) {
      recommendations.push({
        priority: 'high',
        category: 'Health',
        message: 'Test suite health is critically low',
        action: 'Address reliability and performance issues immediately'
      });
    }

    // Medium priority: Performance and quality
    if (health.reliability.flakyTests.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Reliability',
        message: `${health.reliability.flakyTests.length} flaky tests detected`,
        action: 'Investigate and stabilize intermittent test failures'
      });
    }

    if (health.performance.trend === 'degrading') {
      recommendations.push({
        priority: 'medium',
        category: 'Performance',
        message: 'Test performance is degrading over time',
        action: 'Optimize slow tests and consider parallel execution'
      });
    }

    if (health.coverage.current < 70) {
      recommendations.push({
        priority: 'medium',
        category: 'Coverage',
        message: `Test coverage is ${health.coverage.current.toFixed(1)}% (target: 70%+)`,
        action: 'Add tests for uncovered code paths'
      });
    }

    if (!infrastructure.preCommitHooksInstalled) {
      recommendations.push({
        priority: 'medium',
        category: 'Infrastructure',
        message: 'Pre-commit hooks not installed',
        action: 'Run "node scripts/test-validation/pre-commit-setup.js install"'
      });
    }

    // Low priority: Improvements
    if (validation.summary.filesWithWarnings > 0) {
      recommendations.push({
        priority: 'low',
        category: 'Quality',
        message: `${validation.summary.filesWithWarnings} test files have warnings`,
        action: 'Address warnings to improve code quality'
      });
    }

    if (!infrastructure.performanceTestsSetup) {
      recommendations.push({
        priority: 'low',
        category: 'Infrastructure',
        message: 'Performance testing not fully configured',
        action: 'Set up performance regression testing'
      });
    }

    if (health.performance.slowTests.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'Performance',
        message: `${health.performance.slowTests.length} slow tests identified`,
        action: 'Optimize tests taking longer than 1 second'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private calculateOverallStatus(
    validation: ValidationResult,
    health: TestHealthMetrics,
    infrastructure: DashboardReport['infrastructure']
  ): DashboardReport['overall'] {
    let score = 100;
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Validation impact
    if (validation.summary.filesWithErrors > 0) {
      score -= 30;
      status = 'critical';
    } else if (validation.summary.filesWithWarnings > 0) {
      score -= 10;
      if (status === 'healthy') status = 'warning';
    }

    // Health impact
    if (health.overallHealth < 50) {
      score -= 30;
      status = 'critical';
    } else if (health.overallHealth < 70) {
      score -= 15;
      if (status === 'healthy') status = 'warning';
    }

    // Infrastructure impact
    const infraScore = Object.values(infrastructure).filter(Boolean).length;
    const infraPenalty = (4 - infraScore) * 5;
    score -= infraPenalty;

    if (infraScore < 2) {
      if (status === 'healthy') status = 'warning';
    }

    score = Math.max(0, Math.min(100, score));

    const summary = this.generateStatusSummary(score, status, validation, health);

    return { status, score, summary };
  }

  private generateStatusSummary(
    score: number,
    status: string,
    validation: ValidationResult,
    health: TestHealthMetrics
  ): string {
    if (status === 'critical') {
      if (validation.summary.filesWithErrors > 0) {
        return `Critical: ${validation.summary.filesWithErrors} test files have syntax errors preventing execution`;
      }
      if (health.overallHealth < 50) {
        return `Critical: Test suite health is ${health.overallHealth}/100 - immediate attention required`;
      }
      return 'Critical issues detected requiring immediate attention';
    }

    if (status === 'warning') {
      const issues = [];
      if (validation.summary.filesWithWarnings > 0) {
        issues.push(`${validation.summary.filesWithWarnings} test files with warnings`);
      }
      if (health.reliability.flakyTests.length > 0) {
        issues.push(`${health.reliability.flakyTests.length} flaky tests`);
      }
      if (health.coverage.current < 70) {
        issues.push(`coverage at ${health.coverage.current.toFixed(1)}%`);
      }
      
      return issues.length > 0 
        ? `Warning: ${issues.join(', ')}`
        : 'Some issues detected but test suite is functional';
    }

    return `Healthy: Test infrastructure is in good condition (${score}/100)`;
  }

  static printReport(report: DashboardReport): void {
    const statusIcons = {
      healthy: '💚',
      warning: '💛',
      critical: '❤️'
    };

    console.log('\n🎯 TEST INFRASTRUCTURE HEALTH DASHBOARD');
    console.log('═══════════════════════════════════════════');
    
    // Overall status
    const statusIcon = statusIcons[report.overall.status];
    console.log(`${statusIcon} Overall Status: ${report.overall.status.toUpperCase()}`);
    console.log(`📊 Health Score: ${report.overall.score}/100`);
    console.log(`📝 Summary: ${report.overall.summary}`);

    // Validation section
    console.log('\n🔍 TEST FILE VALIDATION');
    console.log('─'.repeat(30));
    console.log(`Files checked: ${report.validation.summary.totalFiles}`);
    console.log(`Files with errors: ${report.validation.summary.filesWithErrors}`);
    console.log(`Files with warnings: ${report.validation.summary.filesWithWarnings}`);
    
    if (Object.keys(report.validation.summary.categoryCounts).length > 0) {
      console.log('Issue categories:');
      Object.entries(report.validation.summary.categoryCounts).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    }

    // Health section
    console.log('\n🏥 TEST SUITE HEALTH');
    console.log('─'.repeat(25));
    console.log(`Overall health: ${report.health.overallHealth}/100`);
    console.log(`Success rate: ${report.health.reliability.successRate.toFixed(1)}%`);
    console.log(`Average runtime: ${(report.health.performance.averageRunTime / 1000).toFixed(1)}s`);
    console.log(`Performance trend: ${report.health.performance.trend}`);
    console.log(`Coverage: ${report.health.coverage.current.toFixed(1)}%`);

    if (report.health.reliability.flakyTests.length > 0) {
      console.log(`Flaky tests: ${report.health.reliability.flakyTests.length}`);
    }

    // Infrastructure section
    console.log('\n🔧 INFRASTRUCTURE STATUS');
    console.log('─'.repeat(28));
    console.log(`Pre-commit hooks: ${report.infrastructure.preCommitHooksInstalled ? '✅' : '❌'}`);
    console.log(`Test runner: ${report.infrastructure.testRunnerConfigured ? '✅' : '❌'}`);
    console.log(`Coverage: ${report.infrastructure.coverageEnabled ? '✅' : '❌'}`);
    console.log(`Performance tests: ${report.infrastructure.performanceTestsSetup ? '✅' : '❌'}`);

    // Recommendations section
    console.log('\n💡 PRIORITY RECOMMENDATIONS');
    console.log('─'.repeat(32));
    
    if (report.recommendations.length === 0) {
      console.log('🎉 No recommendations - everything looks great!');
    } else {
      const priorityOrder = ['high', 'medium', 'low'] as const;
      
      priorityOrder.forEach(priority => {
        const priorityRecs = report.recommendations.filter(r => r.priority === priority);
        if (priorityRecs.length > 0) {
          const priorityIcon = priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️';
          console.log(`\n${priorityIcon} ${priority.toUpperCase()} PRIORITY:`);
          
          priorityRecs.forEach((rec, index) => {
            console.log(`  ${index + 1}. [${rec.category}] ${rec.message}`);
            console.log(`     → ${rec.action}`);
          });
        }
      });
    }

    // Quick actions section
    console.log('\n⚡ QUICK ACTIONS');
    console.log('─'.repeat(18));
    console.log('🔧 Fix test issues:     npm run test:fix-issues');
    console.log('✅ Validate tests:      npm run test:validate');
    console.log('🏥 Check health:        npm run test:health');
    console.log('🪝 Install hooks:       node scripts/test-validation/pre-commit-setup.js install');
    console.log('📊 Full report:         node scripts/test-validation/dashboard.js');

    console.log(`\n📅 Report generated: ${new Date(report.timestamp).toLocaleString()}`);
  }

  async saveReport(report: DashboardReport, filePath?: string): Promise<void> {
    const defaultPath = join(this.projectRoot, '.test-health', 'latest-report.json');
    const outputPath = filePath || defaultPath;
    
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(join(outputPath, '..'), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved to: ${outputPath}`);
    } catch (error) {
      console.warn('⚠️ Failed to save report:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async runMaintenanceMode(): Promise<void> {
    console.log('🔧 Running test infrastructure maintenance...\n');

    // Step 1: Install hooks if not present
    console.log('1️⃣ Checking pre-commit hooks...');
    await this.hookSetup.checkHookStatus();
    
    const preCommitHookPath = join(this.projectRoot, '.git', 'hooks', 'pre-commit');
    if (!existsSync(preCommitHookPath)) {
      console.log('Installing pre-commit hooks...');
      await this.hookSetup.setupHooks();
    }

    // Step 2: Fix common issues
    console.log('\n2️⃣ Fixing common test issues...');
    try {
      execSync('npm run test:fix-strings', { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.warn('⚠️ String fixing failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Step 3: Validate everything
    console.log('\n3️⃣ Running full validation...');
    const validation = await this.validator.validateAllTestFiles();
    TestFileValidator.printResults(validation);

    // Step 4: Generate health report
    console.log('\n4️⃣ Generating health report...');
    const report = await this.generateReport();
    TestInfrastructureDashboard.printReport(report);

    console.log('\n✨ Maintenance complete!');
  }
}

// CLI execution
if (require.main === module) {
  const dashboard = new TestInfrastructureDashboard();
  const command = process.argv[2];

  switch (command) {
    case 'report':
      dashboard.generateReport()
        .then(report => {
          TestInfrastructureDashboard.printReport(report);
          return dashboard.saveReport(report);
        })
        .then(() => {
          console.log('\n🎯 Dashboard complete!');
        })
        .catch(error => {
          console.error('❌ Dashboard failed:', error);
          process.exit(1);
        });
      break;

    case 'maintenance':
      dashboard.runMaintenanceMode()
        .catch(error => {
          console.error('❌ Maintenance failed:', error);
          process.exit(1);
        });
      break;

    case 'validate':
      dashboard.validator.validateAllTestFiles()
        .then(result => {
          TestFileValidator.printResults(result);
          process.exit(result.passed ? 0 : 1);
        })
        .catch(error => {
          console.error('❌ Validation failed:', error);
          process.exit(1);
        });
      break;

    case 'health':
      dashboard.healthMonitor.runHealthCheck()
        .then(metrics => {
          TestHealthMonitor.printHealthReport(metrics);
        })
        .catch(error => {
          console.error('❌ Health check failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log('🎯 Test Infrastructure Health Dashboard');
      console.log('');
      console.log('Usage:');
      console.log('  node dashboard.js report       # Generate full dashboard report');
      console.log('  node dashboard.js maintenance  # Run infrastructure maintenance');
      console.log('  node dashboard.js validate     # Quick validation only');
      console.log('  node dashboard.js health       # Health check only');
      console.log('');
      console.log('📋 The dashboard provides comprehensive monitoring of:');
      console.log('  • Test file validation and syntax checking');
      console.log('  • Test suite health and reliability metrics');
      console.log('  • Performance monitoring and trends');
      console.log('  • Infrastructure configuration status');
      console.log('  • Prioritized recommendations for improvements');
      break;
  }
}

export type { DashboardReport };
