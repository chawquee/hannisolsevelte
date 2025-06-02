// src/routes/api/admin/analytics/+server.ts
import { json } from '@sveltejs/kit';
import { verify } from 'jsonwebtoken';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Request validation schemas
const AnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metric: z.enum(['all', 'traffic', 'searches', 'revenue', 'performance', 'geographic', 'devices']).default('all'),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  compareWith: z.string().optional(), // Previous period comparison
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

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

export const GET: RequestHandler = async ({ request, url }) => {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const params = Object.fromEntries(url.searchParams);
    const { startDate, endDate, metric, groupBy, compareWith } = AnalyticsQuerySchema.parse(params);
    
    // Default date range (last 30 days if not specified)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Build base query conditions
    let whereClause = 'WHERE datetime(timestamp) >= datetime(?) AND datetime(timestamp) <= datetime(?)';
    const baseParams = [start.toISOString(), end.toISOString()];
    
    // Calculate previous period for comparison
    const periodDiff = end.getTime() - start.getTime();
    const compareStart = new Date(start.getTime() - periodDiff);
    const compareEnd = new Date(end.getTime() - periodDiff);
    
    const analytics: any = {};
    
    // TRAFFIC ANALYTICS
    if (metric === 'all' || metric === 'traffic') {
      // Current period traffic
      const trafficStmt = db.prepare(`
        SELECT 
          COUNT(*) as total_visits,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(DISTINCT DATE(timestamp)) as active_days,
          AVG(CASE WHEN search_count > 1 THEN search_count ELSE 1 END) as avg_pages_per_visit
        FROM searches 
        ${whereClause}
      `);
      
      const currentTraffic = trafficStmt.get(...baseParams) as any;
      
      // Previous period traffic for comparison
      const prevTrafficStmt = db.prepare(`
        SELECT 
          COUNT(*) as total_visits,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM searches 
        WHERE datetime(timestamp) >= datetime(?) AND datetime(timestamp) <= datetime(?)
      `);
      
      const prevTraffic = prevTrafficStmt.get(compareStart.toISOString(), compareEnd.toISOString()) as any;
      
      // Time-based traffic pattern
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
      
      const timeTrafficStmt = db.prepare(`
        SELECT 
          strftime('${timeFormat}', timestamp) as period,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(DISTINCT address_searched) as unique_addresses
        FROM searches 
        ${whereClause}
        GROUP BY period
        ORDER BY period
      `);
      
      const timeTraffic = timeTrafficStmt.all(...baseParams);
      
      analytics.traffic = {
        current: {
          totalVisits: currentTraffic.total_visits,
          uniqueVisitors: currentTraffic.unique_visitors,
          activeDays: currentTraffic.active_days,
          avgPagesPerVisit: Math.round(currentTraffic.avg_pages_per_visit * 100) / 100,
          bounceRate: 0, // Calculate if session tracking is available
        },
        growth: {
          visitsGrowth: calculateGrowth(currentTraffic.total_visits, prevTraffic.total_visits),
          visitorsGrowth: calculateGrowth(currentTraffic.unique_visitors, prevTraffic.unique_visitors),
        },
        timeline: timeTraffic
      };
    }
    
    // SEARCH ANALYTICS
    if (metric === 'all' || metric === 'searches') {
      // Search patterns
      const searchStmt = db.prepare(`
        SELECT 
          COUNT(*) as total_searches,
          COUNT(DISTINCT address_searched) as unique_addresses,
          AVG(LENGTH(address_searched)) as avg_address_length,
          COUNT(CASE WHEN address_searched LIKE '%error%' THEN 1 END) as error_searches
        FROM searches 
        ${whereClause}
        AND address_searched IS NOT NULL
      `);
      
      const searchData = searchStmt.get(...baseParams) as any;
      
      // Most searched addresses
      const popularStmt = db.prepare(`
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
      
      const popularAddresses = popularStmt.all(...baseParams);
      
      // Search frequency distribution
      const frequencyStmt = db.prepare(`
        SELECT 
          search_count,
          COUNT(*) as users
        FROM (
          SELECT ip_address, COUNT(*) as search_count
          FROM searches 
          ${whereClause}
          GROUP BY ip_address
        )
        GROUP BY search_count
        ORDER BY search_count
      `);
      
      const searchFrequency = frequencyStmt.all(...baseParams);
      
      analytics.searches = {
        summary: searchData,
        popular: popularAddresses,
        frequency: searchFrequency
      };
    }
    
    // REVENUE ANALYTICS
    if (metric === 'all' || metric === 'revenue') {
      const revenueStmt = db.prepare(`
        SELECT 
          SUM(amount_usd) as total_revenue,
          COUNT(*) as transactions,
          AVG(amount_usd) as avg_transaction,
          source,
          type
        FROM revenue 
        WHERE date(timestamp) >= date(?) AND date(timestamp) <= date(?)
        GROUP BY source, type
        ORDER BY total_revenue DESC
      `);
      
      const revenueData = revenueStmt.all(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
      
      // Revenue per visitor
      const rppStmt = db.prepare(`
        SELECT 
          (SELECT SUM(amount_usd) FROM revenue WHERE date(timestamp) >= date(?) AND date(timestamp) <= date(?)) as total_revenue,
          (SELECT COUNT(DISTINCT ip_address) FROM searches WHERE datetime(timestamp) >= datetime(?) AND datetime(timestamp) <= datetime(?)) as unique_visitors
      `);
      
      const rppData = rppStmt.get(
        start.toISOString().split('T')[0], 
        end.toISOString().split('T')[0],
        start.toISOString(),
        end.toISOString()
      ) as any;
      
      const revenuePerVisitor = rppData.unique_visitors > 0 ? 
        rppData.total_revenue / rppData.unique_visitors : 0;
      
      analytics.revenue = {
        breakdown: revenueData,
        metrics: {
          totalRevenue: rppData.total_revenue || 0,
          revenuePerVisitor: Math.round(revenuePerVisitor * 100) / 100,
          transactions: revenueData.reduce((sum, item) => sum + item.transactions, 0)
        }
      };
    }
    
    // GEOGRAPHIC ANALYTICS
    if (metric === 'all' || metric === 'geographic') {
      const geoStmt = db.prepare(`
        SELECT 
          country,
          region,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(DISTINCT address_searched) as searches,
          AVG(search_count) as avg_searches_per_visitor
        FROM searches 
        ${whereClause}
        GROUP BY country, region
        ORDER BY visits DESC
        LIMIT 50
      `);
      
      const geoData = geoStmt.all(...baseParams);
      
      // Country summary
      const countryStmt = db.prepare(`
        SELECT 
          country,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors,
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM searches ${whereClause})) as percentage
        FROM searches 
        ${whereClause}
        GROUP BY country
        ORDER BY visits DESC
        LIMIT 20
      `);
      
      const countryData = countryStmt.all(...baseParams, ...baseParams);
      
      analytics.geographic = {
        detailed: geoData,
        countries: countryData
      };
    }
    
    // DEVICE ANALYTICS
    if (metric === 'all' || metric === 'devices') {
      const deviceStmt = db.prepare(`
        SELECT 
          CASE 
            WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN 'Mobile'
            WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'Tablet'
            ELSE 'Desktop'
          END as device_type,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors,
          AVG(search_count) as avg_searches
        FROM searches 
        ${whereClause}
        AND user_agent IS NOT NULL
        GROUP BY device_type
        ORDER BY visits DESC
      `);
      
      const deviceData = deviceStmt.all(...baseParams);
      
      // Browser analysis
      const browserStmt = db.prepare(`
        SELECT 
          CASE 
            WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
            WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
            WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari'
            WHEN user_agent LIKE '%Edge%' THEN 'Edge'
            ELSE 'Other'
          END as browser,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM searches 
        ${whereClause}
        AND user_agent IS NOT NULL
        GROUP BY browser
        ORDER BY visits DESC
      `);
      
      const browserData = browserStmt.all(...baseParams);
      
      analytics.devices = {
        types: deviceData,
        browsers: browserData
      };
    }
    
    // PERFORMANCE ANALYTICS
    if (metric === 'all' || metric === 'performance') {
      // Peak hours analysis
      const peakHoursStmt = db.prepare(`
        SELECT 
          strftime('%H', timestamp) as hour,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors,
          AVG(search_count) as avg_searches
        FROM searches 
        ${whereClause}
        GROUP BY hour
        ORDER BY visits DESC
      `);
      
      const peakHours = peakHoursStmt.all(...baseParams);
      
      // Day of week analysis
      const dayOfWeekStmt = db.prepare(`
        SELECT 
          strftime('%w', timestamp) as day_of_week,
          CASE strftime('%w', timestamp)
            WHEN '0' THEN 'Sunday'
            WHEN '1' THEN 'Monday'
            WHEN '2' THEN 'Tuesday'
            WHEN '3' THEN 'Wednesday'
            WHEN '4' THEN 'Thursday'
            WHEN '5' THEN 'Friday'
            WHEN '6' THEN 'Saturday'
          END as day_name,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM searches 
        ${whereClause}
        GROUP BY day_of_week, day_name
        ORDER BY visits DESC
      `);
      
      const dayOfWeek = dayOfWeekStmt.all(...baseParams);
      
      // Session duration simulation (if tracking available)
      const sessionStmt = db.prepare(`
        SELECT 
          ip_address,
          COUNT(*) as page_views,
          (strftime('%s', MAX(timestamp)) - strftime('%s', MIN(timestamp))) as session_duration
        FROM searches 
        ${whereClause}
        GROUP BY ip_address
        HAVING COUNT(*) > 1
      `);
      
      const sessionData = sessionStmt.all(...baseParams);
      const avgSessionDuration = sessionData.length > 0 ? 
        sessionData.reduce((sum, s) => sum + s.session_duration, 0) / sessionData.length : 0;
      
      analytics.performance = {
        peakHours,
        dayOfWeek,
        avgSessionDuration: Math.round(avgSessionDuration),
        multiPageSessions: sessionData.length
      };
    }
    
    // OVERVIEW SUMMARY
    analytics.overview = {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      totalVisitors: analytics.traffic?.current?.uniqueVisitors || 0,
      totalSearches: analytics.searches?.summary?.total_searches || 0,
      totalRevenue: analytics.revenue?.metrics?.totalRevenue || 0,
      topCountry: analytics.geographic?.countries?.[0]?.country || 'Unknown',
      peakHour: analytics.performance?.peakHours?.[0]?.hour || '12',
    };
    
    return json({
      success: true,
      data: analytics,
      meta: {
        query: { startDate, endDate, metric, groupBy },
        generatedAt: new Date().toISOString(),
        dataPoints: Object.keys(analytics).length
      }
    });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
};

// POST endpoint for custom analytics queries
export const POST: RequestHandler = async ({ request }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { query, params } = await request.json();
    
    // Security: Only allow SELECT statements
    if (!query.trim().toLowerCase().startsWith('select')) {
      return json({ error: 'Only SELECT queries are allowed' }, { status: 400 });
    }
    
    // Prevent dangerous operations
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create'];
    const lowerQuery = query.toLowerCase();
    
    if (dangerousKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return json({ error: 'Query contains prohibited operations' }, { status: 400 });
    }
    
    const stmt = db.prepare(query);
    const result = params ? stmt.all(...params) : stmt.all();
    
    return json({
      success: true,
      data: result,
      rowCount: result.length
    });
    
  } catch (error) {
    console.error('Custom analytics query error:', error);
    return json(
      { error: 'Query execution failed', details: error.message },
      { status: 400 }
    );
  }
};