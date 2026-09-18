import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscoverRecommendations } from '../hooks/useSpotifyData';
import { DiscoverHero, type DiscoverFilterType } from '../components/discover/DiscoverHero';
import { TrackRecommendationCard } from '../components/discover/TrackRecommendationCard';
import { ArtistRecommendationCard } from '../components/discover/ArtistRecommendationCard';
import { RecommendationSection } from '../components/discover/RecommendationSection';
import { DiscoverSkeleton } from '../components/discover/DiscoverSkeleton';
import { ErrorState, EmptyState } from '../components/ui/ErrorState';
import type { MLTrackRecommendation, MLArtistRecommendation } from '../types';

export function DiscoverPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<DiscoverFilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch ML recommendations
  const discoverQuery = useDiscoverRecommendations();
  const data = discoverQuery.data;

  // Handle refresh action
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['recommendations-discover'] });
    await discoverQuery.refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  }, [queryClient, discoverQuery]);

  const allTracks: MLTrackRecommendation[] = useMemo(() => {
    return data?.tracks?.recommendations || [];
  }, [data]);

  const allArtists: MLArtistRecommendation[] = useMemo(() => {
    return data?.artists?.recommendations || [];
  }, [data]);

  // Section Groupings
  const madeForYouTracks = useMemo(() => {
    // Highest recommendation score tracks
    return [...allTracks].sort((a, b) => b.recommendation_score - a.recommendation_score).slice(0, 6);
  }, [allTracks]);

  const similarTracks = useMemo(() => {
    return allTracks.filter((t) => t.category === 'SIMILAR');
  }, [allTracks]);

  const discoverTracks = useMemo(() => {
    return allTracks.filter((t) => t.category === 'DISCOVER');
  }, [allTracks]);

  const exploreTracks = useMemo(() => {
    return allTracks.filter((t) => t.category === 'EXPLORE');
  }, [allTracks]);

  const wildcardTracks = useMemo(() => {
    return allTracks.filter((t) => t.category === 'WILDCARD');
  }, [allTracks]);

  // Filtered views when user chooses a specific tab
  const filteredTracks = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'tracks') return allTracks;
    if (activeFilter === 'artists') return [];
    return allTracks.filter(
      (t) => t.category?.toUpperCase() === activeFilter.toUpperCase()
    );
  }, [allTracks, activeFilter]);

  const filteredArtists = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'artists') return allArtists;
    if (activeFilter === 'tracks') return [];
    return allArtists.filter(
      (a) => a.category?.toUpperCase() === activeFilter.toUpperCase()
    );
  }, [allArtists, activeFilter]);

  const hasAnyData = allTracks.length > 0 || allArtists.length > 0;

  return (
    <div className="flex-1 min-w-0">
      <main className="px-6 py-8 flex flex-col gap-12 max-w-7xl mx-auto pb-24 lg:pb-12">
        {/* Header & Controls */}
        <DiscoverHero
          userTaste={data?.userTaste}
          totalEvaluated={data?.tracks?.total_candidates_evaluated}
          filteredAlreadyHeard={data?.tracks?.filtered_already_heard_count}
          engine={data?.metadata?.engine}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || discoverQuery.isFetching}
        />

        {/* Loading State */}
        {discoverQuery.isLoading && <DiscoverSkeleton />}

        {/* Error State */}
        {discoverQuery.isError && !discoverQuery.isLoading && (
          <ErrorState
            title="Couldn't generate recommendations"
            message="The ML recommendation service may be syncing with Spotify. Please verify your connection or try again."
            onRetry={() => discoverQuery.refetch()}
          />
        )}

        {/* Empty / Zero Recommendations State */}
        {!discoverQuery.isLoading && !discoverQuery.isError && !hasAnyData && (
          <EmptyState
            icon="🔮"
            title="No recommendations generated yet"
            message="Keep listening on Spotify and Lore.fm will analyze your listening data to generate fresh recommendations."
          />
        )}

        {/* Main Content Sections */}
        {!discoverQuery.isLoading && !discoverQuery.isError && hasAnyData && (
          <AnimatePresence mode="wait">
            {activeFilter === 'all' ? (
              <motion.div
                key="all-sections"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-14"
              >
                {/* 1. MADE FOR YOU */}
                {madeForYouTracks.length > 0 && (
                  <RecommendationSection
                    icon="✨"
                    title="Made For You"
                    subtitle="Our strongest personalized picks crafted from your core listening DNA."
                    badge="Top Matches"
                    badgeColor="green"
                    count={madeForYouTracks.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      {madeForYouTracks.map((track, idx) => (
                        <TrackRecommendationCard key={track.track_id} track={track} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {/* 2. NEW ARTISTS TO DISCOVER */}
                {allArtists.length > 0 && (
                  <RecommendationSection
                    icon="🎤"
                    title="New Artists To Discover"
                    subtitle="Artists you have never listened to, matching your sonic palette."
                    badge="Fresh Voices"
                    badgeColor="purple"
                    count={allArtists.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allArtists.map((artist, idx) => (
                        <ArtistRecommendationCard key={artist.artist_id} artist={artist} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {/* 3. SIMILAR TO YOUR TASTE */}
                {similarTracks.length > 0 && (
                  <RecommendationSection
                    icon="🎯"
                    title="Similar To Your Taste"
                    subtitle="Familiar sonic signatures closely aligned with your current heavy rotation."
                    badge="High Overlap"
                    badgeColor="green"
                    count={similarTracks.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {similarTracks.map((track, idx) => (
                        <TrackRecommendationCard key={track.track_id} track={track} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {/* 4. FRESH DISCOVERIES */}
                {discoverTracks.length > 0 && (
                  <RecommendationSection
                    icon="🔮"
                    title="Fresh Discoveries"
                    subtitle="Unheard gems balancing high taste alignment with fresh musical territory."
                    badge="Balanced"
                    badgeColor="purple"
                    count={discoverTracks.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {discoverTracks.map((track, idx) => (
                        <TrackRecommendationCard key={track.track_id} track={track} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {/* 4. EXPLORE */}
                {exploreTracks.length > 0 && (
                  <RecommendationSection
                    icon="🔭"
                    title="Explore"
                    subtitle="Controlled discovery just beyond your usual genres, with meaningful relevance."
                    badge="Taste Horizon"
                    badgeColor="cyan"
                    count={exploreTracks.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {exploreTracks.map((track, idx) => (
                        <TrackRecommendationCard key={track.track_id} track={track} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {/* 5. WILDCARD */}
                {wildcardTracks.length > 0 && (
                  <RecommendationSection
                    icon="🎲"
                    title="Wanna get a little weird?"
                    subtitle="Wildcard gems outside your ordinary habits. High novelty, unexpected affinities."
                    badge="Wildcard"
                    badgeColor="amber"
                    count={wildcardTracks.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {wildcardTracks.map((track, idx) => (
                        <TrackRecommendationCard key={track.track_id} track={track} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}
              </motion.div>
            ) : (
              /* Specific Filter Views (Tracks, Artists, Similar, Discover, Explore, Wildcard) */
              <motion.div
                key={`filtered-${activeFilter}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-10"
              >
                {filteredTracks.length > 0 && (
                  <RecommendationSection
                    icon="🎵"
                    title={
                      activeFilter === 'tracks'
                        ? 'All Track Discoveries'
                        : `${activeFilter.charAt(0) + activeFilter.slice(1).toLowerCase()} Tracks`
                    }
                    subtitle="Curated tracks filtered for this specific discovery dimension."
                    count={filteredTracks.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredTracks.map((track, idx) => (
                        <TrackRecommendationCard key={track.track_id} track={track} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {filteredArtists.length > 0 && (
                  <RecommendationSection
                    icon="🎤"
                    title={
                      activeFilter === 'artists'
                        ? 'All Artist Discoveries'
                        : `${activeFilter.charAt(0) + activeFilter.slice(1).toLowerCase()} Artists`
                    }
                    subtitle="Unheard artists filtered by taste similarity."
                    count={filteredArtists.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredArtists.map((artist, idx) => (
                        <ArtistRecommendationCard key={artist.artist_id} artist={artist} index={idx} />
                      ))}
                    </div>
                  </RecommendationSection>
                )}

                {filteredTracks.length === 0 && filteredArtists.length === 0 && (
                  <EmptyState
                    icon="🔍"
                    title={`No ${activeFilter} recommendations available`}
                    message="Try choosing another filter tab or refreshing recommendations."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
