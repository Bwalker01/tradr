import type { ConditionCode, ProductSummary } from '@tradr/shared';

export interface GameOption {
  id: number;
  name: string;
  abbreviation: string;
}

export interface ArticleQuote {
  price: number;
  condition: ConditionCode;
  languageId: number;
  isFoil: boolean;
  sellerCountry: string | null;
}

export interface CardPriceQuery {
  productId: number;
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
 * Source of card pricing data. Implementations must not leak
 * transport-specific details (HTTP, OAuth, etc.) past this boundary, so the
 * rest of the app can depend on a single stable contract.
 */
export interface PricingProvider {
  readonly mode: 'live' | 'demo';
  getGames(): Promise<GameOption[]>;
  searchProducts(query: string, gameId: number): Promise<ProductSummary[]>;
  quoteCardPrice(query: CardPriceQuery): Promise<CardPriceQuote>;
}
