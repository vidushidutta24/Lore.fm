import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimeRange, TasteProfile } from '../../types';
import { TIME_RANGE_LABELS } from '../../types';

interface TasteHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (tr: TimeRange) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  profile?: TasteProfile;
}

export function TasteHeader({
  timeRange,
  onTimeRangeChange,
  isRefreshing,
  onRefresh,
  profile,
}: TasteHeaderProps) {
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: 'rgba(8,8,15,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Taste Profile
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{
                background: 'rgba(124,58,237,0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(124,58,237,0.3)',
              }}
            >
              Intelligence
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Deep behavioral analysis derived from your authorized Spotify listening patterns.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Time range switcher */}
          <div
            className="flex items-center p-1 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            {(['short_term', 'medium_term', 'long_term'] as TimeRange[]).map((tr) => (
              <button
                key={tr}
                onClick={() => onTimeRangeChange(tr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === tr
                    ? 'text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  background: timeRange === tr ? 'rgba(124,58,237,0.35)' : 'transparent',
                  border: timeRange === tr ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
                }}
              >
                {TIME_RANGE_LABELS[tr]}
              </button>
            ))}
          </div>

          {/* Transparency / Methodology button */}
          <button
            onClick={() => setShowTransparencyModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:bg-slate-800"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="View calculation methodology"
          >
            <span>⚖️</span>
            <span className="hidden sm:inline">Data Integrity</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Recalculate with fresh Spotify data"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </header>

      {/* Methodology & Data Integrity Modal */}
      <AnimatePresence>
        {showTransparencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl p-6 rounded-3xl relative overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚖️</span>
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                  >
                    Data Integrity & Calculations
                  </h3>
                </div>
                <button
                  onClick={() => setShowTransparencyModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h4 className="font-semibold text-white mb-1">🔍 100% Real Spotify Data</h4>
                  <p>
                    Lore.fm never fabricates listener statistics, listening counts, or fake percentages. Every insight is mathematically computed from your authorized Spotify Web API profile.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h4 className="font-semibold text-white mb-1">📐 Transparent Formulas</h4>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-300">
                    <li><strong>Artist Diversity:</strong> Normalized Shannon entropy & Zipf-rank concentration of your top artists.</li>
                    <li><strong>Genre Profile:</strong> Frequency distributions of artist metadata provided officially by Spotify.</li>
                    <li><strong>Loyalty Score:</strong> Set-intersection ratio between your short-term and all-time top artist rotations.</li>
                    <li><strong>Discovery Rate:</strong> Percentage of artists in your active 4-week rotation not present in your long-term baseline.</li>
                    <li><strong>Niche Score:</strong> Inverted average of Spotify's official 0–100 track and artist popularity metrics.</li>
                  </ul>
                </div>

                {profile?.transparencyReport && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                    <p>
                      <strong>Active Dataset:</strong> Sampled {profile.transparencyReport.artistsSampled} artists, {profile.transparencyReport.tracksSampled} tracks, and {profile.transparencyReport.eventsSampled} recent playback events.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTransparencyModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/20"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
