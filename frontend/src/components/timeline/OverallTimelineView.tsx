import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineData } from '../../types';

interface OverallTimelineViewProps {
  data: TimelineData;
}

export const OverallTimelineView: React.FC<OverallTimelineViewProps> = ({ data }) => {
  const { eras, milestones, crossEraSummary } = data.overallTimeline;
  const [selectedEraKey, setSelectedEraKey] = useState<'1_year' | '6_months' | '4_weeks'>('4_weeks');

  const currentEra = eras.find((e) => e.eraKey === selectedEraKey) || eras[eras.length - 1];

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Year Narrative Synthesis Card ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(24, 24, 40, 0.95) 0%, rgba(15, 15, 28, 0.98) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Year-Long Synthesis
          </span>
          <span className="text-xs text-slate-400">
            Chronological Evolution Arc
          </span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          How Your Sound Shifted Over the Year
        </h2>

        <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-4xl">
          {crossEraSummary}
        </p>
      </motion.div>

      {/* ─── Interactive Era Chapters Stepper ─────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            The 3 Chapters of Your Year
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            Click a Chapter to Inspect
          </span>
        </div>

        {/* Stepper Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eras.map((era, index) => {
            const isSelected = era.eraKey === selectedEraKey;

            return (
              <motion.button
                key={era.eraKey}
                onClick={() => setSelectedEraKey(era.eraKey)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-3xl text-left relative overflow-hidden transition-all ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl shadow-emerald-950/20'
                    : 'bg-slate-900/60 hover:bg-slate-800/50 border border-slate-800'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeEraBar"
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"
                  />
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Chapter {index + 1}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {era.timeframe}
                  </span>
                </div>

                <h3
                  className="text-lg font-bold text-white mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {era.title.replace(/Chapter \d+: /, '')}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {era.subtitle}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Selected Chapter Deep-Dive ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {currentEra && (
          <motion.div
            key={currentEra.eraKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {currentEra.timeframe} Spotlight
                </span>
                <h3
                  className="text-2xl font-bold text-white mt-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {currentEra.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {currentEra.subtitle}
                </p>
              </div>

              <div
                className="px-4 py-2.5 rounded-2xl shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Atmosphere
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {currentEra.atmosphere}
                </span>
              </div>
            </div>

            {/* Top 5 in This Era */}
            <div className="flex flex-col gap-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top 5 Artists in this Chapter
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                {currentEra.top5Artists.map((artist, idx) => (
                  <div
                    key={artist.id || idx}
                    className="p-3.5 rounded-2xl flex sm:flex-col items-center sm:text-center gap-3"
                    style={{
                      background: 'rgba(15, 15, 26, 0.7)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                        {artist.imageUrl ? (
                          <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                            {artist.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                        {artist.rank}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 sm:w-full">
                      <h4 className="text-sm font-bold text-white truncate">
                        {artist.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {artist.genres[0] || 'Top Artist'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dominant Genres in This Era */}
            {currentEra.dominantGenres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Dominant Sounds:</span>
                {currentEra.dominantGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(124, 58, 237, 0.12)',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                      color: '#c4b5fd',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cross-Era Comparison Matrix ──────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-8"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Comparative Trajectory
            </span>
            <h3
              className="text-xl sm:text-2xl font-bold text-white mt-0.5"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Top 5 Artists Evolution Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Comparing rank movements across all 3 chapters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-semibold">Artist</th>
                <th className="pb-3 font-semibold text-center">1 Year Baseline</th>
                <th className="pb-3 font-semibold text-center">6 Months Ago</th>
                <th className="pb-3 font-semibold text-center">Last 4 Weeks</th>
                <th className="pb-3 font-semibold text-right">Trajectory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {data.top5Artists.map((artist) => (
                <tr key={artist.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                          {artist.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {artist.name}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {artist.longTermRank !== null ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        #{artist.longTermRank}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {artist.mediumTermRank !== null ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        #{artist.mediumTermRank}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {artist.shortTermRank !== null ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        #{artist.shortTermRank}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">—</span>
                    )}
                  </td>

                  <td className="py-3.5 pl-4 text-right">
                    <span className="text-xs font-semibold text-slate-300">
                      {artist.trajectoryLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Key Turning Points & Milestones ──────────────────────────────── */}
      {milestones.length > 0 && (
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Key Turning Points
              </span>
              <h3
                className="text-xl sm:text-2xl font-bold text-white mt-0.5"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Notable Milestones in Your Year
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Significant shifts detected in your data
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl flex flex-col justify-between"
                style={{
                  background: 'rgba(15, 15, 26, 0.7)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {m.eraLabel}
                    </span>
                    {m.artistImageUrl && (
                      <div className="w-7 h-7 rounded-full overflow-hidden shadow">
                        <img src={m.artistImageUrl} alt={m.artistName} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
