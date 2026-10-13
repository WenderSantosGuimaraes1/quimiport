import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  porta: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
} as const;
