import { z } from 'zod';

export const sendChatMessageSchema = z.object({
  householdId: z.string().uuid('Invalid household ID'),
  text: z
    .string({ required_error: 'Message text is required' })
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
  citations: z
    .array(
      z.object({
        id: z.string(),
        sourceType: z.enum(['TRADE', 'OUTCOME_RECORD', 'PROVIDER', 'NSQF_LADDER', 'GOVT_SCHEME']),
        title: z.string(),
        titleHi: z.string().optional(),
        verifiedStatistic: z.string().optional(),
        verifiedStatisticHi: z.string().optional(),
        confidence: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NONE']),
        geographicLevel: z.enum(['BLOCK', 'DISTRICT', 'STATE', 'NATIONAL']).optional(),
        verificationSource: z.string().optional(),
      }),
    )
    .optional(),
});

export type SendChatMessageSchema = z.infer<typeof sendChatMessageSchema>;
