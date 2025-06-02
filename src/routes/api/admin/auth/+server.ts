import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'hannisol-jwt-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hannisol-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  loginAttempt: z.object({
    ip: z.string(),
    userAgent: z.string(),
    timestamp: z.string()
  }).optional()
});

const verifyTokenSchema = z.object({
  token: z.string().optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

// In-memory stores (replace with actual database in production)
const users = new Map([
  ['admin@hannisol.com', {
    id: 'admin-1',
    email: 'admin@hannisol.com',
    username: 'admin',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBo6/EQFmvFSmi', // password: admin123
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    permissions: ['*'],
    loginAttempts: [],
    passwordResetToken: null,
    passwordResetExpiry: null
  }]
]);

const sessions = new Map<string, {
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: Date;
}>();

const activityLogs = new Map<string, Array<{
  id: string;
  userId?: string;
  email?: string;
  activity: string;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}>>();

// Rate limiting (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

// Helper functions
function generateTokens(userId: string, rememberMe: boolean = false) {
  const payload = { userId, type: 'access' };
  const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn });
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
  
  return {
    accessToken,
    refreshToken,
    expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 60 * 60 // seconds
  };
}

function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'access') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    if (decoded.type !== 'refresh') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = `auth:${ip}`;
  
  const limit = rateLimits.get(key);
  if (!limit || now > limit.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxAttempts) {
    return false;
  }
  
  limit.count++;
  return true;
}

function logActivity(activity: {
  userId?: string;
  email?: string;
  activity: string;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
}) {
  const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const key = activity.userId || activity.email || 'anonymous';
  
  if (!activityLogs.has(key)) {
    activityLogs.set(key, []);
  }
  
  const logs = activityLogs.get(key)!;
  logs.push({
    id,
    ...activity,
    timestamp: new Date()
  });
  
  // Keep only last 100 logs per user
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100);
  }
}

// POST - Login
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return json({ 
        success: false, 
        message: 'Invalid input data',
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, password, rememberMe, loginAttempt } = validation.data;
    const ip = loginAttempt?.ip || 'unknown';
    const userAgent = loginAttempt?.userAgent || 'unknown';

    // Check rate limiting
    if (!checkRateLimit(ip)) {
      logActivity({
        email,
        activity: 'login_rate_limited',
        ip,
        userAgent,
        success: false,
        error: 'Rate limit exceeded'
      });

      return json({
        success: false,
        message: 'Too many login attempts. Please try again later.'
      }, { status: 429 });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      logActivity({
        email,
        activity: 'login_failed',
        ip,
        userAgent,
        success: false,
        error: 'User not found'
      });

      return json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      logActivity({
        userId: user.id,
        email,
        activity: 'login_blocked',
        ip,
        userAgent,
        success: false,
        error: 'Account disabled'
      });

      return json({
        success: false,
        message: 'Account is disabled. Please contact support.'
      }, { status: 403 });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      // Track failed login attempt
      user.loginAttempts.push({
        ip,
        userAgent,
        timestamp: new Date(),
        success: false
      });

      logActivity({
        userId: user.id,
        email,
        activity: 'login_failed',
        ip,
        userAgent,
        success: false,
        error: 'Invalid password'
      });

      return json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check admin role
    if (user.role !== 'admin') {
      logActivity({
        userId: user.id,
        email,
        activity: 'login_unauthorized',
        ip,
        userAgent,
        success: false,
        error: 'Insufficient permissions'
      });

      return json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = generateTokens(user.id, rememberMe);

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessions.set(sessionId, {
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + (expiresIn * 1000)),
      ipAddress: ip,
      userAgent,
      isActive: true,
      createdAt: new Date()
    });

    // Update user
    user.lastLogin = new Date();
    user.loginAttempts.push({
      ip,
      userAgent,
      timestamp: new Date(),
      success: true
    });

    // Log successful login
    logActivity({
      userId: user.id,
      email,
      activity: 'login_success',
      ip,
      userAgent,
      success: true
    });

    return json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      token: accessToken,
      refreshToken,
      expiresIn
    });

  } catch (error) {
    console.error('Login error:', error);
    return json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
};

// GET - Verify token
export const GET: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({
        success: false,
        message: 'No authorization token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user || !user.isActive) {
      return json({
        success: false,
        message: 'User not found or inactive'
      }, { status: 401 });
    }

    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return json({
      success: false,
      message: 'Token verification failed'
    }, { status: 500 });
  }
};

// PUT - Refresh token
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = refreshTokenSchema.safeParse(body);
    
    if (!validation.success) {
      return json({
        success: false,
        message: 'Invalid refresh token format'
      }, { status: 400 });
    }

    const { refreshToken } = validation.data;
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return json({
        success: false,
        message: 'Invalid or expired refresh token'
      }, { status: 401 });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user || !user.isActive) {
      return json({
        success: false,
        message: 'User not found or inactive'
      }, { status: 401 });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(user.id);

    return json({
      success: true,
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresIn
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return json({
      success: false,
      message: 'Token refresh failed'
    }, { status: 500 });
  }
};

// DELETE - Logout
export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      
      if (decoded) {
        // Find and deactivate session
        for (const [sessionId, session] of sessions.entries()) {
          if (session.userId === decoded.userId && session.token === token) {
            session.isActive = false;
            break;
          }
        }

        // Log logout activity
        logActivity({
          userId: decoded.userId,
          activity: 'logout',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: true
        });
      }
    }

    return json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 });
  }
};

// Additional endpoints can be added here for:
// - Change password
// - Forgot password
// - Activity logs
// - Session management