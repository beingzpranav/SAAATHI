import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { initSocketServer } from './lib/socket.js';

const httpServer = http.createServer(app);
initSocketServer(httpServer);

const server = httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'SAATHI API & Socket.IO server started successfully');
});


// Graceful shutdown handling
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Received termination signal, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds if hanging
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
