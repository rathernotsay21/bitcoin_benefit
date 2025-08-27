'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface HistoricalDataPoint {
  year: number;
  grantCost: number;
  btcAmount: number;
  historicalPrice: number;
  historicalValue: number;
  currentValue: number;
  vestingPercent: number;
  yearsFromStart: number;
}

interface HistoricalDataTableProps {
  data: HistoricalDataPoint[];
  currentBitcoinPrice: number;
  startingYear: number;
  totalCostBasis: number;
  totalBitcoinGranted: number;
  costBasisMethod: string;
}

function formatBTC(amount: number): string {
  return `₿${amount.toFixed(3)}`;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const columnHelper = createColumnHelper<HistoricalDataPoint>();

export default function HistoricalDataTable({ 
  data, 
  currentBitcoinPrice, 
  startingYear,
  totalCostBasis,
  totalBitcoinGranted,
  costBasisMethod
}: HistoricalDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => [
    columnHelper.accessor('year', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-medium text-gray-500 dark:text-white/80 uppercase text-xs"
        >
          Year
          {column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {getValue()}
        </span>
      ),
    }),
    
    columnHelper.accessor('grantCost', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-medium text-gray-500 dark:text-white/80 uppercase text-xs hidden sm:flex"
        >
          Award Cost
          {column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const cost = getValue();
        return (
          <span className={`text-sm hidden sm:inline ${cost > 0 ? 'font-medium text-bitcoin-600 dark:text-orange-400' : 'text-gray-400 dark:text-white/50'}`}>
            {cost > 0 ? formatUSD(cost) : '—'}
          </span>
        );
      },
    }),

    columnHelper.accessor('btcAmount', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-medium text-gray-500 dark:text-white/80 uppercase text-xs"
        >
          BTC
          {column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 dark:text-white/90">
          {formatBTC(getValue())}
        </span>
      ),
    }),

    columnHelper.accessor('historicalPrice', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-medium text-gray-500 dark:text-white/80 uppercase text-xs hidden md:flex"
        >
          BTC Price
          {column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const price = getValue();
        return (
          <span className="text-sm text-gray-700 dark:text-white/90 hidden md:table-cell">
            {price > 0 ? formatUSD(price) : '—'}
          </span>
        );
      },
    }),

    columnHelper.accessor('historicalValue', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-medium text-gray-500 dark:text-white/80 uppercase text-xs hidden lg:flex"
        >
          Historical USD
          {column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className="text-sm text-gray-700 dark:text-white/90 hidden lg:table-cell">
            {value > 0 ? formatUSD(value) : '—'}
          </span>
        );
      },
    }),

    columnHelper.accessor('currentValue', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-medium text-gray-500 dark:text-white/80 uppercase text-xs"
        >
          Current USD
          {column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
          {formatUSD(getValue())}
        </span>
      ),
    }),

    columnHelper.accessor('vestingPercent', {
      header: () => (
        <span className="font-medium text-gray-500 dark:text-white/80 uppercase text-xs">
          Unlocked
        </span>
      ),
      cell: ({ getValue }) => {
        const percent = getValue();
        const variant = percent === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                       percent === 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                       'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        
        return (
          <Badge className={`${variant} text-xs font-medium`}>
            {percent}%
          </Badge>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const downloadCSV = () => {
    const headers = ['Year', 'Award Cost', 'BTC', 'BTC Price', 'Historical USD', 'Current USD', 'Unlocked %'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.year,
        row.grantCost || 0,
        row.btcAmount,
        row.historicalPrice || 0,
        row.historicalValue || 0,
        row.currentValue,
        row.vestingPercent
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitcoin-award-history-${startingYear}-${new Date().getFullYear()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    // Get the final cumulative Bitcoin amount from the last row
    // Each row's btcAmount is already cumulative, so we just need the last one
    const totalBTC = data[data.length - 1]?.btcAmount || 0;
    const currentTotalValue = data[data.length - 1]?.currentValue || 0;
    const roi = totalCostBasis > 0 ? ((currentTotalValue - totalCostBasis) / totalCostBasis * 100) : 0;
    
    return {
      totalBTC,
      currentTotalValue,
      roi,
      years: data.length
    };
  }, [data, totalCostBasis]);

  return (
    <div className="space-y-6">
      {/* Header with CSV Export */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Year-by-Year Results
        </h3>
        <Button
          onClick={downloadCSV}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Explanatory text */}
      <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
        Here's the year-by-year breakdown of what actually happened. You can see the real costs you would have paid each year and how much that Bitcoin would be worth today. Remember, past performance doesn't guarantee future results, but it shows Bitcoin's proven track record.
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-bitcoin">
            {formatBTC(summaryStats.totalBTC)}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">Total Bitcoin</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatUSD(summaryStats.currentTotalValue)}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">Worth Today</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-bitcoin-600">
            {summaryStats.roi.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">ROI</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {summaryStats.years}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">Years</div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div className="rounded-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-2 sm:px-4 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-slate-700">
            {table.getRowModel().rows.map((row) => {
              const yearsFromStart = row.original.yearsFromStart;
              const rowClassName = yearsFromStart === 10 ? 'bg-green-50 dark:bg-green-900/20' : 
                                   yearsFromStart === 5 ? 'bg-yellow-50 dark:bg-yellow-900/20' : '';
              
              return (
                <TableRow key={row.id} className={rowClassName}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 sm:px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Total Award Cost Summary */}
      <div className="p-4 bg-orange-50 dark:bg-bitcoin-900/20 border border-bitcoin-200 dark:border-bitcoin-800 rounded-sm">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="text-sm font-semibold text-orange-900 dark:text-orange-200">
              What You Actually Paid
            </h5>
            <p className="text-xs text-bitcoin-700 dark:text-orange-300 mt-1">
              Using {costBasisMethod} Bitcoin prices from each year
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
              {formatUSD(totalCostBasis)}
            </div>
            <div className="text-xs text-bitcoin dark:text-bitcoin">
              {formatBTC(totalBitcoinGranted)} total awards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}