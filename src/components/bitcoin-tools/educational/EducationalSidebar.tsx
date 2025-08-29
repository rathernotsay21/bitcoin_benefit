'use client';

import React from 'react';
import { CollapsibleBox } from '@/components/ui/CollapsibleBox';
import { BookOpenIcon, ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getIconComponent } from './iconMapping';

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
      {sections.map((section, index) => {
        const IconComponent = getIconComponent(section.icon);
        return (
          <CollapsibleBox
            key={index}
            title={section.title}
            icon={IconComponent}
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
              <div className="bg-gradient-to-br from-bitcoin/8 via-orange-50/60 to-yellow-50/40 dark:from-bitcoin/15 dark:via-slate-800/90 dark:to-orange-900/20 rounded-sm p-4 mt-3 border border-bitcoin/20 dark:border-bitcoin/30">
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-3 uppercase tracking-wide">
                  Quick Tips
                </h4>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                      <ChevronRightIcon className="w-4 h-4 mr-2 text-bitcoin flex-shrink-0 mt-0.5" />
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
                      className="block group p-2 rounded-sm hover:bg-bitcoin/5 dark:hover:bg-bitcoin/10 transition-all duration-200 hover:transform hover:scale-[1.01]"
                    >
                      <div className="text-base font-semibold text-bitcoin hover:text-bitcoin-600 group-hover:underline">
                        <span className="flex items-center">
                          {link.title}
                          <ArrowRightIcon className="w-4 h-4 ml-1 text-bitcoin" />
                        </span>
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
        );
      })}
      
      {/* General Bitcoin Resources - Keep this one expanded as reference */}
      <div className="glass bg-gradient-to-br from-bitcoin/10 via-orange-50/60 to-yellow-50/40 dark:from-bitcoin/15 dark:via-slate-800/90 dark:to-orange-900/20 rounded-sm border-2 border-bitcoin/20 dark:border-bitcoin/30 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <BookOpenIcon className="w-6 h-6 mr-3 text-bitcoin" />
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
            className="block p-3 rounded-sm text-base font-semibold text-bitcoin hover:text-bitcoin-600 hover:underline hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 hover:transform hover:scale-[1.02] hover:shadow-md"
          >
            <span className="flex items-center">
              How Bitcoin Works (Bitcoin.org)
              <ArrowRightIcon className="w-5 h-5 ml-1 text-bitcoin" />
            </span>
          </a>
          <a
            href="https://river.com/learn/bitcoin-basics/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-sm text-base font-semibold text-bitcoin hover:text-bitcoin-600 hover:underline hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 hover:transform hover:scale-[1.02] hover:shadow-md"
          >
            <span className="flex items-center">
              Bitcoin Basics Guide (River)
              <ArrowRightIcon className="w-5 h-5 ml-1 text-bitcoin" />
            </span>
          </a>
          <a
            href="https://www.gemini.com/cryptopedia/bitcoin-for-dummies-how-does-bitcoin-work-blockchain-btc"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-sm text-base font-semibold text-bitcoin hover:text-bitcoin-600 hover:underline hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 hover:transform hover:scale-[1.02] hover:shadow-md"
          >
            <span className="flex items-center">
              Bitcoin for Beginners (Gemini)
              <ArrowRightIcon className="w-5 h-5 ml-1 text-bitcoin" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
