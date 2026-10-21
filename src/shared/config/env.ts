import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

/** Falha na inicialização em vez de quebrar na primeira consulta ao banco */
function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida`);
  }
  return valor;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  porta: Number(process.env.PORT ?? 3000),
  databaseUrl: obrigatoria('DATABASE_URL'),
} as const;
