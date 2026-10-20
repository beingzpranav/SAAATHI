import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@saathi/shared';
import { HTTP_STATUS } from '../../config/constants.js';
import { TranslateService } from './translate.service.js';
import type { TranslateRequest } from './translate.schema.js';

class TranslateController {
  private service = TranslateService.getInstance();

  translate = async (
    req: Request<unknown, unknown, TranslateRequest>,
    res: Response<ApiResponse<{
      translations: string[];
      sourceLanguage: string;
      targetLanguage: string;
    }>>,
    next: NextFunction
  ) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || '';
      const { texts, sourceLanguage, targetLanguage, context = 'app_ui' } = req.body;

      const translations = await this.service.translateBatch(
        texts,
        sourceLanguage,
        targetLanguage,
        context
      );

      res.status(HTTP_STATUS.OK).json({
        data: {
          translations,
          sourceLanguage,
          targetLanguage,
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getLanguages = async (
    req: Request,
    res: Response<ApiResponse<{ languages: ReturnType<TranslateService['getSupportedLanguages']> }>>,
    next: NextFunction
  ) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || '';
      const languages = this.service.getSupportedLanguages();

      res.status(HTTP_STATUS.OK).json({
        data: { languages },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getHealth = async (
    req: Request,
    res: Response<ApiResponse<{ status: string; cache: ReturnType<TranslateService['getCacheStats']> }>>,
    next: NextFunction
  ) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || '';
      res.status(HTTP_STATUS.OK).json({
        data: {
          status: 'healthy',
          cache: this.service.getCacheStats(),
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

export const translateController = new TranslateController();
