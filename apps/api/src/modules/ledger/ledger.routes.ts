import { Router } from 'express';
import { ledgerController } from './ledger.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { recordLedgerSchema } from '@saathi/shared';

export const ledgerRouter = Router();

ledgerRouter.use(authenticate);

ledgerRouter.post('/record', validateBody(recordLedgerSchema), ledgerController.recordEvent);
ledgerRouter.get('/:householdId', ledgerController.getHouseholdLedger);
ledgerRouter.get('/:householdId/verify', ledgerController.verifyChain);
