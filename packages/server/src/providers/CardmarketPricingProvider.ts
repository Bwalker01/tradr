import type { ConditionCode, ProductSummary } from '@tradr/shared';
import { CONDITIONS, meetsMinCondition } from '@tradr/shared';
import { MkmClient } from '../cardmarket/mkmClient.js';
import type { MkmArticle } from '../cardmarket/types.js';
import { TtlCache } from '../cache/ttlCache.js';
import type { CardPriceQuery, CardPriceQuote, GameOption, PricingProvider } from './PricingProvider.js';

const CONDITION_CODES = new Set(CONDITIONS.map((c) => c.code));

function isConditionCode(value: string): value is ConditionCode {
  return CONDITION_CODES.has(value as ConditionCode);
}

export interface CardmarketPricingProviderOptions {
  client: MkmClient;
  cacheTtlSeconds: number;
}

/** Live pricing backed by the real Cardmarket API. */
export class CardmarketPricingProvider implements PricingProvider {
  readonly mode = 'live' as const;

  private readonly gamesCache: TtlCache<GameOption[]>;
  private readonly searchCache: TtlCache<ProductSummary[]>;
  private readonly articlesCache: TtlCache<MkmArticle[]>;
  private readonly trendCache: TtlCache<Record<string, number>>;

  constructor(private readonly options: CardmarketPricingProviderOptions) {
    this.gamesCache = new TtlCache(options.cacheTtlSeconds);
    this.searchCache = new TtlCache(options.cacheTtlSeconds);
    this.articlesCache = new TtlCache(options.cacheTtlSeconds);
    this.trendCache = new TtlCache(options.cacheTtlSeconds);
  }

  async getGames(): Promise<GameOption[]> {
    return this.gamesCache.getOrLoad('games', async () => {
      const response = await this.options.client.getGames();
      return response.game.map((g) => ({ id: g.idGame, name: g.name, abbreviation: g.abbreviation }));
    });
  }

  async searchProducts(query: string, gameId: number): Promise<ProductSummary[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    return this.searchCache.getOrLoad(`${gameId}:${trimmed.toLowerCase()}`, async () => {
      const response = await this.options.client.findProducts(trimmed, gameId);
      return response.product.map((p) => ({
        productId: p.idProduct,
        name: p.name,
        setName: p.expansionName ?? null,
        imageUrl: p.image ?? null,
        gameId: p.idGame,
      }));
    });
  }

  async quoteCardPrice(query: CardPriceQuery): Promise<CardPriceQuote> {
    if (query.pricingMethod === 'lowest') {
      return this.quoteFromListings(query);
    }
    return this.quoteFromTrend(query);
  }

  private async quoteFromListings(query: CardPriceQuery): Promise<CardPriceQuote> {
    const cacheKey = [
      query.productId,
      query.minCondition,
      query.languageId,
      query.foil,
    ].join(':');

    const articles = await this.articlesCache.getOrLoad(cacheKey, async () => {
      const response = await this.options.client.getArticles(query.productId, {
        idLanguage: query.languageId,
        minCondition: query.minCondition,
        isFoil: query.foil,
        maxResults: 100,
      });
      return response.article;
    });

    const matches = articles.filter((article) => {
      const condition = article.condition;
      if (!isConditionCode(condition) || !meetsMinCondition(condition, query.minCondition)) return false;
      if (article.language.idLanguage !== query.languageId) return false;
      if (article.isFoil !== query.foil) return false;
      if (query.signed !== article.isSigned) return false;
      if (query.altered !== article.isAltered) return false;
      if (query.playset !== article.isPlayset) return false;
      if (query.sellerCountry && article.seller.address?.country !== query.sellerCountry) return false;
      return true;
    });

    if (matches.length === 0) {
      return { unitPrice: null, matchedListingCount: 0 };
    }

    const lowest = Math.min(...matches.map((article) => article.price));
    return { unitPrice: lowest, matchedListingCount: matches.length };
  }

  private async quoteFromTrend(query: CardPriceQuery): Promise<CardPriceQuote> {
    const trendValues = await this.trendCache.getOrLoad(`trend:${query.productId}`, async () => {
      const response = await this.options.client.getProduct(query.productId);
      const guide = response.product.priceGuide ?? {};
      return {
        trend: guide.TREND ?? 0,
        avg1: guide.AVG1 ?? 0,
        avg7: guide.AVG7 ?? 0,
        avg30: guide.AVG30 ?? 0,
      };
    });

    const key = query.pricingMethod === 'trend' ? 'trend' : query.pricingMethod;
    const price = trendValues[key];
    if (!price) {
      return { unitPrice: null, matchedListingCount: 0 };
    }
    return { unitPrice: price, matchedListingCount: 1 };
  }
}
