/**
 * Secure Input Validator for Bitcoin Tools
 * 
 * Provides comprehensive validation, sanitization, and security checks
 * for all user inputs in Bitcoin Tools to prevent malicious inputs,
 * XSS attacks, and ensure data integrity.
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
  securityFlags: string[];
  originalValue: string;
}

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowedChars?: RegExp;
  blockedPatterns?: RegExp[];
  sanitize?: boolean;
  logAttempts?: boolean;
  strictMode?: boolean;
}

class SecureInputValidator {
  private static instance: SecureInputValidator;
  private validationLog: Array<{
    timestamp: number;
    input: string;
    type: string;
    result: 'valid' | 'invalid' | 'malicious';
    flags: string[];
  }> = [];

  // Common malicious patterns to detect
  private readonly MALICIOUS_PATTERNS = [
    // XSS patterns
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    
    // SQL injection patterns (less relevant but good to have)
    /(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi,
    /'\s*(or|and)\s*'?1'?\s*=\s*'?1/gi,
    
    // Command injection patterns
    /[;&|`$(){}[\]]/,
    /\.\.\//g,
    
    // Data exfiltration attempts
    /data:.*base64/gi,
    /blob:/gi,
    
    // Protocol-based attacks
    /file:\/\//gi,
    /ftp:\/\//gi,
  ];

  // Suspicious character sequences
  private readonly SUSPICIOUS_CHARS = /[<>'"&%\\]/;

  static getInstance(): SecureInputValidator {
    if (!SecureInputValidator.instance) {
      SecureInputValidator.instance = new SecureInputValidator();
    }
    return SecureInputValidator.instance;
  }

  /**
   * Validate Bitcoin transaction ID (TXID)
   */
  validateTxid(input: string, options: ValidationOptions = {}): ValidationResult {
    const defaultOptions: ValidationOptions = {
      maxLength: 64,
      minLength: 64,
      allowedChars: /^[a-fA-F0-9]+$/,
      sanitize: true,
      strictMode: true
    };
    
    const opts = { ...defaultOptions, ...options };
    const result = this.performValidation(input, 'txid', opts);

    // Additional TXID-specific checks
    if (result.isValid) {
      const sanitized = result.sanitizedValue.toLowerCase();
      
      // Check for common test/fake TXIDs
      const testPatterns = [
        /^0+$/,  // All zeros
        /^f+$/,  // All F's
        /^(0123456789abcdef){8}$/,  // Sequential pattern
        /^(.)\1{63}$/  // Same character repeated
      ];
      
      for (const pattern of testPatterns) {
        if (pattern.test(sanitized)) {
          result.warnings.push('This appears to be a test or invalid transaction ID');
          break;
        }
      }
    }

    this.logValidation(input, 'txid', result.isValid ? 'valid' : 'invalid', result.securityFlags);
    return result;
  }

  /**
   * Validate Bitcoin address
   */
  validateBitcoinAddress(input: string, options: ValidationOptions = {}): ValidationResult {
    const defaultOptions: ValidationOptions = {
      maxLength: 62,  // Max for bech32
      minLength: 26,  // Min for legacy
      sanitize: true,
      strictMode: true
    };
    
    const opts = { ...defaultOptions, ...options };
    let result = this.performValidation(input, 'address', opts);

    if (result.isValid) {
      const sanitized = result.sanitizedValue;
      
      // Bitcoin address format validation
      const addressFormats = [
        /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,      // Legacy (P2PKH)
        /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,      // Script (P2SH)
        /^bc1[a-z0-9]{39,59}$/,                // Bech32 (native segwit)
        /^bc1p[a-z0-9]{58}$/                   // Bech32m (taproot)
      ];
      
      const isValidFormat = addressFormats.some(pattern => pattern.test(sanitized));
      
      if (!isValidFormat) {
        result.isValid = false;
        result.errors.push('Invalid Bitcoin address format');
      } else {
        // Additional checksums and format validation could go here
        // For now, we rely on the format patterns
        
        // Check for suspicious test addresses
        if (sanitized.startsWith('1111111111') || sanitized.startsWith('3333333333')) {
          result.warnings.push('This appears to be a test address');
        }
      }
    }

    this.logValidation(input, 'address', result.isValid ? 'valid' : 'invalid', result.securityFlags);
    return result;
  }

  /**
   * Validate transaction size (vBytes)
   */
  validateTransactionSize(input: string, options: ValidationOptions = {}): ValidationResult {
    const defaultOptions: ValidationOptions = {
      maxLength: 10,  // Reasonable for number
      sanitize: true
    };
    
    const opts = { ...defaultOptions, ...options };
    let result = this.performValidation(input, 'txsize', opts);

    if (result.isValid) {
      const numValue = parseInt(result.sanitizedValue, 10);
      
      if (isNaN(numValue)) {
        result.isValid = false;
        result.errors.push('Transaction size must be a number');
      } else if (numValue < 1) {
        result.isValid = false;
        result.errors.push('Transaction size must be greater than 0');
      } else if (numValue > 4000000) { // 4MB block limit
        result.isValid = false;
        result.errors.push('Transaction size unrealistically large');
      } else {
        result.sanitizedValue = numValue.toString();
        
        // Warnings for unusual sizes
        if (numValue < 140) {
          result.warnings.push('Very small transaction size - typical minimum is ~140 bytes');
        } else if (numValue > 100000) {
          result.warnings.push('Very large transaction size - double check this value');
        }
      }
    }

    this.logValidation(input, 'txsize', result.isValid ? 'valid' : 'invalid', result.securityFlags);
    return result;
  }

  /**
   * Validate file for document timestamping
   */
  validateUploadFile(file: File): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: file.name,
      errors: [],
      warnings: [],
      securityFlags: [],
      originalValue: file.name
    };

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      result.isValid = false;
      result.errors.push(`File too large: ${Math.round(file.size / 1024 / 1024)}MB (max: 10MB)`);
    }

    // File name validation
    const fileNameResult = this.performValidation(file.name, 'filename', {
      maxLength: 255,
      sanitize: true,
      blockedPatterns: [
        /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|deb|dmg|pkg)$/i,
        /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Windows reserved names
      ]
    });

    if (!fileNameResult.isValid) {
      result.isValid = false;
      result.errors.push(...fileNameResult.errors);
      result.securityFlags.push(...fileNameResult.securityFlags);
    }

    // MIME type validation
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/json',
      'text/html',
      'text/xml',
      'application/xml'
    ];

    if (!allowedTypes.includes(file.type) && file.type !== '') {
      result.warnings.push(`Uncommon file type: ${file.type}`);
    }

    // Check for potential disguised executables
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && ['exe', 'bat', 'cmd', 'scr', 'vbs', 'js'].includes(fileExtension)) {
      result.isValid = false;
      result.errors.push('Executable files are not allowed');
      result.securityFlags.push('executable_file');
    }

    this.logValidation(file.name, 'file', result.isValid ? 'valid' : 'invalid', result.securityFlags);
    return result;
  }

  /**
   * Validate generic text input (for search, comments, etc.)
   */
  validateTextInput(input: string, options: ValidationOptions = {}): ValidationResult {
    const defaultOptions: ValidationOptions = {
      maxLength: 1000,
      sanitize: true,
      blockedPatterns: this.MALICIOUS_PATTERNS
    };
    
    const opts = { ...defaultOptions, ...options };
    const result = this.performValidation(input, 'text', opts);

    this.logValidation(input, 'text', result.isValid ? 'valid' : 'invalid', result.securityFlags);
    return result;
  }

  /**
   * Core validation logic
   */
  private performValidation(
    input: string, 
    type: string, 
    options: ValidationOptions
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: input,
      errors: [],
      warnings: [],
      securityFlags: [],
      originalValue: input
    };

    // Basic null/undefined check
    if (input === null || input === undefined) {
      result.isValid = false;
      result.errors.push('Input is required');
      return result;
    }

    // Convert to string if not already
    let value = String(input);
    
    // Length validation
    if (options.maxLength && value.length > options.maxLength) {
      result.isValid = false;
      result.errors.push(`Input too long (max: ${options.maxLength} characters)`);
    }
    
    if (options.minLength && value.length < options.minLength) {
      result.isValid = false;
      result.errors.push(`Input too short (min: ${options.minLength} characters)`);
    }

    // Malicious pattern detection
    if (options.blockedPatterns) {
      for (const pattern of options.blockedPatterns) {
        if (pattern.test(value)) {
          result.isValid = false;
          result.errors.push('Input contains potentially malicious content');
          result.securityFlags.push('malicious_pattern_detected');
          break;
        }
      }
    }

    // Check for suspicious characters
    if (this.SUSPICIOUS_CHARS.test(value) && type !== 'text') {
      result.securityFlags.push('suspicious_characters');
      if (options.strictMode) {
        result.warnings.push('Input contains potentially unsafe characters');
      }
    }

    // Allowed characters validation
    if (options.allowedChars && !options.allowedChars.test(value)) {
      result.isValid = false;
      result.errors.push('Input contains invalid characters');
    }

    // Sanitization
    if (options.sanitize && result.isValid) {
      result.sanitizedValue = this.sanitizeInput(value, type);
    }

    return result;
  }

  /**
   * Sanitize input based on type
   */
  private sanitizeInput(input: string, type: string): string {
    let sanitized = input.trim();

    switch (type) {
      case 'txid':
      case 'address':
        // Remove any non-alphanumeric characters for crypto addresses/hashes
        sanitized = sanitized.replace(/[^a-fA-F0-9]/g, '');
        break;
        
      case 'txsize':
        // Keep only digits
        sanitized = sanitized.replace(/[^0-9]/g, '');
        break;
        
      case 'filename':
        // Remove path separators and dangerous characters
        sanitized = sanitized.replace(/[/\\:*?"<>|]/g, '');
        break;
        
      case 'text':
        // Basic HTML/script tag removal
        sanitized = sanitized
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
        break;
    }

    return sanitized;
  }

  /**
   * Log validation attempts for security monitoring
   */
  private logValidation(input: string, type: string, result: 'valid' | 'invalid' | 'malicious', flags: string[]) {
    // Only log if there are security concerns or in development
    if (flags.length > 0 || process.env.NODE_ENV === 'development') {
      this.validationLog.push({
        timestamp: Date.now(),
        input: input.substring(0, 50) + (input.length > 50 ? '...' : ''), // Truncate for privacy
        type,
        result,
        flags
      });

      // Keep only last 100 entries
      if (this.validationLog.length > 100) {
        this.validationLog = this.validationLog.slice(-100);
      }
    }
  }

  /**
   * Get security report for monitoring
   */
  getSecurityReport(): {
    totalValidations: number;
    maliciousAttempts: number;
    flaggedInputs: number;
    recentFlags: string[];
    typeBreakdown: Record<string, number>;
  } {
    const maliciousAttempts = this.validationLog.filter(log => log.result === 'malicious').length;
    const flaggedInputs = this.validationLog.filter(log => log.flags.length > 0).length;
    const recentFlags = this.validationLog
      .filter(log => log.flags.length > 0)
      .slice(-10)
      .flatMap(log => log.flags);
    
    const typeBreakdown: Record<string, number> = {};
    this.validationLog.forEach(log => {
      typeBreakdown[log.type] = (typeBreakdown[log.type] || 0) + 1;
    });

    return {
      totalValidations: this.validationLog.length,
      maliciousAttempts,
      flaggedInputs,
      recentFlags: Array.from(new Set(recentFlags)), // Remove duplicates
      typeBreakdown
    };
  }

  /**
   * Clear validation log
   */
  clearSecurityLog(): void {
    this.validationLog = [];
  }
}

// Export singleton instance
export const SecureValidator = SecureInputValidator.getInstance();

// Export validation result type for use in components
export type {
  ValidationResult as SecureValidationResult,
  ValidationOptions as SecureValidationOptions
};