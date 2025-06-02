// src/routes/api/admin/share/+server.ts
import { json } from '@sveltejs/kit';
import { verify } from 'jsonwebtoken';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Request validation schemas
const ShareQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['all', 'active', 'expired', 'disabled']).default('all'),
  sortBy: z.enum(['created', 'views', 'expiry']).default('created'),
});

const CreateShareSchema = z.object({
  address: z.string().min(32).max(44), // Solana address length
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  validationResults: z.record(z.any()),
  riskAnalysis: z.record(z.any()),
  transactionData: z.record(z.any()).optional(),
  expiresIn: z.number().min(3600).max(30 * 24 * 3600).default(7 * 24 * 3600), // 1 hour to 30 days
  isPublic: z.boolean().default(true),
  allowComments: z.boolean().default(false),
  password: z.string().optional(),
});

const UpdateShareSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  status: z.enum(['active', 'disabled']).optional(),
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

function generateShareId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

function hashPassword(password: string): string {
  // Simple hash for demo - use bcrypt in production
  return Buffer.from(password).toString('base64');
}

export const GET: RequestHandler = async ({ request, url }) => {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const params = Object.fromEntries(url.searchParams);
    const { startDate, endDate, limit, offset, status, sortBy } = ShareQuerySchema.parse(params);
    
    // Build base query
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    
    if (startDate) {
      whereClause += ' AND datetime(created_at) >= datetime(?)';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND datetime(created_at) <= datetime(?)';
      queryParams.push(endDate);
    }
    
    if (status !== 'all') {
      switch (status) {
        case 'active':
          whereClause += ' AND is_active = 1 AND datetime(expires_at) > datetime("now")';
          break;
        case 'expired':
          whereClause += ' AND datetime(expires_at) <= datetime("now")';
          break;
        case 'disabled':
          whereClause += ' AND is_active = 0';
          break;
      }
    }
    
    // Determine sort order
    let orderBy = 'ORDER BY created_at DESC';
    switch (sortBy) {
      case 'views':
        orderBy = 'ORDER BY view_count DESC, created_at DESC';
        break;
      case 'expiry':
        orderBy = 'ORDER BY expires_at ASC';
        break;
    }
    
    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM shared_results 
      ${whereClause}
    `);
    const { total } = countStmt.get(...queryParams) as { total: number };
    
    // Get shared results with pagination
    const dataStmt = db.prepare(`
      SELECT 
        id,
        share_id,
        address,
        title,
        description,
        view_count,
        is_public,
        allow_comments,
        is_active,
        password_protected,
        created_at,
        expires_at,
        last_viewed_at,
        creator_ip
      FROM shared_results 
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `);
    
    const shares = dataStmt.all(...queryParams, limit, offset);
    
    // Get view statistics
    const viewStatsStmt = db.prepare(`
      SELECT 
        share_id,
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address) as unique_viewers,
        MAX(viewed_at) as last_view,
        MIN(viewed_at) as first_view
      FROM share_views 
      WHERE share_id IN (${shares.map(() => '?').join(',')})
      GROUP BY share_id
    `);
    
    const viewStats = shares.length > 0 ? 
      viewStatsStmt.all(...shares.map(s => s.share_id)) : [];
    
    // Combine share data with view statistics
    const enrichedShares = shares.map(share => {
      const stats = viewStats.find(stat => stat.share_id === share.share_id);
      return {
        ...share,
        isExpired: new Date(share.expires_at) <= new Date(),
        viewStats: stats || {
          total_views: 0,
          unique_viewers: 0,
          last_view: null,
          first_view: null
        }
      };
    });
    
    // Get summary statistics
    const summaryStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_shares,
        COUNT(CASE WHEN is_active = 1 AND datetime(expires_at) > datetime("now") THEN 1 END) as active_shares,
        COUNT(CASE WHEN datetime(expires_at) <= datetime("now") THEN 1 END) as expired_shares,
        COUNT(CASE WHEN is_public = 1 THEN 1 END) as public_shares,
        SUM(view_count) as total_views,
        AVG(view_count) as avg_views_per_share
      FROM shared_results
      ${whereClause}
    `);
    
    const summary = summaryStmt.get(...queryParams) as any;
    
    // Get top performing shares
    const topSharesStmt = db.prepare(`
      SELECT 
        share_id,
        address,
        title,
        view_count,
        created_at
      FROM shared_results 
      ${whereClause}
      ORDER BY view_count DESC
      LIMIT 10
    `);
    
    const topShares = topSharesStmt.all(...queryParams);
    
    // Get recent activity
    const recentActivityStmt = db.prepare(`
      SELECT 
        'share_created' as activity_type,
        share_id,
        address,
        created_at as timestamp,
        creator_ip as ip_address
      FROM shared_results 
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'share_viewed' as activity_type,
        share_id,
        address,
        viewed_at as timestamp,
        ip_address
      FROM share_views sv
      JOIN shared_results sr ON sv.share_id = sr.share_id
      WHERE datetime(sv.viewed_at) >= datetime('now', '-7 days')
      
      ORDER BY timestamp DESC
      LIMIT 20
    `);
    
    const recentActivity = recentActivityStmt.all(...queryParams);
    
    return json({
      success: true,
      data: {
        shares: enrichedShares,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        },
        summary,
        topShares,
        recentActivity
      }
    });
    
  } catch (error) {
    console.error('Share admin API error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to fetch share data' },
      { status: 500 }
    );
  }
};

// POST endpoint for creating new shared results
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const shareData = CreateShareSchema.parse(body);
    
    // Generate unique share ID
    let shareId: string;
    let attempts = 0;
    do {
      shareId = generateShareId();
      attempts++;
      if (attempts > 10) {
        throw new Error('Could not generate unique share ID');
      }
    } while (db.prepare('SELECT 1 FROM shared_results WHERE share_id = ?').get(shareId));
    
    // Calculate expiry date
    const expiresAt = new Date(Date.now() + shareData.expiresIn * 1000);
    
    // Hash password if provided
    const passwordHash = shareData.password ? hashPassword(shareData.password) : null;
    
    // Insert share record
    const insertStmt = db.prepare(`
      INSERT INTO shared_results (
        share_id,
        address,
        title,
        description,
        validation_results,
        risk_analysis,
        transaction_data,
        is_public,
        allow_comments,
        password_hash,
        password_protected,
        created_at,
        expires_at,
        creator_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime(?), ?)
    `);
    
    const result = insertStmt.run(
      shareId,
      shareData.address,
      shareData.title || `Analysis for ${shareData.address.slice(0, 8)}...`,
      shareData.description || '',
      JSON.stringify(shareData.validationResults),
      JSON.stringify(shareData.riskAnalysis),
      JSON.stringify(shareData.transactionData || {}),
      shareData.isPublic ? 1 : 0,
      shareData.allowComments ? 1 : 0,
      passwordHash,
      passwordHash ? 1 : 0,
      expiresAt.toISOString(),
      getClientAddress()
    );
    
    // Log the creation
    const logStmt = db.prepare(`
      INSERT INTO admin_actions (
        action,
        target_id,
        metadata,
        admin_ip,
        timestamp
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    logStmt.run(
      'share_created',
      shareId,
      JSON.stringify({ address: shareData.address, isPublic: shareData.isPublic }),
      getClientAddress()
    );
    
    return json({
      success: true,
      shareId,
      shareUrl: `/share/${shareId}`,
      expiresAt: expiresAt.toISOString(),
      message: 'Share created successfully'
    });
    
  } catch (error) {
    console.error('Share creation error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid share data', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
};

// PUT endpoint for updating shared results
export const PUT: RequestHandler = async ({ request, url, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const shareId = url.searchParams.get('shareId');
    if (!shareId) {
      return json({ error: 'Missing share ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const updates = UpdateShareSchema.parse(body);
    
    // Check if share exists
    const existingShare = db.prepare('SELECT * FROM shared_results WHERE share_id = ?').get(shareId);
    if (!existingShare) {
      return json({ error: 'Share not found' }, { status: 404 });
    }
    
    // Build update query
    let setClauses = [];
    let values = [];
    
    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    
    if (updates.isPublic !== undefined) {
      setClauses.push('is_public = ?');
      values.push(updates.isPublic ? 1 : 0);
    }
    
    if (updates.allowComments !== undefined) {
      setClauses.push('allow_comments = ?');
      values.push(updates.allowComments ? 1 : 0);
    }
    
    if (updates.status !== undefined) {
      setClauses.push('is_active = ?');
      values.push(updates.status === 'active' ? 1 : 0);
    }
    
    setClauses.push('updated_at = datetime("now")');
    values.push(shareId);
    
    const updateStmt = db.prepare(`
      UPDATE shared_results 
      SET ${setClauses.join(', ')}
      WHERE share_id = ?
    `);
    
    const result = updateStmt.run(...values);
    
    // Log the update
    const logStmt = db.prepare(`
      INSERT INTO admin_actions (
        action,
        target_id,
        metadata,
        admin_ip,
        timestamp
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    logStmt.run(
      'share_updated',
      shareId,
      JSON.stringify(updates),
      getClientAddress()
    );
    
    return json({
      success: true,
      message: 'Share updated successfully'
    });
    
  } catch (error) {
    console.error('Share update error:', error);
    
    if (error instanceof z.ZodError) {
      return json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }
    
    return json(
      { error: 'Failed to update share' },
      { status: 500 }
    );
  }
};

// DELETE endpoint for removing shared results
export const DELETE: RequestHandler = async ({ request, url, getClientAddress }) => {
  if (!verifyAdminAuth(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const shareId = url.searchParams.get('shareId');
    if (!shareId) {
      return json({ error: 'Missing share ID' }, { status: 400 });
    }
    
    // Get share info before deletion for logging
    const shareInfo = db.prepare('SELECT address, title FROM shared_results WHERE share_id = ?').get(shareId);
    if (!shareInfo) {
      return json({ error: 'Share not found' }, { status: 404 });
    }
    
    // Delete associated views
    db.prepare('DELETE FROM share_views WHERE share_id = ?').run(shareId);
    
    // Delete the share
    const deleteStmt = db.prepare('DELETE FROM shared_results WHERE share_id = ?');
    const result = deleteStmt.run(shareId);
    
    // Log the deletion
    const logStmt = db.prepare(`
      INSERT INTO admin_actions (
        action,
        target_id,
        metadata,
        admin_ip,
        timestamp
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    logStmt.run(
      'share_deleted',
      shareId,
      JSON.stringify(shareInfo),
      getClientAddress()
    );
    
    return json({
      success: true,
      message: 'Share deleted successfully'
    });
    
  } catch (error) {
    console.error('Share deletion error:', error);
    return json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
};