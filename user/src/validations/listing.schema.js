import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description should be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  condition: z.string().min(1, "Condition is required"),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  location: z.string().optional(),
  images: z
    .any()
    .refine((files) => files?.length >= 1, "Upload at least 1 image")
    .refine((files) => !files || files.length <= 8, "You can upload up to 8 images"),
});
