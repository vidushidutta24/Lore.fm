import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  generateDiscoverRecommendations,
  getTrackRecommendationsOnly,
  getArtistRecommendationsOnly,
  getUserTasteVectorOnly,
} from '../analytics/recommendationEngine';
import { isMLServiceAvailable } from '../services/mlClient';

const router = Router();

// All recommendation routes require authentication
router.use(requireAuth);

// ─── GET /api/recommendations/health ──────────────────────────────────────────
router.get('/health', async (_req: Request, res: Response) => {
  const active = await isMLServiceAvailable();
  res.json({
    mlServiceActive: active,
    endpoint: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  });
});

// ─── GET /api/recommendations/discover ────────────────────────────────────────
router.get('/discover', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const trackLimit = parseInt(req.query.track_limit as string, 10) || 20;
    const artistLimit = parseInt(req.query.artist_limit as string, 10) || 10;
    const categoryFilter = req.query.category as string | undefined;

    const data = await generateDiscoverRecommendations(userId, {
      trackLimit,
      artistLimit,
      categoryFilter,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/recommendations/tracks ──────────────────────────────────────────
router.get('/tracks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const category = req.query.category as string | undefined;

    const data = await getTrackRecommendationsOnly(userId, limit, category);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/recommendations/artists ─────────────────────────────────────────
router.get('/artists', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const category = req.query.category as string | undefined;

    const data = await getArtistRecommendationsOnly(userId, limit, category);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/recommendations/taste-vector ────────────────────────────────────
router.get('/taste-vector', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const tasteSummary = await getUserTasteVectorOnly(userId);
    res.json(tasteSummary);
  } catch (err) {
    next(err);
  }
});

export default router;
