import type { CardEntryInput, CardPriceResult, GlobalFilters, ListPriceResult } from '@tradr/shared';
import { summarizeListPrices } from '@tradr/shared';
import { runWithConcurrencyLimit } from '../cache/concurrencyLimiter.js';
import type { PricingProvider } from '../providers/PricingProvider.js';

/** Caps how many cards in a list are priced concurrently, to stay polite to rate-limited upstream APIs. */
const MAX_CONCURRENT_QUOTES = 6;

/**
 * Resolves each card's effective filters (per-card overrides layered on the
 * list defaults) and prices it via the given provider. This is the only
 * place override-resolution happens, keeping it a single source of truth.
 */
export async function computeListPrice(
  provider: PricingProvider,
  defaults: GlobalFilters,
  entries: CardEntryInput[],
): Promise<ListPriceResult> {
  const items = await runWithConcurrencyLimit(
    entries.map((entry) => () => priceEntry(provider, defaults, entry)),
    MAX_CONCURRENT_QUOTES,
  );
  return summarizeListPrices(items);
}

async function priceEntry(
  provider: PricingProvider,
  defaults: GlobalFilters,
  entry: CardEntryInput,
): Promise<CardPriceResult> {
  const resolvedFilters = {
    minCondition: entry.overrides.minCondition ?? defaults.minCondition,
    languageId: entry.overrides.languageId ?? defaults.languageId,
    foil: entry.overrides.foil ?? defaults.foil,
  };

  const quote = await provider.quoteCardPrice({
    productId: entry.productId,
    gameId: defaults.gameId,
    minCondition: resolvedFilters.minCondition,
    languageId: resolvedFilters.languageId,
    sellerCountry: defaults.sellerCountry,
    foil: resolvedFilters.foil,
    signed: defaults.signed,
    altered: defaults.altered,
    playset: defaults.playset,
    pricingMethod: defaults.pricingMethod,
  });

  const warning = quote.unitPrice === null ? 'No price available for this card with the chosen foiling.' : null;

  return {
    id: entry.id,
    productId: entry.productId,
    unitPrice: quote.unitPrice,
    lineTotal: quote.unitPrice === null ? null : Math.round(quote.unitPrice * entry.quantity * 100) / 100,
    currency: 'EUR',
    matchedListingCount: quote.matchedListingCount,
    priceSource: defaults.pricingMethod,
    resolvedFilters,
    warning,
  };
}
