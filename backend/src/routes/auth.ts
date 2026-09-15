import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { exchangeCodeForTokens } from '../services/spotify';
import { prisma } from '../services/prisma';

const router = Router();

const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com/authorize';

// Required scopes for Phase 1 MVP
const SCOPES = [
  'user-read-private',            // Profile info
  'user-read-email',              // Email (optional but useful for profile)
  'user-top-read',                // Top artists and tracks
  'user-read-recently-played',    // Recently played tracks
  'user-read-currently-playing',  // Currently playing (Premium)
  'user-read-playback-state',     // Playback state (Premium)
].join(' ');

// In-memory state tracking to ensure OAuth flow succeeds regardless of localhost vs 127.0.0.1 domain mismatches
interface OAuthStateData {
  codeVerifier: string;
  frontendUrl: string;
  createdAt: number;
}

const oauthStateMap = new Map<string, OAuthStateData>();
const tempExchangeTokens = new Map<string, { userId: string; expiresAt: number }>();

// Clean up stale states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of oauthStateMap.entries()) {
    if (now - val.createdAt > 10 * 60 * 1000) oauthStateMap.delete(key);
  }
  for (const [key, val] of tempExchangeTokens.entries()) {
    if (now > val.expiresAt) tempExchangeTokens.delete(key);
  }
}, 5 * 60 * 1000);

// ─── PKCE Helpers ─────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ─── GET /auth/spotify — Initiate OAuth PKCE flow ────────────────────────────

router.get('/spotify', (req: Request, res: Response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Spotify credentials are not configured on the server.',
    });
    return;
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Detect initiating frontend
  const referer = req.headers.referer;
  let initiatingFrontend = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  if (referer) {
    try {
      const parsed = new URL(referer);
      initiatingFrontend = `${parsed.protocol}//${parsed.host}`;
    } catch {}
  }

  // Store in memory map
  oauthStateMap.set(state, {
    codeVerifier,
    frontendUrl: initiatingFrontend,
    createdAt: Date.now(),
  });

  // Also store in session if available
  if (req.session) {
    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  res.redirect(`${SPOTIFY_AUTH_BASE}?${params.toString()}`);
});

// ─── GET /auth/spotify/callback — Handle Spotify callback ────────────────────

router.get('/spotify/callback', async (req: Request, res: Response) => {
  const defaultFrontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const { code, state, error } = req.query as Record<string, string>;

  // User denied access
  if (error) {
    console.error(`[Auth] Spotify authorization denied: ${error}`);
    res.redirect(`${defaultFrontendUrl}?error=access_denied`);
    return;
  }

  // Check state against memory map first, fallback to session
  const stateData = state ? oauthStateMap.get(state) : undefined;
  const codeVerifier = stateData?.codeVerifier ?? req.session?.codeVerifier;
  const targetFrontend = stateData?.frontendUrl ?? defaultFrontendUrl;

  if (state && stateData) {
    oauthStateMap.delete(state);
  }

  if (!code || !codeVerifier || !redirectUri) {
    console.error('[Auth] OAuth state mismatch or missing verifier');
    res.redirect(`${targetFrontend}?error=state_mismatch`);
    return;
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Fetch user profile with the new access token
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      throw new Error('Failed to fetch Spotify profile after token exchange');
    }

    const profile = await profileRes.json() as {
      id: string;
      display_name: string;
      email?: string;
      images?: { url: string }[];
      country?: string;
      product?: string;
    };

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { spotifyId: profile.id },
      create: {
        spotifyId: profile.id,
        displayName: profile.display_name ?? profile.id,
        email: profile.email ?? null,
        imageUrl: profile.images?.[0]?.url ?? null,
        country: profile.country ?? null,
        product: profile.product ?? null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? '',
        tokenExpiry,
      },
      update: {
        displayName: profile.display_name ?? profile.id,
        email: profile.email ?? null,
        imageUrl: profile.images?.[0]?.url ?? null,
        country: profile.country ?? null,
        product: profile.product ?? null,
        accessToken: tokens.access_token,
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
        tokenExpiry,
      },
    });

    // Set session directly for current origin
    if (req.session) {
      req.session.userId = user.id;
    }

    // Generate a 60-second one-time exchange token so frontend on any origin can establish its own session
    const exchangeToken = crypto.randomBytes(32).toString('hex');
    tempExchangeTokens.set(exchangeToken, {
      userId: user.id,
      expiresAt: Date.now() + 60 * 1000,
    });

    res.redirect(`${targetFrontend}?auth_token=${exchangeToken}`);
  } catch (err) {
    console.error('[Auth] Token exchange failed:', (err as Error).message);
    res.redirect(`${targetFrontend}?error=auth_failed`);
  }
});

// ─── POST /auth/exchange — Exchange one-time auth_token for session ───────────

router.post('/exchange', async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };

  if (!token) {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  const tokenData = tempExchangeTokens.get(token);
  if (!tokenData || Date.now() > tokenData.expiresAt) {
    tempExchangeTokens.delete(token);
    res.status(401).json({ error: 'Token expired or invalid' });
    return;
  }

  tempExchangeTokens.delete(token);

  const user = await prisma.user.findUnique({
    where: { id: tokenData.userId },
    select: {
      id: true,
      spotifyId: true,
      displayName: true,
      imageUrl: true,
      product: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  req.session.userId = user.id;
  res.json({ authenticated: true, user });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Session destroy error:', err.message);
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// ─── GET /auth/status — Check auth state ─────────────────────────────────────

router.get('/status', async (req: Request, res: Response) => {
  if (!req.session?.userId) {
    res.json({ authenticated: false });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        spotifyId: true,
        displayName: true,
        imageUrl: true,
        product: true,
      },
    });

    if (!user) {
      req.session.destroy(() => {});
      res.json({ authenticated: false });
      return;
    }

    res.json({ authenticated: true, user });
  } catch {
    res.json({ authenticated: false });
  }
});

export default router;
