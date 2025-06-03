// ==============================================
// HANNISOL SOLANA ADDRESS CHECKER - DATABASE SETUP SCRIPT
// ==============================================

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  DATABASE_PATH: process.env.DATABASE_URL?.replace('file:', '') || './database/hannisol.db',
  PROJECT_ROOT: path.resolve(__dirname, '..'),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@hannisol.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'hannisol_admin_2024',
  SITE_NAME: process.env.SITE_NAME || 'Hannisol',
  BRAND_SLOGAN: process.env.BRAND_SLOGAN || "Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps."
};

// Logging utility
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

function logError(message, error = null) {
  log(message, 'ERROR');
  if (error) {
    console.error(error);
  }
}

// Database Schema
const SCHEMA = {
  // Core tables
  searches: `
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_id VARCHAR(36) UNIQUE NOT NULL,
      address VARCHAR(44) NOT NULL,
      address_type VARCHAR(20),
      ip_address VARCHAR(45) NOT NULL,
      user_agent TEXT,
      country_code VARCHAR(2),
      region VARCHAR(100),
      city VARCHAR(100),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      
      -- Search Results
      is_valid BOOLEAN NOT NULL,
      balance_sol DECIMAL(20, 9),
      balance_usd DECIMAL(15, 2),
      token_count INTEGER DEFAULT 0,
      nft_count INTEGER DEFAULT 0,
      transaction_count INTEGER DEFAULT 0,
      
      -- Risk Analysis
      risk_score INTEGER,
      risk_level VARCHAR(10),
      is_known_scam BOOLEAN DEFAULT FALSE,
      suspicious_activity BOOLEAN DEFAULT FALSE,
      
      -- Community Data
      community_size INTEGER,
      sentiment_score DECIMAL(3, 2),
      
      -- Performance Tracking
      response_time_ms INTEGER,
      blockchain_latency_ms INTEGER,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  analytics_daily: `
    CREATE TABLE IF NOT EXISTS analytics_daily (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE UNIQUE NOT NULL,
      
      -- Traffic Metrics
      total_visitors INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      unique_searches INTEGER DEFAULT 0,
      total_searches INTEGER DEFAULT 0,
      bounce_rate DECIMAL(5, 4),
      avg_session_duration INTEGER,
      
      -- Geographic Distribution
      top_country_code VARCHAR(2),
      top_country_searches INTEGER,
      
      -- Risk Analysis Distribution
      low_risk_searches INTEGER DEFAULT 0,
      medium_risk_searches INTEGER DEFAULT 0,
      high_risk_searches INTEGER DEFAULT 0,
      avg_risk_score DECIMAL(5, 2),
      
      -- Performance Metrics
      avg_response_time_ms INTEGER,
      uptime_percentage DECIMAL(5, 4),
      error_count INTEGER DEFAULT 0,
      
      -- Revenue Tracking
      total_revenue DECIMAL(10, 2) DEFAULT 0,
      adsense_revenue DECIMAL(10, 2) DEFAULT 0,
      coinzilla_revenue DECIMAL(10, 2) DEFAULT 0,
      aads_revenue DECIMAL(10, 2) DEFAULT 0,
      medianet_revenue DECIMAL(10, 2) DEFAULT 0,
      affiliate_revenue DECIMAL(10, 2) DEFAULT 0,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  ad_performance: `
    CREATE TABLE IF NOT EXISTS ad_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      hour INTEGER NOT NULL,
      
      -- Ad Network Info
      network_name VARCHAR(50) NOT NULL,
      ad_unit_id VARCHAR(100),
      placement VARCHAR(50),
      
      -- Performance Metrics
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      ctr DECIMAL(5, 4),
      cpm DECIMAL(10, 4),
      cpc DECIMAL(10, 4),
      revenue DECIMAL(10, 4) DEFAULT 0,
      
      -- Geographic Performance
      country_code VARCHAR(2),
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  affiliate_tracking: `
    CREATE TABLE IF NOT EXISTS affiliate_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      -- Affiliate Program Info
      program_name VARCHAR(50) NOT NULL,
      campaign_id VARCHAR(100),
      affiliate_link VARCHAR(500) NOT NULL,
      
      -- Click Tracking
      click_id VARCHAR(36) UNIQUE NOT NULL,
      referrer_url VARCHAR(500),
      user_ip VARCHAR(45),
      user_agent TEXT,
      country_code VARCHAR(2),
      
      -- Conversion Tracking
      clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      converted_at TIMESTAMP NULL,
      commission_amount DECIMAL(10, 2),
      conversion_value DECIMAL(10, 2),
      
      -- Status
      status VARCHAR(20) DEFAULT 'pending'
    )
  `,

  admin_users: `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      salt VARCHAR(32) NOT NULL,
      
      -- Role and Permissions
      role VARCHAR(20) DEFAULT 'admin',
      permissions TEXT,
      
      -- Two-Factor Authentication
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      two_factor_secret VARCHAR(32),
      backup_codes TEXT,
      
      -- Session Management
      last_login_at TIMESTAMP,
      last_login_ip VARCHAR(45),
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP NULL,
      
      -- API Access
      api_key VARCHAR(64) UNIQUE,
      api_rate_limit INTEGER DEFAULT 1000,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  shared_results: `
    CREATE TABLE IF NOT EXISTS shared_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      share_id VARCHAR(36) UNIQUE NOT NULL,
      search_id VARCHAR(36) NOT NULL,
      
      -- Sharing Info
      share_type VARCHAR(20) NOT NULL,
      shared_by_ip VARCHAR(45),
      
      -- Access Control
      is_public BOOLEAN DEFAULT TRUE,
      password_protected BOOLEAN DEFAULT FALSE,
      access_password VARCHAR(255),
      
      -- Expiration
      expires_at TIMESTAMP,
      max_views INTEGER,
      current_views INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_accessed_at TIMESTAMP
    )
  `,

  search_cache: `
    CREATE TABLE IF NOT EXISTS search_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address VARCHAR(44) UNIQUE NOT NULL,
      
      -- Cached Results (JSON)
      validation_result TEXT NOT NULL,
      balance_data TEXT,
      transaction_data TEXT,
      risk_analysis TEXT,
      community_data TEXT,
      
      -- Cache Management
      hit_count INTEGER DEFAULT 1,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    )
  `,

  system_config: `
    CREATE TABLE IF NOT EXISTS system_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key VARCHAR(100) UNIQUE NOT NULL,
      config_value TEXT NOT NULL,
      config_type VARCHAR(20) DEFAULT 'string',
      description TEXT,
      is_public BOOLEAN DEFAULT FALSE,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
};

// Database Indexes
const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_searches_address ON searches(address)',
  'CREATE INDEX IF NOT EXISTS idx_searches_ip_address ON searches(ip_address)',
  'CREATE INDEX IF NOT EXISTS idx_searches_country_code ON searches(country_code)',
  'CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_searches_risk_level ON searches(risk_level)',
  'CREATE INDEX IF NOT EXISTS idx_searches_search_id ON searches(search_id)',
  'CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date)',
  'CREATE INDEX IF NOT EXISTS idx_analytics_revenue ON analytics_daily(total_revenue)',
  'CREATE INDEX IF NOT EXISTS idx_ad_performance_date_hour ON ad_performance(date, hour)',
  'CREATE INDEX IF NOT EXISTS idx_ad_performance_network ON ad_performance(network_name)',
  'CREATE INDEX IF NOT EXISTS idx_affiliate_program ON affiliate_tracking(program_name)',
  'CREATE INDEX IF NOT EXISTS idx_affiliate_clicked_at ON affiliate_tracking(clicked_at)',
  'CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username)',
  'CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email)',
  'CREATE INDEX IF NOT EXISTS idx_admin_api_key ON admin_users(api_key)',
  'CREATE INDEX IF NOT EXISTS idx_shared_share_id ON shared_results(share_id)',
  'CREATE INDEX IF NOT EXISTS idx_shared_expires_at ON shared_results(expires_at)',
  'CREATE INDEX IF NOT EXISTS idx_cache_address ON search_cache(address)',
  'CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON search_cache(expires_at)',
  'CREATE INDEX IF NOT EXISTS idx_config_key ON system_config(config_key)'
];

// Database Views
const VIEWS = [
  `CREATE VIEW IF NOT EXISTS daily_search_summary AS
   SELECT 
     DATE(created_at) as search_date,
     COUNT(*) as total_searches,
     COUNT(DISTINCT address) as unique_addresses,
     COUNT(DISTINCT ip_address) as unique_visitors,
     AVG(risk_score) as avg_risk_score,
     COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count,
     COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_count,
     COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
     AVG(response_time_ms) as avg_response_time
   FROM searches 
   WHERE created_at >= DATE('now', '-30 days')
   GROUP BY DATE(created_at)
   ORDER BY search_date DESC`,

  `CREATE VIEW IF NOT EXISTS geographic_analytics AS
   SELECT 
     country_code,
     COUNT(*) as total_searches,
     COUNT(DISTINCT ip_address) as unique_visitors,
     COUNT(DISTINCT address) as unique_addresses,
     AVG(risk_score) as avg_risk_score,
     AVG(response_time_ms) as avg_response_time
   FROM searches 
   WHERE created_at >= DATE('now', '-30 days')
   AND country_code IS NOT NULL
   GROUP BY country_code
   ORDER BY total_searches DESC`
];

// Initial configuration data
const INITIAL_CONFIG = [
  { key: 'site_name', value: CONFIG.SITE_NAME, type: 'string', description: 'Site name for branding', public: true },
  { key: 'brand_slogan', value: CONFIG.BRAND_SLOGAN, type: 'string', description: 'Official brand slogan', public: true },
  { key: 'max_searches_per_hour', value: '100', type: 'integer', description: 'Rate limit for searches', public: false },
  { key: 'cache_ttl_seconds', value: '3600', type: 'integer', description: 'Search result cache TTL', public: false },
  { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode', public: true },
  { key: 'analytics_retention_days', value: '365', type: 'integer', description: 'How long to keep detailed analytics', public: false },
  { key: 'version', value: '1.0.0', type: 'string', description: 'Application version', public: true },
  { key: 'database_version', value: '1.0.0', type: 'string', description: 'Database schema version', public: false },
  { key: 'setup_completed_at', value: new Date().toISOString(), type: 'string', description: 'Database setup timestamp', public: false }
];

// Generate secure API key
function generateApiKey(length = 64) {
  return crypto.randomBytes(length / 2).toString('hex');
}

// Generate salt
function generateSalt(length = 32) {
  return crypto.randomBytes(length / 2).toString('hex');
}

// Hash password with bcrypt
async function hashPassword(password, saltRounds = 12) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

// Create database directory
function ensureDatabaseDirectory() {
  try {
    const dbPath = path.resolve(CONFIG.PROJECT_ROOT, CONFIG.DATABASE_PATH);
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      log(`Created database directory: ${dbDir}`);
    }
    
    return true;
  } catch (error) {
    logError('Failed to create database directory', error);
    return false;
  }
}

// Initialize database connection
function initializeDatabase() {
  try {
    const dbPath = path.resolve(CONFIG.PROJECT_ROOT, CONFIG.DATABASE_PATH);
    log(`Initializing database: ${dbPath}`);
    
    const db = new Database(dbPath);
    
    // Enable WAL mode for better performance
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec('PRAGMA cache_size = 10000');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec('PRAGMA temp_store = MEMORY');
    
    log('Database connection established with optimized settings');
    return db;
  } catch (error) {
    logError('Failed to initialize database', error);
    throw error;
  }
}

// Create all tables
function createTables(db) {
  log('Creating database tables...');
  
  try {
    Object.entries(SCHEMA).forEach(([tableName, sql]) => {
      log(`Creating table: ${tableName}`);
      db.exec(sql);
    });
    
    log('All tables created successfully');
    return true;
  } catch (error) {
    logError('Failed to create tables', error);
    throw error;
  }
}

// Create indexes
function createIndexes(db) {
  log('Creating database indexes...');
  
  try {
    INDEXES.forEach((indexSql, i) => {
      db.exec(indexSql);
    });
    
    log(`Created ${INDEXES.length} indexes successfully`);
    return true;
  } catch (error) {
    logError('Failed to create indexes', error);
    throw error;
  }
}

// Create views
function createViews(db) {
  log('Creating database views...');
  
  try {
    VIEWS.forEach((viewSql, i) => {
      db.exec(viewSql);
    });
    
    log(`Created ${VIEWS.length} views successfully`);
    return true;
  } catch (error) {
    logError('Failed to create views', error);
    throw error;
  }
}

// Insert initial configuration
function insertInitialConfig(db) {
  log('Inserting initial configuration...');
  
  try {
    const insertConfig = db.prepare(`
      INSERT OR REPLACE INTO system_config (config_key, config_value, config_type, description, is_public)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    INITIAL_CONFIG.forEach(config => {
      insertConfig.run(config.key, config.value, config.type, config.description, config.public ? 1 : 0);
    });
    
    log(`Inserted ${INITIAL_CONFIG.length} configuration entries`);
    return true;
  } catch (error) {
    logError('Failed to insert initial configuration', error);
    throw error;
  }
}

// Create admin user
async function createAdminUser(db) {
  log('Creating admin user...');
  
  try {
    // Check if admin user already exists
    const existingUser = db.prepare('SELECT id FROM admin_users WHERE username = ? OR email = ?')
      .get(CONFIG.ADMIN_USERNAME, CONFIG.ADMIN_EMAIL);
    
    if (existingUser) {
      log('Admin user already exists, skipping creation');
      return true;
    }
    
    // Generate secure credentials
    const salt = generateSalt();
    const passwordHash = await hashPassword(CONFIG.ADMIN_PASSWORD);
    const apiKey = generateApiKey();
    
    // Insert admin user
    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (
        username, email, password_hash, salt, role, permissions,
        api_key, api_rate_limit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    const permissions = JSON.stringify({
      dashboard: true,
      analytics: true,
      users: true,
      system: true,
      revenue: true,
      searches: true
    });
    
    insertAdmin.run(
      CONFIG.ADMIN_USERNAME,
      CONFIG.ADMIN_EMAIL,
      passwordHash,
      salt,
      'admin',
      permissions,
      apiKey,
      1000
    );
    
    log('Admin user created successfully');
    log(`Username: ${CONFIG.ADMIN_USERNAME}`);
    log(`Email: ${CONFIG.ADMIN_EMAIL}`);
    log(`API Key: ${apiKey}`);
    
    return true;
  } catch (error) {
    logError('Failed to create admin user', error);
    throw error;
  }
}

// Verify database setup
function verifySetup(db) {
  log('Verifying database setup...');
  
  try {
    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const expectedTables = Object.keys(SCHEMA);
    
    const missingTables = expectedTables.filter(table => 
      !tables.some(t => t.name === table)
    );
    
    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }
    
    // Check admin user
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
    if (adminCount.count === 0) {
      throw new Error('No admin users found');
    }
    
    // Check configuration
    const configCount = db.prepare('SELECT COUNT(*) as count FROM system_config').get();
    if (configCount.count === 0) {
      throw new Error('No configuration entries found');
    }
    
    log('Database verification completed successfully');
    log(`Tables: ${tables.length}`);
    log(`Admin users: ${adminCount.count}`);
    log(`Config entries: ${configCount.count}`);
    
    return true;
  } catch (error) {
    logError('Database verification failed', error);
    throw error;
  }
}

// Main setup function
async function setupDatabase() {
  const startTime = Date.now();
  log('='.repeat(60));
  log('HANNISOL DATABASE SETUP STARTED');
  log('='.repeat(60));
  
  let db = null;
  
  try {
    // Ensure database directory exists
    if (!ensureDatabaseDirectory()) {
      throw new Error('Failed to create database directory');
    }
    
    // Initialize database connection
    db = initializeDatabase();
    
    // Create schema
    createTables(db);
    createIndexes(db);
    createViews(db);
    
    // Insert initial data
    insertInitialConfig(db);
    await createAdminUser(db);
    
    // Verify setup
    verifySetup(db);
    
    // Analyze tables for optimization
    log('Analyzing tables for optimization...');
    db.exec('ANALYZE');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('='.repeat(60));
    log('DATABASE SETUP COMPLETED SUCCESSFULLY');
    log(`Duration: ${duration}s`);
    log(`Database: ${CONFIG.DATABASE_PATH}`);
    log('='.repeat(60));
    
    return {
      success: true,
      duration: parseFloat(duration),
      database: CONFIG.DATABASE_PATH,
      adminUser: {
        username: CONFIG.ADMIN_USERNAME,
        email: CONFIG.ADMIN_EMAIL
      }
    };
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('='.repeat(60));
    logError('DATABASE SETUP FAILED');
    logError(`Duration: ${duration}s`);
    logError('Error details:', error);
    log('='.repeat(60));
    
    return {
      success: false,
      error: error.message,
      duration: parseFloat(duration)
    };
  } finally {
    if (db) {
      db.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logError('Unexpected error', error);
      process.exit(1);
    });
}

export { setupDatabase };