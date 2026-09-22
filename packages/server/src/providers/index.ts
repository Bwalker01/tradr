import { config } from '../config.js';
import { MkmClient } from '../cardmarket/mkmClient.js';
import { CardmarketPricingProvider } from './CardmarketPricingProvider.js';
import { MockPricingProvider } from './MockPricingProvider.js';
import type { PricingProvider } from './PricingProvider.js';

export type { PricingProvider, GameOption, CardPriceQuery, CardPriceQuote } from './PricingProvider.js';

let cachedProvider: PricingProvider | null = null;

/** Single place that decides live vs. demo pricing, based on configured credentials. */
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
    cachedProvider = new MockPricingProvider();
  }

  return cachedProvider;
}
