// src/hooks.server.ts
import { type Handle, type HandleServerError } from '@sveltejs/kit';
import { verify } from 'jsonwebtoken';
import { db } from '$lib/database/connection';
import { dev } from '$app/environment';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  search: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
  api: { requests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 requests per hour
  admin: { requests: 200, windowMs: 60 * 60 * 1000 }, // 200 requests per hour
};

function rateLimit(ip: string, endpoint: string): boolean {
  const now = Date.now();
  const limits = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;
  const key = `${ip}:${endpoint}`;
  
  const current = rateLimitStore.get(key);
  
  // Reset window if expired
  if (!current || now - current.windowStart > limits.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  
  // Check if within limits
  if (current.count >= limits.requests) {
    return false;
  }
  
  // Increment counter
  current.count++;
  return true;
}

function getClientIP(request: Request, event: any): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to SvelteKit's getClientAddress if available
  return event.getClientAddress() || '127.0.0.1';
}

function isBlacklisted(ip: string): boolean {
  try {
    const stmt = db.prepare('SELECT 1 FROM ip_blocklist WHERE ip_address = ? AND is_active = 1');
    return !!stmt.get(ip);
  } catch (error) {
    console.error('Error checking IP blacklist:', error);
    return false;
  }
}

function logRequest(ip: string, userAgent: string, url: string, method: string, statusCode?: number) {
  try {
    const stmt = db.prepare(`
      INSERT INTO request_logs (ip_address, user_agent, url, method, status_code, timestamp)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(ip, userAgent, url, method, statusCode || 200);
  } catch (error) {
    console.error('Error logging request:', error);
  }
}

function verifyAdminAuth(token: string): { valid: boolean; user?: any } {
  try {
    if (!token) return { valid: false };
    
    const decoded = verify(token, JWT_SECRET) as any;
    
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }
    
    return {
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch {
    return { valid: false };
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now();
  const clientIP = getClientIP(event.request, event);
  const userAgent = event.request.headers.get('user-agent') || '';
  const url = event.url.pathname;
  const method = event.request.method;
  
  // Set client IP in event locals for use in endpoints
  event.locals.clientIP = clientIP;
  event.locals.userAgent = userAgent;
  
  // Check IP blacklist
  if (isBlacklisted(clientIP)) {
    logRequest(clientIP, userAgent, url, method, 403);
    return new Response('Access Denied', { status: 403 });
  }
  
  // Determine rate limit category
  let rateLimitCategory = 'api';
  if (url.startsWith('/api/search')) {
    rateLimitCategory = 'search';
  } else if (url.startsWith('/api/admin')) {
    rateLimitCategory = 'admin';
  } else if (url.startsWith('/api/')) {
    rateLimitCategory = 'api';
  }
  
  // Apply rate limiting (skip in development)
  if (!dev && !rateLimit(clientIP, rateLimitCategory)) {
    logRequest(clientIP, userAgent, url, method, 429);
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': '3600' // 1 hour
      }
    });
  }
  
  // Admin authentication for admin routes
  if (url.startsWith('/admin') || url.startsWith('/api/admin')) {
    const authHeader = event.request.headers.get('Authorization');
    const cookieToken = event.cookies.get('auth-token');
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    const authResult = verifyAdminAuth(token);
    
    if (!authResult.valid) {
      if (url.startsWith('/api/admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Redirect to admin login
        return new Response(null, {
          status: 302,
          headers: { Location: '/admin/login' }
        });
      }
    }
    
    // Set admin user in locals
    event.locals.adminUser = authResult.user;
  }
  
  // Set security headers
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Add security meta tags if not present
      if (!html.includes('<meta name="robots"')) {
        html = html.replace(
          '<head>',
          '<head>\n    <meta name="robots" content="index, follow">'
        );
      }
      return html;
    }
  });
  
  // Set security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP for production
  if (!dev) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.solana.com https://api.mainnet-beta.solana.com; " +
      "frame-src 'none';"
    );
  }
  
  // CORS headers for API routes
  if (url.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', dev ? '*' : 'https://hannisol.com');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  // Handle preflight requests
  if (method === 'OPTIONS' && url.startsWith('/api/')) {
    return new Response(null, { status: 204 });
  }
  
  // Log request
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  logRequest(clientIP, userAgent, url, method, response.status);
  
  // Log slow requests
  if (duration > 5000) {
    console.warn(`Slow request: ${method} ${url} took ${duration}ms from ${clientIP}`);
  }
  
  // Add performance header in development
  if (dev) {
    response.headers.set('X-Response-Time', `${duration}ms`);
  }
  
  return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
  const clientIP = getClientIP(event.request, event);
  const errorId = crypto.randomUUID();
  
  console.error(`Error ${errorId} from ${clientIP}:`, error);
  
  // Log error to database
  try {
    const stmt = db.prepare(`
      INSERT INTO error_logs (
        error_id, 
        ip_address, 
        url, 
        method, 
        error_message, 
        stack_trace, 
        user_agent, 
        timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    stmt.run(
      errorId,
      clientIP,
      event.url.pathname,
      event.request.method,
      error?.message || 'Unknown error',
      error?.stack || '',
      event.request.headers.get('user-agent') || ''
    );
  } catch (dbError) {
    console.error('Failed to log error to database:', dbError);
  }
  
  return {
    message: dev ? error?.message : 'An unexpected error occurred',
    errorId: dev ? errorId : undefined
  };
};

// Cleanup function to remove old rate limit entries
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart > oneHour) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Types for event.locals
declare global {
  namespace App {
    interface Locals {
      clientIP: string;
      userAgent: string;
      adminUser?: {
        email: string;
        role: string;
      };
    }
    
    interface Error {
      message: string;
      errorId?: string;
    }
  }
}