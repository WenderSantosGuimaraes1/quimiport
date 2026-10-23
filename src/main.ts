import { env } from './shared/config/env';
import { prisma } from './shared/infrastructure/database/prisma';
import { criarApp } from './app';

function bootstrap(): void {
  const app = criarApp(prisma);

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

bootstrap();
