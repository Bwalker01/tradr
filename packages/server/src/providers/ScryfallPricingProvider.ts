import type { ProductSummary } from '@tradr/shared';
import { TtlCache } from '../cache/ttlCache.js';
import { ScryfallClient } from '../scryfall/scryfallClient.js';
import type { ScryfallCard } from '../scryfall/types.js';
import type { CardPriceQuery, CardPriceQuote, PricingProvider } from './PricingProvider.js';

const MAX_SEARCH_RESULTS = 20;

export interface ScryfallPricingProviderOptions {
  cacheTtlSeconds: number;
}

/**
 * Live Magic: the Gathering pricing sourced from Scryfall's public API.
 * Scryfall republishes Cardmarket's own EUR price guide (a single aggregate
 * market value per printing/foiling), not individual seller listings — so
 * this provider can't honour condition, language, or seller-location
 * filters the way a real marketplace listing search could. Callers should
 * treat those filters as informational only for cards priced this way.
 */
export class ScryfallPricingProvider implements PricingProvider {
  private readonly client = new ScryfallClient();
  private readonly searchCache: TtlCache<ProductSummary[]>;
  private readonly cardCache: TtlCache<ScryfallCard | null>;

  constructor(options: ScryfallPricingProviderOptions) {
    this.searchCache = new TtlCache(options.cacheTtlSeconds);
    this.cardCache = new TtlCache(options.cacheTtlSeconds);
  }

  async searchProducts(query: string, gameId: number): Promise<ProductSummary[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    return this.searchCache.getOrLoad(trimmed.toLowerCase(), async () => {
      const cards = await this.client.searchCards(trimmed);
      return cards.slice(0, MAX_SEARCH_RESULTS).map((card) => toProductSummary(card, gameId));
    });
  }

  async quoteCardPrice(query: CardPriceQuery): Promise<CardPriceQuote> {
    const card = await this.cardCache.getOrLoad(query.productId, () => this.client.getCardById(query.productId));
    if (!card) {
      return { unitPrice: null, matchedListingCount: 0 };
    }

    const raw = query.foil ? card.prices.eur_foil : card.prices.eur;
    const unitPrice = raw === null ? null : Number(raw);

    return {
      unitPrice: unitPrice !== null && Number.isFinite(unitPrice) ? unitPrice : null,
      matchedListingCount: unitPrice !== null ? 1 : 0,
    };
  }
}

function toProductSummary(card: ScryfallCard, gameId: number): ProductSummary {
  const imageUrl = card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small ?? null;
  return {
    productId: card.id,
    name: card.name,
    setName: card.set_name,
    imageUrl,
    gameId,
  };
}
