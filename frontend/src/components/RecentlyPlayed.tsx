import { motion } from 'framer-motion';
import type { RecentTrack } from '../types';
import { formatRelativeTime, formatPlayedAt } from '../services/api';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/ErrorState';

interface RecentTrackRowProps {
  item: RecentTrack;
  index: number;
}

function RecentTrackRow({ item, index }: RecentTrackRowProps) {
  const { track, playedAt } = item;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-opacity-100"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      {/* Artwork */}
      <div className="flex-shrink-0 w-11 h-11">
        {track.album.imageUrl ? (
          <img
            src={track.album.imageUrl}
            alt={track.album.name}
            className="w-full h-full rounded-lg object-cover"
          />
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'var(--bg-card-hover)' }}
          >
            🎵
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {track.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
          {track.artists.map((a) => a.name).join(', ')}
          <span style={{ color: 'var(--text-muted)' }}> · {track.album.name}</span>
        </p>
      </div>

      {/* Timestamp */}
      <div className="flex flex-col items-end flex-shrink-0 text-right">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatRelativeTime(playedAt)}
        </span>
        <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          {formatPlayedAt(playedAt)}
        </span>
      </div>

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

interface RecentlyPlayedProps {
  items: RecentTrack[] | undefined;
  isLoading: boolean;
  note?: string;
}

export function RecentlyPlayed({ items, isLoading, note }: RecentlyPlayedProps) {
  return (
    <section>
      <div className="mb-5">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Recently Played
        </h2>
        {note && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            ℹ️ {note}
          </p>
        )}
      </div>

      {isLoading && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <Skeleton className="h-3 w-16 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!items || items.length === 0) && (
        <EmptyState
          icon="🕐"
          title="No recent listening data"
          message="Spotify doesn't have recent listening history available right now."
        />
      )}

      {!isLoading && items && items.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {items.map((item, i) => (
            <RecentTrackRow
              key={`${item.track.id}-${item.playedAt}`}
              item={item}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}
