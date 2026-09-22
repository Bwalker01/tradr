import { Router } from 'express';
import { getPricingProvider } from '../providers/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const gamesRouter = Router();

gamesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const provider = getPricingProvider();
    const games = await provider.getGames();
    res.json({ games });
  }),
);
