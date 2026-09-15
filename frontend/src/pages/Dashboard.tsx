import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  useCurrentlyPlaying,
  useTopArtists,
  useTopTracks,
  useRecentlyPlayed,
  useOverviewStats,
  useMusicDNA,
} from '../hooks/useSpotifyData';
import { NowPlayingHero } from '../components/NowPlayingHero';
import { QuickStats } from '../components/QuickStats';
import { TopArtists } from '../components/TopArtists';
import { TopTracks } from '../components/TopTracks';
import { GenreChart } from '../components/GenreChart';
import { MusicDNASection } from '../components/MusicDNA';
import { RecentlyPlayed } from '../components/RecentlyPlayed';
import type { TimeRange } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [artistTimeRange, setArtistTimeRange] = useState<TimeRange>('medium_term');
  const [trackTimeRange, setTrackTimeRange] = useState<TimeRange>('medium_term');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data queries
  const nowPlaying = useCurrentlyPlaying();
  const topArtists = useTopArtists(artistTimeRange);
  const topTracks = useTopTracks(trackTimeRange);
  const recentlyPlayed = useRecentlyPlayed();
  const overviewStats = useOverviewStats('medium_term');
  const musicDNA = useMusicDNA('medium_term');

  // Get genres from top artists response
  const genreData = topArtists.data?.artists
    ? (() => {
        const counts: Record<string, number> = {};
        for (const artist of topArtists.data.artists) {
          for (const genre of artist.genres ?? []) {
            counts[genre] = (counts[genre] ?? 0) + 1;
          }
        }
        const max = Math.max(...Object.values(counts), 1);
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([genre, count]) => ({ genre, count, score: count / max }));
      })()
    : undefined;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [queryClient]);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between gap-4"
        style={{
          background: 'rgba(8,8,15,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex flex-col gap-0">
          <h1
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            {greeting}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Here's what your music looks like right now.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Spotify connection status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)' }}
          >
            <span className="w-2 h-2 rounded-full now-playing-indicator" style={{ background: 'var(--accent-green)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>Connected</span>
          </div>

          {/* Refresh button */}
          <button
            id="refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh Spotify data"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User avatar */}
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: '2px solid var(--border-subtle)' }}
            />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-8 flex flex-col gap-12 pb-24 lg:pb-12">

        {/* Hero — Now Playing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NowPlayingHero
            data={nowPlaying.data}
            isLoading={nowPlaying.isLoading}
            lastPlayed={recentlyPlayed.data?.items?.[0]}
          />
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <QuickStats
            stats={overviewStats.data}
            isLoading={overviewStats.isLoading}
          />
        </motion.section>

        {/* Top Artists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <TopArtists
            artists={topArtists.data?.artists}
            isLoading={topArtists.isLoading}
            isError={topArtists.isError}
            timeRange={artistTimeRange}
            onTimeRangeChange={setArtistTimeRange}
            onRetry={() => topArtists.refetch()}
          />
        </motion.section>

        {/* Top Tracks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TopTracks
            tracks={topTracks.data?.tracks}
            isLoading={topTracks.isLoading}
            isError={topTracks.isError}
            timeRange={trackTimeRange}
            onTimeRangeChange={setTrackTimeRange}
            onRetry={() => topTracks.refetch()}
          />
        </motion.section>

        {/* Genre + Music DNA side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <GenreChart
              genres={genreData}
              isLoading={topArtists.isLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MusicDNASection
              dna={musicDNA.data}
              isLoading={musicDNA.isLoading}
            />
          </motion.div>
        </div>

        {/* Recently Played */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <RecentlyPlayed
            items={recentlyPlayed.data?.items}
            isLoading={recentlyPlayed.isLoading}
            note={recentlyPlayed.data?.note}
          />
        </motion.section>

      </main>
    </div>
  );
}
