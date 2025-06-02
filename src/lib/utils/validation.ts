// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Field validation options
export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

// Form validation schema
export interface ValidationSchema {
  [fieldName: string]: ValidationOptions;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  solanaAddress: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  phoneNumber: /^\+?[\d\s\-\(\)]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/
};

// Input sanitization utilities
export const sanitization = {
  // Remove HTML tags and potentially dangerous characters
  sanitizeHtml(input: string): string {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .trim();
  },

  // Sanitize for SQL (basic protection, use parameterized queries instead)
  sanitizeSql(input: string): string {
    return input
      .replace(/['";\\]/g, '') // Remove SQL injection characters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments
      .replace(/\*\//g, '')
      .trim();
  },

  // Sanitize for XSS
  sanitizeXss(input: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
  },

  // Sanitize filename
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit length
  },

  // Normalize whitespace
  normalizeWhitespace(input: string): string {
    return input
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  },

  // Remove non-printable characters
  removePrintableChars(input: string): string {
    return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  }
};

// String validation utilities
export const stringValidation = {
  // Validate required field
  required(value: string): ValidationResult {
    const isValid = value !== null && value !== undefined && value.trim().length > 0;
    return {
      isValid,
      errors: isValid ? [] : ['This field is required'],
      warnings: [],
      suggestions: isValid ? [] : ['Please enter a value']
    };
  },

  // Validate minimum length
  minLength(value: string, min: number): ValidationResult {
    const isValid = value.length >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Minimum length is ${min} characters`],
      warnings: [],
      suggestions: isValid ? [] : [`Add ${min - value.length} more characters`]
    };
  },

  // Validate maximum length
  maxLength(value: string, max: number): ValidationResult {
    const isValid = value.length <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Maximum length is ${max} characters`],
      warnings: [],
      suggestions: isValid ? [] : [`Remove ${value.length - max} characters`]
    };
  },

  // Validate pattern
  pattern(value: string, pattern: RegExp, errorMessage: string = 'Invalid format'): ValidationResult {
    const isValid = pattern.test(value);
    return {
      isValid,
      errors: isValid ? [] : [errorMessage],
      warnings: [],
      suggestions: []
    };
  },

  // Validate email
  email(value: string): ValidationResult {
    const basic = this.pattern(value, VALIDATION_PATTERNS.email, 'Invalid email address');
    
    if (!basic.isValid) return basic;

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Additional email checks
    const parts = value.split('@');
    if (parts.length === 2) {
      const [local, domain] = parts;
      
      // Check for common typos
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const similarDomain = commonDomains.find(d => this.levenshteinDistance(domain, d) === 1);
      
      if (similarDomain) {
        warnings.push(`Did you mean ${local}@${similarDomain}?`);
      }

      // Check for suspicious patterns
      if (local.length < 2) {
        warnings.push('Email local part seems very short');
      }

      if (domain.split('.').length < 2) {
        warnings.push('Domain should contain at least one dot');
      }
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      suggestions
    };
  },

  // Calculate Levenshtein distance for typo detection
  levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
};

// Solana-specific validation
export const solanaValidation = {
  // Validate Solana address
  address(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Address is required'],
        warnings: [],
        suggestions: ['Enter a valid Solana address']
      };
    }

    const cleaned = value.trim();

    // Check length
    if (cleaned.length !== 44 && cleaned.length !== 43) {
      errors.push('Solana addresses should be 43-44 characters long');
      
      if (cleaned.length < 43) {
        suggestions.push('Address appears too short - check for missing characters');
      } else {
        suggestions.push('Address appears too long - check for extra characters');
      }
    }

    // Check base58 characters
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(cleaned)) {
      errors.push('Address contains invalid characters');
      suggestions.push('Use only base58 characters (no 0, O, I, l)');
    }

    // Check for common mistakes
    if (cleaned.includes('0') || cleaned.includes('O') || cleaned.includes('I') || cleaned.includes('l')) {
      warnings.push('Address contains characters that are not valid in base58 (0, O, I, l)');
    }

    // Check for mixed case (unusual for Solana addresses)
    const hasLower = /[a-z]/.test(cleaned);
    const hasUpper = /[A-Z]/.test(cleaned);
    if (hasLower && hasUpper) {
      warnings.push('Mixed case in address - double-check for accuracy');
    }

    // Try to validate with Solana's PublicKey constructor
    try {
      // This would need to import PublicKey from @solana/web3.js
      // For now, we'll do basic validation
    } catch (error) {
      errors.push('Invalid Solana address format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  },

  // Validate transaction signature
  signature(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Transaction signature is required'],
        warnings: [],
        suggestions: ['Enter a valid transaction signature']
      };
    }

    const cleaned = value.trim();

    // Check length (signatures are typically 88 characters)
    if (cleaned.length !== 88) {
      errors.push('Transaction signatures should be 88 characters long');
    }

    // Check base58 format
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(cleaned)) {
      errors.push('Signature contains invalid characters');
      suggestions.push('Use only base58 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  },

  // Validate token mint address
  tokenMint(value: string): ValidationResult {
    // Token mints use the same format as regular addresses
    return this.address(value);
  }
};

// Numeric validation utilities
export const numericValidation = {
  // Validate integer
  integer(value: string | number, options: { min?: number; max?: number } = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(numValue)) {
      return {
        isValid: false,
        errors: ['Must be a valid integer'],
        warnings: [],
        suggestions: ['Enter a whole number']
      };
    }

    if (!Number.isInteger(numValue)) {
      errors.push('Must be a whole number');
      suggestions.push('Remove decimal places');
    }

    if (options.min !== undefined && numValue < options.min) {
      errors.push(`Must be at least ${options.min}`);
    }

    if (options.max !== undefined && numValue > options.max) {
      errors.push(`Must be no more than ${options.max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  },

  // Validate decimal number
  decimal(value: string | number, options: { min?: number; max?: number; decimals?: number } = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return {
        isValid: false,
        errors: ['Must be a valid number'],
        warnings: [],
        suggestions: ['Enter a numeric value']
      };
    }

    if (options.min !== undefined && numValue < options.min) {
      errors.push(`Must be at least ${options.min}`);
    }

    if (options.max !== undefined && numValue > options.max) {
      errors.push(`Must be no more than ${options.max}`);
    }

    if (options.decimals !== undefined) {
      const decimals = (numValue.toString().split('.')[1] || '').length;
      if (decimals > options.decimals) {
        errors.push(`Maximum ${options.decimals} decimal places allowed`);
        suggestions.push(`Round to ${options.decimals} decimal places`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  },

  // Validate percentage
  percentage(value: string | number): ValidationResult {
    return this.decimal(value, { min: 0, max: 100 });
  }
};

// Form validation utilities
export const formValidation = {
  // Validate single field
  validateField(value: any, options: ValidationOptions): ValidationResult {
    const results: ValidationResult[] = [];

    // Required check
    if (options.required) {
      results.push(stringValidation.required(String(value || '')));
    }

    // Skip other validations if field is empty and not required
    if (!options.required && (!value || String(value).trim().length === 0)) {
      return { isValid: true, errors: [], warnings: [], suggestions: [] };
    }

    const stringValue = String(value || '');

    // Length checks
    if (options.minLength !== undefined) {
      results.push(stringValidation.minLength(stringValue, options.minLength));
    }

    if (options.maxLength !== undefined) {
      results.push(stringValidation.maxLength(stringValue, options.maxLength));
    }

    // Pattern check
    if (options.pattern) {
      results.push(stringValidation.pattern(stringValue, options.pattern));
    }

    // Custom validator
    if (options.customValidator) {
      results.push(options.customValidator(value));
    }

    // Combine results
    return this.combineResults(results);
  },

  // Validate entire form
  validateForm(data: Record<string, any>, schema: ValidationSchema): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, options] of Object.entries(schema)) {
      results[fieldName] = this.validateField(data[fieldName], options);
    }

    return results;
  },

  // Check if form is valid
  isFormValid(validationResults: Record<string, ValidationResult>): boolean {
    return Object.values(validationResults).every(result => result.isValid);
  },

  // Get all form errors
  getFormErrors(validationResults: Record<string, ValidationResult>): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const [fieldName, result] of Object.entries(validationResults)) {
      if (result.errors.length > 0) {
        errors[fieldName] = result.errors;
      }
    }

    return errors;
  },

  // Combine multiple validation results
  combineResults(results: ValidationResult[]): ValidationResult {
    const combined: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    for (const result of results) {
      if (!result.isValid) {
        combined.isValid = false;
      }
      combined.errors.push(...result.errors);
      combined.warnings.push(...result.warnings);
      combined.suggestions.push(...result.suggestions);
    }

    // Remove duplicates
    combined.errors = [...new Set(combined.errors)];
    combined.warnings = [...new Set(combined.warnings)];
    combined.suggestions = [...new Set(combined.suggestions)];

    return combined;
  }
};

// Rate limiting validation
export const rateLimitValidation = {
  // Simple in-memory rate limiting (for client-side)
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map(),

  // Check rate limit
  checkRateLimit(
    identifier: string, 
    maxRequests: number, 
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let record = this.rateLimitStore.get(identifier);
    
    // Clean up old records or initialize new one
    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      this.rateLimitStore.set(identifier, record);
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Increment counter
    record.count++;
    
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    };
  },

  // Clear rate limit for identifier
  clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(identifier);
  },

  // Clean up expired records
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.rateLimitStore.entries()) {
      if (record.resetTime <= now) {
        this.rateLimitStore.delete(key);
      }
    }
  }
};

// Export main validation object
export const validation = {
  patterns: VALIDATION_PATTERNS,
  sanitize: sanitization,
  string: stringValidation,
  solana: solanaValidation,
  numeric: numericValidation,
  form: formValidation,
  rateLimit: rateLimitValidation
};

// Utility functions
export const isValidEmail = (email: string): boolean => {
  return stringValidation.email(email).isValid;
};

export const isValidSolanaAddress = (address: string): boolean => {
  return solanaValidation.address(address).isValid;
};

export const sanitizeInput = (input: string): string => {
  return sanitization.sanitizeXss(sanitization.sanitizeHtml(input));
};