export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Bitcoin Benefit',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Modern employee benefits calculator with Bitcoin vesting schemes and historical performance analysis',
    url: 'https://bitcoinbenefit.com',
    featureList: [
      'Bitcoin vesting calculator',
      'Historical performance analysis',
      'On-chain transaction tracking',
      'Real-time Bitcoin price integration',
      'Employee retention planning',
    ],
    screenshot: 'https://bitcoinbenefit.com/preview-icons/calculator-preview.png',
  },
  
  calculatorPage: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Bitcoin Vesting Calculator',
    description: 'Calculate employee vesting schedules with Bitcoin-based benefits',
    url: 'https://bitcoinbenefit.com/calculator',
    mainEntity: {
      '@type': 'FinancialCalculator',
      name: 'Bitcoin Vesting Calculator',
      description: 'Plan and calculate Bitcoin-based employee vesting schedules',
    },
  },
  
  historicalPage: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Historical Bitcoin Performance Calculator',
    description: 'Analyze historical Bitcoin investment performance and returns',
    url: 'https://bitcoinbenefit.com/historical',
    mainEntity: {
      '@type': 'FinancialCalculator',
      name: 'Historical Performance Calculator',
      description: 'Calculate historical Bitcoin investment returns and performance metrics',
    },
  },
  
  faqSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Bitcoin vesting?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bitcoin vesting is an employee benefit scheme where Bitcoin is allocated to employees over time, typically with a vesting schedule that encourages long-term retention.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the vesting calculator work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The calculator allows you to input grant details, vesting schedules, and uses real-time Bitcoin prices to project future values based on different growth scenarios.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all calculations are performed locally in your browser. No personal or financial data is sent to our servers.',
        },
      },
    ],
  },
}
