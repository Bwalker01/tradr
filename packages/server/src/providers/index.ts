import { GAME_CATALOG } from '@tradr/shared';
import { config } from '../config.js';
import { MkmClient } from '../cardmarket/mkmClient.js';
import { CardmarketPricingProvider } from './CardmarketPricingProvider.js';
import { GameRouterProvider } from './GameRouterProvider.js';
import { MockPricingProvider } from './MockPricingProvider.js';
import { ScryfallPricingProvider } from './ScryfallPricingProvider.js';
import type { PricingProvider } from './PricingProvider.js';

export type { PricingProvider, CardPriceQuery, CardPriceQuote } from './PricingProvider.js';

const MTG_GAME_ID = GAME_CATALOG.find((g) => g.abbreviation === 'MTG')!.id;

let cachedProvider: PricingProvider | null = null;

/**
 * Single place that decides which pricing source backs each game. If direct
 * Cardmarket API credentials are configured, they take priority for every
 * game (the most accurate source, when available). Otherwise, games with a
 * dedicated live source (see GAME_CATALOG) get it — currently just Magic via
 * Scryfall — and everything else falls back to the demo mock provider.
 */
export function getPricingProvider(): PricingProvider {
  if (cachedProvider) return cachedProvider;

  if (config.cardmarket.isConfigured) {
    const client = new MkmClient({
      appToken: config.cardmarket.appToken,
      appSecret: config.cardmarket.appSecret,
      accessToken: config.cardmarket.accessToken,
      accessTokenSecret: config.cardmarket.accessTokenSecret,
      apiBaseUrl: config.cardmarket.apiBaseUrl,
    });
    cachedProvider = new CardmarketPricingProvider({ client, cacheTtlSeconds: config.cacheTtlSeconds });
  } else {
    const scryfall = new ScryfallPricingProvider({ cacheTtlSeconds: config.cacheTtlSeconds });
    const mock = new MockPricingProvider();
    cachedProvider = new GameRouterProvider(new Map([[MTG_GAME_ID, scryfall]]), mock);
  }

  return cachedProvider;
}
