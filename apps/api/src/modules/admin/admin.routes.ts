import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export const adminRouter = Router();

// All admin routes require authentication and ADMINISTRATOR role
adminRouter.use(authenticate);
adminRouter.use(authorize(['ADMINISTRATOR']));

// Dashboard overview — headline metrics
adminRouter.get('/dashboard/overview', adminController.getOverview);

// Concern breakdown with sentiment shifts (pre/post score analysis)
adminRouter.get('/dashboard/concerns', adminController.getConcernBreakdown);

// Geographic heatmap with k-anonymity suppression
adminRouter.get('/dashboard/heatmap', adminController.getHeatmap);

// Decision funnel — household intake → joint session → counsellor → decision card
adminRouter.get('/dashboard/funnel', adminController.getDecisionFunnel);

// Escalation tracker — all counsellor bookings by status
adminRouter.get('/dashboard/escalations', adminController.getEscalationTracker);

// CSV export with k-anonymity suppression markers
// Query: ?type=concerns|households|decisions|escalations
adminRouter.get('/dashboard/export', adminController.exportCsv);
