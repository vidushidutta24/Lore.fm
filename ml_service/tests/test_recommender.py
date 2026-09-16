import pytest
from fastapi.testclient import TestClient

from ml_service.main import app
from ml_service.models.schemas import (
    UserTastePayload,
    ArtistSnapshotInput,
    TrackSnapshotInput,
    GenreSnapshotInput,
    ListeningEventInput,
    CandidateTrack,
    CandidateArtist,
    TrackRecommendRequest,
    ArtistRecommendRequest
)
from ml_service.features.user_profile import extract_user_taste_profile
from ml_service.recommender.engine import ContentBasedRecommender

client = TestClient(app)

@pytest.fixture
def sample_user_payload():
    return UserTastePayload(
        user_id="user_test_123",
        top_artists_short=[
            ArtistSnapshotInput(artist_id="art_1", name="Phoebe Bridgers", genres=["indie pop", "indie folk", "singer-songwriter"], popularity=75, rank=1),
            ArtistSnapshotInput(artist_id="art_2", name="Boygenius", genres=["indie rock", "indie pop"], popularity=68, rank=2),
        ],
        top_artists_medium=[
            ArtistSnapshotInput(artist_id="art_1", name="Phoebe Bridgers", genres=["indie pop", "indie folk"], popularity=75, rank=1),
            ArtistSnapshotInput(artist_id="art_3", name="Lucy Dacus", genres=["indie rock", "folk-pop"], popularity=60, rank=2),
        ],
        top_artists_long=[
            ArtistSnapshotInput(artist_id="art_4", name="Radiohead", genres=["art rock", "alternative rock"], popularity=82, rank=1),
        ],
        top_tracks_short=[
            TrackSnapshotInput(track_id="trk_1", name="Kyoto", artist_id="art_1", artist_name="Phoebe Bridgers", popularity=72, rank=1),
            TrackSnapshotInput(track_id="trk_2", name="Not Strong Enough", artist_id="art_2", artist_name="Boygenius", popularity=70, rank=2),
        ],
        top_tracks_medium=[
            TrackSnapshotInput(track_id="trk_1", name="Kyoto", artist_id="art_1", artist_name="Phoebe Bridgers", popularity=72, rank=1),
        ],
        top_tracks_long=[
            TrackSnapshotInput(track_id="trk_3", name="Karma Police", artist_id="art_4", artist_name="Radiohead", popularity=80, rank=1),
        ],
        genres_summary=[
            GenreSnapshotInput(genre="indie pop", score=1.0, count=2, time_range="short_term"),
            GenreSnapshotInput(genre="indie folk", score=0.8, count=1, time_range="short_term"),
            GenreSnapshotInput(genre="art rock", score=0.5, count=1, time_range="long_term"),
        ],
        listening_events=[
            ListeningEventInput(track_id="trk_1", artist_id="art_1", played_at="2026-09-10T12:00:00Z"),
            ListeningEventInput(track_id="trk_1", artist_id="art_1", played_at="2026-09-11T12:00:00Z"),
            ListeningEventInput(track_id="trk_2", artist_id="art_2", played_at="2026-09-12T12:00:00Z"),
        ],
        already_heard_track_ids=["trk_1", "trk_2", "trk_3"],
        already_heard_artist_ids=["art_1", "art_2", "art_3", "art_4"],
    )

@pytest.fixture
def sample_candidate_tracks():
    return [
        # Familiar artist, unheard track (SIMILAR)
        CandidateTrack(
            id="trk_cand_1",
            name="Motion Sickness",
            artist_id="art_1",
            artist_name="Phoebe Bridgers",
            genres=["indie pop", "indie folk"],
            popularity=74
        ),
        # New artist, very similar genres (DISCOVER)
        CandidateTrack(
            id="trk_cand_2",
            name="Silk Chiffon",
            artist_id="art_new_1",
            artist_name="MUNA",
            genres=["indie pop", "synth-pop"],
            popularity=65
        ),
        # Slightly different genre (EXPLORE)
        CandidateTrack(
            id="trk_cand_3",
            name="Alison",
            artist_id="art_new_2",
            artist_name="Slowdive",
            genres=["shoegaze", "dream pop"],
            popularity=58
        ),
        # Completely different genre (WILDCARD)
        CandidateTrack(
            id="trk_cand_4",
            name="Blue in Green",
            artist_id="art_new_3",
            artist_name="Miles Davis",
            genres=["jazz", "bebop"],
            popularity=62
        ),
        # Already heard track (MUST BE FILTERED OUT)
        CandidateTrack(
            id="trk_1",
            name="Kyoto",
            artist_id="art_1",
            artist_name="Phoebe Bridgers",
            genres=["indie pop"],
            popularity=72
        ),
    ]

# ─── Tests ────────────────────────────────────────────────────────────────────

def test_feature_extraction_and_taste_vector(sample_user_payload):
    profile = extract_user_taste_profile(sample_user_payload)
    assert profile["user_id"] == "user_test_123"
    assert "indie pop" in profile["genre_weights"]
    assert profile["genre_weights"]["indie pop"] > 0
    assert profile["avg_popularity"] > 50
    assert "trk_1" in profile["known_track_ids"]
    assert "art_1" in profile["known_artist_ids"]
    assert profile["total_distinct_tracks"] >= 3
    assert profile["total_distinct_artists"] >= 4

def test_already_heard_filtering(sample_user_payload, sample_candidate_tracks):
    recommender = ContentBasedRecommender()
    response = recommender.recommend_tracks(sample_user_payload, sample_candidate_tracks, limit=10)
    
    # trk_1 was in already_heard_track_ids, must NEVER appear in recommendations
    recommended_ids = [r.track_id for r in response.recommendations]
    assert "trk_1" not in recommended_ids
    assert response.filtered_already_heard_count == 1
    assert len(response.recommendations) == 4

def test_recommendation_categories_and_signals(sample_user_payload, sample_candidate_tracks):
    recommender = ContentBasedRecommender()
    response = recommender.recommend_tracks(sample_user_payload, sample_candidate_tracks, limit=10)
    
    categories = {r.track_id: r.category for r in response.recommendations}
    assert categories.get("trk_cand_1") == "SIMILAR"  # Phoebe Bridgers track
    assert categories.get("trk_cand_2") == "DISCOVER" # MUNA (indie pop)
    assert categories.get("trk_cand_4") == "WILDCARD" # Miles Davis (jazz)

    # Check signal explainability
    for rec in response.recommendations:
        assert len(rec.matched_signals) > 0
        assert len(rec.explanation) > 0
        assert 0.0 <= rec.recommendation_score <= 1.0

def test_artist_recommendation_filtering(sample_user_payload):
    recommender = ContentBasedRecommender()
    candidates = [
        # Known artist (art_1) -> Should be filtered out
        CandidateArtist(id="art_1", name="Phoebe Bridgers", genres=["indie pop"], popularity=75),
        # New artist (art_new_1) -> Should be kept
        CandidateArtist(id="art_new_1", name="MUNA", genres=["indie pop", "synth-pop"], popularity=65),
        # New artist (art_new_3) -> Should be kept as Wildcard
        CandidateArtist(id="art_new_3", name="Miles Davis", genres=["jazz"], popularity=62),
    ]
    response = recommender.recommend_artists(sample_user_payload, candidates, limit=5)
    
    recommended_artist_ids = [r.artist_id for r in response.recommendations]
    assert "art_1" not in recommended_artist_ids
    assert "art_new_1" in recommended_artist_ids
    assert response.filtered_already_heard_count == 1

def test_edge_case_brand_new_user():
    # User with empty history
    empty_payload = UserTastePayload(
        user_id="user_new_empty",
        top_artists_short=[],
        top_artists_medium=[],
        top_artists_long=[],
        top_tracks_short=[],
        top_tracks_medium=[],
        top_tracks_long=[],
        genres_summary=[],
        listening_events=[],
        already_heard_track_ids=[],
        already_heard_artist_ids=[],
    )
    candidates = [
        CandidateTrack(id="trk_c1", name="Track A", artist_id="art_c1", artist_name="Artist A", genres=["pop"], popularity=50),
        CandidateTrack(id="trk_c2", name="Track B", artist_id="art_c2", artist_name="Artist B", genres=["rock"], popularity=60),
    ]
    recommender = ContentBasedRecommender()
    response = recommender.recommend_tracks(empty_payload, candidates, limit=5)
    assert len(response.recommendations) == 2
    assert response.filtered_already_heard_count == 0

def test_edge_case_no_candidates(sample_user_payload):
    recommender = ContentBasedRecommender()
    response = recommender.recommend_tracks(sample_user_payload, [], limit=10)
    assert len(response.recommendations) == 0
    assert response.total_candidates_evaluated == 0

def test_fastapi_endpoints(sample_user_payload, sample_candidate_tracks):
    # Test Health endpoint
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "ok"

    # Test User Taste Features endpoint
    taste_res = client.post("/features/user-taste", json=sample_user_payload.model_dump())
    assert taste_res.status_code == 200
    taste_json = taste_res.json()
    assert taste_json["user_id"] == "user_test_123"
    assert "dominant_genres" in taste_json

    # Test Track Recommendations endpoint
    req_body = TrackRecommendRequest(
        user_taste=sample_user_payload,
        candidates=sample_candidate_tracks,
        limit=5
    )
    rec_res = client.post("/recommend/tracks", json=req_body.model_dump())
    assert rec_res.status_code == 200
    rec_json = rec_res.json()
    assert len(rec_json["recommendations"]) == 4
    assert rec_json["filtered_already_heard_count"] == 1
