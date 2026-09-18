import React from 'react';
import { motion } from 'framer-motion';
import type { StoryPayload } from '../../types';

interface StoryHeroProps {
  storyData: StoryPayload;
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
}

export const StoryHero: React.FC<StoryHeroProps> = ({
  storyData,
  selectedChapterId,
  onSelectChapter,
}) => {
  const { prologue, chapters } = storyData;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 border border-white/10 bg-gradient-to-br from-purple-950/40 via-slate-950/90 to-indigo-950/50 backdrop-blur-xl shadow-2xl"
    >
      {/* Background magical ambient orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Story Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <span className="text-sm">📖</span>
            <span>LORE.FM CHRONICLES</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {prologue.totalListeningEventsAnalyzed} verified streams
            </span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className="hidden sm:inline-block px-3 py-1 rounded-lg bg-black/40 border border-white/5">
              {chapters.length} Chapters Discovered
            </span>
          </div>
        </div>

        {/* Headline & Story Prologue */}
        <div className="max-w-3xl flex flex-col gap-3">
          <h1
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {prologue.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            {prologue.description}
          </p>
        </div>

        {/* Chapter Index / Table of Contents Bar */}
        {chapters.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Table of Contents
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {chapters.map((chapter) => {
                const isSelected = selectedChapterId === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => onSelectChapter(chapter.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                      isSelected
                        ? 'bg-purple-500/30 border-purple-400 text-white shadow-lg shadow-purple-900/30 scale-[1.02]'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span>{chapter.emoji}</span>
                    <span className="font-semibold text-slate-200">Ch. {chapter.chapterNumber}</span>
                    <span className="text-slate-400 hidden md:inline">• {chapter.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
