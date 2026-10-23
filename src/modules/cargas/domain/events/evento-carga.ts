import type { StatusCarga } from '../value-objects/status-carga';

export type TipoEventoCarga =
  'REGISTRO' | 'MUDANCA_STATUS' | 'BLOQUEIO' | 'LIBERACAO' | 'CANCELAMENTO';

/** Evento imutável do histórico da carga (RN011, RNF005) */
export interface EventoCarga {
  readonly tipo: TipoEventoCarga;
  readonly statusAnterior: StatusCarga | null;
  readonly statusNovo: StatusCarga;
  readonly motivo: string | null;
  readonly autorId: string;
  readonly ocorridoEm: Date;
}
