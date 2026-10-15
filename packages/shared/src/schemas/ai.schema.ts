import { z } from 'zod';

export const aiQuerySchema = z.object({
  query: z
    .string({ required_error: 'Query string is required' })
    .min(3, 'Query must be at least 3 characters long')
    .max(500, 'Query cannot exceed 500 characters')
    .trim(),
  language: z.enum(['en', 'hi']).default('en'),
  tradeCode: z.string().optional(),
});

export type AiQuerySchema = z.infer<typeof aiQuerySchema>;
