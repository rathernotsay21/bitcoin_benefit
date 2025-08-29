import React from 'react';
import {
  ClipboardDocumentListIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  BoltIcon,
  GlobeAltIcon,
  CubeIcon,
  InboxIcon,
  LockClosedIcon,
  BeakerIcon,
  LightBulbIcon,
  ClockIcon,
  DocumentTextIcon,
  BookOpenIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  RocketLaunchIcon,
  ForwardIcon,
  BackwardIcon,
  PauseIcon,
  ChartBarIcon,
  CalculatorIcon,
  AcademicCapIcon,
  WrenchIcon,
  ArrowPathIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Icon name to component mapping
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Educational content icons
  'clipboard': ClipboardDocumentListIcon,
  'scale': ScaleIcon,
  'dollar': CurrencyDollarIcon,
  'bolt': BoltIcon,
  'globe': GlobeAltIcon,
  'cube': CubeIcon,
  'inbox': InboxIcon,
  'lock': LockClosedIcon,
  'beaker': BeakerIcon,
  'lightbulb': LightBulbIcon,
  'clock': ClockIcon,
  'document-text': DocumentTextIcon,
  'book': BookOpenIcon,
  'briefcase': BriefcaseIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  'key': KeyIcon,
  'home': HomeIcon,
  
  // Status icons
  'check-circle': CheckCircleIcon,
  'x-circle': XCircleIcon,
  'question-mark': QuestionMarkCircleIcon,
  'exclamation-triangle': ExclamationTriangleIcon,
  'document': DocumentIcon,
  
  // Trend icons
  'arrow-trending-up': ArrowTrendingUpIcon,
  'arrow-trending-down': ArrowTrendingDownIcon,
  
  // Speed icons
  'rocket': RocketLaunchIcon,
  'forward': ForwardIcon,
  'backward': BackwardIcon,
  'pause': PauseIcon,
  
  // Tool icons
  'chart-bar': ChartBarIcon,
  'calculator': CalculatorIcon,
  'academic-cap': AcademicCapIcon,
  'wrench': WrenchIcon,
  'arrow-path': ArrowPathIcon,
  'cpu-chip': CpuChipIcon
};

// Helper function to get icon component
export function getIconComponent(iconName: string | undefined): React.ComponentType<{ className?: string }> | undefined {
  if (!iconName) return undefined;
  return iconMap[iconName];
}

// Component that renders an icon by name
export function IconByName({ name, className }: { name: string; className?: string }) {
  const IconComponent = getIconComponent(name);
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}