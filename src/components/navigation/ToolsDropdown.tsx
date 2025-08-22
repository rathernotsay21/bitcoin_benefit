'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';

interface ToolItem {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const toolsItems: ToolItem[] = [
  {
    title: 'Transactions',
    href: '/bitcoin-tools?tool=transaction',
    description: 'Look up and analyze Bitcoin transactions on the blockchain',
    icon: MagnifyingGlassIcon,
  },
  {
    title: 'Fee Calculator',
    href: '/bitcoin-tools?tool=fees',
    description: 'Calculate optimal transaction fees based on network conditions',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Network Status',
    href: '/bitcoin-tools?tool=network',
    description: 'Monitor Bitcoin network health and statistics in real-time',
    icon: ServerIcon,
  },
  {
    title: 'Address Explorer',
    href: '/bitcoin-tools?tool=address',
    description: 'Explore Bitcoin addresses and their transaction history',
    icon: MapPinIcon,
  },
  {
    title: 'Document Timestamp',
    href: '/bitcoin-tools?tool=timestamp',
    description: 'Create immutable timestamps for documents on the blockchain',
    icon: DocumentTextIcon,
  },
];

export function ToolsDropdown() {
  return (
    <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
      {toolsItems.map((item) => (
        <li key={item.title}>
          <NavigationMenuLink asChild>
            <Link
              href={item.href}
              className="flex select-none gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-bitcoin dark:hover:text-bitcoin focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-bitcoin dark:focus:text-bitcoin"
            >
              <item.icon className="h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium leading-none">{item.title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  );
}