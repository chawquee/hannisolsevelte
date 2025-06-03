# Deployment Guide - Hannisol Solana Address Checker

## Overview
This guide provides complete instructions for deploying the Hannisol Solana Address Checker on a VPS (Virtual Private Server) in production. The deployment uses Ubuntu 22.04 LTS, Node.js, SQLite/PostgreSQL, Nginx, and PM2 for process management.

## Prerequisites

### Server Requirements
- **VPS**: Minimum 2GB RAM, 2 CPU cores, 20GB SSD storage
- **Operating System**: Ubuntu 22.04 LTS (recommended)
- **Network**: Public IP address and domain name
- **Access**: Root or sudo access to the server

### Domain Setup
- Domain name pointed to your VPS IP address
- DNS A record: `hannisol.com` → `YOUR_VPS_IP`
- Optional: `www.hannisol.com` → `YOUR_VPS_IP`

## Phase 1: Initial Server Setup

### 1.1 Connect to Your VPS
```bash
# Connect via SSH
ssh root@YOUR_VPS_IP

# Or if using a user account
ssh username@YOUR_VPS_IP
```

### 1.2 Update System Packages
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.3 Create Application User
```bash
# Create dedicated user for the application
sudo adduser hannisol

# Add user to sudo group
sudo usermod -aG sudo hannisol

# Switch to application user
su - hannisol
```

### 1.4 Configure Firewall
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

## Phase 2: Install Dependencies

### 2.1 Install Node.js (via NodeSource)
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

### 2.2 Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on system boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u hannisol --hp /home/hannisol
```

### 2.3 Install Nginx Web Server
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### 2.4 Install Database (SQLite + PostgreSQL)
```bash
# SQLite (included by default)
sudo apt install -y sqlite3

# PostgreSQL (optional, for scaling)
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.5 Install SSL Certificate Tools
```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
```

## Phase 3: Application Deployment

### 3.1 Clone Repository
```bash
# Navigate to home directory
cd /home/hannisol

# Clone the repository (replace with actual repo URL)
git clone https://github.com/YOUR_USERNAME/hannisol-solana-checker.git
cd hannisol-solana-checker

# Install dependencies
npm install
```

### 3.2 Environment Configuration
```bash
# Create production environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Environment Variables (.env):**
```bash
# Application Settings
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SITE_URL=https://hannisol.com

# Database Configuration
DATABASE_URL=file:/home/hannisol/database/hannisol.db
DATABASE_TYPE=sqlite
DB_BACKUP_PATH=/home/hannisol/database/backup

# Solana RPC Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_BACKUP=https://solana-api.projectserum.com
SOLANA_COMMITMENT=confirmed

# Security Settings
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
SESSION_SECRET=your-session-secret-key
ENCRYPTION_KEY=your-encryption-key-32-chars

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_RATE_LIMIT_MAX=1000

# Analytics & Tracking
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
IP_GEOLOCATION_API_KEY=your-geolocation-api-key

# Ad Network Configuration
GOOGLE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxx
COINZILLA_ZONE_ID=your-coinzilla-zone-id
AADS_CAMPAIGN_ID=your-aads-campaign-id
MEDIANET_CUSTOMER_ID=your-medianet-id

# Affiliate Program IDs
AMAZON_ASSOCIATES_TAG=your-amazon-tag
LEDGER_AFFILIATE_ID=your-ledger-id
VPN_AFFILIATE_ID=your-vpn-id

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@hannisol.com
ADMIN_PASSWORD=secure-admin-password

# Backup Settings
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
```

### 3.3 Database Setup
```bash
# Create database directory
mkdir -p /home/hannisol/database/backup

# Initialize database
npm run db:setup

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 3.4 Build Application
```bash
# Build SvelteKit application
npm run build

# Verify build
ls -la build/
```

## Phase 4: Production Configuration

### 4.1 PM2 Configuration
Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'hannisol-solana-checker',
    script: 'build/index.js',
    cwd: '/home/hannisol/hannisol-solana-checker',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: '/home/hannisol/logs/combined.log',
    out_file: '/home/hannisol/logs/out.log',
    error_file: '/home/hannisol/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Process management
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'database'],
    max_memory_restart: '1G',
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    health_check_grace_period: 10000,
    health_check_timeout: 5000
  }]
};
```

### 4.2 Create Log Directory
```bash
# Create logs directory
mkdir -p /home/hannisol/logs

# Set permissions
chmod 755 /home/hannisol/logs
```

### 4.3 Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Check application status
pm2 status
pm2 logs hannisol-solana-checker
```

## Phase 5: Nginx Configuration

### 5.1 Create Nginx Configuration
```bash
# Remove default Nginx site
sudo rm /etc/nginx/sites-enabled/default

# Create site configuration
sudo nano /etc/nginx/sites-available/hannisol.com
```

**Nginx Configuration (/etc/nginx/sites-available/hannisol.com):**
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=hannisol:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

# Upstream application servers
upstream hannisol_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP server (redirects to HTTPS)
server {
    listen 80;
    server_name hannisol.com www.hannisol.com;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name hannisol.com www.hannisol.com;
    
    # SSL configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/hannisol.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hannisol.com/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.mainnet-beta.solana.com;";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://hannisol_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Main application
    location / {
        limit_req zone=hannisol burst=30 nodelay;
        proxy_pass http://hannisol_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://hannisol_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Robots.txt
    location = /robots.txt {
        alias /home/hannisol/hannisol-solana-checker/static/robots.txt;
        access_log off;
    }
    
    # Favicon
    location = /favicon.ico {
        alias /home/hannisol/hannisol-solana-checker/static/favicon.ico;
        access_log off;
        expires 1y;
    }
}
```

### 5.2 Enable Site and Test Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/hannisol.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Phase 6: SSL Certificate Setup

### 6.1 Install Let's Encrypt Certificate
```bash
# Request SSL certificate
sudo certbot --nginx -d hannisol.com -d www.hannisol.com

# Follow the prompts and choose to redirect HTTP to HTTPS

# Test automatic renewal
sudo certbot renew --dry-run
```

### 6.2 Configure Auto-Renewal
```bash
# Add cron job for automatic renewal
sudo crontab -e

# Add this line to check for renewal twice daily
0 12 * * * /usr/bin/certbot renew --quiet
```

## Phase 7: Monitoring and Automation

### 7.1 Database Backup Automation
Create backup script:
```bash
nano /home/hannisol/scripts/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/hannisol/database/backup"
DATABASE_FILE="/home/hannisol/database/hannisol.db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
sqlite3 $DATABASE_FILE ".backup '$BACKUP_DIR/hannisol_backup_$DATE.db'"

# Compress backup
gzip "$BACKUP_DIR/hannisol_backup_$DATE.db"

# Clean old backups
find $BACKUP_DIR -name "hannisol_backup_*.db.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: hannisol_backup_$DATE.db.gz"
```

Make script executable and add to cron:
```bash
# Make script executable
chmod +x /home/hannisol/scripts/backup.sh

# Add to cron for daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /home/hannisol/scripts/backup.sh
```

### 7.2 Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/hannisol
```

**Log Rotation Configuration:**
```
/home/hannisol/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7.3 System Monitoring
Install monitoring tools:
```bash
# Install htop and other monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor PM2 processes
pm2 monit

# Check system resources
htop
```

### 7.4 Health Check Script
Create health check script:
```bash
nano /home/hannisol/scripts/health-check.sh
```

**Health Check Script:**
```bash
#!/bin/bash

# Check if application is responding
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ $RESPONSE -eq 200 ]; then
    echo "Application is healthy"
    exit 0
else
    echo "Application is unhealthy (HTTP $RESPONSE)"
    # Restart application
    pm2 restart hannisol-solana-checker
    exit 1
fi
```

## Phase 8: Security Hardening

### 8.1 SSH Security
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Add these security settings:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 2222  # Change default port

# Restart SSH service
sudo systemctl restart ssh
```

### 8.2 Fail2Ban Installation
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create custom configuration
sudo nano /etc/fail2ban/jail.local
```

**Fail2Ban Configuration:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
```

Start Fail2Ban:
```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Phase 9: Performance Optimization

### 9.1 Node.js Optimization
```bash
# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max-old-space-size=2048"

# Add to .bashrc for persistence
echo 'export NODE_OPTIONS="--max-old-space-size=2048"' >> ~/.bashrc
```

### 9.2 Database Optimization
```bash
# SQLite optimization script
nano /home/hannisol/scripts/optimize-db.sh
```

**Database Optimization Script:**
```bash
#!/bin/bash

DATABASE_FILE="/home/hannisol/database/hannisol.db"

# Optimize database
sqlite3 $DATABASE_FILE "VACUUM;"
sqlite3 $DATABASE_FILE "ANALYZE;"
sqlite3 $DATABASE_FILE "PRAGMA optimize;"

echo "Database optimization completed"
```

Run weekly:
```bash
chmod +x /home/hannisol/scripts/optimize-db.sh

# Add to cron for weekly optimization
crontab -e
# Add: 0 3 * * 0 /home/hannisol/scripts/optimize-db.sh
```

## Phase 10: Deployment Verification

### 10.1 Verify Application Status
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs hannisol-solana-checker --lines 50

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates
```

### 10.2 Test Application Functionality
```bash
# Test health endpoint
curl https://hannisol.com/health

# Test API endpoint
curl -X POST https://hannisol.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"address":"5DF4D7nGU9nJi3Wj7jYD6K2L3M8N9P0Q1R2S3T4U5V6W7X8Y9Z"}'

# Test website in browser
# Navigate to https://hannisol.com
```

### 10.3 Performance Testing
```bash
# Install Apache Bench for load testing
sudo apt install -y apache2-utils

# Test website performance
ab -n 100 -c 10 https://hannisol.com/

# Test API performance
ab -n 50 -c 5 -p test-payload.json -T 'application/json' https://hannisol.com/api/search
```

## Troubleshooting

### Common Issues and Solutions

**Application Won't Start:**
```bash
# Check PM2 logs
pm2 logs hannisol-solana-checker

# Check environment variables
pm2 env 0

# Restart application
pm2 restart hannisol-solana-checker
```

**SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Test SSL configuration
openssl s_client -connect hannisol.com:443
```

**Database Connection Issues:**
```bash
# Check database file permissions
ls -la /home/hannisol/database/

# Test database connection
sqlite3 /home/hannisol/database/hannisol.db ".tables"

# Check disk space
df -h
```

**High Memory Usage:**
```bash
# Check memory usage
free -h
htop

# Restart PM2 cluster
pm2 restart all

# Clear PM2 logs
pm2 flush
```

## Maintenance Tasks

### Daily Tasks
- Monitor application logs
- Check system resources
- Verify backup completion

### Weekly Tasks
- Review security logs
- Update system packages
- Optimize database
- Check SSL certificate status

### Monthly Tasks
- Security audit
- Performance review
- Backup verification
- Update dependencies

## Conclusion

Your Hannisol Solana Address Checker is now deployed and ready for production use. The setup includes:

✅ **Secure HTTPS with Let's Encrypt SSL**
✅ **PM2 process management with clustering**
✅ **Nginx reverse proxy with rate limiting**
✅ **Automated database backups**
✅ **Log rotation and monitoring**
✅ **Security hardening with Fail2Ban**
✅ **Performance optimization**

For ongoing support and updates, monitor the application logs and system metrics regularly. The deployment is designed to be highly available, secure, and scalable for growing traffic demands.