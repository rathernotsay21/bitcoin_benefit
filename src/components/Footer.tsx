'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalculatorIcon,
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  LinkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { BitcoinIcon } from '@/components/icons';

export default function Footer() {
  const pathname = usePathname();

  // Don't show CTA on calculator/historical pages (they already have their own calculators)
  const showCTA = !pathname.includes('/calculator') && !pathname.includes('/historical');

  return (
    <>
      {/* CTA Section - Only show on non-calculator pages */}
      {showCTA && (
        <section className="py-20 bg-gradient-to-br from-bitcoin to-orange-600 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Keep Your Best People?
            </h3>
            <p className="text-xl text-orange-100 dark:text-slate-300 mb-10 leading-relaxed">
              See how much this modern benefit could save you in turnover costs and help you compete for top talent.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/calculator" 
                className="bg-white dark:bg-slate-800 text-bitcoin dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-700 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                <span>Calculate Your ROI</span>
              </Link>
              <Link 
                href="/historical" 
                className="bg-orange-600 dark:bg-slate-600 text-white hover:bg-orange-700 dark:hover:bg-slate-500 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 border-2 border-white/30 shadow-xl inline-flex items-center justify-center space-x-2"
              >
                <ClockIcon className="w-5 h-5" />
                <span>See How it Worked</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Explore More Section */}
      <section className="py-16 bg-slate-800 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Explore More</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {/* Home */}
            <Link 
              href="/"
              className={`group relative p-6 bg-slate-700 dark:bg-slate-800 rounded-xl hover:bg-slate-600 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 ${
                pathname === '/' ? 'ring-2 ring-bitcoin' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <HomeIcon className="w-6 h-6 text-bitcoin dark:text-bitcoin group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-white">Home</h4>
                  <p className="text-xs text-slate-300 mt-1">Start here</p>
                </div>
              </div>
            </Link>

            {/* Forecast Calculator */}
            <Link 
              href="/calculator"
              className={`group relative p-6 bg-slate-700 dark:bg-slate-800 rounded-xl hover:bg-slate-600 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 ${
                pathname.includes('/calculator') ? 'ring-2 ring-bitcoin' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalculatorIcon className="w-6 h-6 text-bitcoin dark:text-bitcoin group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-white">Forecast</h4>
                  <p className="text-xs text-slate-300 mt-1">Plan future benefits</p>
                </div>
              </div>
            </Link>

            {/* Performance Analysis */}
            <Link 
              href="/historical"
              className={`group relative p-6 bg-slate-700 dark:bg-slate-800 rounded-xl hover:bg-slate-600 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 ${
                pathname === '/historical' ? 'ring-2 ring-bitcoin' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="w-6 h-6 text-bitcoin dark:text-bitcoin group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-white">Performance</h4>
                  <p className="text-xs text-slate-300 mt-1">Historical analysis</p>
                </div>
              </div>
            </Link>

            {/* Status Tracker */}
            <Link 
              href="/track"
              className={`group relative p-6 bg-slate-700 dark:bg-slate-800 rounded-xl hover:bg-slate-600 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 ${
                pathname === '/track' ? 'ring-2 ring-bitcoin' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <LinkIcon className="w-6 h-6 text-bitcoin dark:text-bitcoin group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-white">Status</h4>
                  <p className="text-xs text-slate-300 mt-1">Track on-chain</p>
                </div>
              </div>
            </Link>

            {/* Guide */}
            <Link 
              href="/learn"
              className={`group relative p-6 bg-slate-700 dark:bg-slate-800 rounded-xl hover:bg-slate-600 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 ${
                pathname === '/learn' ? 'ring-2 ring-bitcoin' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="w-6 h-6 text-bitcoin dark:text-bitcoin group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-white">Guide</h4>
                  <p className="text-xs text-slate-300 mt-1">Learn more</p>
                </div>
              </div>
            </Link>

            {/* Buy Bitcoin */}
            <a 
              href="https://river.com/signup?r=RH5MJKJM"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-6 bg-gradient-to-br from-bitcoin to-orange-600 rounded-xl hover:from-orange-600 hover:to-bitcoin transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <BitcoinIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-white">Buy Bitcoin</h4>
                  <p className="text-xs text-orange-100 mt-1">Get started with River</p>
                </div>
              </div>
            </a>
          </div>

          {/* Footer Bottom */}
          <div className="text-center pt-8 border-t border-slate-700">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6">
              <BitcoinIcon className="w-8 h-8 text-bitcoin" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Build loyalty. Reduce turnover. Keep your best people.
            </h4>
            <p className="text-slate-400 mb-8">
              The modern employee benefit that small businesses use to compete with big companies
            </p>
            <div className="text-sm text-slate-500">
              <p>Webmaster - Rather Notsay</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}