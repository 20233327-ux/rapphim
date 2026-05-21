-- Cleanup old seed data before re-running seeds
-- Delete in correct order due to foreign key constraints

DELETE FROM booking_seats WHERE booking_id IN (SELECT id FROM bookings WHERE id LIKE 'B%');
DELETE FROM bookings WHERE id LIKE 'B%';
DELETE FROM shifts WHERE id LIKE 'SH%';
DELETE FROM showtimes WHERE id LIKE 'S%';
DELETE FROM rooms WHERE id LIKE 'R%';
DELETE FROM movie_actors WHERE movie_id LIKE 'M%';
DELETE FROM movie_genres WHERE movie_id LIKE 'M%';
DELETE FROM movies WHERE id LIKE 'M%';
DELETE FROM users WHERE id IN ('U1', 'U2', 'U3', 'U4');
DELETE FROM promotions WHERE id LIKE 'P%';
