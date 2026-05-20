# Database Operations & Deployment Guide

Comprehensive guide for managing CinemaHub database setup, migrations, backups, and production deployment.

## Directory Structure

```
db/
├── migrations/          # Database schema migrations
│   ├── 001_init.sql     # Core schema with types, tables, indexes
│   ├── 002_enhance_database.sql  # Audit logs, performance improvements
│   └── 002_set_default_passwords.sql  # Default user password hashes
├── seed/                # Initial data seeding
│   ├── 001_seed.sql     # Demo movies, rooms, users, bookings
│   └── 002_set_default_passwords.sql  # Password setup
├── backups/             # Database backups (auto-created)
├── docker-compose.db.yml  # Local PostgreSQL container config
├── maintenance.sh       # Bash maintenance utilities (Linux/Mac)
├── maintenance.ps1      # PowerShell maintenance utilities (Windows)
├── .env.db.example      # Database environment template
└── README.md            # This file
```

## Quick Start

### Local Development Setup

1. **Create environment file:**
   ```bash
   cp db/.env.db.example .env.db
   # Edit .env.db with your local password
   ```

2. **Start PostgreSQL:**
   ```bash
   npm run db:up
   ```

3. **View logs:**
   ```bash
   npm run db:logs
   ```

4. **Stop database:**
   ```bash
   npm run db:down
   ```

5. **Reset database (delete all data):**
   ```bash
   npm run db:reset
   npm run db:up
   ```

### Default Credentials (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cinema.com` | `Admin@123` |
| Staff | `staff@cinema.com` | `Staff@123` |

## Migration System

### How It Works

1. Server checks `schema_migrations` table on startup
2. Applies any migrations in `db/migrations/` not yet recorded
3. Records migration filename in `schema_migrations`
4. Never re-applies same migration (idempotent)

### Environment Controls

- **DB_AUTO_MIGRATE** (default: `true`) - Run migrations on startup
- **DB_RUN_SEED** (default: `false`) - Load initial demo data
  - Set `true` for first deployment only
  - Set `false` for subsequent deployments

### Creating New Migrations

Create file: `db/migrations/NNN_description.sql`

```sql
-- db/migrations/004_add_audit_table.sql
BEGIN;

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);

COMMIT;
```

**Rules:**
- Use sequential numbering (001, 002, 003, etc.)
- Use `IF NOT EXISTS` to prevent errors on re-run
- Wrap in `BEGIN; ... COMMIT;`
- Test locally before deploying

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| **movies** | Film information and metadata |
| **movie_genres** | Movie genre relationships |
| **movie_actors** | Movie cast relationships |
| **rooms** | Cinema auditoriums |
| **showtimes** | Movie showings with pricing |
| **users** | Staff and customer accounts |
| **bookings** | Ticket reservations |
| **booking_seats** | Booked seat mappings |
| **shifts** | Staff shift assignments |
| **promotions** | Discount codes |

### Audit & System Tables

| Table | Purpose |
|-------|---------|
| **schema_migrations** | Applied migration tracking |
| **audit_logs** | Data change audit trail |
| **sessions** | User login session tracking |
| **daily_metrics** | Business analytics data |

### Data Integrity

All tables include:
- **Primary Keys** - Unique identifiers
- **Foreign Keys** - Referential integrity
  - `ON DELETE CASCADE` - Remove dependent records
  - `ON DELETE RESTRICT` - Prevent deletion if referenced
- **CHECK Constraints** - Data validation (e.g., price >= 0)
- **UNIQUE Constraints** - Prevent duplicates
- **Performance Indexes** - On frequently queried columns

## Maintenance & Backups

### Backup Database

**Linux/Mac:**
```bash
./db/maintenance.sh backup
# Creates: db/backups/backup_YYYYMMDD_HHMMSS.sql.gz
```

**Windows (PowerShell):**
```powershell
.\db\maintenance.ps1 -Command backup
```

### Restore Database

**Linux/Mac:**
```bash
./db/maintenance.sh restore ./db/backups/backup_20240115_143000.sql.gz
```

**Windows (PowerShell):**
```powershell
.\db\maintenance.ps1 -Command restore -BackupFile ".\db\backups\backup_20240115_143000.sql"
```

### Health Check

**Linux/Mac:**
```bash
./db/maintenance.sh health-check
```

**Windows (PowerShell):**
```powershell
.\db\maintenance.ps1 -Command healthcheck
```

**Output:**
```
✓ Connection OK
✓ Tables: 15
✓ Migrations applied: 3
✓ Movies: 4
✓ Users: 4
✓ Bookings: 2
```

### Cleanup Old Backups

Keeps last 7 days of backups:

**Linux/Mac:**
```bash
./db/maintenance.sh cleanup
```

**Windows (PowerShell):**
```powershell
.\db\maintenance.ps1 -Command cleanup
```

## Production Deployment

### Prerequisites

- PostgreSQL database created (Render, AWS RDS, Supabase, etc.)
- **Internal Database URL** (for Render services)
- Proper credentials configured

### Deployment Checklist

- [ ] Database service created and running
- [ ] Database URL retrieved (use Internal URL for Render)
- [ ] Environment variables set:
  ```
  DATABASE_URL=postgres://user:pass@host:port/database
  DB_AUTO_MIGRATE=true      (first deploy only)
  DB_RUN_SEED=true          (first deploy only)
  NODE_ENV=production
  ```
- [ ] Migrations run successfully (check logs)
- [ ] Health endpoints responding:
  - `/api/health/live` - liveness check
  - `/api/health` - readiness with DB check
- [ ] Admin login verified
- [ ] Backup strategy tested

### Render Deployment

1. **Create PostgreSQL:**
   - Render Dashboard → **New +** → **PostgreSQL**
   - Wait 1-2 minutes for initialization
   - Copy **Internal Database URL**

2. **Add Database URL to Web Service:**
   - Service → **Environment**
   - Add `DATABASE_URL` = Internal URL from step 1
   - Add `DB_AUTO_MIGRATE=true`
   - Add `DB_RUN_SEED=true` (only first deploy)

3. **Deploy:**
   - Commit and push to main branch
   - Render auto-deploys
   - Check **Deployments** tab for migration status

4. **Verify:**
   ```bash
   curl https://your-app.onrender.com/api/health
   curl https://your-app.onrender.com/api/health/live
   ```

5. **After First Deploy:**
   - Update `DB_RUN_SEED=false` in environment
   - Redeploy

### Connection Pooling

Server uses `pg.Pool`:

```javascript
const pool = new Pool({
  max: 10,                    // Max connections
  idleTimeoutMillis: 30000,   // 30 sec idle timeout
  connectionTimeoutMillis: 15000  // 15 sec connection timeout
});
```

For high-concurrency, enable Render's PgBouncer or upgrade instance.

## Monitoring & Performance

### Health Endpoints

```bash
# Liveness (fast, no DB check)
curl https://your-app.com/api/health/live
# {"ok":true,"status":"live","timestamp":"..."}

# Readiness (includes DB latency check)
curl https://your-app.com/api/health
# {
#   "ok": true,
#   "status": "ok",
#   "checks": {
#     "database": {
#       "ok": true,
#       "latencyMs": 2.5
#     }
#   }
# }
```

### Performance Queries

```sql
-- Table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size('public.'||tablename))
FROM pg_tables WHERE schemaname='public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- Slow queries
SELECT query, calls, mean_time FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes ORDER BY idx_scan ASC;
```

## Troubleshooting

### "ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL not running or DATABASE_URL not set

**Solution:**
```bash
# Local: Start database
npm run db:up

# Production: Ensure DATABASE_URL is set correctly
# Use Internal URL for Render services
```

### "relation does not exist"

**Cause:** Migrations haven't run

**Solution:**
```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM schema_migrations;"

# Force migration (if DB_AUTO_MIGRATE=true)
# Restart server: migrations will run on startup
```

### "too many connections"

**Cause:** Connection pool exhausted

**Solution:**
- Increase pool max: `max: 20` in server code
- Upgrade database instance
- Add PgBouncer connection pooling
- Check for connection leaks

### Health check failing

**Cause:** Database latency high or DB unavailable

**Check:**
```bash
# Test connection latency
time psql $DATABASE_URL -c "SELECT 1;"

# Monitor database performance
# Render Dashboard → Database → Insights
```

## Environment Variables

### Required for Production

```
DATABASE_URL=postgres://user:password@host:5432/database
```

### Optional Configuration

```
DB_AUTO_MIGRATE=true      # Run migrations on startup
DB_RUN_SEED=false         # Load demo data (true only on first deploy)
DB_SSL=false              # Enable SSL (enabled by default on managed services)
NODE_ENV=production       # Set to production
```

### Example .env.db (Local)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinemahub
DB_USER=cinemahub
DB_PASSWORD=secure_password_here
BACKUP_DIR=./db/backups
```

## Resources

- **Database Operations**: [docs/DATABASE_OPERATIONS.md](../docs/DATABASE_OPERATIONS.md)
- **PostgreSQL Render**: [docs/POSTGRESQL_RENDER.md](../docs/POSTGRESQL_RENDER.md)
- **Default Credentials**: [docs/DEFAULT_CREDENTIALS.md](../docs/DEFAULT_CREDENTIALS.md)
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **pg (Node.js)**: https://node-postgres.com/

