import axios from 'axios';
import type {
  AuthStatus,
  TopArtist,
  TopTrack,
  RecentTrack,
  CurrentlyPlaying,
  MusicDNA,
  OverviewStats,
  TasteProfile,
  TasteAIResponse,
  TimelineData,
  TimeRange,
  User,
} from '../types';

// Axios instance — uses relative URLs (proxied by Vite to backend)
const api = axios.create({
  withCredentials: true, // Always send session cookie
});

// ─── Auth ─────────────────────────────────────────────────────────

export const authApi = {
  status: async (): Promise<AuthStatus> => {
    const res = await api.get<AuthStatus>('/auth/status');
    return res.data;
  },

  exchangeToken: async (token: string): Promise<AuthStatus> => {
    const res = await api.post<AuthStatus>('/auth/exchange', { token });
    return res.data;
  },

  connectSpotify: () => {
    // Hard redirect — initiates Spotify OAuth flow via backend
    window.location.href = '/auth/spotify';
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// ─── User ─────────────────────────────────────────────────────────

export const meApi = {
  profile: async (): Promise<User> => {
    const res = await api.get<User>('/api/me');
    return res.data;
  },

  currentlyPlaying: async (): Promise<{ data: CurrentlyPlaying | null }> => {
    const res = await api.get<{ data: CurrentlyPlaying | null }>('/api/me/currently-playing');
    return res.data;
  },

  topArtists: async (timeRange: TimeRange = 'medium_term', limit = 20): Promise<{
    artists: TopArtist[];
    timeRange: TimeRange;
    total: number;
  }> => {
    const res = await api.get('/api/me/top-artists', {
      params: { time_range: timeRange, limit },
    });
    return res.data;
  },

  topTracks: async (timeRange: TimeRange = 'medium_term', limit = 20): Promise<{
    tracks: TopTrack[];
    timeRange: TimeRange;
    total: number;
  }> => {
    const res = await api.get('/api/me/top-tracks', {
      params: { time_range: timeRange, limit },
    });
    return res.data;
  },

  recentlyPlayed: async (limit = 50): Promise<{
    items: RecentTrack[];
    note: string;
  }> => {
    const res = await api.get('/api/me/recently-played', { params: { limit } });
    return res.data;
  },
};

// ─── Analytics ────────────────────────────────────────────────────

export const analyticsApi = {
  overview: async (timeRange: TimeRange = 'medium_term'): Promise<OverviewStats> => {
    const res = await api.get<OverviewStats>('/api/analytics/overview', {
      params: { time_range: timeRange },
    });
    return res.data;
  },

  taste: async (timeRange: TimeRange = 'medium_term'): Promise<MusicDNA> => {
    const res = await api.get<MusicDNA>('/api/analytics/taste', {
      params: { time_range: timeRange },
    });
    return res.data;
  },

  tasteProfile: async (timeRange: TimeRange = 'medium_term'): Promise<TasteProfile> => {
    const res = await api.get<TasteProfile>('/api/analytics/taste-profile', {
      params: { time_range: timeRange },
    });
    return res.data;
  },

  tasteAI: async (): Promise<TasteAIResponse> => {
    const res = await api.get<TasteAIResponse>('/api/analytics/taste-ai');
    return res.data;
  },

  timeline: async (): Promise<TimelineData> => {
    const res = await api.get<TimelineData>('/api/analytics/timeline');
    return res.data;
  },
};

// ─── Recommendations (ML Powered) ─────────────────────────────────

export const recommendationApi = {
  discover: async (options?: {
    trackLimit?: number;
    artistLimit?: number;
    category?: string;
  }) => {
    const res = await api.get('/api/recommendations/discover', {
      params: {
        track_limit: options?.trackLimit || 24,
        artist_limit: options?.artistLimit || 12,
        category: options?.category,
      },
    });
    return res.data;
  },

  tracks: async (limit = 20, category?: string) => {
    const res = await api.get('/api/recommendations/tracks', {
      params: { limit, category },
    });
    return res.data;
  },

  artists: async (limit = 10, category?: string) => {
    const res = await api.get('/api/recommendations/artists', {
      params: { limit, category },
    });
    return res.data;
  },

  tasteVector: async () => {
    const res = await api.get('/api/recommendations/taste-vector');
    return res.data;
  },
};

// ─── Story ────────────────────────────────────────────────────────

export const storyApi = {
  getStory: async () => {
    const res = await api.get('/api/story');
    return res.data;
  },
};


// ─── Helpers ──────────────────────────────────────────────────────

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export function formatPlayedAt(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
