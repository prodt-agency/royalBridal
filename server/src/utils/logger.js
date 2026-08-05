import { AsyncLocalStorage } from 'node:async_hooks';
import { env } from '../config/env.js';
const context = new AsyncLocalStorage();
const safe = (value) => value instanceof Error ? { name: value.name, message: value.message, stack: env.nodeEnv === 'production' ? undefined : value.stack } : value;
const write = (level, event, metadata = {}) => process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...context.getStore(), ...Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, safe(value)])) })}\n`);
export const requestContext = { run: (data, callback) => context.run(data, callback), get: () => context.getStore() };
export const logger = Object.freeze({ info: (event, metadata) => write('info', event, metadata), warn: (event, metadata) => write('warn', event, metadata), error: (event, metadata) => write('error', event, metadata), payment: (event, metadata) => write('payment', event, metadata), audit: (event, metadata) => write('audit', event, metadata) });
