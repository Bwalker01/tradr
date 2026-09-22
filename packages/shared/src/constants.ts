/**
 * Reference data mirrored from Cardmarket's API v2.0 documentation.
 * This is the single source of truth for these values across server and web —
 * never redefine condition codes, language ids, or country codes elsewhere.
 */

export interface ConditionOption {
  code: ConditionCode;
  label: string;
}

export type ConditionCode = 'MT' | 'NM' | 'EX' | 'GD' | 'LP' | 'PL' | 'PO';

/** Ordered from best to worst, matching Cardmarket's own condition ranking. */
export const CONDITIONS: readonly ConditionOption[] = [
  { code: 'MT', label: 'Mint' },
  { code: 'NM', label: 'Near Mint' },
  { code: 'EX', label: 'Excellent' },
  { code: 'GD', label: 'Good' },
  { code: 'LP', label: 'Light Played' },
  { code: 'PL', label: 'Played' },
  { code: 'PO', label: 'Poor' },
];

export const CONDITION_RANK: Readonly<Record<ConditionCode, number>> = CONDITIONS.reduce(
  (acc, condition, index) => {
    acc[condition.code] = index;
    return acc;
  },
  {} as Record<ConditionCode, number>,
);

/** True when `code` is at least as good as `minimum` (lower rank = better). */
export function meetsMinCondition(code: ConditionCode, minimum: ConditionCode): boolean {
  return CONDITION_RANK[code] <= CONDITION_RANK[minimum];
}

export interface LanguageOption {
  id: number;
  label: string;
}

/** Cardmarket idLanguage reference values. */
export const LANGUAGES: readonly LanguageOption[] = [
  { id: 1, label: 'English' },
  { id: 2, label: 'French' },
  { id: 3, label: 'German' },
  { id: 4, label: 'Spanish' },
  { id: 5, label: 'Italian' },
  { id: 6, label: 'Simplified Chinese' },
  { id: 7, label: 'Japanese' },
  { id: 8, label: 'Portuguese' },
  { id: 9, label: 'Russian' },
  { id: 10, label: 'Korean' },
  { id: 11, label: 'Traditional Chinese' },
];

export interface CountryOption {
  code: string;
  label: string;
}

/** Countries with active Cardmarket marketplaces, used for seller-location filtering. */
export const SELLER_COUNTRIES: readonly CountryOption[] = [
  { code: 'AT', label: 'Austria' },
  { code: 'BE', label: 'Belgium' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'CZ', label: 'Czech Republic' },
  { code: 'DE', label: 'Germany' },
  { code: 'DK', label: 'Denmark' },
  { code: 'ES', label: 'Spain' },
  { code: 'FI', label: 'Finland' },
  { code: 'FR', label: 'France' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'HU', label: 'Hungary' },
  { code: 'IE', label: 'Ireland' },
  { code: 'IT', label: 'Italy' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'NO', label: 'Norway' },
  { code: 'PL', label: 'Poland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'SE', label: 'Sweden' },
  { code: 'SK', label: 'Slovakia' },
  { code: 'US', label: 'United States' },
];

export interface PricingMethodOption {
  id: PricingMethod;
  label: string;
  description: string;
}

export type PricingMethod = 'lowest' | 'trend' | 'avg1' | 'avg7' | 'avg30';

/** How a card's unit price is derived from Cardmarket data for a given filter set. */
export const PRICING_METHODS: readonly PricingMethodOption[] = [
  {
    id: 'lowest',
    label: 'Lowest matching listing',
    description: 'Cheapest active listing that satisfies all filters — best for buying.',
  },
  {
    id: 'trend',
    label: 'Trend price',
    description: "Cardmarket's trend price, smoothed over recent sales.",
  },
  {
    id: 'avg1',
    label: '1-day average',
    description: 'Average sold price over the last day.',
  },
  {
    id: 'avg7',
    label: '7-day average',
    description: 'Average sold price over the last 7 days.',
  },
  {
    id: 'avg30',
    label: '30-day average',
    description: 'Average sold price over the last 30 days.',
  },
];

export const DEFAULT_PRICING_METHOD: PricingMethod = 'lowest';
export const DEFAULT_MIN_CONDITION: ConditionCode = 'EX';
export const DEFAULT_LANGUAGE_ID = 1;

/** Fallback game catalogue used only when the Cardmarket API is unreachable/unconfigured. */
export const FALLBACK_GAMES: readonly { id: number; name: string; abbreviation: string }[] = [
  { id: 1, name: 'Magic the Gathering', abbreviation: 'MTG' },
  { id: 2, name: 'Yu-Gi-Oh!', abbreviation: 'YGO' },
  { id: 3, name: 'Pokémon', abbreviation: 'POKE' },
  { id: 4, name: 'Flesh and Blood', abbreviation: 'FAB' },
];
