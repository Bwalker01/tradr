import { z } from 'zod';

const conditionCodeSchema = z.enum(['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO']);
const pricingMethodSchema = z.enum(['lowest', 'trend', 'avg1', 'avg7', 'avg30']);

export const cardFilterOverridesSchema = z.object({
  minCondition: conditionCodeSchema.optional(),
  languageId: z.number().int().positive().optional(),
  foil: z.boolean().optional(),
});

export const globalFiltersSchema = z.object({
  gameId: z.number().int().positive(),
  minCondition: conditionCodeSchema,
  languageId: z.number().int().positive(),
  sellerCountry: z.string().length(2).nullable(),
  foil: z.boolean(),
  signed: z.boolean(),
  altered: z.boolean(),
  playset: z.boolean(),
  pricingMethod: pricingMethodSchema,
});

export const cardEntryInputSchema = z.object({
  id: z.string().min(1),
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
  overrides: cardFilterOverridesSchema,
});

export const priceListRequestSchema = z.object({
  defaults: globalFiltersSchema,
  entries: z.array(cardEntryInputSchema).max(500),
});

export const searchQuerySchema = z.object({
  q: z.string().min(2),
  gameId: z.coerce.number().int().positive(),
});
