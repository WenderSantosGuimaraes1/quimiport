import type { CargaQuimica } from '../../domain/aggregates/carga-quimica';
import type { StatusCarga } from '../../domain/value-objects/status-carga';

export interface FiltroListagemCargasQuimicas {
  status?: StatusCarga;
  produtoId?: string;
  responsavelTecnicoId?: string;
  pagina: number;
  porPagina: number;
}

export interface PaginaCargasQuimicas {
  itens: CargaQuimica[];
  total: number;
}

/** Outbound Port: persistência do agregado CargaQuimica */
export interface CargaQuimicaRepository {
  /**
   * Insere a carga e seus eventos de histórico na mesma transação.
   * Código duplicado deve virar ErroConflito (RN026).
   */
  registrar(carga: CargaQuimica): Promise<void>;
  /**
   * Grava a mudança de status e os eventos na mesma transação (RN011),
   * condicionando ao status lido. Se outra requisição alterou a carga
   * no intervalo, lança ErroConflito.
   */
  salvarMudancaStatus(carga: CargaQuimica): Promise<void>;
  buscarPorId(id: string): Promise<CargaQuimica | null>;
  buscarPorCodigo(codigo: string): Promise<CargaQuimica | null>;
  listar(filtro: FiltroListagemCargasQuimicas): Promise<PaginaCargasQuimicas>;
}
