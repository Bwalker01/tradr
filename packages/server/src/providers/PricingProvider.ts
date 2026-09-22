import type { ConditionCode, ProductSummary } from '@tradr/shared';

export interface CardPriceQuery {
  productId: string;
  gameId: number;
  minCondition: ConditionCode;
  languageId: number;
  sellerCountry: string | null;
  foil: boolean;
  signed: boolean;
  altered: boolean;
  playset: boolean;
  pricingMethod: 'lowest' | 'trend' | 'avg1' | 'avg7' | 'avg30';
}

export interface CardPriceQuote {
  unitPrice: number | null;
  matchedListingCount: number;
}

/**
 * Source of card pricing data for a single game (or family of games).
 * Implementations must not leak transport-specific details (HTTP, OAuth,
 * etc.) past this boundary, so the rest of the app can depend on a single
 * stable contract regardless of which backend actually serves a given game.
 */
export interface PricingProvider {
  searchProducts(query: string, gameId: number): Promise<ProductSummary[]>;
  quoteCardPrice(query: CardPriceQuery): Promise<CardPriceQuote>;
}
