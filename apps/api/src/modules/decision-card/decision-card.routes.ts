import { Router } from 'express';
import { decisionCardController } from './decision-card.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { createDecisionCardSchema } from '@saathi/shared';

export const decisionCardRouter = Router();

decisionCardRouter.use(authenticate);

// Generate/Update Decision Card
decisionCardRouter.post('/', validateBody(createDecisionCardSchema), decisionCardController.createCard);

// Get family's own Decision Card
decisionCardRouter.get('/my', decisionCardController.getMyCard);

// Get by household ID
decisionCardRouter.get('/:householdId', decisionCardController.getCard);

// Get SMS summary
decisionCardRouter.get('/:householdId/sms', decisionCardController.getSmsSummary);
