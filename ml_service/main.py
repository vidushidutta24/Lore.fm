from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models.schemas import (
    TrackRecommendRequest,
    ArtistRecommendRequest,
    UserTastePayload,
    RecommendationResponse,
    ArtistRecommendationResponse,
    UserTasteVectorSummary,
)
from .features.user_profile import extract_user_taste_profile, get_taste_summary
from .recommender.engine import ContentBasedRecommender

app = FastAPI(
    title="Lore.fm ML Recommendation Engine",
    description="Machine Learning service for personalized music candidate ranking and feature engineering",
    version="1.0.0"
)

# Enable CORS for local Node backend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = ContentBasedRecommender()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Lore.fm ML Service",
        "engine": "Scikit-Learn Content-Based Recommender"
    }

@app.post("/features/user-taste", response_model=UserTasteVectorSummary)
def compute_user_taste_features(payload: UserTastePayload):
    try:
        profile = extract_user_taste_profile(payload)
        return get_taste_summary(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature extraction failed: {str(e)}")

@app.post("/recommend/tracks", response_model=RecommendationResponse)
def recommend_tracks(request: TrackRecommendRequest):
    try:
        return recommender.recommend_tracks(
            payload=request.user_taste,
            candidates=request.candidates,
            limit=request.limit or 20,
            category_filter=request.category_filter
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Track recommendation failed: {str(e)}")

@app.post("/recommend/artists", response_model=ArtistRecommendationResponse)
def recommend_artists(request: ArtistRecommendRequest):
    try:
        return recommender.recommend_artists(
            payload=request.user_taste,
            candidates=request.candidates,
            limit=request.limit or 10,
            category_filter=request.category_filter
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Artist recommendation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_service.main:app", host="0.0.0.0", port=8000, reload=True)
