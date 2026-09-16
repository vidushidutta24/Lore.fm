import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTasteProfile, useTasteAI } from '../hooks/useSpotifyData';
import { TasteHeader } from '../components/taste/TasteHeader';
import { ArchetypeHero } from '../components/taste/ArchetypeHero';
import { MusicDNAScorecard } from '../components/taste/MusicDNAScorecard';
import { ArtistDiversityCard } from '../components/taste/ArtistDiversityCard';
import { GenreProfileCard } from '../components/taste/GenreProfileCard';
import { RecentTrendsCard } from '../components/taste/RecentTrendsCard';
import { LoyaltyAndDiscoveryCard } from '../components/taste/LoyaltyAndDiscoveryCard';
import { NicheIndexCard } from '../components/taste/NicheIndexCard';
import { TasteEvolutionCard } from '../components/taste/TasteEvolutionCard';
import { AiNarrativeCard } from '../components/taste/AiNarrativeCard';
import { TasteTrajectoryCard } from '../components/taste/TasteTrajectoryCard';
import { MultiPeriodComparisonCard } from '../components/taste/MultiPeriodComparisonCard';
import { MusicalMoodCard } from '../components/taste/MusicalMoodCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState, EmptyState } from '../components/ui/ErrorState';
import type { TimeRange } from '../types';

export function TastePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useTasteProfile(timeRange);

  const {
    data: aiData,
    isLoading: isAiLoading,
    isError: isAiError,
    refetch: refetchAI,
  } = useTasteAI();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['analytics-taste-profile'] }),
      queryClient.invalidateQueries({ queryKey: ['analytics-taste-ai'] }),
    ]);
    await Promise.all([refetchProfile(), refetchAI()]);
    setTimeout(() => setIsRefreshing(false), 800);
  }, [queryClient, refetchProfile, refetchAI]);

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <TasteHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        profile={profile}
      />

      {/* Main Content Area */}
      <main className="px-6 py-8 flex flex-col gap-10 pb-28 lg:pb-16 max-w-7xl mx-auto">
        {/* Loading Skeleton View */}
        {isProfileLoading && (
          <div className="space-y-8 animate-pulse">
            <Skeleton className="h-72 w-full rounded-3xl" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isProfileError && (
          <ErrorState
            title="Failed to generate Taste Profile"
            message={(profileError as Error)?.message || 'Could not retrieve listening analytics from Spotify.'}
            onRetry={() => {
              refetchProfile();
              refetchAI();
            }}
          />
        )}

        {/* Empty State */}
        {!isProfileLoading && !isProfileError && !profile && (
          <EmptyState
            icon="🧬"
            title="No Taste Data Available"
            message="Connect your Spotify account and stream music to generate your deep taste intelligence."
          />
        )}

        {/* Populated Taste Profile View */}
        {!isProfileLoading && !isProfileError && profile && (
          <>
            {/* 1. Archetype Hero Banner */}
            <ArchetypeHero
              archetype={profile.archetype}
              dna={profile.musicDNA}
              timeRangeLabel={profile.timeRangeLabel}
            />

            {/* 2. Music DNA Scorecard */}
            <MusicDNAScorecard dna={profile.musicDNA} />

            {/* 3. AI-Powered Multi-Period Evolution & Trajectory */}
            {isAiLoading && (
              <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/15 flex items-center gap-4 animate-pulse">
                <div className="text-2xl animate-spin">🌀</div>
                <div>
                  <h4 className="text-sm font-semibold text-purple-200">Reading your musical timeline...</h4>
                  <p className="text-xs text-slate-400">Comparing your 4-week rotation with your 6-month era and 1-year baseline.</p>
                </div>
              </div>
            )}

            {isAiError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                <span>⚠️ Your music data is ready, but your AI interpretation couldn't be generated right now.</span>
                <button
                  onClick={() => refetchAI()}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold"
                >
                  Retry AI
                </button>
              </div>
            )}

            {aiData && (
              <>
                {/* 3A. Trajectory & Multi-Period Comparative Dynamics */}
                <section className="space-y-4">
                  <div>
                    <h2
                      className="text-xl font-bold flex items-center gap-2"
                      style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                    >
                      <span>🧭</span> Multi-Period Evolution & Heading
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      How your taste shifted from your 1-year baseline through your 6-month era to your active 4-week sound.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TasteTrajectoryCard
                      headingData={aiData.interpretation.whereTasteIsHeading}
                      trajectory={aiData.context.trajectory}
                    />
                    <MultiPeriodComparisonCard
                      changeData={aiData.interpretation.howTasteHasChanged}
                      context={aiData.context}
                    />
                  </div>
                </section>

                {/* 3B. Musical Mood & Audio Characteristics Tone */}
                <MusicalMoodCard
                  moodData={aiData.interpretation.musicalMoodAndTone}
                  context={aiData.context}
                />

                {/* 3C. Deep AI Narrative & Sound Right Now */}
                <AiNarrativeCard interpretation={aiData.interpretation} />
              </>
            )}

            {/* 4. Core Structural Analysis: Artist Diversity & Genre Profile */}
            <section className="space-y-4">
              <div>
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                >
                  <span>📊</span> Structural Listening Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  How your listening is distributed across artists and genres.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <ArtistDiversityCard data={profile.artistDiversity} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <GenreProfileCard data={profile.genreProfile} />
                </motion.div>
              </div>
            </section>

            {/* 5. Behavioral & Momentum Analysis: Recent Trends & Loyalty vs Discovery */}
            <section className="space-y-4">
              <div>
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                >
                  <span>⚡</span> Behavioral Momentum & Habits
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live rotation momentum, on-repeat track loops, and discovery dynamics.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <RecentTrendsCard data={profile.listeningTrends} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <LoyaltyAndDiscoveryCard data={profile.loyaltyDiscovery} />
                </motion.div>
              </div>
            </section>

            {/* 6. Cultural Spectrum & Taste Evolution: Niche Index & Evolution */}
            <section className="space-y-4">
              <div>
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                >
                  <span>🧬</span> Cultural Spectrum & Historical Shift
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mainstream alignment vs. underground deep cuts and trajectory over time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <NicheIndexCard data={profile.nicheIndex} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <TasteEvolutionCard data={profile.tasteEvolution} />
                </motion.div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
