import { Router } from 'express';
import { GAME_CATALOG } from '@tradr/shared';

export const gamesRouter = Router();

gamesRouter.get('/', (_req, res) => {
  res.json({ games: GAME_CATALOG });
});
