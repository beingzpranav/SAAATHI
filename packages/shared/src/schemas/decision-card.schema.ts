import { z } from 'zod';

export const createDecisionCardSchema = z.object({
  chosenTradeId: z.string({ required_error: 'Chosen trade is required' }),
  chosenProviderId: z.string({ required_error: 'Chosen provider is required' }),
  agreedActions: z
    .array(z.string())
    .min(1, 'At least one agreed action step is required'),
  openConcerns: z.array(z.string()).default([]),
  counsellorNotes: z.string().max(1000).optional(),
  counsellorContact: z.string().max(100).optional(),
});

export type CreateDecisionCardSchema = z.infer<typeof createDecisionCardSchema>;

export const checkpointEvaluationSchema = z.object({
  evaluations: z
    .array(
      z.object({
        concernId: z.string().uuid('Invalid concern ID'),
        postScore: z.number().int().min(1).max(5),
        isResolved: z.boolean(),
        resolutionNotes: z.string().max(500).optional(),
      }),
    )
    .min(1, 'At least one concern evaluation is required'),
});

export type CheckpointEvaluationSchema = z.infer<typeof checkpointEvaluationSchema>;
