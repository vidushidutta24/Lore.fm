/**
 * Multi-Period Taste Analytics Engine
 *
 * Compares listening behavior across 3 distinct timeframes:
 *  - short_term: Last 4 Weeks (Current Rotation)
 *  - medium_term: Last 6 Months (Recent Era)
 *  - long_term: Last 1 Year / All-Time (Long-Term Baseline)
 *
 * Computes exact mathematical delta vectors, trajectory shifts,
 * and audio tone characteristics for AI interpretation.
 */

import { calculateFullTasteProfile, FullTasteProfile, GenreItem } from './tasteEngine';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface MusicalCharacteristics {
  energy: number; // 0–100
  tempo: number; // BPM (e.g. 115)
  acousticness: number; // 0–100
  danceability: number; // 0–100
  atmosphere: string; // e.g. "Vibrant & Dynamic", "Mellow & Introspective", "Rhythmic & High-Energy"
  source: 'spotify_metadata_and_genre_vector';
}

export interface PeriodSummary {
  period: '4_weeks' | '6_months' | '1_year';
  periodLabel: string;
  archetype: {
    title: string;
    subtitle: string;
    traits: string[];
  };
  metrics: {
    artistDiversity: number;
    genreDiversity: number;
    discoveryRate: number;
    loyaltyScore: number;
    nicheScore: number;
  };
  topArtists: {
    name: string;
    rank: number;
    genres: string[];
    popularity: number | null;
  }[];
  topGenres: {
    genre: string;
    percentage: number;
  }[];
  musicalCharacteristics: MusicalCharacteristics;
}

export interface MetricDelta {
  name: string;
  yearly: number;
  recent: number;
  current: number;
  netChange: number; // current - yearly
  direction: 'rising' | 'falling' | 'stable';
  interpretation: string;
}

export interface TrajectoryInsight {
  emergingArtists: string[];
  decliningArtists: string[];
  coreAnchors: string[];
  risingGenres: string[];
  fadingGenres: string[];
  stableGenres: string[];
}

export interface TasteAnalysisContext {
  userId: string;
  generatedAt: string;
  hasSufficientData: boolean;
  dataSummary: {
    artistsSampled: number;
    tracksSampled: number;
    periodsAvailable: number;
  };
  current: PeriodSummary;
  recent: PeriodSummary;
  yearly: PeriodSummary;
  metricDeltas: {
    artistDiversity: MetricDelta;
    genreDiversity: MetricDelta;
    discovery: MetricDelta;
    loyalty: MetricDelta;
    nicheAffinity: MetricDelta;
    energy: MetricDelta;
    tempo: MetricDelta;
    acousticness: MetricDelta;
    danceability: MetricDelta;
  };
  trajectory: TrajectoryInsight;
}

// ─── Genre Musical Characteristic Mappings (Deterministic Baseline) ─────────

const GENRE_AUDIO_PROFILES: Record<
  string,
  { energy: number; tempo: number; acoustic: number; danceability: number }
> = {
  // Pop / Dance
  pop: { energy: 72, tempo: 120, acoustic: 22, danceability: 74 },
  dance: { energy: 84, tempo: 126, acoustic: 10, danceability: 82 },
  edm: { energy: 88, tempo: 128, acoustic: 8, danceability: 76 },
  electropop: { energy: 76, tempo: 122, acoustic: 18, danceability: 75 },
  synthpop: { energy: 70, tempo: 120, acoustic: 20, danceability: 70 },
  disco: { energy: 78, tempo: 122, acoustic: 15, danceability: 82 },

  // Rock / Metal / Punk
  rock: { energy: 78, tempo: 125, acoustic: 18, danceability: 48 },
  metal: { energy: 92, tempo: 135, acoustic: 5, danceability: 35 },
  punk: { energy: 88, tempo: 140, acoustic: 8, danceability: 42 },
  'indie rock': { energy: 68, tempo: 122, acoustic: 32, danceability: 54 },
  'hard rock': { energy: 85, tempo: 130, acoustic: 10, danceability: 45 },
  grunge: { energy: 80, tempo: 120, acoustic: 18, danceability: 44 },

  // Hip Hop / R&B / Urban
  'hip hop': { energy: 68, tempo: 95, acoustic: 16, danceability: 78 },
  rap: { energy: 72, tempo: 98, acoustic: 14, danceability: 79 },
  trap: { energy: 74, tempo: 138, acoustic: 12, danceability: 76 },
  'r&b': { energy: 54, tempo: 100, acoustic: 38, danceability: 68 },
  soul: { energy: 52, tempo: 105, acoustic: 45, danceability: 62 },
  neo_soul: { energy: 48, tempo: 95, acoustic: 50, danceability: 64 },

  // Indie / Alternative / Folk
  indie: { energy: 58, tempo: 116, acoustic: 42, danceability: 56 },
  'indie pop': { energy: 62, tempo: 118, acoustic: 35, danceability: 64 },
  'indie folk': { energy: 44, tempo: 108, acoustic: 75, danceability: 46 },
  folk: { energy: 38, tempo: 105, acoustic: 82, danceability: 44 },
  acoustic: { energy: 32, tempo: 102, acoustic: 88, danceability: 48 },
  'singer-songwriter': { energy: 40, tempo: 105, acoustic: 78, danceability: 50 },

  // Ambient / Classical / Electronic / Chill
  ambient: { energy: 24, tempo: 85, acoustic: 70, danceability: 22 },
  classical: { energy: 30, tempo: 95, acoustic: 88, danceability: 28 },
  lofi: { energy: 42, tempo: 82, acoustic: 62, danceability: 60 },
  chillout: { energy: 45, tempo: 98, acoustic: 52, danceability: 58 },
  downtempo: { energy: 48, tempo: 96, acoustic: 46, danceability: 62 },
  house: { energy: 80, tempo: 124, acoustic: 12, danceability: 78 },
  techno: { energy: 86, tempo: 130, acoustic: 8, danceability: 74 },

  // Latin / Reggae / World
  reggaeton: { energy: 76, tempo: 96, acoustic: 20, danceability: 85 },
  latin: { energy: 74, tempo: 115, acoustic: 26, danceability: 78 },
  afrobeats: { energy: 72, tempo: 108, acoustic: 24, danceability: 82 },
  reggae: { energy: 58, tempo: 82, acoustic: 35, danceability: 72 },
  jazz: { energy: 46, tempo: 105, acoustic: 68, danceability: 52 },
  blues: { energy: 52, tempo: 108, acoustic: 58, danceability: 50 },
};

/**
 * Deterministically compute musical characteristics from top genres and artists.
 */
function deriveMusicalCharacteristics(
  genres: GenreItem[],
  averagePopularity: number
): MusicalCharacteristics {
  if (!genres || genres.length === 0) {
    return {
      energy: 55,
      tempo: 115,
      acousticness: 35,
      danceability: 60,
      atmosphere: 'Balanced & Contemporary',
      source: 'spotify_metadata_and_genre_vector',
    };
  }

  let totalWeight = 0;
  let weightedEnergy = 0;
  let weightedTempo = 0;
  let weightedAcoustic = 0;
  let weightedDanceability = 0;

  for (const g of genres.slice(0, 10)) {
    const matchedKey = Object.keys(GENRE_AUDIO_PROFILES).find((key) =>
      g.genre.toLowerCase().includes(key)
    );
    const profile = matchedKey
      ? GENRE_AUDIO_PROFILES[matchedKey]
      : { energy: 60, tempo: 116, acoustic: 35, danceability: 60 };

    const weight = Math.max(1, g.count);
    totalWeight += weight;
    weightedEnergy += profile.energy * weight;
    weightedTempo += profile.tempo * weight;
    weightedAcoustic += profile.acoustic * weight;
    weightedDanceability += profile.danceability * weight;
  }

  const finalEnergy = totalWeight > 0 ? Math.round(weightedEnergy / totalWeight) : 58;
  const finalTempo = totalWeight > 0 ? Math.round(weightedTempo / totalWeight) : 116;
  const finalAcoustic = totalWeight > 0 ? Math.round(weightedAcoustic / totalWeight) : 36;
  const finalDanceability = totalWeight > 0 ? Math.round(weightedDanceability / totalWeight) : 62;

  let atmosphere = 'Balanced Dynamic Rotation';
  if (finalEnergy > 75 && finalDanceability > 70) {
    atmosphere = 'High-Energy & Vibrant Club Dynamic';
  } else if (finalAcoustic > 60) {
    atmosphere = 'Introspective, Organic & Acoustic';
  } else if (finalEnergy < 45 && finalTempo < 100) {
    atmosphere = 'Mellow, Downtempo & Ambient Atmosphere';
  } else if (finalEnergy > 70 && finalAcoustic < 25) {
    atmosphere = 'Punchy, Electrifying & Driving';
  } else if (finalDanceability > 70) {
    atmosphere = 'Rhythmic, Groove-Forward & Upbeat';
  } else {
    atmosphere = 'Harmonic & Melodic Pop-Leaning Spectrum';
  }

  return {
    energy: Math.min(99, Math.max(10, finalEnergy)),
    tempo: Math.min(180, Math.max(65, finalTempo)),
    acousticness: Math.min(99, Math.max(5, finalAcoustic)),
    danceability: Math.min(99, Math.max(15, finalDanceability)),
    atmosphere,
    source: 'spotify_metadata_and_genre_vector',
  };
}

function calculateMetricDelta(name: string, y: number, r: number, c: number): MetricDelta {
  const netChange = c - y;
  const direction: 'rising' | 'falling' | 'stable' =
    netChange > 4 ? 'rising' : netChange < -4 ? 'falling' : 'stable';

  let interpretation = `${name} has remained relatively steady across time.`;
  if (direction === 'rising') {
    interpretation = `${name} expanded significantly from ${y} (1-Year) to ${c} (4-Weeks).`;
  } else if (direction === 'falling') {
    interpretation = `${name} contracted from ${y} (1-Year) down to ${c} (4-Weeks).`;
  }

  return {
    name,
    yearly: Math.round(y),
    recent: Math.round(r),
    current: Math.round(c),
    netChange: Math.round(netChange),
    direction,
    interpretation,
  };
}

/**
 * Extracts PeriodSummary from FullTasteProfile
 */
function extractPeriodSummary(
  profile: FullTasteProfile,
  period: '4_weeks' | '6_months' | '1_year',
  label: string
): PeriodSummary {
  const musicalCharacteristics = deriveMusicalCharacteristics(
    profile.genreProfile.distribution,
    profile.nicheIndex.averagePopularity
  );

  return {
    period,
    periodLabel: label,
    archetype: {
      title: profile.archetype.title,
      subtitle: profile.archetype.subtitle,
      traits: profile.archetype.traits,
    },
    metrics: {
      artistDiversity: profile.artistDiversity.score,
      genreDiversity: profile.genreProfile.score,
      discoveryRate: profile.loyaltyDiscovery.discoveryScore,
      loyaltyScore: profile.loyaltyDiscovery.loyaltyScore,
      nicheScore: profile.nicheIndex.nicheScore,
    },
    topArtists: profile.artistDiversity.topArtistsShare.slice(0, 8).map((a, i) => ({
      name: a.name,
      rank: i + 1,
      genres: [],
      popularity: null,
    })),
    topGenres: profile.genreProfile.distribution.slice(0, 6).map((g) => ({
      genre: g.genre,
      percentage: g.percentage,
    })),
    musicalCharacteristics,
  };
}

// ─── Multi-Period Comparison Engine ──────────────────────────────────────────

export async function buildMultiPeriodTasteContext(userId: string): Promise<TasteAnalysisContext> {
  // 1. Calculate profiles across all 3 Spotify time spans in parallel
  const [shortProfile, mediumProfile, longProfile] = await Promise.all([
    calculateFullTasteProfile(userId, 'short_term'),
    calculateFullTasteProfile(userId, 'medium_term'),
    calculateFullTasteProfile(userId, 'long_term'),
  ]);

  const current = extractPeriodSummary(shortProfile, '4_weeks', 'Last 4 Weeks');
  const recent = extractPeriodSummary(mediumProfile, '6_months', 'Last 6 Months');
  const yearly = extractPeriodSummary(longProfile, '1_year', 'Last 1 Year / All-Time');

  // 2. Compute Metric Deltas
  const artistDiversity = calculateMetricDelta(
    'Artist Diversity',
    yearly.metrics.artistDiversity,
    recent.metrics.artistDiversity,
    current.metrics.artistDiversity
  );

  const genreDiversity = calculateMetricDelta(
    'Genre Diversity',
    yearly.metrics.genreDiversity,
    recent.metrics.genreDiversity,
    current.metrics.genreDiversity
  );

  const discovery = calculateMetricDelta(
    'Discovery Rate',
    yearly.metrics.discoveryRate,
    recent.metrics.discoveryRate,
    current.metrics.discoveryRate
  );

  const loyalty = calculateMetricDelta(
    'Artist Loyalty',
    yearly.metrics.loyaltyScore,
    recent.metrics.loyaltyScore,
    current.metrics.loyaltyScore
  );

  const nicheAffinity = calculateMetricDelta(
    'Niche Affinity',
    yearly.metrics.nicheScore,
    recent.metrics.nicheScore,
    current.metrics.nicheScore
  );

  const energy = calculateMetricDelta(
    'Energy',
    yearly.musicalCharacteristics.energy,
    recent.musicalCharacteristics.energy,
    current.musicalCharacteristics.energy
  );

  const tempo = calculateMetricDelta(
    'Tempo (BPM)',
    yearly.musicalCharacteristics.tempo,
    recent.musicalCharacteristics.tempo,
    current.musicalCharacteristics.tempo
  );

  const acousticness = calculateMetricDelta(
    'Acoustic Tendency',
    yearly.musicalCharacteristics.acousticness,
    recent.musicalCharacteristics.acousticness,
    current.musicalCharacteristics.acousticness
  );

  const danceability = calculateMetricDelta(
    'Danceability / Rhythm',
    yearly.musicalCharacteristics.danceability,
    recent.musicalCharacteristics.danceability,
    current.musicalCharacteristics.danceability
  );

  // 3. Trajectory & Artist / Genre Flow
  const currentArtistNames = new Set(current.topArtists.map((a) => a.name));
  const yearlyArtistNames = new Set(yearly.topArtists.map((a) => a.name));

  const emergingArtists = current.topArtists
    .filter((a) => !yearlyArtistNames.has(a.name))
    .map((a) => a.name);

  const decliningArtists = yearly.topArtists
    .filter((a) => !currentArtistNames.has(a.name))
    .map((a) => a.name);

  const coreAnchors = current.topArtists
    .filter((a) => yearlyArtistNames.has(a.name))
    .map((a) => a.name);

  const currentGenreMap = new Map(current.topGenres.map((g) => [g.genre, g.percentage]));
  const yearlyGenreMap = new Map(yearly.topGenres.map((g) => [g.genre, g.percentage]));

  const risingGenres: string[] = [];
  const fadingGenres: string[] = [];
  const stableGenres: string[] = [];

  for (const [genre, currPct] of currentGenreMap.entries()) {
    const yrPct = yearlyGenreMap.get(genre) ?? 0;
    if (currPct - yrPct >= 4) {
      risingGenres.push(genre);
    } else if (Math.abs(currPct - yrPct) < 4) {
      stableGenres.push(genre);
    }
  }

  for (const [genre, yrPct] of yearlyGenreMap.entries()) {
    const currPct = currentGenreMap.get(genre) ?? 0;
    if (yrPct - currPct >= 4 && !risingGenres.includes(genre)) {
      fadingGenres.push(genre);
    }
  }

  const hasSufficientData =
    shortProfile.artistDiversity.uniqueArtistCount > 0 ||
    mediumProfile.artistDiversity.uniqueArtistCount > 0;

  return {
    userId,
    generatedAt: new Date().toISOString(),
    hasSufficientData,
    dataSummary: {
      artistsSampled: shortProfile.transparencyReport.artistsSampled,
      tracksSampled: shortProfile.transparencyReport.tracksSampled,
      periodsAvailable: 3,
    },
    current,
    recent,
    yearly,
    metricDeltas: {
      artistDiversity,
      genreDiversity,
      discovery,
      loyalty,
      nicheAffinity,
      energy,
      tempo,
      acousticness,
      danceability,
    },
    trajectory: {
      emergingArtists,
      decliningArtists,
      coreAnchors,
      risingGenres,
      fadingGenres,
      stableGenres,
    },
  };
}
