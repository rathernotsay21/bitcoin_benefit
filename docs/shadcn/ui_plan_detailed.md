## Implementation Checklist (Ordered by Value)

### 1. ✅ **Mobile Navigation Sheet** (HIGHEST VALUE)
**Impact:** Improves UX for ~50% of users on mobile devices
**Location:** `src/components/Navigation.tsx`
**Estimated Time:** 2-3 hours

#### Implementation Steps:

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add sheet
```

##### Step 2: Create MobileNavSheet Component
Create `src/components/MobileNavSheet.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from \"@/components/ui/sheet\";
import { MenuIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/ThemeProvider';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
}

export default function MobileNavSheet({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Auto-close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className=\"md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700\">
          <MenuIcon className=\"w-6 h-6 text-deepSlate dark:text-slate-100\" />
        </button>
      </SheetTrigger>
      <SheetContent side=\"left\" className=\"w-[280px] sm:w-[350px]\">
        <SheetHeader>
          <SheetTitle className=\"flex items-center space-x-2\">
            <SatoshiOutlineIcon className=\"w-8 h-8\" />
            <span className=\"text-bitcoin\">Bitcoin Benefits</span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className=\"flex flex-col space-y-4 mt-8\">
          {navItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-bitcoin/10 text-bitcoin' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className=\"w-5 h-5\" />
                <span className=\"font-medium\">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Theme Toggle in Sheet */}
        <div className=\"absolute bottom-4 left-4 right-4\">
          <button
            onClick={toggleTheme}
            className=\"w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700\"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

##### Step 3: Update Navigation.tsx
```tsx
// Add import at top
import MobileNavSheet from './MobileNavSheet';

// Replace mobile navigation section with:
{/* Mobile Navigation */}
<div className=\"md:hidden flex items-center\">
  <MobileNavSheet navItems={navItems} />
</div>
```

#### Testing Checklist:
- [ ] Test sheet opening/closing animation
- [ ] Verify auto-close on navigation
- [ ] Check backdrop click to close
- [ ] Test swipe gestures on mobile
- [ ] Verify theme toggle works inside sheet
- [ ] Test with screen readers

---

### 2. ✅ **Tabs for Scheme Selection** (HIGH VALUE)
**Impact:** Reduces vertical scroll, cleaner calculator interface
**Location:** `src/app/calculator/[scheme]/page.tsx` and `src/app/historical/page.tsx`
**Estimated Time:** 3-4 hours

#### Implementation Steps:

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add tabs
```

##### Step 2: Create SchemeTabSelector Component
Create `src/components/SchemeTabSelector.tsx`:

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { VestingScheme } from '@/types/vesting';

interface SchemeTabSelectorProps {
  schemes: VestingScheme[];
  selectedScheme: VestingScheme | null;
  onSchemeSelect: (schemeId: string) => void;
  basePath: '/calculator' | '/historical';
}

export default function SchemeTabSelector({
  schemes,
  selectedScheme,
  onSchemeSelect,
  basePath
}: SchemeTabSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (schemeId: string) => {
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('scheme', schemeId);
    router.push(`${basePath}?${params.toString()}`);
    
    // Update state
    onSchemeSelect(schemeId);
  };

  return (
    <Tabs 
      value={selectedScheme?.id || schemes[0].id} 
      onValueChange={handleTabChange}
      className=\"w-full\"
    >
      <TabsList className=\"grid w-full grid-cols-3 bg-gray-100 dark:bg-slate-800\">
        {schemes.map((scheme) => (
          <TabsTrigger
            key={scheme.id}
            value={scheme.id}
            className=\"data-[state=active]:bg-bitcoin data-[state=active]:text-white\"
          >
            <div className=\"flex flex-col items-center py-1\">
              <span className=\"font-semibold\">{scheme.name}</span>
              <span className=\"text-xs opacity-80 hidden sm:inline\">
                {scheme.shortDescription}
              </span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {schemes.map((scheme) => (
        <TabsContent 
          key={scheme.id} 
          value={scheme.id}
          className=\"mt-4 p-4 bg-orange-50 dark:bg-slate-800 rounded-lg\"
        >
          <div className=\"space-y-3\">
            <h3 className=\"font-bold text-lg\">{scheme.name} Strategy</h3>
            <p className=\"text-sm text-gray-600 dark:text-slate-300\">
              {scheme.description}
            </p>
            <div className=\"grid grid-cols-2 gap-4 pt-2\">
              <div className=\"text-sm\">
                <span className=\"font-medium\">Initial Grant:</span>
                <span className=\"ml-2 text-bitcoin\">₿{scheme.initialGrant}</span>
              </div>
              {scheme.annualGrant > 0 && (
                <div className=\"text-sm\">
                  <span className=\"font-medium\">Annual Grant:</span>
                  <span className=\"ml-2 text-bitcoin\">₿{scheme.annualGrant}</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

##### Step 3: Update Calculator Pages
In `src/app/calculator/[scheme]/page.tsx`:

```tsx
// Replace scheme selection cards with:
<div className=\"card glass\">
  <div className=\"flex items-center mb-4\">
    <SatoshiIcon className=\"w-6 h-6 text-bitcoin mr-3\" />
    <h2 className=\"text-2xl font-bold\">Select Strategy</h2>
  </div>
  
  <SchemeTabSelector
    schemes={VESTING_SCHEMES}
    selectedScheme={selectedScheme}
    onSchemeSelect={handleSchemeSelect}
    basePath=\"/calculator\"
  />
</div>
```

##### Step 4: Mobile Responsive Adjustments
```css
/* Add to globals.css */
@media (max-width: 640px) {
  .tabs-list {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  
  .tabs-trigger {
    scroll-snap-align: start;
    min-width: 120px;
  }
}
```

#### Testing Checklist:
- [ ] Test tab switching updates URL
- [ ] Verify browser back/forward navigation
- [ ] Check keyboard navigation (arrow keys)
- [ ] Test mobile horizontal scroll
- [ ] Verify scheme data loads correctly
- [ ] Check animations and transitions

---

### 3. ✅ **Dialog for Custom Vesting Schedule** (HIGH VALUE)
**Impact:** Better UX for complex form, proper focus management
**Location:** `src/components/CustomVestingSchedule.tsx`
**Estimated Time:** 4-5 hours

#### Implementation Steps:

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add dialog form button
npm install react-hook-form zod @hookform/resolvers
```

##### Step 2: Create New Custom Vesting Dialog
Create `src/components/CustomVestingDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from \"@/components/ui/dialog\";
import { Button } from \"@/components/ui/button\";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from \"@/components/ui/form\";
import { Input } from \"@/components/ui/input\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";
import { CustomVestingEvent } from '@/types/vesting';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

// Validation schema
const vestingEventSchema = z.object({
  timePeriod: z.number().min(1).max(120),
  percentageVested: z.number().min(1).max(100),
});

const formSchema = z.object({
  events: z.array(vestingEventSchema).min(1).max(10),
});

interface CustomVestingDialogProps {
  customVestingEvents: CustomVestingEvent[];
  onSave: (events: CustomVestingEvent[]) => void;
  onClear: () => void;
}

export default function CustomVestingDialog({
  customVestingEvents,
  onSave,
  onClear
}: CustomVestingDialogProps) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<CustomVestingEvent[]>(
    customVestingEvents.length > 0 ? customVestingEvents : [
      { id: '1', timePeriod: 12, percentageVested: 25, label: '1 year' }
    ]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      events: events,
    },
  });

  const handleAddEvent = () => {
    const newEvent: CustomVestingEvent = {
      id: `event-${Date.now()}`,
      timePeriod: 24,
      percentageVested: 50,
      label: '2 years'
    };
    setEvents([...events, newEvent]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleSave = () => {
    // Validate cumulative percentages
    const sortedEvents = [...events].sort((a, b) => a.timePeriod - b.timePeriod);
    let isValid = true;
    let prevPercentage = 0;
    
    for (const event of sortedEvents) {
      if (event.percentageVested <= prevPercentage) {
        isValid = false;
        break;
      }
      prevPercentage = event.percentageVested;
    }
    
    if (!isValid) {
      alert('Each vesting event must have a higher percentage than the previous one');
      return;
    }
    
    onSave(events);
    setOpen(false);
  };

  const handleClear = () => {
    if (confirm('Clear all custom vesting events?')) {
      setEvents([]);
      onClear();
      setOpen(false);
    }
  };

  // Preview chart data
  const getPreviewData = () => {
    return events
      .sort((a, b) => a.timePeriod - b.timePeriod)
      .map(event => ({
        month: event.timePeriod,
        percentage: event.percentageVested,
        label: event.label
      }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={customVestingEvents.length > 0 ? \"default\" : \"outline\"}>
          {customVestingEvents.length > 0 ? 'Edit Custom Schedule' : 'Customize Schedule'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className=\"max-w-2xl max-h-[80vh] overflow-y-auto\">
        <DialogHeader>
          <DialogTitle>Custom Vesting Schedule</DialogTitle>
          <DialogDescription>
            Define when and how much of the Bitcoin grant vests over time.
            Each event must have a higher percentage than the previous.
          </DialogDescription>
        </DialogHeader>

        <div className=\"space-y-4 py-4\">
          {/* Vesting Events List */}
          <div className=\"space-y-2\">
            <Label>Vesting Events</Label>
            {events.map((event, index) => (
              <div key={event.id} className=\"flex items-center space-x-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg\">
                <span className=\"text-sm font-medium w-8\">#{index + 1}</span>
                
                <Select
                  value={event.timePeriod.toString()}
                  onValueChange={(value) => {
                    const updated = [...events];
                    updated[index].timePeriod = parseInt(value);
                    setEvents(updated);
                  }}
                >
                  <SelectTrigger className=\"flex-1\">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"3\">90 days</SelectItem>
                    <SelectItem value=\"6\">6 months</SelectItem>
                    <SelectItem value=\"12\">1 year</SelectItem>
                    <SelectItem value=\"24\">2 years</SelectItem>
                    <SelectItem value=\"36\">3 years</SelectItem>
                    <SelectItem value=\"48\">4 years</SelectItem>
                    <SelectItem value=\"60\">5 years</SelectItem>
                    <SelectItem value=\"120\">10 years</SelectItem>
                  </SelectContent>
                </Select>

                <div className=\"flex items-center space-x-1\">
                  <Input
                    type=\"number\"
                    min=\"1\"
                    max=\"100\"
                    value={event.percentageVested}
                    onChange={(e) => {
                      const updated = [...events];
                      updated[index].percentageVested = parseInt(e.target.value) || 0;
                      setEvents(updated);
                    }}
                    className=\"w-20 text-center\"
                  />
                  <span className=\"text-sm\">%</span>
                </div>

                <Button
                  size=\"icon\"
                  variant=\"ghost\"
                  onClick={() => handleRemoveEvent(event.id)}
                  className=\"text-red-500 hover:text-red-700\"
                >
                  <TrashIcon className=\"w-4 h-4\" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Event Button */}
          {events.length < 10 && (
            <Button
              type=\"button\"
              variant=\"outline\"
              onClick={handleAddEvent}
              className=\"w-full\"
            >
              <PlusIcon className=\"w-4 h-4 mr-2\" />
              Add Vesting Event
            </Button>
          )}

          {/* Visual Preview */}
          <div className=\"p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg\">
            <h4 className=\"font-medium mb-2\">Preview</h4>
            <div className=\"space-y-2\">
              {getPreviewData().map((item, index) => (
                <div key={index} className=\"flex items-center justify-between text-sm\">
                  <span>{item.label}</span>
                  <div className=\"flex items-center space-x-2\">
                    <div className=\"w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-2\">
                      <div 
                        className=\"bg-bitcoin h-2 rounded-full transition-all\"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className=\"font-medium w-12 text-right\">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preset Templates */}
          <div className=\"p-4 bg-gray-50 dark:bg-slate-800 rounded-lg\">
            <h4 className=\"font-medium mb-2\">Quick Templates</h4>
            <div className=\"grid grid-cols-2 gap-2\">
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={() => {
                  setEvents([
                    { id: '1', timePeriod: 3, percentageVested: 10, label: '90 days' },
                    { id: '2', timePeriod: 12, percentageVested: 30, label: '1 year' },
                    { id: '3', timePeriod: 24, percentageVested: 50, label: '2 years' },
                    { id: '4', timePeriod: 36, percentageVested: 75, label: '3 years' },
                    { id: '5', timePeriod: 48, percentageVested: 100, label: '4 years' },
                  ]);
                }}
              >
                90-Day Cliff
              </Button>
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={() => {
                  setEvents([
                    { id: '1', timePeriod: 12, percentageVested: 25, label: '1 year' },
                    { id: '2', timePeriod: 24, percentageVested: 50, label: '2 years' },
                    { id: '3', timePeriod: 36, percentageVested: 75, label: '3 years' },
                    { id: '4', timePeriod: 48, percentageVested: 100, label: '4 years' },
                  ]);
                }}
              >
                Equal Annual
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant=\"outline\" onClick={handleClear}>
            Clear All
          </Button>
          <Button onClick={handleSave}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Testing Checklist:
- [ ] Test dialog open/close animations
- [ ] Verify form validation works
- [ ] Check adding/removing events
- [ ] Test preset templates
- [ ] Verify preview updates live
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Check mobile responsiveness

---

### 4. ✅ **Enhanced Data Tables** (HIGH VALUE)
**Impact:** Better data visualization, sorting, responsive behavior
**Location:** `src/app/historical/page.tsx`
**Estimated Time:** 3-4 hours

#### Implementation Steps:

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add table
npm install @tanstack/react-table
```

##### Step 2: Create Enhanced Data Table
Create `src/components/HistoricalDataTable.tsx`:

```tsx
'use client';

import { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from \"@/components/ui/table\";
import { Button } from \"@/components/ui/button\";
import { ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { DownloadIcon } from '@heroicons/react/24/solid';

interface DataTableProps {
  data: any[];
  currentBitcoinPrice: number;
  startingYear: number;
}

export default function HistoricalDataTable({ 
  data, 
  currentBitcoinPrice,
  startingYear 
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Define columns with responsive visibility
  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'year',
      header: ({ column }) => (
        <Button
          variant=\"ghost\"
          onClick={() => column.toggleSorting(column.getIsSorted() === \"asc\")}
          className=\"h-auto p-0 font-medium\"
        >
          Year
          {column.getIsSorted() === \"asc\" ? (
            <ArrowUpIcon className=\"ml-2 h-3 w-3\" />
          ) : column.getIsSorted() === \"desc\" ? (
            <ArrowDownIcon className=\"ml-2 h-3 w-3\" />
          ) : (
            <ArrowsUpDownIcon className=\"ml-2 h-3 w-3\" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const year = row.getValue('year') as number;
        const yearsFromStart = year - startingYear;
        return (
          <div className=\"font-medium\">
            {year}
            {yearsFromStart === 5 && (
              <span className=\"ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded\">
                5Y
              </span>
            )}
            {yearsFromStart === 10 && (
              <span className=\"ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded\">
                10Y
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'grantCost',
      header: ({ column }) => (
        <Button
          variant=\"ghost\"
          onClick={() => column.toggleSorting(column.getIsSorted() === \"asc\")}
          className=\"h-auto p-0 font-medium hidden sm:flex\"
        >
          Grant Cost
          {column.getIsSorted() && (
            column.getIsSorted() === \"asc\" ? 
              <ArrowUpIcon className=\"ml-2 h-3 w-3\" /> : 
              <ArrowDownIcon className=\"ml-2 h-3 w-3\" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const amount = row.getValue('grantCost') as number;
        return (
          <div className=\"hidden sm:block\">
            {amount > 0 ? (
              <span className=\"font-medium text-orange-600\">
                ${amount.toLocaleString()}
              </span>
            ) : (
              <span className=\"text-gray-400\">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'btcAmount',
      header: ({ column }) => (
        <Button
          variant=\"ghost\"
          onClick={() => column.toggleSorting(column.getIsSorted() === \"asc\")}
          className=\"h-auto p-0 font-medium\"
        >
          BTC
          {column.getIsSorted() && (
            column.getIsSorted() === \"asc\" ? 
              <ArrowUpIcon className=\"ml-2 h-3 w-3\" /> : 
              <ArrowDownIcon className=\"ml-2 h-3 w-3\" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const amount = row.getValue('btcAmount') as number;
        return <div className=\"font-mono\">₿{amount.toFixed(3)}</div>;
      },
    },
    {
      accessorKey: 'historicalPrice',
      header: 'BTC Price',
      cell: ({ row }) => {
        const price = row.getValue('historicalPrice') as number;
        return (
          <div className=\"hidden md:block\">
            {price > 0 ? `$${price.toLocaleString()}` : '—'}
          </div>
        );
      },
    },
    {
      accessorKey: 'currentValue',
      header: ({ column }) => (
        <Button
          variant=\"ghost\"
          onClick={() => column.toggleSorting(column.getIsSorted() === \"asc\")}
          className=\"h-auto p-0 font-medium\"
        >
          Current Value
          {column.getIsSorted() && (
            column.getIsSorted() === \"asc\" ? 
              <ArrowUpIcon className=\"ml-2 h-3 w-3\" /> : 
              <ArrowDownIcon className=\"ml-2 h-3 w-3\" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue('currentValue') as number;
        return (
          <div className=\"font-semibold text-green-600\">
            ${value.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'vestingPercent',
      header: 'Vested',
      cell: ({ row }) => {
        const percent = row.getValue('vestingPercent') as number;
        return (
          <div className=\"text-center\">
            <span className={`
              inline-flex px-2 py-1 rounded-full text-xs font-medium
              ${percent === 100 ? 'bg-green-100 text-green-800' :
                percent === 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {percent}%
            </span>
          </div>
        );
      },
    },
  ], [startingYear]);

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

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Year', 'Grant Cost', 'BTC Amount', 'BTC Price', 'Current Value', 'Vesting %'];
    const rows = data.map(row => [
      row.year,
      row.grantCost,
      row.btcAmount,
      row.historicalPrice,
      row.currentValue,
      row.vestingPercent
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\
');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitcoin-benefit-history-${startingYear}.csv`;
    a.click();
  };

  return (
    <div className=\"space-y-4\">
      {/* Table Header with Export */}
      <div className=\"flex justify-between items-center\">
        <h3 className=\"text-lg font-semibold\">Annual Breakdown</h3>
        <Button
          variant=\"outline\"
          size=\"sm\"
          onClick={exportToCSV}
        >
          <DownloadIcon className=\"w-4 h-4 mr-2\" />
          Export CSV
        </Button>
      </div>

      {/* Responsive Table */}
      <div className=\"rounded-lg border overflow-hidden\">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && \"selected\"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className=\"h-24 text-center\">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-`
}



