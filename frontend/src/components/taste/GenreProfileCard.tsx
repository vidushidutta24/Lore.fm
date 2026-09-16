import { motion } from 'framer-motion';
import type { GenreProfileInsight } from '../../types';

interface GenreProfileCardProps {
  data: GenreProfileInsight;
}

export function GenreProfileCard({ data }: GenreProfileCardProps) {
  const maxCount = data.distribution.length > 0 ? data.distribution[0].count : 1;

  return (
    <div
      className="p-6 rounded-3xl flex flex-col justify-between gap-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎸</span>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Genre Profile & Distribution
            </h3>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30"
          >
            {data.genreDiversityRating}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Aggregated genre metadata from your top artists.
        </p>
      </div>

      {/* Dominant genres pills */}
      {data.dominantGenres.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Core Dominant Genres
          </span>
          <div className="flex flex-wrap gap-2">
            {data.dominantGenres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(59,130,246,0.15) 100%)',
                  border: '1px solid rgba(124,58,237,0.4)',
                  color: '#c4b5fd',
                }}
              >
                ✦ {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Genre Distribution Bars */}
      {data.distribution.length > 0 ? (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {data.distribution.slice(0, 10).map((item, index) => {
            const widthPct = Math.max((item.count / maxCount) * 100, 8);
            const formattedName = item.genre.charAt(0).toUpperCase() + item.genre.slice(1);

            return (
              <motion.div
                key={item.genre}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 text-xs"
              >
                <div className="w-28 sm:w-36 flex-shrink-0 text-right">
                  <span className="font-medium text-slate-300 truncate block" title={formattedName}>
                    {formattedName}
                  </span>
                </div>

                <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden flex items-center">
                  <motion.div
                    className="h-full rounded-full flex items-center px-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.6, delay: index * 0.03 + 0.1 }}
                    style={{
                      background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)',
                    }}
                  >
                    {widthPct > 25 && (
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">
                        {item.percentage}%
                      </span>
                    )}
                  </motion.div>
                </div>

                <span className="w-8 text-right font-mono text-slate-400 tabular-nums">
                  {item.count}
                </span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
          <p>No direct genre tags provided by Spotify for this period's top artists.</p>
          <p className="text-[11px] text-slate-500 mt-1">Diversity is computed directly across your unique artist catalog.</p>
        </div>
      )}

      {/* Observation Box */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
        <p className="text-slate-300">
          💡 <span className="font-semibold text-white">Insight:</span> {data.description}
        </p>
        <span className="text-[11px] font-mono text-purple-300 ml-2 whitespace-nowrap">
          {data.totalUniqueGenres} Genres Total
        </span>
      </div>
    </div>
  );
}
