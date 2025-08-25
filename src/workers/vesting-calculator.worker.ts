/**
 * Web Worker for heavy vesting calculations
 * Runs calculations off the main thread to prevent UI blocking
 */

import { CalculationInputs, VestingCalculationResult } from '@/types/vesting';

// Import calculation logic (will be bundled with the worker)
import { VestingCalculator } from '@/lib/vesting-calculations';

// Message types for type safety
interface CalculateMessage {
  type: 'calculate';
  inputs: CalculationInputs;
  id: string;
}

interface CancelMessage {
  type: 'cancel';
  id: string;
}

type WorkerMessage = CalculateMessage | CancelMessage;

interface WorkerResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  data?: VestingCalculationResult;
  error?: string;
  progress?: number;
}

// Track active calculations
const activeCalculations = new Map<string, AbortController>();

// Handle messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, id } = event.data;
  
  try {
    switch (type) {
      case 'calculate':
        await handleCalculation(event.data as CalculateMessage);
        break;
        
      case 'cancel':
        handleCancellation(id);
        break;
        
      default:
        sendError(id, `Unknown message type: ${type}`);
    }
  } catch (error) {
    sendError(id, error instanceof Error ? error.message : 'Unknown error occurred');
  }
});

async function handleCalculation(message: CalculateMessage) {
  const { inputs, id } = message;
  
  // Create abort controller for this calculation
  const abortController = new AbortController();
  activeCalculations.set(id, abortController);
  
  try {
    // Send progress update
    sendProgress(id, 10);
    
    // Perform calculation with timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Calculation timeout')), 5000);
    });
    
    const calculationPromise = new Promise<VestingCalculationResult>((resolve) => {
      // Check for cancellation periodically
      const checkAbort = () => {
        if (abortController.signal.aborted) {
          throw new Error('Calculation cancelled');
        }
      };
      
      // Run calculation with abort checks
      const result = VestingCalculator.calculate(inputs);
      checkAbort();
      
      // Additional processing if needed
      sendProgress(id, 50);
      
      // Validate result
      if (!result || !result.timeline) {
        throw new Error('Invalid calculation result');
      }
      
      sendProgress(id, 90);
      resolve(result);
    });
    
    // Race between calculation and timeout
    const result = await Promise.race([
      calculationPromise,
      timeoutPromise
    ]) as VestingCalculationResult;
    
    // Send successful result
    sendResult(id, result);
    
  } catch (error) {
    if (error instanceof Error) {
      sendError(id, error.message);
    } else {
      sendError(id, 'Calculation failed');
    }
  } finally {
    // Clean up
    activeCalculations.delete(id);
  }
}

function handleCancellation(id: string) {
  const controller = activeCalculations.get(id);
  if (controller) {
    controller.abort();
    activeCalculations.delete(id);
    sendError(id, 'Calculation cancelled by user');
  }
}

// Helper functions to send messages back to main thread
function sendResult(id: string, data: VestingCalculationResult) {
  const response: WorkerResponse = {
    type: 'result',
    id,
    data
  };
  self.postMessage(response);
}

function sendError(id: string, error: string) {
  const response: WorkerResponse = {
    type: 'error',
    id,
    error
  };
  self.postMessage(response);
}

function sendProgress(id: string, progress: number) {
  const response: WorkerResponse = {
    type: 'progress',
    id,
    progress
  };
  self.postMessage(response);
}

// Export type for use in main thread
export type { WorkerMessage, WorkerResponse };