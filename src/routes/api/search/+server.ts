// src/routes/api/admin/search/+server.ts
import { json } from '@sveltejs/kit';
import { verify } from 'jsonwebtoken';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Request validation schemas
const SearchQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  address: z.string().optional(),
  country: z.string().optional(),
  ipAddress: z.string().optional(),
  searchTerm: z.string().optional(),
  sortBy: z.enum(['timestamp', 'address', 'country', 'search_count']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const BulkActionSchema = z.object({
  action: z.enum(['delete', 'flag', 'unflag', 'block_ip']),
  searchIds: z.array(z.number()).optional(),
  criteria: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    ipAddress: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
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

function isValidAddress(address: string): boolean {
  // Basic Solana address validation
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function detectSuspiciousPattern(searchData: any): string[] {
  const flags: string[] = [];
  
  // Check for too many searches from same IP
  if (searchData.search_count > 100) {
    flags.push('high_frequency');
  }
  
  // Check for invalid addresses
  if (searchData.address_searched && !isValidAddress(searchData.address_searched)) {
    flags.push('invalid_address');
  }
  
  // Check for rapid succession searches
  const now = new Date();
  const searchTime = new Date(searchData.timestamp);
  const timeDiff = now.getTime() - searchTime.getTime();
  
  if (timeDiff < 1000) { // Less than 1 second ago
    flags.push('rapid_search');
  }
  
  // Check for potential bot patterns in user agent
  if (searchData.user_agent && 
      (searchData.user_agent.includes('bot') || 
       searchData.user_agent.includes('crawler') ||
       searchData.user_agent.includes('spider'))) {
    flags.push('bot_pattern');
  }
  
  return flags;
}

export const GET: RequestHandler = async ({ request, url }) => {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const params = Object.fromEntries(url.searchParams);
    const { 
      startDate, 
      endDate, 
      limit, 
      offset, 
      address, 
      country, 
      ipAddress, 
      searchTerm,
      sortBy,
      sortOrder 
    } = SearchQuerySchema.parse(params);
    
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
    
    if (address) {
      whereClause += ' AND address_searched LIKE ?';
      queryParams.push(`%${address}%`);
    }
    
    if (country) {
      whereClause += ' AND country = ?';
      queryParams.push(country);
    }
    
    if (ipAddress) {
      whereClause += ' AND ip_address = ?';
      queryParams.push(ipAddress);
    }
    
    if (searchTerm) {
      whereClause += ' AND (address_searched LIKE ? OR user_agent LIKE ? OR referrer LIKE ?)';
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM searches 
      ${whereClause}
    `);
    const { total } = countStmt.get(...queryParams) as { total: number };
    
    // Get search data with pagination
    const dataStmt = db.prepare(`
      SELECT 
        id,
        ip_address,
        address_searched,
        timestamp,
        country,
        region,
        city,
        user_agent,
        referrer,
        search_count,
        is_flagged,
        is_blocked,
        risk_score,
        session_id
      FROM searches 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `);
    
    const searches = dataStmt.all(...queryParams, limit, offset);
    
    // Add suspicious pattern detection
    const enrichedSearches = searches.map(search => ({
      ...search,
      suspiciousFlags: detectSuspiciousPattern(search),
      addressValid: search.address_searched ? isValidAddress(search.address_searched) : null
    }));
    
    // Get search statistics
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_searches,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT address_searched) as unique_addresses,
        COUNT(DISTINCT country) as countries_represented,
        AVG(search_count) as avg_searches_per_ip,
        COUNT(CASE WHEN is_flagged = 1 THEN 1 END) as flagged_searches,
        COUNT(CASE WHEN is_blocked = 1 THEN 1 END) as blocked_searches
      FROM searches 
      ${whereClause}
    `);
    
    const stats = statsStmt.get(...queryParams) as any;
    
    // Get top searched addresses
    const topAddressesStmt = db.prepare(`
      SELECT 
        address_searched,
        COUNT(*) as search_count,
        COUNT(DISTINCT ip_address) as unique_searchers,
        MAX(timestamp) as last_searched,
        AVG(risk_score) as avg_risk_score
      FROM searches 
      ${whereClause}
      AND address_searched IS NOT NULL
      GROUP BY address_searched
      ORDER BY search_count DESC
      LIMIT 20
    `);
    
    const topAddresses = topAddressesStmt.all(...queryParams);
    
    // Get top IPs by search volume
    const topIPsStmt = db.prepare(`
      SELECT 
        ip_address,
        COUNT(*) as search_count,
        COUNT(DISTINCT address_searched) as unique_addresses,
        country,
        region,
        MAX(timestamp) as last_search,
        AVG(risk_score) as avg_risk_score,
        is_blocked,
        is_flagged
      FROM searches 
      ${whereClause}
      GROUP BY ip_address
      ORDER BY search_count DESC
      LIMIT 20
    `);
    
    const topIPs = topIPsStmt.all(...queryParams);
    
    // Get search patterns by hour
    const hourlyPatternStmt = db.prepare(`
      SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as searches,
        COUNT(DISTINCT ip_address) as unique_ips,
        AVG(search_count) as avg_searches_per_session
      FROM searches 
      ${whereClause}
      GROUP BY hour
      ORDER BY hour
    `);
    
    const hourlyPattern = hourlyPatternStmt.all(...queryParams);
    
    // Get geographical distribution
    const geoStatsStmt = db.prepare(`
      SELECT 
        country,
        COUNT(*) as searches,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT address_searched) as unique_addresses,
        AVG(search_count) as avg_searches_per_ip
      FROM searches 
      ${whereClause}
      GROUP BY country
      ORDER BY searches DESC
      LIMIT 15
    `);
    
    const geoStats = geoStatsStmt.all(...queryParams);
    
    // Get recent suspicious activity
    const suspiciousStmt = db.prepare(`
      SELECT 
        ip_address,
        address_searched,
        timestamp,
        country,
        search_count,
        risk_score,
        user_agent
      FROM searches 
      ${whereClause}
      AND (search_count > 50 OR risk_score > 7 OR is_flagged = 1)
      ORDER BY timestamp DESC
      LIMIT 20
    `);
    
    const suspiciousActivity = suspiciousStmt.all(...queryParams);
    
    // Get error/invalid searches
    const errorSearchesStmt = db.prepare(`
      SELECT 
        address_searched,
        COUNT(*) as error_count,
        COUNT(DISTINCT ip_address) as unique_ips,
        MAX(timestamp) as last_error
      FROM searches 
      ${whereClause}
      AND (address_searched LIKE '%error%' OR address_searched LIKE '%invalid%' OR LENGTH(address_searched) < 32)
      GROUP BY address_searched
      ORDER BY error_count DESC
      LIMIT 10
    `);
    
    const errorSearches = errorSearchesStmt.all(...queryParams);
    
    // Get referrer analysis
    const referrerStmt = db.prepare(`
      SELECT 
        COALESCE(referrer, 'Direct') as source,
        COUNT(*) as searches,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(DISTINCT address_searched) as unique_addresses
      FROM searches 
      ${whereClause}
      GROUP BY referrer
      ORDER BY searches DESC
      LIMIT 10
    `);
    
    const referrerStats = referrerStmt.all(...queryParams);
    
    return json({
      success: true,
      data: {
        searches: enrichedSearches,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        },
        statistics: stats,
        analytics: {
          topAddresses,
          topIPs,
          hourlyPattern,
          geoStats,
          suspiciousActivity,
          errorSearches,
          referrerStats
        }
      }
    });
    
  } catch (error) {
    console.error('Search admin API error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to fetch search data' },
      { status: 500 }
    );
  }
};

// POST endpoint for bulk actions on search records
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { action, searchIds, criteria } = BulkActionSchema.parse(body);
    
    let affectedRows = 0;
    let query = '';
    let params: any[] = [];
    
    switch (action) {
      case 'delete':
        if (searchIds && searchIds.length > 0) {
          query = `DELETE FROM searches WHERE id IN (${searchIds.map(() => '?').join(',')})`;
          params = searchIds;
        } else if (criteria) {
          let whereClause = 'WHERE 1=1';
          if (criteria.startDate) {
            whereClause += ' AND datetime(timestamp) >= datetime(?)';
            params.push(criteria.startDate);
          }
          if (criteria.endDate) {
            whereClause += ' AND datetime(timestamp) <= datetime(?)';
            params.push(criteria.endDate);
          }
          if (criteria.ipAddress) {
            whereClause += ' AND ip_address = ?';
            params.push(criteria.ipAddress);
          }
          if (criteria.country) {
            whereClause += ' AND country = ?';
            params.push(criteria.country);
          }
          query = `DELETE FROM searches ${whereClause}`;
        }
        break;
        
      case 'flag':
        if (searchIds && searchIds.length > 0) {
          query = `UPDATE searches SET is_flagged = 1, flagged_at = datetime('now') WHERE id IN (${searchIds.map(() => '?').join(',')})`;
          params = searchIds;
        }
        break;
        
      case 'unflag':
        if (searchIds && searchIds.length > 0) {
          query = `UPDATE searches SET is_flagged = 0, flagged_at = NULL WHERE id IN (${searchIds.map(() => '?').join(',')})`;
          params = searchIds;
        }
        break;
        
      case 'block_ip':
        if (criteria?.ipAddress) {
          // Block IP and all its searches
          query = `UPDATE searches SET is_blocked = 1, blocked_at = datetime('now') WHERE ip_address = ?`;
          params = [criteria.ipAddress];
          
          // Also add to IP blocklist
          const blocklistStmt = db.prepare(`
            INSERT OR REPLACE INTO ip_blocklist (ip_address, blocked_at, blocked_by, reason)
            VALUES (?, datetime('now'), ?, ?)
          `);
          blocklistStmt.run(criteria.ipAddress, getClientAddress(), 'Admin block via search management');
        }
        break;
        
      default:
        throw new Error('Invalid action');
    }
    
    if (query) {
      const stmt = db.prepare(query);
      const result = stmt.run(...params);
      affectedRows = result.changes;
    }
    
    // Log the admin action
    const logStmt = db.prepare(`
      INSERT INTO admin_actions (
        action,
        target_type,
        target_id,
        metadata,
        admin_ip,
        timestamp
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    logStmt.run(
      `search_${action}`,
      'search',
      searchIds?.join(',') || 'bulk',
      JSON.stringify({ criteria, affectedRows }),
      getClientAddress()
    );
    
    return json({
      success: true,
      affectedRows,
      message: `${action} action completed successfully`
    });
    
  } catch (error) {
    console.error('Search bulk action error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid action data', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to execute bulk action' },
      { status: 500 }
    );
  }
};

// PUT endpoint for updating individual search records
export const PUT: RequestHandler = async ({ request, url, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const searchId = url.searchParams.get('id');
    if (!searchId) {
      return json({ error: 'Missing search ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { is_flagged, is_blocked, risk_score, notes } = body;
    
    // Build update query
    let setClauses = [];
    let values = [];
    
    if (typeof is_flagged === 'boolean') {
      setClauses.push('is_flagged = ?');
      values.push(is_flagged ? 1 : 0);
      if (is_flagged) {
        setClauses.push('flagged_at = datetime("now")');
      } else {
        setClauses.push('flagged_at = NULL');
      }
    }
    
    if (typeof is_blocked === 'boolean') {
      setClauses.push('is_blocked = ?');
      values.push(is_blocked ? 1 : 0);
      if (is_blocked) {
        setClauses.push('blocked_at = datetime("now")');
      } else {
        setClauses.push('blocked_at = NULL');
      }
    }
    
    if (typeof risk_score === 'number' && risk_score >= 0 && risk_score <= 10) {
      setClauses.push('risk_score = ?');
      values.push(risk_score);
    }
    
    if (notes) {
      setClauses.push('admin_notes = ?');
      values.push(notes);
    }
    
    setClauses.push('updated_at = datetime("now")');
    values.push(searchId);
    
    const updateStmt = db.prepare(`
      UPDATE searches 
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `);
    
    const result = updateStmt.run(...values);
    
    if (result.changes === 0) {
      return json({ error: 'Search record not found' }, { status: 404 });
    }
    
    // Log the update
    const logStmt = db.prepare(`
      INSERT INTO admin_actions (
        action,
        target_type,
        target_id,
        metadata,
        admin_ip,
        timestamp
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    logStmt.run(
      'search_updated',
      'search',
      searchId,
      JSON.stringify({ is_flagged, is_blocked, risk_score, notes }),
      getClientAddress()
    );
    
    return json({
      success: true,
      message: 'Search record updated successfully'
    });
    
  } catch (error) {
    console.error('Search update error:', error);
    return json(
      { error: 'Failed to update search record' },
      { status: 500 }
    );
  }
};

// DELETE endpoint for individual search records
export const DELETE: RequestHandler = async ({ request, url, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const searchId = url.searchParams.get('id');
    if (!searchId) {
      return json({ error: 'Missing search ID' }, { status: 400 });
    }
    
    // Get search info before deletion for logging
    const searchInfo = db.prepare('SELECT ip_address, address_searched FROM searches WHERE id = ?').get(searchId);
    if (!searchInfo) {
      return json({ error: 'Search record not found' }, { status: 404 });
    }
    
    // Delete the search record
    const deleteStmt = db.prepare('DELETE FROM searches WHERE id = ?');
    const result = deleteStmt.run(searchId);
    
    // Log the deletion
    const logStmt = db.prepare(`
      INSERT INTO admin_actions (
        action,
        target_type,
        target_id,
        metadata,
        admin_ip,
        timestamp
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    logStmt.run(
      'search_deleted',
      'search',
      searchId,
      JSON.stringify(searchInfo),
      getClientAddress()
    );
    
    return json({
      success: true,
      message: 'Search record deleted successfully'
    });
    
  } catch (error) {
    console.error('Search deletion error:', error);
    return json(
      { error: 'Failed to delete search record' },
      { status: 500 }
    );
  }
};