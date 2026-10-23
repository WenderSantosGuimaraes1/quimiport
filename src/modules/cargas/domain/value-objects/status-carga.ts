import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const STATUS_CARGA = [
  'REGISTRADA',
  'EM_ANALISE',
  'EM_INSPECAO',
  'LIBERADA',
  'BLOQUEADA',
  'EM_MOVIMENTACAO',
  'FINALIZADA',
  'CANCELADA',
] as const;

export type StatusCarga = (typeof STATUS_CARGA)[number];

/**
 * Máquina de estados da carga (RN010). Fonte única das transições, usada
 * pelo agregado e pelos testes. Qualquer par fora deste mapa é proibido.
 */
export const TRANSICOES_PERMITIDAS: Readonly<
  Record<StatusCarga, readonly StatusCarga[]>
> = {
  REGISTRADA: ['EM_ANALISE', 'CANCELADA'],
  EM_ANALISE: ['EM_INSPECAO', 'CANCELADA'],
  EM_INSPECAO: ['LIBERADA', 'BLOQUEADA', 'CANCELADA'],
  LIBERADA: ['EM_MOVIMENTACAO', 'CANCELADA'],
  BLOQUEADA: ['CANCELADA'],
  EM_MOVIMENTACAO: ['FINALIZADA'],
  FINALIZADA: [],
  CANCELADA: [],
};

export function ehEstadoTerminal(status: StatusCarga): boolean {
  return TRANSICOES_PERMITIDAS[status].length === 0;
}

export function transicaoPermitida(
  de: StatusCarga,
  para: StatusCarga,
): boolean {
  return TRANSICOES_PERMITIDAS[de].includes(para);
}

export function criarStatusCarga(valor: string | undefined): StatusCarga {
  return criarValorEnumerado(STATUS_CARGA, valor, {
    codigoErro: 'STATUS_CARGA_INVALIDO',
    mensagemObrigatorio: 'Status da carga é obrigatório',
    mensagemInvalido: 'Status da carga inválido',
    regra: 'RN022',
  });
}
