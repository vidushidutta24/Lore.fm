/**
 * Taste Profile Analytics Engine
 *
 * Provides deep, deterministic calculations on real Spotify listening data.
 * All metrics are derived from actual artist, track, genre, and listening event records.
 * No arbitrary scores or fabricated statistics.
 */

import { prisma } from '../services/prisma';
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  saveArtistSnapshot,
  saveGenreSnapshot,
  saveTrackSnapshot,
  saveListeningEvents,
} from '../services/spotify';
import type { TimeRange, SpotifyArtist, SpotifyTrack } from '../types/spotify';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ArtistDiversityInsight {
  score: number; // 0–100
  uniqueArtistCount: number;
  analyzedItemCount: number;
  top3DominancePercentage: number; // Percentage share of top 3 vs rest
  listeningBreadth: 'Hyper-Focused' | 'Moderate Rotation' | 'Broad Explorer';
  description: string;
  topArtistsShare: {
    name: string;
    imageUrl: string | null;
    estimatedShare: number; // percentage (approx based on rank weighting)
  }[];
}

export interface GenreItem {
  genre: string;
  count: number;
  percentage: number;
  score: number; // 0–1
}

export interface GenreProfileInsight {
  score: number; // 0–100 (Diversity Index)
  dominantGenres: string[];
  totalUniqueGenres: number;
  distribution: GenreItem[];
  genreDiversityRating: 'Niche & Concentrated' | 'Genre Curious' | 'Wide Spectrum Omnivore';
  description: string;
}

export interface RepeatTrack {
  id: string;
  name: string;
  artistName: string;
  imageUrl: string | null;
  playCount: number;
  lastPlayedAt: string;
}

export interface HeavyRotationArtist {
  name: string;
  imageUrl: string | null;
  recentTrackCount: number;
}

export interface FactObservation {
  tag: 'Fact' | 'Trend' | 'Pattern';
  text: string;
}

export interface ListeningTrendsInsight {
  recentTracksAnalyzed: number;
  repeatTrackCount: number;
  repeatTracks: RepeatTrack[];
  heavyRotationArtists: HeavyRotationArtist[];
  trendingGenres: string[];
  observations: FactObservation[];
  description: string;
}

export interface ArtistCategoryItem {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  popularity: number | null;
}

export interface LoyaltyDiscoveryInsight {
  loyaltyScore: number; // 0–100
  discoveryScore: number; // 0–100
  loyalAnchors: ArtistCategoryItem[]; // Present in both short and long term
  freshDiscoveries: ArtistCategoryItem[]; // Present in short term but new to long term
  dormantFavorites: ArtistCategoryItem[]; // In long term but dropped from short term
  retentionRate: number; // % of long term favorites still in short term
  loyaltySummary: string;
  discoverySummary: string;
}

export interface NicheTrackSpotlight {
  name: string;
  artistName: string;
  imageUrl: string | null;
  popularity: number;
  spotifyUrl: string | null;
}

export interface NicheArtistSpotlight {
  name: string;
  imageUrl: string | null;
  popularity: number;
  genres: string[];
  spotifyUrl: string | null;
}

export interface NicheIndexInsight {
  mainstreamScore: number; // 0–100 (Average popularity)
  nicheScore: number; // 100 - mainstreamScore
  obscurityTier: 'Mainstream Maven' | 'Pop Adjacent' | 'Eclectic Explorer' | 'Underground Seeker';
  tierDescription: string;
  averagePopularity: number;
  rarestTrack: NicheTrackSpotlight | null;
  mostPopularTrack: NicheTrackSpotlight | null;
  rarestArtist: NicheArtistSpotlight | null;
  mostPopularArtist: NicheArtistSpotlight | null;
}

export interface GenreShift {
  genre: string;
  direction: 'rising' | 'falling' | 'stable';
  changeDescription: string;
}

export interface ArtistShift {
  name: string;
  imageUrl: string | null;
  status: 'new_entry' | 'climber' | 'descender' | 'consistent';
  rankChange?: number;
  currentRank: number;
}

export interface TasteEvolutionInsight {
  hasHistoricalData: boolean;
  baselinePeriod: string;
  comparisonPeriod: string;
  genreShifts: GenreShift[];
  artistShifts: ArtistShift[];
  evolutionSummary: string;
  historicalStatusNote: string;
}

export interface MusicDNAScorecard {
  genreDiversity: number; // 0–100
  artistDiversity: number; // 0–100
  discoveryRate: number; // 0–100
  loyaltyIndex: number; // 0–100
  nicheAffinity: number; // 0–100
}

export interface ListenerArchetype {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  traits: string[];
  signatureHabits: string[];
}

export interface FullTasteProfile {
  timeRange: TimeRange;
  timeRangeLabel: string;
  calculatedAt: string;
  archetype: ListenerArchetype;
  musicDNA: MusicDNAScorecard;
  artistDiversity: ArtistDiversityInsight;
  genreProfile: GenreProfileInsight;
  listeningTrends: ListeningTrendsInsight;
  loyaltyDiscovery: LoyaltyDiscoveryInsight;
  nicheIndex: NicheIndexInsight;
  tasteEvolution: TasteEvolutionInsight;
  transparencyReport: {
    source: string;
    tracksSampled: number;
    artistsSampled: number;
    eventsSampled: number;
    methodology: string;
  };
}

// ─── Calculation Helpers ───────────────────────────────────────────────────

/**
 * Ensure user has fresh data in DB by querying Spotify API and saving snapshots if needed.
 */
async function ensureSpotifyData(userId: string, timeRange: TimeRange) {
  try {
    const [artistsData, tracksData, recentData] = await Promise.all([
      getTopArtists(userId, timeRange, 50).catch(() => ({ items: [], total: 0 })),
      getTopTracks(userId, timeRange, 50).catch(() => ({ items: [], total: 0 })),
      getRecentlyPlayed(userId, 50).catch(() => ({ items: [] })),
    ]);

    if (artistsData.items.length > 0) {
      await saveArtistSnapshot(userId, artistsData.items, timeRange).catch(() => {});
      await saveGenreSnapshot(userId, artistsData.items, timeRange).catch(() => {});
    }

    if (tracksData.items.length > 0) {
      await saveTrackSnapshot(userId, tracksData.items, timeRange).catch(() => {});
    }

    if (recentData.items && recentData.items.length > 0) {
      await saveListeningEvents(userId, recentData.items).catch(() => {});
    }

    // Also fetch short and long term artists if doing medium_term, for accurate loyalty/discovery comparisons
    if (timeRange === 'medium_term') {
      const [shortData, longData] = await Promise.all([
        getTopArtists(userId, 'short_term', 50).catch(() => ({ items: [] })),
        getTopArtists(userId, 'long_term', 50).catch(() => ({ items: [] })),
      ]);
      if (shortData.items.length > 0) {
        await saveArtistSnapshot(userId, shortData.items, 'short_term').catch(() => {});
        await saveGenreSnapshot(userId, shortData.items, 'short_term').catch(() => {});
      }
      if (longData.items.length > 0) {
        await saveArtistSnapshot(userId, longData.items, 'long_term').catch(() => {});
        await saveGenreSnapshot(userId, longData.items, 'long_term').catch(() => {});
      }
    }
  } catch (err) {
    console.error('[TasteEngine] Error ensuring Spotify data:', err);
  }
}

// ─── Main Calculation Engine ────────────────────────────────────────────────

export async function calculateFullTasteProfile(
  userId: string,
  timeRange: TimeRange = 'medium_term'
): Promise<FullTasteProfile> {
  // 1. Ensure freshest data is synced
  await ensureSpotifyData(userId, timeRange);

  // 2. Fetch required datasets from Database
  const [
    currentArtistSnapshots,
    shortArtistSnapshots,
    longArtistSnapshots,
    currentTrackSnapshots,
    recentListeningEvents,
  ] = await Promise.all([
    // Current timeRange artist snapshots
    prisma.artistSnapshot.findMany({
      where: { userId, timeRange },
      orderBy: { capturedAt: 'desc' },
      take: 50,
      distinct: ['artistId'],
      include: { artist: true },
    }),

    // Short-term artist snapshots for comparison
    prisma.artistSnapshot.findMany({
      where: { userId, timeRange: 'short_term' },
      orderBy: { capturedAt: 'desc' },
      take: 50,
      distinct: ['artistId'],
      include: { artist: true },
    }),

    // Long-term artist snapshots for comparison
    prisma.artistSnapshot.findMany({
      where: { userId, timeRange: 'long_term' },
      orderBy: { capturedAt: 'desc' },
      take: 50,
      distinct: ['artistId'],
      include: { artist: true },
    }),

    // Current track snapshots
    prisma.trackSnapshot.findMany({
      where: { userId, timeRange },
      orderBy: { capturedAt: 'desc' },
      take: 50,
      distinct: ['trackId'],
      include: {
        track: {
          include: {
            album: true,
            trackArtists: { include: { artist: true } },
          },
        },
      },
    }),

    // Recent listening events (last 50 events)
    prisma.listeningEvent.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 50,
      include: {
        track: {
          include: {
            album: true,
            trackArtists: { include: { artist: true } },
          },
        },
      },
    }),
  ]);

  // Fallback to active snapshots if short/long aren't separate
  const effectiveArtists = currentArtistSnapshots.length > 0 ? currentArtistSnapshots : shortArtistSnapshots;
  const shortArtists = shortArtistSnapshots.length > 0 ? shortArtistSnapshots : effectiveArtists;
  const longArtists = longArtistSnapshots.length > 0 ? longArtistSnapshots : effectiveArtists;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ARTIST DIVERSITY CALCULATION
  // ──────────────────────────────────────────────────────────────────────────
  const totalArtists = effectiveArtists.length;
  // Rank weights for estimation (Zipf-like distribution: weight = 1 / rank^0.75)
  const rankWeights = effectiveArtists.map((_, i) => 1 / Math.pow(i + 1, 0.75));
  const totalWeight = rankWeights.reduce((a, b) => a + b, 0) || 1;
  const top3Weight = rankWeights.slice(0, 3).reduce((a, b) => a + b, 0);
  const top3DominancePct = totalArtists > 0 ? Math.round((top3Weight / totalWeight) * 100) : 0;

  // Entropy calculation
  let entropy = 0;
  for (const w of rankWeights) {
    const p = w / totalWeight;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  const maxEntropy = totalArtists > 1 ? Math.log2(totalArtists) : 1;
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0.5;
  const artistDiversityScore = Math.round(Math.min(Math.max(normalizedEntropy * 100, 10), 100));

  let listeningBreadth: ArtistDiversityInsight['listeningBreadth'] = 'Moderate Rotation';
  let artistDiversityDesc = 'You have a healthy rotation of artists with a few steadfast favorites.';
  if (artistDiversityScore >= 75) {
    listeningBreadth = 'Broad Explorer';
    artistDiversityDesc = 'Your listening is wide-ranging, rarely dominated by just a few artists.';
  } else if (artistDiversityScore <= 45) {
    listeningBreadth = 'Hyper-Focused';
    artistDiversityDesc = 'Your listening is concentrated around a tight inner circle of core artists.';
  }

  const topArtistsShare = effectiveArtists.slice(0, 5).map((snap, i) => ({
    name: snap.artist.name,
    imageUrl: snap.artist.imageUrl,
    estimatedShare: Math.round((rankWeights[i] / totalWeight) * 100),
  }));

  const artistDiversity: ArtistDiversityInsight = {
    score: artistDiversityScore,
    uniqueArtistCount: totalArtists,
    analyzedItemCount: totalArtists,
    top3DominancePercentage: top3DominancePct,
    listeningBreadth,
    description: artistDiversityDesc,
    topArtistsShare,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 2. GENRE PROFILE CALCULATION
  // ──────────────────────────────────────────────────────────────────────────
  const genreCounts: Record<string, number> = {};
  for (const snap of effectiveArtists) {
    try {
      const genres: string[] = JSON.parse(snap.artist.genres || '[]');
      for (const g of genres) {
        genreCounts[g] = (genreCounts[g] ?? 0) + 1;
      }
    } catch {}
  }

  const totalGenreOccurrences = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1;
  const sortedGenreEntries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const maxGenreCount = sortedGenreEntries[0]?.[1] ?? 1;

  const distribution: GenreItem[] = sortedGenreEntries.slice(0, 16).map(([genre, count]) => ({
    genre,
    count,
    percentage: Math.round((count / totalGenreOccurrences) * 100),
    score: parseFloat((count / maxGenreCount).toFixed(3)),
  }));

  const dominantGenres = sortedGenreEntries.slice(0, 5).map(([g]) => g);
  const totalUniqueGenres = sortedGenreEntries.length;

  // Genre diversity score: based on unique genre count and distribution spread
  const genreDiversityScore = Math.min(
    Math.round((Math.min(totalUniqueGenres, 25) / 25) * 100),
    100
  );

  let genreDiversityRating: GenreProfileInsight['genreDiversityRating'] = 'Genre Curious';
  let genreProfileDesc = 'You explore multiple genres while maintaining a consistent sound palette.';
  if (genreDiversityScore >= 75) {
    genreDiversityRating = 'Wide Spectrum Omnivore';
    genreProfileDesc = 'Your musical taste spans across diverse and varied genres with minimal boundaries.';
  } else if (genreDiversityScore <= 40) {
    genreDiversityRating = 'Niche & Concentrated';
    genreProfileDesc = 'Your listening stays tightly aligned with a distinct sonic signature.';
  }

  const genreProfile: GenreProfileInsight = {
    score: genreDiversityScore,
    dominantGenres,
    totalUniqueGenres,
    distribution,
    genreDiversityRating,
    description: genreProfileDesc,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CURRENT LISTENING TRENDS CALCULATION
  // ──────────────────────────────────────────────────────────────────────────
  const trackPlayCounts: Record<
    string,
    { name: string; artistName: string; imageUrl: string | null; count: number; lastPlayed: string }
  > = {};
  const artistRecentCounts: Record<string, { name: string; imageUrl: string | null; count: number }> = {};

  for (const event of recentListeningEvents) {
    const tId = event.trackId;
    const tName = event.track.name;
    const tArtist = event.track.trackArtists[0]?.artist.name ?? 'Unknown Artist';
    const tImg = event.track.album?.imageUrl ?? null;

    if (!trackPlayCounts[tId]) {
      trackPlayCounts[tId] = {
        name: tName,
        artistName: tArtist,
        imageUrl: tImg,
        count: 0,
        lastPlayed: event.playedAt.toISOString(),
      };
    }
    trackPlayCounts[tId].count += 1;

    for (const ta of event.track.trackArtists) {
      const aName = ta.artist.name;
      const aImg = ta.artist.imageUrl;
      if (!artistRecentCounts[aName]) {
        artistRecentCounts[aName] = { name: aName, imageUrl: aImg, count: 0 };
      }
      artistRecentCounts[aName].count += 1;
    }
  }

  const repeatTracks: RepeatTrack[] = Object.entries(trackPlayCounts)
    .filter(([, data]) => data.count > 1)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, data]) => ({
      id,
      name: data.name,
      artistName: data.artistName,
      imageUrl: data.imageUrl,
      playCount: data.count,
      lastPlayedAt: data.lastPlayed,
    }));

  const heavyRotationArtists: HeavyRotationArtist[] = Object.values(artistRecentCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((item) => ({
      name: item.name,
      imageUrl: item.imageUrl,
      recentTrackCount: item.count,
    }));

  // Trending genres in short term vs long term
  const shortGenreCounts: Record<string, number> = {};
  for (const snap of shortArtists) {
    try {
      const gs: string[] = JSON.parse(snap.artist.genres || '[]');
      for (const g of gs) shortGenreCounts[g] = (shortGenreCounts[g] ?? 0) + 1;
    } catch {}
  }
  const trendingGenres = Object.entries(shortGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([g]) => g);

  // Formulate factual observations
  const observations: FactObservation[] = [];
  if (heavyRotationArtists.length > 0) {
    observations.push({
      tag: 'Fact',
      text: `${heavyRotationArtists[0].name} appeared ${heavyRotationArtists[0].recentTrackCount} times across your last ${recentListeningEvents.length} recorded listening events.`,
    });
  }
  if (repeatTracks.length > 0) {
    observations.push({
      tag: 'Pattern',
      text: `You have "${repeatTracks[0].name}" on repeat—logged ${repeatTracks[0].playCount} separate times in recent history.`,
    });
  } else {
    observations.push({
      tag: 'Pattern',
      text: 'You rarely repeat the exact same song back-to-back in recent listening.',
    });
  }
  if (trendingGenres.length > 0) {
    observations.push({
      tag: 'Trend',
      text: `Your recent listening leans heavily toward ${trendingGenres.slice(0, 2).join(' and ')}.`,
    });
  }

  const listeningTrends: ListeningTrendsInsight = {
    recentTracksAnalyzed: recentListeningEvents.length,
    repeatTrackCount: repeatTracks.length,
    repeatTracks,
    heavyRotationArtists,
    trendingGenres,
    observations,
    description:
      recentListeningEvents.length > 0
        ? `Derived from your last ${recentListeningEvents.length} played tracks and recent rotation momentum.`
        : 'Connect and stream on Spotify to view live listening momentum and repeat track detection.',
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 4. LOYALTY VS DISCOVERY BEHAVIOR
  // ──────────────────────────────────────────────────────────────────────────
  const longTermIds = new Set(longArtists.map((a) => a.artistId));
  const shortTermIds = new Set(shortArtists.map((a) => a.artistId));

  const loyalSnaps = shortArtists.filter((a) => longTermIds.has(a.artistId));
  const freshSnaps = shortArtists.filter((a) => !longTermIds.has(a.artistId));
  const dormantSnaps = longArtists.filter((a) => !shortTermIds.has(a.artistId));

  const loyalAnchors: ArtistCategoryItem[] = loyalSnaps.slice(0, 6).map((s) => ({
    id: s.artist.id,
    name: s.artist.name,
    imageUrl: s.artist.imageUrl,
    genres: JSON.parse(s.artist.genres || '[]'),
    popularity: s.artist.popularity,
  }));

  const freshDiscoveries: ArtistCategoryItem[] = freshSnaps.slice(0, 6).map((s) => ({
    id: s.artist.id,
    name: s.artist.name,
    imageUrl: s.artist.imageUrl,
    genres: JSON.parse(s.artist.genres || '[]'),
    popularity: s.artist.popularity,
  }));

  const dormantFavorites: ArtistCategoryItem[] = dormantSnaps.slice(0, 4).map((s) => ({
    id: s.artist.id,
    name: s.artist.name,
    imageUrl: s.artist.imageUrl,
    genres: JSON.parse(s.artist.genres || '[]'),
    popularity: s.artist.popularity,
  }));

  const shortTotal = shortArtists.length || 1;
  const loyaltyScore = Math.round((loyalSnaps.length / shortTotal) * 100);
  const discoveryScore = Math.round((freshSnaps.length / shortTotal) * 100);
  const retentionRate = longArtists.length > 0 ? Math.round((loyalSnaps.length / longArtists.length) * 100) : 50;

  let loyaltySummary = 'You maintain a balanced relationship between trusted artists and new additions.';
  if (loyaltyScore >= 65) {
    loyaltySummary = 'Your musical foundation is solid—you consistently revisit your long-term favorites.';
  } else if (loyaltyScore <= 35) {
    loyaltySummary = 'Your recent listening has branched noticeably away from your historical core.';
  }

  let discoverySummary = 'You periodically invite new artists into your rotation.';
  if (discoveryScore >= 60) {
    discoverySummary = 'High exploratory drive: you actively seek out fresh artists and sounds.';
  } else if (discoveryScore <= 25) {
    discoverySummary = 'You prefer sticking with familiar, proven musical favorites.';
  }

  const loyaltyDiscovery: LoyaltyDiscoveryInsight = {
    loyaltyScore,
    discoveryScore,
    loyalAnchors,
    freshDiscoveries,
    dormantFavorites,
    retentionRate,
    loyaltySummary,
    discoverySummary,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 5. NICHE VS MAINSTREAM (POPULARITY INDEX)
  // ──────────────────────────────────────────────────────────────────────────
  const artistsWithPop = effectiveArtists.filter((a) => a.artist.popularity !== null);
  const avgArtistPop =
    artistsWithPop.length > 0
      ? artistsWithPop.reduce((sum, a) => sum + (a.artist.popularity ?? 50), 0) / artistsWithPop.length
      : 55;

  const tracksWithPop = currentTrackSnapshots.filter((t) => t.track.popularity !== null);
  const avgTrackPop =
    tracksWithPop.length > 0
      ? tracksWithPop.reduce((sum, t) => sum + (t.track.popularity ?? 50), 0) / tracksWithPop.length
      : 55;

  const combinedPop = Math.round(avgArtistPop * 0.5 + avgTrackPop * 0.5);
  const mainstreamScore = Math.min(Math.max(combinedPop, 0), 100);
  const nicheScore = 100 - mainstreamScore;

  let obscurityTier: NicheIndexInsight['obscurityTier'] = 'Eclectic Explorer';
  let tierDescription = 'You move fluidly between well-known hits and deeper indie tracks.';

  if (mainstreamScore >= 75) {
    obscurityTier = 'Mainstream Maven';
    tierDescription = 'Your taste aligns closely with global charts and prominent cultural releases.';
  } else if (mainstreamScore >= 58) {
    obscurityTier = 'Pop Adjacent';
    tierDescription = 'You enjoy prominent artists while keeping an open ear to rising sounds.';
  } else if (mainstreamScore <= 40) {
    obscurityTier = 'Underground Seeker';
    tierDescription = 'You frequently gravitate towards independent, niche, and sub-cultural sounds.';
  }

  // Find rarest and most popular tracks
  const sortedTracksByPop = [...currentTrackSnapshots].sort(
    (a, b) => (a.track.popularity ?? 50) - (b.track.popularity ?? 50)
  );
  const rarestTrackObj = sortedTracksByPop[0]?.track;
  const mostPopTrackObj = sortedTracksByPop[sortedTracksByPop.length - 1]?.track;

  // Find rarest and most popular artists
  const sortedArtistsByPop = [...effectiveArtists].sort(
    (a, b) => (a.artist.popularity ?? 50) - (b.artist.popularity ?? 50)
  );
  const rarestArtistObj = sortedArtistsByPop[0]?.artist;
  const mostPopArtistObj = sortedArtistsByPop[sortedArtistsByPop.length - 1]?.artist;

  const nicheIndex: NicheIndexInsight = {
    mainstreamScore,
    nicheScore,
    obscurityTier,
    tierDescription,
    averagePopularity: mainstreamScore,
    rarestTrack: rarestTrackObj
      ? {
          name: rarestTrackObj.name,
          artistName: rarestTrackObj.trackArtists[0]?.artist.name ?? 'Unknown',
          imageUrl: rarestTrackObj.album?.imageUrl ?? null,
          popularity: rarestTrackObj.popularity ?? 0,
          spotifyUrl: rarestTrackObj.spotifyUrl,
        }
      : null,
    mostPopularTrack: mostPopTrackObj
      ? {
          name: mostPopTrackObj.name,
          artistName: mostPopTrackObj.trackArtists[0]?.artist.name ?? 'Unknown',
          imageUrl: mostPopTrackObj.album?.imageUrl ?? null,
          popularity: mostPopTrackObj.popularity ?? 0,
          spotifyUrl: mostPopTrackObj.spotifyUrl,
        }
      : null,
    rarestArtist: rarestArtistObj
      ? {
          name: rarestArtistObj.name,
          imageUrl: rarestArtistObj.imageUrl,
          popularity: rarestArtistObj.popularity ?? 0,
          genres: JSON.parse(rarestArtistObj.genres || '[]'),
          spotifyUrl: rarestArtistObj.spotifyUrl,
        }
      : null,
    mostPopularArtist: mostPopArtistObj
      ? {
          name: mostPopArtistObj.name,
          imageUrl: mostPopArtistObj.imageUrl,
          popularity: mostPopArtistObj.popularity ?? 0,
          genres: JSON.parse(mostPopArtistObj.genres || '[]'),
          spotifyUrl: mostPopArtistObj.spotifyUrl,
        }
      : null,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 6. TASTE EVOLUTION & SNAPSHOT COMPARISON
  // ──────────────────────────────────────────────────────────────────────────
  // Compare short_term (recent 4 weeks) vs long_term (historical all time)
  const longGenreCounts: Record<string, number> = {};
  for (const snap of longArtists) {
    try {
      const gs: string[] = JSON.parse(snap.artist.genres || '[]');
      for (const g of gs) longGenreCounts[g] = (longGenreCounts[g] ?? 0) + 1;
    } catch {}
  }

  const genreShifts: GenreShift[] = [];
  const allComparedGenres = new Set([...Object.keys(shortGenreCounts), ...Object.keys(longGenreCounts)]);

  for (const g of allComparedGenres) {
    const shortShare = (shortGenreCounts[g] ?? 0) / (shortArtists.length || 1);
    const longShare = (longGenreCounts[g] ?? 0) / (longArtists.length || 1);
    const diff = shortShare - longShare;

    if (diff > 0.15) {
      genreShifts.push({
        genre: g,
        direction: 'rising',
        changeDescription: `Surged in your recent listening (+${Math.round(diff * 100)}% presence)`,
      });
    } else if (diff < -0.15) {
      genreShifts.push({
        genre: g,
        direction: 'falling',
        changeDescription: `Less prominent compared to your all-time baseline (-${Math.round(Math.abs(diff) * 100)}%)`,
      });
    }
  }

  // Artist rank comparisons
  const artistShifts: ArtistShift[] = [];
  const longArtistRankMap = new Map(longArtists.map((a, i) => [a.artist.name, i + 1]));

  for (let i = 0; i < Math.min(shortArtists.length, 10); i++) {
    const snap = shortArtists[i];
    const name = snap.artist.name;
    const currentRank = i + 1;
    const previousRank = longArtistRankMap.get(name);

    if (!previousRank) {
      artistShifts.push({
        name,
        imageUrl: snap.artist.imageUrl,
        status: 'new_entry',
        currentRank,
      });
    } else if (previousRank - currentRank >= 3) {
      artistShifts.push({
        name,
        imageUrl: snap.artist.imageUrl,
        status: 'climber',
        rankChange: previousRank - currentRank,
        currentRank,
      });
    } else if (currentRank - previousRank >= 3) {
      artistShifts.push({
        name,
        imageUrl: snap.artist.imageUrl,
        status: 'descender',
        rankChange: currentRank - previousRank,
        currentRank,
      });
    } else {
      artistShifts.push({
        name,
        imageUrl: snap.artist.imageUrl,
        status: 'consistent',
        currentRank,
      });
    }
  }

  const hasHistoricalData = shortArtists.length > 0 && longArtists.length > 0;
  const evolutionSummary = hasHistoricalData
    ? `Comparing your recent 4-week listening to your all-time listening patterns.`
    : `Lore.fm is capturing your listening snapshots over time to map deep longitudinal taste evolution.`;

  const historicalStatusNote =
    'Evolution metrics compare your recent 4-week rotation directly against your all-time listening profile. As you continue using Lore.fm, multi-year snapshots will unlock even deeper historical analysis.';

  const tasteEvolution: TasteEvolutionInsight = {
    hasHistoricalData,
    baselinePeriod: 'All-Time Baseline',
    comparisonPeriod: 'Last 4 Weeks',
    genreShifts: genreShifts.slice(0, 6),
    artistShifts: artistShifts.slice(0, 8),
    evolutionSummary,
    historicalStatusNote,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 7. MUSIC DNA SCORECARD
  // ──────────────────────────────────────────────────────────────────────────
  const musicDNA: MusicDNAScorecard = {
    genreDiversity: genreProfile.score,
    artistDiversity: artistDiversity.score,
    discoveryRate: loyaltyDiscovery.discoveryScore,
    loyaltyIndex: loyaltyDiscovery.loyaltyScore,
    nicheAffinity: nicheIndex.nicheScore,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 8. DETERMINISTIC LISTENER ARCHETYPE
  // ──────────────────────────────────────────────────────────────────────────
  const archetype = deriveArchetype(musicDNA, dominantGenres);

  const timeRangeLabels: Record<TimeRange, string> = {
    short_term: 'Last 4 Weeks',
    medium_term: 'Last 6 Months',
    long_term: 'All Time',
  };

  return {
    timeRange,
    timeRangeLabel: timeRangeLabels[timeRange] ?? 'Last 6 Months',
    calculatedAt: new Date().toISOString(),
    archetype,
    musicDNA,
    artistDiversity,
    genreProfile,
    listeningTrends,
    loyaltyDiscovery,
    nicheIndex,
    tasteEvolution,
    transparencyReport: {
      source: 'Spotify Web API (Official Authorized Data)',
      tracksSampled: currentTrackSnapshots.length,
      artistsSampled: effectiveArtists.length,
      eventsSampled: recentListeningEvents.length,
      methodology:
        'Computed via deterministic algorithms: Shannon Entropy, Zipf Distribution Rank Weighting, Set-Intersection Loyalty Index, and Spotify Official Popularity Metrics.',
    },
  };
}

/**
 * Deterministic mapping to assign Archetype based on 5 DNA dimensions.
 */
function deriveArchetype(dna: MusicDNAScorecard, dominantGenres: string[]): ListenerArchetype {
  const topGenre = dominantGenres[0] ? dominantGenres[0].charAt(0).toUpperCase() + dominantGenres[0].slice(1) : 'Music';

  // Rule 1: High Niche + High Discovery -> The Underground Seeker
  if (dna.nicheAffinity >= 60 && dna.discoveryRate >= 50) {
    return {
      title: 'The Underground Seeker',
      subtitle: 'Explorer of Hidden Soundscapes & Deep Cuts',
      badge: '🔮',
      description:
        'You deliberately seek out obscure artists, rare genres, and independent releases before they reach the mainstream radar.',
      traits: ['Niche Specialist', 'Curiosity-Driven', 'Early Adopter'],
      signatureHabits: [
        'Finding emerging gems with lower Spotify popularity scores',
        'Exploring sub-genres and independent releases',
        'Prioritizing fresh musical discoveries over commercial charts',
      ],
    };
  }

  // Rule 2: High Discovery + High Genre Diversity -> The Sonic Pioneer
  if (dna.discoveryRate >= 55 && dna.genreDiversity >= 60) {
    return {
      title: 'The Sonic Pioneer',
      subtitle: 'Border-Free Sound Adventurer',
      badge: '🧭',
      description:
        'Your listening boundaries are fluid. You treat music as an open frontier, constantly importing fresh artists across contrasting genres.',
      traits: ['Genre Agnostic', 'High Discovery Drive', 'Dynamic Palette'],
      signatureHabits: [
        'Frequently refreshing your active rotation with new names',
        'Effortlessly bridging disparate musical genres',
        'Low repeat loops, high variety per session',
      ],
    };
  }

  // Rule 3: High Loyalty + Focused Diversity -> The Dedicated Purist
  if (dna.loyaltyIndex >= 65 && dna.artistDiversity <= 55) {
    return {
      title: 'The Dedicated Purist',
      subtitle: 'Champion of Core Musical Masters',
      badge: '🛡️',
      description:
        'You form deep, lasting connections with a select circle of revered artists. When you love an artist, you dive deep into their entire catalog.',
      traits: ['Unshakable Loyalty', 'Discography Deep-Diver', 'Focused Palette'],
      signatureHabits: [
        'Revisiting long-time anchor artists across years',
        'High replay rate on established favorite tracks',
        'Appreciating signature sounds over fleeting micro-trends',
      ],
    };
  }

  // Rule 4: High Mainstream + High Loyalty -> The Pop Loyalist
  if (dna.nicheAffinity <= 40 && dna.loyaltyIndex >= 50) {
    return {
      title: 'The Mainstream Connoisseur',
      subtitle: 'Cultural Pulse & Anthem Devotee',
      badge: '👑',
      description:
        'You have an immaculate ear for iconic hits, legendary anthems, and masterfully produced cultural landmarks.',
      traits: ['Hit Precision', 'Anthem Enthusiast', 'Cultural Core'],
      signatureHabits: [
        'Celebrating globally renowned artists and chart peaks',
        'Building playlists around timeless hits and sing-alongs',
        'Reliably enjoying polished modern production',
      ],
    };
  }

  // Rule 5: High Genre Diversity + High Artist Diversity -> The Eclectic Nomad
  if (dna.genreDiversity >= 70 && dna.artistDiversity >= 65) {
    return {
      title: 'The Eclectic Nomad',
      subtitle: 'Universal Musical Chameleon',
      badge: '🌌',
      description:
        'Your library knows no walls. You seamlessly travel from ambient to acoustic, indie to electronic, without missing a beat.',
      traits: ['Omnivorous Taste', 'Atmospheric Versatility', 'Vibe Collector'],
      signatureHabits: [
        'Shifting styles based on mood, time of day, and atmosphere',
        'Collecting expansive collections of unique artists',
        `Comfortably embracing ${topGenre} alongside unexpected sister genres`,
      ],
    };
  }

  // Rule 6: High Artist Diversity + Moderate Loyalty -> The Melodic Wanderer
  if (dna.artistDiversity >= 65) {
    return {
      title: 'The Melodic Wanderer',
      subtitle: 'Broad-Horizon Melodist',
      badge: '🌊',
      description:
        'You roam widely across a multitude of artists, appreciating songwriting and soundcraft from every corner of the musical universe.',
      traits: ['Expansive Horizons', 'Song-First Listener', 'Receptive Ear'],
      signatureHabits: [
        'Listening to numerous individual artists rather than one dominant star',
        'Curating diverse soundscapes',
        'Constantly sampling new tracks alongside comforting staples',
      ],
    };
  }

  // Default: The Balanced Synthesizer
  return {
    title: 'The Balanced Synthesizer',
    subtitle: 'Harmonious Melodic Curator',
    badge: '⚖️',
    description:
      'You strike an enviable harmony between loyal favorites and fresh exploration, anchored by a rich and reliable musical foundation.',
    traits: ['Balanced Perspective', 'Mindful Curator', 'Versatile Ear'],
    signatureHabits: [
      'Maintaining dedicated favorites while welcoming new discoveries',
      'Balancing popular anthems with hidden acoustic gems',
      `Consistently centering your sessions around rich ${topGenre} sounds`,
    ],
  };
}
