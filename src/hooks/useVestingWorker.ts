/**
 * Hook to use Web Worker for vesting calculations
 * Falls back to main thread calculation if Web Workers are not available
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalculationInputs, VestingCalculationResult } from '@/types/vesting';
import { VestingCalculator } from '@/lib/vesting-calculations';
import { performanceMonitor } from '@/lib/performance-monitor';

interface UseVestingWorkerResult {
  calculate: (inputs: CalculationInputs) => Promise<VestingCalculationResult>;
  isCalculating: boolean;
  progress: number;
  error: string | null;
  cancel: () => void;
}

// Check if Web Workers are available
const isWorkerAvailable = () => {
  return typeof window !== 'undefined' && 'Worker' in window;
};

// Check if we're in a test environment where workers might not work properly
const shouldUseWorker = () => {
  if (!isWorkerAvailable()) return false;
  
  // Skip workers in Netlify CI to avoid potential issues
  const isNetlifyCI = process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production';
  if (isNetlifyCI) {
    console.log('Skipping Web Worker in Netlify CI environment');
    return false;
  }
  
  return true;
};

export function useVestingWorker(): UseVestingWorkerResult {
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  const calculationIdRef = useRef<string>('');
  const pendingResolveRef = useRef<((value: VestingCalculationResult) => void) | null>(null);
  const pendingRejectRef = useRef<((reason: Error) => void) | null>(null);
  
  // Initialize worker on mount
  useEffect(() => {
    if (shouldUseWorker()) {
      try {
        // Dynamic import for better code splitting
        workerRef.current = new Worker(
          new URL('../workers/vesting-calculator.worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        // Set up message handler
        workerRef.current.onmessage = (event) => {
          const { type, id, data, error: workerError, progress: workerProgress } = event.data;
          
          // Ignore messages from old calculations
          if (id !== calculationIdRef.current) return;
          
          switch (type) {
            case 'result':
              performanceMonitor.end(`WorkerCalculation.${id}`);
              setIsCalculating(false);
              setProgress(100);
              setError(null);
              if (pendingResolveRef.current && data) {
                pendingResolveRef.current(data);
              }
              break;
              
            case 'error':
              performanceMonitor.end(`WorkerCalculation.${id}`);
              setIsCalculating(false);
              setProgress(0);
              setError(workerError || 'Calculation failed');
              if (pendingRejectRef.current) {
                pendingRejectRef.current(new Error(workerError || 'Calculation failed'));
              }
              break;
              
            case 'progress':
              setProgress(workerProgress || 0);
              break;
          }
        };
        
        // Handle worker errors
        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
          setIsCalculating(false);
          setError('Worker error occurred');
          if (pendingRejectRef.current) {
            pendingRejectRef.current(new Error('Worker error occurred'));
          }
        };
        
      } catch (error) {
        console.warn('Failed to initialize Web Worker:', error);
        workerRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);
  
  const calculate = useCallback(async (inputs: CalculationInputs): Promise<VestingCalculationResult> => {
    setIsCalculating(true);
    setProgress(0);
    setError(null);
    
    // Generate unique ID for this calculation
    const calculationId = `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    calculationIdRef.current = calculationId;
    
    // Use Web Worker if available
    if (workerRef.current) {
      performanceMonitor.start(`WorkerCalculation.${calculationId}`);
      
      return new Promise<VestingCalculationResult>((resolve, reject) => {
        pendingResolveRef.current = resolve;
        pendingRejectRef.current = reject;
        
        // Send calculation request to worker
        workerRef.current!.postMessage({
          type: 'calculate',
          inputs,
          id: calculationId
        });
        
        // Set timeout for worker calculation
        const timeout = setTimeout(() => {
          setIsCalculating(false);
          setError('Calculation timeout');
          reject(new Error('Calculation timeout in Web Worker'));
        }, 10000);
        
        // Store original resolve to clear timeout
        const originalResolve = pendingResolveRef.current;
        pendingResolveRef.current = (result) => {
          clearTimeout(timeout);
          originalResolve(result);
        };
        
        const originalReject = pendingRejectRef.current;
        pendingRejectRef.current = (error) => {
          clearTimeout(timeout);
          originalReject(error);
        };
      });
    }
    
    // Fallback to main thread calculation
    try {
      performanceMonitor.start(`MainThreadCalculation.${calculationId}`);
      setProgress(25);
      
      const result = await new Promise<VestingCalculationResult>((resolve, reject) => {
        // Run calculation with timeout
        const timeout = setTimeout(() => {
          reject(new Error('Calculation timeout'));
        }, 5000);
        
        try {
          const calculationResult = VestingCalculator.calculate(inputs);
          clearTimeout(timeout);
          resolve(calculationResult);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
      
      performanceMonitor.end(`MainThreadCalculation.${calculationId}`);
      setProgress(100);
      setIsCalculating(false);
      return result;
      
    } catch (error) {
      performanceMonitor.end(`MainThreadCalculation.${calculationId}`);
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed';
      setError(errorMessage);
      setIsCalculating(false);
      throw error;
    }
  }, []);
  
  const cancel = useCallback(() => {
    if (workerRef.current && calculationIdRef.current) {
      workerRef.current.postMessage({
        type: 'cancel',
        id: calculationIdRef.current
      });
    }
    
    setIsCalculating(false);
    setProgress(0);
    setError('Calculation cancelled');
    
    if (pendingRejectRef.current) {
      pendingRejectRef.current(new Error('Calculation cancelled'));
    }
  }, []);
  
  return {
    calculate,
    isCalculating,
    progress,
    error,
    cancel
  };
}