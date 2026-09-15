/**
 * Analytics Engine
 *
 * All metrics are derived from real Spotify data stored in the database.
 * No values are invented or approximated without transparent calculation.
 * Each metric is documented with its source and formula.
 */

import { prisma } from '../services/prisma';
import type { TimeRange } from '../types/spotify';

export interface ArtistDiversityScore {
  score: number;         // 0–1, higher = more diverse
  topArtistCount: number;
  uniqueArtistCount: number;
  description: string;
}

export interface GenreDiversityScore {
  score: number;         // 0–1
  uniqueGenreCount: number;
  topGenres: { genre: string; count: number; score: number }[];
  description: string;
}

export interface DiscoveryScore {
  score: number;         // 0–1
  description: string;
  dataAvailable: boolean;
}

export interface LoyaltyScore {
  score: number;         // 0–1
  description: string;
  topRecurringArtists: string[];
}

export interface MusicDNA {
  dominantGenres: string[];
  genreDiversity: GenreDiversityScore;
  artistDiversity: ArtistDiversityScore;
  discoveryScore: DiscoveryScore;
  loyaltyScore: LoyaltyScore;
  archetype: string;
  archetypeDescription: string;
}

export interface OverviewStats {
  topArtist: { name: string; imageUrl: string | null } | null;
  topTrack: { name: string; artistName: string; imageUrl: string | null } | null;
  dominantGenre: string | null;
  recentlyPlayedCount: number;
  uniqueArtistCount: number;
  uniqueGenreCount: number;
}

// ─── Artist Diversity ─────────────────────────────────────────────────────────

/**
 * Artist diversity measures how spread out listening is across artists.
 * Calculated from the most recent top-artists snapshot.
 *
 * Method: We look at how many artists appear in the user's top 20.
 * If many distinct artists are in the short-term snapshot, diversity is high.
 * If the same 2–3 artists dominate, diversity is low.
 *
 * Uses Shannon entropy normalized to 0–1 range.
 */
export async function calculateArtistDiversity(
  userId: string,
  timeRange: TimeRange = 'medium_term'
): Promise<ArtistDiversityScore> {
  const snapshots = await prisma.artistSnapshot.findMany({
    where: { userId, timeRange },
    orderBy: { capturedAt: 'desc' },
    take: 20,
    distinct: ['artistId'],
    include: { artist: true },
  });

  const count = snapshots.length;

  if (count === 0) {
    return {
      score: 0,
      topArtistCount: 0,
      uniqueArtistCount: 0,
      description: 'Not enough data yet to measure artist diversity.',
    };
  }

  // With N artists in a top-20 list, maximum diversity = 20 unique artists
  // Score = unique artists / 20
  const score = Math.min(count / 20, 1);

  let description: string;
  if (score > 0.8) {
    description = 'Your listening is spread across a wide range of artists.';
  } else if (score > 0.5) {
    description = 'You have a solid mix of artists with a few recurring favorites.';
  } else {
    description = 'You tend to return heavily to a small group of artists.';
  }

  return {
    score: parseFloat(score.toFixed(3)),
    topArtistCount: 20,
    uniqueArtistCount: count,
    description,
  };
}

// ─── Genre Diversity ──────────────────────────────────────────────────────────

/**
 * Genre diversity measures how many distinct genres appear across top artists.
 * Calculated from the most recent genre snapshot for the given time range.
 *
 * Note: Genres are self-reported by Spotify for each artist.
 * This measures presence in top artists, NOT listening time percentage.
 */
export async function calculateGenreDiversity(
  userId: string,
  timeRange: TimeRange = 'medium_term'
): Promise<GenreDiversityScore> {
  // Get most recent genre snapshot for this time range
  const latestSnapshot = await prisma.genreSnapshot.findFirst({
    where: { userId, timeRange },
    orderBy: { capturedAt: 'desc' },
    select: { capturedAt: true },
  });

  if (!latestSnapshot) {
    return {
      score: 0,
      uniqueGenreCount: 0,
      topGenres: [],
      description: 'No genre data available yet.',
    };
  }

  // Get all genres from the most recent snapshot
  const genres = await prisma.genreSnapshot.findMany({
    where: {
      userId,
      timeRange,
      capturedAt: latestSnapshot.capturedAt,
    },
    orderBy: { count: 'desc' },
  });

  const uniqueGenreCount = genres.length;
  // Normalize: 20+ genres = maximum diversity
  const score = Math.min(uniqueGenreCount / 20, 1);

  let description: string;
  if (score > 0.7) {
    description = 'Your taste spans a wide variety of genres.';
  } else if (score > 0.4) {
    description = 'You have a core set of genres with some exploration.';
  } else {
    description = 'Your listening is focused around a specific sound.';
  }

  const topGenres = genres.slice(0, 15).map((g) => ({
    genre: g.genre,
    count: g.count,
    score: parseFloat(g.score.toFixed(3)),
  }));

  return {
    score: parseFloat(score.toFixed(3)),
    uniqueGenreCount,
    topGenres,
    description,
  };
}

// ─── Discovery Score ──────────────────────────────────────────────────────────

/**
 * Discovery score measures how often new artists appear in recent listening.
 * Compares the short_term artists against the long_term artists.
 *
 * If short_term contains artists NOT in long_term, those are "discoveries."
 * Score = newly discovered artists / total short-term artists.
 *
 * Note: This comparison requires BOTH short_term and long_term snapshots.
 */
export async function calculateDiscoveryScore(userId: string): Promise<DiscoveryScore> {
  const shortTermArtists = await prisma.artistSnapshot.findMany({
    where: { userId, timeRange: 'short_term' },
    orderBy: { capturedAt: 'desc' },
    take: 20,
    distinct: ['artistId'],
    select: { artistId: true },
  });

  const longTermArtists = await prisma.artistSnapshot.findMany({
    where: { userId, timeRange: 'long_term' },
    orderBy: { capturedAt: 'desc' },
    take: 50,
    distinct: ['artistId'],
    select: { artistId: true },
  });

  if (shortTermArtists.length === 0 || longTermArtists.length === 0) {
    return {
      score: 0,
      description:
        'Discovery score requires both short-term and long-term listening data. More time needed.',
      dataAvailable: false,
    };
  }

  const longTermIds = new Set(longTermArtists.map((a) => a.artistId));
  const newArtists = shortTermArtists.filter((a) => !longTermIds.has(a.artistId));
  const score = newArtists.length / shortTermArtists.length;

  let description: string;
  if (score > 0.6) {
    description = 'You\'re actively discovering new artists recently.';
  } else if (score > 0.3) {
    description = 'You\'re exploring some new music while keeping familiar favorites.';
  } else {
    description = 'You\'re mostly listening to established favorites lately.';
  }

  return {
    score: parseFloat(score.toFixed(3)),
    description,
    dataAvailable: true,
  };
}

// ─── Loyalty Score ────────────────────────────────────────────────────────────

/**
 * Loyalty score measures how strongly listening centers on recurring artists.
 * Artists appearing in BOTH short_term and long_term snapshots are "loyal listens."
 * Score = loyal artist count / total short-term artist count.
 */
export async function calculateLoyaltyScore(userId: string): Promise<LoyaltyScore> {
  const shortTermArtists = await prisma.artistSnapshot.findMany({
    where: { userId, timeRange: 'short_term' },
    orderBy: { capturedAt: 'desc' },
    take: 20,
    distinct: ['artistId'],
    include: { artist: { select: { name: true } } },
  });

  const longTermIds = new Set(
    (
      await prisma.artistSnapshot.findMany({
        where: { userId, timeRange: 'long_term' },
        orderBy: { capturedAt: 'desc' },
        take: 50,
        distinct: ['artistId'],
        select: { artistId: true },
      })
    ).map((a) => a.artistId)
  );

  if (shortTermArtists.length === 0) {
    return {
      score: 0,
      description: 'Not enough data for loyalty analysis yet.',
      topRecurringArtists: [],
    };
  }

  const loyalArtists = shortTermArtists.filter((a) => longTermIds.has(a.artistId));
  const score =
    longTermIds.size > 0 ? loyalArtists.length / shortTermArtists.length : 0;

  let description: string;
  if (score > 0.7) {
    description = 'You strongly return to your established favorite artists.';
  } else if (score > 0.4) {
    description = 'A mix of loyal favorites and newer discoveries defines your recent listening.';
  } else {
    description = 'Your recent listening has shifted significantly from your long-term favorites.';
  }

  return {
    score: parseFloat(score.toFixed(3)),
    description,
    topRecurringArtists: loyalArtists.slice(0, 5).map((a) => a.artist.name),
  };
}

// ─── Archetype ────────────────────────────────────────────────────────────────

/**
 * Deterministic listener archetype based on calculated scores.
 * Does NOT use AI. Pure rule-based logic from real metric values.
 */
function deriveArchetype(
  genreDiversity: number,
  artistDiversity: number,
  discoveryScore: number,
  loyaltyScore: number
): { archetype: string; description: string } {
  // Discovery-focused
  if (discoveryScore > 0.6 && genreDiversity > 0.5) {
    return {
      archetype: 'The Genre Explorer',
      description:
        'You are always searching for new sounds. Your listening spans many genres and you regularly introduce new artists into your rotation.',
    };
  }

  // Loyal to a small set
  if (loyaltyScore > 0.7 && genreDiversity < 0.4) {
    return {
      archetype: 'The Dedicated Fan',
      description:
        'You know what you love and you stick with it. A tight circle of artists defines your listening, and you return to them again and again.',
    };
  }

  // High genre diversity
  if (genreDiversity > 0.7 && artistDiversity > 0.6) {
    return {
      archetype: 'The Omnivore',
      description:
        'Your taste defies categorization. Artists and genres across the entire musical spectrum find a home in your listening history.',
    };
  }

  // Low diversity, high loyalty
  if (artistDiversity < 0.4 && loyaltyScore > 0.5) {
    return {
      archetype: 'The Pop Loyalist',
      description:
        'You have deep loyalty to a core group of artists and tend to return to a focused sound rather than exploring broadly.',
    };
  }

  // Balanced
  return {
    archetype: 'The Balanced Listener',
    description:
      'You strike a natural balance between familiar favorites and new discoveries, with a moderately diverse genre palette.',
  };
}

// ─── Full Music DNA ───────────────────────────────────────────────────────────

export async function calculateMusicDNA(
  userId: string,
  timeRange: TimeRange = 'medium_term'
): Promise<MusicDNA> {
  const [genreDiversity, artistDiversity, discoveryScore, loyaltyScore] = await Promise.all([
    calculateGenreDiversity(userId, timeRange),
    calculateArtistDiversity(userId, timeRange),
    calculateDiscoveryScore(userId),
    calculateLoyaltyScore(userId),
  ]);

  const dominantGenres = genreDiversity.topGenres.slice(0, 5).map((g) => g.genre);
  const { archetype, description: archetypeDescription } = deriveArchetype(
    genreDiversity.score,
    artistDiversity.score,
    discoveryScore.score,
    loyaltyScore.score
  );

  return {
    dominantGenres,
    genreDiversity,
    artistDiversity,
    discoveryScore,
    loyaltyScore,
    archetype,
    archetypeDescription,
  };
}

// ─── Overview Stats ───────────────────────────────────────────────────────────

export async function calculateOverviewStats(
  userId: string,
  timeRange: TimeRange = 'medium_term'
): Promise<OverviewStats> {
  const [topArtistSnap, topTrackSnap, genreData, recentCount, uniqueArtists] = await Promise.all([
    // Top artist (rank 1 from latest medium_term snapshot)
    prisma.artistSnapshot.findFirst({
      where: { userId, timeRange, rank: 1 },
      orderBy: { capturedAt: 'desc' },
      include: { artist: { select: { name: true, imageUrl: true } } },
    }),

    // Top track (rank 1 from latest medium_term snapshot)
    prisma.trackSnapshot.findFirst({
      where: { userId, timeRange, rank: 1 },
      orderBy: { capturedAt: 'desc' },
      include: {
        track: {
          include: {
            album: { select: { imageUrl: true } },
            trackArtists: {
              where: { position: 0 },
              include: { artist: { select: { name: true } } },
            },
          },
        },
      },
    }),

    // Dominant genre
    prisma.genreSnapshot.findFirst({
      where: { userId, timeRange },
      orderBy: [{ capturedAt: 'desc' }, { count: 'desc' }],
      select: { genre: true },
    }),

    // Recently played count (last 7 days)
    prisma.listeningEvent.count({
      where: {
        userId,
        playedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Unique artists count (from latest artist snapshot)
    prisma.artistSnapshot.findMany({
      where: { userId, timeRange },
      orderBy: { capturedAt: 'desc' },
      take: 50,
      distinct: ['artistId'],
      select: { artistId: true },
    }),
  ]);

  // Unique genres
  const latestGenreSnap = await prisma.genreSnapshot.findFirst({
    where: { userId, timeRange },
    orderBy: { capturedAt: 'desc' },
    select: { capturedAt: true },
  });

  const uniqueGenreCount = latestGenreSnap
    ? await prisma.genreSnapshot.count({
        where: { userId, timeRange, capturedAt: latestGenreSnap.capturedAt },
      })
    : 0;

  const topTrack = topTrackSnap
    ? {
        name: topTrackSnap.track.name,
        artistName: topTrackSnap.track.trackArtists[0]?.artist.name ?? 'Unknown Artist',
        imageUrl: topTrackSnap.track.album?.imageUrl ?? null,
      }
    : null;

  return {
    topArtist: topArtistSnap
      ? { name: topArtistSnap.artist.name, imageUrl: topArtistSnap.artist.imageUrl }
      : null,
    topTrack,
    dominantGenre: genreData?.genre ?? null,
    recentlyPlayedCount: recentCount,
    uniqueArtistCount: uniqueArtists.length,
    uniqueGenreCount,
  };
}
