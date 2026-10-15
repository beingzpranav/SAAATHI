import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export const usersRouter = Router();

// Only administrator role can browse user directory
usersRouter.use(authenticate);
usersRouter.get('/', authorize(['ADMINISTRATOR']), usersController.list);
usersRouter.get('/:id', authorize(['ADMINISTRATOR']), usersController.getById);
