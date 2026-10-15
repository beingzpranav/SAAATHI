import { Router } from 'express';
import { concernController } from './concern.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import {
  saveConcernSchema,
  updateConcernScoreSchema,
  shareConcernSchema,
  checkpointEvaluationSchema,
} from '@saathi/shared';

export const concernRouter = Router();

concernRouter.use(authenticate);

concernRouter.get('/questions', concernController.getQuestions);
concernRouter.get('/my', concernController.getMyConcerns);
concernRouter.post('/', validateBody(saveConcernSchema), concernController.saveConcern);
concernRouter.patch('/:id/score', validateBody(updateConcernScoreSchema), concernController.updateScore);
concernRouter.post('/:id/share', validateBody(shareConcernSchema), concernController.toggleShare);
concernRouter.get('/household/:householdId/shared', concernController.getHouseholdShared);
concernRouter.post('/checkpoint', validateBody(checkpointEvaluationSchema), concernController.evaluateCheckpoint);

