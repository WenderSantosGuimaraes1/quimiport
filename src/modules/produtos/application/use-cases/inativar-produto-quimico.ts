import {
  paraProdutoQuimicoSaida,
  type ProdutoQuimicoSaida,
} from '../dto/produto-quimico.dto';
import type { ProdutoQuimicoRepository } from '../ports/produto-quimico-repository';
import { obterProdutoExistente } from './buscar-produto-quimico';

/** Exclusão lógica (RN015): o produto continua no banco com status INATIVO */
export class InativarProdutoQuimico {
  constructor(private readonly repositorio: ProdutoQuimicoRepository) {}

  async executar(id: string): Promise<ProdutoQuimicoSaida> {
    const produto = await obterProdutoExistente(this.repositorio, id);
    produto.inativar();
    await this.repositorio.atualizar(produto);
    return paraProdutoQuimicoSaida(produto);
  }
}
