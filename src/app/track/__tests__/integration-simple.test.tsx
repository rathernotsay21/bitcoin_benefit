import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import OnChainTrackerPage from '../page';
import { useOnChainStore } from '@/stores/onChainStore';

// Mock the store
jest.mock('@/stores/onChainStore');

// Mock all external components
jest.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}));

jest.mock('@/components/on-chain/VestingTrackerFormOptimized', () => ({
  default: () => <div data-testid="vesting-tracker-form">Form</div>
}));

jest.mock('@/components/on-chain/VestingTrackerResultsOptimized', () => ({
  default: () => <div data-testid="vesting-tracker-results">Results</div>
}));

jest.mock('@/components/on-chain/OnChainTimelineVisualizer', () => ({
  default: () => <div data-testid="timeline-visualizer">Timeline</div>
}));

jest.mock('@/components/on-chain/PerformanceMonitoringDashboard', () => ({
  default: () => <div data-testid="performance-dashboard">Performance</div>
}));

jest.mock('@/components/on-chain/OnChainErrorBoundaries', () => ({
  OnChainErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TransactionFetchErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PriceFetchErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TimelineErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('OnChainTrackerPage Simple Integration Test', () => {
  const mockStore = {
    address: '',
    vestingStartDate: '',
    annualGrantBtc: 0,
    annotatedTransactions: [],
    expectedGrants: [],
    manualAnnotations: new Map(),
    isLoading: false,
    error: null,
    currentStep: 'idle' as const,
    formErrors: {},
    setFormData: jest.fn(),
    validateAndFetch: jest.fn(),
    updateManualAnnotation: jest.fn(),
    resetTracker: jest.fn(),
    retryOperation: jest.fn()
  };

  beforeEach(() => {
    jest.mocked(useOnChainStore).mockReturnValue(mockStore);
  });

  it('should render the main page components', () => {
    render(<OnChainTrackerPage />);

    expect(screen.getByText('On-Chain Vesting Tracker')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('vesting-tracker-form')).toBeInTheDocument();
  });

  it('should show privacy disclaimer', () => {
    render(<OnChainTrackerPage />);

    expect(screen.getByText(/Privacy & Data Usage Notice/i)).toBeInTheDocument();
  });
});