import { app } from './app.js';
import { env, validateEnv } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { logger } from './utils/logger.js';

validateEnv();

const server = app.listen(env.port, () => logger.info('server_started', { port: env.port }));

async function shutdown(signal) {
  logger.info('server_shutdown', { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => { logger.error('unhandled_rejection', { error }); shutdown('unhandledRejection'); });
process.on('uncaughtException', (error) => { logger.error('uncaught_exception', { error }); process.exit(1); });
