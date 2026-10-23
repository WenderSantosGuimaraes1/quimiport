import type { Request, Response } from 'express';
import {
  paramsComId,
  validar,
} from '../../../../../../shared/infrastructure/http/validacao';
import type { AtualizarStatusCarga } from '../../../../application/use-cases/atualizar-status-carga';
import type { BloquearCarga } from '../../../../application/use-cases/bloquear-carga';
import type { BuscarCargaQuimica } from '../../../../application/use-cases/buscar-carga-quimica';
import type { CancelarCarga } from '../../../../application/use-cases/cancelar-carga';
import type { LiberarCarga } from '../../../../application/use-cases/liberar-carga';
import type { ListarCargasQuimicas } from '../../../../application/use-cases/listar-cargas-quimicas';
import type { RegistrarCargaQuimica } from '../../../../application/use-cases/registrar-carga-quimica';
import {
  atualizarStatusCargaSchema,
  liberarCargaSchema,
  listarCargasQuimicasSchema,
  motivoSchema,
  registrarCargaQuimicaSchema,
} from './carga-quimica.schemas';

export interface CasosDeUsoCargaQuimica {
  registrar: RegistrarCargaQuimica;
  listar: ListarCargasQuimicas;
  buscar: BuscarCargaQuimica;
  atualizarStatus: AtualizarStatusCarga;
  bloquear: BloquearCarga;
  liberar: LiberarCarga;
  cancelar: CancelarCarga;
}

const bloqueioSchema = motivoSchema('bloquear');
const cancelamentoSchema = motivoSchema('cancelar');

/**
 * Adapter de entrada: traduz HTTP <-> casos de uso de cargas químicas.
 * O autorId vem no corpo; quando houver autenticação, passará a vir do
 * usuário autenticado sem mudança nos casos de uso.
 */
export class CargaQuimicaController {
  constructor(private readonly casosDeUso: CasosDeUsoCargaQuimica) {}

  registrar = async (req: Request, res: Response): Promise<void> => {
    const { autorId, ...entrada } = validar(
      registrarCargaQuimicaSchema,
      req.body,
    );
    res
      .status(201)
      .json(await this.casosDeUso.registrar.executar(entrada, autorId));
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    const entrada = validar(listarCargasQuimicasSchema, req.query);
    res.json(await this.casosDeUso.listar.executar(entrada));
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    res.json(await this.casosDeUso.buscar.executar(id));
  };

  atualizarStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    const { autorId, ...entrada } = validar(
      atualizarStatusCargaSchema,
      req.body,
    );
    res.json(
      await this.casosDeUso.atualizarStatus.executar(id, entrada, autorId),
    );
  };

  bloquear = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    const { autorId, ...entrada } = validar(bloqueioSchema, req.body);
    res.json(await this.casosDeUso.bloquear.executar(id, entrada, autorId));
  };

  liberar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    const { autorId } = validar(liberarCargaSchema, req.body);
    res.json(await this.casosDeUso.liberar.executar(id, autorId));
  };

  cancelar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    const { autorId, ...entrada } = validar(cancelamentoSchema, req.body);
    res.json(await this.casosDeUso.cancelar.executar(id, entrada, autorId));
  };
}
