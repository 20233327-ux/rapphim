#!/bin/bash

# Database Maintenance Script
# Usage: ./db-maintenance.sh [backup|restore|health-check|cleanup]

set -e

# Load environment variables
if [ -f .env.db ]; then
  export $(cat .env.db | grep -v '#' | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cinemahub}"
DB_USER="${DB_USER:-cinemahub}"
BACKUP_DIR="${BACKUP_DIR:-./db/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Backup database
backup_database() {
  print_info "Starting database backup..."
  
  BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"
  
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    | gzip > "$BACKUP_FILE"
  
  if [ $? -eq 0 ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_info "Backup completed: $BACKUP_FILE ($SIZE)"
  else
    print_error "Backup failed"
    exit 1
  fi
}

# Restore database from backup
restore_database() {
  if [ -z "$1" ]; then
    print_error "Usage: $0 restore <backup_file>"
    exit 1
  fi
  
  BACKUP_FILE="$1"
  
  if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
  fi
  
  print_warn "This will restore the database from $BACKUP_FILE"
  read -p "Are you sure? (yes/no): " confirm
  
  if [ "$confirm" != "yes" ]; then
    print_info "Restore cancelled"
    exit 0
  fi
  
  print_info "Restoring database..."
  
  if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      --no-password
  else
    PGPASSWORD="$DB_PASSWORD" psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      --no-password \
      -f "$BACKUP_FILE"
  fi
  
  if [ $? -eq 0 ]; then
    print_info "Restore completed"
  else
    print_error "Restore failed"
    exit 1
  fi
}

# Health check
health_check() {
  print_info "Running database health checks..."
  
  # Check connection
  PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -c "SELECT 1" > /dev/null 2>&1
  
  if [ $? -ne 0 ]; then
    print_error "Database connection failed"
    exit 1
  fi
  
  print_info "✓ Connection OK"
  
  # Check table count
  TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
  
  print_info "✓ Tables: $TABLE_COUNT"
  
  # Check migrations
  MIGRATION_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -t -c "SELECT count(*) FROM schema_migrations")
  
  print_info "✓ Migrations applied: $MIGRATION_COUNT"
  
  # Check data
  MOVIE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -t -c "SELECT count(*) FROM movies")
  
  USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -t -c "SELECT count(*) FROM users")
  
  BOOKING_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -t -c "SELECT count(*) FROM bookings")
  
  print_info "✓ Movies: $MOVIE_COUNT"
  print_info "✓ Users: $USER_COUNT"
  print_info "✓ Bookings: $BOOKING_COUNT"
  
  print_info "Database health check completed successfully"
}

# Cleanup old backups (keep last 7 days)
cleanup_backups() {
  print_info "Cleaning up old backups (keeping last 7 days)..."
  
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
  
  print_info "Cleanup completed"
  
  print_info "Current backups:"
  ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || print_warn "No backups found"
}

# Main command handler
case "${1:-help}" in
  backup)
    backup_database
    ;;
  restore)
    restore_database "$2"
    ;;
  health-check)
    health_check
    ;;
  cleanup)
    cleanup_backups
    ;;
  *)
    cat << EOF
Usage: $0 <command>

Commands:
  backup           - Create a backup of the database
  restore <file>   - Restore database from a backup file
  health-check     - Run database health checks
  cleanup          - Clean up old backup files (keep last 7 days)

Environment variables:
  DB_HOST          - Database host (default: localhost)
  DB_PORT          - Database port (default: 5432)
  DB_NAME          - Database name (default: cinemahub)
  DB_USER          - Database user (default: cinemahub)
  DB_PASSWORD      - Database password
  BACKUP_DIR       - Backup directory (default: ./db/backups)

Examples:
  $0 backup
  $0 restore ./db/backups/backup_20240101_120000.sql.gz
  $0 health-check
  $0 cleanup
EOF
    exit 1
    ;;
esac
