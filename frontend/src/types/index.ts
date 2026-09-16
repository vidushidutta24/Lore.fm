// Shared frontend TypeScript types

export interface User {
  id: string;
  spotifyId: string;
  displayName: string;
  email?: string | null;
  imageUrl?: string | null;
  country?: string | null;
  product?: string | null; // "premium" | "free"
  createdAt: string;
}

export interface ArtistRef {
  id: string;
  name: string;
}

export interface AlbumRef {
  id: string;
  name: string;
  imageUrl: string | null;
  releaseDate?: string;
}

export interface TopArtist {
  rank: number;
  id: string;
  name: string;
  genres: string[];
  popularity: number | null;
  imageUrl: string | null;
  spotifyUrl: string | null;
}

export interface TopTrack {
  rank: number;
  id: string;
  name: string;
  artists: ArtistRef[];
  album: AlbumRef;
  durationMs: number;
  popularity: number | null;
  previewUrl: string | null;
  spotifyUrl: string | null;
  explicit: boolean;
}

export interface RecentTrack {
  playedAt: string;
  track: {
    id: string;
    name: string;
    artists: ArtistRef[];
    album: AlbumRef;
    durationMs: number;
    explicit: boolean;
    spotifyUrl: string | null;
    previewUrl: string | null;
  };
}

export interface CurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number | null;
  item: {
    id: string;
    name: string;
    artists: ArtistRef[];
    album: AlbumRef;
    durationMs: number;
    explicit: boolean;
    spotifyUrl: string | null;
  } | null;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 weeks',
  medium_term: 'Last 6 months',
  long_term: 'All time',
};

export interface GenreEntry {
  genre: string;
  count: number;
  score: number;
}

export interface ArtistDiversityScore {
  score: number;
  topArtistCount: number;
  uniqueArtistCount: number;
  description: string;
}

export interface GenreDiversityScore {
  score: number;
  uniqueGenreCount: number;
  topGenres: GenreEntry[];
  description: string;
}

export interface DiscoveryScore {
  score: number;
  description: string;
  dataAvailable: boolean;
}

export interface LoyaltyScore {
  score: number;
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
  calculationNote: string;
}

export interface OverviewStats {
  topArtist: { name: string; imageUrl: string | null } | null;
  topTrack: { name: string; artistName: string; imageUrl: string | null } | null;
  dominantGenre: string | null;
  recentlyPlayedCount: number;
  uniqueArtistCount: number;
  uniqueGenreCount: number;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: Pick<User, 'id' | 'spotifyId' | 'displayName' | 'imageUrl' | 'product'>;
}

export interface ApiError {
  error: string;
  message: string;
  retryAfter?: number;
}

// ─── Taste Profile Analytical Types ──────────────────────────────────────────

export interface ArtistDiversityInsight {
  score: number; // 0–100
  uniqueArtistCount: number;
  analyzedItemCount: number;
  top3DominancePercentage: number;
  listeningBreadth: 'Hyper-Focused' | 'Moderate Rotation' | 'Broad Explorer';
  description: string;
  topArtistsShare: {
    name: string;
    imageUrl: string | null;
    estimatedShare: number;
  }[];
}

export interface GenreItem {
  genre: string;
  count: number;
  percentage: number;
  score: number;
}

export interface GenreProfileInsight {
  score: number; // 0–100
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
  loyalAnchors: ArtistCategoryItem[];
  freshDiscoveries: ArtistCategoryItem[];
  dormantFavorites: ArtistCategoryItem[];
  retentionRate: number;
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
  mainstreamScore: number; // 0–100
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

export interface TasteProfile {
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

// ─── Multi-Period & AI Interpretation Types ─────────────────────────────────

export interface MusicalCharacteristics {
  energy: number; // 0–100
  tempo: number; // BPM (e.g. 115)
  acousticness: number; // 0–100
  danceability: number; // 0–100
  atmosphere: string;
  source: string;
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
  /** True only if Spotify returned genre tags for this period's artists */
  hasGenreData: boolean;
  /** Number of unique genres for this period (0 = none returned by Spotify) */
  totalUniqueGenres: number;
}

export interface MetricDelta {
  name: string;
  yearly: number;
  recent: number;
  current: number;
  netChange: number;
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
  dataAvailability: {
    hasCurrentGenreData: boolean;
    hasRecentGenreData: boolean;
    hasYearlyGenreData: boolean;
    hasCurrentArtistData: boolean;
    hasRecentArtistData: boolean;
    hasYearlyArtistData: boolean;
    hasTrajectoryData: boolean;
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

export interface AIInterpretation {
  whereTasteIsHeading: {
    headline: string;
    narrative: string;
    keyDrivers: string[];
    emergingFocus: string;
  };
  howTasteHasChanged: {
    headline: string;
    comparisonNarrative: string;
    primaryShift: string;
    metricHighlights: {
      label: string;
      change: string;
      interpretation: string;
    }[];
  };
  musicalMoodAndTone: {
    headline: string;
    currentSoundscape: string;
    toneShiftExplanation: string;
    energyTempoAnalysis: string;
  };
  currentSoundIdentity: {
    headline: string;
    identityStatement: string;
    coreAtmosphere: string;
  };
  yourTasteExplained: {
    title: string;
    introduction: string;
    recentVsLongterm: string;
    varietyAndConcentration: string;
    contradictionsAndPatterns: string;
    closingSynthesis: string;
  };
  metadata: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'deterministic_engine';
    isAIGenerated: boolean;
    notice: string;
    calculatedAt: string;
  };
}

export interface TasteAIResponse {
  context: TasteAnalysisContext;
  interpretation: AIInterpretation;
}

