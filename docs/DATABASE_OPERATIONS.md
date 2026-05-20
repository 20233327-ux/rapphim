# Database Operations Guide

Comprehensive guide for CinemaHub database setup, maintenance, and deployment.

## Quick Start

### Local Development with Docker

1. Start PostgreSQL container:
   ```bash
   npm run db:up
   ```

2. View database logs:
   ```bash
   npm run db:logs
   ```

3. Stop database:
   ```bash
   npm run db:down
   ```

4. Reset database (delete all data):
   ```bash
   npm run db:reset
   ```

## Database Schema

### Core Tables

- **movies** - Film information and metadata
- **movie_genres** - Many-to-many mapping for movie genres
- **movie_actors** - Many-to-many mapping for movie cast
- **rooms** - Cinema auditoriums with capacity and type
- **showtimes** - Movie showings with pricing
- **users** - Staff and customer accounts
- **bookings** - Ticket reservations
- **booking_seats** - Many-to-many mapping for booked seats
- **shifts** - Staff shift assignments and revenue tracking
- **promotions** - Discount codes and offers

### Supporting Tables (Added in migrations)

- **schema_migrations** - Tracks applied migrations (system)
- **audit_logs** - Audit trail for data changes
- **sessions** - User login session tracking
- **daily_metrics** - Business intelligence and analytics

## Database Initialization

### Migration Process

1. **First run** (`001_init.sql`):
   - Creates ENUM types (movie_status, room_type, user_role, etc.)
   - Creates all core tables with constraints and indexes
   - Sets up foreign key relationships

2. **Default passwords** (`002_set_default_passwords.sql`):
   - Sets bcrypt-hashed passwords for admin and staff accounts
   - Runs only if `DB_RUN_SEED=true`

3. **Enhanced features** (`003_enhance_database.sql`):
   - Adds audit logging table
   - Creates performance indexes
   - Adds sessions and metrics tables

### Seed Data

Seed data is applied in this order (only if `DB_RUN_SEED=true`):

1. Movies and genres
2. Rooms and seats
3. Showtimes
4. Demo users (admin, staff, customers)
5. Demo bookings
6. Demo shifts

**Location**: `db/seed/001_seed.sql`

## Environment Variables

### Required for Production

- **DATABASE_URL** - Full connection string (e.g., `postgres://user:password@host:port/database`)
  - For Render: Use **Internal Database URL**
  - Format: `postgres://user:password@private-host:5432/database`

### Optional Configuration

- **DB_AUTO_MIGRATE** (default: `true`) - Run migrations on startup
- **DB_RUN_SEED** (default: `false`) - Run seed data on startup (WARNING: only on first deploy)
- **DB_SSL** (default: `false`) - Enable SSL for database connection

### Development Environment

Create `.env.db`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinemahub
DB_USER=cinemahub
DB_PASSWORD=your_secure_password
```

## Maintenance & Backups

### Using Maintenance Scripts

#### Linux/macOS

```bash
# Backup database
./db/maintenance.sh backup

# Restore from backup
./db/maintenance.sh restore ./db/backups/backup_20240101_120000.sql.gz

# Health check
./db/maintenance.sh health-check

# Cleanup old backups (keep last 7 days)
./db/maintenance.sh cleanup
```

#### Windows (PowerShell)

```powershell
# Backup database
.\db\maintenance.ps1 -Command backup

# Restore from backup
.\db\maintenance.ps1 -Command restore -BackupFile ".\db\backups\backup_20240101_120000.sql"

# Health check
.\db\maintenance.ps1 -Command healthcheck

# Cleanup old backups
.\db\maintenance.ps1 -Command cleanup
```

### Manual Backup with pg_dump

```bash
# Full backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > backup.sql

# Compressed backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME | gzip > backup.sql.gz

# With specific schema
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --schema-only > schema.sql
```

### Manual Restore

```bash
# Restore from SQL file
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup.sql

# Restore from compressed file
gunzip -c backup.sql.gz | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

## Data Integrity

### Constraints

All tables include appropriate constraints:

- **Primary Keys** - Unique identifier for each record
- **Foreign Keys** - Referential integrity between tables
  - `ON DELETE CASCADE` for dependent records (e.g., movie genres when movie deleted)
  - `ON DELETE RESTRICT` for important references (e.g., cannot delete movie with bookings)
- **CHECK Constraints** - Data validation (e.g., price >= 0, end_date >= release_date)
- **UNIQUE Constraints** - Prevent duplicates (e.g., movie code, user email)

### Indexes

Performance indexes created on:

- **Showtimes**: movie_id, room_id, start_time
- **Bookings**: user_id, showtime_id, status, movie_id, created_at
- **Shifts**: staff_id, shift_date, status
- **Movies**: status, release_date
- **Users**: role, email
- **Rooms**: type, capacity

## Connection Pooling

For production environments, configure connection pooling:

### Node.js with pg (default)

The server uses `pg.Pool` with defaults:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ... individual connection params
});
```

**Recommended for Render**:
- Min connections: 2
- Max connections: 10 (adjust based on load)
- Idle timeout: 30 seconds
- Connection timeout: 15 seconds

## Deployment Checklist

- [ ] PostgreSQL database created on hosting platform (Render, AWS RDS, etc.)
- [ ] DATABASE_URL environment variable set to **Internal Database URL**
- [ ] DB_AUTO_MIGRATE set to `true` for first deployment
- [ ] DB_RUN_SEED set appropriately (true for initial setup, false for subsequent deploys)
- [ ] Migrations run successfully (check server logs for "Applied migration" messages)
- [ ] Health endpoints responding:
  - `/api/health/live` - liveness check (no DB)
  - `/api/health` - readiness with DB latency
- [ ] Admin account login working: admin@cinema.com / Admin@123
- [ ] Backup strategy documented and tested
- [ ] Database performance monitored

## Monitoring & Performance

### Health Checks

Server includes built-in health endpoints:

```bash
# Liveness probe (for load balancers)
curl https://your-app.onrender.com/api/health/live

# Readiness probe (includes DB check)
curl https://your-app.onrender.com/api/health
```

### Query Performance

Monitor slow queries with:

```sql
-- Enable query logging (PostgreSQL)
ALTER DATABASE cinemahub SET log_statement = 'all';
ALTER DATABASE cinemahub SET log_min_duration_statement = 1000; -- log queries > 1s

-- View running queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

## Troubleshooting

### "ECONNREFUSED 127.0.0.1:5432"

**Cause**: PostgreSQL not running or DATABASE_URL not set

**Solution**:
1. Ensure PostgreSQL service is running
2. Check DATABASE_URL environment variable is set
3. Use correct Internal URL for Render deployments
4. Test connection: `psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME`

### "relation does not exist"

**Cause**: Migrations haven't run

**Solution**:
1. Check `schema_migrations` table exists: `SELECT * FROM schema_migrations;`
2. Check server logs for migration errors
3. Set `DB_AUTO_MIGRATE=true` and restart server
4. Verify `db/migrations/` files exist and are readable

### Migration Failed

**Solution**:
1. Check current schema: `\dt` in psql
2. Check applied migrations: `SELECT * FROM schema_migrations;`
3. Review error logs for specific issues
4. If corrupted, may need to restore from backup

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg npm package](https://node-postgres.com/)
- [Render Database Docs](https://render.com/docs/databases)
- [Database Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
