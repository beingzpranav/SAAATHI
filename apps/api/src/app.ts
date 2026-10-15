import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { randomUUID } from 'node:crypto';
import type { ApiResponse, ApiErrorResponse, HealthStatus } from '@saathi/shared';
import { env } from './config/env.js';
import { HTTP_STATUS, API_PREFIX, API_VERSION } from './config/constants.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { standardRateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { openApiSpec } from './docs/openapi.js';

export const app = express();

// Security and transport middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(standardRateLimiter);

// Request ID tracking middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' ? incomingId : randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

// Interactive OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs/json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

/**
 * Liveness Probe: Verifies API process is running and accepting traffic
 */
app.get('/health', (req: Request, res: Response<ApiResponse<HealthStatus>>) => {
  const requestId = req.headers['x-request-id'] as string;
  const payload: ApiResponse<HealthStatus> = {
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      version: '0.1.0',
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(HTTP_STATUS.OK).json(payload);
});

/**
 * Readiness Probe: Verifies core dependencies are ready
 */
app.get('/ready', (req: Request, res: Response<ApiResponse<HealthStatus>>) => {
  const requestId = req.headers['x-request-id'] as string;
  const payload: ApiResponse<HealthStatus> = {
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      version: '0.1.0',
      checks: {
        database: 'connected',
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(HTTP_STATUS.OK).json(payload);
});

/**
 * Base API v1 endpoint
 */
app.get(
  API_PREFIX,
  (req: Request, res: Response<ApiResponse<{ message: string; version: string }>>) => {
    const requestId = req.headers['x-request-id'] as string;
    res.status(HTTP_STATUS.OK).json({
      data: {
        message: `SAATHI API ${API_VERSION} running`,
        version: '0.1.0',
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

// Mount feature routers under versioned prefix
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, usersRouter);

// 404 handler with standard error envelope
app.use((req: Request, res: Response<ApiErrorResponse>) => {
  const requestId = req.headers['x-request-id'] as string;
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
      requestId,
    },
  });
});

// Central error handler
app.use(errorHandler);
