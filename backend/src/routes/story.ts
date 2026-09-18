import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateUserStories } from '../analytics/storyEngine';

const router = Router();

router.use(requireAuth);

// ─── GET /api/story — Retrieve Generated Story Chapters ──────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId!;
    const stories = await generateUserStories(userId);
    res.json(stories);
  } catch (err) {
    next(err);
  }
});

export default router;
