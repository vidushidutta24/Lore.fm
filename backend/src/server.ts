import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';

// Session type augmentation
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    oauthState?: string;
    codeVerifier?: string;
  }
}

import authRouter from './routes/auth';
import meRouter from './routes/me';
import analyticsRouter from './routes/analytics';
import recommendationsRouter from './routes/recommendations';
import storyRouter from './routes/story';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './services/prisma';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  FRONTEND_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if in allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Session ──────────────────────────────────────────────────────────────────

// Use SQLite session store for development
// In production, switch to connect-pg-simple with PostgreSQL
let sessionStore;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQLiteStore = require('connect-sqlite3')(session);
  sessionStore = new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '..'),
  });
} catch {
  console.warn('[Session] SQLite session store not available, using memory store (dev only)');
  sessionStore = undefined;
}

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,      // Cannot be accessed by JS
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/story', storyRouter);


// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  // Test database connection
  try {
    await prisma.$connect();
    console.log('[DB] Database connected');
  } catch (err) {
    console.error('[DB] Database connection failed:', (err as Error).message);
    console.error('[DB] Make sure you have run: npm run db:push');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Frontend: ${FRONTEND_URL}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
