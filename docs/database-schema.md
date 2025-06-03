# Database Schema - Hannisol Solana Address Checker

## Overview
The Hannisol Solana Address Checker uses SQLite as the primary database for development and small to medium-scale deployments, with PostgreSQL support for production scaling. The schema is designed for optimal performance, analytics tracking, and comprehensive search logging.

## Database Configuration

### SQLite (Development/Small Scale)
```sql
-- Database file: /database/hannisol.db
-- Encoding: UTF-8
-- Journal Mode: WAL (Write-Ahead Logging)
-- Synchronous: NORMAL
-- Cache Size: 10000 pages
```

### PostgreSQL (Production Scale)
```sql
-- Database: hannisol_production
-- Encoding: UTF8
-- Locale: en_US.UTF-8
-- Extensions: uuid-ossp, pg_stat_statements, timescaledb
```

## Core Tables

### 1. searches
Primary table for logging all address searches and results.

```sql
CREATE TABLE searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_id VARCHAR(36) UNIQUE NOT NULL,           -- UUID for sharing
    address VARCHAR(44) NOT NULL,                    -- Solana address (Base58)
    address_type VARCHAR(20),                        -- wallet, token, program, etc.
    ip_address VARCHAR(45) NOT NULL,                 -- IPv4/IPv6 address
    user_agent TEXT,                                 -- Browser/client info
    country_code VARCHAR(2),                         -- ISO country code
    region VARCHAR(100),                             -- State/region
    city VARCHAR(100),                               -- City name
    latitude DECIMAL(10, 8),                         -- Geographic coordinates
    longitude DECIMAL(11, 8),                        -- Geographic coordinates
    
    -- Search Results
    is_valid BOOLEAN NOT NULL,                       -- Address validation result
    balance_sol DECIMAL(20, 9),                      -- SOL balance
    balance_usd DECIMAL(15, 2),                      -- USD equivalent
    token_count INTEGER DEFAULT 0,                   -- Number of token holdings
    nft_count INTEGER DEFAULT 0,                     -- Number of NFTs
    transaction_count INTEGER DEFAULT 0,             -- Total transactions
    
    -- Risk Analysis
    risk_score INTEGER,                              -- 0-100 risk score
    risk_level VARCHAR(10),                          -- low, medium, high
    is_known_scam BOOLEAN DEFAULT FALSE,             -- Known scam flag
    suspicious_activity BOOLEAN DEFAULT FALSE,       -- Suspicious patterns
    
    -- Community Data
    community_size INTEGER,                          -- Community followers
    sentiment_score DECIMAL(3, 2),                   -- -1 to 1 sentiment
    
    -- Performance Tracking
    response_time_ms INTEGER,                        -- API response time
    blockchain_latency_ms INTEGER,                   -- Solana RPC latency
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_address (address),
    INDEX idx_ip_address (ip_address),
    INDEX idx_country_code (country_code),
    INDEX idx_created_at (created_at),
    INDEX idx_risk_level (risk_level),
    INDEX idx_search_id (search_id)
);
```

### 2. analytics_daily
Daily aggregated analytics data for dashboard performance.

```sql
CREATE TABLE analytics_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,                       -- Analytics date
    
    -- Traffic Metrics
    total_visitors INTEGER DEFAULT 0,               -- Total unique visitors
    page_views INTEGER DEFAULT 0,                   -- Total page views
    unique_searches INTEGER DEFAULT 0,              -- Unique addresses searched
    total_searches INTEGER DEFAULT 0,               -- Total search requests
    bounce_rate DECIMAL(5, 4),                      -- Bounce rate percentage
    avg_session_duration INTEGER,                   -- Average session in seconds
    
    -- Geographic Distribution
    top_country_code VARCHAR(2),                    -- Most active country
    top_country_searches INTEGER,                   -- Searches from top country
    
    -- Risk Analysis Distribution
    low_risk_searches INTEGER DEFAULT 0,           -- Risk score 0-33
    medium_risk_searches INTEGER DEFAULT 0,        -- Risk score 34-66
    high_risk_searches INTEGER DEFAULT 0,          -- Risk score 67-100
    avg_risk_score DECIMAL(5, 2),                  -- Average risk score
    
    -- Performance Metrics
    avg_response_time_ms INTEGER,                   -- Average API response time
    uptime_percentage DECIMAL(5, 4),               -- Daily uptime percentage
    error_count INTEGER DEFAULT 0,                 -- Total errors
    
    -- Revenue Tracking
    total_revenue DECIMAL(10, 2) DEFAULT 0,        -- Total daily revenue
    adsense_revenue DECIMAL(10, 2) DEFAULT 0,      -- Google AdSense revenue
    coinzilla_revenue DECIMAL(10, 2) DEFAULT 0,    -- Coinzilla revenue
    aads_revenue DECIMAL(10, 2) DEFAULT 0,         -- A-ADS revenue
    medianet_revenue DECIMAL(10, 2) DEFAULT 0,     -- Media.net revenue
    affiliate_revenue DECIMAL(10, 2) DEFAULT 0,    -- Total affiliate revenue
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_total_revenue (total_revenue)
);
```

### 3. ad_performance
Detailed ad network performance tracking.

```sql
CREATE TABLE ad_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    hour INTEGER NOT NULL,                          -- 0-23 for hourly tracking
    
    -- Ad Network Info
    network_name VARCHAR(50) NOT NULL,              -- adsense, coinzilla, aads, medianet
    ad_unit_id VARCHAR(100),                        -- Ad unit identifier
    placement VARCHAR(50),                          -- sidebar, header, content
    
    -- Performance Metrics
    impressions INTEGER DEFAULT 0,                  -- Ad impressions
    clicks INTEGER DEFAULT 0,                       -- Ad clicks
    ctr DECIMAL(5, 4),                              -- Click-through rate
    cpm DECIMAL(10, 4),                             -- Cost per mille
    cpc DECIMAL(10, 4),                             -- Cost per click
    revenue DECIMAL(10, 4) DEFAULT 0,               -- Revenue generated
    
    -- Geographic Performance
    country_code VARCHAR(2),                        -- Performance by country
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date_hour (date, hour),
    INDEX idx_network_name (network_name),
    INDEX idx_country_code (country_code),
    UNIQUE KEY unique_performance (date, hour, network_name, ad_unit_id, country_code)
);
```

### 4. affiliate_tracking
Affiliate program performance and conversion tracking.

```sql
CREATE TABLE affiliate_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Affiliate Program Info
    program_name VARCHAR(50) NOT NULL,              -- ledger, amazon, vpn, education
    campaign_id VARCHAR(100),                       -- Campaign identifier
    affiliate_link VARCHAR(500) NOT NULL,           -- Full affiliate URL
    
    -- Click Tracking
    click_id VARCHAR(36) UNIQUE NOT NULL,           -- UUID for click tracking
    referrer_url VARCHAR(500),                      -- Source URL
    user_ip VARCHAR(45),                            -- User IP address
    user_agent TEXT,                                -- Browser info
    country_code VARCHAR(2),                        -- User country
    
    -- Conversion Tracking
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    converted_at TIMESTAMP NULL,                    -- Conversion timestamp
    commission_amount DECIMAL(10, 2),               -- Commission earned
    conversion_value DECIMAL(10, 2),                -- Product/service value
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',           -- pending, converted, failed
    
    INDEX idx_program_name (program_name),
    INDEX idx_clicked_at (clicked_at),
    INDEX idx_status (status),
    INDEX idx_country_code (country_code)
);
```

### 5. admin_users
Administrative user accounts and authentication.

```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,            -- bcrypt hash
    salt VARCHAR(32) NOT NULL,                      -- Password salt
    
    -- Role and Permissions
    role VARCHAR(20) DEFAULT 'admin',               -- admin, viewer, analyst
    permissions JSON,                               -- Detailed permissions
    
    -- Two-Factor Authentication
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),                  -- TOTP secret
    backup_codes JSON,                              -- Recovery codes
    
    -- Session Management
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    
    -- API Access
    api_key VARCHAR(64) UNIQUE,                     -- API authentication
    api_rate_limit INTEGER DEFAULT 1000,           -- Requests per hour
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_api_key (api_key)
);
```

### 6. shared_results
Shareable search results for social sharing.

```sql
CREATE TABLE shared_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    share_id VARCHAR(36) UNIQUE NOT NULL,           -- UUID for sharing URL
    search_id VARCHAR(36) NOT NULL,                 -- Reference to searches.search_id
    
    -- Sharing Info
    share_type VARCHAR(20) NOT NULL,                -- twitter, telegram, discord, direct
    shared_by_ip VARCHAR(45),                       -- Sharer IP address
    
    -- Access Control
    is_public BOOLEAN DEFAULT TRUE,
    password_protected BOOLEAN DEFAULT FALSE,
    access_password VARCHAR(255),                   -- Optional password
    
    -- Expiration
    expires_at TIMESTAMP,                           -- Share expiration
    max_views INTEGER,                              -- Maximum view count
    current_views INTEGER DEFAULT 0,               -- Current view count
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP,
    
    FOREIGN KEY (search_id) REFERENCES searches(search_id),
    INDEX idx_share_id (share_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
);
```

### 7. search_cache
Cache frequently searched addresses for performance.

```sql
CREATE TABLE search_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address VARCHAR(44) UNIQUE NOT NULL,
    
    -- Cached Results (JSON)
    validation_result JSON NOT NULL,                -- Address validation data
    balance_data JSON,                              -- Balance and holdings
    transaction_data JSON,                          -- Transaction history
    risk_analysis JSON,                             -- Risk assessment
    community_data JSON,                            -- Community metrics
    
    -- Cache Management
    hit_count INTEGER DEFAULT 1,                   -- Cache hit counter
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,                 -- Cache expiration
    
    INDEX idx_address (address),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_updated (last_updated)
);
```

### 8. system_config
System configuration and feature flags.

```sql
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type VARCHAR(20) DEFAULT 'string',       -- string, integer, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,               -- Can be accessed via API
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key),
    INDEX idx_is_public (is_public)
);
```

## Views and Derived Tables

### Daily Search Summary View
```sql
CREATE VIEW daily_search_summary AS
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
ORDER BY search_date DESC;
```

### Top Addresses View
```sql
CREATE VIEW top_addresses AS
SELECT 
    address,
    COUNT(*) as search_count,
    COUNT(DISTINCT ip_address) as unique_searchers,
    AVG(risk_score) as avg_risk_score,
    risk_level,
    MAX(created_at) as last_searched
FROM searches 
WHERE created_at >= DATE('now', '-7 days')
GROUP BY address
HAVING COUNT(*) >= 5
ORDER BY search_count DESC, unique_searchers DESC
LIMIT 100;
```

### Geographic Analytics View
```sql
CREATE VIEW geographic_analytics AS
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
ORDER BY total_searches DESC;
```

## Indexes for Performance

### Composite Indexes
```sql
-- Search performance
CREATE INDEX idx_searches_composite ON searches(created_at DESC, country_code, risk_level);
CREATE INDEX idx_searches_address_date ON searches(address, created_at DESC);
CREATE INDEX idx_searches_ip_date ON searches(ip_address, created_at DESC);

-- Analytics performance
CREATE INDEX idx_analytics_date_revenue ON analytics_daily(date DESC, total_revenue DESC);
CREATE INDEX idx_ad_performance_composite ON ad_performance(date DESC, network_name, revenue DESC);

-- Geographic analysis
CREATE INDEX idx_searches_geo ON searches(country_code, region, city);
```

## Database Maintenance

### Automated Cleanup Procedures
```sql
-- Clean old search cache (older than 1 hour)
DELETE FROM search_cache WHERE expires_at < datetime('now');

-- Archive old searches (older than 1 year) to separate table
CREATE TABLE searches_archive AS 
SELECT * FROM searches WHERE created_at < date('now', '-1 year');

DELETE FROM searches WHERE created_at < date('now', '-1 year');

-- Clean expired shared results
DELETE FROM shared_results WHERE expires_at < datetime('now');

-- Update analytics daily aggregation
INSERT OR REPLACE INTO analytics_daily (date, total_searches, unique_addresses, ...)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT address) as unique_addresses,
    -- ... other aggregations
FROM searches 
WHERE DATE(created_at) = DATE('now', '-1 day')
GROUP BY DATE(created_at);
```

### Backup Strategy
```sql
-- Daily backup command
.backup main /database/backup/hannisol_backup_$(date +%Y%m%d).db

-- Weekly full backup with compression
sqlite3 /database/hannisol.db ".backup main /database/backup/weekly/hannisol_full_$(date +%Y%m%d).db"
gzip /database/backup/weekly/hannisol_full_$(date +%Y%m%d).db
```

## Migration Scripts

### Initial Setup
```sql
-- Create database and enable WAL mode
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
PRAGMA foreign_keys=ON;

-- Run all CREATE TABLE statements above
-- Insert default configuration
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('site_name', 'Hannisol', 'string', 'Site name for branding'),
('max_searches_per_hour', '100', 'integer', 'Rate limit for searches'),
('cache_ttl_seconds', '3600', 'integer', 'Search result cache TTL'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('analytics_retention_days', '365', 'integer', 'How long to keep detailed analytics');
```

### Performance Optimization
```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Update table statistics
UPDATE sqlite_stat1 SET stat = '1000000' WHERE tbl = 'searches';
```

This schema provides comprehensive tracking of all system activities while maintaining optimal performance for both read and write operations. The design supports both current needs and future scaling requirements.