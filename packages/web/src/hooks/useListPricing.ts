import { useEffect, useState } from 'react';
import type { CardEntryInput, ListPriceResult } from '@tradr/shared';
import { priceList } from '../api/client';
import { useAppState, type ListKey } from '../state/AppStateContext';
import { useDebouncedValue } from './useDebouncedValue';

interface UseListPricingResult {
  result: ListPriceResult | null;
  isLoading: boolean;
  error: string | null;
}

/** Fetches priced totals for a list whenever its cards or the default filters change. */
export function useListPricing(list: ListKey): UseListPricingResult {
  const { state } = useAppState();
  const entries = state.lists[list];
  const debouncedEntries = useDebouncedValue(entries, 300);
  const debouncedDefaults = useDebouncedValue(state.defaults, 300);

  const [result, setResult] = useState<ListPriceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedEntries.length === 0) {
      setResult({ currency: 'EUR', items: [], total: 0, unresolvedCount: 0 });
      setError(null);
      return;
    }

    const input: CardEntryInput[] = debouncedEntries.map((entry) => ({
      id: entry.id,
      productId: entry.product.productId,
      quantity: entry.quantity,
      overrides: entry.overrides,
    }));

    let cancelled = false;
    setIsLoading(true);
    priceList(debouncedDefaults, input)
      .then((priced) => {
        if (!cancelled) {
          setResult(priced);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedEntries, debouncedDefaults]);

  return { result, isLoading, error };
}
