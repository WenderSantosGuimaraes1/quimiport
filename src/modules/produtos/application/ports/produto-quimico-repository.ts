import type { ProdutoQuimico } from '../../domain/entities/produto-quimico';
import type { ClasseRisco } from '../../domain/value-objects/classe-risco';
import type { StatusProduto } from '../../domain/value-objects/status-produto';

export interface FiltroListagemProdutosQuimicos {
  status?: StatusProduto;
  classeRisco?: ClasseRisco;
  pagina: number;
  porPagina: number;
}

export interface PaginaProdutosQuimicos {
  itens: ProdutoQuimico[];
  total: number;
}

/** Outbound Port: persistência de produtos químicos */
export interface ProdutoQuimicoRepository {
  /** Insere um produto novo. Nome duplicado entre ativos deve virar ErroConflito */
  salvar(produto: ProdutoQuimico): Promise<void>;
  /** Grava as alterações de um produto existente */
  atualizar(produto: ProdutoQuimico): Promise<void>;
  buscarPorId(id: string): Promise<ProdutoQuimico | null>;
  /** Comparação case-insensitive e sem espaços nas pontas (US001) */
  buscarAtivoPorNome(nome: string): Promise<ProdutoQuimico | null>;
  listar(
    filtro: FiltroListagemProdutosQuimicos,
  ): Promise<PaginaProdutosQuimicos>;
}
