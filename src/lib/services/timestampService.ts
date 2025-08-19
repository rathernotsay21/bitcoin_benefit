import { TimestampResult, createToolError } from '@/types/bitcoin-tools';

interface OpenTimestampsResponse {
  success: boolean;
  hash: string;
  timestamp: number;
  otsProof?: string;
  error?: string;
}

interface VerificationResult {
  isValid: boolean;
  timestamp?: number;
  blockHeight?: number;
  blockHash?: string;
  error?: string;
}

export class TimestampService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_TYPES = [
    'text/plain',
    'text/csv',
    'application/pdf',
    'application/json',
    'application/xml',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  /**
   * Validate file for timestamping
   */
  static validateFile(file: File): void {
    if (!file) {
      throw createToolError('validation', 'INVALID_FILE_TYPE');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw createToolError('validation', 'FILE_TOO_LARGE');
    }

    if (!this.SUPPORTED_TYPES.includes(file.type) && !file.name.endsWith('.txt')) {
      throw createToolError('validation', 'INVALID_FILE_TYPE');
    }
  }

  /**
   * Calculate SHA256 hash of file content
   */
  static async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : undefined));
        }
      };
      
      reader.onerror = () => {
        reject(createToolError('unknown', 'UNKNOWN_ERROR', new Error('Failed to read file')));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Create timestamp proof using OpenTimestamps
   */
  static async createTimestamp(file: File): Promise<TimestampResult> {
    // Validate file first
    this.validateFile(file);

    try {
      // Calculate file hash
      const fileHash = await this.calculateFileHash(file);

      // Create timestamp through our API endpoint
      const response = await fetch('/api/timestamps/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: fileHash,
          filename: file.name,
          fileSize: file.size,
          fileType: file.type
        }),
        signal: AbortSignal.timeout(60000) // 60 second timeout for blockchain operations
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createToolError('api', 'API_ERROR', new Error(errorData.error || 'Timestamp creation failed'));
      }

      const data: OpenTimestampsResponse = await response.json();

      if (!data.success) {
        throw createToolError('api', 'API_ERROR', new Error(data.error || 'Timestamp creation failed'));
      }

      // Create proof file blob
      const proofData = data.otsProof || this.createFallbackProof(fileHash, data.timestamp);
      const proofBlob = new Blob([proofData], { type: 'application/octet-stream' });

      // Generate verification URL
      const verificationUrl = `https://opentimestamps.org/info/?b64=${btoa(proofData)}`;

      return {
        hash: data.hash,
        timestamp: data.timestamp,
        proofFile: proofBlob,
        verificationUrl,
        humanReadable: {
          timestampDescription: this.formatTimestampDescription(data.timestamp),
          instructions: this.generateInstructions(file.name)
        }
      };

    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw createToolError('timeout', 'API_TIMEOUT', error);
        }
        if (error.message.includes('fetch')) {
          throw createToolError('network', 'NETWORK_ERROR', error);
        }
      }

      // Re-throw tool errors
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }

      // Unknown error
      throw createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Verify an existing timestamp proof
   */
  static async verifyTimestamp(proofFile: File, originalFile: File): Promise<VerificationResult> {
    try {
      // Read proof file
      const proofData = await this.readFileAsText(proofFile);
      
      // Calculate original file hash
      const originalHash = await this.calculateFileHash(originalFile);

      // Verify through our API endpoint
      const response = await fetch('/api/timestamps/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: proofData,
          hash: originalHash
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          isValid: false,
          error: errorData.error || 'Verification failed'
        };
      }

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Read file as text
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Create fallback proof when OpenTimestamps is unavailable
   */
  private static createFallbackProof(hash: string, timestamp: number): string {
    const proof = {
      version: '1.0',
      hash: hash,
      timestamp: timestamp,
      method: 'sha256',
      note: 'Fallback timestamp proof - verify manually using hash and timestamp',
      created: new Date(timestamp * 1000).toISOString()
    };
    
    return JSON.stringify(proof, null, 2);
  }

  /**
   * Format timestamp for human-readable display
   */
  private static formatTimestampDescription(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Timestamp created just now';
    } else if (diffMinutes < 60) {
      return `Timestamp created ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `Timestamp created ${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `Timestamp created on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
  }

  /**
   * Generate step-by-step instructions for users
   */
  private static generateInstructions(filename: string): string[] {
    return [
      'Download the .ots proof file to keep as evidence',
      `Keep the original file "${filename}" unchanged`,
      'To verify later, upload both files to any OpenTimestamps verifier',
      'The proof shows when your document existed on the Bitcoin blockchain',
      'This timestamp is tamper-proof and globally verifiable'
    ];
  }

  /**
   * Get file type icon for display
   */
  static getFileTypeIcon(file: File): string {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('text/') || extension === 'txt') return '📄';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || extension === 'doc' || extension === 'docx') return '📘';
    if (type.includes('excel') || extension === 'xls' || extension === 'xlsx') return '📊';
    if (type.includes('json') || type.includes('xml')) return '📋';
    
    return '📎';
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Download blob as file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate proof filename
   */
  static generateProofFilename(originalFilename: string): string {
    const baseName = originalFilename.split('.').slice(0, -1).join('.') || originalFilename;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}.ots`;
  }

  /**
   * Check if OpenTimestamps is available
   */
  static async checkOpenTimestampsAvailability(): Promise<boolean> {
    try {
      const response = await fetch('/api/timestamps/status', {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      return data.available;
    } catch {
      return false;
    }
  }

  /**
   * Get OpenTimestamps info and educational content
   */
  static getEducationalInfo() {
    return {
      title: 'What is Document Timestamping?',
      description: 'Document timestamping proves that a document existed at a specific point in time using Bitcoin\'s blockchain.',
      benefits: [
        'Tamper-proof: Once timestamped, you can prove a document hasn\'t been altered',
        'Decentralized: Uses Bitcoin\'s blockchain, no central authority required',
        'Free: OpenTimestamps is free to use and open source',
        'Universal: Anyone can verify your timestamp independently'
      ],
      useCases: [
        'Intellectual property protection',
        'Legal document evidence',
        'Software release verification',
        'Research publication proof',
        'Contract existence proof'
      ],
      howItWorks: [
        'Your document is hashed (never uploaded to any server)',
        'The hash is submitted to OpenTimestamps calendar servers',
        'The servers create a cryptographic proof linking your hash to Bitcoin',
        'You get a .ots file that proves when your document existed',
        'Anyone can verify the timestamp using the .ots file and your original document'
      ]
    };
  }
}