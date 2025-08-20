import { EducationalSection } from './EducationalSidebar';

export const transactionEducation: EducationalSection[] = [
  {
    title: 'Understanding Transactions',
    icon: '📋',
    content: [
      'A Bitcoin transaction is like a digital check or money transfer. When someone sends Bitcoin, they create a record that says "move X amount from my address to another address."',
      'Each transaction gets a unique ID (like a tracking number) that\'s 64 characters long. This ID lets anyone verify the transaction happened and check its status.'
    ],
    tips: [
      'Transaction IDs always contain only numbers (0-9) and letters (a-f)',
      'Once confirmed, transactions cannot be reversed or cancelled',
      'The more confirmations, the more secure the transaction'
    ],
    links: [
      {
        title: 'How Bitcoin Transactions Work',
        url: 'https://ecos.am/en/blog/how-bitcoin-transactions-work-a-comprehensive-guide-to-bitcoin-transfers-security-and-verification/',
        description: 'Complete guide to transfers, security, and verification'
      },
      {
        title: 'Bitcoin Transaction Basics',
        url: 'https://bitcoin.org/en/how-it-works#transactions',
        description: 'Official Bitcoin.org explanation'
      }
    ]
  },
  {
    title: 'What Are Confirmations?',
    icon: '✅',
    content: [
      'Confirmations are like security stamps. Each confirmation means another "block" of transactions has been added after yours, making it harder to reverse.',
      'Most services consider a transaction safe after 1-3 confirmations (10-30 minutes). For large amounts, wait for 6+ confirmations.'
    ],
    tips: [
      '0 confirmations = transaction broadcast but not yet included in a block',
      '1 confirmation = transaction is in the latest block',
      '6+ confirmations = virtually impossible to reverse'
    ]
  }
];

export const feeEducation: EducationalSection[] = [
  {
    title: 'Why Do I Pay Fees?',
    icon: '💰',
    content: [
      'Bitcoin fees are like postage stamps - they pay the "miners" who process and secure transactions. Higher fees = faster processing, just like express mail costs more than regular mail.',
      'Fees go to miners (people running Bitcoin\'s network), not to any company or bank. The fee amount depends on how busy the network is.'
    ],
    tips: [
      'Fees are measured in "satoshis per byte" of data',
      'Larger transactions (more inputs/outputs) cost more',
      'Weekend mornings often have lower fees'
    ],
    links: [
      {
        title: 'Understanding Bitcoin Fees',
        url: 'https://support.bitcoin.com/en/articles/5344036-fees-for-sending-cryptocurrencies-and-transacting-on-public-blockchains',
        description: 'Why fees exist and how they work'
      },
      {
        title: 'Bitcoin Network Fees Guide',
        url: 'https://river.com/learn/bitcoin-basics/#fees',
        description: 'How to optimize your transaction fees'
      }
    ]
  },
  {
    title: 'Choosing the Right Fee',
    icon: '⚡',
    content: [
      'Priority fees get confirmed in 10-20 minutes but cost more. Economy fees save money but might take hours. Choose based on urgency.',
      'The network is like a highway - when it\'s busy (lots of transactions), you need to pay more to get through quickly.'
    ],
    tips: [
      'Not urgent? Use economy fees and save money',
      'Need it fast? Priority fees ensure quick confirmation',
      'Check network status before sending large amounts'
    ]
  }
];

export const networkEducation: EducationalSection[] = [
  {
    title: 'The Bitcoin Network',
    icon: '🌐',
    content: [
      'The Bitcoin network is like a global payment highway. When many people send transactions at once, it gets congested and fees go up.',
      'Every 10 minutes (on average), a new "block" of transactions is processed. Each block has limited space, so miners choose transactions with higher fees first.'
    ],
    tips: [
      'Green/Low congestion = great time to send',
      'Red/High congestion = consider waiting if not urgent',
      'Network resets don\'t exist - congestion clears naturally'
    ],
    links: [
      {
        title: 'How Bitcoin Works',
        url: 'https://bitcoin.org/en/how-it-works',
        description: 'Complete overview of the Bitcoin system'
      },
      {
        title: 'Understanding the Mempool',
        url: 'https://river.com/learn/what-is-the-bitcoin-mempool/',
        description: 'Where transactions wait to be confirmed'
      }
    ]
  },
  {
    title: 'Blocks and Mining',
    icon: '⛏️',
    content: [
      'Miners are computers that process transactions and secure the network. They compete to create new blocks every ~10 minutes.',
      'The "mempool" is like a waiting room where transactions sit until miners include them in a block.'
    ],
    tips: [
      'Block time averages 10 minutes but can vary',
      'Miners prioritize transactions with higher fees',
      'Network difficulty adjusts every 2016 blocks'
    ]
  }
];

export const addressEducation: EducationalSection[] = [
  {
    title: 'What\'s a Bitcoin Address?',
    icon: '📬',
    content: [
      'A Bitcoin address is like an email address for money. Share it to receive Bitcoin, but unlike email, you should use a new address for each transaction for better privacy.',
      'Addresses start with 1, 3, or bc1. They\'re derived from private keys (passwords) that only the owner should know.'
    ],
    tips: [
      'Never share your private keys, only addresses',
      'All address activity is public forever',
      'Use a new address for each payment you receive'
    ],
    links: [
      {
        title: 'How to Store Bitcoin Safely',
        url: 'https://river.com/learn/how-to-store-bitcoin/',
        description: 'Best practices for Bitcoin security'
      },
      {
        title: 'Bitcoin Address Types',
        url: 'https://river.com/learn/bitcoin-basics/#addresses',
        description: 'Understanding different address formats'
      }
    ]
  },
  {
    title: 'Privacy Considerations',
    icon: '🔐',
    content: [
      'Bitcoin is pseudonymous, not anonymous. Once someone knows your address, they can see all its transactions forever.',
      'For privacy, use a different address for each transaction and avoid reusing addresses.'
    ],
    tips: [
      'Consider using privacy-focused wallets',
      'Don\'t post addresses on social media',
      'Mixing services can improve privacy'
    ]
  }
];

export const timestampEducation: EducationalSection[] = [
  {
    title: 'Proof of Existence',
    icon: '📝',
    content: [
      'Timestamping proves a document existed at a specific time without revealing its contents. It\'s like a digital notary that can\'t be forged.',
      'Only a "fingerprint" (hash) of your file is recorded on the blockchain. The actual document never leaves your computer.'
    ],
    tips: [
      'Keep both the original file and proof file together',
      'Timestamps are permanent and unforgeable',
      'Free to create, small proof files'
    ],
    links: [
      {
        title: 'OpenTimestamps Protocol',
        url: 'https://opentimestamps.org/',
        description: 'How blockchain timestamping works'
      },
      {
        title: 'Use Cases for Timestamping',
        url: 'https://www.gemini.com/cryptopedia/bitcoin-for-dummies-how-does-bitcoin-work-blockchain-btc#timestamping',
        description: 'Real-world applications'
      }
    ]
  },
  {
    title: 'Legal Applications',
    icon: '⚖️',
    content: [
      'Timestamped documents can serve as evidence in legal disputes, proving when contracts were signed or when intellectual property was created.',
      'Many organizations now accept blockchain timestamps as valid proof of timing.'
    ],
    tips: [
      'Timestamp contracts before signing',
      'Protect intellectual property instantly',
      'Create audit trails for compliance'
    ]
  }
];
