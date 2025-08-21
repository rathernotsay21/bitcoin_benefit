import { NextRequest, NextResponse } from 'next/server';

interface TimestampStatus {
  available: boolean;
  calendars: {
    [key: string]: {
      status: 'online' | 'offline' | 'unknown';
      responseTime?: number;
      error?: string;
    };
  };
  lastCheck: string;
  version: string;
}

const CALENDAR_SERVERS = [
  'https://alice.btc.calendar.opentimestamps.org',
  'https://bob.btc.calendar.opentimestamps.org',
  'https://finney.calendar.eternitywall.com'
];

export async function GET(_request: NextRequest) {
  try {
    const status = await checkOpenTimestampsStatus();
    
    return NextResponse.json(status, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' // Cache for 1 minute
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json({
      available: false,
      calendars: {},
      lastCheck: new Date().toISOString(),
      version: '1.0.0',
      error: 'Failed to check status'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

/**
 * Check the status of OpenTimestamps calendar servers
 */
async function checkOpenTimestampsStatus(): Promise<TimestampStatus> {
  const calendars: TimestampStatus['calendars'] = {};
  
  // Check each calendar server
  const checks = CALENDAR_SERVERS.map(async (url) => {
    try {
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading content
        signal: AbortSignal.timeout(5000), // 5 second timeout
        headers: {
          'User-Agent': 'Bitcoin-Tools/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      const hostname = new URL(url).hostname;
      
      calendars[hostname] = response.ok 
        ? { status: 'online' as const, responseTime }
        : { status: 'offline' as const, responseTime, error: `HTTP ${response.status}` };
      
      return response.ok;
      
    } catch (error) {
      const hostname = new URL(url).hostname;
      
      calendars[hostname] = {
        status: 'offline' as const,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
      
      return false;
    }
  });
  
  const results = await Promise.all(checks);
  const availableCount = results.filter(Boolean).length;
  
  return {
    available: availableCount > 0, // At least one server must be online
    calendars,
    lastCheck: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Get detailed info about OpenTimestamps for educational purposes
 */
export async function POST(_request: NextRequest) {
  try {
    const info = {
      service: 'OpenTimestamps',
      description: 'Free, open-source timestamping service using Bitcoin blockchain',
      website: 'https://opentimestamps.org',
      documentation: 'https://github.com/opentimestamps/opentimestamps.org',
      howItWorks: [
        'Documents are hashed (SHA256) locally - never uploaded',
        'Hash is submitted to OpenTimestamps calendar servers',
        'Servers aggregate hashes into Merkle trees',
        'Tree root is committed to Bitcoin blockchain',
        'Proof file (.ots) links your hash to Bitcoin block'
      ],
      benefits: [
        'Cryptographically secure using Bitcoin blockchain',
        'Decentralized - no single point of failure',
        'Free to use and verify',
        'Open source and auditable',
        'Globally verifiable by anyone'
      ],
      useCases: [
        'Intellectual property protection',
        'Legal document timestamping',
        'Software release verification',
        'Scientific research publication proof',
        'Digital artwork provenance'
      ],
      limitations: [
        'Requires Bitcoin network confirmation (may take time)',
        'Proof files are technical and require special tools to verify',
        'Calendar servers needed for initial submission',
        'File content must not change for proof to remain valid'
      ],
      verification: {
        tools: [
          'https://opentimestamps.org (web interface)',
          'Command line: ots verify',
          'Python library: python-opentimestamps',
          'JavaScript library: javascript-opentimestamps'
        ],
        requirements: [
          'Original file (unchanged)',
          'Proof file (.ots)',
          'Access to Bitcoin blockchain data'
        ]
      }
    };
    
    return NextResponse.json(info, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get service info' },
      { status: 500 }
    );
  }
}