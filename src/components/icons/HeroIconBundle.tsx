// Optimized hero icon bundle - reduces individual imports
import {
  HomeIcon,
  CalculatorIcon,
  ClockIcon,
  BookOpenIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CubeIcon,
  DocumentTextIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

import {
  HomeIcon as HomeIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  ClockIcon as ClockIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  LinkIcon as LinkIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';

// Export all icons from one place to avoid duplicate imports
export const Icons = {
  // Outline icons
  Home: HomeIcon,
  Calculator: CalculatorIcon,
  Clock: ClockIcon,
  BookOpen: BookOpenIcon,
  Link: LinkIcon,
  MagnifyingGlass: MagnifyingGlassIcon,
  Sun: SunIcon,
  Moon: MoonIcon,
  ChartBar: ChartBarIcon,
  ClipboardDocumentCheck: ClipboardDocumentCheckIcon,
  Heart: HeartIcon,
  CurrencyDollar: CurrencyDollarIcon,
  ShieldCheck: ShieldCheckIcon,
  Bolt: BoltIcon,
  Cube: CubeIcon,
  DocumentText: DocumentTextIcon,
  Wallet: WalletIcon,
  
  // Solid icons
  HomeSolid: HomeIconSolid,
  CalculatorSolid: CalculatorIconSolid,
  ClockSolid: ClockIconSolid,
  BookOpenSolid: BookOpenIconSolid,
  LinkSolid: LinkIconSolid,
  MagnifyingGlassSolid: MagnifyingGlassIconSolid
};