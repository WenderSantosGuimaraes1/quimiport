import { env } from './shared/config/env';
import { criarApp } from './app';

function bootstrap(): void {
  const app = criarApp();

  const servidor = app.listen(env.porta, () => {
    console.log(`Servidor rodando na porta ${env.porta}`);
  });

  const encerrar = (sinal: NodeJS.Signals): void => {
    console.log(`${sinal} recebido, encerrando servidor...`);
    servidor.close(() => process.exit(0));
  };

  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

bootstrap();
