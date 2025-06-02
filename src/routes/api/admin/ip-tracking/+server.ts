// src/routes/api/admin/ip-tracking/+server.ts
import { json } from '@sveltejs/kit';
import { verify } from 'jsonwebtoken';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Request validation schemas
const QuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  country: z.string().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

function verifyAdminAuth(request: Request): boolean {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    
    if (!token) return false;
    
    const decoded = verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin' && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const GET: RequestHandler = async ({ request, url }) => {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const params = Object.fromEntries(url.searchParams);
    const { startDate, endDate, limit, offset, country, groupBy } = QuerySchema.parse(params);
    
    // Build base query
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    
    if (startDate) {
      whereClause += ' AND datetime(timestamp) >= datetime(?)';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND datetime(timestamp) <= datetime(?)';
      queryParams.push(endDate);
    }
    
    if (country) {
      whereClause += ' AND country = ?';
      queryParams.push(country);
    }
    
    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM searches 
      ${whereClause}
    `);
    const { total } = countStmt.get(...queryParams) as { total: number };
    
    // Get IP tracking data with pagination
    const dataStmt = db.prepare(`
      SELECT 
        ip_address,
        country,
        region,
        city,
        address_searched,
        timestamp,
        user_agent,
        search_count
      FROM searches 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);
    
    const data = dataStmt.all(...queryParams, limit, offset);
    
    // Get geographic distribution
    const geoStmt = db.prepare(`
      SELECT 
        country,
        COUNT(*) as searches,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM searches 
      ${whereClause}
      GROUP BY country
      ORDER BY searches DESC
      LIMIT 20
    `);
    
    const geoDistribution = geoStmt.all(...queryParams);
    
    // Get time-based analytics
    let timeFormat: string;
    switch (groupBy) {
      case 'hour':
        timeFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'week':
        timeFormat = '%Y-W%W';
        break;
      case 'month':
        timeFormat = '%Y-%m';
        break;
      default:
        timeFormat = '%Y-%m-%d';
    }
    
    const timeStmt = db.prepare(`
      SELECT 
        strftime('${timeFormat}', timestamp) as period,
        COUNT(*) as searches,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM searches 
      ${whereClause}
      GROUP BY period
      ORDER BY period DESC
      LIMIT 30
    `);
    
    const timeAnalytics = timeStmt.all(...queryParams);
    
    // Get top referrers (if tracking referrers)
    const referrerStmt = db.prepare(`
      SELECT 
        COALESCE(referrer, 'Direct') as source,
        COUNT(*) as visits,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM searches 
      ${whereClause}
      GROUP BY referrer
      ORDER BY visits DESC
      LIMIT 10
    `);
    
    const topReferrers = referrerStmt.all(...queryParams);
    
    // Get most searched addresses
    const addressStmt = db.prepare(`
      SELECT 
        address_searched,
        COUNT(*) as search_count,
        COUNT(DISTINCT ip_address) as unique_searchers,
        MAX(timestamp) as last_searched
      FROM searches 
      ${whereClause}
      AND address_searched IS NOT NULL
      GROUP BY address_searched
      ORDER BY search_count DESC
      LIMIT 20
    `);
    
    const popularAddresses = addressStmt.all(...queryParams);
    
    // Get hourly patterns (24-hour breakdown)
    const hourlyStmt = db.prepare(`
      SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as searches,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM searches 
      ${whereClause}
      GROUP BY hour
      ORDER BY hour
    `);
    
    const hourlyPattern = hourlyStmt.all(...queryParams);
    
    // Get unique visitors vs returning visitors
    const visitorStmt = db.prepare(`
      SELECT 
        ip_address,
        COUNT(*) as visit_count,
        MIN(timestamp) as first_visit,
        MAX(timestamp) as last_visit
      FROM searches 
      ${whereClause}
      GROUP BY ip_address
    `);
    
    const visitorData = visitorStmt.all(...queryParams);
    
    const newVisitors = visitorData.filter(v => (v as any).visit_count === 1).length;
    const returningVisitors = visitorData.filter(v => (v as any).visit_count > 1).length;
    
    // Get device/browser analytics (if user_agent is tracked)
    const deviceStmt = db.prepare(`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
          WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device_type,
        COUNT(*) as visits
      FROM searches 
      ${whereClause}
      AND user_agent IS NOT NULL
      GROUP BY device_type
    `);
    
    const deviceAnalytics = deviceStmt.all(...queryParams);
    
    return json({
      success: true,
      data: {
        searches: data,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        },
        analytics: {
          geographic: geoDistribution,
          timePattern: timeAnalytics,
          hourlyPattern,
          topReferrers,
          popularAddresses,
          visitorBreakdown: {
            newVisitors,
            returningVisitors,
            totalUniqueVisitors: visitorData.length
          },
          deviceAnalytics
        },
        summary: {
          totalSearches: total,
          uniqueVisitors: visitorData.length,
          avgSearchesPerVisitor: total / (visitorData.length || 1),
          topCountry: geoDistribution[0]?.country || 'Unknown'
        }
      }
    });
    
  } catch (error) {
    console.error('IP tracking API error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to fetch IP tracking data' },
      { status: 500 }
    );
  }
};

// POST endpoint for manual IP tracking (if needed)
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { action, ip_address, metadata } = body;
    
    // Log admin action
    const stmt = db.prepare(`
      INSERT INTO admin_actions (
        action, 
        ip_address, 
        metadata, 
        admin_ip, 
        timestamp
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    stmt.run(
      action,
      ip_address,
      JSON.stringify(metadata || {}),
      getClientAddress()
    );
    
    return json({ success: true, message: 'Action logged successfully' });
    
  } catch (error) {
    console.error('IP tracking POST error:', error);
    return json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
};

// DELETE endpoint for clearing old IP data (GDPR compliance)
export const DELETE: RequestHandler = async ({ request, url }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const olderThan = url.searchParams.get('olderThan'); // days
    const days = parseInt(olderThan || '90');
    
    if (days < 30) {
      return json(
        { error: 'Cannot delete data newer than 30 days' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare(`
      DELETE FROM searches 
      WHERE datetime(timestamp) < datetime('now', '-${days} days')
    `);
    
    const result = stmt.run();
    
    return json({
      success: true,
      deletedRecords: result.changes,
      message: `Deleted ${result.changes} records older than ${days} days`
    });
    
  } catch (error) {
    console.error('IP tracking DELETE error:', error);
    return json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
};