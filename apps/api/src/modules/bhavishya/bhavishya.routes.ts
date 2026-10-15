import { Router } from 'express';
import { bhavishyaController } from './bhavishya.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const bhavishyaRouter = Router();

bhavishyaRouter.use(authenticate);

bhavishyaRouter.get('/agenda', bhavishyaController.getAgenda);
