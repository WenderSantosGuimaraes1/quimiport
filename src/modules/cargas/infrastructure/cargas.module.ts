import type { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { AtualizarStatusCarga } from '../application/use-cases/atualizar-status-carga';
import { BloquearCarga } from '../application/use-cases/bloquear-carga';
import { BuscarCargaQuimica } from '../application/use-cases/buscar-carga-quimica';
import { CancelarCarga } from '../application/use-cases/cancelar-carga';
import { LiberarCarga } from '../application/use-cases/liberar-carga';
import { ListarCargasQuimicas } from '../application/use-cases/listar-cargas-quimicas';
import { RegistrarCargaQuimica } from '../application/use-cases/registrar-carga-quimica';
import { CargaQuimicaController } from './adapters/inbound/http/carga-quimica.controller';
import { PrismaProdutoQuimicoGateway } from './adapters/outbound/prisma-produto-quimico.gateway';
import { PrismaUsuarioGateway } from './adapters/outbound/prisma-usuario.gateway';
import { PrismaCargaQuimicaRepository } from './persistence/prisma-carga-quimica.repository';

/** Composição do módulo: liga Ports aos Adapters concretos */
export function criarCargasQuimicasRouter(prisma: PrismaClient): Router {
  const repositorio = new PrismaCargaQuimicaRepository(prisma);
  const produtos = new PrismaProdutoQuimicoGateway(prisma);
  const usuarios = new PrismaUsuarioGateway(prisma);

  const controller = new CargaQuimicaController({
    registrar: new RegistrarCargaQuimica(repositorio, produtos, usuarios),
    listar: new ListarCargasQuimicas(repositorio),
    buscar: new BuscarCargaQuimica(repositorio),
    atualizarStatus: new AtualizarStatusCarga(repositorio, usuarios),
    bloquear: new BloquearCarga(repositorio, usuarios),
    liberar: new LiberarCarga(repositorio, usuarios),
    cancelar: new CancelarCarga(repositorio, usuarios),
  });

  const router = Router();
  router.post('/', controller.registrar);
  router.get('/', controller.listar);
  router.get('/:id', controller.buscar);
  router.patch('/:id/status', controller.atualizarStatus);
  router.patch('/:id/bloquear', controller.bloquear);
  router.patch('/:id/liberar', controller.liberar);
  router.patch('/:id/cancelar', controller.cancelar);
  return router;
}
