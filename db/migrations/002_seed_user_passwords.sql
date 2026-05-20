BEGIN;

UPDATE users
SET password_hash = '$2a$10$k6dk5TniUO0TPJw7euaiXOouzodTdrk7BH/CszjFgQi0NT0wYHrlC'
WHERE id = 'U1' AND (password_hash IS NULL OR password_hash = '');

UPDATE users
SET password_hash = '$2a$10$e3ykhcWobnFjoSnJLlAwCuuKT8i7GHBAXIZSgQI/SrS7RKvGUe9K.'
WHERE id = 'U2' AND (password_hash IS NULL OR password_hash = '');

COMMIT;
