import { Router } from 'express';
import { translateController } from './translate.controller.js';
import { translateRequestSchema } from './translate.schema.js';
import { validateBody } from '../../middleware/validate.js';

export const translateRouter = Router();

/**
 * POST /api/v1/translate
 * Translates an array of texts in real time between supported languages.
 * Public endpoint so both unauthenticated and authenticated UI can be localized.
 */
translateRouter.post(
  '/',
  validateBody(translateRequestSchema),
  translateController.translate
);

/**
 * GET /api/v1/translate/languages
 * Returns the dictionary of 8 supported Indian languages + English.
 */
translateRouter.get('/languages', translateController.getLanguages);

/**
 * GET /api/v1/translate/health
 * Health status and in-memory cache statistics.
 */
translateRouter.get('/health', translateController.getHealth);
