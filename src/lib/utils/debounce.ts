/**
 * Debounce utility for optimizing function calls
 * Ensures only the last call within the delay period is executed
 */

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

/**
 * Creates a debounced version of a function that delays invoking the function
 * until after `delay` milliseconds have elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param delay The number of milliseconds to delay
 * @param options Configuration options
 * @returns A debounced version of the function with cancel, flush, and pending methods
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    maxWait?: number;
    trailing?: boolean;
  } = {}
): DebouncedFunction<T> {
  const { leading = false, maxWait, trailing = true } = options;

  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: any;

  const invokeFunc = (time: number) => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args!);
    return result;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    // Start the timer for the trailing edge
    timeoutId = setTimeout(timerExpired, delay);
    // Invoke the leading edge if requested
    return leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number) => {
    timeoutId = null;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return result;
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
    lastInvokeTime = 0;
    lastCallTime = null;
    lastArgs = null;
    lastThis = null;
  };

  const flush = () => {
    return timeoutId === null ? result : trailingEdge(Date.now());
  };

  const pending = () => {
    return timeoutId !== null;
  };

  const debounced = function (this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        // Handle invocations in a tight loop
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  };

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}

/**
 * Creates a throttled version of a function that only invokes the function
 * at most once per every `delay` milliseconds.
 * 
 * @param func The function to throttle
 * @param delay The number of milliseconds to throttle invocations to
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  return debounce(func, delay, { 
    leading: true, 
    maxWait: delay, 
    trailing: true 
  });
}

/**
 * Utility to create a debounced setter for Zustand stores
 * This is specifically optimized for store update patterns
 */
export function createDebouncedStoreUpdate<T>(
  updateFn: () => void,
  delay: number = 300
): DebouncedFunction<() => void> {
  return debounce(updateFn, delay, {
    leading: false,
    trailing: true
  });
}