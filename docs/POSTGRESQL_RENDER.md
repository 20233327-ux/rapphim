# PostgreSQL Configuration for Render Deployment

This guide covers optimizing PostgreSQL on Render for CinemaHub.

## Render PostgreSQL Instance Types

### Development (Free Tier - Deprecated)
- **Note**: Render discontinued free PostgreSQL tier
- Must upgrade to **Standard Plan** (~$7-15/month)

### Standard Single-Node
- **CPU**: Shared cores
- **Memory**: 1 GB
- **Storage**: 10 GB (auto-scaling available)
- **Use case**: Development, small production apps (<1000 concurrent users)
- **Price**: ~$15/month

### Standard High-RAM
- **CPU**: More cores
- **Memory**: 4-16 GB
- **Storage**: 50-200 GB
- **Use case**: Production with moderate traffic
- **Price**: ~$30-100/month

## Database Creation Steps (Render Dashboard)

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `cinemahub-db` or similar
   - **Database**: `cinemahub`
   - **User**: `cinemahub`
   - **Region**: Same as your web service
   - **Instance Type**: Standard Single-Node (default)
4. Click **Create Database**
5. Wait for initialization (1-2 minutes)

## Getting Connection Details

In Render Dashboard → Your PostgreSQL Service:

1. Go to **Info** tab
2. Copy **Internal Database URL**:
   ```
   postgres://username:password@hostname:port/database
   ```
   - Use this for **services within Render**
   - Never use External URL for Render-to-Render connections

3. Connection details are also in **Connections** section

## Environment Variable Setup

Add to your Render Web Service environment:

```
DATABASE_URL=postgres://cinemahub:PASSWORD@dpg-xxxxx.postgres.render.com:5432/cinemahub
DB_AUTO_MIGRATE=true
DB_RUN_SEED=false
```

### Initial Deployment

**First deployment** (`DB_RUN_SEED=true` is optional):

```
DB_AUTO_MIGRATE=true
DB_RUN_SEED=true
```

This will:
1. Create all tables via migrations
2. Load sample data and default users
3. Set up admin account (admin@cinema.com / Admin@123)

**Subsequent deployments** (`DB_RUN_SEED=false`):

```
DB_AUTO_MIGRATE=true
DB_RUN_SEED=false
```

## Performance Tuning for Render PostgreSQL

### Connection Pooling

Render PostgreSQL has connection limits. Configure pooling in your app:

**In server/index.js** (already configured):

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,           // Max connections in pool
  idleTimeoutMillis: 30000,  // 30 sec
  connectionTimeoutMillis: 15000  // 15 sec
});
```

**For high-concurrency apps, consider PgBouncer**:

Render Standard plans include PgBouncer connection pooling:
- Enable in database settings
- Use pool mode: `transaction` for web apps
- Connection limit: typically 20-50 depending on plan

### Query Optimization

Monitor slow queries on Render:

1. Database → **Insights** tab (if available)
2. Check execution time
3. Review indexes are being used

Common queries to optimize:

```sql
-- Get total bookings per movie
SELECT movie_id, COUNT(*) as booking_count
FROM bookings
GROUP BY movie_id
ORDER BY booking_count DESC;

-- Find peak booking times
SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as bookings
FROM bookings
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;

-- Check disk usage
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Backup Strategy

### Automated Backups

Render provides:
- **Automated daily backups** retained for 7 days
- Access in database dashboard → **Backups**

### Manual Backups

Create manual backups:

1. Database dashboard → **Backups** tab
2. Click **Create Backup**
3. Wait for completion
4. Download if needed

### Backup Retention

- **Free retention**: 7 days (automatic)
- **Extended retention**: Available with premium backups

## Monitoring & Maintenance

### Database Metrics

Monitor in Render dashboard:

1. **CPU Usage** - Alert if >80%
2. **Memory Usage** - Alert if >85%
3. **Connections** - Monitor active connections
4. **Storage** - Alert if >90%

### Health Checks

Regular health checks in your app:

```bash
# Check database connectivity
curl https://your-app.onrender.com/api/health

# Response example:
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

### Scaling Decisions

Consider upgrade if:
- **CPU consistently >70%** - Add resources
- **Memory consistently >80%** - Add memory
- **Connection pool full** - Increase instance size
- **Storage >80%** - Increase storage or clean old data

## Security

### SSL Connection

Database connections use SSL by default on Render.

In your connection:
```javascript
ssl: { rejectUnauthorized: false }  // Already configured
```

### Access Control

- Database only accessible from Render services
- No direct internet access
- Password-protected connections

### Credentials

- Store DATABASE_URL in **Render Environment**
- Never commit to git
- Rotate passwords quarterly

## Troubleshooting

### Connection Issues

**Error**: "ECONNREFUSED"

1. Ensure database is in **Available** state
2. Check DATABASE_URL is set correctly
3. Use **Internal URL**, not External
4. Verify region matches web service

**Error**: "too many connections"

1. Increase max connections in pool config
2. Upgrade database instance
3. Add PgBouncer connection pooling
4. Review for connection leaks

### Performance Issues

**Slow queries**:

1. Add appropriate indexes (already configured)
2. Review query execution plans: `EXPLAIN ANALYZE`
3. Consider caching layer for read-heavy queries

**High CPU/Memory**:

1. Check for runaway queries
2. Upgrade instance type
3. Archive old data (bookings >1 year)

### Data Issues

**Migrations failed**:

1. Check server logs for errors
2. Connect directly: `psql $DATABASE_URL`
3. Check `schema_migrations` table
4. Manually apply failed migration if needed

**Corrupted data**:

1. Use automated backup to restore
2. Or manual backup if available
3. Contact Render support if needed

## Cost Optimization

### Estimate Monthly Costs

- **Standard Single-Node**: ~$15/month (base)
- **High-traffic surcharges**: Based on data transfer
- **Automated backups**: Included
- **Premium backups**: Extra cost

### Reducing Costs

1. **Archive old bookings** - Move to archive table
2. **Optimize storage** - Vacuum tables regularly
3. **Monitor usage** - Alert on unexpected growth
4. **Consider shared resources** for dev/staging

## Maintenance Tasks

### Weekly

- Review database health metrics
- Check backup status
- Monitor connection pool usage

### Monthly

- Analyze query performance
- Update statistics: `ANALYZE;`
- Review slow query logs

### Quarterly

- Full backup download
- Restore test to verify backups
- Update security credentials
- Review growth projections

## Resources

- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [AWS RDS Alternative](https://aws.amazon.com/rds/postgresql/) - if more resources needed
