import { getDatabase } from './connection';
import type { SearchRecord, AnalyticsRecord } from './schema';

// Search logging queries
export async function logSearch(searchData: Omit<SearchRecord, 'id' | 'timestamp'>): Promise<void> {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		INSERT INTO searches (
			ip_address, solana_address, user_agent, country, region,
			is_valid, balance, token_count, transaction_count
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);

	try {
		stmt.run(
			searchData.ip_address,
			searchData.solana_address,
			searchData.user_agent || null,
			searchData.country || null,
			searchData.region || null,
			searchData.is_valid || false,
			searchData.balance || 0,
			searchData.token_count || 0,
			searchData.transaction_count || 0
		);
	} catch (error) {
		console.error('Error logging search:', error);
		throw error;
	}
}

// Get search statistics
export function getSearchStats(days: number = 30): any {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		SELECT 
			COUNT(*) as total_searches,
			COUNT(DISTINCT ip_address) as unique_visitors,
			AVG(balance) as avg_balance,
			COUNT(*) FILTER (WHERE is_valid = 1) as valid_searches,
			COUNT(*) FILTER (WHERE is_valid = 0) as invalid_searches
		FROM searches 
		WHERE timestamp >= datetime('now', '-${days} days')
	`);

	return stmt.get();
}

// Get popular addresses
export function getPopularAddresses(limit: number = 10): any[] {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		SELECT 
			solana_address,
			COUNT(*) as search_count,
			MAX(timestamp) as last_searched
		FROM searches 
		WHERE is_valid = 1
		GROUP BY solana_address
		ORDER BY search_count DESC
		LIMIT ?
	`);

	return stmt.all(limit);
}

// Get geographic distribution
export function getGeographicStats(): any[] {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		SELECT 
			country,
			COUNT(*) as search_count,
			COUNT(DISTINCT ip_address) as unique_visitors
		FROM searches 
		WHERE country IS NOT NULL
		GROUP BY country
		ORDER BY search_count DESC
		LIMIT 20
	`);

	return stmt.all();
}

// Analytics logging
export async function logAnalytics(data: Omit<AnalyticsRecord, 'id'>): Promise<void> {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		INSERT OR REPLACE INTO analytics (
			date, total_searches, unique_visitors, revenue, ad_clicks, affiliate_clicks
		) VALUES (?, ?, ?, ?, ?, ?)
	`);

	try {
		stmt.run(
			data.date,
			data.total_searches,
			data.unique_visitors,
			data.revenue,
			data.ad_clicks,
			data.affiliate_clicks
		);
	} catch (error) {
		console.error('Error logging analytics:', error);
		throw error;
	}
}

// Get daily analytics
export function getDailyAnalytics(days: number = 30): any[] {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		SELECT * FROM analytics 
		WHERE date >= date('now', '-${days} days')
		ORDER BY date DESC
	`);

	return stmt.all();
}

// Get revenue statistics
export function getRevenueStats(): any {
	const db = getDatabase();
	
	const stmt = db.prepare(`
		SELECT 
			SUM(revenue) as total_revenue,
			AVG(revenue) as avg_daily_revenue,
			SUM(ad_clicks) as total_ad_clicks,
			SUM(affiliate_clicks) as total_affiliate_clicks
		FROM analytics
	`);

	return stmt.get();
}