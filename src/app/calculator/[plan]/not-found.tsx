import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Vesting Plan Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          The vesting plan you're looking for doesn't exist.
        </p>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Available Plans:
          </h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/calculator/accelerator"
              className="bg-gradient-to-r from-bitcoin to-orange-500 hover:from-orange-500 hover:to-bitcoin text-white px-6 py-3 rounded-sm transition-all transform hover:scale-105 shadow-sm"
            >
              Pioneer (Accelerator)
            </Link>
            <Link
              href="/calculator/steady-builder"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-6 py-3 rounded-sm transition-all transform hover:scale-105 shadow-sm"
            >
              Stacker (Steady Builder)
            </Link>
            <Link
              href="/calculator/slow-burn"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white px-6 py-3 rounded-sm transition-all transform hover:scale-105 shadow-sm"
            >
              Builder (Slow Burn)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}