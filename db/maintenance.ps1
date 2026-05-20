# Database Maintenance Script for Windows
# Usage: .\db-maintenance.ps1 -Command backup|restore|healthcheck|cleanup

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("backup", "restore", "healthcheck", "cleanup")]
    [string]$Command,
    
    [Parameter(Mandatory = $false)]
    [string]$BackupFile
)

# Load environment variables from .env.db
function Load-EnvFile {
    $envFile = ".env.db"
    if (Test-Path $envFile) {
        Get-Content $envFile | Where-Object { $_ -match '^\w+=' } | ForEach-Object {
            $name, $value = $_.Split('=', 2)
            Set-Variable -Name $name -Value $value -Scope Global
        }
    }
}

Load-EnvFile

# Set defaults
$DB_HOST = if ($DB_HOST) { $DB_HOST } else { "localhost" }
$DB_PORT = if ($DB_PORT) { $DB_PORT } else { "5432" }
$DB_NAME = if ($DB_NAME) { $DB_NAME } else { "cinemahub" }
$DB_USER = if ($DB_USER) { $DB_USER } else { "cinemahub" }
$BACKUP_DIR = if ($BACKUP_DIR) { $BACKUP_DIR } else { "./db/backups" }

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

# Create backup directory
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

# Backup database
function Backup-Database {
    Write-Info "Starting database backup..."
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path $BACKUP_DIR "backup_${timestamp}.sql"
    
    try {
        # Use pg_dump if available
        $pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
        if ($pgDump) {
            $env:PGPASSWORD = $DB_PASSWORD
            & pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $backupFile
            
            if ($LASTEXITCODE -eq 0) {
                $size = (Get-Item $backupFile).Length / 1MB
                Write-Info "Backup completed: $backupFile ($('{0:N2}' -f $size) MB)"
            }
            else {
                Write-Error-Custom "Backup failed with exit code $LASTEXITCODE"
                exit 1
            }
        }
        else {
            Write-Error-Custom "pg_dump not found. Please install PostgreSQL client tools."
            exit 1
        }
    }
    catch {
        Write-Error-Custom "Backup failed: $_"
        exit 1
    }
}

# Restore database
function Restore-Database {
    param([string]$BackupFile)
    
    if (-not $BackupFile) {
        Write-Error-Custom "Backup file path required"
        exit 1
    }
    
    if (-not (Test-Path $BackupFile)) {
        Write-Error-Custom "Backup file not found: $BackupFile"
        exit 1
    }
    
    Write-Warn "This will restore the database from $BackupFile"
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Info "Restore cancelled"
        exit 0
    }
    
    Write-Info "Restoring database..."
    
    try {
        $pgRestore = Get-Command psql -ErrorAction SilentlyContinue
        if ($pgRestore) {
            $env:PGPASSWORD = $DB_PASSWORD
            Get-Content $BackupFile | & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
            
            if ($LASTEXITCODE -eq 0) {
                Write-Info "Restore completed"
            }
            else {
                Write-Error-Custom "Restore failed with exit code $LASTEXITCODE"
                exit 1
            }
        }
        else {
            Write-Error-Custom "psql not found. Please install PostgreSQL client tools."
            exit 1
        }
    }
    catch {
        Write-Error-Custom "Restore failed: $_"
        exit 1
    }
}

# Health check
function Test-Database-Health {
    Write-Info "Running database health checks..."
    
    try {
        $pgCmd = Get-Command psql -ErrorAction SilentlyContinue
        if (-not $pgCmd) {
            Write-Error-Custom "psql not found. Please install PostgreSQL client tools."
            exit 1
        }
        
        # Check connection
        $env:PGPASSWORD = $DB_PASSWORD
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT 1" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Info "✓ Connection OK"
        }
        else {
            Write-Error-Custom "Database connection failed"
            exit 1
        }
        
        # Check table count
        $tableCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>&1
        Write-Info "✓ Tables: $($tableCount.Trim())"
        
        # Check migrations
        $migrationCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM schema_migrations" 2>&1
        Write-Info "✓ Migrations applied: $($migrationCount.Trim())"
        
        # Check data
        $movieCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM movies" 2>&1
        $userCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM users" 2>&1
        $bookingCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM bookings" 2>&1
        
        Write-Info "✓ Movies: $($movieCount.Trim())"
        Write-Info "✓ Users: $($userCount.Trim())"
        Write-Info "✓ Bookings: $($bookingCount.Trim())"
        
        Write-Info "Database health check completed successfully"
    }
    catch {
        Write-Error-Custom "Health check failed: $_"
        exit 1
    }
}

# Cleanup old backups
function Cleanup-Backups {
    Write-Info "Cleaning up old backups (keeping last 7 days)..."
    
    $cutoffDate = (Get-Date).AddDays(-7)
    
    Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.sql*" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item
    
    Write-Info "Cleanup completed"
    
    Write-Info "Current backups:"
    Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.sql*" | Sort-Object LastWriteTime -Descending | ForEach-Object {
        $size = $_.Length / 1MB
        Write-Host "  $($_.Name) - $($_.LastWriteTime) ($('{0:N2}' -f $size) MB)"
    }
}

# Main
switch ($Command) {
    "backup" { Backup-Database }
    "restore" { Restore-Database -BackupFile $BackupFile }
    "healthcheck" { Test-Database-Health }
    "cleanup" { Cleanup-Backups }
}
