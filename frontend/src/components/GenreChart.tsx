import { motion } from 'framer-motion';
import type { GenreEntry } from '../types';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/ErrorState';

interface GenreChartProps {
  genres: GenreEntry[] | undefined;
  isLoading: boolean;
}

function GenreBar({ genre, score: _score, count, index, max }: GenreEntry & { index: number; max: number }) {
  const widthPct = (count / max) * 100;
  const formattedName = genre.charAt(0).toUpperCase() + genre.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3"
    >
      {/* Genre name */}
      <div className="w-36 flex-shrink-0 text-right">
        <span className="text-xs font-medium truncate block" style={{ color: 'var(--text-secondary)' }}>
          {formattedName}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.08)' }}>
        <motion.div
          className="h-full rounded-full flex items-center px-2"
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ delay: index * 0.04 + 0.2, duration: 0.6, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-blue) 100%)`,
            minWidth: count > 0 ? 24 : 0,
          }}
        >
          {widthPct > 30 && (
            <span className="text-xs font-bold text-white truncate">{count}</span>
          )}
        </motion.div>
      </div>

      {/* Count */}
      <span className="text-xs w-6 text-right flex-shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {count}
      </span>
    </motion.div>
  );
}

export function GenreChart({ genres, isLoading }: GenreChartProps) {
  const displayGenres = genres?.slice(0, 12) ?? [];
  const max = displayGenres.length > 0 ? Math.max(...displayGenres.map((g) => g.count)) : 1;

  return (
    <section>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            Genre Presence
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Based on genres of your top artists — not a % of listening time
          </p>
        </div>
      </div>

      <div
        className="p-6 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-36 h-4 rounded" />
                <Skeleton className="flex-1 h-6 rounded-full" />
                <Skeleton className="w-6 h-4 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && displayGenres.length === 0 && (
          <EmptyState
            icon="🎸"
            title="No genre data yet"
            message="Load your top artists to see your genre breakdown."
          />
        )}

        {!isLoading && displayGenres.length > 0 && (
          <div className="flex flex-col gap-3">
            {displayGenres.map((g, i) => (
              <GenreBar key={g.genre} {...g} index={i} max={max} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
