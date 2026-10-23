import type { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { AtivarUsuario } from '../application/use-cases/ativar-usuario';
import { AtualizarUsuario } from '../application/use-cases/atualizar-usuario';
import { BuscarUsuario } from '../application/use-cases/buscar-usuario';
import { CriarUsuario } from '../application/use-cases/criar-usuario';
import { InativarUsuario } from '../application/use-cases/inativar-usuario';
import { ListarUsuarios } from '../application/use-cases/listar-usuarios';
import { UsuarioController } from './adapters/inbound/http/usuario.controller';
import { ScryptHashSenha } from './adapters/outbound/scrypt-hash-senha';
import { PrismaUsuarioRepository } from './persistence/prisma-usuario.repository';

/** Composição do módulo: liga Ports aos Adapters concretos */
export function criarUsuariosRouter(prisma: PrismaClient): Router {
  const repositorio = new PrismaUsuarioRepository(prisma);
  const controller = new UsuarioController({
    criar: new CriarUsuario(repositorio, new ScryptHashSenha()),
    listar: new ListarUsuarios(repositorio),
    buscar: new BuscarUsuario(repositorio),
    atualizar: new AtualizarUsuario(repositorio),
    inativar: new InativarUsuario(repositorio),
    ativar: new AtivarUsuario(repositorio),
  });

  const router = Router();
  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id', controller.buscar);
  router.patch('/:id', controller.atualizar);
  router.patch('/:id/inativar', controller.inativar);
  router.patch('/:id/ativar', controller.ativar);
  return router;
}
