BEGIN;

INSERT INTO movies (
  id, code, title, description, duration_minutes, rating, poster_url, trailer_url,
  director, release_date, end_date, status
) VALUES
  (
    '1', 'M001', 'Dune: Part Two',
    'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    166, 'PG-13',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMccj10b-BnIPz19MGuDnKIhFLZetZEhjrCw&s',
    'https://www.youtube.com/watch?v=Way9Dexny3w',
    'Denis Villeneuve', '2024-03-01', '2024-05-01', 'now-showing'
  ),
  (
    '2', 'M002', 'Oppenheimer',
    'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    180, 'R',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fkroPNHFGum8l3It6BZYkQ8eRQ1MJqv7uw&s',
    'https://www.youtube.com/watch?v=uYPbbksJxIg',
    'Christopher Nolan', '2023-07-21', '2023-10-21', 'stopped'
  ),
  (
    '3', 'M003', 'Spider-Man: Across the Spider-Verse',
    'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    140, 'PG',
    'https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg',
    'https://www.youtube.com/watch?v=shW9i6k8cB0',
    'Joaquim Dos Santos', '2023-06-02', '2023-08-02', 'stopped'
  ),
  (
    '4', 'M004', 'Godzilla x Kong: The New Empire',
    'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island''s mysteries.',
    115, 'PG-13',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkRpqALiApXP9okiRMVWwQoCGeGHA2kEUjJA&s',
    'https://www.youtube.com/watch?v=lV1OOlGwExM',
    'Adam Wingard', '2024-03-29', '2024-06-29', 'now-showing'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO movie_genres (movie_id, genre) VALUES
  ('1', 'Action'), ('1', 'Adventure'), ('1', 'Sci-Fi'),
  ('2', 'Biography'), ('2', 'Drama'), ('2', 'History'),
  ('3', 'Animation'), ('3', 'Action'), ('3', 'Adventure'),
  ('4', 'Action'), ('4', 'Adventure'), ('4', 'Sci-Fi')
ON CONFLICT DO NOTHING;

INSERT INTO movie_actors (movie_id, actor_name) VALUES
  ('1', 'Timothée Chalamet'), ('1', 'Zendaya'), ('1', 'Rebecca Ferguson'),
  ('2', 'Cillian Murphy'), ('2', 'Emily Blunt'), ('2', 'Matt Damon'),
  ('3', 'Shameik Moore'), ('3', 'Hailee Steinfeld'), ('3', 'Oscar Isaac'),
  ('4', 'Rebecca Hall'), ('4', 'Brian Tyree Henry'), ('4', 'Dan Stevens')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (id, code, name, capacity, rows, cols, type) VALUES
  ('R1', 'P01', 'Cinema 1', 100, 10, 10, '2D'),
  ('R2', 'P02', 'Cinema 2', 80, 8, 10, '3D'),
  ('R3', 'P03', 'IMAX Theatre', 150, 10, 15, 'IMAX'),
  ('R4', 'P04', '4DX Cinema', 64, 8, 8, '4DX')
ON CONFLICT (id) DO NOTHING;

INSERT INTO showtimes (id, movie_id, room_id, start_time, end_time, base_price) VALUES
  ('S1', '1', 'R3', '2024-04-10T14:00:00+07:00', '2024-04-10T16:46:00+07:00', 150000),
  ('S2', '1', 'R3', '2024-04-10T18:00:00+07:00', '2024-04-10T20:46:00+07:00', 150000),
  ('S3', '4', 'R1', '2024-04-10T15:00:00+07:00', '2024-04-10T16:55:00+07:00', 120000),
  ('S4', '4', 'R2', '2024-04-10T16:30:00+07:00', '2024-04-10T18:25:00+07:00', 100000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, code, name, email, phone, role, points, address) VALUES
  ('U1', 'NV001', 'Admin User', 'admin@cinema.com', '0901234567', 'admin', 0, '123 Main St'),
  ('U2', 'NV002', 'Staff Member', 'staff@cinema.com', '0907654321', 'staff', 0, '456 Side St'),
  ('U3', NULL, 'John Doe', 'john@example.com', '0912345678', 'customer', 150, NULL),
  ('U4', NULL, 'Jane Smith', 'jane@example.com', '0987654321', 'customer', 50, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, user_id, showtime_id, movie_id, total_price, payment_method, status, created_at, qr_code
) VALUES
  ('B1', 'U1', 'S1', '1', 300000, 'vnpay', 'completed', '2024-04-09T10:00:00+07:00', 'CH-B1-QR'),
  ('B2', 'U1', 'S3', '4', 120000, 'momo', 'completed', '2024-04-08T15:30:00+07:00', 'CH-B2-QR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_seats (booking_id, seat_id) VALUES
  ('B1', 'A1'), ('B1', 'A2'), ('B2', 'C5')
ON CONFLICT DO NOTHING;

INSERT INTO shifts (id, staff_id, type, shift_date, revenue, status) VALUES
  ('SH1', 'U2', 'morning', '2024-04-10', 5400000, 'completed'),
  ('SH2', 'U2', 'afternoon', '2024-04-10', 0, 'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO promotions (id, code, description, discount_percent, valid_until) VALUES
  ('P1', 'WELCOME50', 'Giảm 50% cho khách hàng mới', 50, '2024-12-31'),
  ('P2', 'WEEKEND10', 'Giảm 10% cho ngày cuối tuần', 10, '2024-12-31')
ON CONFLICT (id) DO NOTHING;

COMMIT;
