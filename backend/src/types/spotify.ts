// Shared TypeScript types for Spotify API responses
// All types are validated at runtime via Zod in the spotify service

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyFollowers {
  href: string | null;
  total: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email?: string;
  images: SpotifyImage[];
  country?: string;
  product?: string; // "premium" | "free" | "open"
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity?: number;
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
  followers?: SpotifyFollowers;
  type: 'artist';
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  album_type: string;
  external_urls: SpotifyExternalUrls;
  artists: Pick<SpotifyArtist, 'id' | 'name' | 'external_urls' | 'type'>[];
  total_tracks?: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity?: number;
  preview_url: string | null;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  album: SpotifyAlbum;
  artists: Pick<SpotifyArtist, 'id' | 'name' | 'external_urls' | 'type'>[];
  type: 'track';
}

export interface SpotifyTopItemsResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string; // ISO 8601 datetime
  context: {
    type: string;
    external_urls: SpotifyExternalUrls;
    href: string;
    uri: string;
  } | null;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[];
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}

export interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number | null;
  timestamp: number;
  item: SpotifyTrack | null;
  currently_playing_type: string;
  context: {
    type: string;
    external_urls: SpotifyExternalUrls;
    href: string;
    uri: string;
  } | null;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
