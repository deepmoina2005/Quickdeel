import { z } from "zod";

export const reviewSchema = z.object({
  body: z.object({
    sellerId: z.coerce.number().int().positive(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});
