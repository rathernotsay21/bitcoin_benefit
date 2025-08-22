'use client';

import React from 'react';
import { CollapsibleBox } from './CollapsibleBox';

// Demo component to test the CollapsibleBox functionality
export function CollapsibleBoxDemo() {
  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">CollapsibleBox Demo</h2>
      
      {/* Short content that doesn't need collapsing */}
      <CollapsibleBox title="Short Content" icon="📝">
        <p>This is a short piece of content that doesn't need to be collapsed.</p>
      </CollapsibleBox>

      {/* Long content that should be collapsible */}
      <CollapsibleBox title="Long Content" icon="📚" previewHeight={120}>
        <div className="space-y-3">
          <p>This is a longer piece of content that should be collapsible to save space.</p>
          <p>It has multiple paragraphs and contains a lot of information that might be overwhelming when all shown at once.</p>
          <p>The CollapsibleBox component automatically detects when content is longer than the preview height and shows expansion controls.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Quick Tips</h4>
            <ul className="space-y-1">
              <li className="text-sm text-blue-700 dark:text-blue-300">• Tip number one about this topic</li>
              <li className="text-sm text-blue-700 dark:text-blue-300">• Tip number two with more details</li>
              <li className="text-sm text-blue-700 dark:text-blue-300">• Tip number three that's also helpful</li>
            </ul>
          </div>
          <div className="border-t pt-3">
            <h4 className="font-bold mb-2">Learn More</h4>
            <a href="#" className="text-bitcoin hover:underline">External Resource →</a>
          </div>
        </div>
      </CollapsibleBox>

      {/* Content without title */}
      <CollapsibleBox previewHeight={100}>
        <div className="space-y-2">
          <p>This box has no title but still collapses when content is long enough.</p>
          <p>It automatically shows expansion controls when needed.</p>
          <p>The fade overlay and show more button appear automatically.</p>
          <p>This makes it perfect for wrapping existing content sections.</p>
        </div>
      </CollapsibleBox>

      {/* Pre-expanded content */}
      <CollapsibleBox title="Pre-expanded Content" icon="🔓" defaultExpanded={true}>
        <div className="space-y-3">
          <p>This content starts expanded by default.</p>
          <p>Users can still collapse it if they want to save space.</p>
          <p>This is useful for important information that should be visible initially.</p>
        </div>
      </CollapsibleBox>
    </div>
  );
}