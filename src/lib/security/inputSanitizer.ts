import { z } from 'zod';

/**
 * Comprehensive input sanitization and validation for Bitcoin Tools
 * Provides XSS protection, injection prevention, and Bitcoin-specific validation
 */
export class InputSanitizer {
  // Dangerous patterns that could indicate XSS or injection attempts
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<style/gi,
    /\x00/g, // Null bytes
    /\uFEFF/g, // BOM
    /[\u0000-\u001f\u007f-\u009f]/g // Control characters
  ];

  // SQL injection patterns
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /((\%27)|(\'))((\%6f)|o|(\%4f))((\%72)|r|(\%52))/gi,
    /((\%27)|(\'))((\%75)|u|(\%55))((\%6e)|n|(\%4e))((\%69)|i|(\%49))((\%6f)|o|(\%4f))((\%6e)|n|(\%4e))/gi,
    /(((\%3d)|(=))[^\n]*((\%27)|(\')|((\%3b)|(;))))/gi
  ];

  // Path traversal patterns
  private static readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.\//gi,
    /\.\.\\/gi,
    /%2e%2e%2f/gi,
    /%2e%2e\//gi,
    /\.\.\%2f/gi,
    /%2e%2e%5c/gi
  ];

  // LDAP injection patterns
  private static readonly LDAP_INJECTION_PATTERNS = [
    /[()=*!&|]/g,
    /\x00/g
  ];

  /**
   * Sanitize general text input with configurable options
   */
  static sanitizeText(input: string, options: {
    allowHtml?: boolean;
    maxLength?: number;
    stripWhitespace?: boolean;
    preserveNewlines?: boolean;
  } = {}): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    let sanitized = input;

    // Remove dangerous patterns
    if (!options.allowHtml) {
      for (const pattern of this.DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Remove SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove path traversal attempts
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove LDAP injection patterns
    for (const pattern of this.LDAP_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Handle whitespace
    if (options.stripWhitespace) {
      sanitized = sanitized.trim();
      if (!options.preserveNewlines) {
        sanitized = sanitized.replace(/\s+/g, ' ');
      }
    }

    // Apply length limits
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize Bitcoin transaction ID (TXID)
   */
  static sanitizeTxid(txid: string): string {
    if (typeof txid !== 'string') {
      throw new Error('Transaction ID must be a string');
    }

    // Remove any non-hexadecimal characters and convert to lowercase
    const sanitized = txid.replace(/[^a-fA-F0-9]/g, '').toLowerCase();

    // Validate length
    if (sanitized.length !== 64) {
      throw new Error('Transaction ID must be exactly 64 hexadecimal characters');
    }

    // Additional validation for suspicious patterns
    if (this.detectSuspiciousPatterns(sanitized).length > 0) {
      throw new Error('Transaction ID contains suspicious patterns');
    }

    return sanitized;
  }

  /**
   * Sanitize Bitcoin address
   */
  static sanitizeBitcoinAddress(address: string): string {
    if (typeof address !== 'string') {
      throw new Error('Bitcoin address must be a string');
    }

    // Remove whitespace and common typos
    let sanitized = address.trim();

    // Check for dangerous patterns
    if (this.detectSuspiciousPatterns(sanitized).length > 0) {
      throw new Error('Bitcoin address contains suspicious patterns');
    }

    // Bitcoin addresses should only contain alphanumeric characters
    // and specific special characters based on encoding
    const validChars = /^[a-zA-Z0-9]+$/;
    if (!validChars.test(sanitized.replace(/[13bc]/g, ''))) {
      // Remove invalid characters but keep the structure
      sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
    }

    // Length validation (Bitcoin addresses are typically 25-62 characters)
    if (sanitized.length < 25 || sanitized.length > 62) {
      throw new Error('Bitcoin address length is invalid');
    }

    return sanitized;
  }

  /**
   * Sanitize filename for secure file operations
   */
  static sanitizeFilename(filename: string): string {
    if (typeof filename !== 'string') {
      throw new Error('Filename must be a string');
    }

    let sanitized = filename.trim();

    // Remove path components
    sanitized = sanitized.replace(/^.*[\\\/]/, '');

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f\x7f-\x9f]/g, '');

    // Remove leading/trailing dots and spaces (Windows issues)
    sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(sanitized)) {
      sanitized = 'file_' + sanitized;
    }

    // Ensure reasonable length
    if (sanitized.length === 0) {
      sanitized = 'unnamed_file';
    }

    if (sanitized.length > 255) {
      const ext = sanitized.substring(sanitized.lastIndexOf('.'));
      const name = sanitized.substring(0, 255 - ext.length);
      sanitized = name + ext;
    }

    return sanitized;
  }

  /**
   * Sanitize file hash (SHA-256)
   */
  static sanitizeFileHash(hash: string): string {
    if (typeof hash !== 'string') {
      throw new Error('File hash must be a string');
    }

    const sanitized = hash.replace(/[^a-fA-F0-9]/g, '').toLowerCase();

    if (sanitized.length !== 64) {
      throw new Error('File hash must be exactly 64 hexadecimal characters');
    }

    return sanitized;
  }

  /**
   * Sanitize URL with domain whitelist
   */
  static sanitizeUrl(url: string, allowedDomains: string[] = []): string {
    if (typeof url !== 'string') {
      throw new Error('URL must be a string');
    }

    let sanitized = url.trim();

    // Remove dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    for (const protocol of dangerousProtocols) {
      if (sanitized.toLowerCase().startsWith(protocol)) {
        throw new Error(`Dangerous protocol detected: ${protocol}`);
      }
    }

    // Validate against allowed domains if provided
    if (allowedDomains.length > 0) {
      try {
        const urlObj = new URL(sanitized);
        const domain = urlObj.hostname.toLowerCase();
        
        const isAllowed = allowedDomains.some(allowed => {
          return domain === allowed.toLowerCase() || 
                 domain.endsWith('.' + allowed.toLowerCase());
        });

        if (!isAllowed) {
          throw new Error(`Domain not allowed: ${domain}`);
        }
      } catch (error) {
        throw new Error('Invalid URL format');
      }
    }

    return sanitized;
  }

  /**
   * Detect suspicious patterns in input
   */
  static detectSuspiciousPatterns(input: string): string[] {
    const suspicious: string[] = [];

    // Check for encoded attacks
    const encodedPatterns = [
      /%3c/gi, // <
      /%3e/gi, // >
      /%22/gi, // "
      /%27/gi, // '
      /%2f/gi, // /
      /%5c/gi, // \
    ];

    for (const pattern of encodedPatterns) {
      if (pattern.test(input)) {
        suspicious.push('encoded_characters');
        break;
      }
    }

    // Check for excessive repetition (possible DoS)
    if (/(.)\1{100,}/.test(input)) {
      suspicious.push('excessive_repetition');
    }

    // Check for binary data
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(input)) {
      suspicious.push('binary_data');
    }

    // Check for potential template injection
    if (/\{\{|\}\}|\$\{|\<%|%\>/.test(input)) {
      suspicious.push('template_injection');
    }

    // Check for potential command injection
    if (/[;&|`$()]/.test(input)) {
      suspicious.push('command_injection');
    }

    return suspicious;
  }

  /**
   * Validate and sanitize JSON input
   */
  static sanitizeJSON(input: string, maxDepth: number = 10): any {
    if (typeof input !== 'string') {
      throw new Error('JSON input must be a string');
    }

    // Check for suspicious patterns
    const suspicious = this.detectSuspiciousPatterns(input);
    if (suspicious.length > 0) {
      throw new Error(`Suspicious patterns detected in JSON: ${suspicious.join(', ')}`);
    }

    try {
      const parsed = JSON.parse(input);
      
      // Check depth to prevent deeply nested attacks
      const depth = this.getObjectDepth(parsed);
      if (depth > maxDepth) {
        throw new Error(`JSON depth exceeds maximum allowed (${maxDepth})`);
      }

      return parsed;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Get the depth of a nested object/array
   */
  private static getObjectDepth(obj: any, depth: number = 0): number {
    if (depth > 50) return depth; // Prevent infinite recursion
    
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }

    const depths = Object.values(obj).map(value => 
      this.getObjectDepth(value, depth + 1)
    );

    return depths.length > 0 ? Math.max(...depths) : depth;
  }

  /**
   * Create a Zod schema with security validation
   */
  static createSecureSchema<T extends z.ZodType>(baseSchema: T, options: {
    maxLength?: number;
    allowDangerousChars?: boolean;
  } = {}): z.ZodType<z.infer<T>> {
    return baseSchema.refine(
      (value) => {
        if (typeof value === 'string') {
          // Check for dangerous patterns
          if (!options.allowDangerousChars) {
            const suspicious = this.detectSuspiciousPatterns(value);
            if (suspicious.length > 0) {
              return false;
            }
          }

          // Check length
          if (options.maxLength && value.length > options.maxLength) {
            return false;
          }
        }
        return true;
      },
      {
        message: 'Input contains suspicious content or exceeds maximum length'
      }
    );
  }
}

/**
 * Custom validation errors for security issues
 */
export class SecurityValidationError extends Error {
  constructor(
    message: string,
    public readonly securityIssue: string,
    public readonly input?: string
  ) {
    super(message);
    this.name = 'SecurityValidationError';
  }
}

/**
 * Rate limiting utilities for input validation
 */
export class ValidationRateLimiter {
  private static attempts = new Map<string, number[]>();

  /**
   * Check if an IP/identifier has exceeded validation attempt limits
   */
  static checkValidationAttempts(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Clean old attempts
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }

  /**
   * Clear attempts for an identifier
   */
  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}