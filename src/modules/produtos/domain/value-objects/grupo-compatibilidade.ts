import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const GRUPOS_COMPATIBILIDADE = [
  'EXPLOSIVOS',
  'GASES',
  'LIQUIDOS_INFLAMAVEIS',
  'SOLIDOS_INFLAMAVEIS',
  'OXIDANTES_PEROXIDOS_ORGANICOS',
  'TOXICOS_INFECTANTES',
  'RADIOATIVOS',
  'CORROSIVOS',
  'SUBSTANCIAS_PERIGOSAS_DIVERSAS',
] as const;

export type GrupoCompatibilidade = (typeof GRUPOS_COMPATIBILIDADE)[number];

export function criarGrupoCompatibilidade(
  valor: string | undefined,
): GrupoCompatibilidade {
  return criarValorEnumerado(GRUPOS_COMPATIBILIDADE, valor, {
    codigoErro: 'GRUPO_COMPATIBILIDADE_INVALIDO',
    mensagemObrigatorio: 'Grupo de compatibilidade é obrigatório',
    mensagemInvalido: 'Grupo de compatibilidade inválido',
  });
}
