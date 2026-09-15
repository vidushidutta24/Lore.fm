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
