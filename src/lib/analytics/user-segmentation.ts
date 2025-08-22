/**
 * User Segmentation and Custom Tagging for Microsoft Clarity
 * Provides intelligent user categorization and behavioral analysis
 */

import { setUserTags, trackClarityEvent, ClarityEvents } from './clarity-events';

export interface UserSession {
  sessionId: string;
  startTime: number;
  pageViews: number;
  calculatorUse: boolean;
  toolsUsed: Set<string>;
  engagementLevel: 'low' | 'medium' | 'high';
  userType: 'visitor' | 'calculator_user' | 'returning_user' | 'power_user';
  featureUsage: {
    futureCalculator: boolean;
    historicalCalculator: boolean;
    bitcoinTools: boolean;
    onChainTracking: boolean;
  };
}

class UserSegmentation {
  private session: UserSession | null = null;
  private readonly STORAGE_KEY = 'clarity_user_session';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.initializeSession();
  }

  private initializeSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const now = Date.now();

      if (stored) {
        const parsed = JSON.parse(stored) as UserSession;
        
        // Check if session is still valid
        if (now - parsed.startTime < this.SESSION_TIMEOUT) {
          this.session = {
            ...parsed,
            toolsUsed: new Set(Array.isArray(parsed.toolsUsed) ? parsed.toolsUsed : []),
          };
          this.updateUserType();
          return;
        }
      }

      // Create new session
      this.session = {
        sessionId: this.generateSessionId(),
        startTime: now,
        pageViews: 0,
        calculatorUse: false,
        toolsUsed: new Set(),
        engagementLevel: 'low',
        userType: 'visitor',
        featureUsage: {
          futureCalculator: false,
          historicalCalculator: false,
          bitcoinTools: false,
          onChainTracking: false,
        },
      };

      this.saveSession();
    } catch (error) {
      console.error('[Segmentation] Error initializing session:', error);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveSession(): void {
    if (!this.session || typeof window === 'undefined') return;

    try {
      const sessionToStore = {
        ...this.session,
        toolsUsed: Array.from(this.session.toolsUsed),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionToStore));
    } catch (error) {
      console.error('[Segmentation] Error saving session:', error);
    }
  }

  private updateUserType(): void {
    if (!this.session) return;

    const { pageViews, calculatorUse, toolsUsed, featureUsage } = this.session;
    
    // Determine user type based on behavior
    if (pageViews >= 10 || toolsUsed.size >= 3) {
      this.session.userType = 'power_user';
    } else if (calculatorUse || pageViews >= 3) {
      this.session.userType = 'calculator_user';
    } else if (pageViews >= 2) {
      this.session.userType = 'returning_user';
    } else {
      this.session.userType = 'visitor';
    }

    // Determine engagement level
    const engagementScore = pageViews + (toolsUsed.size * 2) + (calculatorUse ? 3 : 0);
    if (engagementScore >= 8) {
      this.session.engagementLevel = 'high';
    } else if (engagementScore >= 3) {
      this.session.engagementLevel = 'medium';
    } else {
      this.session.engagementLevel = 'low';
    }

    this.updateClarityTags();
  }

  private updateClarityTags(): void {
    if (!this.session) return;

    const tags: Record<string, string> = {
      user_type: this.session.userType,
      engagement_level: this.session.engagementLevel,
      session_page_views: this.session.pageViews.toString(),
      tools_used_count: this.session.toolsUsed.size.toString(),
      calculator_used: this.session.calculatorUse.toString(),
      future_calc_used: this.session.featureUsage.futureCalculator.toString(),
      historical_calc_used: this.session.featureUsage.historicalCalculator.toString(),
      bitcoin_tools_used: this.session.featureUsage.bitcoinTools.toString(),
      onchain_tracking_used: this.session.featureUsage.onChainTracking.toString(),
    };

    // Add time-based tags
    const sessionDuration = Date.now() - this.session.startTime;
    const sessionMinutes = Math.floor(sessionDuration / 60000);
    tags.session_duration_minutes = sessionMinutes.toString();

    // Add feature combination tags
    const featuresUsed = Object.entries(this.session.featureUsage)
      .filter(([_, used]) => used)
      .map(([feature, _]) => feature);
    
    if (featuresUsed.length > 1) {
      tags.feature_combination = featuresUsed.join('_');
    }

    setUserTags(tags);
  }

  // Public methods for tracking user behavior
  public trackPageView(path: string): void {
    if (!this.session) return;

    this.session.pageViews++;
    
    // Update feature usage based on path
    if (path.includes('/calculator')) {
      this.session.featureUsage.futureCalculator = true;
      this.session.calculatorUse = true;
    } else if (path.includes('/historical')) {
      this.session.featureUsage.historicalCalculator = true;
    } else if (path.includes('/bitcoin-tools')) {
      this.session.featureUsage.bitcoinTools = true;
    } else if (path.includes('/track')) {
      this.session.featureUsage.onChainTracking = true;
    }

    this.updateUserType();
    this.saveSession();

    // Track segmentation events
    trackClarityEvent(ClarityEvents.PAGE_VIEW, {
      path,
      user_type: this.session.userType,
      engagement_level: this.session.engagementLevel,
      session_page_views: this.session.pageViews,
    });
  }

  public trackToolUsage(toolName: string): void {
    if (!this.session) return;

    this.session.toolsUsed.add(toolName);
    this.session.featureUsage.bitcoinTools = true;
    
    this.updateUserType();
    this.saveSession();

    trackClarityEvent(ClarityEvents.BITCOIN_TOOL_USED, {
      tool: toolName,
      user_type: this.session.userType,
      tools_used_count: this.session.toolsUsed.size,
    });
  }

  public trackCalculatorEngagement(action: string, scheme?: string): void {
    if (!this.session) return;

    this.session.calculatorUse = true;
    this.session.featureUsage.futureCalculator = true;
    
    this.updateUserType();
    this.saveSession();

    trackClarityEvent(ClarityEvents.CALCULATOR_STARTED, {
      action,
      scheme,
      user_type: this.session.userType,
      engagement_level: this.session.engagementLevel,
    });
  }

  public trackEngagementMilestone(milestone: string): void {
    if (!this.session) return;

    trackClarityEvent(ClarityEvents.TIME_ON_PAGE_30S, {
      milestone,
      user_type: this.session.userType,
      engagement_level: this.session.engagementLevel,
      session_duration: Date.now() - this.session.startTime,
    });
  }

  public getSession(): UserSession | null {
    return this.session;
  }

  public getUserInsights(): {
    isNewUser: boolean;
    isEngaged: boolean;
    isPowerUser: boolean;
    primaryFeature: string | null;
  } {
    if (!this.session) {
      return {
        isNewUser: true,
        isEngaged: false,
        isPowerUser: false,
        primaryFeature: null,
      };
    }

    const { pageViews, userType, featureUsage } = this.session;
    
    // Determine primary feature
    let primaryFeature: string | null = null;
    if (featureUsage.futureCalculator && featureUsage.historicalCalculator) {
      primaryFeature = 'comprehensive_calculator';
    } else if (featureUsage.futureCalculator) {
      primaryFeature = 'future_calculator';
    } else if (featureUsage.historicalCalculator) {
      primaryFeature = 'historical_calculator';
    } else if (featureUsage.bitcoinTools) {
      primaryFeature = 'bitcoin_tools';
    } else if (featureUsage.onChainTracking) {
      primaryFeature = 'onchain_tracking';
    }

    return {
      isNewUser: pageViews <= 1,
      isEngaged: this.session.engagementLevel !== 'low',
      isPowerUser: userType === 'power_user',
      primaryFeature,
    };
  }
}

// Singleton instance
let segmentationInstance: UserSegmentation | null = null;

export function getUserSegmentation(): UserSegmentation {
  if (!segmentationInstance) {
    segmentationInstance = new UserSegmentation();
  }
  return segmentationInstance;
}

// Convenience functions
export function trackPageViewWithSegmentation(path: string): void {
  getUserSegmentation().trackPageView(path);
}

export function trackToolUsageWithSegmentation(toolName: string): void {
  getUserSegmentation().trackToolUsage(toolName);
}

export function trackCalculatorEngagementWithSegmentation(action: string, scheme?: string): void {
  getUserSegmentation().trackCalculatorEngagement(action, scheme);
}

export function getUserInsights() {
  return getUserSegmentation().getUserInsights();
}