import { Router } from 'express';
import { householdController } from './household.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { householdIntakeSchema } from '@saathi/shared';

export const householdRouter = Router();

householdRouter.use(authenticate);

householdRouter.post('/', validateBody(householdIntakeSchema), householdController.saveIntake);
householdRouter.get('/', householdController.getIntake);
