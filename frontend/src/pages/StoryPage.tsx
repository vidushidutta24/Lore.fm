import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { storyApi } from '../services/api';
import type { StoryPayload } from '../types';
import { StoryHero } from '../components/story/StoryHero';
import { StoryChapterCard } from '../components/story/StoryChapterCard';
import { StorySkeleton } from '../components/story/StorySkeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const StoryPage: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const {
    data: storyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<StoryPayload>({
    queryKey: ['story'],
    queryFn: storyApi.getStory,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    const element = document.getElementById(chapterId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-8 max-w-6xl mx-auto flex flex-col gap-6">
        <StorySkeleton />
      </main>
    );
  }

  if (isError || !storyData) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-8 max-w-6xl mx-auto flex items-center justify-center">
        <ErrorState
          title="Could Not Open Your Storybook"
          message={
            error instanceof Error
              ? error.message
              : 'Failed to analyze your Spotify listening history for story generation.'
          }
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  // Low History / Insufficient Data State
  if (!storyData.prologue.hasSufficientData || storyData.chapters.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-center gap-6 max-w-lg shadow-2xl"
        >
          <div className="w-20 h-20 rounded-3xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-4xl shadow-inner">
            📖
          </div>
          <div className="flex flex-col gap-2">
            <h1
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {storyData.prologue.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {storyData.prologue.description}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-400">
            Current History: {storyData.prologue.totalListeningEventsAnalyzed} streams / {storyData.prologue.totalSnapshotsAnalyzed} snapshots
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Prologue & Hero Banner */}
      <StoryHero
        storyData={storyData}
        selectedChapterId={selectedChapterId}
        onSelectChapter={handleSelectChapter}
      />

      {/* Story Chapters List */}
      <section className="flex flex-col gap-8">
        {storyData.chapters.map((chapter, index) => (
          <StoryChapterCard key={chapter.id} chapter={chapter} index={index} />
        ))}
      </section>

      {/* Epilogue / Transparency Note */}
      <footer className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-base">🛡️</span>
          <span>
            Grounded entirely in your verified Spotify Web API listening events and snapshot history. Zero hallucinations or fabricated events.
          </span>
        </div>
        <span className="font-mono text-slate-500 whitespace-nowrap">
          Engine: {storyData.metadata.engine}
        </span>
      </footer>
    </main>
  );
};
