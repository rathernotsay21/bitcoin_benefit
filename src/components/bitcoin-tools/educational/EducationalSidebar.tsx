'use client';

import React from 'react';
import { CollapsibleBox } from '@/components/ui/CollapsibleBox';

export interface EducationalLink {
  title: string;
  url: string;
  description: string;
}

export interface EducationalSection {
  title: string;
  icon?: string;
  content: string[];
  links?: EducationalLink[];
  tips?: string[];
}

interface EducationalSidebarProps {
  sections: EducationalSection[];
  className?: string;
}

export function EducationalSidebar({ sections, className = '' }: EducationalSidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, index) => (
        <CollapsibleBox
          key={index}
          title={section.title}
          icon={section.icon}
          defaultExpanded={false}
          previewHeight={140}
          className=""
        >
          <div className="space-y-3">
            {section.content.map((paragraph, pIndex) => (
              <p key={pIndex} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {paragraph}
              </p>
            ))}
            
            {section.tips && section.tips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-3">
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-3 uppercase tracking-wide">
                  Quick Tips
                </h4>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                      <span className="mr-2 text-bitcoin">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {section.links && section.links.length > 0 && (
              <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-3 mt-3">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Learn More
                </h4>
                <div className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="text-base font-semibold text-bitcoin hover:text-bitcoin-600 group-hover:underline">
                        {link.title} →
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {link.description}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleBox>
      ))}
      
      {/* General Bitcoin Resources - Keep this one expanded as reference */}
      <div className="bg-gradient-to-br from-bitcoin/10 to-orange-100/50 dark:from-bitcoin/20 dark:to-orange-900/20 rounded-lg border-2 border-bitcoin/30 p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-3 text-xl">📚</span>
          New to Bitcoin?
        </h3>
        <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
          Start with these beginner-friendly guides to understand the basics.
        </p>
        <div className="space-y-3">
          <a
            href="https://bitcoin.org/en/how-it-works"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg text-base font-semibold text-bitcoin hover:text-bitcoin-600 hover:underline hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
          >
            How Bitcoin Works (Bitcoin.org) →
          </a>
          <a
            href="https://river.com/learn/bitcoin-basics/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg text-base font-semibold text-bitcoin hover:text-bitcoin-600 hover:underline hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
          >
            Bitcoin Basics Guide (River) →
          </a>
          <a
            href="https://www.gemini.com/cryptopedia/bitcoin-for-dummies-how-does-bitcoin-work-blockchain-btc"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg text-base font-semibold text-bitcoin hover:text-bitcoin-600 hover:underline hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
          >
            Bitcoin for Beginners (Gemini) →
          </a>
        </div>
      </div>
    </div>
  );
}
