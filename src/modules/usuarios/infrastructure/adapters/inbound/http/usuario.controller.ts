import type { Request, Response } from 'express';
import {
  paramsComId,
  validar,
} from '../../../../../../shared/infrastructure/http/validacao';
import type { AtivarUsuario } from '../../../../application/use-cases/ativar-usuario';
import type { AtualizarUsuario } from '../../../../application/use-cases/atualizar-usuario';
import type { BuscarUsuario } from '../../../../application/use-cases/buscar-usuario';
import type { CriarUsuario } from '../../../../application/use-cases/criar-usuario';
import type { InativarUsuario } from '../../../../application/use-cases/inativar-usuario';
import type { ListarUsuarios } from '../../../../application/use-cases/listar-usuarios';
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  listarUsuariosSchema,
} from './usuario.schemas';

export interface CasosDeUsoUsuario {
  criar: CriarUsuario;
  listar: ListarUsuarios;
  buscar: BuscarUsuario;
  atualizar: AtualizarUsuario;
  inativar: InativarUsuario;
  ativar: AtivarUsuario;
}

/** Adapter de entrada: traduz HTTP <-> casos de uso de usuários */
export class UsuarioController {
  constructor(private readonly casosDeUso: CasosDeUsoUsuario) {}

  criar = async (req: Request, res: Response): Promise<void> => {
    const entrada = validar(criarUsuarioSchema, req.body);
    res.status(201).json(await this.casosDeUso.criar.executar(entrada));
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    const entrada = validar(listarUsuariosSchema, req.query);
    res.json(await this.casosDeUso.listar.executar(entrada));
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    res.json(await this.casosDeUso.buscar.executar(id));
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    const entrada = validar(atualizarUsuarioSchema, req.body);
    res.json(await this.casosDeUso.atualizar.executar(id, entrada));
  };

  inativar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    res.json(await this.casosDeUso.inativar.executar(id));
  };

  ativar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    res.json(await this.casosDeUso.ativar.executar(id));
  };
}
