import { rateLimit } from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGES } from '../constants/messages.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: MESSAGES.RATE_LIMITED, errors: [] },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});
