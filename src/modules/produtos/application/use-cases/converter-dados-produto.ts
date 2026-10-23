import type { DadosCadastraisProdutoQuimico } from '../../domain/entities/produto-quimico';
import { criarClasseRisco } from '../../domain/value-objects/classe-risco';
import { criarEstadoFisico } from '../../domain/value-objects/estado-fisico';
import { criarGrupoCompatibilidade } from '../../domain/value-objects/grupo-compatibilidade';
import type { DadosProdutoQuimicoEntrada } from '../dto/produto-quimico.dto';

/** Converte a entrada primitiva nos Value Objects do produto */
export function converterDadosProduto(
  entrada: DadosProdutoQuimicoEntrada,
): DadosCadastraisProdutoQuimico {
  return {
    nome: entrada.nome,
    descricao: entrada.descricao,
    numeroOnu: entrada.numeroOnu,
    classeRisco: criarClasseRisco(entrada.classeRisco),
    grupoCompatibilidade: criarGrupoCompatibilidade(
      entrada.grupoCompatibilidade,
    ),
    estadoFisico:
      entrada.estadoFisico === undefined || entrada.estadoFisico === null
        ? null
        : criarEstadoFisico(entrada.estadoFisico),
  };
}
