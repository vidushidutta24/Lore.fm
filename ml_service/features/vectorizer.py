from typing import Dict, List, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

class GenreSpaceVectorizer:
    """
    Vectorizes genre distributions for users and candidates using TF-IDF sublinear scaling
    and direct weighted genre affinity calculation.
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            token_pattern=r"(?u)\b[\w-]+\b",
            lowercase=True,
            sublinear_tf=True
        )

    def compute_genre_similarity(
        self,
        user_genre_weights: Dict[str, float],
        candidate_genres_list: List[List[str]]
    ) -> np.ndarray:
        """
        Computes composite similarity between a user's weighted genre profile and candidate genres.
        Uses an ensemble of TF-IDF cosine similarity and direct weighted genre affinity.
        """
        if not candidate_genres_list:
            return np.array([])

        # 1. Direct Weighted Genre Affinity Calculation
        direct_affinities = []
        user_genres_clean = {k.lower().strip(): v for k, v in user_genre_weights.items()}
        
        for g_list in candidate_genres_list:
            if not g_list:
                direct_affinities.append(0.1)
                continue
            cand_weights = []
            for g in g_list:
                g_c = g.lower().strip()
                # Direct match
                if g_c in user_genres_clean:
                    cand_weights.append(user_genres_clean[g_c])
                else:
                    # Partial token match (e.g., 'indie pop' matching 'pop' or 'indie')
                    g_tokens = g_c.split()
                    matched_sub = [
                        user_genres_clean[ug]
                        for ug in user_genres_clean
                        if any(t in ug for t in g_tokens)
                    ]
                    cand_weights.append(max(matched_sub) * 0.75 if matched_sub else 0.0)
            
            # Normalize by top user weight to scale 0 to 1
            max_user_w = max(user_genres_clean.values()) if user_genres_clean else 1.0
            avg_cand_w = (sum(cand_weights) / len(cand_weights)) / max(0.001, max_user_w)
            # Boost if any primary genre has a direct hit
            max_cand_w = (max(cand_weights) / max(0.001, max_user_w)) if cand_weights else 0.0
            direct_score = 0.6 * max_cand_w + 0.4 * avg_cand_w
            direct_affinities.append(min(1.0, direct_score))

        # 2. TF-IDF Cosine Similarity
        user_tokens = []
        for genre, weight in user_genre_weights.items():
            g_token = genre.replace(" ", "-")
            repeats = max(1, int(round(weight * 100)))
            user_tokens.extend([g_token] * repeats)

        user_text = " ".join(user_tokens) if user_tokens else "pop indie rock"

        candidate_texts = []
        for g_list in candidate_genres_list:
            if g_list:
                cleaned = [g.lower().replace(" ", "-") for g in g_list if g]
                candidate_texts.append(" ".join(cleaned) if cleaned else "pop")
            else:
                candidate_texts.append("pop")

        corpus = [user_text] + candidate_texts
        try:
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            user_vec = tfidf_matrix[0:1]
            candidate_vecs = tfidf_matrix[1:]
            cosine_sims = cosine_similarity(user_vec, candidate_vecs).flatten()
        except Exception:
            cosine_sims = np.full(len(candidate_genres_list), 0.2)

        # Ensemble: take the stronger signal between direct weighted hit and cosine space
        combined = 0.5 * np.clip(cosine_sims, 0.0, 1.0) + 0.5 * np.array(direct_affinities)
        # Scale to full 0.0-1.0 range based on direct affinity presence
        final_scores = np.maximum(combined, np.array(direct_affinities))
        return np.clip(final_scores, 0.0, 1.0)

def compute_popularity_compatibility(user_avg_pop: float, candidate_pop: float) -> float:
    """
    Computes a compatibility score (0.0 to 1.0) between user's typical popularity preference
    and the candidate's popularity.
    """
    diff = abs(user_avg_pop - candidate_pop)
    score = np.exp(- (diff ** 2) / (2 * (35.0 ** 2)))
    return float(np.clip(score, 0.05, 1.0))
