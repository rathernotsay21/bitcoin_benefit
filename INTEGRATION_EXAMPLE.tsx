// Example: How to integrate the Advanced Analytics Dashboard into your calculator page

// In your calculator page component (e.g., src/app/calculator/page.tsx)
// Add this import at the top:
import AdvancedAnalyticsDashboard from '@/components/AdvancedAnalyticsDashboard';

// Then, in your component where you display results, add:

{/* After the existing results display */}
{results && displayScheme && (
  <div className="mt-8">
    <AdvancedAnalyticsDashboard
      vestingResults={results}
      currentBitcoinPrice={currentBitcoinPrice}
      projectedGrowth={inputs.projectedBitcoinGrowth || 15}
      employeeCount={100} // Or get from user input
      annualSalary={120000} // Or get from user input
    />
  </div>
)}

// Optional: Add employee count and salary inputs to customize the analysis
<div className="card mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Company Details (Optional)
  </h3>
  
  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Number of Employees
      </label>
      <input
        type="number"
        value={employeeCount}
        onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 100)}
        className="input-field"
        min="1"
        max="10000"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Average Annual Salary
      </label>
      <input
        type="number"
        value={annualSalary}
        onChange={(e) => setAnnualSalary(parseInt(e.target.value) || 120000)}
        className="input-field"
        min="30000"
        max="500000"
        step="5000"
      />
    </div>
  </div>
  
  <p className="mt-3 text-xs text-gray-500">
    These details help calculate retention impact and ROI of your vesting program.
  </p>
</div>

// State management for the inputs
const [employeeCount, setEmployeeCount] = useState(100);
const [annualSalary, setAnnualSalary] = useState(120000);

// Full integration example with all features:
export function EnhancedCalculatorPage() {
  // ... existing state and logic ...
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... existing header and layout ... */}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Scheme Selection */}
          <div className="lg:col-span-1">
            {/* ... existing scheme selection ... */}
          </div>
          
          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {/* Existing results display */}
            <ChartErrorBoundary>
              {results && displayScheme && (
                <VestingTimelineChart
                  timeline={results.timeline}
                  initialGrant={displayScheme.initialGrant}
                  annualGrant={displayScheme.annualGrant}
                  projectedBitcoinGrowth={inputs.projectedBitcoinGrowth || 15}
                  currentBitcoinPrice={currentBitcoinPrice}
                  schemeId={displayScheme.id}
                />
              )}
            </ChartErrorBoundary>
            
            {/* NEW: Advanced Analytics Dashboard */}
            {results && displayScheme && (
              <div className="mt-8">
                <AdvancedAnalyticsDashboard
                  vestingResults={results}
                  currentBitcoinPrice={currentBitcoinPrice}
                  projectedGrowth={inputs.projectedBitcoinGrowth || 15}
                  employeeCount={employeeCount}
                  annualSalary={annualSalary}
                />
              </div>
            )}
            
            {/* NEW: Company Details Input */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customize Analysis
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Count
                  </label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Salary
                  </label>
                  <input
                    type="number"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(parseInt(e.target.value) || 120000)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="30000"
                    step="5000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// You can also use individual analysis components separately:
import TaxImplicationsCard from '@/components/TaxImplicationsCard';
import RiskAnalysisCard from '@/components/RiskAnalysisCard';
import RetentionAnalysisCard from '@/components/RetentionAnalysisCard';

// Example of using just the tax analysis:
{results && (
  <TaxImplicationsCard
    vestedValue={results.timeline[results.timeline.length - 1].usdValue}
    costBasis={results.totalCost}
    holdingPeriodMonths={results.timeline.length}
    annualIncome={annualSalary}
  />
)}

// Example of using just the risk analysis:
{results && (
  <RiskAnalysisCard
    portfolioValue={results.timeline[results.timeline.length - 1].usdValue}
    expectedAnnualReturn={projectedGrowth / 100}
    timePeriodYears={results.timeline.length / 12}
  />
)}
