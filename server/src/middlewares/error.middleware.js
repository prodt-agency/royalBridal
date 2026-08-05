import { Prisma } from '@prisma/client';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGES } from '../constants/messages.js';
import { failure } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function notFound(req, res) {
  return failure(res, { statusCode: HTTP_STATUS.NOT_FOUND, message: `Route ${req.method} ${req.originalUrl} not found.` });
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = error.message ?? MESSAGES.INTERNAL_ERROR;
  let errors = error.errors ?? [];

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = HTTP_STATUS.CONFLICT;
      message = 'A record with this value already exists.';
    } else if (error.code === 'P2025') {
      statusCode = HTTP_STATUS.NOT_FOUND;
      message = MESSAGES.NOT_FOUND;
    }
  }

  if (env.nodeEnv === 'production' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    message = MESSAGES.INTERNAL_ERROR;
    errors = [];
  }

  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) logger.error('unhandled_error', { error, requestId: req.requestId, method: req.method, route: req.originalUrl });
  return failure(res, { statusCode, message, errors });
}
