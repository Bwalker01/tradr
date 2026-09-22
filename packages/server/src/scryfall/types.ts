/** Shapes returned by the public Scryfall API (https://scryfall.com/docs/api), trimmed to the fields we use. */

export interface ScryfallImageUris {
  small?: string;
  normal?: string;
}

export interface ScryfallCardFace {
  image_uris?: ScryfallImageUris;
}

export interface ScryfallCard {
  id: string;
  name: string;
  set_name: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  prices: {
    eur: string | null;
    eur_foil: string | null;
  };
}

export interface ScryfallSearchResponse {
  object: 'list';
  data: ScryfallCard[];
}

export interface ScryfallErrorResponse {
  object: 'error';
  status: number;
  details: string;
}
