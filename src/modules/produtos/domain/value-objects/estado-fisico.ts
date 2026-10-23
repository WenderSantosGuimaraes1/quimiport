import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const ESTADOS_FISICOS = ['SOLIDO', 'LIQUIDO', 'GASOSO'] as const;

export type EstadoFisico = (typeof ESTADOS_FISICOS)[number];

export function criarEstadoFisico(valor: string): EstadoFisico {
  return criarValorEnumerado(ESTADOS_FISICOS, valor, {
    codigoErro: 'ESTADO_FISICO_INVALIDO',
    mensagemObrigatorio: 'Estado físico é obrigatório',
    mensagemInvalido: 'Estado físico inválido',
  });
}
