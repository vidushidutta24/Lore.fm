import { useQuery } from '@tanstack/react-query';
import { meApi, analyticsApi } from '../services/api';
import type { TimeRange } from '../types';

export function useCurrentlyPlaying() {
  return useQuery({
    queryKey: ['currently-playing'],
    queryFn: meApi.currentlyPlaying,
    refetchInterval: 30_000, // Poll every 30s
    staleTime: 15_000,
    retry: false,
  });
}

export function useTopArtists(timeRange: TimeRange = 'medium_term') {
  return useQuery({
    queryKey: ['top-artists', timeRange],
    queryFn: () => meApi.topArtists(timeRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopTracks(timeRange: TimeRange = 'medium_term') {
  return useQuery({
    queryKey: ['top-tracks', timeRange],
    queryFn: () => meApi.topTracks(timeRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentlyPlayed() {
  return useQuery({
    queryKey: ['recently-played'],
    queryFn: () => meApi.recentlyPlayed(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOverviewStats(timeRange: TimeRange = 'medium_term') {
  return useQuery({
    queryKey: ['analytics-overview', timeRange],
    queryFn: () => analyticsApi.overview(timeRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMusicDNA(timeRange: TimeRange = 'medium_term') {
  return useQuery({
    queryKey: ['analytics-taste', timeRange],
    queryFn: () => analyticsApi.taste(timeRange),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
