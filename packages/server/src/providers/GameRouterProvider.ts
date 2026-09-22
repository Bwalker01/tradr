import type { ProductSummary } from '@tradr/shared';
import type { CardPriceQuery, CardPriceQuote, PricingProvider } from './PricingProvider.js';

/**
 * Dispatches to a different underlying provider per game, falling back to a
 * default provider for any game without a dedicated live source. This is
 * what lets the app mix a real data source for one game (e.g. Magic via
 * Scryfall) with the demo provider for everything else, behind a single
 * PricingProvider contract the rest of the app depends on.
 */
export class GameRouterProvider implements PricingProvider {
  constructor(
    private readonly byGame: ReadonlyMap<number, PricingProvider>,
    private readonly fallback: PricingProvider,
  ) {}

  searchProducts(query: string, gameId: number): Promise<ProductSummary[]> {
    return this.providerFor(gameId).searchProducts(query, gameId);
  }

  quoteCardPrice(query: CardPriceQuery): Promise<CardPriceQuote> {
    return this.providerFor(query.gameId).quoteCardPrice(query);
  }

  private providerFor(gameId: number): PricingProvider {
    return this.byGame.get(gameId) ?? this.fallback;
  }
}
