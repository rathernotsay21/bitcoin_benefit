#!/usr/bin/env node

/**
 * Test Health Monitor
 * 
 * Tracks and analyzes test reliability, performance, and health metrics:
 * - Test execution times and trends
 * - Flaky test detection
 * - Coverage trends
 * - Performance regression detection
 * - Test suite health scoring
 */

import { execSync } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  file: string;
}

interface TestRun {
  timestamp: number;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage?: CoverageData;
  results: TestResult[];
  environment: {
    nodeVersion: string;
    platform: string;
    ci: boolean;
  };
}

interface CoverageData {
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
}

interface TestHealthMetrics {
  overallHealth: number; // 0-100 score
  reliability: {
    successRate: number;
    flakyTests: string[];
    consistentlyFailing: string[];
  };
  performance: {
    averageRunTime: number;
    trend: 'improving' | 'degrading' | 'stable';
    slowTests: Array<{ name: string; avgDuration: number }>;
  };
  coverage: {
    current: number;
    trend: 'improving' | 'degrading' | 'stable';
    uncoveredCriticalPaths: string[];
  };
  recommendations: string[];
}

export class TestHealthMonitor {
  private historyFile: string;
  private projectRoot: string;
  private maxHistoryEntries = 100;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.historyFile = join(projectRoot, '.test-health', 'history.json');
  }

  async runHealthCheck(): Promise<TestHealthMetrics> {
    console.log('🏥 Starting test health check...');

    // Run tests and collect metrics
    const testRun = await this.executeTests();
    
    // Save test run data
    await this.saveTestRun(testRun);
    
    // Load historical data
    const history = await this.loadHistory();
    
    // Calculate health metrics
    const metrics = this.calculateHealthMetrics(history);
    
    console.log('✅ Health check complete');
    return metrics;
  }

  private async executeTests(): Promise<TestRun> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Running test suite...');
      
      // Run tests with JSON output
      const testOutput = execSync('npm run test -- --reporter=json', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      // Run coverage
      let coverage: CoverageData | undefined;
      try {
        console.log('📊 Collecting coverage data...');
        const coverageOutput = execSync('npm run test:coverage -- --reporter=json', {
          cwd: this.projectRoot,
          encoding: 'utf-8',
          maxBuffer: 1024 * 1024 * 10
        });
        coverage = this.parseCoverageData(coverageOutput);
      } catch (error) {
        console.warn('⚠️ Coverage collection failed:', error instanceof Error ? error.message : 'Unknown error');
      }

      const results = this.parseTestResults(testOutput);
      const endTime = Date.now();

      return {
        timestamp: startTime,
        duration: endTime - startTime,
        totalTests: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        coverage,
        results,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          ci: !!process.env.CI
        }
      };

    } catch (error) {
      const endTime = Date.now();
      console.error('❌ Test execution failed:', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        timestamp: startTime,
        duration: endTime - startTime,
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        results: [],
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          ci: !!process.env.CI
        }
      };
    }
  }

  private parseTestResults(output: string): TestResult[] {
    try {
      const data = JSON.parse(output);
      const results: TestResult[] = [];

      if (data.testResults) {
        data.testResults.forEach((fileResult: any) => {
          fileResult.assertionResults?.forEach((test: any) => {
            results.push({
              name: test.title || test.fullName,
              status: test.status === 'passed' ? 'passed' : 
                     test.status === 'failed' ? 'failed' : 'skipped',
              duration: test.duration || 0,
              error: test.failureMessages?.[0],
              file: fileResult.name
            });
          });
        });
      }

      return results;
    } catch (error) {
      console.warn('⚠️ Failed to parse test results:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private parseCoverageData(output: string): CoverageData | undefined {
    try {
      const data = JSON.parse(output);
      const coverage = data.coverageMap || data.coverage;
      
      if (!coverage) return undefined;

      // Calculate aggregated coverage
      let totalLines = 0, coveredLines = 0;
      let totalFunctions = 0, coveredFunctions = 0;
      let totalBranches = 0, coveredBranches = 0;
      let totalStatements = 0, coveredStatements = 0;

      Object.values(coverage).forEach((file: any) => {
        if (file.lines) {
          totalLines += file.lines.total || 0;
          coveredLines += file.lines.covered || 0;
        }
        if (file.functions) {
          totalFunctions += file.functions.total || 0;
          coveredFunctions += file.functions.covered || 0;
        }
        if (file.branches) {
          totalBranches += file.branches.total || 0;
          coveredBranches += file.branches.covered || 0;
        }
        if (file.statements) {
          totalStatements += file.statements.total || 0;
          coveredStatements += file.statements.covered || 0;
        }
      });

      return {
        lines: {
          total: totalLines,
          covered: coveredLines,
          percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
        },
        functions: {
          total: totalFunctions,
          covered: coveredFunctions,
          percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0
        },
        branches: {
          total: totalBranches,
          covered: coveredBranches,
          percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
        },
        statements: {
          total: totalStatements,
          covered: coveredStatements,
          percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
        }
      };
    } catch (error) {
      console.warn('⚠️ Failed to parse coverage data:', error instanceof Error ? error.message : 'Unknown error');
      return undefined;
    }
  }

  private async saveTestRun(testRun: TestRun): Promise<void> {
    try {
      await mkdir(dirname(this.historyFile), { recursive: true });
      
      const history = await this.loadHistory();
      history.push(testRun);
      
      // Keep only recent entries
      if (history.length > this.maxHistoryEntries) {
        history.splice(0, history.length - this.maxHistoryEntries);
      }
      
      await writeFile(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.warn('⚠️ Failed to save test run data:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async loadHistory(): Promise<TestRun[]> {
    try {
      if (!existsSync(this.historyFile)) {
        return [];
      }
      
      const data = await readFile(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('⚠️ Failed to load test history:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private calculateHealthMetrics(history: TestRun[]): TestHealthMetrics {
    if (history.length === 0) {
      return {
        overallHealth: 0,
        reliability: { successRate: 0, flakyTests: [], consistentlyFailing: [] },
        performance: { averageRunTime: 0, trend: 'stable', slowTests: [] },
        coverage: { current: 0, trend: 'stable', uncoveredCriticalPaths: [] },
        recommendations: ['No test history available. Run tests to start tracking health metrics.']
      };
    }

    const recent = history.slice(-10); // Last 10 runs
    const latest = history[history.length - 1];

    // Calculate reliability metrics
    const reliability = this.calculateReliabilityMetrics(history);
    
    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(history);
    
    // Calculate coverage metrics
    const coverage = this.calculateCoverageMetrics(history);
    
    // Calculate overall health score
    const overallHealth = this.calculateOverallHealth(reliability, performance, coverage);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(reliability, performance, coverage, latest);

    return {
      overallHealth,
      reliability,
      performance,
      coverage,
      recommendations
    };
  }

  private calculateReliabilityMetrics(history: TestRun[]) {
    const recent = history.slice(-10);
    const totalRuns = recent.length;
    const successfulRuns = recent.filter(run => run.failed === 0).length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    // Detect flaky tests (tests that pass and fail inconsistently)
    const testOutcomes: Record<string, Array<'passed' | 'failed'>> = {};
    
    recent.forEach(run => {
      run.results.forEach(result => {
        if (!testOutcomes[result.name]) testOutcomes[result.name] = [];
        testOutcomes[result.name].push(result.status as 'passed' | 'failed');
      });
    });

    const flakyTests = Object.entries(testOutcomes)
      .filter(([_, outcomes]) => {
        const passed = outcomes.filter(o => o === 'passed').length;
        const failed = outcomes.filter(o => o === 'failed').length;
        return passed > 0 && failed > 0 && outcomes.length >= 3;
      })
      .map(([name]) => name);

    // Consistently failing tests
    const consistentlyFailing = Object.entries(testOutcomes)
      .filter(([_, outcomes]) => {
        return outcomes.length >= 3 && outcomes.every(o => o === 'failed');
      })
      .map(([name]) => name);

    return {
      successRate,
      flakyTests,
      consistentlyFailing
    };
  }

  private calculatePerformanceMetrics(history: TestRun[]) {
    const recent = history.slice(-10);
    const averageRunTime = recent.reduce((sum, run) => sum + run.duration, 0) / recent.length;

    // Calculate trend
    let trend: 'improving' | 'degrading' | 'stable' = 'stable';
    if (recent.length >= 5) {
      const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
      const secondHalf = recent.slice(Math.floor(recent.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, run) => sum + run.duration, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, run) => sum + run.duration, 0) / secondHalf.length;
      
      const change = (secondAvg - firstAvg) / firstAvg;
      if (change > 0.1) trend = 'degrading';
      else if (change < -0.1) trend = 'improving';
    }

    // Find slow tests
    const testDurations: Record<string, number[]> = {};
    recent.forEach(run => {
      run.results.forEach(result => {
        if (!testDurations[result.name]) testDurations[result.name] = [];
        testDurations[result.name].push(result.duration);
      });
    });

    const slowTests = Object.entries(testDurations)
      .map(([name, durations]) => ({
        name,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length
      }))
      .filter(test => test.avgDuration > 1000) // Tests taking more than 1 second
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    return {
      averageRunTime,
      trend,
      slowTests
    };
  }

  private calculateCoverageMetrics(history: TestRun[]) {
    const recentWithCoverage = history.slice(-10).filter(run => run.coverage);
    
    if (recentWithCoverage.length === 0) {
      return {
        current: 0,
        trend: 'stable' as const,
        uncoveredCriticalPaths: []
      };
    }

    const latest = recentWithCoverage[recentWithCoverage.length - 1];
    const current = latest.coverage!.lines.percentage;

    // Calculate trend
    let trend: 'improving' | 'degrading' | 'stable' = 'stable';
    if (recentWithCoverage.length >= 3) {
      const first = recentWithCoverage[0].coverage!.lines.percentage;
      const change = (current - first) / first;
      if (change > 0.05) trend = 'improving';
      else if (change < -0.05) trend = 'degrading';
    }

    return {
      current,
      trend,
      uncoveredCriticalPaths: [] // TODO: Implement critical path analysis
    };
  }

  private calculateOverallHealth(
    reliability: any, 
    performance: any, 
    coverage: any
  ): number {
    const reliabilityScore = reliability.successRate;
    const performanceScore = performance.trend === 'improving' ? 90 : 
                           performance.trend === 'stable' ? 70 : 50;
    const coverageScore = coverage.current;
    
    // Weighted average
    return Math.round((reliabilityScore * 0.4) + (performanceScore * 0.3) + (coverageScore * 0.3));
  }

  private generateRecommendations(
    reliability: any,
    performance: any,
    coverage: any,
    latest: TestRun
  ): string[] {
    const recommendations: string[] = [];

    // Reliability recommendations
    if (reliability.successRate < 90) {
      recommendations.push(`⚠️ Test reliability is ${reliability.successRate.toFixed(1)}%. Investigate failing tests.`);
    }

    if (reliability.flakyTests.length > 0) {
      recommendations.push(`🔄 Found ${reliability.flakyTests.length} flaky tests. Consider stabilizing: ${reliability.flakyTests.slice(0, 3).join(', ')}`);
    }

    if (reliability.consistentlyFailing.length > 0) {
      recommendations.push(`❌ ${reliability.consistentlyFailing.length} tests consistently failing. Priority fix needed.`);
    }

    // Performance recommendations
    if (performance.trend === 'degrading') {
      recommendations.push('⏱️ Test performance is degrading. Consider optimizing slow tests.');
    }

    if (performance.slowTests.length > 0) {
      const slowest = performance.slowTests[0];
      recommendations.push(`🐌 Slowest test: "${slowest.name}" (${slowest.avgDuration.toFixed(0)}ms). Consider optimization.`);
    }

    if (latest.duration > 300000) { // 5 minutes
      recommendations.push('⏰ Test suite takes over 5 minutes. Consider parallel execution or test optimization.');
    }

    // Coverage recommendations
    if (coverage.current < 70) {
      recommendations.push(`📊 Test coverage is ${coverage.current.toFixed(1)}%. Aim for at least 70%.`);
    }

    if (coverage.trend === 'degrading') {
      recommendations.push('📉 Test coverage is decreasing. Add tests for new code.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✨ Test suite health looks good! Keep up the excellent work.');
    }

    return recommendations;
  }

  static printHealthReport(metrics: TestHealthMetrics): void {
    console.log('\n🏥 TEST HEALTH REPORT');
    console.log('═══════════════════════');
    
    // Overall health
    const healthIcon = metrics.overallHealth >= 90 ? '💚' : 
                      metrics.overallHealth >= 70 ? '💛' : '❤️';
    console.log(`${healthIcon} Overall Health Score: ${metrics.overallHealth}/100`);
    
    // Reliability
    console.log('\n📊 RELIABILITY');
    console.log(`Success Rate: ${metrics.reliability.successRate.toFixed(1)}%`);
    if (metrics.reliability.flakyTests.length > 0) {
      console.log(`Flaky Tests: ${metrics.reliability.flakyTests.length}`);
    }
    if (metrics.reliability.consistentlyFailing.length > 0) {
      console.log(`Consistently Failing: ${metrics.reliability.consistentlyFailing.length}`);
    }
    
    // Performance
    console.log('\n⚡ PERFORMANCE');
    console.log(`Average Run Time: ${(metrics.performance.averageRunTime / 1000).toFixed(1)}s`);
    console.log(`Trend: ${metrics.performance.trend}`);
    if (metrics.performance.slowTests.length > 0) {
      console.log(`Slow Tests: ${metrics.performance.slowTests.length}`);
    }
    
    // Coverage
    console.log('\n📈 COVERAGE');
    console.log(`Current: ${metrics.coverage.current.toFixed(1)}%`);
    console.log(`Trend: ${metrics.coverage.trend}`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    metrics.recommendations.forEach(rec => console.log(`  ${rec}`));
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new TestHealthMonitor();
  
  monitor.runHealthCheck()
    .then(metrics => {
      TestHealthMonitor.printHealthReport(metrics);
      
      // Exit with appropriate code
      const exitCode = metrics.overallHealth >= 70 ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    });
}

export type { TestHealthMetrics, TestRun, TestResult };
