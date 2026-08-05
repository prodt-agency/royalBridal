import crypto from 'node:crypto';
export const requestId = (req, res, next) => { req.requestId = req.get('x-request-id')?.slice(0, 128) || crypto.randomUUID(); res.setHeader('x-request-id', req.requestId); next(); };
