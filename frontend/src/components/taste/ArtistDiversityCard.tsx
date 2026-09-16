import { motion } from 'framer-motion';
import type { ArtistDiversityInsight } from '../../types';

interface ArtistDiversityCardProps {
  data: ArtistDiversityInsight;
}

export function ArtistDiversityCard({ data }: ArtistDiversityCardProps) {
  const isBroad = data.listeningBreadth === 'Broad Explorer';
  const isFocused = data.listeningBreadth === 'Hyper-Focused';

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
            <span className="text-xl">👥</span>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Artist Diversity & Concentration
            </h3>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isBroad
                ? 'rgba(29, 185, 84, 0.15)'
                : isFocused
                ? 'rgba(236, 72, 153, 0.15)'
                : 'rgba(59, 130, 246, 0.15)',
              color: isBroad
                ? 'var(--accent-green)'
                : isFocused
                ? 'var(--accent-pink)'
                : 'var(--accent-blue)',
              border: '1px solid currentColor',
            }}
          >
            {data.listeningBreadth}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          How spread out vs. concentrated your listening is among top artists.
        </p>
      </div>

      {/* Diversity Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
            Unique Artists
          </span>
          <span className="text-2xl font-extrabold text-white">
            {data.uniqueArtistCount}
          </span>
          <span className="text-[10px] text-slate-500 block">in analyzed rotation</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
            Top 3 Dominance
          </span>
          <span className="text-2xl font-extrabold text-white">
            {data.top3DominancePercentage}%
          </span>
          <span className="text-[10px] text-slate-500 block">estimated rotation share</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
            Entropy Rating
          </span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {data.score}
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </span>
          <span className="text-[10px] text-slate-500 block">spread index</span>
        </div>
      </div>

      {/* Top 3 Dominance Bar Visualization */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Rotation Concentration</span>
          <span className="font-semibold text-slate-300">
            Top 3 ({data.top3DominancePercentage}%) vs. Remaining ({100 - data.top3DominancePercentage}%)
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${data.top3DominancePercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            title="Top 3 Artists Share"
          />
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${100 - data.top3DominancePercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            title="Rest of Rotation Share"
          />
        </div>
      </div>

      {/* Top Artists Share Breakdown */}
      {data.topArtistsShare.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Top Share Leaders</p>
          <div className="space-y-2">
            {data.topArtistsShare.map((artist, idx) => (
              <div key={artist.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 w-4">{idx + 1}</span>
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    🎵
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 flex-1 truncate">
                  {artist.name}
                </span>
                <span className="text-xs font-bold text-slate-400 tabular-nums">
                  ~{artist.estimatedShare}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observation Box */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <p className="text-xs text-slate-300 leading-relaxed">
          💡 <span className="font-semibold text-white">Observation:</span> {data.description}
        </p>
      </div>
    </div>
  );
}
