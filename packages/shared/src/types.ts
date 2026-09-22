import type { ConditionCode, PricingMethod } from './constants.js';

export type ListMode = 'buy' | 'trade';

/** Filters that apply to an entire list unless a card overrides them. */
export interface GlobalFilters {
  gameId: number;
  minCondition: ConditionCode;
  languageId: number;
  sellerCountry: string | null;
  foil: boolean;
  signed: boolean;
  altered: boolean;
  playset: boolean;
  pricingMethod: PricingMethod;
}

/** The subset of filters a single card is allowed to override individually. */
export interface CardFilterOverrides {
  minCondition?: ConditionCode;
  languageId?: number;
  foil?: boolean;
}

/**
 * `productId` is an opaque, source-specific identifier (a numeric Cardmarket
 * product id, a Scryfall UUID, etc.) — always a string so the app isn't tied
 * to any one provider's id format.
 */
export interface ProductSummary {
  productId: string;
  name: string;
  setName: string | null;
  imageUrl: string | null;
  gameId: number;
}

export interface CardEntry {
  /** Client-generated identifier, stable for the lifetime of the list row. */
  id: string;
  product: ProductSummary;
  quantity: number;
  overrides: CardFilterOverrides;
}

export interface CardEntryInput {
  id: string;
  productId: string;
  quantity: number;
  overrides: CardFilterOverrides;
}

export interface PriceListRequest {
  defaults: GlobalFilters;
  entries: CardEntryInput[];
}

export interface CardPriceResult {
  id: string;
  productId: string;
  unitPrice: number | null;
  lineTotal: number | null;
  currency: 'EUR';
  matchedListingCount: number;
  priceSource: PricingMethod;
  resolvedFilters: {
    minCondition: ConditionCode;
    languageId: number;
    foil: boolean;
  };
  warning: string | null;
}

export interface ListPriceResult {
  currency: 'EUR';
  items: CardPriceResult[];
  total: number;
  unresolvedCount: number;
}
