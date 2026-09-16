from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import numpy as np

from ..models.schemas import (
    UserTastePayload,
    CandidateTrack,
    CandidateArtist,
    TrackRecommendationItem,
    ArtistRecommendationItem,
    MatchedSignal,
    RecommendationResponse,
    ArtistRecommendationResponse
)
from ..features.user_profile import extract_user_taste_profile
from ..features.vectorizer import GenreSpaceVectorizer, compute_popularity_compatibility

class ContentBasedRecommender:
    """
    Production-grade content-based recommendation engine powered by scikit-learn.
    Features:
    - User Taste Vectorization
    - TF-IDF Genre Space Cosine Similarity & Direct Affinity Ensemble
    - Multi-Period Artist Affinity Integration
    - Strict Historical Already-Heard Filtering
    - 4 Recommendation Categories: SIMILAR, DISCOVER, EXPLORE, WILDCARD
    - Deterministic Multi-Objective Ranking
    - Signal Extraction & Explainability
    """

    def __init__(self):
        self.vectorizer = GenreSpaceVectorizer()

    def recommend_tracks(
        self,
        payload: UserTastePayload,
        candidates: List[CandidateTrack],
        limit: int = 20,
        category_filter: Optional[str] = None
    ) -> RecommendationResponse:
        user_profile = extract_user_taste_profile(payload)
        known_track_ids = user_profile["known_track_ids"]
        known_artist_ids = user_profile["known_artist_ids"]
        artist_affinities = user_profile["artist_affinities"]
        artist_names_map = user_profile["artist_names_map"]
        dominant_genres = [g["genre"] for g in user_profile["dominant_genres"]]
        avg_pop = user_profile["avg_popularity"]
        novelty_pref = user_profile["novelty_preference"]

        total_candidates = len(candidates)
        # 1. Filter Already Heard Music
        eligible_candidates = [c for c in candidates if c.id not in known_track_ids]
        filtered_count = total_candidates - len(eligible_candidates)

        now_iso = datetime.now(timezone.utc).isoformat()

        if not eligible_candidates:
            return RecommendationResponse(
                user_id=payload.user_id,
                generated_at=now_iso,
                total_candidates_evaluated=total_candidates,
                filtered_already_heard_count=filtered_count,
                recommendations=[],
                category_breakdown={"SIMILAR": 0, "DISCOVER": 0, "EXPLORE": 0, "WILDCARD": 0}
            )

        # 2. Vectorize and compute genre cosine similarity
        candidate_genres = [c.genres for c in eligible_candidates]
        genre_sims = self.vectorizer.compute_genre_similarity(
            user_profile["genre_weights"],
            candidate_genres
        )

        ranked_items: List[TrackRecommendationItem] = []
        category_counts = {"SIMILAR": 0, "DISCOVER": 0, "EXPLORE": 0, "WILDCARD": 0}

        for idx, candidate in enumerate(eligible_candidates):
            g_sim = float(genre_sims[idx]) if idx < len(genre_sims) else 0.2
            pop_val = candidate.popularity if candidate.popularity is not None else 50
            pop_fit = compute_popularity_compatibility(avg_pop, pop_val)
            
            is_familiar_artist = candidate.artist_id in known_artist_ids
            artist_affinity = artist_affinities.get(candidate.artist_id, 0.0)

            # Novelty: tracks from unknown artists and less mainstream popularity get higher novelty
            artist_novelty = 0.85 if not is_familiar_artist else 0.15
            pop_novelty = max(0.1, 1.0 - (pop_val / 100.0))
            novelty_score = round(0.6 * artist_novelty + 0.4 * pop_novelty, 3)

            # Assign Category
            if is_familiar_artist and g_sim >= 0.35:
                category = "SIMILAR"
            elif not is_familiar_artist and g_sim >= 0.45:
                category = "DISCOVER"
            elif g_sim >= 0.20:
                category = "EXPLORE"
            else:
                category = "WILDCARD"

            if category_filter and category != category_filter:
                continue

            # Category-specific Multi-Objective Scoring
            if category == "SIMILAR":
                rec_score = (
                    0.50 * g_sim +
                    0.25 * min(1.0, artist_affinity) +
                    0.15 * pop_fit +
                    0.10 * (1.0 - novelty_score)
                )
            elif category == "DISCOVER":
                rec_score = (
                    0.45 * g_sim +
                    0.25 * novelty_score +
                    0.15 * pop_fit +
                    0.15 * (0.8 if not is_familiar_artist else 0.2)
                )
            elif category == "EXPLORE":
                rec_score = (
                    0.35 * g_sim +
                    0.35 * novelty_score +
                    0.20 * pop_fit +
                    0.10 * novelty_pref
                )
            else:  # WILDCARD
                rec_score = (
                    0.20 * g_sim +
                    0.50 * novelty_score +
                    0.20 * (1.0 - pop_fit) +
                    0.10 * novelty_pref
                )

            # Generate Matched Signals and Explainability
            matched_signals: List[MatchedSignal] = []
            
            # Genre overlap signal
            candidate_genres_clean = [g.lower() for g in candidate.genres]
            overlap_genres = [g for g in dominant_genres if any(g in cg or cg in g for cg in candidate_genres_clean)]
            if overlap_genres:
                matched_signals.append(MatchedSignal(
                    type="genre_match",
                    description=f"Aligns with your top genre: {overlap_genres[0].title()}",
                    strength=round(g_sim, 2)
                ))
            elif g_sim > 0.35:
                matched_signals.append(MatchedSignal(
                    type="genre_match",
                    description="Stylistically coherent with your overall listening profile",
                    strength=round(g_sim, 2)
                ))

            # Artist affinity signal
            if is_familiar_artist:
                matched_signals.append(MatchedSignal(
                    type="artist_affinity",
                    description=f"Unheard track from your familiar artist {candidate.artist_name}",
                    strength=0.9
                ))
            else:
                matched_signals.append(MatchedSignal(
                    type="novelty_bonus",
                    description=f"Fresh artist discovery outside your immediate rotation",
                    strength=round(novelty_score, 2)
                ))

            # Popularity fit signal
            if pop_fit > 0.7:
                matched_signals.append(MatchedSignal(
                    type="popularity_fit",
                    description="Matches your typical underground vs mainstream balance",
                    strength=round(pop_fit, 2)
                ))

            # Explanation sentence
            if category == "SIMILAR":
                explanation = f"Suggested because you love {candidate.artist_name} and tracks in {overlap_genres[0] if overlap_genres else 'this style'}."
            elif category == "DISCOVER":
                top_fav = list(artist_names_map.values())[0] if artist_names_map else "your favorite artists"
                explanation = f"Recommended fresh discovery: shares the soundscape of {top_fav}."
            elif category == "EXPLORE":
                explanation = f"Broadens your taste slightly beyond {dominant_genres[0] if dominant_genres else 'your core sound'}."
            else:
                explanation = f"Wildcard pick: curated to offer a fresh perspective outside your usual listening loop."

            item = TrackRecommendationItem(
                track_id=candidate.id,
                name=candidate.name,
                artist_id=candidate.artist_id,
                artist_name=candidate.artist_name,
                album_name=candidate.album_name,
                album_image_url=candidate.album_image_url,
                preview_url=candidate.preview_url,
                spotify_url=candidate.spotify_url,
                category=category,
                similarity_score=round(g_sim, 3),
                recommendation_score=round(float(np.clip(rec_score, 0.05, 0.99)), 3),
                novelty_score=novelty_score,
                genre_affinity_score=round(g_sim, 3),
                matched_signals=matched_signals,
                explanation=explanation
            )
            ranked_items.append(item)
            category_counts[category] += 1

        # Sort by recommendation score descending
        ranked_items.sort(key=lambda x: x.recommendation_score, reverse=True)

        return RecommendationResponse(
            user_id=payload.user_id,
            generated_at=now_iso,
            total_candidates_evaluated=total_candidates,
            filtered_already_heard_count=filtered_count,
            recommendations=ranked_items[:limit],
            category_breakdown=category_counts
        )

    def recommend_artists(
        self,
        payload: UserTastePayload,
        candidates: List[CandidateArtist],
        limit: int = 10,
        category_filter: Optional[str] = None
    ) -> ArtistRecommendationResponse:
        user_profile = extract_user_taste_profile(payload)
        known_artist_ids = user_profile["known_artist_ids"]
        dominant_genres = [g["genre"] for g in user_profile["dominant_genres"]]
        avg_pop = user_profile["avg_popularity"]
        novelty_pref = user_profile["novelty_preference"]

        total_candidates = len(candidates)
        # 1. Filter Already Heard Artists
        eligible_candidates = [c for c in candidates if c.id not in known_artist_ids]
        filtered_count = total_candidates - len(eligible_candidates)

        now_iso = datetime.now(timezone.utc).isoformat()

        if not eligible_candidates:
            return ArtistRecommendationResponse(
                user_id=payload.user_id,
                generated_at=now_iso,
                total_candidates_evaluated=total_candidates,
                filtered_already_heard_count=filtered_count,
                recommendations=[],
                category_breakdown={"SIMILAR": 0, "DISCOVER": 0, "EXPLORE": 0, "WILDCARD": 0}
            )

        # 2. Vectorize genres
        candidate_genres = [c.genres for c in eligible_candidates]
        genre_sims = self.vectorizer.compute_genre_similarity(
            user_profile["genre_weights"],
            candidate_genres
        )

        ranked_items: List[ArtistRecommendationItem] = []
        category_counts = {"SIMILAR": 0, "DISCOVER": 0, "EXPLORE": 0, "WILDCARD": 0}

        for idx, candidate in enumerate(eligible_candidates):
            g_sim = float(genre_sims[idx]) if idx < len(genre_sims) else 0.2
            pop_val = candidate.popularity if candidate.popularity is not None else 50
            pop_fit = compute_popularity_compatibility(avg_pop, pop_val)

            novelty_score = round(max(0.1, 1.0 - (pop_val / 100.0)), 3)

            if g_sim >= 0.45:
                category = "DISCOVER"
            elif g_sim >= 0.20:
                category = "EXPLORE"
            else:
                category = "WILDCARD"

            if category_filter and category != category_filter:
                continue

            # Score calculation
            if category == "DISCOVER":
                rec_score = 0.55 * g_sim + 0.25 * pop_fit + 0.20 * novelty_score
            elif category == "EXPLORE":
                rec_score = 0.40 * g_sim + 0.35 * novelty_score + 0.25 * pop_fit
            else:
                rec_score = 0.25 * g_sim + 0.50 * novelty_score + 0.25 * (1.0 - pop_fit)

            matched_signals: List[MatchedSignal] = []
            candidate_genres_clean = [g.lower() for g in candidate.genres]
            overlap_genres = [g for g in dominant_genres if any(g in cg or cg in g for cg in candidate_genres_clean)]

            if overlap_genres:
                matched_signals.append(MatchedSignal(
                    type="genre_match",
                    description=f"Strong presence in {overlap_genres[0].title()}",
                    strength=round(g_sim, 2)
                ))

            matched_signals.append(MatchedSignal(
                type="novelty_bonus",
                description="Completely new artist to your verified listening history",
                strength=round(novelty_score, 2)
            ))

            explanation = (
                f"New artist recommendation based on your affinity for {overlap_genres[0] if overlap_genres else 'your top styles'}."
                if category == "DISCOVER"
                else f"An exploratory bridge to expand your rotation into {candidate.genres[0] if candidate.genres else 'new sounds'}."
            )

            item = ArtistRecommendationItem(
                artist_id=candidate.id,
                name=candidate.name,
                genres=candidate.genres,
                image_url=candidate.image_url,
                spotify_url=candidate.spotify_url,
                popularity=candidate.popularity,
                category=category,
                similarity_score=round(g_sim, 3),
                recommendation_score=round(float(np.clip(rec_score, 0.05, 0.99)), 3),
                novelty_score=novelty_score,
                genre_affinity_score=round(g_sim, 3),
                matched_signals=matched_signals,
                explanation=explanation
            )
            ranked_items.append(item)
            category_counts[category] += 1

        ranked_items.sort(key=lambda x: x.recommendation_score, reverse=True)

        return ArtistRecommendationResponse(
            user_id=payload.user_id,
            generated_at=now_iso,
            total_candidates_evaluated=total_candidates,
            filtered_already_heard_count=filtered_count,
            recommendations=ranked_items[:limit],
            category_breakdown=category_counts
        )
