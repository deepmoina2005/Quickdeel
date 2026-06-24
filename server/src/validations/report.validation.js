import { z } from "zod";

export const reportSchema = z.object({
  body: z
    .object({
      listingId: z.coerce.number().int().positive().optional(),
      reportedUserId: z.coerce.number().int().positive().optional(),
      reason: z.string().min(2),
      description: z.string().optional(),
    })
    .refine((value) => value.listingId || value.reportedUserId, {
      message: "Either listingId or reportedUserId is required",
    }),
});
