'use client';

import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  useLayoutEffect,
  memo,
  type ReactNode,
  type ComponentType,
  type HTMLAttributes
} from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Animation easing function types for collapsible transitions
 */
type AnimationEasing = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier(0.4, 0, 0.2, 1)' // Material Design standard
  | 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Ease-out-quad
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`;

/**
 * Collapsible box state for discriminated unions
 */
type CollapsibleState = 
  | { type: 'collapsed'; height: number }
  | { type: 'expanded'; height: number }
  | { type: 'measuring'; height: number }
  | { type: 'animating'; height: number; targetHeight: number };

/**
 * Animation configuration with sensible defaults
 */
interface AnimationConfig {
  /** Duration in milliseconds */
  readonly duration: number;
  /** CSS easing function */
  readonly easing: AnimationEasing;
  /** Whether to use GPU acceleration */
  readonly useGpuAcceleration: boolean;
}

/**
 * Callback event handlers for component lifecycle
 */
interface CollapsibleCallbacks {
  /** Called when expansion state changes */
  onToggle?: (expanded: boolean) => void;
  /** Called when expansion starts */
  onExpansionStart?: () => void;
  /** Called when expansion completes */
  onExpansionComplete?: () => void;
  /** Called when collapse starts */
  onCollapseStart?: () => void;
  /** Called when collapse completes */
  onCollapseComplete?: () => void;
  /** Called when content height is measured */
  onHeightMeasure?: (height: number) => void;
}

/**
 * Enhanced CollapsibleBox component props with comprehensive type safety
 */
export interface CollapsibleBoxProps 
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onToggle'>,
          CollapsibleCallbacks {
  
  /** Content to display inside the collapsible box */
  children: ReactNode;
  
  /** Optional title displayed in the header */
  title?: string;
  
  /** Optional icon (emoji or icon component) displayed next to title */
  icon?: string | ComponentType<{ className?: string }>;
  
  /** Whether the box starts expanded */
  defaultExpanded?: boolean;
  
  /** Controlled expansion state (makes component controlled) */
  expanded?: boolean;
  
  /** Height in pixels when collapsed (0 means fully collapsed) */
  previewHeight?: number;
  
  /** Animation configuration */
  animation?: Partial<AnimationConfig>;
  
  /** Whether to show expand/collapse button */
  showToggle?: boolean;
  
  /** Position of the toggle button */
  togglePosition?: 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right';
  
  /** Whether to show fade overlay when collapsed */
  showFadeOverlay?: boolean;
  
  /** Whether to show expand hint when collapsed */
  showExpandHint?: boolean;
  
  /** Custom expand hint text */
  expandHintText?: string;
  
  /** Whether to disable the collapsible functionality */
  disabled?: boolean;
  
  /** Custom CSS class for the content container */
  contentClassName?: string;
  
  /** Custom CSS class for the header */
  headerClassName?: string;
  
  /** Whether to lazy render content (only render when expanded) */
  lazyRender?: boolean;
  
  /** Show "Show more"/"Show less" text labels */
  showLabel?: boolean;
  
  /** Add subtle pulse effect on first load */
  pulseOnMount?: boolean;

  /** Custom render prop for toggle button */
  renderToggle?: (props: {
    expanded: boolean;
    toggle: () => void;
    disabled: boolean;
  }) => ReactNode;

  /** Custom render prop for expand hint */
  renderExpandHint?: (props: {
    toggle: () => void;
    hintText: string;
  }) => ReactNode;
}

/**
 * Default animation configuration optimized for performance
 */
const DEFAULT_ANIMATION: AnimationConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  useGpuAcceleration: true,
} as const;

/**
 * High-performance CollapsibleBox component with advanced TypeScript features
 * 
 * Features:
 * - Full type safety with discriminated unions
 * - Performance optimized with memoization
 * - Accessible with ARIA attributes
 * - Smooth animations with GPU acceleration
 * - Flexible API with render props
 * - Controlled and uncontrolled modes
 * 
 * @example
 * ```tsx
 * <CollapsibleBox
 *   title="Advanced Options"
 *   icon="⚙️"
 *   defaultExpanded={false}
 *   onToggle={(expanded) => console.log('Expanded:', expanded)}
 * >
 *   <div>Collapsible content here</div>
 * </CollapsibleBox>
 * ```
 */
export const CollapsibleBox = memo<CollapsibleBoxProps>(function CollapsibleBox({
  children,
  title,
  icon,
  className = '',
  contentClassName = '',
  headerClassName = '',
  defaultExpanded = false,
  expanded: controlledExpanded,
  previewHeight = 140,
  animation: animationOverrides = {},
  showToggle = true,
  togglePosition = 'bottom-center',
  showFadeOverlay = true,
  showExpandHint = true,
  expandHintText,
  disabled = false,
  lazyRender = false,
  showLabel = true,
  pulseOnMount = true,
  renderToggle,
  renderExpandHint,
  onToggle,
  onExpansionStart,
  onExpansionComplete,
  onCollapseStart,
  onCollapseComplete,
  onHeightMeasure,
  ...htmlProps
}) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  
  const [state, setState] = useState<CollapsibleState>({ 
    type: 'measuring', 
    height: 0 
  });
  
  const [showPulse, setShowPulse] = useState(pulseOnMount);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousExpandedRef = useRef(isExpanded);
  
  // Memoized animation configuration
  const animationConfig = useMemo<AnimationConfig>(() => ({
    ...DEFAULT_ANIMATION,
    ...animationOverrides,
  }), [animationOverrides]);
  
  // Derived state
  const shouldShowExpander = state.type !== 'measuring' && 
    state.height > previewHeight;
  
  const displayHeight = useMemo(() => {
    switch (state.type) {
      case 'measuring':
        return 0;
      case 'collapsed':
        return Math.min(state.height, previewHeight);
      case 'expanded':
        return state.height;
      case 'animating':
        return state.targetHeight;
      default:
        return 'auto';
    }
  }, [state, previewHeight]);
  
  const effectiveExpandHintText = expandHintText ?? (title ? `Show more of ${title}` : 'Show more');

  // =============================================================================
  // PERFORMANCE-OPTIMIZED CONTENT MEASUREMENT
  // =============================================================================
  
  const measureContent = useCallback(() => {
    if (!contentRef.current) return;
    
    // Use getBoundingClientRect for more accurate measurements
    const rect = contentRef.current.getBoundingClientRect();
    const scrollHeight = contentRef.current.scrollHeight;
    const measuredHeight = Math.max(rect.height, scrollHeight);
    
    if (measuredHeight > 0) {
      setState({
        type: isExpanded ? 'expanded' : 'collapsed',
        height: measuredHeight
      });
      onHeightMeasure?.(measuredHeight);
    }
  }, [isExpanded, onHeightMeasure]);
  
  // Use layoutEffect for immediate measurement after DOM changes
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measureContent);
    return () => cancelAnimationFrame(frame);
  }, [measureContent, children]);
  
  // Debounced resize handler for performance
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(measureContent, 100);
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [measureContent]);

  // =============================================================================
  // ANIMATION AND TOGGLE LOGIC
  // =============================================================================
  
  const handleToggle = useCallback(() => {
    if (disabled) return;
    
    const newExpanded = !isExpanded;
    
    // Clear any existing animation timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Update expansion state
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    
    // Remove pulse after first interaction
    setShowPulse(false);
    
    // Trigger callbacks
    if (newExpanded) {
      onExpansionStart?.();
    } else {
      onCollapseStart?.();
    }
    
    onToggle?.(newExpanded);
    
    // Handle animation state
    if (state.type === 'collapsed' || state.type === 'expanded') {
      const targetHeight = newExpanded ? state.height : Math.min(state.height, previewHeight);
      
      setState({
        type: 'animating',
        height: newExpanded ? Math.min(state.height, previewHeight) : state.height,
        targetHeight
      });
      
      // Complete animation after duration
      timeoutRef.current = setTimeout(() => {
        if (newExpanded) {
          setState({ type: 'expanded', height: state.height });
          onExpansionComplete?.();
        } else {
          setState({ type: 'collapsed', height: state.height });
          onCollapseComplete?.();
        }
      }, animationConfig.duration);
    }
  }, [disabled, isExpanded, isControlled, onToggle, onExpansionStart, onCollapseStart, 
      onExpansionComplete, onCollapseComplete, state, previewHeight, animationConfig.duration]);
  
  // Handle controlled prop changes
  useEffect(() => {
    if (isControlled && previousExpandedRef.current !== controlledExpanded) {
      previousExpandedRef.current = controlledExpanded;
      // Controlled components should handle their own animation logic
      setState(prev => {
        if (prev.type === 'measuring') return prev;
        return controlledExpanded 
          ? { type: 'expanded', height: prev.height }
          : { type: 'collapsed', height: prev.height };
      });
    }
  }, [isControlled, controlledExpanded]);
  
  // Remove pulse after 3 seconds
  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showPulse]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // =============================================================================
  // MEMOIZED STYLES FOR PERFORMANCE
  // =============================================================================
  
  const containerStyles = useMemo(() => {
    const baseTransition = shouldShowExpander 
      ? `height ${animationConfig.duration}ms ${animationConfig.easing}` 
      : 'none';
    
    return {
      height: typeof displayHeight === 'number' ? `${displayHeight}px` : displayHeight,
      transition: baseTransition,
      overflow: 'hidden',
      ...(animationConfig.useGpuAcceleration && {
        transform: 'translateZ(0)', // GPU acceleration
        willChange: 'height'
      })
    };
  }, [displayHeight, shouldShowExpander, animationConfig]);
  
  const fadeOverlayStyles = useMemo(() => ({
    opacity: showFadeOverlay && shouldShowExpander && !isExpanded && state.height > previewHeight ? 1 : 0,
    transition: `opacity ${animationConfig.duration}ms ease-in-out`
  }), [showFadeOverlay, shouldShowExpander, isExpanded, state.height, previewHeight, animationConfig.duration]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return <span className="mr-3 text-xl" aria-hidden="true">{icon}</span>;
    }
    
    const IconComponent = icon;
    return <IconComponent className="mr-3 w-5 h-5" aria-hidden="true" />;
  };
  
  const renderDefaultToggle = () => (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative -mb-3 mx-auto px-4 py-2 rounded-full
        bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800
        border border-gray-200 dark:border-gray-600
        shadow-sm hover:shadow-sm
        transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-bitcoin/20 focus:ring-offset-2
        group touch-manipulation
        ${showPulse && !isExpanded ? 'animate-pulse' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label={isExpanded ? 'Collapse content' : 'Expand content'}
      aria-expanded={isExpanded}
      aria-controls={htmlProps.id ? `${htmlProps.id}-content` : undefined}
      type="button"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-bitcoin/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Pulse ring for attention */}
      {showPulse && !isExpanded && (
        <div className="absolute inset-0 rounded-full border-2 border-bitcoin/30 animate-ping" />
      )}
      
      <div className="relative flex items-center gap-2">
        {/* Optional label text */}
        {showLabel && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 dark:text-gray-300 group-hover:text-gray-800 dark:text-gray-100 dark:group-hover:text-gray-100 transition-colors duration-200">
            {isExpanded ? 'Show less' : 'Show more'}
          </span>
        )}
        
        {/* Animated arrow */}
        <div
          className="transform transition-all duration-300 ease-out group-hover:scale-110"
          style={{
            transform: `rotate(${isExpanded ? '180deg' : '0deg'})`
          }}
        >
          <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-300 group-hover:text-bitcoin dark:group-hover:text-bitcoin transition-colors duration-200" />
        </div>
      </div>
      
      {/* Subtle inner glow */}
      <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </button>
  );
  
  const renderDefaultExpandHint = () => (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`
        text-xs transition-colors duration-200 flex items-center gap-1 
        px-2 py-1 rounded-md backdrop-blur-sm touch-manipulation
        ${disabled
          ? 'text-gray-600 dark:text-gray-400 cursor-not-allowed'
          : 'text-gray-500 dark:text-gray-400 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
        }
      `}
      aria-label={`Expand to see more ${title ? `of ${title}` : 'content'}`}
      type="button"
    >
      <span className="hidden sm:inline">{effectiveExpandHintText}</span>
      <span className="sm:hidden">More</span>
      <ChevronDownIcon className="w-3 h-3" />
    </button>
  );
  
  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  return (
    <div 
      {...htmlProps}
      className={`relative bg-white dark:bg-gray-800 rounded-sm border-2 border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      {/* Header with title and toggle button */}
      {(title || (shouldShowExpander && showToggle && ['top-left', 'top-right'].includes(togglePosition))) && (
        <div className={`flex items-center justify-between p-5 pb-3 ${headerClassName}`}>
          {title && (
            <h3 
              className="text-lg font-bold text-gray-900 dark:text-white flex items-center"
              id={htmlProps.id ? `${htmlProps.id}-title` : undefined}
            >
              {renderIcon()}
              {title}
            </h3>
          )}
          
          {shouldShowExpander && showToggle && ['top-left', 'top-right'].includes(togglePosition) && (
            renderToggle ? 
              renderToggle({ expanded: isExpanded, toggle: handleToggle, disabled }) :
              renderDefaultToggle()
          )}
        </div>
      )}

      {/* Content container with GPU-accelerated smooth height animation */}
      <div
        className="relative"
        style={containerStyles}
        role="region"
        aria-labelledby={title && htmlProps.id ? `${htmlProps.id}-title` : undefined}
        aria-hidden={!isExpanded && shouldShowExpander ? 'true' : undefined}
      >
        <div
          ref={contentRef}
          id={htmlProps.id ? `${htmlProps.id}-content` : undefined}
          className={`
            ${title ? 'px-5' : 'p-5'} 
            ${shouldShowExpander ? 'pb-16' : title ? 'pb-5' : ''}
            ${contentClassName}
          `}
        >
          {lazyRender && !isExpanded && shouldShowExpander ? null : children}
        </div>
        
        {/* GPU-accelerated fade overlay when collapsed */}
        {showFadeOverlay && shouldShowExpander && !isExpanded && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent pointer-events-none"
            style={{
              height: '60px',
              ...fadeOverlayStyles
            }}
            aria-hidden="true"
          />
        )}
      </div>
      
      {/* Bottom-centered toggle button */}
      {shouldShowExpander && showToggle && togglePosition === 'bottom-center' && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          {/* Subtle separator line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
          
          {renderToggle ? 
            renderToggle({ expanded: isExpanded, toggle: handleToggle, disabled }) :
            renderDefaultToggle()
          }
        </div>
      )}

      {/* Expand hint when collapsed */}
      {shouldShowExpander && !isExpanded && showExpandHint && togglePosition === 'bottom-right' && (
        <div className="absolute bottom-1 right-2">
          {renderExpandHint ? 
            renderExpandHint({ toggle: handleToggle, hintText: effectiveExpandHintText }) :
            renderDefaultExpandHint()
          }
        </div>
      )}
    </div>
  );
});

// =============================================================================
// COMPOUND COMPONENTS AND VARIANTS
// =============================================================================

/**
 * Enhanced CollapsibleBox with automatic content optimization
 * Provides sensible defaults for common use cases
 */
export const AutoCollapsibleBox = memo<CollapsibleBoxProps & {
  /** Whether to show expand hint */
  showExpandHint?: boolean;
}>(function AutoCollapsibleBox({
  children,
  title,
  icon,
  className = '',
  defaultExpanded = false,
  previewHeight = 140,
  animation = {},
  showExpandHint = true,
  lazyRender = true, // Enable lazy rendering by default
  showLabel = true,
  pulseOnMount = true,
  ...props
}) {
  const optimizedAnimation = useMemo(() => ({
    duration: 350,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' as const,
    useGpuAcceleration: true,
    ...animation
  }), [animation]);
  
  return (
    <CollapsibleBox
      title={title}
      icon={icon}
      className={className}
      defaultExpanded={defaultExpanded}
      previewHeight={previewHeight}
      animation={optimizedAnimation}
      showExpandHint={showExpandHint}
      lazyRender={lazyRender}
      showLabel={showLabel}
      pulseOnMount={pulseOnMount}
      {...props}
    >
      {children}
    </CollapsibleBox>
  );
});

/**
 * Accessible CollapsibleBox with enhanced ARIA support
 * Ideal for content that requires screen reader optimization
 */
export const AccessibleCollapsibleBox = memo<CollapsibleBoxProps>(function AccessibleCollapsibleBox({
  children,
  title,
  ...props
}) {
  const fallbackAriaLabel = title ? `Collapsible section: ${title}` : 'Collapsible content section';
  
  return (
    <CollapsibleBox
      title={title}
      aria-label={props['aria-label'] || (!props['aria-labelledby'] ? fallbackAriaLabel : undefined)}
      role="region"
      {...props}
    >
      {children}
    </CollapsibleBox>
  );
});

/**
 * Performance-optimized CollapsibleBox for large content
 * Uses virtualization-friendly settings
 */
export const PerformantCollapsibleBox = memo<CollapsibleBoxProps>(function PerformantCollapsibleBox({
  children,
  animation = {},
  ...props
}) {
  const performantAnimation = useMemo(() => ({
    duration: 200, // Faster animation
    easing: 'ease-out' as const,
    useGpuAcceleration: true,
    ...animation
  }), [animation]);
  
  return (
    <CollapsibleBox
      animation={performantAnimation}
      lazyRender={true}
      {...props}
    >
      {children}
    </CollapsibleBox>
  );
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  AnimationConfig,
  CollapsibleState,
  AnimationEasing,
  CollapsibleCallbacks,
};