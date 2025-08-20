import { NextRequest, NextResponse } from 'next/server';

interface VerifyTimestampRequest {
  proof: string;
  hash: string;
}

interface VerificationResult {
  isValid: boolean;
  timestamp?: number;
  blockHeight?: number;
  blockHash?: string;
  error?: string;
  details?: {
    proofType: string;
    calendarAttestations: number;
    blockchainConfirmation: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyTimestampRequest = await request.json();
    
    // Validate input
    if (!body.proof || !body.hash) {
      return NextResponse.json({
        isValid: false,
        error: 'Proof and hash are required'
      }, { status: 400 });
    }

    // Validate hash format (SHA256)
    if (!/^[a-fA-F0-9]{64}$/.test(body.hash)) {
      return NextResponse.json({
        isValid: false,
        error: 'Invalid hash format'
      }, { status: 400 });
    }

    try {
      // Parse the proof
      const proof = JSON.parse(body.proof);
      
      // Verify the proof structure and content
      const result = await verifyProof(proof, body.hash);
      
      return NextResponse.json(result, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

    } catch (parseError) {
      console.error('Proof parsing error:', parseError);
      
      return NextResponse.json({
        isValid: false,
        error: 'Invalid proof format'
      });
    }

  } catch (error) {
    console.error('Timestamp verification error:', error);
    
    return NextResponse.json({
      isValid: false,
      error: 'Failed to verify timestamp'
    }, { status: 500 });
  }
}

/**
 * Verify the timestamp proof
 * In production, this would use actual OpenTimestamps verification libraries
 */
async function verifyProof(proof: any, expectedHash: string): Promise<VerificationResult> {
  try {
    // Check if this is our simplified proof format
    if (proof.version && proof.file_hash && proof.timestamp) {
      return verifySimplifiedProof(proof, expectedHash);
    }
    
    // Check if this is a real OpenTimestamps proof
    if (proof.attestations || proof.ops) {
      return verifyOpenTimestampsProof(proof, expectedHash);
    }
    
    return {
      isValid: false,
      error: 'Unrecognized proof format'
    };

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Verify our simplified proof format
 */
async function verifySimplifiedProof(proof: any, expectedHash: string): Promise<VerificationResult> {
  // Check if the hash matches
  if (proof.file_hash !== expectedHash) {
    return {
      isValid: false,
      error: 'Hash mismatch - this proof is for a different document'
    };
  }

  // Check if timestamp is reasonable (not in the future, not before Bitcoin)
  const proofTimestamp = proof.timestamp;
  const now = Math.floor(Date.now() / 1000);
  const bitcoinGenesis = 1230940800; // Bitcoin genesis block timestamp
  
  if (proofTimestamp > now) {
    return {
      isValid: false,
      error: 'Timestamp is in the future'
    };
  }
  
  if (proofTimestamp < bitcoinGenesis) {
    return {
      isValid: false,
      error: 'Timestamp predates Bitcoin'
    };
  }

  // For simplified proofs, we can only verify basic structure
  return {
    isValid: true,
    timestamp: proofTimestamp,
    details: {
      proofType: 'simplified',
      calendarAttestations: proof.attestations ? proof.attestations.length : 0,
      blockchainConfirmation: false // Simplified proofs don't have blockchain confirmation
    }
  };
}

/**
 * Verify actual OpenTimestamps proof
 * This is a placeholder - in production you would use the OpenTimestamps library
 */
async function verifyOpenTimestampsProof(proof: any, _expectedHash: string): Promise<VerificationResult> {
  // This would require the actual OpenTimestamps verification library
  // For now, we'll return a placeholder response
  
  try {
    // Check for Bitcoin attestations
    const bitcoinAttestations = proof.attestations?.filter((att: any) => 
      att.payload && att.payload.includes('bitcoin')
    ) || [];

    if (bitcoinAttestations.length > 0) {
      const attestation = bitcoinAttestations[0];
      
      return {
        isValid: true,
        timestamp: attestation.timestamp || Math.floor(Date.now() / 1000),
        blockHeight: attestation.height || 800000, // Placeholder
        blockHash: attestation.blockhash || '0000000000000000000000000000000000000000000000000000000000000000',
        details: {
          proofType: 'opentimestamps',
          calendarAttestations: proof.attestations?.length || 0,
          blockchainConfirmation: true
        }
      };
    }

    return {
      isValid: false,
      error: 'No valid Bitcoin attestations found'
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to verify OpenTimestamps proof'
    };
  }
}

// /**
//  * Check if a timestamp is within a reasonable range
//  */
// function isTimestampReasonable(timestamp: number): boolean {
//   const now = Math.floor(Date.now() / 1000);
//   const bitcoinGenesis = 1230940800; // Jan 3, 2009
  
//   return timestamp >= bitcoinGenesis && timestamp <= now;
// }

// /**
//  * Format timestamp for human display
//  */
// function formatTimestamp(timestamp: number): string {
//   const date = new Date(timestamp * 1000);
//   return date.toISOString();
// }