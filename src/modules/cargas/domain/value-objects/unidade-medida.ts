import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const UNIDADES_MEDIDA = ['KG', 'T', 'L', 'M3'] as const;

export type UnidadeMedida = (typeof UNIDADES_MEDIDA)[number];

export function criarUnidadeMedida(valor: string | undefined): UnidadeMedida {
  return criarValorEnumerado(UNIDADES_MEDIDA, valor, {
    codigoErro: 'UNIDADE_MEDIDA_INVALIDA',
    mensagemObrigatorio: 'Unidade de medida é obrigatória',
    mensagemInvalido: 'Unidade de medida inválida',
  });
}
