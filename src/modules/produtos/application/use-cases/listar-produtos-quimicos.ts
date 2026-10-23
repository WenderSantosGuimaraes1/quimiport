import {
  montarListaPaginada,
  validarPaginacao,
} from '../../../../shared/application/paginacao';
import { criarClasseRisco } from '../../domain/value-objects/classe-risco';
import { criarStatusProduto } from '../../domain/value-objects/status-produto';
import {
  paraProdutoQuimicoSaida,
  type ListaProdutosQuimicosSaida,
  type ListarProdutosQuimicosEntrada,
} from '../dto/produto-quimico.dto';
import type { ProdutoQuimicoRepository } from '../ports/produto-quimico-repository';

export class ListarProdutosQuimicos {
  constructor(private readonly repositorio: ProdutoQuimicoRepository) {}

  async executar(
    entrada: ListarProdutosQuimicosEntrada = {},
  ): Promise<ListaProdutosQuimicosSaida> {
    const paginacao = validarPaginacao(entrada);

    const { itens, total } = await this.repositorio.listar({
      status:
        entrada.status === undefined
          ? undefined
          : criarStatusProduto(entrada.status),
      classeRisco:
        entrada.classeRisco === undefined
          ? undefined
          : criarClasseRisco(entrada.classeRisco),
      ...paginacao,
    });

    return montarListaPaginada(
      itens.map(paraProdutoQuimicoSaida),
      total,
      paginacao,
    );
  }
}
