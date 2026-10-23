import type { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { AtualizarProdutoQuimico } from '../application/use-cases/atualizar-produto-quimico';
import { BuscarProdutoQuimico } from '../application/use-cases/buscar-produto-quimico';
import { CriarProdutoQuimico } from '../application/use-cases/criar-produto-quimico';
import { InativarProdutoQuimico } from '../application/use-cases/inativar-produto-quimico';
import { ListarProdutosQuimicos } from '../application/use-cases/listar-produtos-quimicos';
import { ProdutoQuimicoController } from './adapters/inbound/http/produto-quimico.controller';
import { PrismaProdutoQuimicoRepository } from './persistence/prisma-produto-quimico.repository';

/** Composição do módulo: liga Ports aos Adapters concretos */
export function criarProdutosQuimicosRouter(prisma: PrismaClient): Router {
  const repositorio = new PrismaProdutoQuimicoRepository(prisma);
  const controller = new ProdutoQuimicoController({
    criar: new CriarProdutoQuimico(repositorio),
    listar: new ListarProdutosQuimicos(repositorio),
    buscar: new BuscarProdutoQuimico(repositorio),
    atualizar: new AtualizarProdutoQuimico(repositorio),
    inativar: new InativarProdutoQuimico(repositorio),
  });

  const router = Router();
  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id', controller.buscar);
  router.put('/:id', controller.atualizar);
  router.patch('/:id/inativar', controller.inativar);
  return router;
}
