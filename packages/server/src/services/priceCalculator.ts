import type { CardEntryInput, CardPriceResult, GlobalFilters, ListPriceResult } from '@tradr/shared';
import { summarizeListPrices } from '@tradr/shared';
import type { PricingProvider } from '../providers/PricingProvider.js';

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
  const items = await Promise.all(entries.map((entry) => priceEntry(provider, defaults, entry)));
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
    minCondition: resolvedFilters.minCondition,
    languageId: resolvedFilters.languageId,
    sellerCountry: defaults.sellerCountry,
    foil: resolvedFilters.foil,
    signed: defaults.signed,
    altered: defaults.altered,
    playset: defaults.playset,
    pricingMethod: defaults.pricingMethod,
  });

  const warning =
    quote.unitPrice === null
      ? 'No listings matched the selected filters.'
      : defaults.pricingMethod !== 'lowest'
        ? 'Price guide values are not condition/language specific.'
        : null;

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
