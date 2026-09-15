import React from 'react';
import { motion } from 'framer-motion';
import type { TopTrack, TimeRange } from '../types';
import { TIME_RANGE_LABELS } from '../types';
import { formatDuration } from '../services/api';
import { TrackRowSkeleton } from './ui/Skeleton';
import { ErrorState, EmptyState } from './ui/ErrorState';

interface TrackRowProps {
  track: TopTrack;
  index: number;
}

function TrackRow({ track, index }: TrackRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
      style={{
        background: 'transparent',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
      }}
    >
      {/* Rank */}
      <span
        className="text-sm font-bold w-6 text-right flex-shrink-0 tabular-nums"
        style={{ color: index < 3 ? 'var(--accent-green)' : 'var(--text-muted)' }}
      >
        {track.rank}
      </span>

      {/* Artwork */}
      <div className="flex-shrink-0 relative w-12 h-12">
        {track.album.imageUrl ? (
          <img
            src={track.album.imageUrl}
            alt={track.album.name}
            className="w-full h-full rounded-lg object-cover"
          />
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center text-xl"
            style={{ background: 'var(--bg-card-hover)' }}
          >
            🎵
          </div>
        )}
        {track.explicit && (
          <span
            className="absolute -bottom-1 -right-1 text-[9px] px-1 rounded font-bold"
            style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--text-muted)' }}
          >
            E
          </span>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {track.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
          {track.artists.map((a) => a.name).join(', ')} · {track.album.name}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {formatDuration(track.durationMs)}
      </span>

      {/* Spotify link */}
      {track.spotifyUrl && (
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Open in Spotify"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1db954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </a>
      )}
    </motion.div>
  );
}

interface TopTracksProps {
  tracks: TopTrack[] | undefined;
  isLoading: boolean;
  isError: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onRetry: () => void;
}

export function TopTracks({
  tracks,
  isLoading,
  isError,
  timeRange,
  onTimeRangeChange,
  onRetry,
}: TopTracksProps) {
  const ranges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Your Top Tracks
        </h2>
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: timeRange === r ? 'var(--accent-green)' : 'transparent',
                color: timeRange === r ? '#000' : 'var(--text-secondary)',
              }}
            >
              {TIME_RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => <TrackRowSkeleton key={i} />)}
        </div>
      )}

      {isError && !isLoading && (
        <ErrorState
          title="Couldn't load your top tracks"
          message="There was a problem fetching your Spotify data."
          onRetry={onRetry}
        />
      )}

      {!isLoading && !isError && (!tracks || tracks.length === 0) && (
        <EmptyState
          icon="🎵"
          title="No top tracks yet"
          message="Listen to more music on Spotify to see your top tracks."
        />
      )}

      {!isLoading && !isError && tracks && tracks.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {tracks.map((track, i) => (
            <React.Fragment key={track.id}>
              <TrackRow track={track} index={i} />
              {i < tracks.length - 1 && (
                <div style={{ height: 1, background: 'var(--border-subtle)', marginLeft: '3.5rem' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
