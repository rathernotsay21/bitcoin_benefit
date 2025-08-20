/**
 * Secure File Handler for Document Timestamping
 * 
 * Provides secure file processing for the document timestamping tool.
 * Ensures files are safely processed, validated, and cleared from memory.
 * Prevents malicious file uploads and protects user privacy.
 */

import { SecureValidator, ValidationResult } from '@/lib/validation/secureInputValidator';
import { PrivacyManager } from './privacyManager';

export interface SecureFileResult {
  success: boolean;
  hash?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  errors: string[];
  warnings: string[];
  securityFlags: string[];
  processingTime: number;
}

export interface FileProcessingOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  generatePreview?: boolean;
  clearAfterProcessing?: boolean;
  validateContent?: boolean;
}

class SecureFileHandlerService {
  private static instance: SecureFileHandlerService;
  private processedFiles = new Set<string>(); // Track processed file hashes to prevent duplicates
  private readonly CHUNK_SIZE = 64 * 1024; // 64KB chunks for large file processing
  private readonly MAX_PROCESSING_TIME = 30000; // 30 seconds max processing time

  // Default allowed MIME types for timestamping
  private readonly DEFAULT_ALLOWED_TYPES = [
    'text/plain',
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/json',
    'text/html',
    'text/xml',
    'application/xml',
    'text/css',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
  ];

  // File signatures (magic bytes) for additional validation
  private readonly FILE_SIGNATURES: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'image/jpeg': [0xFF, 0xD8, 0xFF], // JPEG
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    'image/gif': [0x47, 0x49, 0x46, 0x38], // GIF8
    'text/plain': [], // No signature for text files
    'application/zip': [0x50, 0x4B, 0x03, 0x04] // ZIP
  };

  static getInstance(): SecureFileHandlerService {
    if (!SecureFileHandlerService.instance) {
      SecureFileHandlerService.instance = new SecureFileHandlerService();
    }
    return SecureFileHandlerService.instance;
  }

  /**
   * Process a file securely for timestamping
   */
  async processFile(
    file: File, 
    options: FileProcessingOptions = {}
  ): Promise<SecureFileResult> {
    const startTime = Date.now();
    const result: SecureFileResult = {
      success: false,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      errors: [],
      warnings: [],
      securityFlags: [],
      processingTime: 0
    };

    // Log file processing attempt
    PrivacyManager.logDataUsage('document-timestamp', 'file_upload', 'file_processing');

    try {
      // 1. Basic file validation
      const validationResult = await this.validateFile(file, options);
      if (!validationResult.isValid) {
        result.errors = validationResult.errors;
        result.warnings = validationResult.warnings;
        result.securityFlags = validationResult.securityFlags;
        result.processingTime = Date.now() - startTime;
        return result;
      }

      // 2. Content-based validation
      if (options.validateContent !== false) {
        const contentValidation = await this.validateFileContent(file);
        if (!contentValidation.success) {
          result.errors.push(...contentValidation.errors);
          result.securityFlags.push(...contentValidation.securityFlags);
          result.processingTime = Date.now() - startTime;
          return result;
        }
        result.warnings.push(...contentValidation.warnings);
      }

      // 3. Generate file hash
      const hash = await this.generateSecureHash(file);
      if (!hash) {
        result.errors.push('Failed to generate file hash');
        result.processingTime = Date.now() - startTime;
        return result;
      }

      // 4. Check for duplicate processing
      if (this.processedFiles.has(hash)) {
        result.warnings.push('This file has been processed before in this session');
      } else {
        this.processedFiles.add(hash);
      }

      result.success = true;
      result.hash = hash;
      result.processingTime = Date.now() - startTime;

      // 5. Clear file from memory if requested
      if (options.clearAfterProcessing !== false) {
        setTimeout(() => this.clearFileFromMemory(file), 1000);
      }

      PrivacyManager.logDataUsage(
        'document-timestamp', 
        'file_processed_successfully', 
        'file_hash_generated'
      );

      return result;

    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error during file processing'
      );
      result.processingTime = Date.now() - startTime;
      
      PrivacyManager.logDataUsage(
        'document-timestamp', 
        'file_processing_error', 
        'processing_failed'
      );

      return result;
    }
  }

  /**
   * Validate file properties and security
   */
  private async validateFile(
    file: File, 
    options: FileProcessingOptions
  ): Promise<ValidationResult> {
    // Use the secure validator for basic file validation
    const basicValidation = SecureValidator.validateUploadFile(file);
    
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const result: ValidationResult = { ...basicValidation };

    // Size validation with options
    const maxSize = options.maxSize || (10 * 1024 * 1024); // Default 10MB
    if (file.size > maxSize) {
      result.isValid = false;
      result.errors.push(`File too large: ${this.formatFileSize(file.size)} (max: ${this.formatFileSize(maxSize)})`);
    }

    // MIME type validation
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES;
    if (file.type && !allowedTypes.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`File type not allowed: ${file.type}`);
      result.securityFlags.push('disallowed_mime_type');
    }

    // Empty file check
    if (file.size === 0) {
      result.isValid = false;
      result.errors.push('File is empty');
    }

    // Suspicious filename patterns
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com|vbs|jar|app)$/i,
      /^\./, // Hidden files
      /\s{2,}/, // Multiple spaces
      /[<>:"|?*]/ // Windows forbidden characters
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        result.securityFlags.push('suspicious_filename');
        result.warnings.push('Filename contains suspicious patterns');
        break;
      }
    }

    return result;
  }

  /**
   * Validate file content by checking magic bytes and scanning for malicious content
   */
  private async validateFileContent(file: File): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    securityFlags: string[];
  }> {
    const result = {
      success: true,
      errors: [] as string[],
      warnings: [] as string[],
      securityFlags: [] as string[]
    };

    try {
      // Read first chunk to check magic bytes
      const firstChunk = await this.readFileChunk(file, 0, 64);
      const bytes = new Uint8Array(firstChunk);

      // Verify file signature matches declared MIME type
      if (file.type && this.FILE_SIGNATURES[file.type]) {
        const expectedSignature = this.FILE_SIGNATURES[file.type];
        const actualSignature = Array.from(bytes.slice(0, expectedSignature.length));
        
        if (expectedSignature.length > 0) {
          const signatureMatches = expectedSignature.every((byte, index) => 
            actualSignature[index] === byte
          );
          
          if (!signatureMatches) {
            result.securityFlags.push('mime_type_mismatch');
            result.warnings.push('File content does not match declared type');
          }
        }
      }

      // Check for embedded scripts in various file types
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        const content = await this.readFileAsText(file);
        if (this.containsMaliciousScript(content)) {
          result.success = false;
          result.errors.push('File contains potentially malicious script content');
          result.securityFlags.push('malicious_script_detected');
        }
      }

      // Check for suspicious binary patterns (basic)
      if (this.containsSuspiciousBinaryPattern(bytes)) {
        result.securityFlags.push('suspicious_binary_pattern');
        result.warnings.push('File contains suspicious binary patterns');
      }

    } catch (error) {
      result.errors.push('Failed to validate file content');
      result.securityFlags.push('content_validation_failed');
    }

    return result;
  }

  /**
   * Generate SHA-256 hash of the file
   */
  private async generateSecureHash(file: File): Promise<string | null> {
    try {
      // Use Web Crypto API for secure hashing
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('Hash generation failed:', error);
      return null;
    }
  }

  /**
   * Read a chunk of the file
   */
  private readFileChunk(file: File, start: number, length: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const blob = file.slice(start, start + length);
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Read file as text (for text-based files)
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      
      reader.readAsText(file);
    });
  }

  /**
   * Check for malicious script content in text files
   */
  private containsMaliciousScript(content: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:.*base64.*script/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for suspicious binary patterns
   */
  private containsSuspiciousBinaryPattern(bytes: Uint8Array): boolean {
    // Check for PE/EXE header
    if (bytes.length > 2 && bytes[0] === 0x4D && bytes[1] === 0x5A) {
      return true; // MZ header (PE executable)
    }

    // Check for ELF header
    if (bytes.length > 4 && 
        bytes[0] === 0x7F && bytes[1] === 0x45 && 
        bytes[2] === 0x4C && bytes[3] === 0x46) {
      return true; // ELF header
    }

    // Check for Mach-O header
    if (bytes.length > 4 && 
        ((bytes[0] === 0xFE && bytes[1] === 0xED && bytes[2] === 0xFA && bytes[3] === 0xCE) ||
         (bytes[0] === 0xCE && bytes[1] === 0xFA && bytes[2] === 0xED && bytes[3] === 0xFE))) {
      return true; // Mach-O header
    }

    return false;
  }

  /**
   * Clear file from memory (as much as possible)
   */
  private clearFileFromMemory(file: File): void {
    try {
      // Note: File objects are immutable and garbage collected automatically
      // This is more of a placeholder for any additional cleanup needed
      
      PrivacyManager.logDataUsage(
        'document-timestamp', 
        'file_cleared_from_memory', 
        'memory_cleanup'
      );
    } catch (error) {
      console.warn('File memory cleanup warning:', error);
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): {
    filesProcessed: number;
    duplicatesDetected: number;
    avgProcessingTime: number;
    securityFlags: string[];
  } {
    return {
      filesProcessed: this.processedFiles.size,
      duplicatesDetected: 0, // Would need more sophisticated tracking
      avgProcessingTime: 0, // Would need to track processing times
      securityFlags: [] // Would need to aggregate security flags
    };
  }

  /**
   * Clear processing history
   */
  clearProcessingHistory(): void {
    this.processedFiles.clear();
  }
}

// Export singleton instance
export const SecureFileHandler = SecureFileHandlerService.getInstance();

// Export types
export type {
  SecureFileResult as SecureHandlerFileResult,
  FileProcessingOptions as SecureHandlerProcessingOptions
};