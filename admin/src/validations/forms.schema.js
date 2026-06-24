import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  image: z.any().optional(),
});

export const notificationSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  audience: z.string().min(1, 'Audience is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const settingsSchema = z.object({
  siteName: z.string().min(2, 'Site name is required'),
  contactEmail: z.string().email('Enter a valid email'),
  supportNumber: z.string().min(8, 'Support number is required'),
  terms: z.string().min(20, 'Terms & Conditions are required'),
  privacyPolicy: z.string().min(20, 'Privacy Policy is required'),
  siteLogo: z.any().optional(),
});
