BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movie_status') THEN
    CREATE TYPE movie_status AS ENUM ('now-showing', 'coming-soon', 'stopped');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
    CREATE TYPE room_type AS ENUM ('2D', '3D', 'IMAX', '4DX');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'customer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_type') THEN
    CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'evening');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('vnpay', 'momo', 'credit-card', 'cash');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_status') THEN
    CREATE TYPE shift_status AS ENUM ('scheduled', 'completed', 'absent');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  rating TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  trailer_url TEXT,
  director TEXT NOT NULL,
  release_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status movie_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= release_date)
);

CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  genre TEXT NOT NULL,
  PRIMARY KEY (movie_id, genre)
);

CREATE TABLE IF NOT EXISTS movie_actors (
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  PRIMARY KEY (movie_id, actor_name)
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  rows INTEGER NOT NULL CHECK (rows > 0),
  cols INTEGER NOT NULL CHECK (cols > 0),
  type room_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showtimes (
  id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  base_price BIGINT NOT NULL CHECK (base_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT,
  username TEXT UNIQUE,
  role user_role NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  showtime_id TEXT NOT NULL REFERENCES showtimes(id) ON DELETE RESTRICT,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  total_price BIGINT NOT NULL CHECK (total_price >= 0),
  payment_method payment_method NOT NULL,
  status booking_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  qr_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_seats (
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL,
  PRIMARY KEY (booking_id, seat_id)
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type shift_type NOT NULL,
  shift_date DATE NOT NULL,
  revenue BIGINT NOT NULL DEFAULT 0 CHECK (revenue >= 0),
  status shift_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  valid_until DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showtimes_movie_id ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_room_id ON showtimes(room_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_start_time ON showtimes(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_id ON bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON shifts(shift_date);

COMMIT;
