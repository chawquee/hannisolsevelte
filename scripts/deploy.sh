#!/bin/bash

# ==============================================
# HANNISOL SOLANA ADDRESS CHECKER - DEPLOYMENT SCRIPT
# ==============================================

set -e  # Exit on any error

# Configuration
PROJECT_NAME="hannisol-solana-checker"
DEPLOY_USER="hannisol"
DEPLOY_PATH="/home/hannisol/hannisol-solana-checker"
BACKUP_DIR="/home/hannisol/database/backup"
LOG_DIR="/home/hannisol/logs"
PM2_APP_NAME="hannisol-solana-checker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] [SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}=================================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}=================================================${NC}"
}

# Check if running as correct user
check_user() {
    if [ "$USER" != "$DEPLOY_USER" ]; then
        log_error "This script must be run as user: $DEPLOY_USER"
        log_error "Current user: $USER"
        log_error "Please run: su - $DEPLOY_USER"
        exit 1
    fi
    log_success "Running as correct user: $USER"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking required dependencies..."
    
    local dependencies=("node" "npm" "pm2" "git" "sqlite3")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        else
            local version=$(command -v "$dep" &> /dev/null && $dep --version 2>/dev/null | head -n1 || echo "unknown")
            log "✓ $dep: $version"
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install missing dependencies before deploying"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="/home/hannisol/backups/deployment_$backup_timestamp"
    
    # Create backup directory
    mkdir -p "/home/hannisol/backups"
    
    if [ -d "$DEPLOY_PATH" ]; then
        # Backup application files (excluding node_modules and .git)
        log "Backing up application files..."
        mkdir -p "$backup_path"
        rsync -av --exclude='node_modules' --exclude='.git' --exclude='logs' --exclude='database' \
              "$DEPLOY_PATH/" "$backup_path/" || true
        
        # Backup database if it exists
        if [ -f "$DEPLOY_PATH/database/hannisol.db" ]; then
            log "Backing up database..."
            mkdir -p "$backup_path/database"
            cp "$DEPLOY_PATH/database/hannisol.db" "$backup_path/database/" || true
        fi
        
        # Backup environment file
        if [ -f "$DEPLOY_PATH/.env" ]; then
            log "Backing up environment configuration..."
            cp "$DEPLOY_PATH/.env" "$backup_path/" || true
        fi
        
        log_success "Backup created: $backup_path"
        echo "$backup_path" > "/tmp/hannisol_backup_path"
    else
        log_warn "No existing deployment found to backup"
    fi
}

# Pull latest code from repository
update_code() {
    log "Updating code from repository..."
    
    if [ ! -d "$DEPLOY_PATH" ]; then
        log_error "Deployment directory does not exist: $DEPLOY_PATH"
        log_error "Please run initial setup first"
        exit 1
    fi
    
    cd "$DEPLOY_PATH"
    
    # Stash any local changes
    if git status --porcelain | grep -q .; then
        log_warn "Local changes detected, stashing them..."
        git stash push -m "Auto-stash before deployment $(date)"
    fi
    
    # Pull latest changes
    log "Pulling latest changes..."
    git fetch origin
    git reset --hard origin/$(git symbolic-ref --short HEAD)
    
    log_success "Code updated successfully"
}

# Install or update dependencies
install_dependencies() {
    log "Installing/updating dependencies..."
    
    cd "$DEPLOY_PATH"
    
    # Clear npm cache if package-lock.json changed
    if git diff HEAD~1 --name-only | grep -q "package-lock.json"; then
        log "package-lock.json changed, clearing npm cache..."
        npm cache clean --force
    fi
    
    # Install dependencies
    npm ci --production --silent
    
    log_success "Dependencies installed successfully"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$DEPLOY_PATH"
    
    # Remove previous build
    if [ -d "build" ]; then
        rm -rf build
    fi
    
    # Build the application
    npm run build
    
    if [ ! -d "build" ]; then
        log_error "Build failed - build directory not created"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "$DEPLOY_PATH"
    
    # Check if database exists, if not, run setup
    if [ ! -f "database/hannisol.db" ]; then
        log "Database not found, running initial setup..."
        npm run db:setup || node scripts/setup-database.js
    else
        log "Database exists, checking for migrations..."
        # Add migration logic here if needed
        log "No migrations to run"
    fi
    
    log_success "Database migrations completed"
}

# Update PM2 ecosystem file
update_pm2_config() {
    log "Updating PM2 configuration..."
    
    cd "$DEPLOY_PATH"
    
    # Backup current PM2 config
    if [ -f "ecosystem.config.js" ]; then
        cp ecosystem.config.js ecosystem.config.js.backup
    fi
    
    # Update paths in PM2 config to absolute paths
    sed -i "s|cwd: '.*'|cwd: '$DEPLOY_PATH'|g" ecosystem.config.js
    sed -i "s|'/home/hannisol/logs/|'$LOG_DIR/|g" ecosystem.config.js
    
    log_success "PM2 configuration updated"
}

# Restart application
restart_application() {
    log "Restarting application..."
    
    cd "$DEPLOY_PATH"
    
    # Check if PM2 process exists
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        log "Reloading existing PM2 process..."
        pm2 reload ecosystem.config.js --env production
    else
        log "Starting new PM2 process..."
        pm2 start ecosystem.config.js --env production
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 10
    
    # Check if application is running
    if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
        log_success "Application restarted successfully"
    else
        log_error "Application failed to start"
        pm2 logs "$PM2_APP_NAME" --lines 20
        exit 1
    fi
}

# Test deployment
test_deployment() {
    log "Testing deployment..."
    
    local health_url="http://localhost:3000/health"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed"
            break
        else
            if [ $attempt -eq $max_attempts ]; then
                log_error "Health check failed after $max_attempts attempts"
                log "Application logs:"
                pm2 logs "$PM2_APP_NAME" --lines 20
                exit 1
            fi
            log_warn "Health check failed, retrying in 5 seconds..."
            sleep 5
            ((attempt++))
        fi
    done
    
    # Test a simple API endpoint
    if curl -f -s "http://localhost:3000/api/analytics" > /dev/null; then
        log_success "API endpoints responding"
    else
        log_warn "API endpoints may not be responding correctly"
    fi
}

# Clean up old builds and logs
cleanup() {
    log "Performing cleanup..."
    
    # Clean old PM2 logs
    pm2 flush
    
    # Clean old backups (keep last 5)
    if [ -d "/home/hannisol/backups" ]; then
        cd "/home/hannisol/backups"
        ls -t | tail -n +6 | xargs -r rm -rf
        log "Cleaned old deployment backups"
    fi
    
    # Clean old database backups (keep last 10)
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        ls -t hannisol_backup_*.db* 2>/dev/null | tail -n +11 | xargs -r rm -f
        log "Cleaned old database backups"
    fi
    
    # Clean npm cache
    npm cache clean --force --silent 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Get deployment summary
deployment_summary() {
    log_header "DEPLOYMENT SUMMARY"
    
    # Application status
    echo -e "${CYAN}Application Status:${NC}"
    pm2 show "$PM2_APP_NAME" 2>/dev/null | grep -E "(status|uptime|cpu|memory)" || echo "  Status information unavailable"
    
    # Build information
    echo -e "\n${CYAN}Build Information:${NC}"
    if [ -f "$DEPLOY_PATH/package.json" ]; then
        local version=$(cat "$DEPLOY_PATH/package.json" | grep '"version"' | cut -d'"' -f4)
        echo "  Version: $version"
    fi
    
    # Git information
    if [ -d "$DEPLOY_PATH/.git" ]; then
        cd "$DEPLOY_PATH"
        local commit=$(git rev-parse --short HEAD)
        local branch=$(git symbolic-ref --short HEAD)
        echo "  Branch: $branch"
        echo "  Commit: $commit"
        echo "  Last commit: $(git log -1 --format='%cd' --date=short)"
    fi
    
    # Database information
    echo -e "\n${CYAN}Database Information:${NC}"
    if [ -f "$DEPLOY_PATH/database/hannisol.db" ]; then
        local db_size=$(du -h "$DEPLOY_PATH/database/hannisol.db" | cut -f1)
        echo "  Database size: $db_size"
        echo "  Database path: $DEPLOY_PATH/database/hannisol.db"
    else
        echo "  Database: Not found"
    fi
    
    # Backup information
    if [ -f "/tmp/hannisol_backup_path" ]; then
        local backup_path=$(cat "/tmp/hannisol_backup_path")
        echo -e "\n${CYAN}Backup Information:${NC}"
        echo "  Backup created: $backup_path"
        rm -f "/tmp/hannisol_backup_path"
    fi
    
    echo ""
    log_success "Deployment completed successfully!"
}

# Rollback function
rollback() {
    log_header "PERFORMING ROLLBACK"
    
    if [ ! -f "/tmp/hannisol_backup_path" ]; then
        log_error "No backup path found for rollback"
        exit 1
    fi
    
    local backup_path=$(cat "/tmp/hannisol_backup_path")
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup directory not found: $backup_path"
        exit 1
    fi
    
    log "Rolling back to: $backup_path"
    
    # Stop current application
    pm2 stop "$PM2_APP_NAME" || true
    
    # Restore backup
    rsync -av "$backup_path/" "$DEPLOY_PATH/"
    
    # Restart application
    cd "$DEPLOY_PATH"
    pm2 start ecosystem.config.js --env production
    
    log_success "Rollback completed"
}

# Main deployment function
main_deploy() {
    local start_time=$(date +%s)
    
    log_header "HANNISOL DEPLOYMENT STARTED"
    
    # Pre-deployment checks
    check_user
    check_dependencies
    
    # Deployment steps
    backup_current_deployment
    update_code
    install_dependencies
    build_application
    run_migrations
    update_pm2_config
    restart_application
    test_deployment
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    deployment_summary
    
    log_success "Total deployment time: ${duration}s"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main_deploy
        ;;
    "rollback")
        rollback
        ;;
    "test")
        test_deployment
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        pm2 show "$PM2_APP_NAME"
        ;;
    "logs")
        pm2 logs "$PM2_APP_NAME" "${2:-20}"
        ;;
    "restart")
        restart_application
        ;;
    "help"|"--help"|"-h")
        echo "Hannisol Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy      Full deployment (default)"
        echo "  rollback    Rollback to previous version"
        echo "  test        Test current deployment"
        echo "  cleanup     Clean up old files and logs"
        echo "  status      Show application status"
        echo "  logs [n]    Show application logs (default: 20 lines)"
        echo "  restart     Restart application only"
        echo "  help        Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                    # Full deployment"
        echo "  $0 deploy             # Full deployment"
        echo "  $0 rollback           # Rollback deployment"
        echo "  $0 logs 50            # Show last 50 log lines"
        ;;
    *)
        log_error "Unknown command: $1"
        log "Use '$0 help' for usage information"
        exit 1
        ;;
esac