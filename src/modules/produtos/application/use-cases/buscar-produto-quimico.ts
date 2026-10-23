import { ErroNaoEncontrado } from '../../../../shared/domain/errors/erro-dominio';
import type { ProdutoQuimico } from '../../domain/entities/produto-quimico';
import {
  paraProdutoQuimicoSaida,
  type ProdutoQuimicoSaida,
} from '../dto/produto-quimico.dto';
import type { ProdutoQuimicoRepository } from '../ports/produto-quimico-repository';

/** Usado pelos casos de uso que precisam de um produto existente */
export async function obterProdutoExistente(
  repositorio: ProdutoQuimicoRepository,
  id: string,
): Promise<ProdutoQuimico> {
  const produto = await repositorio.buscarPorId(id);
  if (!produto) {
    throw new ErroNaoEncontrado(
      'PRODUTO_QUIMICO_NAO_ENCONTRADO',
      'Produto químico não encontrado',
    );
  }
  return produto;
}

export class BuscarProdutoQuimico {
  constructor(private readonly repositorio: ProdutoQuimicoRepository) {}

  async executar(id: string): Promise<ProdutoQuimicoSaida> {
    const produto = await obterProdutoExistente(this.repositorio, id);
    return paraProdutoQuimicoSaida(produto);
  }
}
