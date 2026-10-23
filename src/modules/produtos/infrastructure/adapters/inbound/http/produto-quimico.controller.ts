import type { Request, Response } from 'express';
import {
  paramsComId,
  validar,
} from '../../../../../../shared/infrastructure/http/validacao';
import type { AtualizarProdutoQuimico } from '../../../../application/use-cases/atualizar-produto-quimico';
import type { BuscarProdutoQuimico } from '../../../../application/use-cases/buscar-produto-quimico';
import type { CriarProdutoQuimico } from '../../../../application/use-cases/criar-produto-quimico';
import type { InativarProdutoQuimico } from '../../../../application/use-cases/inativar-produto-quimico';
import type { ListarProdutosQuimicos } from '../../../../application/use-cases/listar-produtos-quimicos';
import {
  atualizarProdutoQuimicoSchema,
  criarProdutoQuimicoSchema,
  listarProdutosQuimicosSchema,
} from './produto-quimico.schemas';

export interface CasosDeUsoProdutoQuimico {
  criar: CriarProdutoQuimico;
  listar: ListarProdutosQuimicos;
  buscar: BuscarProdutoQuimico;
  atualizar: AtualizarProdutoQuimico;
  inativar: InativarProdutoQuimico;
}

/** Adapter de entrada: traduz HTTP <-> casos de uso de produtos químicos */
export class ProdutoQuimicoController {
  constructor(private readonly casosDeUso: CasosDeUsoProdutoQuimico) {}

  criar = async (req: Request, res: Response): Promise<void> => {
    const entrada = validar(criarProdutoQuimicoSchema, req.body);
    res.status(201).json(await this.casosDeUso.criar.executar(entrada));
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    const entrada = validar(listarProdutosQuimicosSchema, req.query);
    res.json(await this.casosDeUso.listar.executar(entrada));
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    res.json(await this.casosDeUso.buscar.executar(id));
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    const entrada = validar(atualizarProdutoQuimicoSchema, req.body);
    res.json(await this.casosDeUso.atualizar.executar(id, entrada));
  };

  inativar = async (req: Request, res: Response): Promise<void> => {
    const { id } = validar(paramsComId, req.params);
    res.json(await this.casosDeUso.inativar.executar(id));
  };
}
