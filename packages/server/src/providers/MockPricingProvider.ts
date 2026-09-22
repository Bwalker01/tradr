import type { ProductSummary } from '@tradr/shared';
import { CONDITION_RANK, FALLBACK_GAMES } from '@tradr/shared';
import type { CardPriceQuery, CardPriceQuote, GameOption, PricingProvider } from './PricingProvider.js';

const DEMO_CARD_NAMES = [
  'Lightning Bolt',
  'Black Lotus',
  'Tarmogoyf',
  'Snapcaster Mage',
  'Brainstorm',
  'Counterspell',
  'Birds of Paradise',
  'Liliana of the Veil',
  'Wrenn and Six',
  'Ragavan, Nimble Pilferer',
  'Fatal Push',
  'Teferi, Time Raveler',
];

/**
 * Deterministic, offline pricing source used when Cardmarket credentials are
 * not configured. Keeps the app fully demoable without live API access —
 * prices are pseudo-random but stable per product/filter combination.
 */
export class MockPricingProvider implements PricingProvider {
  readonly mode = 'demo' as const;

  async getGames(): Promise<GameOption[]> {
    return FALLBACK_GAMES.map((g) => ({ id: g.id, name: g.name, abbreviation: g.abbreviation }));
  }

  async searchProducts(query: string, gameId: number): Promise<ProductSummary[]> {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    return DEMO_CARD_NAMES.filter((name) => name.toLowerCase().includes(trimmed)).map((name) => ({
      productId: hashToProductId(name, gameId),
      name,
      setName: 'Demo Edition',
      imageUrl: null,
      gameId,
    }));
  }

  async quoteCardPrice(query: CardPriceQuery): Promise<CardPriceQuote> {
    const seed = `${query.productId}:${query.minCondition}:${query.languageId}:${query.foil}:${query.signed}:${query.altered}:${query.playset}:${query.pricingMethod}`;
    const base = pseudoRandom(seed) * 40 + 0.5;
    const conditionMultiplier = 1 + (6 - CONDITION_RANK[query.minCondition]) * 0.08;
    const foilMultiplier = query.foil ? 2.4 : 1;
    const price = Math.round(base * conditionMultiplier * foilMultiplier * 100) / 100;

    return {
      unitPrice: price,
      matchedListingCount: Math.max(1, Math.floor(pseudoRandom(`${seed}:count`) * 12)),
    };
  }
}

function hashToProductId(name: string, gameId: number): number {
  let hash = gameId * 7919;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1_000_000;
  }
  return hash;
}

/** Deterministic pseudo-random float in [0, 1) derived from a string seed. */
function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 10_000) / 10_000;
}
