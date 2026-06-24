import { z } from "zod";
import { paginationQuery } from "./common.validation.js";

const condition = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]);
const emptyToUndefined = (schema) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const listingBodySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  condition,
  country: z.string().min(2),
  state: z.string().min(2),
  city: z.string().min(2),
  location: z.string().min(2).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  category: z.string().min(2).optional(),
});

export const createListingSchema = z.object({
  body: listingBodySchema.refine((value) => value.categoryId || value.category, {
    message: "Category is required",
  }),
});

export const updateListingSchema = z.object({
  body: listingBodySchema.partial(),
});

export const listingSearchSchema = z.object({
  query: paginationQuery.extend({
    keyword: z.string().optional(),
    q: z.string().optional(),
    category: z.string().optional(),
    categoryId: emptyToUndefined(z.coerce.number().int().positive()),
    minPrice: emptyToUndefined(z.coerce.number().nonnegative()),
    maxPrice: emptyToUndefined(z.coerce.number().positive()),
    location: z.string().optional(),
    sort: z.enum(["latest", "price_asc", "price_desc"]).optional(),
  }),
});
