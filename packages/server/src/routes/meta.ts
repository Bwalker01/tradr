import { Router } from 'express';
import type { AppMeta } from '@tradr/shared';
import { getPricingProvider } from '../providers/index.js';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  const provider = getPricingProvider();
  const meta: AppMeta = {
    mode: provider.mode,
    message:
      provider.mode === 'demo'
        ? 'Demo mode: Cardmarket API credentials are not configured, showing simulated prices.'
        : 'Connected to the live Cardmarket API.',
  };
  res.json(meta);
});
