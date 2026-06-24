import { z } from "zod";

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    image: z.string().url().optional()
  })
});
