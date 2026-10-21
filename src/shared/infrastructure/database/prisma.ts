import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';

/**
 * Instância única do Prisma, compartilhada por todos os módulos.
 * Cada PrismaClient abre seu próprio pool de conexões, então criar
 * um por repositório esgotaria as conexões do Postgres.
 */
export const prisma = new PrismaClient({
  datasourceUrl: env.databaseUrl,
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});
