/**
 * Timeline & Artist Journey Analytics Engine
 *
 * Grounded strictly in real Spotify data:
 * - Multi-period top artists & tracks (short_term, medium_term, long_term)
 * - Recorded listening events with real timestamps
 * - Artist & track snapshots across time
 *
 * No fake play counts, dates, or invented tracks.
 */

import { prisma } from '../services/prisma';
import {
  getTopArtists,
  getTopTracks,
  saveArtistSnapshot,
  saveTrackSnapshot,
  saveGenreSnapshot,
} from '../services/spotify';
import type { SpotifyArtist, SpotifyTrack } from '../types/spotify';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ArtistTopSong {
  id: string;
  title: string;
  albumName: string;
  albumImageUrl: string | null;
  releaseDate: string | null;
  releaseYear: string | null;
  durationMs: number;
  userBestRank: {
    rank: number;
    period: 'short_term' | 'medium_term' | 'long_term';
    periodLabel: string;
  } | null;
  previewUrl: string | null;
  spotifyUrl: string | null;
  explicit: boolean;
  recordedPlays: number;
  allTimeRank: number;
  allTimeListenScore: number;
}

export interface PeakListeningDay {
  hasRecordedDay: boolean;
  date: string | null;
  dateFormatted: string | null;
  playCount: number;
  topTrackName: string | null;
  transparencyNote: string;
}

export interface ArtistRankNode {
  era: '1_year' | '6_months' | '4_weeks';
  label: string;
  rank: number | null;
  isRanked: boolean;
}

export interface ArtistJourney {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  spotifyUrl: string | null;
  currentRank: number;
  longTermRank: number | null;
  mediumTermRank: number | null;
  shortTermRank: number | null;
  trajectoryType:
    | 'longstanding_anchor'
    | 'rising_sensation'
    | 'recent_obsession'
    | 'historical_pillar'
    | 'resurgent_favorite'
    | 'consistent_staple';
  trajectoryLabel: string;
  trajectoryDescription: string;
  prominenceMilestone: {
    eraDetected: string;
    firstRecordedRank: number | null;
    peakRank: number;
    peakEraLabel: string;
    description: string;
  };
  peakListeningDay: PeakListeningDay;
  listeningTrend: {
    direction: 'rising' | 'peaking' | 'steady' | 'cooling' | 'new';
    directionLabel: string;
    momentumDelta: number; // e.g. +4 spots climbed from 1Y to 4W
    summary: string;
    rankNodes: ArtistRankNode[];
  };
  topSongs: ArtistTopSong[];
  historicalImportance: {
    score: number; // 0–100
    tier: 'Core Musical Pillar' | 'Era Defining' | 'Heavy Rotation Staple' | 'Breakout Star' | 'Emerging Favorite';
    topTracksCount: number; // How many of user's top tracks belong to this artist
    erasPresentCount: number; // 1, 2, or 3 eras
    primaryGenre: string | null;
    summary: string;
  };
  storyNarrative: {
    headline: string;
    chapterTitle: string;
    narrative: string;
    keyHighlight: string;
  };
}

export interface TimelineEraSummary {
  eraKey: '1_year' | '6_months' | '4_weeks';
  title: string;
  timeframe: string;
  subtitle: string;
  top5Artists: {
    rank: number;
    id: string;
    name: string;
    imageUrl: string | null;
    genres: string[];
  }[];
  dominantGenres: string[];
  atmosphere: string;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  artistName: string;
  artistImageUrl: string | null;
  type: 'rank_peak' | 'new_entry' | 'enduring_anchor' | 'major_surge' | 'era_leader';
  description: string;
  era: '1_year' | '6_months' | '4_weeks';
  eraLabel: string;
}

export interface TimelineData {
  userId: string;
  generatedAt: string;
  top5Artists: ArtistJourney[];
  overallTimeline: {
    eras: TimelineEraSummary[];
    milestones: TimelineMilestone[];
    crossEraSummary: string;
  };
  dataProvenance: {
    shortTermArtistsSampled: number;
    mediumTermArtistsSampled: number;
    longTermArtistsSampled: number;
    totalTracksAnalyzed: number;
    listeningEventsCount: number;
    hasContinuousHistory: boolean;
    notice: string;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getReleaseYear(releaseDate: string | null | undefined): string | null {
  if (!releaseDate) return null;
  return releaseDate.substring(0, 4);
}

// ─── Timeline Engine Main Function ──────────────────────────────────────────

export async function calculateTimelineJourney(userId: string): Promise<TimelineData> {
  // 1. Fetch Spotify multi-era top artists and tracks, snapshots, and listening events in parallel
  const [
    shortArtistsRes,
    mediumArtistsRes,
    longArtistsRes,
    shortTracksRes,
    mediumTracksRes,
    longTracksRes,
    dbListeningEvents,
    dbTrackSnapshots,
  ] = await Promise.all([
    getTopArtists(userId, 'short_term', 50),
    getTopArtists(userId, 'medium_term', 50),
    getTopArtists(userId, 'long_term', 50),
    getTopTracks(userId, 'short_term', 50),
    getTopTracks(userId, 'medium_term', 50),
    getTopTracks(userId, 'long_term', 50),
    prisma.listeningEvent.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            album: true,
            trackArtists: {
              include: { artist: true },
            },
          },
        },
      },
      orderBy: { playedAt: 'desc' },
      take: 2000,
    }),
    prisma.trackSnapshot.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            album: true,
            trackArtists: {
              include: { artist: true },
            },
          },
        },
      },
      orderBy: { capturedAt: 'desc' },
      take: 2000,
    }),
  ]);

  const shortArtists = shortArtistsRes.items ?? [];
  const mediumArtists = mediumArtistsRes.items ?? [];
  const longArtists = longArtistsRes.items ?? [];

  const shortTracks = shortTracksRes.items ?? [];
  const mediumTracks = mediumTracksRes.items ?? [];
  const longTracks = longTracksRes.items ?? [];

  // Persist snapshots asynchronously (fire & forget)
  Promise.all([
    saveArtistSnapshot(userId, shortArtists, 'short_term'),
    saveArtistSnapshot(userId, mediumArtists, 'medium_term'),
    saveArtistSnapshot(userId, longArtists, 'long_term'),
    saveTrackSnapshot(userId, shortTracks, 'short_term'),
    saveTrackSnapshot(userId, mediumTracks, 'medium_term'),
    saveTrackSnapshot(userId, longTracks, 'long_term'),
    saveGenreSnapshot(userId, mediumArtists, 'medium_term'),
  ]).catch((err) => console.error('[TimelineSnapshot] Error:', err.message));

  // 2. Identify the Top 5 Artists
  // We prioritize medium_term (representative 6-month recent baseline), but combine with long and short
  const artistScoreMap = new Map<
    string,
    {
      artist: SpotifyArtist;
      mediumRank: number | null;
      longRank: number | null;
      shortRank: number | null;
      compositeScore: number;
    }
  >();

  // Register all unique artists from the 3 sets
  const registerArtist = (artist: SpotifyArtist) => {
    if (!artistScoreMap.has(artist.id)) {
      artistScoreMap.set(artist.id, {
        artist,
        mediumRank: null,
        longRank: null,
        shortRank: null,
        compositeScore: 0,
      });
    }
  };

  mediumArtists.forEach(registerArtist);
  longArtists.forEach(registerArtist);
  shortArtists.forEach(registerArtist);

  // Fill in exact ranks across the 3 timeframes
  mediumArtists.forEach((a, i) => {
    const entry = artistScoreMap.get(a.id);
    if (entry) {
      entry.mediumRank = i + 1;
      entry.compositeScore += (51 - (i + 1)) * 3; // Medium term heavy weight
    }
  });

  longArtists.forEach((a, i) => {
    const entry = artistScoreMap.get(a.id);
    if (entry) {
      entry.longRank = i + 1;
      entry.compositeScore += (51 - (i + 1)) * 2; // Long term weight
    }
  });

  shortArtists.forEach((a, i) => {
    const entry = artistScoreMap.get(a.id);
    if (entry) {
      entry.shortRank = i + 1;
      entry.compositeScore += (51 - (i + 1)) * 2.5; // Short term weight
    }
  });

  // Sort by composite score to pick the true Top 5
  const rankedAllArtists = Array.from(artistScoreMap.values()).sort(
    (a, b) => b.compositeScore - a.compositeScore
  );

  // Pick top 5 (or all if fewer than 5)
  const top5Selected = rankedAllArtists.slice(0, 5);

  // 3. Process each Top 5 Artist's personal journey
  const artistJourneys: ArtistJourney[] = top5Selected.map((item, index) => {
    const { artist, mediumRank, longRank, shortRank } = item;
    const currentDisplayRank = index + 1;

    // ─── A. Listening Relationship Trajectory ─────────────────────────────────
    let trajectoryType: ArtistJourney['trajectoryType'] = 'consistent_staple';
    let trajectoryLabel = 'Steady Rotation Anchor';
    let trajectoryDescription = `${artist.name} has maintained a dependable, steady presence in your music rotation.`;

    if (longRank !== null && mediumRank !== null && shortRank !== null) {
      if (longRank <= 5 && mediumRank <= 5 && shortRank <= 5) {
        trajectoryType = 'longstanding_anchor';
        trajectoryLabel = 'Foundational Anchor';
        trajectoryDescription = `A permanent cornerstone of your music history, holding top 5 status across all measured timeframes.`;
      } else if (shortRank < (longRank ?? 50) - 5) {
        trajectoryType = 'rising_sensation';
        trajectoryLabel = 'Rising Phenomenon';
        trajectoryDescription = `Surging upward over the past year, steadily climbing from rank #${longRank} to rank #${shortRank}.`;
      } else if ((shortRank ?? 50) > (longRank ?? 1) + 5) {
        trajectoryType = 'historical_pillar';
        trajectoryLabel = 'Historic Pillar';
        trajectoryDescription = `A powerhouse of your 1-year baseline (rank #${longRank}) that has slightly settled into a more relaxed rotation today.`;
      } else if (mediumRank > (longRank ?? 1) + 3 && shortRank < mediumRank - 3) {
        trajectoryType = 'resurgent_favorite';
        trajectoryLabel = 'Resurgent Favorite';
        trajectoryDescription = `After a temporary dip around the 6-month mark, ${artist.name} made a strong comeback in recent weeks.`;
      }
    } else if (longRank === null && shortRank !== null) {
      trajectoryType = 'recent_obsession';
      trajectoryLabel = 'Recent Obsession';
      trajectoryDescription = `A completely new arrival in your 4-week heavy rotation that was absent from your 1-year baseline.`;
    } else if (longRank !== null && shortRank === null) {
      trajectoryType = 'historical_pillar';
      trajectoryLabel = 'Legacy Favorite';
      trajectoryDescription = `A major defining artist of your yearly baseline (#${longRank}) that has cycled out of your immediate 4-week window.`;
    }

    // ─── B. Prominence Milestone ──────────────────────────────────────────────
    let eraDetected = 'Long-Term Baseline (1+ Year Ago)';
    let firstRecordedRank = longRank;
    if (longRank === null && mediumRank !== null) {
      eraDetected = 'Mid-Year Emergence (~6 Months Ago)';
      firstRecordedRank = mediumRank;
    } else if (longRank === null && mediumRank === null && shortRank !== null) {
      eraDetected = 'Recent Surge (~4 Weeks Ago)';
      firstRecordedRank = shortRank;
    }

    const availableRanks = [longRank, mediumRank, shortRank].filter(
      (r): r is number => r !== null
    );
    const peakRank = availableRanks.length > 0 ? Math.min(...availableRanks) : currentDisplayRank;

    let peakEraLabel = 'Past Year';
    if (peakRank === shortRank) peakEraLabel = 'Last 4 Weeks';
    else if (peakRank === mediumRank) peakEraLabel = 'Last 6 Months';
    else if (peakRank === longRank) peakEraLabel = '1 Year Ago';

    // ─── C. Peak Listening Day (from real database ListeningEvents) ───────────
    // Filter events for this artist
    const artistEvents = dbListeningEvents.filter((event) => {
      const trackArtists = event.track.trackArtists ?? [];
      return trackArtists.some(
        (ta) =>
          ta.artist.spotifyId === artist.id ||
          ta.artist.name.toLowerCase() === artist.name.toLowerCase()
      );
    });

    let peakDay: PeakListeningDay;
    if (artistEvents.length > 0) {
      // Group by calendar day (YYYY-MM-DD)
      const dayCounts = new Map<string, { count: number; trackNames: string[] }>();

      for (const ev of artistEvents) {
        const dayKey = ev.playedAt.toISOString().split('T')[0];
        const existing = dayCounts.get(dayKey) ?? { count: 0, trackNames: [] };
        existing.count += 1;
        existing.trackNames.push(ev.track.name);
        dayCounts.set(dayKey, existing);
      }

      // Find day with highest count
      let maxDay = '';
      let maxCount = 0;
      let topTrackName = '';

      for (const [dayKey, data] of dayCounts.entries()) {
        if (data.count > maxCount) {
          maxCount = data.count;
          maxDay = dayKey;
          // Most common track on this day
          const trackFreq = new Map<string, number>();
          data.trackNames.forEach((t) => trackFreq.set(t, (trackFreq.get(t) ?? 0) + 1));
          let bestT = data.trackNames[0];
          let bestFreq = 0;
          for (const [tName, freq] of trackFreq.entries()) {
            if (freq > bestFreq) {
              bestFreq = freq;
              bestT = tName;
            }
          }
          topTrackName = bestT;
        }
      }

      peakDay = {
        hasRecordedDay: true,
        date: maxDay,
        dateFormatted: formatEventDate(maxDay),
        playCount: maxCount,
        topTrackName: topTrackName || null,
        transparencyNote: `Calculated from ${artistEvents.length} timestamped play event${
          artistEvents.length === 1 ? '' : 's'
        } logged in your listening history.`,
      };
    } else {
      peakDay = {
        hasRecordedDay: false,
        date: null,
        dateFormatted: null,
        playCount: 0,
        topTrackName: null,
        transparencyNote: `Spotify Web API provides recent history in rolling batches. As you use Lore.fm, exact timestamped daily peaks will continue to populate.`,
      };
    }

    // ─── D. Listening Trend ───────────────────────────────────────────────────
    let direction: ArtistJourney['listeningTrend']['direction'] = 'steady';
    let directionLabel = 'Steady';
    let momentumDelta = 0;

    if (longRank !== null && shortRank !== null) {
      momentumDelta = longRank - shortRank; // positive = climbed higher rank
      if (momentumDelta >= 3) {
        direction = 'rising';
        directionLabel = 'Climbing';
      } else if (momentumDelta <= -3) {
        direction = 'cooling';
        directionLabel = 'Cooling Down';
      } else {
        direction = 'steady';
        directionLabel = 'Stable';
      }
    } else if (longRank === null && shortRank !== null) {
      direction = 'new';
      directionLabel = 'New Entrant';
      momentumDelta = 50 - shortRank;
    } else if (longRank !== null && shortRank === null) {
      direction = 'cooling';
      directionLabel = 'Faded From Recent';
      momentumDelta = -20;
    }

    const rankNodes: ArtistRankNode[] = [
      {
        era: '1_year',
        label: '1 Year Baseline',
        rank: longRank,
        isRanked: longRank !== null,
      },
      {
        era: '6_months',
        label: '6 Months Ago',
        rank: mediumRank,
        isRanked: mediumRank !== null,
      },
      {
        era: '4_weeks',
        label: 'Last 4 Weeks',
        rank: shortRank,
        isRanked: shortRank !== null,
      },
    ];

    let trendSummary = `${artist.name} is currently ranked #${shortRank ?? '—'} in your 4-week rotation.`;
    if (direction === 'rising') {
      trendSummary = `Surged ${Math.abs(momentumDelta)} spots upward from #${longRank} a year ago to #${shortRank} today.`;
    } else if (direction === 'cooling' && longRank !== null) {
      trendSummary = `Held #${longRank} in your 1-year baseline; currently lower in your immediate 4-week window.`;
    } else if (direction === 'new') {
      trendSummary = `Newly arrived directly at #${shortRank} in your recent 4-week listening.`;
    } else if (direction === 'steady' && longRank !== null && shortRank !== null) {
      trendSummary = `Consistently held top-tier ranking throughout the year (#${longRank} → #${mediumRank} → #${shortRank}).`;
    }

    // ─── E. Top 5 Most-Listened Songs based on ALL-TIME listening history ─────
    // Rank songs by how many times user has listened across ALL available historical data
    interface TrackAggEntry {
      id: string;
      title: string;
      albumName: string;
      albumImageUrl: string | null;
      releaseDate: string | null;
      durationMs: number;
      previewUrl: string | null;
      spotifyUrl: string | null;
      explicit: boolean;
      bestRank: { rank: number; period: 'short_term' | 'medium_term' | 'long_term'; periodLabel: string } | null;
      allTimeListenScore: number;
      recordedPlays: number;
      snapshotOccurrences: number;
    }

    const trackAggMap = new Map<string, TrackAggEntry>();

    // Helper to register / update track in map
    const registerOrUpdateTrack = (
      spotifyId: string,
      title: string,
      albumName: string,
      albumImageUrl: string | null,
      releaseDate: string | null,
      durationMs: number,
      previewUrl: string | null,
      spotifyUrl: string | null,
      explicit: boolean
    ): TrackAggEntry => {
      if (!trackAggMap.has(spotifyId)) {
        trackAggMap.set(spotifyId, {
          id: spotifyId,
          title,
          albumName,
          albumImageUrl,
          releaseDate,
          durationMs,
          previewUrl,
          spotifyUrl,
          explicit,
          bestRank: null,
          allTimeListenScore: 0,
          recordedPlays: 0,
          snapshotOccurrences: 0,
        });
      }
      return trackAggMap.get(spotifyId)!;
    };

    // 1) Process database ListeningEvents (exact logged playback counts)
    for (const ev of artistEvents) {
      const dbTrack = ev.track;
      const entry = registerOrUpdateTrack(
        dbTrack.spotifyId,
        dbTrack.name,
        dbTrack.album?.name ?? 'Single / EP',
        dbTrack.album?.imageUrl ?? null,
        dbTrack.album?.releaseDate ?? null,
        dbTrack.durationMs,
        dbTrack.previewUrl ?? null,
        dbTrack.spotifyUrl ?? null,
        dbTrack.explicit
      );
      entry.recordedPlays += 1;
      entry.allTimeListenScore += 25; // High weight per recorded listen event
    }

    // 2) Process database TrackSnapshots across history
    const artistSnapshots = dbTrackSnapshots.filter((ts) => {
      const trackArtists = ts.track.trackArtists ?? [];
      return trackArtists.some(
        (ta) =>
          ta.artist.spotifyId === artist.id ||
          ta.artist.name.toLowerCase() === artist.name.toLowerCase()
      );
    });

    for (const ts of artistSnapshots) {
      const dbTrack = ts.track;
      const entry = registerOrUpdateTrack(
        dbTrack.spotifyId,
        dbTrack.name,
        dbTrack.album?.name ?? 'Single / EP',
        dbTrack.album?.imageUrl ?? null,
        dbTrack.album?.releaseDate ?? null,
        dbTrack.durationMs,
        dbTrack.previewUrl ?? null,
        dbTrack.spotifyUrl ?? null,
        dbTrack.explicit
      );
      entry.snapshotOccurrences += 1;
      const rankWeight = Math.max(1, 51 - ts.rank);
      const eraMultiplier = ts.timeRange === 'long_term' ? 4 : ts.timeRange === 'medium_term' ? 3 : 2;
      entry.allTimeListenScore += rankWeight * eraMultiplier;

      const periodLabel =
        ts.timeRange === 'short_term'
          ? 'Recent (4W)'
          : ts.timeRange === 'medium_term'
          ? '6 Months'
          : 'All-Time (1Y)';

      if (!entry.bestRank || ts.rank < entry.bestRank.rank) {
        entry.bestRank = {
          rank: ts.rank,
          period: ts.timeRange as 'short_term' | 'medium_term' | 'long_term',
          periodLabel,
        };
      }
    }

    // 3) Process multi-period Spotify top tracks (long_term all-time baseline prioritized)
    const ingestSpotifyTrack = (
      t: SpotifyTrack,
      period: 'short_term' | 'medium_term' | 'long_term',
      rank: number
    ) => {
      const matchesArtist = t.artists?.some(
        (a) => a.id === artist.id || a.name.toLowerCase() === artist.name.toLowerCase()
      );
      if (!matchesArtist) return;

      const entry = registerOrUpdateTrack(
        t.id,
        t.name,
        t.album?.name ?? 'Single / EP',
        t.album?.images?.[0]?.url ?? null,
        t.album?.release_date ?? null,
        t.duration_ms,
        t.preview_url ?? null,
        t.external_urls?.spotify ?? null,
        t.explicit ?? false
      );

      // Long-term all-time rank gives the highest foundational listen weight
      const weight = period === 'long_term' ? 5 : period === 'medium_term' ? 3 : 2;
      entry.allTimeListenScore += (51 - rank) * weight;

      const periodLabel =
        period === 'short_term'
          ? 'Recent (4W)'
          : period === 'medium_term'
          ? '6 Months'
          : 'All-Time (1Y)';

      if (!entry.bestRank || rank < entry.bestRank.rank) {
        entry.bestRank = { rank, period, periodLabel };
      }
    };

    longTracks.forEach((t, i) => ingestSpotifyTrack(t, 'long_term', i + 1));
    mediumTracks.forEach((t, i) => ingestSpotifyTrack(t, 'medium_term', i + 1));
    shortTracks.forEach((t, i) => ingestSpotifyTrack(t, 'short_term', i + 1));

    // Sort songs primarily by all-time listen score / frequency across history
    const topSongsList: ArtistTopSong[] = Array.from(trackAggMap.values())
      .sort((a, b) => {
        // First priority: allTimeListenScore (combines recorded plays + historical rank weight)
        if (b.allTimeListenScore !== a.allTimeListenScore) {
          return b.allTimeListenScore - a.allTimeListenScore;
        }
        // Second priority: recorded plays
        if (b.recordedPlays !== a.recordedPlays) {
          return b.recordedPlays - a.recordedPlays;
        }
        // Third priority: best rank
        const rankA = a.bestRank?.rank ?? 999;
        const rankB = b.bestRank?.rank ?? 999;
        return rankA - rankB;
      })
      .slice(0, 5)
      .map((entry, songIndex) => ({
        id: entry.id,
        title: entry.title,
        albumName: entry.albumName,
        albumImageUrl: entry.albumImageUrl,
        releaseDate: entry.releaseDate,
        releaseYear: getReleaseYear(entry.releaseDate),
        durationMs: entry.durationMs,
        userBestRank: entry.bestRank,
        previewUrl: entry.previewUrl,
        spotifyUrl: entry.spotifyUrl,
        explicit: entry.explicit,
        recordedPlays: entry.recordedPlays,
        allTimeRank: songIndex + 1,
        allTimeListenScore: Math.round(entry.allTimeListenScore),
      }));

    // ─── F. Historical Importance Metric ─────────────────────────────────────
    let importanceScore = 0;
    // Rank score (up to 40)
    const avgRank =
      availableRanks.length > 0
        ? availableRanks.reduce((sum, r) => sum + r, 0) / availableRanks.length
        : 25;
    importanceScore += Math.max(0, Math.round((50 - avgRank) * 0.8));

    // Eras presence (up to 30)
    const erasCount = availableRanks.length;
    importanceScore += erasCount * 10;

    // Top tracks footprint (up to 30)
    const topTracksBelonging = topSongsList.length;
    importanceScore += Math.min(30, topTracksBelonging * 6);

    importanceScore = Math.min(99, Math.max(15, importanceScore));

    let tier: ArtistJourney['historicalImportance']['tier'] = 'Heavy Rotation Staple';
    if (importanceScore >= 85) tier = 'Core Musical Pillar';
    else if (importanceScore >= 70) tier = 'Era Defining';
    else if (importanceScore >= 50) tier = 'Heavy Rotation Staple';
    else if (direction === 'new' || direction === 'rising') tier = 'Breakout Star';
    else tier = 'Emerging Favorite';

    const primaryGenre = artist.genres?.[0] ?? null;
    const importanceSummary = `${artist.name} accounts for ${topTracksBelonging} of your top tracks across ${erasCount} measured listening era${
      erasCount === 1 ? '' : 's'
    }.`;

    // ─── G. Story-Driven Narrative ───────────────────────────────────────────
    const topSongNames = topSongsList.slice(0, 3).map((s) => `"${s.title}"`).join(', ');
    let storyHeadline = `${artist.name}'s Musical Footprint`;
    let chapterTitle = `Chapter ${index + 1}: The ${trajectoryLabel}`;
    let narrative = '';

    if (trajectoryType === 'longstanding_anchor') {
      storyHeadline = `An Enduring Cornerstone of Your Sound`;
      narrative = `${artist.name} is one of your truest musical constants. Spanning from your 1-year baseline (#${longRank}) straight through to your current rotation (#${shortRank}), their tracks${
        topSongNames ? ` like ${topSongNames}` : ''
      } form the bedrock of your listening diet.`;
    } else if (trajectoryType === 'rising_sensation') {
      storyHeadline = `The Upward Surge of ${artist.name}`;
      narrative = `Your listening relationship with ${artist.name} has deepened dramatically over time. Starting at rank #${longRank} a year ago, they steadily gained ground to reach rank #${shortRank} today, spearheaded by heavy spins on ${
        topSongNames || 'their signature tracks'
      }.`;
    } else if (trajectoryType === 'recent_obsession') {
      storyHeadline = `A Fresh Breakthrough Into Daily Rotation`;
      narrative = `${artist.name} represents one of your most decisive recent listening discoveries. Absent from your 1-year baseline, they broke straight into your current 4-week top tier at #${shortRank}${
        topSongNames ? ` fueled by ${topSongNames}` : ''
      }.`;
    } else if (trajectoryType === 'historical_pillar') {
      storyHeadline = `A Defining Pillar of Your Past Year`;
      narrative = `${artist.name} was central to your musical baseline over the past year (peaking at #${peakRank}). While your immediate rotation has diversified, their influence remains deeply woven into your overall history${
        topSongNames ? ` through favorites like ${topSongNames}` : ''
      }.`;
    } else {
      storyHeadline = `A Reliable Favorite Across Eras`;
      narrative = `${artist.name} has played a consistent role in your listening journey, appearing prominently across your 6-month and 4-week listening chapters with standout tracks like ${
        topSongNames || 'their catalog'
      }.`;
    }

    const keyHighlight = peakDay.hasRecordedDay
      ? `Peak listening logged on ${peakDay.dateFormatted} with ${peakDay.playCount} recorded plays.`
      : `Prominent across ${erasCount} era chapters with top rank #${peakRank}.`;

    return {
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url ?? null,
      genres: artist.genres ?? [],
      spotifyUrl: artist.external_urls?.spotify ?? null,
      currentRank: currentDisplayRank,
      longTermRank: longRank,
      mediumTermRank: mediumRank,
      shortTermRank: shortRank,
      trajectoryType,
      trajectoryLabel,
      trajectoryDescription,
      prominenceMilestone: {
        eraDetected,
        firstRecordedRank,
        peakRank,
        peakEraLabel,
        description: `First prominent during ${eraDetected}, reaching a peak rank of #${peakRank} in your ${peakEraLabel}.`,
      },
      peakListeningDay: peakDay,
      listeningTrend: {
        direction,
        directionLabel,
        momentumDelta,
        summary: trendSummary,
        rankNodes,
      },
      topSongs: topSongsList,
      historicalImportance: {
        score: importanceScore,
        tier,
        topTracksCount: topTracksBelonging,
        erasPresentCount: erasCount,
        primaryGenre,
        summary: importanceSummary,
      },
      storyNarrative: {
        headline: storyHeadline,
        chapterTitle,
        narrative,
        keyHighlight,
      },
    };
  });

  // 4. Overall Year Timeline Eras
  const era1Artists = longArtists.slice(0, 5).map((a, i) => ({
    rank: i + 1,
    id: a.id,
    name: a.name,
    imageUrl: a.images?.[0]?.url ?? null,
    genres: a.genres ?? [],
  }));

  const era2Artists = mediumArtists.slice(0, 5).map((a, i) => ({
    rank: i + 1,
    id: a.id,
    name: a.name,
    imageUrl: a.images?.[0]?.url ?? null,
    genres: a.genres ?? [],
  }));

  const era3Artists = shortArtists.slice(0, 5).map((a, i) => ({
    rank: i + 1,
    id: a.id,
    name: a.name,
    imageUrl: a.images?.[0]?.url ?? null,
    genres: a.genres ?? [],
  }));

  const extractDominantGenres = (artists: SpotifyArtist[]) => {
    const counts = new Map<string, number>();
    artists.forEach((a) => {
      (a.genres ?? []).forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([g]) => g);
  };

  const eras: TimelineEraSummary[] = [
    {
      eraKey: '1_year',
      title: 'Chapter 1: The Foundation',
      timeframe: 'Past 1 Year Baseline',
      subtitle: 'The core artists and sounds that established your long-term musical footprint.',
      top5Artists: era1Artists,
      dominantGenres: extractDominantGenres(longArtists.slice(0, 10)),
      atmosphere: 'Grounding baseline & long-standing staples',
    },
    {
      eraKey: '6_months',
      title: 'Chapter 2: The Transition',
      timeframe: 'Last 6 Months',
      subtitle: 'How your rotation evolved as new artists and genres began shifting your balance.',
      top5Artists: era2Artists,
      dominantGenres: extractDominantGenres(mediumArtists.slice(0, 10)),
      atmosphere: 'Evolving rotation & emerging favorites',
    },
    {
      eraKey: '4_weeks',
      title: 'Chapter 3: The Current Sound',
      timeframe: 'Last 4 Weeks',
      subtitle: 'Your immediate high-rotation favorites defining your sound right now.',
      top5Artists: era3Artists,
      dominantGenres: extractDominantGenres(shortArtists.slice(0, 10)),
      atmosphere: 'High-energy immediate rotation & fresh entries',
    },
  ];

  // 5. Milestones
  const milestones: TimelineMilestone[] = [];

  // Find top artists that achieved #1
  if (shortArtists[0]) {
    milestones.push({
      id: 'm1',
      title: `#1 in Current Rotation`,
      artistName: shortArtists[0].name,
      artistImageUrl: shortArtists[0].images?.[0]?.url ?? null,
      type: 'era_leader',
      description: `${shortArtists[0].name} commands the top spot in your immediate 4-week listening.`,
      era: '4_weeks',
      eraLabel: 'Current Rotation',
    });
  }

  // Find emerging artist in top 5
  const longArtistIds = new Set(longArtists.map((a) => a.id));
  const newTopArtist = shortArtists.slice(0, 5).find((a) => !longArtistIds.has(a.id));
  if (newTopArtist) {
    milestones.push({
      id: 'm2',
      title: `Breakout Entrant into Top 5`,
      artistName: newTopArtist.name,
      artistImageUrl: newTopArtist.images?.[0]?.url ?? null,
      type: 'new_entry',
      description: `${newTopArtist.name} entered your top rotation, rising from outside your yearly baseline.`,
      era: '4_weeks',
      eraLabel: 'Recent Discovery',
    });
  }

  // Find enduring anchor (in top 5 of both 1Y and 4W)
  const anchorArtist = shortArtists.slice(0, 5).find((sa) =>
    longArtists.slice(0, 5).some((la) => la.id === sa.id)
  );
  if (anchorArtist) {
    milestones.push({
      id: 'm3',
      title: `Evergreen Anchor`,
      artistName: anchorArtist.name,
      artistImageUrl: anchorArtist.images?.[0]?.url ?? null,
      type: 'enduring_anchor',
      description: `${anchorArtist.name} has maintained a top-5 position continuously across the entire year.`,
      era: '1_year',
      eraLabel: 'Year-Long Persistence',
    });
  }

  // Cross era summary
  const top1YName = longArtists[0]?.name ?? 'your baseline';
  const top4WName = shortArtists[0]?.name ?? 'your current rotation';
  const crossEraSummary =
    top1YName === top4WName
      ? `Your listening arc has been exceptionally loyal throughout the year, anchored by ${top1YName} at the helm while supporting artists rotated through your chapters.`
      : `Your musical center of gravity shifted over the year from ${top1YName} (1-year baseline) to ${top4WName} leading your current 4-week rotation.`;

  return {
    userId,
    generatedAt: new Date().toISOString(),
    top5Artists: artistJourneys,
    overallTimeline: {
      eras,
      milestones,
      crossEraSummary,
    },
    dataProvenance: {
      shortTermArtistsSampled: shortArtists.length,
      mediumTermArtistsSampled: mediumArtists.length,
      longTermArtistsSampled: longArtists.length,
      totalTracksAnalyzed: shortTracks.length + mediumTracks.length + longTracks.length,
      listeningEventsCount: dbListeningEvents.length,
      hasContinuousHistory: dbListeningEvents.length > 20,
      notice:
        'All data is derived 100% from your verified Spotify account (short-term, medium-term, and long-term endpoints) and local playback logs. No play counts, dates, or songs are invented.',
    },
  };
}
