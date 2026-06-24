import { z } from "zod";

const optionalText = z.preprocess((value) => value === null ? "" : value, z.string().optional());
const optionalEmail = z.preprocess(
  (value) => value === null ? "" : value,
  z.string().email().optional().or(z.literal("")),
);

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: optionalEmail,
    phone: optionalText,
    about: optionalText,
    contactEmail: optionalEmail,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});
