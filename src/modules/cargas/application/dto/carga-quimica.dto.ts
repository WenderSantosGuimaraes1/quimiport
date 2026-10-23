import type { ListaPaginada } from '../../../../shared/application/paginacao';
import type { ClasseRisco } from '../../../produtos/domain/value-objects/classe-risco';
import type { CargaQuimica } from '../../domain/aggregates/carga-quimica';
import type { StatusCarga } from '../../domain/value-objects/status-carga';
import type { UnidadeMedida } from '../../domain/value-objects/unidade-medida';

// ----- Entrada -------------------------------------------------------
// Tipos primitivos: a conversão para Value Objects acontece nos casos de uso.

export interface RegistrarCargaQuimicaEntrada {
  codigo: string;
  produtoId: string;
  quantidade: number;
  unidadeMedida: string;
  origem: string;
  destino: string;
  responsavelTecnicoId: string;
  /** Documentação obrigatória apresentada no registro (padrão: false) */
  documentacaoValida?: boolean;
  /** Padrão: momento do registro */
  dataEntrada?: Date;
}

export interface AtualizarStatusCargaEntrada {
  status: string;
  motivo?: string;
}

export interface MotivoEntrada {
  motivo: string;
}

export interface ListarCargasQuimicasEntrada {
  status?: string;
  produtoId?: string;
  responsavelTecnicoId?: string;
  pagina?: number;
  porPagina?: number;
}

// ----- Saída ---------------------------------------------------------

export interface CargaQuimicaSaida {
  id: string;
  codigo: string;
  /** Snapshot do produto no momento do registro (RN012) */
  produto: {
    id: string;
    nome: string;
    numeroOnu: string;
    classeRisco: ClasseRisco;
  };
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  origem: string;
  destino: string;
  responsavelTecnicoId: string;
  status: StatusCarga;
  documentacaoValida: boolean;
  dataEntrada: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type ListaCargasQuimicasSaida = ListaPaginada<CargaQuimicaSaida>;

export function paraCargaQuimicaSaida(carga: CargaQuimica): CargaQuimicaSaida {
  return {
    id: carga.id,
    codigo: carga.codigo,
    produto: { ...carga.produto },
    quantidade: carga.quantidade.valor,
    unidadeMedida: carga.quantidade.unidade,
    origem: carga.origem,
    destino: carga.destino,
    responsavelTecnicoId: carga.responsavelTecnicoId,
    status: carga.status,
    documentacaoValida: carga.documentacaoValida,
    dataEntrada: carga.dataEntrada.toISOString(),
    criadoEm: carga.criadoEm.toISOString(),
    atualizadoEm: carga.atualizadoEm.toISOString(),
  };
}
