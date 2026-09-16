from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# ─── Inputs ───────────────────────────────────────────────────────────────────

class GenreSnapshotInput(BaseModel):
    genre: str
    score: float = 0.0
    count: int = 1
    time_range: Optional[str] = "medium_term"

class ArtistSnapshotInput(BaseModel):
    artist_id: str
    name: str
    genres: List[str] = Field(default_factory=list)
    popularity: Optional[int] = 50
    time_range: Optional[str] = "medium_term"
    rank: int = 1

class TrackSnapshotInput(BaseModel):
    track_id: str
    name: str
    artist_id: str
    artist_name: str
    duration_ms: Optional[int] = 200000
    popularity: Optional[int] = 50
    time_range: Optional[str] = "medium_term"
    rank: int = 1

class ListeningEventInput(BaseModel):
    track_id: str
    artist_id: Optional[str] = None
    played_at: str
    source: Optional[str] = "recently_played"

class UserTastePayload(BaseModel):
    user_id: str
    top_artists_short: List[ArtistSnapshotInput] = Field(default_factory=list)
    top_artists_medium: List[ArtistSnapshotInput] = Field(default_factory=list)
    top_artists_long: List[ArtistSnapshotInput] = Field(default_factory=list)
    top_tracks_short: List[TrackSnapshotInput] = Field(default_factory=list)
    top_tracks_medium: List[TrackSnapshotInput] = Field(default_factory=list)
    top_tracks_long: List[TrackSnapshotInput] = Field(default_factory=list)
    genres_summary: List[GenreSnapshotInput] = Field(default_factory=list)
    listening_events: List[ListeningEventInput] = Field(default_factory=list)
    already_heard_track_ids: List[str] = Field(default_factory=list)
    already_heard_artist_ids: List[str] = Field(default_factory=list)

class CandidateTrack(BaseModel):
    id: str
    name: str
    artist_id: str
    artist_name: str
    genres: List[str] = Field(default_factory=list)
    album_name: Optional[str] = None
    album_image_url: Optional[str] = None
    preview_url: Optional[str] = None
    spotify_url: Optional[str] = None
    duration_ms: Optional[int] = 200000
    popularity: Optional[int] = 50
    explicit: Optional[bool] = False

class CandidateArtist(BaseModel):
    id: str
    name: str
    genres: List[str] = Field(default_factory=list)
    popularity: Optional[int] = 50
    image_url: Optional[str] = None
    spotify_url: Optional[str] = None

class TrackRecommendRequest(BaseModel):
    user_taste: UserTastePayload
    candidates: List[CandidateTrack]
    limit: Optional[int] = 20
    category_filter: Optional[str] = None  # None or SIMILAR, DISCOVER, EXPLORE, WILDCARD

class ArtistRecommendRequest(BaseModel):
    user_taste: UserTastePayload
    candidates: List[CandidateArtist]
    limit: Optional[int] = 10
    category_filter: Optional[str] = None

# ─── Outputs ──────────────────────────────────────────────────────────────────

class MatchedSignal(BaseModel):
    type: str  # "genre_match", "artist_affinity", "novelty_bonus", "popularity_fit"
    description: str
    strength: float  # 0.0 to 1.0

class TrackRecommendationItem(BaseModel):
    track_id: str
    name: str
    artist_id: str
    artist_name: str
    album_name: Optional[str] = None
    album_image_url: Optional[str] = None
    preview_url: Optional[str] = None
    spotify_url: Optional[str] = None
    category: str  # "SIMILAR", "DISCOVER", "EXPLORE", "WILDCARD"
    similarity_score: float
    recommendation_score: float
    novelty_score: float
    genre_affinity_score: float
    matched_signals: List[MatchedSignal]
    explanation: str

class ArtistRecommendationItem(BaseModel):
    artist_id: str
    name: str
    genres: List[str]
    image_url: Optional[str] = None
    spotify_url: Optional[str] = None
    popularity: Optional[int] = None
    category: str  # "SIMILAR", "DISCOVER", "EXPLORE", "WILDCARD"
    similarity_score: float
    recommendation_score: float
    novelty_score: float
    genre_affinity_score: float
    matched_signals: List[MatchedSignal]
    explanation: str

class RecommendationResponse(BaseModel):
    user_id: str
    generated_at: str
    total_candidates_evaluated: int
    filtered_already_heard_count: int
    recommendations: List[TrackRecommendationItem]
    category_breakdown: Dict[str, int]

class ArtistRecommendationResponse(BaseModel):
    user_id: str
    generated_at: str
    total_candidates_evaluated: int
    filtered_already_heard_count: int
    recommendations: List[ArtistRecommendationItem]
    category_breakdown: Dict[str, int]

class UserTasteVectorSummary(BaseModel):
    user_id: str
    dominant_genres: List[Dict[str, Any]]
    average_popularity: float
    diversity_score: float
    novelty_preference: float
    repeat_listening_ratio: float
    total_distinct_artists: int
    total_distinct_tracks: int
