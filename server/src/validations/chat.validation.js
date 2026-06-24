import { z } from "zod";

export const conversationSchema = z.object({
  body: z.object({
    sellerId: z.coerce.number().int().positive(),
    listingId: z.coerce.number().int().positive().optional(),
  })
});

export const messageSchema = z.object({
  body: z.object({
    message: z.string().max(2000).optional(),
    type: z.enum(["TEXT", "LOCATION"]).optional(),
    locationLat: z.coerce.number().optional(),
    locationLng: z.coerce.number().optional(),
    locationLabel: z.string().max(200).optional(),
  }).superRefine((value, ctx) => {
    if ((value.type || "TEXT") === "TEXT" && !value.message?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["message"], message: "Message is required" });
    }
    if (
      value.type === "LOCATION" &&
      !value.locationLabel?.trim() &&
      (value.locationLat === undefined || value.locationLng === undefined)
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationLat"], message: "Location is required" });
    }
  })
});

export const offerSchema = z.object({
  body: z.object({ amount: z.coerce.number().positive() })
});
