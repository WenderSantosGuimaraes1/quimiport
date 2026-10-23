import { ErroConflito } from '../../../../shared/domain/errors/erro-dominio';
import { ProdutoQuimico } from '../../domain/entities/produto-quimico';
import { criarStatusProduto } from '../../domain/value-objects/status-produto';
import {
  paraProdutoQuimicoSaida,
  type CriarProdutoQuimicoEntrada,
  type ProdutoQuimicoSaida,
} from '../dto/produto-quimico.dto';
import type { ProdutoQuimicoRepository } from '../ports/produto-quimico-repository';
import { converterDadosProduto } from './converter-dados-produto';

export class CriarProdutoQuimico {
  constructor(private readonly repositorio: ProdutoQuimicoRepository) {}

  async executar(
    entrada: CriarProdutoQuimicoEntrada,
  ): Promise<ProdutoQuimicoSaida> {
    const produto = ProdutoQuimico.criar({
      ...converterDadosProduto(entrada),
      status:
        entrada.status === undefined
          ? undefined
          : criarStatusProduto(entrada.status),
    });

    // Checagem antecipada para uma mensagem clara. O índice único parcial do
    // banco barra cadastros simultâneos, e o repositório converte em ErroConflito.
    if (produto.estaAtivo()) {
      await garantirNomeDisponivel(this.repositorio, produto);
    }

    await this.repositorio.salvar(produto);
    return paraProdutoQuimicoSaida(produto);
  }
}

/** US001, cenário 04: nome único entre produtos ativos */
export async function garantirNomeDisponivel(
  repositorio: ProdutoQuimicoRepository,
  produto: ProdutoQuimico,
): Promise<void> {
  const existente = await repositorio.buscarAtivoPorNome(produto.nome);
  if (existente && existente.id !== produto.id) {
    throw new ErroConflito(
      'NOME_PRODUTO_DUPLICADO',
      'Já existe produto químico ativo com este nome',
    );
  }
}
