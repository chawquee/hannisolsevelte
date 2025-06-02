import Database from 'better-sqlite3';
import { DATABASE_URL } from '$env/static/private';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
	if (!db) {
		// Create database directory if it doesn't exist
		const dbPath = DATABASE_URL?.replace('sqlite:', '') || './database/hannisol.db';
		
		try {
			db = new Database(dbPath);
			console.log('Database connected successfully');
			
			// Enable WAL mode for better performance
			db.pragma('journal_mode = WAL');
			
		} catch (error) {
			console.error('Database connection failed:', error);
			throw error;
		}
	}
	
	return db;
}

export function closeDatabase(): void {
	if (db) {
		db.close();
		db = null;
		console.log('Database connection closed');
	}
}

// Initialize database with basic tables
export function initializeDatabase(): void {
	const database = getDatabase();
	
	// Create searches table
	database.exec(`
		CREATE TABLE IF NOT EXISTS searches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ip_address TEXT NOT NULL,
			solana_address TEXT NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			user_agent TEXT,
			country TEXT,
			region TEXT,
			is_valid BOOLEAN,
			balance REAL,
			token_count INTEGER DEFAULT 0,
			transaction_count INTEGER DEFAULT 0
		)
	`);

	// Create analytics table
	database.exec(`
		CREATE TABLE IF NOT EXISTS analytics (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			date DATE NOT NULL,
			total_searches INTEGER DEFAULT 0,
			unique_visitors INTEGER DEFAULT 0,
			revenue REAL DEFAULT 0,
			ad_clicks INTEGER DEFAULT 0,
			affiliate_clicks INTEGER DEFAULT 0
		)
	`);

	console.log('Database tables initialized');
}