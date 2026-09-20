import { z } from 'zod';
import dotenv from 'dotenv';

// Load local environment variables from .env file if present
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test', 'demo']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGIN: z.string().default('*'),

  // Supabase Configuration (Phase 4)
  // Supports current model (SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY)
  // as well as legacy naming (SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type ServerConfig = z.infer<typeof envSchema> & {
  publishableKey: string;
  secretKey: string;
  hasSupabaseConfig: boolean;
};

export const loadConfig = (): ServerConfig => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid server environment configuration:', parsed.error.format());
    throw new Error('Invalid server environment configuration');
  }

  const raw = parsed.data;
  const publishableKey = raw.SUPABASE_PUBLISHABLE_KEY || raw.SUPABASE_ANON_KEY || '';
  const secretKey = raw.SUPABASE_SECRET_KEY || raw.SUPABASE_SERVICE_ROLE_KEY || '';
  const hasSupabaseConfig = Boolean(raw.SUPABASE_URL && (publishableKey || secretKey));

  return {
    ...raw,
    publishableKey,
    secretKey,
    hasSupabaseConfig,
  };
};

export const config = loadConfig();
