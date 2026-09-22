import type { GameCatalogEntry, GlobalFilters, ListPriceResult, ProductSummary, CardEntryInput } from '@tradr/shared';

/** All backend calls go through this module — no fetch() calls elsewhere. */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export function fetchGames(): Promise<{ games: GameCatalogEntry[] }> {
  return request('/games');
}

export function searchCards(query: string, gameId: number): Promise<{ results: ProductSummary[] }> {
  const params = new URLSearchParams({ q: query, gameId: String(gameId) });
  return request(`/search?${params.toString()}`);
}

export function priceList(defaults: GlobalFilters, entries: CardEntryInput[]): Promise<ListPriceResult> {
  return request('/price/list', {
    method: 'POST',
    body: JSON.stringify({ defaults, entries }),
  });
}
