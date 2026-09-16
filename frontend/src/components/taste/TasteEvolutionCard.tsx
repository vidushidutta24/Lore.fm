import { motion } from 'framer-motion';
import type { TasteEvolutionInsight } from '../../types';

interface TasteEvolutionCardProps {
  data: TasteEvolutionInsight;
}

export function TasteEvolutionCard({ data }: TasteEvolutionCardProps) {
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
            <span className="text-xl">📈</span>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Taste Evolution & Shifts
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {data.comparisonPeriod} vs {data.baselinePeriod}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Tracking which genres surged or declined and which artists climbed in ranking.
        </p>
      </div>

      {/* Shifts Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Genre Shifts */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            🌊 Genre Trajectory
          </span>
          {data.genreShifts.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              Genre presence has remained highly steady between your recent and historical baseline.
            </p>
          ) : (
            <div className="space-y-2">
              {data.genreShifts.slice(0, 4).map((shift, i) => {
                const isRising = shift.direction === 'rising';

                return (
                  <motion.div
                    key={shift.genre}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-2.5 rounded-xl flex items-start gap-2.5 bg-white/[0.02]"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                        isRising ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isRising ? '▲ Rising' : '▼ Falling'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white capitalize">{shift.genre}</p>
                      <p className="text-[11px] text-slate-400">{shift.changeDescription}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Artist Rank Climbers & New Entries */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            🚀 Artist Momentum
          </span>
          {data.artistShifts.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No significant rank deviations recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {data.artistShifts.slice(0, 4).map((artist, i) => {
                const isNew = artist.status === 'new_entry';
                const isClimber = artist.status === 'climber';

                return (
                  <motion.div
                    key={artist.name}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-2.5 rounded-xl flex items-center gap-2.5 bg-white/[0.02]"
                  >
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
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{artist.name}</p>
                      <p className="text-[10px] text-slate-400">Current Rank: #{artist.currentRank}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isNew
                          ? 'bg-purple-500/20 text-purple-300'
                          : isClimber
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      {isNew ? '★ New Entry' : isClimber ? `▲ +${artist.rankChange}` : '• Steady'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Snapshot History Status Notice */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <span className="text-sm">ℹ️</span>
        <div>
          <span className="font-semibold text-slate-300">Historical Snapshot Engine: </span>
          {data.historicalStatusNote}
        </div>
      </div>
    </div>
  );
}
