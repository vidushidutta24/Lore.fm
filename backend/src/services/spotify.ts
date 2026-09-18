import axios, { AxiosError } from 'axios';
import { prisma } from './prisma';
import type {
  SpotifyUserProfile,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyTopItemsResponse,
  SpotifyRecentlyPlayedResponse,
  SpotifyCurrentlyPlaying,
  SpotifyTokenResponse,
  TimeRange,
} from '../types/spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

// ─── Token Exchange ───────────────────────────────────────────────────────────

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<SpotifyTokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error('SPOTIFY_CLIENT_ID not configured');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await axios.post<SpotifyTokenResponse>(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    params.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return response.data;
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error('SPOTIFY_CLIENT_ID not configured');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await axios.post<SpotifyTokenResponse>(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    params.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return response.data;
}

// ─── Authenticated API Request ────────────────────────────────────────────────

async function spotifyRequest<T>(
  userId: string,
  path: string,
  params?: Record<string, string | number>
): Promise<T> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Check if token is expired (with 60s buffer)
  let accessToken = user.accessToken;
  if (new Date(user.tokenExpiry).getTime() < Date.now() + 60_000) {
    const refreshed = await refreshAccessToken(user.refreshToken);
    const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: refreshed.access_token,
        tokenExpiry: newExpiry,
        ...(refreshed.refresh_token && { refreshToken: refreshed.refresh_token }),
      },
    });
    accessToken = refreshed.access_token;
  }

  try {
    const response = await axios.get<T>(`${SPOTIFY_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response?.status === 429) {
      const retryAfter = axiosErr.response.headers['retry-after'];
      throw Object.assign(new Error('Spotify rate limit exceeded'), {
        code: 'RATE_LIMITED',
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : 30,
      });
    }
    if (axiosErr.response?.status === 401) {
      throw Object.assign(new Error('Spotify token unauthorized'), { code: 'UNAUTHORIZED' });
    }
    if (axiosErr.response?.status === 403) {
      throw Object.assign(new Error('Spotify access forbidden — Premium may be required'), {
        code: 'FORBIDDEN',
      });
    }
    throw err;
  }
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export async function getMyProfile(userId: string): Promise<SpotifyUserProfile> {
  return spotifyRequest<SpotifyUserProfile>(userId, '/me');
}

export async function getCurrentlyPlaying(userId: string): Promise<SpotifyCurrentlyPlaying | null> {
  try {
    const data = await spotifyRequest<SpotifyCurrentlyPlaying>(
      userId,
      '/me/player/currently-playing'
    );
    // Spotify returns 204 No Content when nothing is playing
    return data || null;
  } catch (err) {
    const e = err as { code?: string };
    // 403 = free tier user, 204 = nothing playing — both are valid states
    if (e.code === 'FORBIDDEN') return null;
    throw err;
  }
}

export async function getTopArtists(
  userId: string,
  timeRange: TimeRange = 'medium_term',
  limit = 20
): Promise<SpotifyTopItemsResponse<SpotifyArtist>> {
  return spotifyRequest<SpotifyTopItemsResponse<SpotifyArtist>>(userId, '/me/top/artists', {
    time_range: timeRange,
    limit,
    offset: 0,
  });
}

export async function getTopTracks(
  userId: string,
  timeRange: TimeRange = 'medium_term',
  limit = 20
): Promise<SpotifyTopItemsResponse<SpotifyTrack>> {
  return spotifyRequest<SpotifyTopItemsResponse<SpotifyTrack>>(userId, '/me/top/tracks', {
    time_range: timeRange,
    limit,
    offset: 0,
  });
}

export async function getRecentlyPlayed(
  userId: string,
  limit = 50
): Promise<SpotifyRecentlyPlayedResponse> {
  return spotifyRequest<SpotifyRecentlyPlayedResponse>(userId, '/me/player/recently-played', {
    limit,
  });
}

export async function getRecommendationsFromSeeds(
  userId: string,
  options: {
    seedArtists?: string[];
    seedGenres?: string[];
    seedTracks?: string[];
    limit?: number;
    targetPopularity?: number;
    minPopularity?: number;
    maxPopularity?: number;
  }
): Promise<SpotifyTrack[]> {
  const params: Record<string, string | number> = {
    limit: options.limit ?? 20,
  };

  if (options.seedArtists && options.seedArtists.length > 0) {
    params.seed_artists = options.seedArtists.slice(0, 5).join(',');
  }
  if (options.seedGenres && options.seedGenres.length > 0) {
    params.seed_genres = options.seedGenres.slice(0, 5).join(',');
  }
  if (options.seedTracks && options.seedTracks.length > 0) {
    params.seed_tracks = options.seedTracks.slice(0, 5).join(',');
  }
  if (options.targetPopularity !== undefined) {
    params.target_popularity = options.targetPopularity;
  }
  if (options.minPopularity !== undefined) {
    params.min_popularity = options.minPopularity;
  }
  if (options.maxPopularity !== undefined) {
    params.max_popularity = options.maxPopularity;
  }

  try {
    const res = await spotifyRequest<{ tracks: SpotifyTrack[] }>(userId, '/recommendations', params);
    return res.tracks ?? [];
  } catch (err) {
    console.warn('[Spotify] /recommendations fallback warning:', (err as Error).message);
    return [];
  }
}

export async function getArtistRelatedArtists(
  userId: string,
  artistId: string
): Promise<SpotifyArtist[]> {
  try {
    const res = await spotifyRequest<{ artists: SpotifyArtist[] }>(
      userId,
      `/artists/${artistId}/related-artists`
    );
    return res.artists ?? [];
  } catch (err) {
    console.warn(`[Spotify] /artists/${artistId}/related-artists warning:`, (err as Error).message);
    return [];
  }
}

export async function getArtistTopTracks(
  userId: string,
  artistId: string,
  market = 'US'
): Promise<SpotifyTrack[]> {
  try {
    const res = await spotifyRequest<{ tracks: SpotifyTrack[] }>(
      userId,
      `/artists/${artistId}/top-tracks`,
      { market }
    );
    return res.tracks ?? [];
  } catch (err) {
    console.warn(`[Spotify] /artists/${artistId}/top-tracks warning:`, (err as Error).message);
    return [];
  }
}

export async function searchSpotify(
  userId: string,
  query: string,
  type: 'track' | 'artist' | 'track,artist' = 'track',
  limit = 10
): Promise<{ tracks?: SpotifyTrack[]; artists?: SpotifyArtist[] }> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 10);
    const res = await spotifyRequest<{
      tracks?: { items: SpotifyTrack[] };
      artists?: { items: SpotifyArtist[] };
    }>(userId, '/search', {
      q: query,
      type,
      limit: safeLimit,
    });
    return {
      tracks: res.tracks?.items ?? [],
      artists: res.artists?.items ?? [],
    };
  } catch (err) {
    console.warn(`[Spotify] search "${query}" warning:`, (err as Error).message);
    return { tracks: [], artists: [] };
  }
}


// ─── Data Normalization & Persistence ────────────────────────────────────────

/**
 * Upsert a Spotify artist into the database.
 */
export async function upsertArtist(artist: SpotifyArtist) {
  const imageUrl = artist.images?.[0]?.url ?? null;
  return prisma.artist.upsert({
    where: { spotifyId: artist.id },
    create: {
      spotifyId: artist.id,
      name: artist.name,
      genres: JSON.stringify(artist.genres ?? []),
      popularity: artist.popularity ?? null,
      imageUrl,
      spotifyUrl: artist.external_urls?.spotify ?? null,
    },
    update: {
      name: artist.name,
      genres: JSON.stringify(artist.genres ?? []),
      popularity: artist.popularity ?? null,
      imageUrl,
      spotifyUrl: artist.external_urls?.spotify ?? null,
    },
  });
}

/**
 * Upsert a Spotify track (and its album) into the database.
 */
export async function upsertTrack(track: SpotifyTrack) {
  // Upsert album first
  const albumImageUrl = track.album?.images?.[0]?.url ?? null;
  let albumDbId: string | undefined;

  if (track.album?.id) {
    const album = await prisma.album.upsert({
      where: { spotifyId: track.album.id },
      create: {
        spotifyId: track.album.id,
        name: track.album.name,
        imageUrl: albumImageUrl,
        releaseDate: track.album.release_date ?? null,
        albumType: track.album.album_type ?? null,
        spotifyUrl: track.album.external_urls?.spotify ?? null,
      },
      update: {
        name: track.album.name,
        imageUrl: albumImageUrl,
        releaseDate: track.album.release_date ?? null,
        albumType: track.album.album_type ?? null,
        spotifyUrl: track.album.external_urls?.spotify ?? null,
      },
    });
    albumDbId = album.id;
  }

  return prisma.track.upsert({
    where: { spotifyId: track.id },
    create: {
      spotifyId: track.id,
      name: track.name,
      albumId: albumDbId ?? null,
      durationMs: track.duration_ms,
      popularity: track.popularity ?? null,
      previewUrl: track.preview_url ?? null,
      spotifyUrl: track.external_urls?.spotify ?? null,
      explicit: track.explicit ?? false,
    },
    update: {
      name: track.name,
      albumId: albumDbId ?? null,
      durationMs: track.duration_ms,
      popularity: track.popularity ?? null,
      previewUrl: track.preview_url ?? null,
      spotifyUrl: track.external_urls?.spotify ?? null,
      explicit: track.explicit ?? false,
    },
  });
}

/**
 * Save top artists snapshot — preserves history, does not overwrite.
 */
export async function saveArtistSnapshot(
  userId: string,
  artists: SpotifyArtist[],
  timeRange: TimeRange,
  capturedAt: Date = new Date()
) {
  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i];
    const dbArtist = await upsertArtist(artist);

    await prisma.artistSnapshot.create({
      data: {
        userId,
        artistId: dbArtist.id,
        timeRange,
        rank: i + 1,
        capturedAt,
      },
    });
  }
}

/**
 * Save top tracks snapshot — preserves history, does not overwrite.
 */
export async function saveTrackSnapshot(
  userId: string,
  tracks: SpotifyTrack[],
  timeRange: TimeRange,
  capturedAt: Date = new Date()
) {
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const dbTrack = await upsertTrack(track);

    await prisma.trackSnapshot.create({
      data: {
        userId,
        trackId: dbTrack.id,
        timeRange,
        rank: i + 1,
        capturedAt,
      },
    });
  }
}

/**
 * Save listening events (recently played) — deduplicates by userId + trackId + playedAt.
 */
export async function saveListeningEvents(
  userId: string,
  items: SpotifyRecentlyPlayedResponse['items']
) {
  for (const item of items) {
    const dbTrack = await upsertTrack(item.track);
    const playedAt = new Date(item.played_at);

    try {
      await prisma.listeningEvent.create({
        data: {
          userId,
          trackId: dbTrack.id,
          playedAt,
          source: 'recently_played',
        },
      });
    } catch {
      // Unique constraint violation = already stored, skip
    }
  }
}

/**
 * Save genre snapshot derived from top artists.
 */
export async function saveGenreSnapshot(
  userId: string,
  artists: SpotifyArtist[],
  timeRange: TimeRange
) {
  if (artists.length === 0) return;

  const genreCounts: Record<string, number> = {};
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
    }
  }

  const maxCount = Math.max(...Object.values(genreCounts));
  const capturedAt = new Date();

  for (const [genre, count] of Object.entries(genreCounts)) {
    await prisma.genreSnapshot.create({
      data: {
        userId,
        genre,
        score: count / maxCount,
        count,
        timeRange,
        capturedAt,
      },
    });
  }
}
