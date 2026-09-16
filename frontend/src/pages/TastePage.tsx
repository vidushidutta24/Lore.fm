import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTasteProfile } from '../hooks/useSpotifyData';
import { TasteHeader } from '../components/taste/TasteHeader';
import { ArchetypeHero } from '../components/taste/ArchetypeHero';
import { MusicDNAScorecard } from '../components/taste/MusicDNAScorecard';
import { ArtistDiversityCard } from '../components/taste/ArtistDiversityCard';
import { GenreProfileCard } from '../components/taste/GenreProfileCard';
import { RecentTrendsCard } from '../components/taste/RecentTrendsCard';
import { LoyaltyAndDiscoveryCard } from '../components/taste/LoyaltyAndDiscoveryCard';
import { NicheIndexCard } from '../components/taste/NicheIndexCard';
import { TasteEvolutionCard } from '../components/taste/TasteEvolutionCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState, EmptyState } from '../components/ui/ErrorState';
import type { TimeRange } from '../types';

export function TastePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError, error, refetch } = useTasteProfile(timeRange);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['analytics-taste-profile'] });
    await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [queryClient, refetch]);

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
        {isLoading && (
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
        {isError && (
          <ErrorState
            title="Failed to generate Taste Profile"
            message={(error as Error)?.message || 'Could not retrieve listening analytics from Spotify.'}
            onRetry={() => refetch()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && !profile && (
          <EmptyState
            icon="🧬"
            title="No Taste Data Available"
            message="Connect your Spotify account and stream music to generate your deep taste intelligence."
          />
        )}

        {/* Populated Taste Profile View */}
        {!isLoading && !isError && profile && (
          <>
            {/* 1. Archetype Hero Banner */}
            <ArchetypeHero
              archetype={profile.archetype}
              dna={profile.musicDNA}
              timeRangeLabel={profile.timeRangeLabel}
            />

            {/* 2. Music DNA Scorecard */}
            <MusicDNAScorecard dna={profile.musicDNA} />

            {/* 3. Core Structural Analysis: Artist Diversity & Genre Profile */}
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

            {/* 4. Behavioral & Momentum Analysis: Recent Trends & Loyalty vs Discovery */}
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

            {/* 5. Cultural Spectrum & Taste Evolution: Niche Index & Evolution */}
            <section className="space-y-4">
              <div>
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                >
                  <span>🧭</span> Cultural Spectrum & Evolution
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
