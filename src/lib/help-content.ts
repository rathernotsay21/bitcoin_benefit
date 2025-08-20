export const HELP_CONTENT = {
  // Calculator Terms
  initialGrant: "The starting Bitcoin award amount given to your employee. They'll earn this award gradually over time according to the schedule you choose.",
  
  annualGrant: "Extra Bitcoin given each year to keep your best employees. These yearly awards help spread out the timing and make the program more affordable.",
  
  unlockingSchedule: "The timeline showing when employees actually own their Bitcoin award. This encourages them to stay with your company longer.",
  
  costBasisMethod: "How the initial purchase price is calculated for historical analysis: Average (typical market price), High (worst case for employer cost), or Low (best case for employer cost).",
  
  projectedGrowth: "The expected annual growth rate for Bitcoin's price. This is used to calculate future value projections but actual performance may vary significantly.",

  // Metrics Terms
  cagr: "Compound Annual Growth Rate - The average yearly growth rate of an investment over a period of time, accounting for compounding effects. Shows smoothed long-term performance.",
  
  roi: "Return on Investment - The percentage gain or loss on an investment relative to its initial cost. Calculated as (Current Value - Initial Cost) / Initial Cost × 100.",
  
  growthMultiple: "How many times the initial investment has grown. A 3x multiple means the investment is worth 3 times its original value, representing a 200% gain.",
  
  totalCost: "The total USD amount needed to fund all Bitcoin grants over the unlocking period, calculated using current or historical Bitcoin prices.",

  // Unlocking Terms
  cliffUnlocking: "An unlocking schedule where no benefits unlock until a specific date, then a large percentage unlocks all at once. Common in traditional equity compensation.",
  
  gradualUnlocking: "Benefits unlock incrementally over time, typically monthly or quarterly, providing a smooth unlocking curve and reducing employee departure risk.",
  
  acceleratedUnlocking: "Unlocking that speeds up under certain conditions, such as company acquisition, IPO, or other trigger events defined in the compensation plan.",

  unlockingPercent: "How much of the Bitcoin award the employee has earned so far. At 100%, they've earned it all.",

  // Bitcoin Terms
  btcPrice: "The current market price of Bitcoin in USD. This fluctuates constantly based on market conditions, supply and demand, and various economic factors.",
  
  satoshi: "The smallest unit of Bitcoin (0.00000001 BTC). Named after Bitcoin's pseudonymous creator, Satoshi Nakamoto. 100 million satoshis equal 1 Bitcoin.",
  
  coldStorage: "Offline storage of Bitcoin private keys, typically using hardware wallets or paper wallets. The most secure storage method for long-term holdings.",

  marketVolatility: "Bitcoin's price can be highly volatile, with significant daily fluctuations. This creates both opportunities and risks for Bitcoin-based compensation.",

  // Strategy Terms
  pioneerStrategy: "The bold approach with a bigger upfront award that employees earn faster. Great for startups that want to attract top talent with exciting rewards.",
  
  stackerStrategy: "The balanced approach with a good starting award plus yearly additions. Perfect for growing companies that want steady, manageable benefits.",
  
  builderStrategy: "The gradual approach with smaller awards spread over many years. Ideal for companies that want to keep costs low and predictable.",

  // Historical Analysis Terms
  historicalPerformance: "How the unlocking strategy would have performed using actual Bitcoin price data from the past. Helps understand potential outcomes and risks.",

  costBasis: "The original purchase price of Bitcoin grants, used to calculate gains or losses. Different cost basis methods (high, low, average) show various scenarios.",

  yearOverYear: "Comparing performance from one year to the next, showing how Bitcoin's volatility affects year-to-year benefit values.",

  // Risk Terms
  concentrationRisk: "The risk of having too much compensation tied to a single asset (Bitcoin). Diversification across multiple assets can help manage this risk.",

  liquidityRisk: "The risk that Bitcoin holdings cannot be easily converted to cash when needed. Market conditions and timing can affect liquidity.",

  regulatoryRisk: "The risk that government regulations could affect Bitcoin's value or usability as a compensation tool. Laws and regulations continue to evolve.",

  // Implementation Terms
  custodyOptions: "Different ways to store and manage Bitcoin grants: company custody, third-party custody services, or employee self-custody with proper security measures.",

  taxImplications: "Bitcoin compensation may have complex tax consequences. The value at grant time, unlocking events, and eventual sale can all create taxable events.",

  complianceRequirements: "Legal and regulatory requirements that may apply to Bitcoin-based compensation programs, varying by jurisdiction and company size.",
} as const;

export type HelpContentKey = keyof typeof HELP_CONTENT;