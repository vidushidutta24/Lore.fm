import { motion } from 'framer-motion';
import type { AIInterpretation, TrajectoryInsight } from '../../types';

interface TasteTrajectoryCardProps {
  headingData: AIInterpretation['whereTasteIsHeading'];
  trajectory: TrajectoryInsight;
}

export function TasteTrajectoryCard({ headingData, trajectory }: TasteTrajectoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full"
      style={{
        background: 'radial-gradient(ellipse at bottom left, rgba(236, 72, 153, 0.12) 0%, var(--bg-card) 70%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 16px 32px -12px rgba(0,0,0,0.4)',
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                Where Your Taste Is Heading
              </h3>
              <p className="text-[11px] text-slate-400">Directional momentum based on recent shifts</p>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-pink-400"
            style={{
              background: 'rgba(236, 72, 153, 0.12)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
            }}
          >
            Trajectory
          </span>
        </div>

        {/* Headline callout */}
        <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-4">
          <p className="text-sm font-semibold text-pink-200">
            {headingData.headline}
          </p>
        </div>

        {/* Narrative */}
        <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-5">
          {headingData.narrative}
        </p>

        {/* Emerging Focus */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Emerging Sonic Focus</span>
            <span className="font-semibold text-pink-300">{headingData.emergingFocus}</span>
          </div>

          {/* Key Drivers / Emerging Artists */}
          {headingData.keyDrivers && headingData.keyDrivers.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1.5">Catalyst Artists in 4-Week Rotation</p>
              <div className="flex flex-wrap gap-1.5">
                {headingData.keyDrivers.map((artist) => (
                  <span
                    key={artist}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-200"
                  >
                    ↗ {artist}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trajectory pill summary */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Rising genres: <strong className="text-slate-200">{trajectory.risingGenres.slice(0, 2).join(', ') || 'Consistent'}</strong>
        </span>
        <span>
          Anchors: <strong className="text-slate-200">{trajectory.coreAnchors.length} artists</strong>
        </span>
      </div>
    </motion.div>
  );
}
