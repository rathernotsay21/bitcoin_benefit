import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FeatureCarousel from '../FeatureCarousel';

// Mock the icons to avoid import issues in tests
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: ({ className }: { className?: string }) => <div className={className}>ChevronLeft</div>,
  ChevronRightIcon: ({ className }: { className?: string }) => <div className={className}>ChevronRight</div>,
}));

vi.mock('@heroicons/react/24/solid', () => ({
  ChartBarIcon: ({ className }: { className?: string }) => <div className={className}>ChartBar</div>,
  ClockIcon: ({ className }: { className?: string }) => <div className={className}>Clock</div>,
  CubeTransparentIcon: ({ className }: { className?: string }) => <div className={className}>Cube</div>,
}));

describe('FeatureCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the carousel with first feature by default', () => {
    render(<FeatureCarousel />);
    
    expect(screen.getAllByText('Future Value Calculator')).toHaveLength(2); // Main content + nav card
    expect(screen.getByText('Model Growth Scenarios')).toBeInTheDocument();
  });

  it('shows navigation controls', () => {
    render(<FeatureCarousel />);
    
    expect(screen.getByLabelText('Previous feature')).toBeInTheDocument();
    expect(screen.getByLabelText('Next feature')).toBeInTheDocument();
  });

  it('displays progress dots for all features', () => {
    render(<FeatureCarousel />);
    
    const progressDots = screen.getAllByLabelText(/Go to feature \d/);
    expect(progressDots).toHaveLength(3);
  });

  it('navigates to next slide when next button is clicked', async () => {
    render(<FeatureCarousel />);
    
    const nextButton = screen.getByLabelText('Next feature');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getAllByText('Historical Analysis')).toHaveLength(2); // Main content + nav card
      expect(screen.getByText('Learn from the Past')).toBeInTheDocument();
    });
  });

  it('navigates to previous slide when previous button is clicked', async () => {
    render(<FeatureCarousel />);
    
    const prevButton = screen.getByLabelText('Previous feature');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(screen.getAllByText('Track & Unlock Timeline')).toHaveLength(2); // Main content + nav card
      expect(screen.getByText('Monitor Real Value')).toBeInTheDocument();
    });
  });

  it('navigates to specific slide when progress dot is clicked', async () => {
    render(<FeatureCarousel />);
    
    const thirdDot = screen.getByLabelText('Go to feature 3');
    fireEvent.click(thirdDot);
    
    await waitFor(() => {
      expect(screen.getAllByText('Track & Unlock Timeline')).toHaveLength(2); // Main content + nav card
    });
  });

  it('auto-advances slides after timer', async () => {
    render(<FeatureCarousel />);
    
    // Initially shows first feature
    expect(screen.getAllByText('Future Value Calculator')).toHaveLength(2);
    
    // Fast-forward timer by 6 seconds
    vi.advanceTimersByTime(6000);
    
    await waitFor(() => {
      expect(screen.getAllByText('Historical Analysis')).toHaveLength(2);
    });
  });

  it('pauses auto-advance on mouse enter', () => {
    render(<FeatureCarousel />);
    
    const carousel = screen.getAllByText('Future Value Calculator')[0].closest('section');
    
    // Mouse enter to pause
    fireEvent.mouseEnter(carousel!);
    
    // Fast-forward timer - should not advance
    vi.advanceTimersByTime(6000);
    
    // Should still show first feature
    expect(screen.getAllByText('Future Value Calculator')).toHaveLength(2);
  });

  it('displays all feature navigation cards', () => {
    render(<FeatureCarousel />);
    
    expect(screen.getAllByText('Future Value Calculator')).toHaveLength(2);
    expect(screen.getAllByText('Historical Analysis')).toHaveLength(2);
    expect(screen.getAllByText('Track & Unlock Timeline')).toHaveLength(2);
  });

  it('renders CTA links with correct hrefs', () => {
    render(<FeatureCarousel />);
    
    const ctaLink = screen.getByText('Explore Future Value Calculator').closest('a');
    expect(ctaLink).toHaveAttribute('href', '/calculator');
  });

  it('applies correct styling for active feature card', () => {
    render(<FeatureCarousel />);
    
    // The feature navigation cards should highlight the active one
    const firstCard = screen.getByText('Model Growth Scenarios');
    expect(firstCard.closest('button')).toHaveClass('scale-105');
  });
});