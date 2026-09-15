import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  calculateMusicDNA,
  calculateOverviewStats,
} from '../analytics/engine';
import type { TimeRange } from '../types/spotify';

const router = Router();

router.use(requireAuth);

// ─── GET /api/analytics/overview ─────────────────────────────────────────────

router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const timeRange = (req.query.time_range as TimeRange) ?? 'medium_term';

    const stats = await calculateOverviewStats(userId, timeRange);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/taste — Full Music DNA ────────────────────────────────

router.get('/taste', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const timeRange = (req.query.time_range as TimeRange) ?? 'medium_term';

    const dna = await calculateMusicDNA(userId, timeRange);
    res.json({
      ...dna,
      calculationNote:
        'All values are derived from your actual Spotify top artists and listening data. No values are invented or approximated.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
