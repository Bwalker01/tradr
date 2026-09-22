import type { CardPriceResult, ListPriceResult } from './types.js';

/**
 * Aggregates per-card price results into a list total. This is the single
 * place list totals are computed, so buy/trade/diff logic never drifts.
 */
export function summarizeListPrices(items: CardPriceResult[]): ListPriceResult {
  let total = 0;
  let unresolvedCount = 0;

  for (const item of items) {
    if (item.lineTotal === null) {
      unresolvedCount += 1;
    } else {
      total += item.lineTotal;
    }
  }

  return {
    currency: 'EUR',
    items,
    total: roundCurrency(total),
    unresolvedCount,
  };
}

export interface TradeDifference {
  totalA: number;
  totalB: number;
  /** Positive means list A is worth more than list B. */
  difference: number;
}

export function computeTradeDifference(listA: ListPriceResult, listB: ListPriceResult): TradeDifference {
  return {
    totalA: listA.total,
    totalB: listB.total,
    difference: roundCurrency(listA.total - listB.total),
  };
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
