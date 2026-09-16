import React from 'react';
import { motion } from 'framer-motion';
import type { TimelineData } from '../../types';

interface TimelineHeroProps {
  data: TimelineData;
  activeTab: 'journeys' | 'year_timeline';
  onTabChange: (tab: 'journeys' | 'year_timeline') => void;
}

export const TimelineHero: React.FC<TimelineHeroProps> = ({
  data,
  activeTab,
  onTabChange,
}) => {
  const topArtist = data.top5Artists[0];
  const eraCount = data.overallTimeline.eras.length;
  const totalAnalyzed = data.dataProvenance.totalTracksAnalyzed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(15, 15, 26, 0.95) 100%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #7c3aed 0%, #1db954 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{
                background: 'rgba(124, 58, 237, 0.15)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#c4b5fd',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Longitudinal Music Arc
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              100% Verified History
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight mb-3"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            Your Music Journey Over Time
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-slate-300">
            Music isn't a static snapshot—it's a story. Explore how your listening relationship with your{' '}
            <span className="text-emerald-400 font-semibold">Top 5 Artists</span> developed across eras, when they became prominent, and how your sound shifted throughout the year.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Core Anchor:</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                {topArtist?.name ?? '—'}
                {topArtist && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    #{topArtist.currentRank}
                  </span>
                )}
              </span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Chapters:</span>
              <span className="text-sm font-semibold text-purple-300">{eraCount} Listening Eras</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Tracks Analyzed:</span>
              <span className="text-sm font-semibold text-slate-200">{totalAnalyzed} Multi-Era Tracks</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <div
            className="p-1.5 rounded-2xl flex md:flex-col gap-1.5"
            style={{
              background: 'rgba(10, 10, 18, 0.8)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => onTabChange('journeys')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'journeys'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Top 5 Artist Journeys</span>
            </button>

            <button
              onClick={() => onTabChange('year_timeline')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'year_timeline'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Year-Long Timeline</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
