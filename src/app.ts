import express, { type Express } from 'express';
import {
  rotaNaoEncontrada,
  tratarErros,
} from './shared/infrastructure/http/middlewares/tratar-erros';

export function criarApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Registrar aqui os routers dos módulos (ex.: app.use('/cargas', cargasRouter))

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
