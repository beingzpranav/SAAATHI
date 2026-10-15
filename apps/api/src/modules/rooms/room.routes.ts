import { Router } from 'express';
import { roomController } from './room.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { setPinSchema, verifyPinSchema } from '@saathi/shared';

export const roomRouter = Router();

roomRouter.use(authenticate);

roomRouter.get('/status', roomController.getStatus);
roomRouter.post('/pin/set', validateBody(setPinSchema), roomController.setPin);
roomRouter.post('/pin/verify', validateBody(verifyPinSchema), roomController.verifyPin);
