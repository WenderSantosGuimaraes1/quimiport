import type { ClasseRisco } from '../../../produtos/domain/value-objects/classe-risco';

/** Dados do produto de que o registro de carga precisa */
export interface ProdutoQuimicoResumo {
  id: string;
  nome: string;
  numeroOnu: string;
  classeRisco: ClasseRisco;
  ativo: boolean;
}

/**
 * Outbound Port: consulta ao contexto de produtos. A carga referencia o
 * produto apenas por id e guarda um snapshot (RN012).
 */
export interface ProdutoQuimicoGateway {
  buscarPorId(id: string): Promise<ProdutoQuimicoResumo | null>;
}
