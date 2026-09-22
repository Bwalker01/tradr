import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MkmApiError } from '../cardmarket/mkmClient.js';
import { ScryfallApiError } from '../scryfall/scryfallClient.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request', details: err.flatten() });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof MkmApiError) {
    res.status(502).json({ error: 'Cardmarket API request failed', details: err.message });
    return;
  }

  if (err instanceof ScryfallApiError) {
    res.status(502).json({ error: 'Scryfall API request failed', details: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
