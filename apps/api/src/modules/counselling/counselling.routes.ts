import { Router } from 'express';
import { counsellingController } from './counselling.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from '@saathi/shared';

export const counsellingRouter = Router();

counsellingRouter.use(authenticate);

// Public/Learner routes
counsellingRouter.get('/slots', counsellingController.getAvailableSlots);
counsellingRouter.post('/book', validateBody(createBookingSchema), counsellingController.createBooking);
counsellingRouter.get('/my-bookings', counsellingController.getMyBookings);

// Counsellor / Admin Console routes (role-protected)
counsellingRouter.get(
  '/counsellor/bookings',
  authorize(['COUNSELLOR', 'ADMINISTRATOR']),
  counsellingController.getCounsellorBookings,
);

counsellingRouter.get(
  '/counsellor/household/:householdId',
  authorize(['COUNSELLOR', 'ADMINISTRATOR']),
  counsellingController.getCounsellorHouseholdSummary,
);

counsellingRouter.patch(
  '/bookings/:id/status',
  authorize(['COUNSELLOR', 'ADMINISTRATOR']),
  validateBody(updateBookingStatusSchema),
  counsellingController.updateStatus,
);
