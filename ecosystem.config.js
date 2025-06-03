// ==============================================
// HANNISOL SOLANA ADDRESS CHECKER - PM2 CONFIGURATION
// ==============================================

module.exports = {
  apps: [
    {
      // ==============================================
      // MAIN APPLICATION
      // ==============================================
      name: 'hannisol-solana-checker',
      script: 'build/index.js',
      cwd: '/home/hannisol/hannisol-solana-checker',
      
      // ==============================================
      // CLUSTER CONFIGURATION
      // ==============================================
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      
      // ==============================================
      // ENVIRONMENT VARIABLES
      // ==============================================
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      
      // ==============================================
      // LOGGING CONFIGURATION
      // ==============================================
      log_file: '/home/hannisol/logs/combined.log',
      out_file: '/home/hannisol/logs/out.log',
      error_file: '/home/hannisol/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // ==============================================
      // PROCESS MANAGEMENT
      // ==============================================
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        'database',
        '.git',
        'static',
        'docs'
      ],
      
      // Memory management
      max_memory_restart: '1G',
      
      // Restart configuration
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Kill timeout
      kill_timeout: 5000,
      
      // ==============================================
      // HEALTH MONITORING
      // ==============================================
      health_check_grace_period: 10000,
      health_check_timeout: 5000,
      
      // Advanced health monitoring
      max_restarts_per_hour: 5,
      
      // ==============================================
      // PERFORMANCE OPTIMIZATION
      // ==============================================
      node_args: [
        '--max-old-space-size=2048',
        '--optimize-for-size'
      ],
      
      // ==============================================
      // ADVANCED FEATURES
      // ==============================================
      // Auto restart at specific times (daily restart at 4 AM)
      cron_restart: '0 4 * * *',
      
      // Instance variables for cluster mode
      instance_var: 'INSTANCE_ID',
      
      // Listen timeout
      listen_timeout: 10000,
      
      // ==============================================
      // ERROR HANDLING
      // ==============================================
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      
      // ==============================================
      // DEPLOYMENT CONFIGURATION
      // ==============================================
      // Post-deployment hooks
      post_update: ['npm install', 'npm run build'],
      
      // ==============================================
      // MONITORING CONFIGURATION
      // ==============================================
      // CPU monitoring
      max_cpu_percent: 80,
      
      // Memory monitoring
      max_memory_threshold: '1G',
      
      // ==============================================
      // SOURCE MAP SUPPORT
      // ==============================================
      source_map_support: true,
      
      // ==============================================
      // HANNISOL SPECIFIC SETTINGS
      // ==============================================
      // Custom environment variables for Hannisol
      env_hannisol: {
        BRAND_NAME: 'Hannisol',
        BRAND_SLOGAN: "Hannisol's Insight, Navigating Crypto Like Hannibal Crossed the Alps.",
        MONETIZATION_ENABLED: true,
        ANALYTICS_ENABLED: true
      }
    },
    
    // ==============================================
    // BACKGROUND TASKS (Optional)
    // ==============================================
    {
      name: 'hannisol-background-tasks',
      script: 'build/workers/background-tasks.js',
      cwd: '/home/hannisol/hannisol-solana-checker',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'background'
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background'
      },
      
      // Logging
      log_file: '/home/hannisol/logs/background-combined.log',
      out_file: '/home/hannisol/logs/background-out.log',
      error_file: '/home/hannisol/logs/background-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      restart_delay: 10000,
      max_restarts: 5,
      min_uptime: '30s',
      max_memory_restart: '512M',
      
      // Schedule restart every 6 hours for maintenance
      cron_restart: '0 */6 * * *',
      
      // Watch for changes (disabled in production)
      watch: false,
      
      // Auto-start
      autorestart: true
    },
    
    // ==============================================
    // DATABASE MAINTENANCE (Optional)
    // ==============================================
    {
      name: 'hannisol-db-maintenance',
      script: 'scripts/db-maintenance.js',
      cwd: '/home/hannisol/hannisol-solana-checker',
      instances: 1,
      exec_mode: 'fork',
      
      // Run daily at 2 AM
      cron_restart: '0 2 * * *',
      autorestart: false,
      
      env_production: {
        NODE_ENV: 'production',
        MAINTENANCE_TYPE: 'database'
      },
      
      // Logging
      log_file: '/home/hannisol/logs/maintenance-combined.log',
      out_file: '/home/hannisol/logs/maintenance-out.log',
      error_file: '/home/hannisol/logs/maintenance-error.log',
      
      // Resource limits
      max_memory_restart: '256M',
      
      // Don't restart on exit (maintenance tasks should complete and exit)
      autorestart: false
    }
  ],
  
  // ==============================================
  // DEPLOYMENT CONFIGURATION
  // ==============================================
  deploy: {
    production: {
      user: 'hannisol',
      host: ['hannisol.com'],
      ref: 'origin/main',
      repo: 'git@github.com:YOUR_USERNAME/hannisol-solana-checker.git',
      path: '/home/hannisol/hannisol-solana-checker',
      
      // Pre-deploy commands
      'pre-deploy-local': 'echo "Starting deployment..."',
      
      // Post-deploy commands
      'post-deploy': [
        'npm install',
        'npm run build',
        'pm2 reload ecosystem.config.js --env production',
        'echo "Deployment completed successfully"'
      ].join(' && '),
      
      // Pre-setup commands
      'pre-setup': 'echo "Setting up production environment..."',
      
      // Post-setup commands
      'post-setup': [
        'npm install',
        'npm run build',
        'pm2 start ecosystem.config.js --env production',
        'pm2 save'
      ].join(' && '),
      
      // Environment
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'hannisol',
      host: ['staging.hannisol.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:YOUR_USERNAME/hannisol-solana-checker.git',
      path: '/home/hannisol/hannisol-solana-checker-staging',
      
      'post-deploy': [
        'npm install',
        'npm run build',
        'pm2 reload ecosystem.config.js --env staging'
      ].join(' && '),
      
      env: {
        NODE_ENV: 'staging'
      }
    }
  },
  
  // ==============================================
  // GLOBAL PM2 CONFIGURATION
  // ==============================================
  // PM2 Plus monitoring (optional)
  pmx: {
    enabled: true,
    network: true,
    ports: true,
    
    // Custom metrics
    custom_probes: true,
    
    // Exception handling
    catch_exceptions: true,
    
    // HTTP monitoring
    http: true,
    http_latency: 200,
    http_code: 500,
    
    // Ignored routes for monitoring
    ignore_routes: [
      /\/health/,
      /\/favicon.ico/,
      /\/robots.txt/
    ]
  },
  
  // ==============================================
  // MODULE CONFIGURATION
  // ==============================================
  module_conf: {
    // Log rotation module
    'pm2-logrotate': {
      max_size: '10M',
      retain: 30,
      compress: true,
      dateFormat: 'YYYY-MM-DD_HH-mm-ss',
      workerInterval: 30,
      rotateInterval: '0 0 * * *'
    },
    
    // Auto-pull module for git updates
    'pm2-auto-pull': {
      apps: [
        {
          name: 'hannisol-solana-checker',
          script: 'build/index.js',
          watch: false
        }
      ]
    }
  },
  
  // ==============================================
  // ERROR HANDLING & NOTIFICATIONS
  // ==============================================
  error_file: '/home/hannisol/logs/pm2-error.log',
  out_file: '/home/hannisol/logs/pm2-out.log',
  log_file: '/home/hannisol/logs/pm2-combined.log',
  
  // ==============================================
  // PERFORMANCE MONITORING
  // ==============================================
  monitoring: {
    http: true,
    https: true,
    port: false,
    
    // Alert thresholds
    alert: {
      memory: 150,
      cpu: 80
    }
  }
};