# Database setup for deployment

This project now includes a PostgreSQL schema and seed data for deployment preparation.

## Structure

- `db/migrations/001_init.sql`: full schema, enum types, constraints, indexes.
- `db/migrations/002_seed_user_passwords.sql`: default bcrypt hashes for seeded admin/staff users.
- `db/seed/001_seed.sql`: sample data matching current app constants.
- `docker-compose.db.yml`: local PostgreSQL service for staging-like testing.
- `.env.db.example`: database environment variables template.

## Quick start

1. Create environment file:
   - Copy `.env.db.example` to `.env.db` and adjust values.
2. Start database:
   - `npm run db:up`
3. Check logs:
   - `npm run db:logs`
4. Stop database:
   - `npm run db:down`
5. Stop and remove volume (clean reset):
   - `npm run db:reset`

## Notes

- Migration and seed scripts run automatically only on the first container initialization.
- API server also supports auto migration on startup via `DB_AUTO_MIGRATE=true`.
- If schema changes and you want to re-apply from scratch, run `npm run db:reset` then `npm run db:up`.
- Recommended deploy stack is managed PostgreSQL (e.g., Neon, Supabase, RDS, Cloud SQL) with these SQL scripts applied in CI/CD.
