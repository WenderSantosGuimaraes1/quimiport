import type { ListaPaginada } from '../../../../shared/application/paginacao';
import type { ProdutoQuimico } from '../../domain/entities/produto-quimico';
import type { ClasseRisco } from '../../domain/value-objects/classe-risco';
import type { EstadoFisico } from '../../domain/value-objects/estado-fisico';
import type { GrupoCompatibilidade } from '../../domain/value-objects/grupo-compatibilidade';
import type { StatusProduto } from '../../domain/value-objects/status-produto';

// ----- Entrada -------------------------------------------------------
// Tipos primitivos: a conversão para Value Objects acontece nos casos de uso.

export interface DadosProdutoQuimicoEntrada {
  nome: string;
  descricao?: string | null;
  numeroOnu: string;
  classeRisco?: string;
  grupoCompatibilidade?: string;
  estadoFisico?: string | null;
}

export interface CriarProdutoQuimicoEntrada extends DadosProdutoQuimicoEntrada {
  status?: string;
}

/** PUT: substitui todos os dados cadastrais */
export type AtualizarProdutoQuimicoEntrada = DadosProdutoQuimicoEntrada;

export interface ListarProdutosQuimicosEntrada {
  status?: string;
  classeRisco?: string;
  pagina?: number;
  porPagina?: number;
}

// ----- Saída ---------------------------------------------------------

export interface ProdutoQuimicoSaida {
  id: string;
  nome: string;
  descricao: string | null;
  numeroOnu: string;
  classeRisco: ClasseRisco;
  grupoCompatibilidade: GrupoCompatibilidade;
  estadoFisico: EstadoFisico | null;
  status: StatusProduto;
  criadoEm: string;
  atualizadoEm: string;
}

export type ListaProdutosQuimicosSaida = ListaPaginada<ProdutoQuimicoSaida>;

export function paraProdutoQuimicoSaida(
  produto: ProdutoQuimico,
): ProdutoQuimicoSaida {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    numeroOnu: produto.numeroOnu,
    classeRisco: produto.classeRisco,
    grupoCompatibilidade: produto.grupoCompatibilidade,
    estadoFisico: produto.estadoFisico,
    status: produto.status,
    criadoEm: produto.criadoEm.toISOString(),
    atualizadoEm: produto.atualizadoEm.toISOString(),
  };
}
