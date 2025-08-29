'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export default function HelpTooltip({ 
  content, 
  side = 'top',
  className = ''
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-700 dark:text-slate-300 transition-colors ${className}`}
            aria-label="Help"
          >
            <QuestionMarkCircleIcon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs text-sm p-3"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}