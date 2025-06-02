import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

export const load: PageServerLoad = async ({ cookies, url }) => {
  // Check if user is already authenticated
  const token = cookies.get('hannisol_auth_token');
  
  if (token) {
    try {
      // Verify existing token
      const response = await fetch(`${url.origin}/api/admin/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { user } = await response.json();
        
        // If user is already authenticated and is admin, redirect to dashboard
        if (user && user.role === 'admin') {
          const redirectTo = url.searchParams.get('redirect') || '/admin';
          throw redirect(302, redirectTo);
        }
      }
    } catch (error) {
      // Token is invalid, clear it
      cookies.delete('hannisol_auth_token', { path: '/' });
    }
  }

  // Get any error messages or redirect URL from query params
  const error = url.searchParams.get('error');
  const redirectTo = url.searchParams.get('redirect') || '/admin';
  const message = url.searchParams.get('message');

  return {
    redirectTo,
    error: getErrorMessage(error),
    message: getSuccessMessage(message)
  };
};

export const actions: Actions = {
  // Default login action
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    
    // Parse form data
    const rawData = {
      email: formData.get('email')?.toString() || '',
      password: formData.get('password')?.toString() || '',
      rememberMe: formData.get('rememberMe') === 'on'
    };

    // Validate form data
    const validation = loginSchema.safeParse(rawData);
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return fail(400, {
        email: rawData.email,
        errors,
        message: 'Please check your input and try again.'
      });
    }

    const { email, password, rememberMe } = validation.data;

    try {
      // Attempt login
      const response = await fetch(`${url.origin}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
          'User-Agent': request.headers.get('user-agent') || ''
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
          loginAttempt: {
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString()
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 401) {
          return fail(401, {
            email,
            errors: { password: ['Invalid email or password'] },
            message: 'Login failed. Please check your credentials.'
          });
        }
        
        if (response.status === 423) {
          return fail(423, {
            email,
            errors: { email: ['Account is temporarily locked'] },
            message: 'Account locked due to too many failed attempts. Please try again later.'
          });
        }

        if (response.status === 403) {
          return fail(403, {
            email,
            errors: { email: ['Insufficient permissions'] },
            message: 'You do not have admin access to this system.'
          });
        }

        throw new Error(result.message || 'Login failed');
      }

      const { user, token, refreshToken, expiresIn } = result;

      // Validate that user has admin role
      if (!user || user.role !== 'admin') {
        return fail(403, {
          email,
          errors: { email: ['Admin access required'] },
          message: 'Only administrators can access this panel.'
        });
      }

      // Set authentication cookies
      const tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
      const cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: url.protocol === 'https:',
        sameSite: 'lax' as const,
        expires: rememberMe ? tokenExpiry : undefined,
        maxAge: rememberMe ? expiresIn : undefined
      };

      cookies.set('hannisol_auth_token', token, cookieOptions);
      
      if (refreshToken) {
        cookies.set('hannisol_refresh_token', refreshToken, {
          ...cookieOptions,
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days if remember me, 7 days otherwise
        });
      }

      // Log successful login
      try {
        await fetch(`${url.origin}/api/admin/auth/log-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user.id,
            activity: 'login',
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            success: true
          })
        });
      } catch (error) {
        console.warn('Failed to log login activity:', error);
      }

      // Redirect to intended destination
      const redirectTo = url.searchParams.get('redirect') || '/admin';
      throw redirect(302, redirectTo);

    } catch (error) {
      console.error('Login error:', error);

      // Log failed login attempt
      try {
        await fetch(`${url.origin}/api/admin/auth/log-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            activity: 'login_failed',
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        });
      } catch (logError) {
        console.warn('Failed to log failed login:', logError);
      }

      return fail(500, {
        email,
        errors: { general: ['Login failed. Please try again.'] },
        message: 'An unexpected error occurred. Please try again later.'
      });
    }
  },

  // Forgot password action
  forgotPassword: async ({ request, url }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString() || '';

    // Validate email
    const emailValidation = z.string().email().safeParse(email);
    
    if (!emailValidation.success) {
      return fail(400, {
        forgotPasswordError: 'Please enter a valid email address.'
      });
    }

    try {
      const response = await fetch(`${url.origin}/api/admin/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      // Always return success message for security (don't reveal if email exists)
      return {
        forgotPasswordSuccess: 'If an account with that email exists, you will receive password reset instructions.'
      };

    } catch (error) {
      console.error('Forgot password error:', error);
      
      return fail(500, {
        forgotPasswordError: 'Unable to process password reset request. Please try again later.'
      });
    }
  }
};

// Helper function to get error messages
function getErrorMessage(error: string | null): string | null {
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please try again.',
    'account_locked': 'Account is temporarily locked due to too many failed login attempts.',
    'insufficient_permissions': 'You do not have permission to access the admin panel.',
    'session_expired': 'Your session has expired. Please log in again.',
    'auth_failed': 'Authentication failed. Please log in again.',
    'token_invalid': 'Invalid authentication token. Please log in again.',
    'account_disabled': 'This account has been disabled. Please contact support.',
    'maintenance_mode': 'The admin panel is currently under maintenance. Please try again later.'
  };

  return error ? errorMessages[error] || 'An error occurred. Please try again.' : null;
}

// Helper function to get success messages
function getSuccessMessage(message: string | null): string | null {
  const successMessages: Record<string, string> = {
    'password_reset': 'Your password has been reset successfully. Please log in with your new password.',
    'account_verified': 'Your account has been verified. You can now log in.',
    'logout_success': 'You have been logged out successfully.',
    'session_timeout': 'Your session has timed out for security. Please log in again.'
  };

  return message ? successMessages[message] || message : null;
}

// Rate limiting helper (in a real app, this would be in Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }

  // Increment attempt count
  attempts.count++;
  attempts.lastAttempt = now;
  
  return true;
}