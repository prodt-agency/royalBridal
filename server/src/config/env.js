import "dotenv/config";
import path from "node:path";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().url().startsWith("mysql"),
  CLIENT_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  UPLOAD_DIRECTORY: z.string().default("./public/uploads"),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
});
const result = schema.safeParse(process.env);
if (!result.success)
  throw new Error(
    `Invalid environment configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
  );
const value = result.data;
export const env = Object.freeze({
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  databaseUrl: value.DATABASE_URL,
  clientUrl: value.CLIENT_URL,
  jwtAccessSecret: value.JWT_ACCESS_SECRET,
  jwtRefreshSecret: value.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: value.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: value.JWT_REFRESH_EXPIRES_IN,
  refreshTokenDays: value.REFRESH_TOKEN_DAYS,
  uploadDirectory: path.resolve(value.UPLOAD_DIRECTORY),
  razorpayKeyId: value.RAZORPAY_KEY_ID,
  razorpayKeySecret: value.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: value.RAZORPAY_WEBHOOK_SECRET,
});
export const validateEnv = () => env;
