import { Router } from 'express';
import { getPricingProvider } from '../providers/index.js';
import { computeListPrice } from '../services/priceCalculator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { priceListRequestSchema } from '../validation/schemas.js';

export const priceRouter = Router();

priceRouter.post(
  '/list',
  asyncHandler(async (req, res) => {
    const { defaults, entries } = priceListRequestSchema.parse(req.body);
    const provider = getPricingProvider();
    const result = await computeListPrice(provider, defaults, entries);
    res.json(result);
  }),
);
