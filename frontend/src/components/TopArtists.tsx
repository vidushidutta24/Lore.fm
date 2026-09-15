import { motion } from 'framer-motion';
import type { TopArtist, TimeRange } from '../types';
import { TIME_RANGE_LABELS } from '../types';
import { ArtistCardSkeleton } from './ui/Skeleton';
import { ErrorState, EmptyState } from './ui/ErrorState';

interface ArtistCardProps {
  artist: TopArtist;
  index: number;
}

function ArtistCard({ artist, index }: ArtistCardProps) {
  const topGenre = artist.genres?.[0];
  const formattedGenre = topGenre
    ? topGenre.charAt(0).toUpperCase() + topGenre.slice(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden hover-lift cursor-default"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Artist image */}
      <div className="relative aspect-square overflow-hidden bg-gray-900">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: 'var(--bg-card-hover)' }}>
            🎤
          </div>
        )}

        {/* Rank badge */}
        <div
          className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: index < 3 ? 'var(--accent-green)' : 'rgba(0,0,0,0.6)',
            color: index < 3 ? '#000' : 'var(--text-primary)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {artist.rank}
        </div>

        {/* Spotify link */}
        {artist.spotifyUrl && (
          <a
            href={artist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            title="Open in Spotify"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1db954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </a>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p
          className="font-semibold text-sm leading-tight truncate"
          style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}
        >
          {artist.name}
        </p>
        {formattedGenre && (
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {formattedGenre}
          </p>
        )}
        {artist.popularity !== null && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(148,163,184,0.1)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${artist.popularity}%`,
                  background: 'var(--gradient-green)',
                }}
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {artist.popularity}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface TopArtistsProps {
  artists: TopArtist[] | undefined;
  isLoading: boolean;
  isError: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onRetry: () => void;
}

export function TopArtists({
  artists,
  isLoading,
  isError,
  timeRange,
  onTimeRangeChange,
  onRetry,
}: TopArtistsProps) {
  const ranges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Your Top Artists
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

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <ArtistCardSkeleton key={i} />)}
        </div>
      )}

      {isError && !isLoading && (
        <ErrorState
          title="Couldn't load your top artists"
          message="There was a problem fetching your Spotify data. Please try again."
          onRetry={onRetry}
        />
      )}

      {!isLoading && !isError && (!artists || artists.length === 0) && (
        <EmptyState
          icon="🎤"
          title="No top artists yet"
          message="Listen to more music on Spotify and come back to see your top artists."
        />
      )}

      {!isLoading && !isError && artists && artists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {artists.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
