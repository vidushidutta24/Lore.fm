import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getMyProfile,
  getCurrentlyPlaying,
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  saveArtistSnapshot,
  saveTrackSnapshot,
  saveListeningEvents,
  saveGenreSnapshot,
} from '../services/spotify';
import { prisma } from '../services/prisma';
import type { TimeRange } from '../types/spotify';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ─── GET /api/me — Current user profile ──────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        spotifyId: true,
        displayName: true,
        email: true,
        imageUrl: true,
        country: true,
        product: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/me/currently-playing ───────────────────────────────────────────

router.get('/currently-playing', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const rawData = await getCurrentlyPlaying(userId);
    
    let data = null;
    if (rawData && rawData.item) {
      data = {
        is_playing: rawData.is_playing,
        progress_ms: rawData.progress_ms,
        item: {
          id: rawData.item.id,
          name: rawData.item.name,
          artists: rawData.item.artists.map((a) => ({ id: a.id, name: a.name })),
          album: {
            id: rawData.item.album.id,
            name: rawData.item.album.name,
            imageUrl: rawData.item.album.images?.[0]?.url ?? null,
            releaseDate: rawData.item.album.release_date,
          },
          durationMs: rawData.item.duration_ms,
          explicit: rawData.item.explicit,
          spotifyUrl: rawData.item.external_urls?.spotify ?? null,
        }
      };
    } else if (rawData) {
      data = {
        is_playing: rawData.is_playing,
        progress_ms: rawData.progress_ms,
        item: null,
      };
    }

    res.json({ data }); // data is null if nothing playing or non-Premium
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/me/top-artists ──────────────────────────────────────────────────

router.get('/top-artists', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const timeRange = (req.query.time_range as TimeRange) ?? 'medium_term';
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);

    if (!['short_term', 'medium_term', 'long_term'].includes(timeRange)) {
      res.status(400).json({ error: 'Invalid time_range parameter' });
      return;
    }

    const [spotifyData] = await Promise.all([getTopArtists(userId, timeRange, limit)]);

    // Persist snapshot asynchronously (don't block response)
    saveArtistSnapshot(userId, spotifyData.items, timeRange).catch((e) =>
      console.error('[Snapshot] Artist snapshot error:', e.message)
    );
    saveGenreSnapshot(userId, spotifyData.items, timeRange).catch((e) =>
      console.error('[Snapshot] Genre snapshot error:', e.message)
    );

    res.json({
      artists: spotifyData.items.map((artist, index) => ({
        rank: index + 1,
        id: artist.id,
        name: artist.name,
        genres: artist.genres ?? [],
        popularity: artist.popularity ?? null,
        imageUrl: artist.images?.[0]?.url ?? null,
        spotifyUrl: artist.external_urls?.spotify ?? null,
      })),
      timeRange,
      total: spotifyData.total,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/me/top-tracks ───────────────────────────────────────────────────

router.get('/top-tracks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const timeRange = (req.query.time_range as TimeRange) ?? 'medium_term';
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);

    if (!['short_term', 'medium_term', 'long_term'].includes(timeRange)) {
      res.status(400).json({ error: 'Invalid time_range parameter' });
      return;
    }

    const spotifyData = await getTopTracks(userId, timeRange, limit);

    // Persist snapshot asynchronously
    saveTrackSnapshot(userId, spotifyData.items, timeRange).catch((e) =>
      console.error('[Snapshot] Track snapshot error:', e.message)
    );

    res.json({
      tracks: spotifyData.items.map((track, index) => ({
        rank: index + 1,
        id: track.id,
        name: track.name,
        artists: track.artists.map((a) => ({ id: a.id, name: a.name })),
        album: {
          id: track.album.id,
          name: track.album.name,
          imageUrl: track.album.images?.[0]?.url ?? null,
          releaseDate: track.album.release_date,
        },
        durationMs: track.duration_ms,
        popularity: track.popularity ?? null,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls?.spotify ?? null,
        explicit: track.explicit,
      })),
      timeRange,
      total: spotifyData.total,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/me/recently-played ──────────────────────────────────────────────

router.get('/recently-played', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 50);

    const spotifyData = await getRecentlyPlayed(userId, limit);

    // Persist listening events asynchronously
    saveListeningEvents(userId, spotifyData.items).catch((e) =>
      console.error('[Snapshot] Listening event error:', e.message)
    );

    res.json({
      items: spotifyData.items.map((item) => ({
        playedAt: item.played_at,
        track: {
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((a) => ({ id: a.id, name: a.name })),
          album: {
            id: item.track.album.id,
            name: item.track.album.name,
            imageUrl: item.track.album.images?.[0]?.url ?? null,
          },
          durationMs: item.track.duration_ms,
          explicit: item.track.explicit,
          spotifyUrl: item.track.external_urls?.spotify ?? null,
          previewUrl: item.track.preview_url,
        },
      })),
      note: 'Spotify provides up to 50 recently played tracks. Earlier history is captured by this application over time.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
