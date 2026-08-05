import { z } from 'zod'; export const uploadKeySchema = z.object({ body: z.object({}), params: z.object({ key: z.string().min(1).max(300) }), query: z.object({}) });
