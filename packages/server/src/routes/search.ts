import { Router } from 'express';
import { getPricingProvider } from '../providers/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { searchQuerySchema } from '../validation/schemas.js';

export const searchRouter = Router();

searchRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, gameId } = searchQuerySchema.parse(req.query);
    const provider = getPricingProvider();
    const results = await provider.searchProducts(q, gameId);
    res.json({ results });
  }),
);
