// ==============================================
// HANNISOL SOLANA ADDRESS CHECKER - DATABASE BACKUP SCRIPT
// ==============================================

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  DATABASE_PATH: process.env.DATABASE_URL?.replace('file:', '') || './database/hannisol.db',
  BACKUP_DIR: process.env.DB_BACKUP_PATH || './database/backup',
  RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  COMPRESSION: process.env.BACKUP_COMPRESSION === 'true',
  PROJECT_ROOT: path.resolve(__dirname, '..')
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

// Create backup directory if it doesn't exist
function ensureBackupDirectory() {
  try {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
      log(`Created backup directory: ${CONFIG.BACKUP_DIR}`);
    }
    return true;
  } catch (error) {
    logError('Failed to create backup directory', error);
    return false;
  }
}

// Check if database file exists
function checkDatabaseExists() {
  const dbPath = path.resolve(CONFIG.PROJECT_ROOT, CONFIG.DATABASE_PATH);
  if (!fs.existsSync(dbPath)) {
    logError(`Database file not found: ${dbPath}`);
    return false;
  }
  log(`Database found: ${dbPath}`);
  return true;
}

// Generate backup filename with timestamp
function generateBackupFilename() {
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\./g, '-')
    .split('T')[0] + '_' + 
    new Date().toISOString()
    .split('T')[1]
    .replace(/:/g, '-')
    .split('.')[0];
  
  return `hannisol_backup_${timestamp}.db`;
}

// Execute SQLite backup command
function createSQLiteBackup(backupFilename) {
  return new Promise((resolve, reject) => {
    const dbPath = path.resolve(CONFIG.PROJECT_ROOT, CONFIG.DATABASE_PATH);
    const backupPath = path.resolve(CONFIG.PROJECT_ROOT, CONFIG.BACKUP_DIR, backupFilename);
    
    log(`Starting backup: ${dbPath} -> ${backupPath}`);
    
    // Use SQLite .backup command for atomic backup
    const sqlite3Process = spawn('sqlite3', [dbPath, `.backup '${backupPath}'`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    sqlite3Process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    sqlite3Process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    sqlite3Process.on('close', (code) => {
      if (code === 0) {
        log(`SQLite backup completed successfully: ${backupFilename}`);
        resolve(backupPath);
      } else {
        logError(`SQLite backup failed with code ${code}`, errorOutput);
        reject(new Error(`Backup process failed: ${errorOutput}`));
      }
    });
    
    sqlite3Process.on('error', (error) => {
      logError('Failed to start sqlite3 process', error);
      reject(error);
    });
  });
}

// Compress backup file using gzip
function compressBackup(backupPath) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.COMPRESSION) {
      resolve(backupPath);
      return;
    }
    
    log(`Compressing backup: ${backupPath}`);
    
    const gzipProcess = spawn('gzip', [backupPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let errorOutput = '';
    
    gzipProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    gzipProcess.on('close', (code) => {
      if (code === 0) {
        const compressedPath = `${backupPath}.gz`;
        log(`Compression completed: ${compressedPath}`);
        resolve(compressedPath);
      } else {
        logError(`Compression failed with code ${code}`, errorOutput);
        reject(new Error(`Compression failed: ${errorOutput}`));
      }
    });
    
    gzipProcess.on('error', (error) => {
      logError('Failed to start gzip process', error);
      reject(error);
    });
  });
}

// Get backup file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
  } catch (error) {
    return 'Unknown';
  }
}

// Clean old backup files
function cleanOldBackups() {
  return new Promise((resolve) => {
    try {
      const backupDir = path.resolve(CONFIG.PROJECT_ROOT, CONFIG.BACKUP_DIR);
      const files = fs.readdirSync(backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION_DAYS);
      
      let deletedCount = 0;
      let deletedSize = 0;
      
      files.forEach(file => {
        if (file.startsWith('hannisol_backup_') && (file.endsWith('.db') || file.endsWith('.db.gz'))) {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            deletedSize += stats.size;
            fs.unlinkSync(filePath);
            deletedCount++;
            log(`Deleted old backup: ${file}`);
          }
        }
      });
      
      if (deletedCount > 0) {
        const sizeStr = getFileSize(deletedSize);
        log(`Cleanup completed: ${deletedCount} files deleted, ${sizeStr} freed`);
      } else {
        log('No old backups to clean');
      }
      
      resolve({ deletedCount, deletedSize });
    } catch (error) {
      logError('Error during backup cleanup', error);
      resolve({ deletedCount: 0, deletedSize: 0 });
    }
  });
}

// Verify backup integrity
function verifyBackup(backupPath) {
  return new Promise((resolve, reject) => {
    log(`Verifying backup integrity: ${backupPath}`);
    
    // For compressed files, we need to check the original file
    const dbPath = backupPath.endsWith('.gz') ? backupPath.slice(0, -3) : backupPath;
    const isCompressed = backupPath.endsWith('.gz');
    
    if (isCompressed) {
      // For compressed backups, we'll assume they're valid if the file exists and has size > 0
      try {
        const stats = fs.statSync(backupPath);
        if (stats.size > 0) {
          log('Compressed backup verification: File exists and has content');
          resolve(true);
        } else {
          reject(new Error('Compressed backup file is empty'));
        }
      } catch (error) {
        reject(error);
      }
      return;
    }
    
    // For uncompressed backups, verify SQLite integrity
    const sqlite3Process = spawn('sqlite3', [dbPath, 'PRAGMA integrity_check;'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    sqlite3Process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    sqlite3Process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    sqlite3Process.on('close', (code) => {
      if (code === 0 && output.trim() === 'ok') {
        log('Backup integrity verification: PASSED');
        resolve(true);
      } else {
        logError('Backup integrity verification: FAILED', errorOutput);
        reject(new Error(`Integrity check failed: ${errorOutput}`));
      }
    });
    
    sqlite3Process.on('error', (error) => {
      logError('Failed to verify backup integrity', error);
      reject(error);
    });
  });
}

// Send notification (optional)
function sendNotification(success, message, details = {}) {
  // This could be extended to send Discord/Slack notifications
  if (process.env.DISCORD_WEBHOOK_URL && process.env.DISCORD_NOTIFICATIONS_ENABLED === 'true') {
    // Implementation for Discord webhook
    log('Discord notification would be sent here');
  }
  
  if (process.env.SLACK_WEBHOOK_URL && process.env.SLACK_NOTIFICATIONS_ENABLED === 'true') {
    // Implementation for Slack webhook
    log('Slack notification would be sent here');
  }
}

// Main backup function
async function performBackup() {
  const startTime = Date.now();
  log('='.repeat(60));
  log('HANNISOL DATABASE BACKUP STARTED');
  log('='.repeat(60));
  
  try {
    // Pre-flight checks
    if (!ensureBackupDirectory()) {
      throw new Error('Failed to ensure backup directory exists');
    }
    
    if (!checkDatabaseExists()) {
      throw new Error('Database file not found');
    }
    
    // Generate backup filename
    const backupFilename = generateBackupFilename();
    
    // Create backup
    const backupPath = await createSQLiteBackup(backupFilename);
    
    // Verify backup
    await verifyBackup(backupPath);
    
    // Compress if enabled
    const finalBackupPath = await compressBackup(backupPath);
    
    // Get final backup size
    const backupSize = getFileSize(finalBackupPath);
    
    // Clean old backups
    const cleanupResult = await cleanOldBackups();
    
    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Success summary
    log('='.repeat(60));
    log('BACKUP COMPLETED SUCCESSFULLY');
    log(`File: ${path.basename(finalBackupPath)}`);
    log(`Size: ${backupSize}`);
    log(`Duration: ${duration}s`);
    log(`Old backups cleaned: ${cleanupResult.deletedCount}`);
    log('='.repeat(60));
    
    sendNotification(true, 'Database backup completed successfully', {
      filename: path.basename(finalBackupPath),
      size: backupSize,
      duration: `${duration}s`
    });
    
    return {
      success: true,
      filename: path.basename(finalBackupPath),
      path: finalBackupPath,
      size: backupSize,
      duration: parseFloat(duration),
      cleanupResult
    };
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('='.repeat(60));
    logError('BACKUP FAILED');
    logError(`Duration: ${duration}s`);
    logError('Error details:', error);
    log('='.repeat(60));
    
    sendNotification(false, 'Database backup failed', {
      error: error.message,
      duration: `${duration}s`
    });
    
    return {
      success: false,
      error: error.message,
      duration: parseFloat(duration)
    };
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  performBackup()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logError('Unexpected error', error);
      process.exit(1);
    });
}

export { performBackup };