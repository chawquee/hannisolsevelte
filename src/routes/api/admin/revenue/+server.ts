// src/routes/api/admin/revenue/+server.ts
import { json } from '@sveltejs/kit';
import { verify } from 'jsonwebtoken';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Request validation schemas
const RevenueQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  source: z.enum(['all', 'adsense', 'media-net', 'coinzilla', 'a-ads', 'amazon', 'ledger', 'vpn', 'crypto-education']).default('all'),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  currency: z.enum(['USD', 'BTC', 'EUR']).default('USD'),
});

const RevenueEntrySchema = z.object({
  source: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  type: z.enum(['ad_revenue', 'affiliate_commission', 'other']),
  description: z.string().optional(),
  date: z.string().optional(),
  metadata: z.record(z.any()).optional(),
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

// Convert currencies (simplified - in production use real API)
function convertCurrency(amount: number, from: string, to: string): number {
  const rates: Record<string, number> = {
    'USD': 1,
    'EUR': 0.85,
    'BTC': 0.000024, // Example rate
  };
  
  if (from === to) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / (rates[from] || 1);
  return usdAmount * (rates[to] || 1);
}

export const GET: RequestHandler = async ({ request, url }) => {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const params = Object.fromEntries(url.searchParams);
    const { startDate, endDate, source, groupBy, currency } = RevenueQuerySchema.parse(params);
    
    // Build base query
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    
    if (startDate) {
      whereClause += ' AND date(timestamp) >= date(?)';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND date(timestamp) <= date(?)';
      queryParams.push(endDate);
    }
    
    if (source !== 'all') {
      whereClause += ' AND source = ?';
      queryParams.push(source);
    }
    
    // Get revenue summary
    const summaryStmt = db.prepare(`
      SELECT 
        SUM(amount_usd) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(amount_usd) as avg_transaction,
        source,
        type
      FROM revenue 
      ${whereClause}
      GROUP BY source, type
      ORDER BY total_revenue DESC
    `);
    
    const revenueSummary = summaryStmt.all(...queryParams);
    
    // Get time-based revenue analytics
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
    
    const timeRevenueStmt = db.prepare(`
      SELECT 
        strftime('${timeFormat}', timestamp) as period,
        SUM(amount_usd) as revenue,
        COUNT(*) as transactions,
        source
      FROM revenue 
      ${whereClause}
      GROUP BY period, source
      ORDER BY period DESC, revenue DESC
      LIMIT 100
    `);
    
    const timeRevenue = timeRevenueStmt.all(...queryParams);
    
    // Get top performing sources
    const topSourcesStmt = db.prepare(`
      SELECT 
        source,
        SUM(amount_usd) as total_revenue,
        COUNT(*) as transactions,
        AVG(amount_usd) as avg_revenue,
        type,
        MAX(timestamp) as last_payment
      FROM revenue 
      ${whereClause}
      GROUP BY source
      ORDER BY total_revenue DESC
      LIMIT 10
    `);
    
    const topSources = topSourcesStmt.all(...queryParams);
    
    // Get recent transactions
    const recentStmt = db.prepare(`
      SELECT 
        id,
        source,
        amount_usd,
        original_amount,
        original_currency,
        type,
        description,
        timestamp,
        metadata
      FROM revenue 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    
    const recentTransactions = recentStmt.all(...queryParams);
    
    // Get monthly growth
    const monthlyGrowthStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', timestamp) as month,
        SUM(amount_usd) as revenue,
        COUNT(*) as transactions
      FROM revenue 
      ${whereClause}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    
    const monthlyGrowth = monthlyGrowthStmt.all(...queryParams);
    
    // Calculate growth percentage
    const growthData = monthlyGrowth.map((curr, index) => {
      const prev = monthlyGrowth[index + 1];
      const growthPercent = prev ? 
        ((curr.revenue - prev.revenue) / prev.revenue * 100) : 0;
      
      return {
        ...curr,
        growthPercent: Math.round(growthPercent * 100) / 100
      };
    });
    
    // Get ad network performance
    const adNetworkStmt = db.prepare(`
      SELECT 
        source,
        SUM(amount_usd) as revenue,
        COUNT(*) as transactions,
        AVG(amount_usd) as avg_cpm,
        SUM(CASE WHEN type = 'ad_revenue' THEN amount_usd ELSE 0 END) as ad_revenue,
        SUM(CASE WHEN type = 'affiliate_commission' THEN amount_usd ELSE 0 END) as affiliate_revenue
      FROM revenue 
      ${whereClause}
      AND source IN ('adsense', 'media-net', 'coinzilla', 'a-ads')
      GROUP BY source
      ORDER BY revenue DESC
    `);
    
    const adNetworkPerformance = adNetworkStmt.all(...queryParams);
    
    // Get affiliate program performance
    const affiliateStmt = db.prepare(`
      SELECT 
        source,
        SUM(amount_usd) as revenue,
        COUNT(*) as conversions,
        AVG(amount_usd) as avg_commission
      FROM revenue 
      ${whereClause}
      AND source IN ('amazon', 'ledger', 'vpn', 'crypto-education')
      GROUP BY source
      ORDER BY revenue DESC
    `);
    
    const affiliatePerformance = affiliateStmt.all(...queryParams);
    
    // Calculate totals in requested currency
    const totalRevenue = revenueSummary.reduce((sum, item) => sum + item.total_revenue, 0);
    const convertedTotal = convertCurrency(totalRevenue, 'USD', currency);
    
    // Get revenue goals/targets (if set)
    const goalsStmt = db.prepare(`
      SELECT 
        month,
        target_amount,
        actual_amount,
        (actual_amount / target_amount * 100) as achievement_percent
      FROM revenue_goals 
      ORDER BY month DESC
      LIMIT 12
    `);
    
    let goals = [];
    try {
      goals = goalsStmt.all();
    } catch {
      // Table might not exist
      goals = [];
    }
    
    return json({
      success: true,
      data: {
        summary: {
          totalRevenue: convertedTotal,
          totalTransactions: revenueSummary.reduce((sum, item) => sum + item.total_transactions, 0),
          avgTransaction: convertedTotal / (revenueSummary.reduce((sum, item) => sum + item.total_transactions, 0) || 1),
          currency,
          period: { startDate, endDate }
        },
        breakdown: {
          bySources: revenueSummary,
          byTime: timeRevenue,
          topSources,
          adNetworks: adNetworkPerformance,
          affiliates: affiliatePerformance
        },
        trends: {
          monthlyGrowth: growthData,
          goals
        },
        recent: recentTransactions.map(tx => ({
          ...tx,
          convertedAmount: convertCurrency(tx.amount_usd, 'USD', currency),
          metadata: tx.metadata ? JSON.parse(tx.metadata) : null
        }))
      }
    });
    
  } catch (error) {
    console.error('Revenue API error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
};

// POST endpoint for adding revenue entries
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const revenueData = RevenueEntrySchema.parse(body);
    
    // Convert to USD for storage
    const amountUSD = convertCurrency(revenueData.amount, revenueData.currency, 'USD');
    
    const stmt = db.prepare(`
      INSERT INTO revenue (
        source,
        amount_usd,
        original_amount,
        original_currency,
        type,
        description,
        timestamp,
        metadata,
        added_by_ip
      ) VALUES (?, ?, ?, ?, ?, ?, datetime(?), ?, ?)
    `);
    
    const result = stmt.run(
      revenueData.source,
      amountUSD,
      revenueData.amount,
      revenueData.currency,
      revenueData.type,
      revenueData.description || null,
      revenueData.date || new Date().toISOString(),
      JSON.stringify(revenueData.metadata || {}),
      getClientAddress()
    );
    
    return json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Revenue entry added successfully'
    });
    
  } catch (error) {
    console.error('Revenue POST error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid revenue data', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to add revenue entry' },
      { status: 500 }
    );
  }
};

// PUT endpoint for updating revenue entries
export const PUT: RequestHandler = async ({ request, url }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Missing revenue ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const updates = RevenueEntrySchema.partial().parse(body);
    
    let setClauses = [];
    let values = [];
    
    if (updates.source) {
      setClauses.push('source = ?');
      values.push(updates.source);
    }
    
    if (updates.amount !== undefined) {
      const amountUSD = convertCurrency(updates.amount, updates.currency || 'USD', 'USD');
      setClauses.push('amount_usd = ?', 'original_amount = ?', 'original_currency = ?');
      values.push(amountUSD, updates.amount, updates.currency || 'USD');
    }
    
    if (updates.type) {
      setClauses.push('type = ?');
      values.push(updates.type);
    }
    
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    
    if (updates.metadata) {
      setClauses.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }
    
    setClauses.push('updated_at = datetime("now")');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE revenue 
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return json({ error: 'Revenue entry not found' }, { status: 404 });
    }
    
    return json({
      success: true,
      message: 'Revenue entry updated successfully'
    });
    
  } catch (error) {
    console.error('Revenue PUT error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to update revenue entry' },
      { status: 500 }
    );
  }
};

// DELETE endpoint for removing revenue entries
export const DELETE: RequestHandler = async ({ request, url }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Missing revenue ID' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM revenue WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return json({ error: 'Revenue entry not found' }, { status: 404 });
    }
    
    return json({
      success: true,
      message: 'Revenue entry deleted successfully'
    });
    
  } catch (error) {
    console.error('Revenue DELETE error:', error);
    return json(
      { error: 'Failed to delete revenue entry' },
      { status: 500 }
    );
  }
};