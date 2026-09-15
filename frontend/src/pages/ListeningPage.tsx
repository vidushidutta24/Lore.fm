import { useState } from 'react';
import { useTopArtists, useTopTracks, useRecentlyPlayed } from '../hooks/useSpotifyData';
import { TopArtists } from '../components/TopArtists';
import { TopTracks } from '../components/TopTracks';
import { RecentlyPlayed } from '../components/RecentlyPlayed';
import type { TimeRange } from '../types';

export function ListeningPage() {
  const [artistTimeRange, setArtistTimeRange] = useState<TimeRange>('medium_term');
  const [trackTimeRange, setTrackTimeRange] = useState<TimeRange>('medium_term');

  const topArtists = useTopArtists(artistTimeRange);
  const topTracks = useTopTracks(trackTimeRange);
  const recentlyPlayed = useRecentlyPlayed();

  return (
    <div className="flex-1 min-w-0">
      <header
        className="px-6 py-6"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Your Listening
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your top artists, tracks, and recent history from Spotify.
        </p>
      </header>

      <main className="px-6 py-8 flex flex-col gap-12 pb-24 lg:pb-12">
        <TopArtists
          artists={topArtists.data?.artists}
          isLoading={topArtists.isLoading}
          isError={topArtists.isError}
          timeRange={artistTimeRange}
          onTimeRangeChange={setArtistTimeRange}
          onRetry={() => topArtists.refetch()}
        />
        <TopTracks
          tracks={topTracks.data?.tracks}
          isLoading={topTracks.isLoading}
          isError={topTracks.isError}
          timeRange={trackTimeRange}
          onTimeRangeChange={setTrackTimeRange}
          onRetry={() => topTracks.refetch()}
        />
        <RecentlyPlayed
          items={recentlyPlayed.data?.items}
          isLoading={recentlyPlayed.isLoading}
          note={recentlyPlayed.data?.note}
        />
      </main>
    </div>
  );
}
