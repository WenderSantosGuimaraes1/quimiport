import {
  paraProdutoQuimicoSaida,
  type AtualizarProdutoQuimicoEntrada,
  type ProdutoQuimicoSaida,
} from '../dto/produto-quimico.dto';
import type { ProdutoQuimicoRepository } from '../ports/produto-quimico-repository';
import { obterProdutoExistente } from './buscar-produto-quimico';
import { converterDadosProduto } from './converter-dados-produto';
import { garantirNomeDisponivel } from './criar-produto-quimico';

/**
 * Atualiza os dados cadastrais. Cargas já registradas não são afetadas,
 * pois guardam um snapshot do produto (RN012).
 */
export class AtualizarProdutoQuimico {
  constructor(private readonly repositorio: ProdutoQuimicoRepository) {}

  async executar(
    id: string,
    entrada: AtualizarProdutoQuimicoEntrada,
  ): Promise<ProdutoQuimicoSaida> {
    const dados = converterDadosProduto(entrada);
    const produto = await obterProdutoExistente(this.repositorio, id);

    produto.atualizar(dados);
    if (produto.estaAtivo()) {
      await garantirNomeDisponivel(this.repositorio, produto);
    }

    await this.repositorio.atualizar(produto);
    return paraProdutoQuimicoSaida(produto);
  }
}
