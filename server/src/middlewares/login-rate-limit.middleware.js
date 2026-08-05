import { rateLimit } from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGES } from '../constants/messages.js';
export const loginRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, skipSuccessfulRequests: true, statusCode: HTTP_STATUS.TOO_MANY_REQUESTS, message: { success: false, message: MESSAGES.RATE_LIMITED, errors: [] } });
