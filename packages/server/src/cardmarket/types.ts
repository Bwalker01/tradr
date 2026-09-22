/** Shapes returned by Cardmarket API v2.0 (`output.json` variants), trimmed to the fields we use. */

export interface MkmGame {
  idGame: number;
  name: string;
  abbreviation: string;
}

export interface MkmGamesResponse {
  game: MkmGame[];
}

export interface MkmProduct {
  idProduct: number;
  name: string;
  expansionName?: string | null;
  image?: string | null;
  idGame: number;
}

export interface MkmFindProductsResponse {
  product: MkmProduct[];
}

export interface MkmSeller {
  idUser: number;
  username: string;
  address?: {
    country?: string;
  };
}

export interface MkmArticle {
  idArticle: number;
  idProduct: number;
  language: { idLanguage: number; languageName: string };
  condition: string;
  isFoil: boolean;
  isSigned: boolean;
  isAltered: boolean;
  isPlayset: boolean;
  price: number;
  seller: MkmSeller;
}

export interface MkmArticlesResponse {
  article: MkmArticle[];
}

export interface MkmPriceGuide {
  AVG1?: number;
  AVG7?: number;
  AVG30?: number;
  TREND?: number;
  LOW?: number;
}

export interface MkmProductDetails extends MkmProduct {
  priceGuide?: MkmPriceGuide;
}

export interface MkmProductResponse {
  product: MkmProductDetails;
}
