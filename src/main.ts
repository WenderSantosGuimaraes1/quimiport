import { env } from './shared/config/env';
import { prisma } from './shared/infrastructure/database/prisma';
import { criarApp } from './app';

async function bootstrap(): Promise<void> {
  // Conecta antes de abrir a porta: se o banco estiver fora, a API nem sobe
  await prisma.$connect();

  const app = criarApp();

  const servidor = app.listen(env.porta, () => {
    console.log(`Servidor rodando na porta ${env.porta}`);
  });

  const encerrar = (sinal: NodeJS.Signals): void => {
    console.log(`${sinal} recebido, encerrando servidor...`);
    servidor.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

bootstrap().catch((erro: unknown) => {
  console.error('Falha ao iniciar a aplicação:', erro);
  process.exit(1);
});
