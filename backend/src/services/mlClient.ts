import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MLMatchedSignal {
  type: string;
  description: string;
  strength: number;
}

export interface MLTrackRecommendation {
  track_id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  album_name: string | null;
  album_image_url: string | null;
  preview_url: string | null;
  spotify_url: string | null;
  category: 'SIMILAR' | 'DISCOVER' | 'EXPLORE' | 'WILDCARD';
  similarity_score: number;
  recommendation_score: number;
  novelty_score: number;
  genre_affinity_score: number;
  matched_signals: MLMatchedSignal[];
  explanation: string;
}

export interface MLArtistRecommendation {
  artist_id: string;
  name: string;
  genres: string[];
  image_url: string | null;
  spotify_url: string | null;
  popularity: number | null;
  category: 'SIMILAR' | 'DISCOVER' | 'EXPLORE' | 'WILDCARD';
  similarity_score: number;
  recommendation_score: number;
  novelty_score: number;
  genre_affinity_score: number;
  matched_signals: MLMatchedSignal[];
  explanation: string;
}

export interface MLRecommendationResponse {
  user_id: string;
  generated_at: string;
  total_candidates_evaluated: number;
  filtered_already_heard_count: number;
  recommendations: MLTrackRecommendation[];
  category_breakdown: Record<string, number>;
}

export interface MLArtistRecommendationResponse {
  user_id: string;
  generated_at: string;
  total_candidates_evaluated: number;
  filtered_already_heard_count: number;
  recommendations: MLArtistRecommendation[];
  category_breakdown: Record<string, number>;
}

export interface MLUserTasteSummary {
  user_id: string;
  dominant_genres: { genre: string; weight: number }[];
  average_popularity: number;
  diversity_score: number;
  novelty_preference: number;
  repeat_listening_ratio: number;
  total_distinct_artists: number;
  total_distinct_tracks: number;
}

export async function isMLServiceAvailable(): Promise<boolean> {
  try {
    const res = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
    return res.status === 200 && res.data?.status === 'ok';
  } catch {
    return false;
  }
}

export async function getMLUserTasteSummary(payload: any): Promise<MLUserTasteSummary> {
  const res = await axios.post<MLUserTasteSummary>(
    `${ML_SERVICE_URL}/features/user-taste`,
    payload,
    { timeout: 8000 }
  );
  return res.data;
}

export async function getMLTrackRecommendations(
  payload: any,
  candidates: any[],
  limit = 20,
  categoryFilter?: string
): Promise<MLRecommendationResponse> {
  const res = await axios.post<MLRecommendationResponse>(
    `${ML_SERVICE_URL}/recommend/tracks`,
    {
      user_taste: payload,
      candidates,
      limit,
      category_filter: categoryFilter || null,
    },
    { timeout: 12000 }
  );
  return res.data;
}

export async function getMLArtistRecommendations(
  payload: any,
  candidates: any[],
  limit = 10,
  categoryFilter?: string
): Promise<MLArtistRecommendationResponse> {
  const res = await axios.post<MLArtistRecommendationResponse>(
    `${ML_SERVICE_URL}/recommend/artists`,
    {
      user_taste: payload,
      candidates,
      limit,
      category_filter: categoryFilter || null,
    },
    { timeout: 12000 }
  );
  return res.data;
}
