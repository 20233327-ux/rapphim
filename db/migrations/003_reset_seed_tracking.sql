-- Reset seed tracking to allow seeds to run again
DELETE FROM schema_migrations WHERE name LIKE 'seed:%';
