import { Router } from 'express'; import { prisma } from '../lib/prisma.js';
import { success } from '../utils/api-response.js';

const router = Router();

router.get('/', (req, res) => success(res, { message: 'Service is healthy.', data: { uptime: process.uptime() } }));
router.get('/live', (req, res) => success(res, { data: { status: 'live', uptime: process.uptime() } }));
router.get('/ready', async (req, res, next) => { try { await prisma.$queryRaw`SELECT 1`; return success(res, { data: { status: 'ready' } }); } catch (error) { return next(error); } });

export default router;
