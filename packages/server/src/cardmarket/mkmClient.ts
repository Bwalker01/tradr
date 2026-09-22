import { buildOAuthHeader } from './oauth.js';
import type {
  MkmArticlesResponse,
  MkmFindProductsResponse,
  MkmGamesResponse,
  MkmProductResponse,
} from './types.js';

export interface MkmClientOptions {
  appToken: string;
  appSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  apiBaseUrl: string;
}

export class MkmApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'MkmApiError';
  }
}

/**
 * Thin, low-level wrapper around Cardmarket API v2.0 endpoints. Every call is
 * OAuth1-signed here and nowhere else, so credential handling stays in one place.
 */
export class MkmClient {
  constructor(private readonly options: MkmClientOptions) {}

  async getGames(): Promise<MkmGamesResponse> {
    return this.request<MkmGamesResponse>('GET', '/games');
  }

  async findProducts(search: string, idGame: number): Promise<MkmFindProductsResponse> {
    const params = new URLSearchParams({ search, idGame: String(idGame) });
    return this.request<MkmFindProductsResponse>('GET', `/products/find?${params.toString()}`);
  }

  async getProduct(idProduct: number): Promise<MkmProductResponse> {
    return this.request<MkmProductResponse>('GET', `/products/${idProduct}`);
  }

  async getArticles(
    idProduct: number,
    params: { idLanguage?: number; minCondition?: string; isFoil?: boolean; start?: number; maxResults?: number },
  ): Promise<MkmArticlesResponse> {
    const query = new URLSearchParams();
    if (params.idLanguage) query.set('idLanguage', String(params.idLanguage));
    if (params.minCondition) query.set('minCondition', params.minCondition);
    if (params.isFoil !== undefined) query.set('isFoil', String(params.isFoil));
    query.set('start', String(params.start ?? 0));
    query.set('maxResults', String(params.maxResults ?? 100));

    return this.request<MkmArticlesResponse>('GET', `/articles/${idProduct}?${query.toString()}`);
  }

  private async request<T>(method: 'GET' | 'POST', path: string): Promise<T> {
    const url = `${this.options.apiBaseUrl}${path}${path.includes('?') ? '&' : '?'}format=json`;
    const authorization = buildOAuthHeader(method, url, {
      consumerKey: this.options.appToken,
      consumerSecret: this.options.appSecret,
      token: this.options.accessToken,
      tokenSecret: this.options.accessTokenSecret,
    });

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new MkmApiError(`Cardmarket API request failed: ${method} ${path} (${response.status})`, response.status);
    }

    return (await response.json()) as T;
  }
}
