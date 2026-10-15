import { z } from 'zod';

export const adminCsvExportQuerySchema = z.object({
  type: z
    .enum(['concerns', 'households', 'decisions', 'escalations'])
    .default('concerns'),
  district: z.string().optional(),
  state: z.string().optional(),
  fromDate: z.string().datetime({ offset: true }).optional(),
  toDate: z.string().datetime({ offset: true }).optional(),
});

export type AdminCsvExportQuery = z.infer<typeof adminCsvExportQuerySchema>;
