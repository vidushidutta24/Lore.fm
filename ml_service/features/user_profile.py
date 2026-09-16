from typing import Dict, List, Set, Any, Tuple
import math
from collections import defaultdict
from ..models.schemas import (
    UserTastePayload,
    UserTasteVectorSummary,
    ArtistSnapshotInput,
    TrackSnapshotInput,
    GenreSnapshotInput,
    ListeningEventInput
)

def extract_user_taste_profile(payload: UserTastePayload) -> Dict[str, Any]:
    """
    Extracts multi-period genre weights, artist affinities, popularity distributions,
    and listening behavior metrics from real Spotify historical data.
    """
    # 1. Multi-Period Weighted Genre Map
    # Short term (4W): 0.45, Medium term (6M): 0.35, Long term (1Y+): 0.20
    genre_weights: Dict[str, float] = defaultdict(float)
    
    # Process explicit genre snapshots if available
    for g in payload.genres_summary:
        time_weight = 0.45 if g.time_range == "short_term" else (0.35 if g.time_range == "medium_term" else 0.20)
        genre_weights[g.genre.lower().strip()] += g.score * time_weight * float(g.count)

    # Process artist snapshots to strengthen genre and artist affinities
    artist_affinities: Dict[str, float] = defaultdict(float)
    artist_names_map: Dict[str, str] = {}
    popularities: List[int] = []

    def process_artists(artists: List[ArtistSnapshotInput], period_weight: float):
        for a in artists:
            artist_names_map[a.artist_id] = a.name
            # Higher rank (1 is highest) gives higher rank_weight: (21 - rank) / 20
            rank_weight = max(0.1, (21 - min(a.rank, 20)) / 20.0)
            score = period_weight * rank_weight
            artist_affinities[a.artist_id] += score
            
            if a.popularity is not None:
                popularities.append(a.popularity)
                
            for genre in a.genres:
                g_clean = genre.lower().strip()
                if g_clean:
                    genre_weights[g_clean] += score * 1.5

    process_artists(payload.top_artists_short, 0.45)
    process_artists(payload.top_artists_medium, 0.35)
    process_artists(payload.top_artists_long, 0.20)

    # Process Track snapshots
    def process_tracks(tracks: List[TrackSnapshotInput], period_weight: float):
        for t in tracks:
            if t.popularity is not None:
                popularities.append(t.popularity)
            rank_weight = max(0.1, (21 - min(t.rank, 20)) / 20.0)
            if t.artist_id:
                artist_affinities[t.artist_id] += period_weight * rank_weight * 0.8
                artist_names_map[t.artist_id] = t.artist_name

    process_tracks(payload.top_tracks_short, 0.45)
    process_tracks(payload.top_tracks_medium, 0.35)
    process_tracks(payload.top_tracks_long, 0.20)

    # Process Listening Events (exact playback stream)
    event_track_counts: Dict[str, int] = defaultdict(int)
    for event in payload.listening_events:
        event_track_counts[event.track_id] += 1
        if event.artist_id:
            artist_affinities[event.artist_id] += 0.2

    # Repeat listening ratio
    total_events = len(payload.listening_events)
    unique_event_tracks = len(event_track_counts)
    repeat_ratio = (
        (total_events - unique_event_tracks) / max(1, total_events)
        if total_events > 0 else 0.2
    )

    # Calculate Average Popularity (Mean)
    avg_popularity = (
        float(sum(popularities)) / len(popularities)
        if popularities else 55.0
    )

    # Normalize genre weights
    total_genre_weight = sum(genre_weights.values())
    normalized_genres: Dict[str, float] = {}
    if total_genre_weight > 0:
        for g, w in genre_weights.items():
            normalized_genres[g] = w / total_genre_weight
    else:
        # Fallback if no genre tags existed
        normalized_genres["pop"] = 0.5
        normalized_genres["indie"] = 0.5

    # Calculate Genre Diversity (Shannon Entropy / Log N)
    genre_count = len(normalized_genres)
    if genre_count > 1:
        entropy = -sum(p * math.log(p) for p in normalized_genres.values() if p > 0)
        max_entropy = math.log(genre_count)
        diversity_score = round(entropy / max_entropy, 3)
    else:
        diversity_score = 0.3

    # Novelty Preference: users with lower repeat ratio & higher genre diversity favor novelty
    novelty_preference = round(min(1.0, max(0.0, (1.0 - repeat_ratio) * 0.6 + diversity_score * 0.4)), 3)

    # Sort dominant genres
    sorted_dominant_genres = sorted(
        [{"genre": g, "weight": round(w, 4)} for g, w in normalized_genres.items()],
        key=lambda x: x["weight"],
        reverse=True
    )

    # All known track and artist IDs for already-heard filtering
    known_track_ids: Set[str] = set(payload.already_heard_track_ids)
    for t in payload.top_tracks_short + payload.top_tracks_medium + payload.top_tracks_long:
        known_track_ids.add(t.track_id)
    for ev in payload.listening_events:
        known_track_ids.add(ev.track_id)

    known_artist_ids: Set[str] = set(payload.already_heard_artist_ids)
    for a in payload.top_artists_short + payload.top_artists_medium + payload.top_artists_long:
        known_artist_ids.add(a.artist_id)
    for t in payload.top_tracks_short + payload.top_tracks_medium + payload.top_tracks_long:
        if t.artist_id:
            known_artist_ids.add(t.artist_id)

    return {
        "user_id": payload.user_id,
        "genre_weights": normalized_genres,
        "dominant_genres": sorted_dominant_genres[:15],
        "artist_affinities": dict(artist_affinities),
        "artist_names_map": artist_names_map,
        "avg_popularity": avg_popularity,
        "diversity_score": diversity_score,
        "novelty_preference": novelty_preference,
        "repeat_listening_ratio": round(repeat_ratio, 3),
        "known_track_ids": known_track_ids,
        "known_artist_ids": known_artist_ids,
        "total_distinct_artists": len(known_artist_ids),
        "total_distinct_tracks": len(known_track_ids),
    }

def get_taste_summary(profile: Dict[str, Any]) -> UserTasteVectorSummary:
    return UserTasteVectorSummary(
        user_id=profile["user_id"],
        dominant_genres=profile["dominant_genres"][:10],
        average_popularity=round(profile["avg_popularity"], 1),
        diversity_score=profile["diversity_score"],
        novelty_preference=profile["novelty_preference"],
        repeat_listening_ratio=profile["repeat_listening_ratio"],
        total_distinct_artists=profile["total_distinct_artists"],
        total_distinct_tracks=profile["total_distinct_tracks"],
    )
