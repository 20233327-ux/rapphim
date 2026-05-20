import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'changeme-in-production';
const refreshJwtSecret = process.env.JWT_REFRESH_SECRET || `${jwtSecret}-refresh`;
const webDistDir = path.join(process.cwd(), 'dist');
const startedAt = new Date();
let appVersion = process.env.APP_VERSION || '0.0.0';
let appName = process.env.APP_NAME || 'cinemahub-api';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

app.use(express.json({ limit: '2mb' }));

const RESOURCE_CONFIG = {
  movies: { key: 'movies', idField: 'id' },
  rooms: { key: 'rooms', idField: 'id' },
  showtimes: { key: 'showtimes', idField: 'id' },
  users: { key: 'users', idField: 'id' },
  bookings: { key: 'bookings', idField: 'id' },
  shifts: { key: 'shifts', idField: 'id' },
};

function getResourceConfig(resourceName) {
  return RESOURCE_CONFIG[resourceName] || null;
}

function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      type: 'refresh',
    },
    refreshJwtSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
}

async function listSqlFiles(directoryPath) {
  try {
    const names = await fs.readdir(directoryPath);
    return names
      .filter((name) => name.toLowerCase().endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, absolutePath: path.join(directoryPath, name) }));
  } catch {
    return [];
  }
}

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function runSqlScriptsOnce(files, category) {
  for (const file of files) {
    const migrationKey = `${category}:${file.name}`;
    const exists = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1 LIMIT 1', [migrationKey]);
    if (exists.rowCount > 0) continue;

    const sql = await fs.readFile(file.absolutePath, 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migrationKey]);
    console.log(`Applied ${migrationKey}`);
  }
}

async function runMigrationsOnStartup() {
  await ensureMigrationTable();

  const root = process.cwd();
  const migrationFiles = await listSqlFiles(path.join(root, 'db', 'migrations'));
  const seedFiles = await listSqlFiles(path.join(root, 'db', 'seed'));

  await runSqlScriptsOnce(migrationFiles, 'migration');

  if (process.env.DB_RUN_SEED === 'true') {
    await runSqlScriptsOnce(seedFiles, 'seed');
  }
}

async function loadAppMetadata() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageRaw = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageRaw);

    if (!process.env.APP_VERSION && packageJson.version) {
      appVersion = String(packageJson.version);
    }

    if (!process.env.APP_NAME && packageJson.name) {
      appName = String(packageJson.name);
    }
  } catch {
    // Keep env/default values when package metadata is unavailable.
  }
}

function toDateOnly(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function toIso(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

async function fetchAppData() {
  const [moviesRes, genresRes, actorsRes, roomsRes, showtimesRes, usersRes, bookingsRes, bookingSeatsRes, shiftsRes] = await Promise.all([
    pool.query('SELECT * FROM movies ORDER BY id'),
    pool.query('SELECT movie_id, genre FROM movie_genres ORDER BY movie_id, genre'),
    pool.query('SELECT movie_id, actor_name FROM movie_actors ORDER BY movie_id, actor_name'),
    pool.query('SELECT * FROM rooms ORDER BY id'),
    pool.query('SELECT * FROM showtimes ORDER BY start_time, id'),
    pool.query('SELECT * FROM users ORDER BY id'),
    pool.query('SELECT * FROM bookings ORDER BY created_at DESC, id'),
    pool.query('SELECT booking_id, seat_id FROM booking_seats ORDER BY booking_id, seat_id'),
    pool.query('SELECT * FROM shifts ORDER BY shift_date, id'),
  ]);

  const genresByMovie = new Map();
  for (const row of genresRes.rows) {
    if (!genresByMovie.has(row.movie_id)) genresByMovie.set(row.movie_id, []);
    genresByMovie.get(row.movie_id).push(row.genre);
  }

  const actorsByMovie = new Map();
  for (const row of actorsRes.rows) {
    if (!actorsByMovie.has(row.movie_id)) actorsByMovie.set(row.movie_id, []);
    actorsByMovie.get(row.movie_id).push(row.actor_name);
  }

  const seatsByBooking = new Map();
  for (const row of bookingSeatsRes.rows) {
    if (!seatsByBooking.has(row.booking_id)) seatsByBooking.set(row.booking_id, []);
    seatsByBooking.get(row.booking_id).push(row.seat_id);
  }

  return {
    movies: moviesRes.rows.map((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      duration: row.duration_minutes,
      genre: genresByMovie.get(row.id) || [],
      rating: row.rating,
      posterUrl: row.poster_url,
      trailerUrl: row.trailer_url || undefined,
      director: row.director,
      actors: actorsByMovie.get(row.id) || [],
      releaseDate: toDateOnly(row.release_date),
      endDate: toDateOnly(row.end_date),
      status: row.status,
    })),
    rooms: roomsRes.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      capacity: row.capacity,
      rows: row.rows,
      cols: row.cols,
      type: row.type,
    })),
    showtimes: showtimesRes.rows.map((row) => ({
      id: row.id,
      movieId: row.movie_id,
      roomId: row.room_id,
      startTime: toIso(row.start_time),
      endTime: toIso(row.end_time),
      basePrice: Number(row.base_price),
    })),
    users: usersRes.rows.map((row) => ({
      id: row.id,
      code: row.code || undefined,
      name: row.name,
      email: row.email,
      phone: row.phone,
      username: row.username || undefined,
      role: row.role,
      points: row.points,
      address: row.address || undefined,
    })),
    bookings: bookingsRes.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      showtimeId: row.showtime_id,
      movieId: row.movie_id,
      seatIds: seatsByBooking.get(row.id) || [],
      totalPrice: Number(row.total_price),
      paymentMethod: row.payment_method,
      status: row.status,
      createdAt: toIso(row.created_at),
      qrCode: row.qr_code || undefined,
    })),
    shifts: shiftsRes.rows.map((row) => ({
      id: row.id,
      staffId: row.staff_id,
      type: row.type,
      date: toDateOnly(row.shift_date),
      revenue: Number(row.revenue),
      status: row.status,
    })),
  };
}

async function replaceAllData(payload) {
  const client = await pool.connect();
  try {
    const showtimeMovieMap = new Map((payload.showtimes || []).map((showtime) => [showtime.id, showtime.movieId]));

    await client.query('BEGIN');

    await client.query('DELETE FROM booking_seats');
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM shifts');
    await client.query('DELETE FROM showtimes');
    await client.query('DELETE FROM movie_genres');
    await client.query('DELETE FROM movie_actors');
    await client.query('DELETE FROM rooms');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM movies');

    for (const movie of payload.movies || []) {
      await client.query(
        `INSERT INTO movies (
          id, code, title, description, duration_minutes, rating, poster_url, trailer_url,
          director, release_date, end_date, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          movie.id,
          movie.code,
          movie.title,
          movie.description,
          movie.duration,
          movie.rating,
          movie.posterUrl,
          movie.trailerUrl || null,
          movie.director,
          movie.releaseDate,
          movie.endDate,
          movie.status,
        ],
      );

      for (const genre of movie.genre || []) {
        await client.query('INSERT INTO movie_genres (movie_id, genre) VALUES ($1,$2)', [movie.id, genre]);
      }

      for (const actor of movie.actors || []) {
        await client.query('INSERT INTO movie_actors (movie_id, actor_name) VALUES ($1,$2)', [movie.id, actor]);
      }
    }

    for (const room of payload.rooms || []) {
      await client.query(
        'INSERT INTO rooms (id, code, name, capacity, rows, cols, type) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [room.id, room.code, room.name, room.capacity, room.rows, room.cols, room.type],
      );
    }

    for (const showtime of payload.showtimes || []) {
      await client.query(
        'INSERT INTO showtimes (id, movie_id, room_id, start_time, end_time, base_price) VALUES ($1,$2,$3,$4,$5,$6)',
        [showtime.id, showtime.movieId, showtime.roomId, showtime.startTime, showtime.endTime, showtime.basePrice],
      );
    }

    for (const user of payload.users || []) {
      await client.query(
        'INSERT INTO users (id, code, name, email, phone, username, role, points, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [
          user.id,
          user.code || null,
          user.name,
          user.email,
          user.phone,
          user.username || null,
          user.role,
          user.points || 0,
          user.address || null,
        ],
      );
    }

    for (const booking of payload.bookings || []) {
      const movieId = booking.movieId || showtimeMovieMap.get(booking.showtimeId);
      if (!movieId) {
        throw new Error(`Booking ${booking.id} missing movieId and cannot infer from showtimeId ${booking.showtimeId}`);
      }

      await client.query(
        `INSERT INTO bookings (
          id, user_id, showtime_id, movie_id, total_price, payment_method, status, created_at, qr_code
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          booking.id,
          booking.userId,
          booking.showtimeId,
          movieId,
          booking.totalPrice,
          booking.paymentMethod,
          booking.status,
          booking.createdAt,
          booking.qrCode || null,
        ],
      );

      for (const seatId of booking.seatIds || []) {
        await client.query('INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1,$2)', [booking.id, seatId]);
      }
    }

    for (const shift of payload.shifts || []) {
      await client.query(
        'INSERT INTO shifts (id, staff_id, type, shift_date, revenue, status) VALUES ($1,$2,$3,$4,$5,$6)',
        [shift.id, shift.staffId, shift.type, shift.date, shift.revenue, shift.status],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

app.get('/api/health/live', (_req, res) => {
  res.json({
    ok: true,
    status: 'live',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (_req, res) => {
  const timestamp = new Date().toISOString();
  const dbStarted = process.hrtime.bigint();
  let dbOk = false;
  let dbError = null;

  try {
    await pool.query('SELECT 1');
    dbOk = true;
  } catch (error) {
    dbError = error.message;
  }

  const dbLatencyMs = Number(process.hrtime.bigint() - dbStarted) / 1_000_000;
  const ok = dbOk;

  const payload = {
    ok,
    status: ok ? 'ok' : 'degraded',
    service: 'cinemahub-api',
    version: appVersion,
    environment: process.env.NODE_ENV || 'development',
    startedAt: startedAt.toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp,
    checks: {
      database: {
        ok: dbOk,
        latencyMs: Number(dbLatencyMs.toFixed(2)),
        ...(dbError ? { error: dbError } : {}),
      },
    },
  };

  return res.status(ok ? 200 : 503).json(payload);
});

app.get('/api/version', (_req, res) => {
  res.json({
    service: appName,
    version: appVersion,
    environment: process.env.NODE_ENV || 'development',
    commit: process.env.RENDER_GIT_COMMIT || process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT || null,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier and password are required' });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role, password_hash
      FROM users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(COALESCE(username, '')) = LOWER($1)
      LIMIT 1
      `,
      [identifier],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    let valid = false;

    if (user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    } else if (process.env.AUTH_ALLOW_PLAINTEXT_DEV === 'true') {
      valid = password === (process.env.AUTH_DEV_PASSWORD || '123456');
    }

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createAuthToken(user);
    const refreshToken = createRefreshToken(user);
    return res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, refreshJwtSecret);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const result = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [payload.sub],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid refresh token user' });
    }

    const user = result.rows[0];
    const newAccessToken = createAuthToken(user);
    const newRefreshToken = createRefreshToken(user);

    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token expired or invalid', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.sub],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load current user', error: error.message });
  }
});

app.get('/api/data', async (_req, res) => {
  try {
    const data = await fetchAppData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load data from database', error: error.message });
  }
});

app.put('/api/data', async (req, res) => {
  try {
    await replaceAllData(req.body || {});
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save data to database', error: error.message });
  }
});

app.get('/api/resources/:resource', async (req, res) => {
  const config = getResourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  try {
    const data = await fetchAppData();
    return res.json(data[config.key]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load resource', error: error.message });
  }
});

app.post('/api/resources/:resource', authenticateToken, async (req, res) => {
  const config = getResourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  try {
    const data = await fetchAppData();
    const currentList = data[config.key] || [];
    const incoming = req.body || {};

    if (!incoming[config.idField]) {
      return res.status(400).json({ message: `Missing ${config.idField}` });
    }

    const exists = currentList.some((item) => item[config.idField] === incoming[config.idField]);
    if (exists) {
      return res.status(409).json({ message: 'Resource id already exists' });
    }

    data[config.key] = [...currentList, incoming];
    await replaceAllData(data);
    return res.status(201).json(incoming);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
});

app.put('/api/resources/:resource/:id', authenticateToken, async (req, res) => {
  const config = getResourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  try {
    const data = await fetchAppData();
    const currentList = data[config.key] || [];
    const index = currentList.findIndex((item) => item[config.idField] === req.params.id);

    if (index < 0) {
      return res.status(404).json({ message: 'Resource id not found' });
    }

    const updated = {
      ...currentList[index],
      ...req.body,
      [config.idField]: req.params.id,
    };

    const nextList = [...currentList];
    nextList[index] = updated;
    data[config.key] = nextList;

    await replaceAllData(data);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update resource', error: error.message });
  }
});

app.delete('/api/resources/:resource/:id', authenticateToken, async (req, res) => {
  const config = getResourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  try {
    const data = await fetchAppData();
    const currentList = data[config.key] || [];
    const nextList = currentList.filter((item) => item[config.idField] !== req.params.id);

    if (nextList.length === currentList.length) {
      return res.status(404).json({ message: 'Resource id not found' });
    }

    data[config.key] = nextList;
    await replaceAllData(data);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete resource', error: error.message });
  }
});

async function configureStaticHosting() {
  try {
    await fs.access(path.join(webDistDir, 'index.html'));

    app.use(express.static(webDistDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }

      return res.sendFile(path.join(webDistDir, 'index.html'));
    });

    console.log(`Serving web build from ${webDistDir}`);
  } catch {
    console.log('No dist build found. API-only mode is enabled.');
  }
}

async function startServer() {
  try {
    await loadAppMetadata();

    // Only run migrations if DATABASE_URL is configured
    if (process.env.DATABASE_URL && process.env.DB_AUTO_MIGRATE !== 'false') {
      try {
        await runMigrationsOnStartup();
        console.log('Database migrations completed successfully');
      } catch (error) {
        console.error('Database migration failed:', error.message);
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
        // In development, log but continue
        console.warn('Continuing startup without database (dev mode)');
      }
    } else if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not set. Running in API-only mode without database.');
    }

    await configureStaticHosting();

    app.listen(port, () => {
      console.log(`CinemaHub API is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error);
    process.exit(1);
  }
}

startServer();
