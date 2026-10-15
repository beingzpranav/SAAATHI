import { Router } from 'express';
import { aiQuerySchema } from '@saathi/shared';
import { aiController } from './ai.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { optionalAuthenticate } from '../../middleware/authenticate.js';

export const aiRouter = Router();

/**
 * POST /api/v1/ai/query
 * Grounded AI vocational query endpoint with guardrail verification and verified citations.
 */
aiRouter.post('/query', optionalAuthenticate, validateBody(aiQuerySchema), aiController.query);
