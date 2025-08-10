/**
 * String normalization utility for fixing malformed test files
 * Handles escaped newlines, unicode characters, and syntax issues
 */

export class TestStringNormalizer {
  /**
   * Convert escaped newlines (\n) to actual newlines
   */
  static normalizeEscapedNewlines(content: string): string {
    // Replace \\n with actual newlines
    return content.replace(/\\n/g, '\n');
  }

  /**
   * Fix unicode escape sequences
   */
  static fixUnicodeEscapes(content: string): string {
    // Handle common unicode escape issues
    return content.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16));
      } catch {
        return match; // Keep original if parsing fails
      }
    });
  }

  /**
   * Fix malformed import statements with escaped newlines
   */
  static fixImportStatements(content: string): string {
    // Fix import statements that have been broken by escaped newlines
    return content.replace(/import\s*{\s*\\n\s*/g, 'import { ')
                  .replace(/\\n\s*}/g, ' }')
                  .replace(/,\s*\\n\s*/g, ', ');
  }

  /**
   * Normalize comment blocks that have been corrupted
   */
  static normalizeCommentBlocks(content: string): string {
    // Fix comment blocks that start with /** and have escaped content
    return content.replace(/\/\*\*\s*\\n\s*\*/g, '/**\n */')
                  .replace(/\*\s*\\n\s*\*/g, '*\n *');
  }

  /**
   * Remove duplicate newlines and normalize spacing
   */
  static normalizeSpacing(content: string): string {
    // Remove excessive newlines but preserve intentional spacing
    return content.replace(/\n{3,}/g, '\n\n')
                  .replace(/^\s+$/gm, '') // Remove lines with only whitespace
                  .trim();
  }

  /**
   * Process a complete test file with all normalizations
   */
  static processTestFile(content: string): string {
    let normalized = content;
    
    // Apply all normalizations in order
    normalized = this.normalizeEscapedNewlines(normalized);
    normalized = this.fixUnicodeEscapes(normalized);
    normalized = this.fixImportStatements(normalized);
    normalized = this.normalizeCommentBlocks(normalized);
    normalized = this.normalizeSpacing(normalized);
    
    return normalized;
  }

  /**
   * Validate that a test file has proper syntax
   */
  static validateTestFile(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for common syntax issues
    if (content.includes('\\n')) {
      errors.push('Contains escaped newlines that should be actual newlines');
    }
    
    if (content.includes('\\u') && !content.match(/\\u[0-9a-fA-F]{4}/)) {
      errors.push('Contains malformed unicode escape sequences');
    }
    
    // Check for broken import statements
    if (content.match(/import\s*{\s*\\n/)) {
      errors.push('Contains broken import statements with escaped newlines');
    }
    
    // Check for broken comment blocks
    if (content.match(/\/\*\*\s*\\n/)) {
      errors.push('Contains broken comment blocks with escaped content');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Validation functions for detecting malformed string literals
 */
export class TestFileValidator {
  /**
   * Detect malformed string literals in test files
   */
  static detectMalformedStrings(content: string): string[] {
    const issues: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for escaped newlines in strings
      if (line.includes('\\n') && !line.includes('\\\\n')) {
        issues.push(`Line ${lineNumber}: Contains escaped newline that may be malformed`);
      }
      
      // Check for incomplete unicode escapes
      if (line.match(/\\u[0-9a-fA-F]{0,3}[^0-9a-fA-F]/)) {
        issues.push(`Line ${lineNumber}: Contains incomplete unicode escape sequence`);
      }
      
      // Check for broken template literals
      if (line.includes('`') && line.split('`').length % 2 === 0) {
        issues.push(`Line ${lineNumber}: May contain unmatched template literal backticks`);
      }
    });
    
    return issues;
  }

  /**
   * Check if file has proper TypeScript/JavaScript syntax structure
   */
  static validateSyntaxStructure(content: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push('Unbalanced curly braces');
    }
    
    // Check for balanced parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push('Unbalanced parentheses');
    }
    
    // Check for balanced square brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push('Unbalanced square brackets');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}