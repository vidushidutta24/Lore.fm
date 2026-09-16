import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  calculateMusicDNA,
  calculateOverviewStats,
} from '../analytics/engine';
import { calculateFullTasteProfile } from '../analytics/tasteEngine';
import { buildMultiPeriodTasteContext } from '../analytics/multiPeriodEngine';
import { calculateTimelineJourney } from '../analytics/timelineEngine';
import { generateTasteAIInterpretation } from '../services/aiService';
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

// ─── GET /api/analytics/taste — Basic Music DNA ───────────────────────────────

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

// ─── GET /api/analytics/taste-profile — Comprehensive Taste Profile ──────────

router.get('/taste-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const timeRange = (req.query.time_range as TimeRange) ?? 'medium_term';

    const profile = await calculateFullTasteProfile(userId, timeRange);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/taste-ai — Multi-Period Context & AI Interpretation ───

router.get('/taste-ai', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const context = await buildMultiPeriodTasteContext(userId);
    const interpretation = await generateTasteAIInterpretation(context);

    res.json({
      context,
      interpretation,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/analytics/timeline — Top 5 Artist Journeys & Year-Long Timeline ───

router.get('/timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const timelineData = await calculateTimelineJourney(userId);
    res.json(timelineData);
  } catch (err) {
    next(err);
  }
});

export default router;


