import { Router } from 'express';
import { locationsController } from './locations.controller.js';

export const locationsRouter = Router();

locationsRouter.get('/states', locationsController.getStates);
locationsRouter.get('/districts', locationsController.getDistricts);
locationsRouter.get('/blocks', locationsController.getBlocks);
