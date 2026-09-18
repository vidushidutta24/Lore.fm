import { prisma } from '../services/prisma';
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  getRecommendationsFromSeeds,
  getArtistRelatedArtists,
  getArtistTopTracks,
  searchSpotify,
  saveArtistSnapshot,
  saveTrackSnapshot,
  saveGenreSnapshot,
  saveListeningEvents,
} from '../services/spotify';
import {
  getMLTrackRecommendations,
  getMLArtistRecommendations,
  getMLUserTasteSummary,
  isMLServiceAvailable,
  MLRecommendationResponse,
  MLArtistRecommendationResponse,
  MLUserTasteSummary,
} from '../services/mlClient';

export interface DiscoverPayload {
  userTaste: MLUserTasteSummary;
  tracks: MLRecommendationResponse;
  artists: MLArtistRecommendationResponse;
  metadata: {
    mlServiceActive: boolean;
    engine: string;
    generatedAt: string;
  };
}

/**
 * Builds the comprehensive historical user taste payload required by the Python ML service.
 */
async function buildUserTastePayload(userId: string) {
  // 1. Fetch DB snapshots
  const [artistSnaps, trackSnaps, genreSnaps, listeningEvents] = await Promise.all([
    prisma.artistSnapshot.findMany({
      where: { userId },
      include: { artist: true },
      orderBy: { capturedAt: 'desc' },
    }),
    prisma.trackSnapshot.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            trackArtists: {
              include: { artist: true },
            },
          },
        },
      },
      orderBy: { capturedAt: 'desc' },
    }),
    prisma.genreSnapshot.findMany({
      where: { userId },
      orderBy: { capturedAt: 'desc' },
    }),
    prisma.listeningEvent.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            trackArtists: {
              include: { artist: true },
            },
          },
        },
      },
      orderBy: { playedAt: 'desc' },
      take: 200,
    }),
  ]);

  // If we lack snapshots, fetch from Spotify and save
  let shortArtists = artistSnaps.filter((s) => s.timeRange === 'short_term');
  let medArtists = artistSnaps.filter((s) => s.timeRange === 'medium_term');
  let longArtists = artistSnaps.filter((s) => s.timeRange === 'long_term');

  let shortTracks = trackSnaps.filter((s) => s.timeRange === 'short_term');
  let medTracks = trackSnaps.filter((s) => s.timeRange === 'medium_term');
  let longTracks = trackSnaps.filter((s) => s.timeRange === 'long_term');

  if (medArtists.length === 0 || medTracks.length === 0) {
    try {
      const [spArtists, spTracks, spRecent] = await Promise.all([
        getTopArtists(userId, 'medium_term', 20),
        getTopTracks(userId, 'medium_term', 20),
        getRecentlyPlayed(userId, 50),
      ]);

      await Promise.all([
        saveArtistSnapshot(userId, spArtists.items, 'medium_term'),
        saveTrackSnapshot(userId, spTracks.items, 'medium_term'),
        saveGenreSnapshot(userId, spArtists.items, 'medium_term'),
        saveListeningEvents(userId, spRecent.items),
      ]);

      // Re-query newly saved snapshots
      const [refreshedArtists, refreshedTracks] = await Promise.all([
        prisma.artistSnapshot.findMany({
          where: { userId, timeRange: 'medium_term' },
          include: { artist: true },
        }),
        prisma.trackSnapshot.findMany({
          where: { userId, timeRange: 'medium_term' },
          include: {
            track: {
              include: {
                trackArtists: {
                  include: { artist: true },
                },
              },
            },
          },
        }),
      ]);
      medArtists = refreshedArtists;
      medTracks = refreshedTracks;
    } catch (e) {
      console.warn('[RecEngine] Live Spotify fetch fallback notice:', (e as Error).message);
    }
  }

  // Collect all known track IDs and artist IDs for already-heard filtering
  const alreadyHeardTrackIds = new Set<string>();
  const alreadyHeardArtistIds = new Set<string>();

  for (const ev of listeningEvents) {
    alreadyHeardTrackIds.add(ev.track.spotifyId);
    for (const ta of ev.track.trackArtists) {
      alreadyHeardArtistIds.add(ta.artist.spotifyId);
    }
  }

  for (const ts of trackSnaps) {
    alreadyHeardTrackIds.add(ts.track.spotifyId);
    for (const ta of ts.track.trackArtists) {
      alreadyHeardArtistIds.add(ta.artist.spotifyId);
    }
  }

  for (const as of artistSnaps) {
    alreadyHeardArtistIds.add(as.artist.spotifyId);
  }

  // Format payload for ML service
  return {
    user_id: userId,
    top_artists_short: shortArtists.map((a) => ({
      artist_id: a.artist.spotifyId,
      name: a.artist.name,
      genres: JSON.parse(a.artist.genres || '[]'),
      popularity: a.artist.popularity ?? 50,
      time_range: 'short_term',
      rank: a.rank,
    })),
    top_artists_medium: medArtists.map((a) => ({
      artist_id: a.artist.spotifyId,
      name: a.artist.name,
      genres: JSON.parse(a.artist.genres || '[]'),
      popularity: a.artist.popularity ?? 50,
      time_range: 'medium_term',
      rank: a.rank,
    })),
    top_artists_long: longArtists.map((a) => ({
      artist_id: a.artist.spotifyId,
      name: a.artist.name,
      genres: JSON.parse(a.artist.genres || '[]'),
      popularity: a.artist.popularity ?? 50,
      time_range: 'long_term',
      rank: a.rank,
    })),
    top_tracks_short: shortTracks.map((t) => ({
      track_id: t.track.spotifyId,
      name: t.track.name,
      artist_id: t.track.trackArtists[0]?.artist.spotifyId || '',
      artist_name: t.track.trackArtists[0]?.artist.name || 'Unknown',
      duration_ms: t.track.durationMs,
      popularity: t.track.popularity ?? 50,
      time_range: 'short_term',
      rank: t.rank,
    })),
    top_tracks_medium: medTracks.map((t) => ({
      track_id: t.track.spotifyId,
      name: t.track.name,
      artist_id: t.track.trackArtists[0]?.artist.spotifyId || '',
      artist_name: t.track.trackArtists[0]?.artist.name || 'Unknown',
      duration_ms: t.track.durationMs,
      popularity: t.track.popularity ?? 50,
      time_range: 'medium_term',
      rank: t.rank,
    })),
    top_tracks_long: longTracks.map((t) => ({
      track_id: t.track.spotifyId,
      name: t.track.name,
      artist_id: t.track.trackArtists[0]?.artist.spotifyId || '',
      artist_name: t.track.trackArtists[0]?.artist.name || 'Unknown',
      duration_ms: t.track.durationMs,
      popularity: t.track.popularity ?? 50,
      time_range: 'long_term',
      rank: t.rank,
    })),
    genres_summary: genreSnaps.map((g) => ({
      genre: g.genre,
      score: g.score,
      count: g.count,
      time_range: g.timeRange,
    })),
    listening_events: listeningEvents.map((e) => ({
      track_id: e.track.spotifyId,
      artist_id: e.track.trackArtists[0]?.artist.spotifyId || null,
      played_at: e.playedAt.toISOString(),
      source: e.source,
    })),
    already_heard_track_ids: Array.from(alreadyHeardTrackIds),
    already_heard_artist_ids: Array.from(alreadyHeardArtistIds),
  };
}

/**
 * Gathers a diverse pool of candidate tracks and artists from Spotify API.
 */
async function gatherCandidates(userId: string, userTastePayload: any) {
  const candidateTracksMap = new Map<string, any>();
  const candidateArtistsMap = new Map<string, any>();

  // Extract top artist names across all time ranges
  const seedArtists = [
    ...userTastePayload.top_artists_short,
    ...userTastePayload.top_artists_medium,
    ...userTastePayload.top_artists_long,
  ];
  const uniqueArtistNames = Array.from(
    new Set(seedArtists.map((a: any) => a.name).filter(Boolean))
  ).slice(0, 6);

  // Extract top genres from summary and top artists
  const userGenres = Array.from(
    new Set([
      ...userTastePayload.genres_summary.map((g: any) => g.genre),
      ...seedArtists.flatMap((a: any) => a.genres || []),
    ])
  )
    .filter(Boolean)
    .slice(0, 5);

  // Build diverse search queries for candidate generation
  const searchQueries: Array<{ query: string; genreTag?: string }> = [];

  // 1. Artist-specific queries (for SIMILAR category and unheard deep cuts)
  for (const artName of uniqueArtistNames) {
    searchQueries.push({ query: artName });
  }

  // 2. User core genres
  for (const genre of userGenres) {
    searchQueries.push({ query: genre, genreTag: genre });
  }

  // 3. Companion & exploration genres (for DISCOVER & EXPLORE)
  const explorationGenres = ['indie pop', 'dream pop', 'alt rock', 'synthpop', 'bedroom pop', 'r&b', 'tag:new'];
  for (const eg of explorationGenres) {
    if (!userGenres.includes(eg) && searchQueries.length < 14) {
      searchQueries.push({ query: eg, genreTag: eg });
    }
  }

  // Execute all Spotify searches in parallel with safe limit (<= 10)
  const searchPromises = searchQueries.map((item) =>
    searchSpotify(userId, item.query, 'track,artist', 10)
  );

  const searchResults = await Promise.all(searchPromises);

  // Ingest search results
  for (let i = 0; i < searchResults.length; i++) {
    const result = searchResults[i];
    const genreTag = searchQueries[i]?.genreTag;

    for (const t of result.tracks || []) {
      if (t && t.id) {
        candidateTracksMap.set(t.id, {
          id: t.id,
          name: t.name,
          artist_id: t.artists[0]?.id || '',
          artist_name: t.artists[0]?.name || 'Unknown',
          genres: genreTag ? [genreTag] : [],
          album_name: t.album?.name || null,
          album_image_url: t.album?.images?.[0]?.url || null,
          preview_url: t.preview_url || null,
          spotify_url: t.external_urls?.spotify || null,
          duration_ms: t.duration_ms,
          popularity: t.popularity ?? 50,
          explicit: t.explicit ?? false,
        });
      }
    }

    for (const art of result.artists || []) {
      if (art && art.id) {
        candidateArtistsMap.set(art.id, {
          id: art.id,
          name: art.name,
          genres: art.genres && art.genres.length > 0 ? art.genres : (genreTag ? [genreTag] : []),
          popularity: art.popularity ?? 50,
          image_url: art.images?.[0]?.url || null,
          spotify_url: art.external_urls?.spotify || null,
        });
      }
    }
  }

  return {
    candidateTracks: Array.from(candidateTracksMap.values()),
    candidateArtists: Array.from(candidateArtistsMap.values()),
  };
}

/**
 * Main recommendation orchestrator:
 * Generates user taste profile, fetches candidates, invokes Python ML recommender,
 * filters already heard music, and returns ranked recommendations.
 */
export async function generateDiscoverRecommendations(
  userId: string,
  options?: {
    trackLimit?: number;
    artistLimit?: number;
    categoryFilter?: string;
  }
): Promise<DiscoverPayload> {
  const userTastePayload = await buildUserTastePayload(userId);
  const { candidateTracks, candidateArtists } = await gatherCandidates(userId, userTastePayload);

  const [userTasteSummary, trackRecs, artistRecs] = await Promise.all([
    getMLUserTasteSummary(userTastePayload),
    getMLTrackRecommendations(
      userTastePayload,
      candidateTracks,
      options?.trackLimit ?? 20,
      options?.categoryFilter
    ),
    getMLArtistRecommendations(
      userTastePayload,
      candidateArtists,
      options?.artistLimit ?? 10,
      options?.categoryFilter
    ),
  ]);

  return {
    userTaste: userTasteSummary,
    tracks: trackRecs,
    artists: artistRecs,
    metadata: {
      mlServiceActive: true,
      engine: 'Lore.fm Scikit-Learn Content-Based Recommender',
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function getTrackRecommendationsOnly(
  userId: string,
  limit = 20,
  categoryFilter?: string
): Promise<MLRecommendationResponse> {
  const userTastePayload = await buildUserTastePayload(userId);
  const { candidateTracks } = await gatherCandidates(userId, userTastePayload);

  return getMLTrackRecommendations(userTastePayload, candidateTracks, limit, categoryFilter);
}

export async function getArtistRecommendationsOnly(
  userId: string,
  limit = 10,
  categoryFilter?: string
): Promise<MLArtistRecommendationResponse> {
  const userTastePayload = await buildUserTastePayload(userId);
  const { candidateArtists } = await gatherCandidates(userId, userTastePayload);

  return getMLArtistRecommendations(userTastePayload, candidateArtists, limit, categoryFilter);
}

export async function getUserTasteVectorOnly(userId: string): Promise<MLUserTasteSummary> {
  const userTastePayload = await buildUserTastePayload(userId);
  return getMLUserTasteSummary(userTastePayload);
}
