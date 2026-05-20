-- Set default passwords for seed users
-- Admin@123 -> $2a$10$cCzY2II8DNZCY09fEAFb0OpmFAZAMr7kRNExoMQFqr594wn.bgb5u
-- Staff@123 -> $2a$10$Z2/tKZNPjZQYRsndkQQHleJE2ed.P3EPpVuojN2RN3G/q3JN5PeQm

UPDATE users
SET password_hash = '$2a$10$cCzY2II8DNZCY09fEAFb0OpmFAZAMr7kRNExoMQFqr594wn.bgb5u'
WHERE email = 'admin@cinema.com' AND password_hash IS NULL;

UPDATE users
SET password_hash = '$2a$10$Z2/tKZNPjZQYRsndkQQHleJE2ed.P3EPpVuojN2RN3G/q3JN5PeQm'
WHERE email = 'staff@cinema.com' AND password_hash IS NULL;
