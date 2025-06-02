import { getDatabase } from './connection';

export interface Migration {
	version: number;
	description: string;
	up: () => void;
	down: () => void;
}

const migrations: Migration[] = [
	{
		version: 1,
		description: 'Initial database setup',
		up: () => {
			const db = getDatabase();
			
			// Create searches table
			db.exec(`
				CREATE TABLE IF NOT EXISTS searches (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					ip_address TEXT NOT NULL,
					solana_address TEXT NOT NULL,
					timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
					user_agent TEXT,
					country TEXT,
					region TEXT,
					is_valid BOOLEAN DEFAULT 0,
					balance REAL DEFAULT 0,
					token_count INTEGER DEFAULT 0,
					transaction_count INTEGER DEFAULT 0
				)
			`);

			// Create analytics table
			db.exec(`
				CREATE TABLE IF NOT EXISTS analytics (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					date DATE NOT NULL UNIQUE,
					total_searches INTEGER DEFAULT 0,
					unique_visitors INTEGER DEFAULT 0,
					revenue REAL DEFAULT 0,
					ad_clicks INTEGER DEFAULT 0,
					affiliate_clicks INTEGER DEFAULT 0
				)
			`);

			// Create admin users table
			db.exec(`
				CREATE TABLE IF NOT EXISTS admin_users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					username TEXT UNIQUE NOT NULL,
					password_hash TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					last_login DATETIME,
					is_active BOOLEAN DEFAULT 1
				)
			`);

			// Create indexes for better performance
			db.exec(`
				CREATE INDEX IF NOT EXISTS idx_searches_timestamp ON searches(timestamp);
				CREATE INDEX IF NOT EXISTS idx_searches_ip ON searches(ip_address);
				CREATE INDEX IF NOT EXISTS idx_searches_address ON searches(solana_address);
				CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);
			`);
		},
		down: () => {
			const db = getDatabase();
			db.exec('DROP TABLE IF EXISTS searches');
			db.exec('DROP TABLE IF EXISTS analytics');
			db.exec('DROP TABLE IF EXISTS admin_users');
		}
	},
	{
		version: 2,
		description: 'Add search performance tracking',
		up: () => {
			const db = getDatabase();
			
			db.exec(`
				ALTER TABLE searches 
				ADD COLUMN response_time_ms INTEGER DEFAULT 0
			`);

			db.exec(`
				ALTER TABLE searches 
				ADD COLUMN error_message TEXT
			`);
		},
		down: () => {
			// SQLite doesn't support DROP COLUMN, so we'd need to recreate table
			console.log('Cannot rollback column additions in SQLite');
		}
	},
	{
		version: 3,
		description: 'Add revenue tracking tables',
		up: () => {
			const db = getDatabase();
			
			db.exec(`
				CREATE TABLE IF NOT EXISTS ad_performance (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					date DATE NOT NULL,
					ad_network TEXT NOT NULL,
					impressions INTEGER DEFAULT 0,
					clicks INTEGER DEFAULT 0,
					revenue REAL DEFAULT 0,
					cpm REAL DEFAULT 0,
					ctr REAL DEFAULT 0
				)
			`);

			db.exec(`
				CREATE TABLE IF NOT EXISTS affiliate_performance (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					date DATE NOT NULL,
					affiliate_program TEXT NOT NULL,
					clicks INTEGER DEFAULT 0,
					conversions INTEGER DEFAULT 0,
					revenue REAL DEFAULT 0,
					conversion_rate REAL DEFAULT 0
				)
			`);
		},
		down: () => {
			const db = getDatabase();
			db.exec('DROP TABLE IF EXISTS ad_performance');
			db.exec('DROP TABLE IF EXISTS affiliate_performance');
		}
	}
];

// Get current database version
function getCurrentVersion(): number {
	const db = getDatabase();
	
	try {
		db.exec(`
			CREATE TABLE IF NOT EXISTS migrations (
				version INTEGER PRIMARY KEY,
				applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);
		
		const result = db.prepare('SELECT MAX(version) as version FROM migrations').get() as any;
		return result?.version || 0;
	} catch (error) {
		console.error('Error getting current version:', error);
		return 0;
	}
}

// Apply migration
function applyMigration(migration: Migration): void {
	const db = getDatabase();
	
	try {
		db.transaction(() => {
			migration.up();
			db.prepare('INSERT INTO migrations (version) VALUES (?)').run(migration.version);
		})();
		
		console.log(`Applied migration ${migration.version}: ${migration.description}`);
	} catch (error) {
		console.error(`Failed to apply migration ${migration.version}:`, error);
		throw error;
	}
}

// Run all pending migrations
export function runMigrations(): void {
	const currentVersion = getCurrentVersion();
	const pendingMigrations = migrations.filter(m => m.version > currentVersion);
	
	if (pendingMigrations.length === 0) {
		console.log('No pending migrations');
		return;
	}
	
	console.log(`Running ${pendingMigrations.length} pending migrations...`);
	
	for (const migration of pendingMigrations) {
		applyMigration(migration);
	}
	
	console.log('All migrations completed');
}

// Rollback to specific version
export function rollbackTo(targetVersion: number): void {
	const currentVersion = getCurrentVersion();
	
	if (targetVersion >= currentVersion) {
		console.log('Target version is current or higher');
		return;
	}
	
	const rollbackMigrations = migrations
		.filter(m => m.version > targetVersion && m.version <= currentVersion)
		.reverse();
	
	const db = getDatabase();
	
	for (const migration of rollbackMigrations) {
		try {
			db.transaction(() => {
				migration.down();
				db.prepare('DELETE FROM migrations WHERE version = ?').run(migration.version);
			})();
			
			console.log(`Rolled back migration ${migration.version}: ${migration.description}`);
		} catch (error) {
			console.error(`Failed to rollback migration ${migration.version}:`, error);
			throw error;
		}
	}
}