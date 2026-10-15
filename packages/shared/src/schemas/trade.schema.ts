import { z } from 'zod';

export const outcomeQuerySchema = z.object({
  state: z.string().trim().min(2, 'State is required'),
  district: z.string().trim().min(2, 'District is required'),
  block: z.string().trim().optional(),
});

export type OutcomeQueryParams = z.infer<typeof outcomeQuerySchema>;

export const tradeFilterSchema = z.object({
  minEducation: z.string().trim().optional(),
  sector: z.string().trim().optional(),
  incomeBand: z.string().trim().optional(),
});

export type TradeFilterParams = z.infer<typeof tradeFilterSchema>;
