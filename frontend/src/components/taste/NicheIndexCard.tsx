import { motion } from 'framer-motion';
import type { NicheIndexInsight } from '../../types';

interface NicheIndexCardProps {
  data: NicheIndexInsight;
}

export function NicheIndexCard({ data }: NicheIndexCardProps) {
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
            <span className="text-xl">🔦</span>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Mainstream vs. Niche Index
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {data.obscurityTier}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Evaluates the official Spotify popularity ratings (0–100) across your library.
        </p>
      </div>

      {/* Mainstream vs Niche Slider/Bar */}
      <div className="space-y-2 p-4 rounded-2xl bg-black/25 border border-white/5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <span>✨</span> Underground / Niche ({data.nicheScore}%)
          </span>
          <span className="text-purple-400 font-semibold flex items-center gap-1">
            Mainstream ({data.mainstreamScore}%) <span>👑</span>
          </span>
        </div>

        <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden flex">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${data.nicheScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            title="Niche Score"
          />
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${data.mainstreamScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            title="Mainstream Score"
          />
        </div>

        <p className="text-[11px] text-slate-400 pt-1">
          {data.tierDescription}
        </p>
      </div>

      {/* Spotlights: Rarest vs Most Mainstream Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rarest / Deepest Cut */}
        {data.rarestTrack && (
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <span>💎</span> Deepest Cut Track
            </span>
            <div className="flex items-center gap-2.5">
              {data.rarestTrack.imageUrl ? (
                <img
                  src={data.rarestTrack.imageUrl}
                  alt={data.rarestTrack.name}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-sm">
                  🎧
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{data.rarestTrack.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{data.rarestTrack.artistName}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono font-bold text-amber-400 block">
                  {data.rarestTrack.popularity}/100
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Popularity</span>
              </div>
            </div>
          </div>
        )}

        {/* Most Mainstream Anthem */}
        {data.mostPopularTrack && (
          <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <span>🌟</span> Biggest Hit Anthem
            </span>
            <div className="flex items-center gap-2.5">
              {data.mostPopularTrack.imageUrl ? (
                <img
                  src={data.mostPopularTrack.imageUrl}
                  alt={data.mostPopularTrack.name}
                  className="w-10 h-10 rounded-xl object-cover border border-purple-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-sm">
                  👑
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{data.mostPopularTrack.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{data.mostPopularTrack.artistName}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono font-bold text-purple-400 block">
                  {data.mostPopularTrack.popularity}/100
                </span>
                <span className="text-[9px] text-slate-500 uppercase">Popularity</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
