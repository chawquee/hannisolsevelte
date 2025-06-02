// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/database/connection';

export const load: LayoutServerLoad = async ({ locals, url, request }) => {
  // Get client information
  const clientIP = locals.clientIP;
  const userAgent = locals.userAgent;
  const currentPath = url.pathname;
  
  // Admin authentication state
  const adminUser = locals.adminUser || null;
  
  // Get global site statistics (cached for performance)
  let siteStats = null;
  try {
    const statsStmt = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM searches WHERE datetime(timestamp) >= datetime('now', '-24 hours')) as searches_24h,
        (SELECT COUNT(DISTINCT ip_address) FROM searches WHERE datetime(timestamp) >= datetime('now', '-24 hours')) as unique_visitors_24h,
        (SELECT COUNT(*) FROM searches) as total_searches,
        (SELECT COUNT(DISTINCT address_searched) FROM searches WHERE address_searched IS NOT NULL) as unique_addresses_checked,
        (SELECT SUM(amount_usd) FROM revenue WHERE datetime(timestamp) >= datetime('now', '-30 days')) as revenue_30d
    `);
    
    siteStats = statsStmt.get() as any;
  } catch (error) {
    console.error('Error fetching site stats:', error);
    siteStats = {
      searches_24h: 0,
      unique_visitors_24h: 0,
      total_searches: 0,
      unique_addresses_checked: 0,
      revenue_30d: 0
    };
  }
  
  // Get user's recent search history (last 10 searches from this IP)
  let recentSearches: any[] = [];
  try {
    const recentStmt = db.prepare(`
      SELECT DISTINCT address_searched, timestamp
      FROM searches 
      WHERE ip_address = ? AND address_searched IS NOT NULL
      ORDER BY timestamp DESC 
      LIMIT 10
    `);
    
    recentSearches = recentStmt.all(clientIP) || [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
  }
  
  // Check if user has accepted cookies
  const cookieConsent = request.headers.get('cookie')?.includes('hannisol_cookie_consent=true') || false;
  
  // Get current ad configuration (for ad placement)
  let adConfig = null;
  try {
    const adStmt = db.prepare(`
      SELECT 
        network,
        is_active,
        placement_config
      FROM ad_networks 
      WHERE is_active = 1
      ORDER BY priority ASC
    `);
    
    const activeNetworks = adStmt.all();
    
    adConfig = {
      adsense: activeNetworks.find(n => n.network === 'adsense')?.is_active || false,
      medianet: activeNetworks.find(n => n.network === 'media-net')?.is_active || false,
      coinzilla: activeNetworks.find(n => n.network === 'coinzilla')?.is_active || false,
      aads: activeNetworks.find(n => n.network === 'a-ads')?.is_active || false,
    };
  } catch (error) {
    console.error('Error fetching ad config:', error);
    // Default ad configuration
    adConfig = {
      adsense: true,
      medianet: true,
      coinzilla: true,
      aads: true,
    };
  }
  
  // Get maintenance mode status
  let maintenanceMode = false;
  try {
    const maintenanceStmt = db.prepare('SELECT value FROM site_settings WHERE key = "maintenance_mode"');
    const result = maintenanceStmt.get() as any;
    maintenanceMode = result?.value === 'true';
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
  }
  
  // Get current announcement/banner (if any)
  let announcement = null;
  try {
    const announcementStmt = db.prepare(`
      SELECT message, type, is_active, expires_at
      FROM announcements 
      WHERE is_active = 1 
      AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    announcement = announcementStmt.get() as any;
  } catch (error) {
    console.error('Error fetching announcement:', error);
  }
  
  // Get user's country/region for regional content
  let userRegion = null;
  try {
    const regionStmt = db.prepare(`
      SELECT country, region
      FROM searches 
      WHERE ip_address = ? 
      AND country IS NOT NULL
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    
    userRegion = regionStmt.get(clientIP) as any;
  } catch (error) {
    console.error('Error fetching user region:', error);
  }
  
  // Performance metrics (for admin users)
  let performanceMetrics = null;
  if (adminUser) {
    try {
      const perfStmt = db.prepare(`
        SELECT 
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
          COUNT(*) as total_requests
        FROM request_logs 
        WHERE datetime(timestamp) >= datetime('now', '-1 hour')
      `);
      
      performanceMetrics = perfStmt.get() as any;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  }
  
  // Feature flags
  const featureFlags = {
    enableSharing: true,
    enableRiskAnalysis: true,
    enableCommunityData: true,
    enableAdvancedAnalytics: adminUser ? true : false,
    enableBetaFeatures: adminUser ? true : false,
  };
  
  // SEO meta data for different pages
  const seoData = {
    title: 'Hannisol - Solana Address Checker',
    description: 'Comprehensive Solana address validation and analysis. Check balances, transaction history, risk assessment, and community data.',
    keywords: 'solana, address checker, blockchain analysis, crypto validator, solana wallet',
    ogImage: '/images/og-image.png',
    canonicalUrl: `https://hannisol.com${currentPath}`,
  };
  
  // Update page-specific SEO data
  if (currentPath === '/') {
    seoData.title = 'Hannisol - Solana Address Checker & Validator';
    seoData.description = 'Validate Solana addresses, check balances, analyze transactions, and assess risks. Professional-grade blockchain analysis tools.';
  } else if (currentPath.startsWith('/admin')) {
    seoData.title = 'Admin Dashboard - Hannisol';
    seoData.description = 'Administrative dashboard for Hannisol Solana Address Checker';
    seoData.keywords = 'admin, dashboard, analytics, management';
  } else if (currentPath.startsWith('/legal')) {
    seoData.title = `Legal - ${seoData.title}`;
    seoData.description = 'Legal information and policies for Hannisol Solana Address Checker';
  }
  
  // Log page view for analytics
  try {
    const pageViewStmt = db.prepare(`
      INSERT INTO page_views (ip_address, path, user_agent, referrer, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    const referrer = request.headers.get('referer') || null;
    pageViewStmt.run(clientIP, currentPath, userAgent, referrer);
  } catch (error) {
    console.error('Error logging page view:', error);
  }
  
  return {
    // User and session data
    user: {
      ip: clientIP,
      region: userRegion,
      recentSearches: recentSearches.map(search => ({
        address: search.address_searched,
        timestamp: search.timestamp
      }))
    },
    
    // Authentication state
    auth: {
      isAdmin: !!adminUser,
      adminUser: adminUser
    },
    
    // Site configuration
    config: {
      maintenanceMode,
      cookieConsent,
      adConfig,
      featureFlags
    },
    
    // Site statistics
    stats: {
      searches24h: siteStats.searches_24h || 0,
      uniqueVisitors24h: siteStats.unique_visitors_24h || 0,
      totalSearches: siteStats.total_searches || 0,
      uniqueAddresses: siteStats.unique_addresses_checked || 0,
      revenue30d: siteStats.revenue_30d || 0
    },
    
    // UI data
    ui: {
      announcement,
      currentPath,
      seoData
    },
    
    // Performance data (admin only)
    performance: performanceMetrics,
    
    // Brand data
    brand: {
      name: 'HANNISOL',
      slogan: "Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps.",
      logoUrl: '/images/hannisol-logo.svg',
      colors: {
        primary: '#7c3aed', // Purple
        secondary: '#2563eb', // Blue
        accent: '#ffd700', // Gold
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626'
      }
    },
    
    // Timestamp for cache busting
    timestamp: new Date().toISOString()
  };
};