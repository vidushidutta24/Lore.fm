import { motion } from 'framer-motion';
import type { MLUserTasteSummary } from '../../types';

export type DiscoverFilterType =
  | 'all'
  | 'tracks'
  | 'artists'
  | 'SIMILAR'
  | 'DISCOVER'
  | 'EXPLORE'
  | 'WILDCARD';

interface DiscoverHeroProps {
  userTaste?: MLUserTasteSummary;
  totalEvaluated?: number;
  filteredAlreadyHeard?: number;
  engine?: string;
  activeFilter: DiscoverFilterType;
  onFilterChange: (filter: DiscoverFilterType) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const FILTERS: { id: DiscoverFilterType; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'tracks', label: 'Tracks', icon: '🎵' },
  { id: 'artists', label: 'Artists', icon: '🎤' },
  { id: 'SIMILAR', label: 'Similar', icon: '🎯' },
  { id: 'DISCOVER', label: 'Discover', icon: '🔮' },
  { id: 'EXPLORE', label: 'Explore', icon: '🔭' },
  { id: 'WILDCARD', label: 'Wildcard', icon: '🎲' },
];

export function DiscoverHero({
  userTaste,
  totalEvaluated,
  filteredAlreadyHeard,
  engine,
  activeFilter,
  onFilterChange,
  onRefresh,
  isRefreshing,
}: DiscoverHeroProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(20, 20, 33, 0.95) 0%, rgba(30, 20, 50, 0.85) 50%, rgba(10, 25, 40, 0.9) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Ambient background glow */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'var(--accent-purple)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'var(--accent-green)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md"
                style={{
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#c4b5fd',
                }}
                title={engine || 'Scikit-Learn ML Recommendation Engine'}
              >
                <span className="w-2 h-2 rounded-full animate-pulse bg-purple-400" />
                {engine ? 'ML Recommendation Engine' : 'Scikit-Learn ML Powered'}
              </span>

              {filteredAlreadyHeard !== undefined && filteredAlreadyHeard > 0 && (
                <span
                  className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                  }}
                  title="Already-heard tracks & artists excluded from recommendations"
                >
                  ✓ {filteredAlreadyHeard} Heard Filtered
                </span>
              )}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Discover
            </h1>

            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Music you haven't heard yet, picked from the patterns in your listening.
            </p>

            {/* Dominant Taste Anchor tags */}
            {userTaste?.dominant_genres && userTaste.dominant_genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Taste anchors:
                </span>
                {userTaste.dominant_genres.slice(0, 4).map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {g.genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons & Summary Stats */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-md disabled:opacity-50"
              style={{
                background: 'var(--accent-green)',
                color: '#000',
              }}
              title="Re-run ML recommendation engine on latest Spotify listening history"
            >
              <span className={`text-base font-bold ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
              <span>{isRefreshing ? 'Re-calculating...' : 'Refresh Discoveries'}</span>
            </button>

            {totalEvaluated !== undefined && (
              <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                {totalEvaluated} candidate tracks evaluated
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTERS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 active:scale-95"
              style={{
                background: isActive ? 'var(--accent-green)' : 'var(--bg-card)',
                border: isActive
                  ? '1px solid var(--accent-green)'
                  : '1px solid var(--border-subtle)',
                color: isActive ? '#000' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
