import type { ScryfallCard, ScryfallErrorResponse, ScryfallSearchResponse } from './types.js';

const SCRYFALL_API_BASE_URL = 'https://api.scryfall.com';

/**
 * Scryfall asks API consumers to identify themselves with a descriptive
 * User-Agent and to send Accept: application/json. See
 * https://scryfall.com/docs/api for the full etiquette guidance.
 */
const REQUEST_HEADERS = {
  'User-Agent': 'tradr/1.0 (+https://github.com/Bwalker01/tradr)',
  Accept: 'application/json',
};

export class ScryfallApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ScryfallApiError';
  }
}

/** Thin wrapper around the Scryfall REST API. No API key is required. */
export class ScryfallClient {
  async searchCards(query: string): Promise<ScryfallCard[]> {
    const params = new URLSearchParams({
      q: `name:${query}`,
      unique: 'cards',
      order: 'name',
    });

    const response = await fetch(`${SCRYFALL_API_BASE_URL}/cards/search?${params.toString()}`, {
      headers: REQUEST_HEADERS,
    });

    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ScryfallErrorResponse | null;
      throw new ScryfallApiError(body?.details ?? `Scryfall search failed (${response.status})`, response.status);
    }

    const body = (await response.json()) as ScryfallSearchResponse;
    return body.data;
  }

  async getCardById(id: string): Promise<ScryfallCard | null> {
    const response = await fetch(`${SCRYFALL_API_BASE_URL}/cards/${encodeURIComponent(id)}`, {
      headers: REQUEST_HEADERS,
    });

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ScryfallErrorResponse | null;
      throw new ScryfallApiError(body?.details ?? `Scryfall card lookup failed (${response.status})`, response.status);
    }

    return (await response.json()) as ScryfallCard;
  }
}
