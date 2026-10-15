import { Router } from 'express';
import { tradeController } from './trade.controller.js';

export const tradeRouter = Router();

tradeRouter.get('/', tradeController.listTrades);
tradeRouter.get('/:code', tradeController.getTradeByCode);
tradeRouter.get('/:code/outcomes', tradeController.getTradeOutcomes);
