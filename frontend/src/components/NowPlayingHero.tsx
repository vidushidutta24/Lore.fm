import { motion } from 'framer-motion';
import { formatDuration } from '../services/api';
import type { CurrentlyPlaying, RecentTrack } from '../types';
import { Skeleton } from './ui/Skeleton';

// ─── Equalizer Icon ───────────────────────────────────────────────
function EqualizerIcon() {
  return (
    <div className="flex items-end gap-0.5 h-4 w-4">
      <span className="eq-bar w-1 rounded-sm" style={{ background: 'var(--accent-green)', display: 'block' }} />
      <span className="eq-bar w-1 rounded-sm" style={{ background: 'var(--accent-green)', display: 'block' }} />
      <span className="eq-bar w-1 rounded-sm" style={{ background: 'var(--accent-green)', display: 'block' }} />
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────
function ProgressBar({ progressMs, durationMs }: { progressMs: number; durationMs: number }) {
  const pct = Math.min((progressMs / durationMs) * 100, 100);
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {formatDuration(progressMs)}
      </span>
      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(148,163,184,0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: 'var(--gradient-green)' }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {formatDuration(durationMs)}
      </span>
    </div>
  );
}

// ─── Now Playing Hero ─────────────────────────────────────────────
interface NowPlayingHeroProps {
  data: { data: CurrentlyPlaying | null } | undefined;
  isLoading: boolean;
  lastPlayed?: RecentTrack;
}

export function NowPlayingHero({ data, isLoading, lastPlayed }: NowPlayingHeroProps) {
  const now = data?.data;
  const isPlaying = now?.is_playing && now?.item;

  if (isLoading) {
    return (
      <div
        className="rounded-3xl p-8 flex flex-col gap-6"
        style={{
          background: 'linear-gradient(135deg, #0f1a2e 0%, #1a0f2e 50%, #0f1a1a 100%)',
          border: '1px solid var(--border-subtle)',
          minHeight: 280,
        }}
      >
        <Skeleton className="h-5 w-28 rounded-full" />
        <div className="flex gap-6 items-center flex-wrap sm:flex-nowrap">
          <Skeleton className="w-36 h-36 rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    );
  }

  if (isPlaying && now?.item) {
    const track = now.item;
    const albumArt = track.album?.imageUrl;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1f14 0%, #0f1a2e 60%, #1a0f1a 100%)',
          border: '1px solid rgba(29,185,84,0.2)',
          boxShadow: '0 0 60px rgba(29,185,84,0.08)',
        }}
      >
        {/* Background glow from album art */}
        {albumArt && (
          <div
            className="absolute inset-0 opacity-10 blur-3xl scale-110"
            style={{
              backgroundImage: `url(${albumArt})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        {/* NOW PLAYING badge */}
        <div className="flex items-center gap-2 relative z-10">
          <EqualizerIcon />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--accent-green)' }}
          >
            Now Playing
          </span>
        </div>

        {/* Track info */}
        <div className="flex gap-6 items-center relative z-10 flex-wrap sm:flex-nowrap">
          {albumArt ? (
            <motion.img
              src={albumArt}
              alt={track.album?.name}
              className="w-36 h-36 rounded-2xl flex-shrink-0 object-cover"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <div
              className="w-36 h-36 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl"
              style={{ background: 'var(--bg-card)' }}
            >
              🎵
            </div>
          )}

          <div className="flex flex-col gap-2 min-w-0">
            <h2
              className="text-2xl sm:text-3xl font-bold leading-tight truncate"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              {track.name}
            </h2>
            <p className="text-lg font-medium truncate" style={{ color: 'var(--accent-green)' }}>
              {track.artists?.map((a) => a.name).join(', ')}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {track.album?.name}
            </p>
            {track.explicit && (
              <span
                className="text-xs px-1.5 py-0.5 rounded w-fit font-bold"
                style={{ background: 'rgba(148,163,184,0.15)', color: 'var(--text-muted)' }}
              >
                E
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {now.progress_ms !== null && track.durationMs && (
          <div className="relative z-10">
            <ProgressBar progressMs={now.progress_ms} durationMs={track.durationMs} />
          </div>
        )}
      </motion.div>
    );
  }

  // Nothing playing — show last played if available
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-8 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Nothing Playing Right Now
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-secondary)' }}>
          Your music is quiet for now.
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          We'll show your current track here the moment you start listening.
        </p>
      </div>

      {lastPlayed && (
        <div
          className="flex items-center gap-4 mt-2 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
        >
          {lastPlayed.track.album.imageUrl && (
            <img
              src={lastPlayed.track.album.imageUrl}
              alt={lastPlayed.track.album.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Last listened
            </p>
            <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {lastPlayed.track.name}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {lastPlayed.track.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
