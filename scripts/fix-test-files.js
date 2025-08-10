#!/usr/bin/env node

/**
 * Comprehensive Test File Fixer
 * Fixes malformed string literals and comment blocks in test files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class TestFileFixer {
  /**
   * Fix malformed comment blocks at the start of files
   */
  static fixCommentBlocks(content) {
    // Pattern to match malformed comment blocks like:
    // /**\n * comment content\n * more content\n */
    const malformedCommentPattern = /^\/\*\*\\n([^*]|\*(?!\/))*\\n\s*\*\//;
    
    if (malformedCommentPattern.test(content)) {
      return content.replace(malformedCommentPattern, (match) => {
        // Extract the content between /** and */
        let commentContent = match.slice(3, -2); // Remove /** and */
        
        // Replace \\n with actual newlines
        commentContent = commentContent.replace(/\\n/g, '\n');
        
        // Clean up the comment formatting
        const lines = commentContent.split('\n');
        const cleanedLines = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.startsWith('*') ? ` ${line}` : ` * ${line}`);
        
        return `/**\n${cleanedLines.join('\n')}\n */`;
      });
    }
    
    return content;
  }

  /**
   * Fix any remaining escaped newlines in the content
   */
  static fixEscapedNewlines(content) {
    // Fix any remaining \\n sequences that should be actual newlines
    // But be careful not to break legitimate escaped newlines in strings
    return content.replace(/\\\\n/g, '\n');
  }

  /**
   * Validate and fix unicode characters
   */
  static fixUnicodeIssues(content) {
    // Handle Bitcoin symbol and other unicode characters properly
    const unicodePattern = /\\u([0-9a-fA-F]{4})/g;
    return content.replace(unicodePattern, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16));
      } catch (error) {
        console.warn(`Failed to convert unicode escape ${match}:`, error);
        return match; // Return original if conversion fails
      }
    });
  }

  /**
   * Process a single test file
   */
  static processFile(filePath) {
    try {
      console.log(`Processing: ${filePath}`);
      
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let fixedContent = originalContent;

      // Apply fixes in order
      fixedContent = this.fixCommentBlocks(fixedContent);
      fixedContent = this.fixEscapedNewlines(fixedContent);
      fixedContent = this.fixUnicodeIssues(fixedContent);

      // Check if changes were made
      if (originalContent !== fixedContent) {
        // Create backup
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, originalContent);
        
        // Write fixed content
        fs.writeFileSync(filePath, fixedContent);
        
        console.log(`  ✅ Fixed and backed up to ${backupPath}`);
        return { fixed: true, backupCreated: true };
      } else {
        console.log(`  ✓ No issues found`);
        return { fixed: false, backupCreated: false };
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      return { fixed: false, backupCreated: false, error: error.message };
    }
  }

  /**
   * Process all test files in the project
   */
  static processAllTestFiles() {
    const patterns = [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx'
    ];

    let totalFiles = 0;
    let fixedFiles = 0;
    let errorFiles = 0;

    console.log('🔧 Test File Fixer - Starting processing...\n');

    patterns.forEach(pattern => {
      const files = glob.sync(pattern);
      
      files.forEach(file => {
        totalFiles++;
        const result = this.processFile(file);
        
        if (result.error) {
          errorFiles++;
        } else if (result.fixed) {
          fixedFiles++;
        }
      });
    });

    console.log('\n📊 Processing Summary:');
    console.log('=====================');
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Files fixed: ${fixedFiles}`);
    console.log(`Files with errors: ${errorFiles}`);
    console.log(`Files unchanged: ${totalFiles - fixedFiles - errorFiles}`);

    if (fixedFiles > 0) {
      console.log('\n📋 Next steps:');
      console.log('1. Review the changes made to your test files');
      console.log('2. Run your tests to ensure they still pass');
      console.log('3. If issues occur, restore from .backup files');
      console.log('4. Commit the fixed files once verified');
    }

    console.log('\n✨ Processing complete!');
  }
}

// Run the fixer
if (require.main === module) {
  TestFileFixer.processAllTestFiles();
}