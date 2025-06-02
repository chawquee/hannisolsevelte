import { browser } from '$app/environment';
import type { User } from '$lib/types/database';

// JWT token utilities
export const jwtUtils = {
  // Decode JWT token (client-side only, for reading claims)
  decode(token: string): any {
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },

  // Check if token is expired
  isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  },

  // Get token expiry date
  getExpiryDate(token: string): Date | null {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  },

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(token: string): number {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  }
};

// Password validation utilities
export const passwordUtils = {
  // Validate password strength
  validateStrength(password: string): {
    isValid: boolean;
    score: number;
    requirements: Array<{ met: boolean; description: string }>;
  } {
    const requirements = [
      {
        met: password.length >= 8,
        description: 'At least 8 characters long'
      },
      {
        met: /[a-z]/.test(password),
        description: 'Contains lowercase letter'
      },
      {
        met: /[A-Z]/.test(password),
        description: 'Contains uppercase letter'
      },
      {
        met: /\d/.test(password),
        description: 'Contains number'
      },
      {
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        description: 'Contains special character'
      },
      {
        met: password.length >= 12,
        description: 'At least 12 characters (recommended)'
      }
    ];

    const metCount = requirements.filter(req => req.met).length;
    const score = Math.round((metCount / requirements.length) * 100);
    const isValid = metCount >= 4; // At least 4 out of 6 requirements

    return {
      isValid,
      score,
      requirements
    };
  },

  // Generate password strength description
  getStrengthDescription(score: number): string {
    if (score < 40) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  },

  // Get password strength color
  getStrengthColor(score: number): string {
    if (score < 40) return '#ef4444'; // red
    if (score < 60) return '#f59e0b'; // yellow
    if (score < 80) return '#10b981'; // green
    return '#059669'; // dark green
  }
};

// Session management utilities
export const sessionUtils = {
  // Generate session ID
  generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `${timestamp}_${randomPart}`;
  },

  // Get current session info
  getSessionInfo(): {
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
    screenResolution: string;
    cookieEnabled: boolean;
  } {
    if (!browser) {
      return {
        userAgent: '',
        platform: '',
        language: '',
        timezone: '',
        screenResolution: '',
        cookieEnabled: false
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      cookieEnabled: navigator.cookieEnabled
    };
  },

  // Check if session is from mobile device
  isMobile(): boolean {
    if (!browser) return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  // Get device type
  getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (!browser) return 'desktop';
    
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }
};

// Role and permission utilities
export const roleUtils = {
  // Check if user has specific permission
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admins have all permissions
    return user.permissions.includes(permission);
  },

  // Check if user has any of the specified permissions
  hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.some(permission => user.permissions.includes(permission));
  },

  // Check if user has all specified permissions
  hasAllPermissions(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.every(permission => user.permissions.includes(permission));
  },

  // Get user role display name
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      user: 'User'
    };
    return roleMap[role] || role;
  },

  // Get available permissions list
  getAvailablePermissions(): Array<{ key: string; name: string; description: string }> {
    return [
      {
        key: 'dashboard.view',
        name: 'View Dashboard',
        description: 'Access to admin dashboard'
      },
      {
        key: 'analytics.view',
        name: 'View Analytics',
        description: 'Access to analytics data'
      },
      {
        key: 'analytics.export',
        name: 'Export Analytics',
        description: 'Export analytics data'
      },
      {
        key: 'users.manage',
        name: 'Manage Users',
        description: 'Create, edit, and delete users'
      },
      {
        key: 'system.configure',
        name: 'System Configuration',
        description: 'Modify system settings'
      },
      {
        key: 'ads.manage',
        name: 'Manage Ads',
        description: 'Configure ad networks and placements'
      },
      {
        key: 'content.moderate',
        name: 'Content Moderation',
        description: 'Moderate user-generated content'
      }
    ];
  }
};

// Security utilities
export const securityUtils = {
  // Generate secure random string
  generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (browser && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for server-side
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  },

  // Generate CSRF token
  generateCSRFToken(): string {
    return this.generateRandomString(32);
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Sanitize input string
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  },

  // Check for suspicious activity patterns
  detectSuspiciousActivity(attempts: Array<{ timestamp: number; success: boolean }>): {
    isSuspicious: boolean;
    reason: string;
    recommendation: string;
  } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < oneHour
    );

    // Too many failed attempts
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    if (failedAttempts.length >= 5) {
      return {
        isSuspicious: true,
        reason: 'Too many failed login attempts',
        recommendation: 'Account should be temporarily locked'
      };
    }

    // Too many attempts overall
    if (recentAttempts.length >= 10) {
      return {
        isSuspicious: true,
        reason: 'Excessive login attempts',
        recommendation: 'Rate limiting should be applied'
      };
    }

    return {
      isSuspicious: false,
      reason: '',
      recommendation: ''
    };
  },

  // Generate rate limiting key
  getRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }
};

// Cookie utilities
export const cookieUtils = {
  // Set secure cookie
  set(name: string, value: string, options: {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    if (!browser) return;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.secure !== false) {
      cookieString += '; secure';
    }

    if (options.httpOnly) {
      cookieString += '; httponly';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  },

  // Get cookie value
  get(name: string): string | null {
    if (!browser) return null;

    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  },

  // Delete cookie
  delete(name: string, path: string = '/', domain?: string) {
    if (!browser) return;

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  },

  // Check if cookies are enabled
  isEnabled(): boolean {
    if (!browser) return false;

    try {
      document.cookie = 'test=1';
      const enabled = document.cookie.indexOf('test=1') !== -1;
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      return enabled;
    } catch {
      return false;
    }
  }
};

// Two-factor authentication utilities (for future implementation)
export const twoFactorUtils = {
  // Generate backup codes
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = securityUtils.generateRandomString(8).toUpperCase();
      // Format as XXXX-XXXX
      const formatted = `${code.substring(0, 4)}-${code.substring(4, 8)}`;
      codes.push(formatted);
    }
    
    return codes;
  },

  // Validate backup code format
  isValidBackupCode(code: string): boolean {
    const cleanCode = code.replace(/[-\s]/g, '');
    return /^[A-Z0-9]{8}$/.test(cleanCode);
  }
};

// Export main auth utilities
export const authUtils = {
  jwt: jwtUtils,
  password: passwordUtils,
  session: sessionUtils,
  role: roleUtils,
  security: securityUtils,
  cookie: cookieUtils,
  twoFactor: twoFactorUtils
};