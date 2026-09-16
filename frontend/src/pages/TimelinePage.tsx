import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsApi } from '../services/api';
import { TimelineHero } from '../components/timeline/TimelineHero';
import { Top5ArtistJourneys } from '../components/timeline/Top5ArtistJourneys';
import { OverallTimelineView } from '../components/timeline/OverallTimelineView';

export function TimelinePage() {
  const [activeTab, setActiveTab] = useState<'journeys' | 'year_timeline'>('journeys');

  const {
    data: timelineData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['timeline'],
    queryFn: analyticsApi.timeline,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {/* Skeleton Header */}
        <div className="rounded-3xl p-8 mb-8 bg-slate-900/60 border border-slate-800 animate-pulse">
          <div className="h-6 w-48 bg-slate-800 rounded-full mb-4" />
          <div className="h-10 w-96 bg-slate-800 rounded-xl mb-3" />
          <div className="h-4 w-full max-w-lg bg-slate-800/60 rounded mb-2" />
          <div className="h-4 w-80 bg-slate-800/60 rounded" />
        </div>

        {/* Skeleton Content */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>

        <div className="h-96 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (isError || !timelineData) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Unable to Load Music Timeline
          </h2>

          <p className="text-sm text-slate-400">
            {(error as Error)?.message ||
              'Failed to retrieve your multi-period Spotify history. Please verify your connection.'}
          </p>

          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/40"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
      {/* ─── Page Hero Banner ──────────────────────────────────────────────── */}
      <TimelineHero
        data={timelineData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ─── Main Content Tabs ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'journeys' ? (
          <motion.div
            key="journeys"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Top5ArtistJourneys artists={timelineData.top5Artists} />
          </motion.div>
        ) : (
          <motion.div
            key="year_timeline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <OverallTimelineView data={timelineData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
